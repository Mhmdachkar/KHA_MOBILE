import { Router } from 'express';
import { pool, requirePool } from '../lib/db.js';
import { findActiveCoupon, evaluateCoupon } from '../lib/coupons.js';

export const publicCouponsRouter = Router();

// Validate a coupon code at checkout (does not mutate DB).
publicCouponsRouter.post('/validate-coupon', requirePool, async (req, res) => {
  try {
    const code = (req.body?.code || '').trim().toUpperCase();
    const orderTotal = Number(req.body?.orderTotal || 0);

    if (!code) {
      return res.status(400).json({ valid: false, error: 'Coupon code is required' });
    }

    const coupon = await findActiveCoupon(pool, code);
    const result = evaluateCoupon(coupon, orderTotal);

    if (!result.valid) {
      return res.json({ valid: false, error: result.error });
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        description: coupon.description,
      },
      discount: result.discount,
    });
  } catch (e) {
    console.error('[publicCoupons] validate-coupon error:', e);
    res.status(500).json({ valid: false, error: 'Failed to validate coupon' });
  }
});
