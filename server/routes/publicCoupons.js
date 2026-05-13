import { Router } from 'express';
import { pool, requirePool } from '../lib/db.js';

export const publicCouponsRouter = Router();

// Validate a coupon code at checkout
publicCouponsRouter.post('/validate-coupon', requirePool, async (req, res) => {
  try {
    const code = (req.body?.code || '').trim().toUpperCase();
    const orderTotal = Number(req.body?.orderTotal || 0);

    if (!code) return res.status(400).json({ valid: false, error: 'Coupon code is required' });

    const { rows } = await pool.query(
      'SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true',
      [code]
    );
    const coupon = rows[0];

    if (!coupon) {
      return res.json({ valid: false, error: 'Invalid coupon code' });
    }

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return res.json({ valid: false, error: 'This coupon is not yet active' });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return res.json({ valid: false, error: 'This coupon has expired' });
    }
    if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
      return res.json({ valid: false, error: 'This coupon has reached its usage limit' });
    }
    if (coupon.min_order_amount != null && orderTotal < Number(coupon.min_order_amount)) {
      return res.json({
        valid: false,
        error: `Minimum order amount is $${Number(coupon.min_order_amount).toFixed(2)}`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = orderTotal * (Number(coupon.discount_value) / 100);
      if (coupon.max_discount_amount != null) {
        discount = Math.min(discount, Number(coupon.max_discount_amount));
      }
    } else {
      discount = Number(coupon.discount_value);
    }
    discount = Math.min(discount, orderTotal);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        description: coupon.description,
      },
      discount: Math.round(discount * 100) / 100,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ valid: false, error: 'Failed to validate coupon' });
  }
});
