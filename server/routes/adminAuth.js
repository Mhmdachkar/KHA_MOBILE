import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool, requirePool } from '../lib/db.js';
import { signAdminToken, requireAdmin } from '../middleware/auth.js';
import { logAudit } from '../lib/audit.js';
import { checkLoginRateLimit, clientIp } from '../lib/loginRateLimit.js';

export const adminAuthRouter = Router();

adminAuthRouter.get('/me', requirePool, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, is_active FROM admin_users WHERE id = $1`,
      [req.admin.sub]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Account deactivated or not found' });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

adminAuthRouter.post('/login', requirePool, async (req, res) => {
  const ip = clientIp(req);
  const rate = checkLoginRateLimit(ip);
  if (!rate.allowed) {
    return res.status(429).json({
      error: `Too many login attempts. Try again in ${rate.retryAfterSec} seconds.`,
      code: 'RATE_LIMITED',
    });
  }

  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query(
      `SELECT id, email, password_hash, full_name, role, is_active
       FROM admin_users WHERE LOWER(email) = $1`,
      [email]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      await logAudit(null, 'login_failed', 'admin_user', null, {
        email,
        ip,
        reason: user ? 'inactive' : 'unknown_email',
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
      await logAudit(null, 'login_failed', 'admin_user', null, { email, ip, reason: 'bad_password' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signAdminToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});
