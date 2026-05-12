import express from 'express';
import { requirePool } from '../lib/db.js';

const router = express.Router();

// GET /api/public/settings?keys=hero,announcements
// returns { hero: {...}, announcements: {...} }
router.get('/', requirePool, async (req, res) => {
  try {
    const { pool } = req;
    const keys = req.query.keys
      ? req.query.keys.split(',').map((k) => k.trim()).filter(Boolean)
      : null;

    let result;
    if (keys && keys.length > 0) {
      result = await pool.query(
        'SELECT key, value FROM site_settings WHERE key = ANY($1)',
        [keys]
      );
    } else {
      result = await pool.query('SELECT key, value FROM site_settings');
    }

    const map = {};
    for (const row of result.rows) {
      map[row.key] = row.value;
    }
    res.json(map);
  } catch (err) {
    console.error('[publicSettings] GET /', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export { router as publicSettingsRouter };
