import express from 'express';
import { requirePool } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAdmin, requirePool, async (req, res) => {
  try {
    const { pool } = req;
    const result = await pool.query(
      'SELECT key, value, updated_at FROM site_settings ORDER BY key'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[adminSettings] GET /', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.get('/:key', requireAdmin, requirePool, async (req, res) => {
  try {
    const { pool } = req;
    const { key } = req.params;
    const result = await pool.query(
      'SELECT key, value, updated_at FROM site_settings WHERE key = $1',
      [key]
    );
    if (result.rows.length === 0) return res.json({ key, value: null });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[adminSettings] GET /:key', err);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

router.put('/:key', requireAdmin, requirePool, async (req, res) => {
  try {
    const { pool } = req;
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'value is required' });
    }
    const result = await pool.query(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING key, value, updated_at`,
      [key, JSON.stringify(value)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[adminSettings] PUT /:key', err);
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

export { router as adminSettingsRouter };
