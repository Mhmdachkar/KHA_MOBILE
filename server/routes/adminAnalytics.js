import { Router } from 'express';
import { pool, requirePool } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

export const adminAnalyticsRouter = Router();

function resolveRange(range) {
  const now = new Date();
  const end = now;
  let start = null;

  switch (range) {
    case 'today': {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case '7days': {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    }
    case '30days': {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      break;
    }
    case 'all':
    default:
      start = null;
      break;
  }

  return { start, end };
}

function previousWindow(start, end) {
  if (!start) return { start: null, end: null };
  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime());
  const prevStart = new Date(start.getTime() - durationMs);
  return { start: prevStart, end: prevEnd };
}

function dateConditions(windowStart, windowEnd) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (windowStart) {
    conditions.push(`created_at >= $${idx++}`);
    params.push(windowStart.toISOString());
  }
  if (windowEnd) {
    conditions.push(`created_at < $${idx++}`);
    params.push(windowEnd.toISOString());
  }

  return { conditions, params, where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '' };
}

async function aggregateOrders(windowStart, windowEnd) {
  const { params, where } = dateConditions(windowStart, windowEnd);
  const revenueWhere = where
    ? `${where} AND status != 'cancelled'`
    : `WHERE status != 'cancelled'`;

  const summaryQ = await pool.query(
    `SELECT COUNT(*)::int AS order_count,
            COALESCE(SUM(total), 0)::float AS revenue
     FROM orders ${revenueWhere}`,
    params
  );

  const statusQ = await pool.query(
    `SELECT status, COUNT(*)::int AS count FROM orders ${where} GROUP BY status`,
    params
  );

  const byStatus = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  for (const row of statusQ.rows) {
    if (row.status in byStatus) byStatus[row.status] = row.count;
  }

  const orderCount = summaryQ.rows[0]?.order_count ?? 0;
  const revenue = summaryQ.rows[0]?.revenue ?? 0;
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  return { orderCount, revenue, averageOrderValue, ordersByStatus: byStatus };
}

async function revenueByDay(windowStart, windowEnd) {
  const { params, where } = dateConditions(windowStart, windowEnd);
  const revenueWhere = where
    ? `${where} AND status != 'cancelled'`
    : `WHERE status != 'cancelled'`;

  const { rows } = await pool.query(
    `SELECT DATE(created_at) AS date,
            COUNT(*)::int AS order_count,
            COALESCE(SUM(total), 0)::float AS revenue
     FROM orders ${revenueWhere}
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at) ASC`,
    params
  );

  return rows.map((r) => ({
    date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date),
    orderCount: r.order_count,
    revenue: r.revenue,
  }));
}

function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

adminAnalyticsRouter.get('/analytics/summary', requirePool, requireAdmin, async (req, res) => {
  try {
    const range = (req.query.range || '7days').trim();
    const { start, end } = resolveRange(range);
    const prev = previousWindow(start, end);

    const [current, previous, series] = await Promise.all([
      aggregateOrders(start, end),
      prev.start ? aggregateOrders(prev.start, prev.end) : Promise.resolve({
        orderCount: 0,
        revenue: 0,
        averageOrderValue: 0,
        ordersByStatus: { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 },
      }),
      revenueByDay(start, end),
    ]);

    res.json({
      range,
      period: {
        start: start ? start.toISOString() : null,
        end: end.toISOString(),
      },
      orderCount: current.orderCount,
      revenue: current.revenue,
      averageOrderValue: current.averageOrderValue,
      ordersByStatus: current.ordersByStatus,
      revenueByDay: series,
      trends: {
        orderCount: percentChange(current.orderCount, previous.orderCount),
        revenue: percentChange(current.revenue, previous.revenue),
        averageOrderValue: percentChange(current.averageOrderValue, previous.averageOrderValue),
      },
      previousPeriod: {
        orderCount: previous.orderCount,
        revenue: previous.revenue,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load analytics summary' });
  }
});
