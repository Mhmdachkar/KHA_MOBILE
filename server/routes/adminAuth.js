import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool, requirePool } from '../lib/db.js';
import { signAdminToken } from '../middleware/auth.js';

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', requirePool, async (req, res) => {
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
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
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
