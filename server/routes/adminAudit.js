import { Router } from 'express';
import { pool, requirePool } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

export const adminAuditRouter = Router();

adminAuditRouter.get('/audit-log', requirePool, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const entityType = (req.query.entity_type || '').trim();
    const action = (req.query.action || '').trim();

    const conditions = [];
    const params = [];
    let idx = 1;

    if (entityType) {
      conditions.push(`entity_type = $${idx++}`);
      params.push(entityType);
    }
    if (action) {
      conditions.push(`action = $${idx++}`);
      params.push(action);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQ = await pool.query(`SELECT COUNT(*) FROM audit_log ${where}`, params);
    const total = parseInt(countQ.rows[0].count, 10);

    const dataQ = await pool.query(
      `SELECT * FROM audit_log ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      entries: dataQ.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});
