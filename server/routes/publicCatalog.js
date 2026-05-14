import { Router } from 'express';
import { pool, requirePool } from '../lib/db.js';
import { rowToPublicProduct } from '../lib/productMapper.js';

export const publicCatalogRouter = Router();

publicCatalogRouter.get('/products', requirePool, async (req, res) => {
  try {
    console.log('[Public Catalog] Fetching active products');
    const { rows } = await pool.query(
      `SELECT * FROM products WHERE is_active = true ORDER BY id ASC`
    );
    console.log('[Public Catalog] Found', rows.length, 'active products');
    res.set('Cache-Control', 'no-store, must-revalidate');
    res.json({ products: rows.map(row => rowToPublicProduct(row, req)) });
  } catch (e) {
    console.error('[Public Catalog] Error:', e);
    res.status(500).json({ error: 'Failed to load products' });
  }
});
