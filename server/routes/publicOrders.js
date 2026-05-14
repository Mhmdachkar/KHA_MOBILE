/**
 * Public order-creation endpoint (P0-01).
 *
 * POST /api/public/orders  → creates an orders+order_items row in a single
 * transaction, decrements stock, increments coupon usage, sends an admin
 * email, and returns the new order_number plus a pre-built WhatsApp URL.
 *
 * GET  /api/public/orders/:orderNumber → public read-back so the storefront
 * can show a "thank you" page; only returns non-sensitive fields.
 */

import { Router } from 'express';
import { pool, requirePool } from '../lib/db.js';
import { createOrder, OrderError } from '../lib/orders.js';
import { sendOrderEmail } from '../lib/orderEmail.js';

export const publicOrdersRouter = Router();

const round2 = (n) => Math.round(Number(n) * 100) / 100;

/** Read a JSON site_settings value, falling back to default. */
async function readSetting(key, fallback) {
  try {
    const { rows } = await pool.query(
      'SELECT value FROM site_settings WHERE key = $1',
      [key]
    );
    if (!rows[0]) return fallback;
    const v = rows[0].value;
    // Settings are stored as JSONB. Strings come back as plain strings.
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

/** Build a WhatsApp deep-link from a freshly-created order. */
function buildWhatsAppMessage(order, items, whatsappNumber) {
  const lines = ['*New Order Request*', ''];
  lines.push(`• *Order #:* ${order.order_number}`);
  if (order.customer_name) lines.push(`• *Customer:* ${order.customer_name}`);
  lines.push(`• *Phone:* ${order.customer_phone}`);
  if (order.shipping_address) {
    lines.push(`• *Delivery:* ${order.shipping_address}`);
  }
  lines.push('');
  lines.push('• *Items:*');
  for (const it of items) {
    let label = it.product_name;
    if (it.variant_label) label += ` - ${it.variant_label}`;
    lines.push(
      `  - ${label} (Qty: ${it.quantity}) - $${Number(it.line_total).toFixed(2)}`
    );
  }
  lines.push('');
  lines.push(`• *Subtotal:* $${Number(order.subtotal).toFixed(2)}`);
  if (Number(order.coupon_discount) > 0) {
    lines.push(
      `• *Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}:* -$${Number(
        order.coupon_discount
      ).toFixed(2)}`
    );
  }
  if (Number(order.shipping_cost) > 0) {
    lines.push(`• *Delivery:* $${Number(order.shipping_cost).toFixed(2)}`);
  }
  lines.push(`*Total:* $${Number(order.total).toFixed(2)}`);
  lines.push('');
  lines.push('Please confirm this order. Thank you!');

  const text = encodeURIComponent(lines.join('\n'));
  const num = String(whatsappNumber || '').replace(/\D/g, '');
  return num ? `https://wa.me/${num}?text=${text}` : null;
}

publicOrdersRouter.post('/orders', requirePool, async (req, res) => {
  try {
    const ip =
      (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
      req.ip ||
      null;
    const userAgent = String(req.headers['user-agent'] || '').slice(0, 500);

    // Pull admin-editable defaults.
    const deliveryFeeRaw = await readSetting('delivery_fee', 4);
    const deliveryFee = Number(deliveryFeeRaw) || 0;

    const { order, items, idempotent } = await createOrder(pool, req.body, {
      ip,
      userAgent,
      deliveryFee,
    });

    // Post-commit, fire-and-forget admin email. Failures must not break the order.
    if (!idempotent) {
      sendOrderEmail({ order, items }).catch((err) => {
        console.error('[publicOrders] admin email failed:', err.message);
      });
    }

    const whatsappNumber = await readSetting('whatsapp_number', '');
    const whatsappUrl = buildWhatsAppMessage(order, items, whatsappNumber);

    res.status(idempotent ? 200 : 201).json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        subtotal: round2(order.subtotal),
        discount: round2(order.discount),
        shippingCost: round2(order.shipping_cost),
        total: round2(order.total),
        couponCode: order.coupon_code,
        createdAt: order.created_at,
      },
      whatsappUrl,
      idempotent,
    });
  } catch (e) {
    if (e instanceof OrderError) {
      return res.status(e.statusCode).json({ error: e.message, code: e.code });
    }
    console.error('[publicOrders] create error:', e);
    res.status(500).json({ error: 'Failed to place order', code: 'INTERNAL' });
  }
});

publicOrdersRouter.get('/orders/:orderNumber', requirePool, async (req, res) => {
  try {
    const orderNumber = String(req.params.orderNumber || '').trim();
    if (!/^KHA-\d+$/i.test(orderNumber)) {
      return res.status(400).json({ error: 'Invalid order number' });
    }
    const { rows } = await pool.query(
      `SELECT order_number, status, payment_status, payment_method,
              subtotal, discount, shipping_cost, total, coupon_code,
              customer_name, created_at
         FROM orders
        WHERE UPPER(order_number) = UPPER($1)`,
      [orderNumber]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: rows[0] });
  } catch (e) {
    console.error('[publicOrders] read error:', e);
    res.status(500).json({ error: 'Failed to load order' });
  }
});
