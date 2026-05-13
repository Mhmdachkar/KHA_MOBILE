import { pool } from './db.js';

/**
 * Write an entry to the audit_log table.
 * @param {{ sub: number, email: string }} admin — decoded JWT payload from req.admin
 * @param {string} action — e.g. 'create', 'update', 'delete'
 * @param {string} entityType — e.g. 'product', 'coupon', 'setting', 'media'
 * @param {string|number|null} entityId
 * @param {object} details — arbitrary JSON context
 */
export async function logAudit(admin, action, entityType, entityId, details = {}) {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO audit_log (admin_id, admin_email, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [
        admin?.sub ?? null,
        admin?.email ?? 'unknown',
        action,
        entityType,
        entityId != null ? String(entityId) : null,
        JSON.stringify(details),
      ]
    );
  } catch (e) {
    console.error('[audit] Failed to log:', e.message);
  }
}
