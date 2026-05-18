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
    const { rows: suppressedRows } = await pool.query(
      `SELECT legacy_override_id FROM products
       WHERE is_active = false AND legacy_override_id IS NOT NULL`
    );
    const suppressedStorefrontIds = suppressedRows
      .map((r) => Number(r.legacy_override_id))
      .filter((id) => Number.isFinite(id));
    console.log('[Public Catalog] Found', rows.length, 'active products,', suppressedStorefrontIds.length, 'suppressed overrides');
    res.set('Cache-Control', 'no-store, must-revalidate');
    res.json({
      products: rows.map((row) => rowToPublicProduct(row, req)),
      suppressedStorefrontIds,
    });
  } catch (e) {
    console.error('[Public Catalog] Error:', e);
    res.status(500).json({ error: 'Failed to load products' });
  }
});
