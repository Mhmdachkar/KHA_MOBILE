import pg from 'pg';

const { Pool } = pg;

console.log('[db.js] DATABASE_URL exists:', Boolean(process.env.DATABASE_URL));
console.log('[db.js] DATABASE_URL (masked):', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));

/** @type {pg.Pool | null} */
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
    })
  : null;

console.log('[db.js] pool created:', pool !== null);

export function requirePool(_req, res, next) {
  console.log('[requirePool] pool is null:', pool === null);
  if (!pool) {
    return res.status(503).json({
      error: 'Database not configured',
      hint: 'Set DATABASE_URL and run sql/001_schema.sql',
    });
  }
  next();
}
