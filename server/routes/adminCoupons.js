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

// Update coupon
adminCouponsRouter.put('/coupons/:id', requirePool, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const b = req.body || {};

    const { rows } = await pool.query(
      `UPDATE coupons SET
        code = COALESCE($1, code),
        description = COALESCE($2, description),
        discount_type = COALESCE($3, discount_type),
        discount_value = COALESCE($4, discount_value),
        min_order_amount = $5,
        max_discount_amount = $6,
        max_uses = $7,
        is_active = COALESCE($8, is_active),
        starts_at = $9,
        expires_at = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING *`,
      [
        b.code ? b.code.trim().toUpperCase() : null,
        b.description,
        b.discount_type,
        b.discount_value != null ? Number(b.discount_value) : null,
        b.min_order_amount != null ? Number(b.min_order_amount) : null,
        b.max_discount_amount != null ? Number(b.max_discount_amount) : null,
        b.max_uses != null ? Number(b.max_uses) : null,
        b.is_active,
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
