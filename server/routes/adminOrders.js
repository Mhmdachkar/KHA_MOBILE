import { Router } from 'express';
import { pool, requirePool } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { logAudit } from '../lib/audit.js';

export const adminOrdersRouter = Router();

// ── List orders (paginated, filterable) ────────────────────────────────────
adminOrdersRouter.get('/orders', requirePool, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;

    const status = (req.query.status || '').trim();
    const search = (req.query.search || '').trim();
    const dateFrom = (req.query.date_from || '').trim();
    const dateTo = (req.query.date_to || '').trim();
    const paymentStatus = (req.query.payment_status || '').trim();

    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) {
      conditions.push(`o.status = $${idx++}`);
      params.push(status);
    }
    if (paymentStatus) {
      conditions.push(`o.payment_status = $${idx++}`);
      params.push(paymentStatus);
    }
    if (search) {
      conditions.push(`(o.order_number ILIKE $${idx} OR o.customer_name ILIKE $${idx} OR o.customer_email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (dateFrom) {
      conditions.push(`o.created_at >= $${idx++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`o.created_at <= $${idx++}::date + INTERVAL '1 day'`);
      params.push(dateTo);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQ = await pool.query(`SELECT COUNT(*) FROM orders o ${where}`, params);
    const total = parseInt(countQ.rows[0].count, 10);

    const dataQ = await pool.query(
      `SELECT o.*,
        COALESCE(json_agg(json_build_object(
          'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
          'product_image', oi.product_image, 'variant_label', oi.variant_label,
          'quantity', oi.quantity, 'unit_price', oi.unit_price, 'line_total', oi.line_total
        )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${where}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      orders: dataQ.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list orders' });
  }
});

// ── Get single order ───────────────────────────────────────────────────────
adminOrdersRouter.get('/orders/:id', requirePool, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const { rows } = await pool.query(
      `SELECT o.*,
        COALESCE(json_agg(json_build_object(
          'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
          'product_image', oi.product_image, 'variant_label', oi.variant_label,
          'quantity', oi.quantity, 'unit_price', oi.unit_price, 'line_total', oi.line_total
        )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load order' });
  }
});

// ── Update order status ────────────────────────────────────────────────────
const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const VALID_PAYMENT = ['unpaid', 'paid', 'refunded'];

adminOrdersRouter.put('/orders/:id', requirePool, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const b = req.body || {};
    const sets = [];
    const params = [];
    let idx = 1;

    if (b.status) {
      if (!VALID_STATUSES.includes(b.status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      sets.push(`status = $${idx++}`);
      params.push(b.status);
    }
    if (b.payment_status) {
      if (!VALID_PAYMENT.includes(b.payment_status)) {
        return res.status(400).json({ error: `Invalid payment_status. Must be one of: ${VALID_PAYMENT.join(', ')}` });
      }
      sets.push(`payment_status = $${idx++}`);
      params.push(b.payment_status);
    }
    if (b.notes !== undefined) {
      sets.push(`notes = $${idx++}`);
      params.push(b.notes);
    }

    if (!sets.length) return res.status(400).json({ error: 'No valid fields to update' });

    sets.push('updated_at = NOW()');
    params.push(id);

    const { rows } = await pool.query(
      `UPDATE orders SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });

    await logAudit(req.admin, 'update', 'order', id, {
      status: b.status, payment_status: b.payment_status,
    });
    res.json({ order: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ── Delete order ───────────────────────────────────────────────────────────
adminOrdersRouter.delete('/orders/:id', requirePool, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Order not found' });

    await logAudit(req.admin, 'delete', 'order', id, {});
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// ── Export orders as CSV ───────────────────────────────────────────────────
adminOrdersRouter.get('/orders-export', requirePool, requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status || '').trim();
    const dateFrom = (req.query.date_from || '').trim();
    const dateTo = (req.query.date_to || '').trim();

    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    if (dateFrom) { conditions.push(`created_at >= $${idx++}`); params.push(dateFrom); }
    if (dateTo) { conditions.push(`created_at <= $${idx++}::date + INTERVAL '1 day'`); params.push(dateTo); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT id, order_number, status, payment_status, customer_name, customer_email,
              customer_phone, subtotal, discount, shipping_cost, total, coupon_code,
              payment_method, notes, created_at
       FROM orders ${where} ORDER BY created_at DESC`,
      params
    );

    const header = [
      'Order #', 'Status', 'Payment', 'Customer', 'Email', 'Phone',
      'Subtotal', 'Discount', 'Shipping', 'Total', 'Coupon', 'Payment Method',
      'Notes', 'Date',
    ].join(',');

    const csvRows = rows.map((r) =>
      [
        r.order_number, r.status, r.payment_status,
        `"${(r.customer_name || '').replace(/"/g, '""')}"`,
        r.customer_email, r.customer_phone,
        r.subtotal, r.discount, r.shipping_cost, r.total,
        r.coupon_code || '', r.payment_method,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
        new Date(r.created_at).toISOString(),
      ].join(',')
    );

    const csv = [header, ...csvRows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to export orders' });
  }
});

// ── Order stats (for sidebar) ──────────────────────────────────────────────
adminOrdersRouter.get('/order-stats', requirePool, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`
    );
    const stats = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0, total: 0 };
    for (const r of rows) {
      stats[r.status] = r.count;
      stats.total += r.count;
    }
    res.json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get order stats' });
  }
});
