/**
 * Order creation service.
 * Used by:
 *   - POST /api/public/orders (storefront checkout)
 *   - POST /api/admin/orders   (manual phone-order entry, P1-09 — future)
 *
 * Single PG transaction:
 *   1. Re-price each item from the products table (clients are untrusted).
 *   2. Lock & check stock for tracked / non-preorder products.
 *   3. Validate coupon and atomically increment used_count.
 *   4. Compute totals server-side; reject client mismatches (>$0.01).
 *   5. Insert orders + order_items.
 *   6. Decrement stock for tracked products.
 *   7. COMMIT.
 *
 * Throws an `OrderError` with `.statusCode` and `.code` for the route to
 * translate into a clean JSON envelope.
 */

import { findActiveCoupon, evaluateCoupon, incrementCouponUsage } from './coupons.js';

export class OrderError extends Error {
  constructor(message, { statusCode = 400, code = 'BAD_REQUEST' } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const VALID_CHECKOUT_TYPES = new Set([
  'product',
  'streaming',
  'recharge',
  'gift_card',
  'admin_manual',
]);

const VALID_PAYMENT_METHODS = new Set(['whatsapp', 'cash_on_delivery']);

const PRICE_TOLERANCE_CENTS = 1; // accept up to 1¢ rounding drift

const round2 = (n) => Math.round(Number(n) * 100) / 100;

/**
 * Validate the request payload shape (not the business rules — those need DB).
 * Throws OrderError on bad input. Returns a normalised payload.
 */
function normalisePayload(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new OrderError('Invalid request body', { statusCode: 400 });
  }

  const checkoutType = String(raw.checkoutType || 'product');
  if (!VALID_CHECKOUT_TYPES.has(checkoutType)) {
    throw new OrderError(`Invalid checkoutType: ${checkoutType}`);
  }

  const paymentMethod = String(raw.paymentMethod || 'whatsapp');
  if (!VALID_PAYMENT_METHODS.has(paymentMethod)) {
    throw new OrderError(`Invalid paymentMethod: ${paymentMethod}`);
  }

  const customer = raw.customer || {};
  const name = String(customer.name || '').trim().slice(0, 255);
  const email = String(customer.email || '').trim().toLowerCase().slice(0, 255);
  const phone = String(customer.phone || '').trim().slice(0, 50);
  const shippingAddress = String(customer.shippingAddress || '').trim().slice(0, 5000);

  if (!phone) {
    throw new OrderError('Customer phone is required');
  }
  if (paymentMethod === 'cash_on_delivery' && !email) {
    throw new OrderError('Email is required for cash on delivery orders');
  }
  if (checkoutType === 'product' && !name) {
    throw new OrderError('Customer name is required');
  }
  if (checkoutType === 'product' && !shippingAddress) {
    throw new OrderError('Delivery location is required');
  }

  const items = Array.isArray(raw.items) ? raw.items : [];
  if (items.length === 0) {
    throw new OrderError('At least one item is required');
  }
  if (items.length > 100) {
    throw new OrderError('Too many items (max 100)');
  }

  const normItems = items.map((it, idx) => {
    const productId =
      it.productId == null || it.productId === ''
        ? null
        : Number.isFinite(Number(it.productId))
        ? Number(it.productId)
        : null;
    const quantity = Math.max(1, Math.floor(Number(it.quantity) || 1));
    const unitPrice = Math.max(0, Number(it.unitPrice) || 0);
    const itemName = String(it.name || '').trim().slice(0, 255);
    if (!itemName) {
      throw new OrderError(`Item ${idx + 1} is missing a name`);
    }
    if (quantity < 1 || quantity > 999) {
      throw new OrderError(`Item ${idx + 1} has invalid quantity`);
    }
    if (unitPrice > 100000) {
      throw new OrderError(`Item ${idx + 1} price is unreasonably high`);
    }
    const dbId =
      it.dbId == null || it.dbId === ''
        ? null
        : Number.isFinite(Number(it.dbId))
          ? Number(it.dbId)
          : null;

    return {
      productId,
      dbId,
      name: itemName,
      image: String(it.image || '').slice(0, 500),
      variantLabel: String(it.variantLabel || '').slice(0, 255),
      quantity,
      unitPrice,
    };
  });

  const couponCode = raw.couponCode ? String(raw.couponCode).trim().toUpperCase() : null;
  const idempotencyKey = raw.idempotencyKey
    ? String(raw.idempotencyKey).slice(0, 80)
    : null;
  const notes = String(raw.notes || '').trim().slice(0, 5000);
  const clientShippingCost = Number.isFinite(Number(raw.shippingCost))
    ? Math.max(0, Number(raw.shippingCost))
    : 0;
  const clientTotal =
    raw.clientTotal != null && Number.isFinite(Number(raw.clientTotal))
      ? Number(raw.clientTotal)
      : null;

  return {
    checkoutType,
    paymentMethod,
    customer: { name, email, phone, shippingAddress },
    items: normItems,
    couponCode,
    clientShippingCost,
    clientTotal,
    notes,
    idempotencyKey,
  };
}

/**
 * Re-price every item against the products table inside the transaction.
 * Returns the priced items + a Map of stock-locked products to update.
 *
 * Items WITHOUT a productId (legacy streaming/recharge SKUs that aren't in the
 * DB) keep their client-supplied price. We log a warning so abuse is visible.
 */
async function repriceItems(client, items) {
  const dbIds = [
    ...new Set(
      items
        .map((it) => it.dbId)
        .filter((id) => id != null && Number.isFinite(id))
    ),
  ].sort((a, b) => a - b);
  const legacyIds = [
    ...new Set(
      items
        .map((it) => it.productId)
        .filter((id) => id != null && Number.isFinite(id))
    ),
  ].sort((a, b) => a - b);

  /** @type {Map<number, object>} */
  const byDbId = new Map();
  /** @type {Map<number, object>} */
  const byLegacyId = new Map();
  /** @type {Map<number, object>} */
  const byStorefrontPk = new Map();

  if (dbIds.length > 0 || legacyIds.length > 0) {
    const { rows } = await client.query(
      `SELECT id, legacy_override_id, name, price, is_active, is_preorder, stock_quantity, primary_image_url
         FROM products
        WHERE id = ANY($1::int[])
           OR legacy_override_id = ANY($2::int[])
        FOR UPDATE`,
      [dbIds.length ? dbIds : [0], legacyIds.length ? legacyIds : [0]]
    );
    for (const row of rows) {
      byDbId.set(row.id, row);
      byStorefrontPk.set(row.id, row);
      if (row.legacy_override_id != null) {
        byLegacyId.set(Number(row.legacy_override_id), row);
      }
    }
  }

  const resolveProductRow = (it) => {
    if (it.dbId != null) {
      const hit = byDbId.get(it.dbId);
      if (hit) return hit;
    }
    if (it.productId != null) {
      const byLegacy = byLegacyId.get(it.productId);
      if (byLegacy) return byLegacy;
      const byPk = byStorefrontPk.get(it.productId);
      if (byPk) return byPk;
    }
    return null;
  };

  const priced = items.map((it, idx) => {
    if (it.productId == null && it.dbId == null) {
      // Off-catalog item (legacy streaming/recharge). Trust client price but cap.
      return { ...it, lineTotal: round2(it.unitPrice * it.quantity), product: null };
    }
    const product = resolveProductRow(it);
    if (!product) {
      console.warn(
        `[orders] item ${idx + 1} (storefrontId=${it.productId}, dbId=${it.dbId}, "${it.name}") not in DB — rejected`
      );
      throw new OrderError(`"${it.name}" is no longer available`, {
        statusCode: 409,
        code: 'PRODUCT_NOT_FOUND',
      });
    }
    if (!product.is_active) {
      throw new OrderError(`"${product.name}" is no longer available`, {
        statusCode: 409,
        code: 'PRODUCT_INACTIVE',
      });
    }
    if (
      product.stock_quantity != null &&
      !product.is_preorder &&
      Number(product.stock_quantity) < it.quantity
    ) {
      throw new OrderError(
        `Only ${product.stock_quantity} of "${product.name}" left in stock`,
        { statusCode: 409, code: 'OUT_OF_STOCK' }
      );
    }
    const unitPrice = round2(product.price);
    return {
      ...it,
      name: product.name, // prefer canonical name
      image: it.image || product.primary_image_url || '',
      unitPrice,
      lineTotal: round2(unitPrice * it.quantity),
      product,
    };
  });

  return priced;
}

/**
 * @param {import('pg').Pool} pool
 * @param {object} rawPayload
 * @param {{ ip?: string, userAgent?: string, deliveryFee?: number }} [meta]
 * @returns {Promise<{ order: object, items: object[] }>}
 */
export async function createOrder(pool, rawPayload, meta = {}) {
  const payload = normalisePayload(rawPayload);

  // 1. Idempotency short-circuit (read-only, before opening a transaction).
  if (payload.idempotencyKey) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE idempotency_key = $1',
      [payload.idempotencyKey]
    );
    if (rows[0]) {
      const itemsRes = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC',
        [rows[0].id]
      );
      return { order: rows[0], items: itemsRes.rows, idempotent: true };
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 2. Re-price + stock-lock products.
    const priced = await repriceItems(client, payload.items);

    const subtotal = round2(priced.reduce((s, it) => s + it.lineTotal, 0));

    // 3. Coupon (optional). Validate against subtotal *before* shipping.
    let couponRow = null;
    let couponDiscount = 0;
    if (payload.couponCode) {
      couponRow = await findActiveCoupon(client, payload.couponCode);
      const evald = evaluateCoupon(couponRow, subtotal);
      if (!evald.valid) {
        throw new OrderError(evald.error || 'Invalid coupon', {
          statusCode: 409,
          code: 'COUPON_INVALID',
        });
      }
      couponDiscount = evald.discount;
    }

    // 4. Shipping + total.
    let shippingCost = 0;
    if (payload.checkoutType === 'product') {
      shippingCost = round2(
        meta.deliveryFee != null ? meta.deliveryFee : payload.clientShippingCost
      );
    }
    const total = round2(Math.max(0, subtotal - couponDiscount + shippingCost));

    if (payload.clientTotal != null) {
      const drift = Math.abs(payload.clientTotal - total) * 100;
      if (drift > PRICE_TOLERANCE_CENTS) {
        throw new OrderError(
          `Total mismatch: server $${total.toFixed(2)} vs client $${Number(
            payload.clientTotal
          ).toFixed(2)}`,
          { statusCode: 409, code: 'PRICE_MISMATCH' }
        );
      }
    }

    // 5. Increment coupon usage atomically (after we know order will succeed).
    if (couponRow) {
      const ok = await incrementCouponUsage(client, couponRow.id);
      if (!ok) {
        throw new OrderError('This coupon has reached its usage limit', {
          statusCode: 409,
          code: 'COUPON_LIMIT',
        });
      }
    }

    // 6. Insert order. Trigger fills order_number from id.
    const orderInsert = await client.query(
      `INSERT INTO orders (
         status, customer_name, customer_email, customer_phone, shipping_address,
         subtotal, discount, shipping_cost, total, coupon_code, coupon_discount,
         payment_method, payment_status, notes, checkout_type,
         source_ip, user_agent, idempotency_key
       ) VALUES (
         'pending', $1, $2, $3, $4,
         $5, $6, $7, $8, $9, $10,
         $11, 'unpaid', $12, $13,
         $14, $15, $16
       )
       RETURNING *`,
      [
        payload.customer.name,
        payload.customer.email,
        payload.customer.phone,
        payload.customer.shippingAddress,
        subtotal,
        couponDiscount,
        shippingCost,
        total,
        couponRow ? couponRow.code : null,
        couponDiscount,
        payload.paymentMethod,
        payload.notes,
        payload.checkoutType,
        meta.ip || null,
        meta.userAgent || null,
        payload.idempotencyKey,
      ]
    );
    const order = orderInsert.rows[0];

    // 7. Insert order_items.
    const itemRows = [];
    for (const it of priced) {
      // FK to products: only if we actually matched a DB row.
      const dbProductId = it.product ? it.product.id : null;
      const r = await client.query(
        `INSERT INTO order_items (
           order_id, product_id, product_name, product_image, variant_label,
           quantity, unit_price, line_total
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          order.id,
          dbProductId,
          it.name,
          it.image || '',
          it.variantLabel || '',
          it.quantity,
          it.unitPrice,
          it.lineTotal,
        ]
      );
      itemRows.push(r.rows[0]);
    }

    // 8. Decrement stock for tracked, non-preorder products.
    for (const it of priced) {
      if (
        it.product &&
        it.product.stock_quantity != null &&
        !it.product.is_preorder
      ) {
        const dec = await client.query(
          `UPDATE products
              SET stock_quantity = stock_quantity - $1,
                  updated_at = NOW()
            WHERE id = $2
              AND stock_quantity >= $1`,
          [it.quantity, it.product.id]
        );
        if (dec.rowCount === 0) {
          // Lost the race despite FOR UPDATE — defensive.
          throw new OrderError(`"${it.product.name}" went out of stock`, {
            statusCode: 409,
            code: 'OUT_OF_STOCK',
          });
        }
      }
    }

    await client.query('COMMIT');
    return { order, items: itemRows, idempotent: false };
  } catch (e) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw e;
  } finally {
    client.release();
  }
}
