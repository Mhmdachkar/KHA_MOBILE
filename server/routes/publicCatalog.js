import { Router } from 'express';
import { pool, requirePool } from '../lib/db.js';
import { rowToPublicProduct } from '../lib/productMapper.js';

export const publicCatalogRouter = Router();

publicCatalogRouter.get('/products', requirePool, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM products WHERE is_active = true ORDER BY id ASC`
    );
    res.set('Cache-Control', 'no-store, must-revalidate');
    res.json({ products: rows.map(rowToPublicProduct) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load products' });
  }
});
