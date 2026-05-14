/**
 * Coupon validation + discount computation, shared between the public
 * `/validate-coupon` endpoint and the new `/orders` order-creation flow.
 *
 * All money is computed in JS Number for parity with existing code; we round to
 * cents on output so totals always match the storefront UI.
 */

/**
 * Look up an active coupon by code (case-insensitive).
 * @param {import('pg').PoolClient | import('pg').Pool} db
 * @param {string} code
 * @returns {Promise<object | null>}
 */
export async function findActiveCoupon(db, code) {
  const trimmed = (code || '').trim().toUpperCase();
  if (!trimmed) return null;
  const { rows } = await db.query(
    'SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true',
    [trimmed]
  );
  return rows[0] || null;
}

/**
 * Validate a coupon row against an order subtotal and compute the discount
 * amount (in dollars, rounded to cents). Does NOT mutate the DB.
 *
 * @param {object} coupon - row from coupons table
 * @param {number} orderTotal - subtotal *before* discount, in dollars
 * @returns {{ valid: boolean, error?: string, discount?: number }}
 */
export function evaluateCoupon(coupon, orderTotal) {
  if (!coupon) return { valid: false, error: 'Invalid coupon code' };

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, error: 'This coupon is not yet active' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: 'This coupon has expired' };
  }
  if (coupon.max_uses != null && Number(coupon.used_count) >= Number(coupon.max_uses)) {
    return { valid: false, error: 'This coupon has reached its usage limit' };
  }
  if (
    coupon.min_order_amount != null &&
    Number(orderTotal) < Number(coupon.min_order_amount)
  ) {
    return {
      valid: false,
      error: `Minimum order amount is $${Number(coupon.min_order_amount).toFixed(2)}`,
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = Number(orderTotal) * (Number(coupon.discount_value) / 100);
    if (coupon.max_discount_amount != null) {
      discount = Math.min(discount, Number(coupon.max_discount_amount));
    }
  } else {
    discount = Number(coupon.discount_value);
  }
  discount = Math.min(discount, Number(orderTotal));
  discount = Math.round(discount * 100) / 100;

  return { valid: true, discount };
}

/**
 * Atomically increment a coupon's used_count, enforcing max_uses if set.
 * Must be called inside an open transaction. Returns true on success,
 * false if the coupon already hit its cap (caller should abort the order).
 *
 * @param {import('pg').PoolClient} client - inside BEGIN/COMMIT
 * @param {number} couponId
 * @returns {Promise<boolean>}
 */
export async function incrementCouponUsage(client, couponId) {
  const { rowCount } = await client.query(
    `UPDATE coupons
        SET used_count = used_count + 1,
            updated_at = NOW()
      WHERE id = $1
        AND is_active = true
        AND (max_uses IS NULL OR used_count < max_uses)`,
    [couponId]
  );
  return rowCount > 0;
}
