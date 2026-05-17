import jwt from 'jsonwebtoken';
import { pool } from '../lib/db.js';

function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length <= 20) {
      throw new Error(
        'JWT_SECRET must be set to a strong value (more than 20 characters) in production'
      );
    }
    return secret;
  }
  return secret || 'dev-only-change-me';
}

const JWT_SECRET = resolveJwtSecret();

const ACTIVE_CACHE_MS = 60_000;
/** @type {Map<number, { active: boolean, expiresAt: number }>} */
const activeCache = new Map();

async function isAdminActive(adminId) {
  const now = Date.now();
  const cached = activeCache.get(adminId);
  if (cached && now < cached.expiresAt) {
    return cached.active;
  }
  if (!pool) {
    return false;
  }
  const { rows } = await pool.query(
    'SELECT is_active FROM admin_users WHERE id = $1',
    [adminId]
  );
  const active = Boolean(rows[0]?.is_active);
  activeCache.set(adminId, { active, expiresAt: now + ACTIVE_CACHE_MS });
  return active;
}

export function signAdminToken(adminRow) {
  return jwt.sign(
    {
      sub: adminRow.id,
      email: adminRow.email,
      role: adminRow.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  let token = null;

  if (header?.startsWith('Bearer ')) {
    token = header.slice(7);
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const active = await isAdminActive(payload.sub);
    if (!active) {
      return res.status(401).json({ error: 'Account deactivated or not found' });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
