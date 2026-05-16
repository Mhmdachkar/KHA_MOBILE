import { Router } from 'express';
import { pool, requirePool } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { logAudit } from '../lib/audit.js';

export const adminCouponsRouter = Router();

// List all coupons (with optional search)
adminCouponsRouter.get('/coupons', requirePool, requireAdmin, async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let query = 'SELECT * FROM coupons';
    const params = [];

    if (search) {
      query += ' WHERE code ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json({ coupons: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list coupons' });
  }
});

// Get single coupon
adminCouponsRouter.get('/coupons/:id', requirePool, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const { rows } = await pool.query('SELECT * FROM coupons WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ coupon: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load coupon' });
  }
});

// Create coupon
adminCouponsRouter.post('/coupons', requirePool, requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    const code = (b.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });
    if (!b.discount_value || Number(b.discount_value) <= 0) {
      return res.status(400).json({ error: 'discount_value must be > 0' });
    }

    const { rows } = await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, max_uses, is_active, starts_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        code,
        b.description || '',
        b.discount_type || 'percentage',
        Number(b.discount_value),
        b.min_order_amount != null ? Number(b.min_order_amount) : null,
        b.max_discount_amount != null ? Number(b.max_discount_amount) : null,
        b.max_uses != null ? Number(b.max_uses) : null,
        b.is_active !== false,
        b.starts_at || null,
        b.expires_at || null,
      ]
    );

    await logAudit(req.admin, 'create', 'coupon', rows[0].id, { code });
    res.status(201).json({ coupon: rows[0] });
  } catch (e) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(409).json({ error: 'A coupon with this code already exists' });
    }
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Update coupon (full replacement — no COALESCE, fields are set directly)
adminCouponsRouter.put('/coupons/:id', requirePool, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const b = req.body || {};

    // Require code and discount_value on full update
    const code = (b.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });
    if (b.discount_value == null || Number(b.discount_value) <= 0) {
      return res.status(400).json({ error: 'discount_value must be > 0' });
    }

    const { rows } = await pool.query(
      `UPDATE coupons SET
        code = $1,
        description = $2,
        discount_type = $3,
        discount_value = $4,
        min_order_amount = $5,
        max_discount_amount = $6,
        max_uses = $7,
        is_active = $8,
        starts_at = $9,
        expires_at = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING *`,
      [
        code,
        b.description ?? '',
        b.discount_type || 'percentage',
        Number(b.discount_value),
        b.min_order_amount != null && b.min_order_amount !== '' ? Number(b.min_order_amount) : null,
        b.max_discount_amount != null && b.max_discount_amount !== '' ? Number(b.max_discount_amount) : null,
        b.max_uses != null && b.max_uses !== '' ? Number(b.max_uses) : null,
        b.is_active !== false,
        b.starts_at || null,
        b.expires_at || null,
        id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });

    await logAudit(req.admin, 'update', 'coupon', id, { code: rows[0].code });
    res.json({ coupon: rows[0] });
  } catch (e) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(409).json({ error: 'A coupon with this code already exists' });
    }
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// Toggle coupon active status (dedicated endpoint — no full body required)
adminCouponsRouter.patch('/coupons/:id/toggle', requirePool, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const { rows } = await pool.query(
      `UPDATE coupons SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });

    await logAudit(req.admin, 'toggle', 'coupon', id, { is_active: rows[0].is_active });
    res.json({ coupon: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to toggle coupon' });
  }
});

// Delete coupon
adminCouponsRouter.delete('/coupons/:id', requirePool, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const { rows } = await pool.query('DELETE FROM coupons WHERE id = $1 RETURNING code', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });

    await logAudit(req.admin, 'delete', 'coupon', id, { code: rows[0].code });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});
