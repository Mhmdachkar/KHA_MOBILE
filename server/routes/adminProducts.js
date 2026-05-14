import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { pool, requirePool } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { bodyToRowColumns, rowToPublicProduct } from '../lib/productMapper.js';
import { logAudit } from '../lib/audit.js';
import { buildPublicUploadUrl } from '../lib/uploadUrl.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(file.originalname) || '.bin'}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\//.test(file.mimetype) || file.mimetype === 'video/mp4';
    if (!ok) return cb(new Error('Only image or mp4 uploads are allowed'));
    cb(null, true);
  },
});

export const adminProductsRouter = Router();

adminProductsRouter.post('/upload', requirePool, requireAdmin, upload.single('file'), (req, res) => {
  try {
    console.log('[Upload] Request from:', req.admin?.email);
    if (!req.file) {
      console.error('[Upload] No file in request');
      return res.status(400).json({ error: 'No file uploaded (field name: file)' });
    }
    console.log('[Upload] File uploaded:', req.file.filename, 'size:', req.file.size, 'type:', req.file.mimetype);
    const url = buildPublicUploadUrl(req, req.file.filename);
    console.log('[Upload] Generated URL:', url);
    res.json({ url });
  } catch (e) {
    console.error('[Upload] Error:', e);
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

adminProductsRouter.get('/products', requirePool, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${paramIdx} OR brand ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (category) {
      conditions.push(`category = $${paramIdx}`);
      params.push(category);
      paramIdx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQ = await pool.query(`SELECT COUNT(*) FROM products ${where}`, params);
    const total = parseInt(countQ.rows[0].count, 10);

    const dataQ = await pool.query(
      `SELECT * FROM products ${where} ORDER BY id DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      products: dataQ.rows.map(row => rowToPublicProduct(row, req)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

adminProductsRouter.get('/products/:dbId', requirePool, requireAdmin, async (req, res) => {
  try {
    const dbId = Number(req.params.dbId);
    if (!Number.isFinite(dbId)) return res.status(400).json({ error: 'Invalid id' });
    const { rows } = await pool.query(`SELECT * FROM products WHERE id = $1`, [dbId]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ product: rowToPublicProduct(rows[0], req) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

function validateProductPayload(c) {
  const errors = [];
  if (!c.name) errors.push('name is required');
  const price = c.price;
  if (price == null || !Number.isFinite(price) || price < 0) {
    errors.push(`valid price is required (received: ${JSON.stringify(price)})`);
  }
  if (c.is_preorder && price === 0) {
    errors.push('pre-order products cannot have a zero price');
  }
  if (!c.category) errors.push('category is required');
  if (c.compare_at_price != null && Number.isFinite(price) && c.compare_at_price <= price) {
    errors.push('compare_at_price must be greater than price when set');
  }
  return errors;
}

adminProductsRouter.post('/products', requirePool, requireAdmin, async (req, res) => {
  try {
    console.log('[Create Product] Request from:', req.admin?.email, 'Product name:', req.body.name);
    const c = bodyToRowColumns(req.body);
    const errs = validateProductPayload(c);
    if (errs.length) {
      console.error('[Create Product] Validation errors:', errs);
      return res.status(400).json({ error: errs.join('; ') });
    }

    const { rows } = await pool.query(
      `INSERT INTO products (
        legacy_override_id, name, title, description, price, compare_at_price, primary_image_url, rating,
        category, brand, video_url, is_preorder, show_preorder_price, is_active, features, specifications, variants, colors,
        sizes, connectivity_options, secondary_categories, gallery_images, stock_quantity
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb,$17::jsonb,$18::jsonb,$19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23
      ) RETURNING *`,
      [
        c.legacy_override_id,
        c.name,
        c.title,
        c.description,
        c.price,
        c.compare_at_price,
        c.primary_image_url,
        c.rating,
        c.category,
        c.brand,
        c.video_url,
        c.is_preorder,
        c.show_preorder_price,
        c.is_active,
        JSON.stringify(c.features),
        JSON.stringify(c.specifications),
        JSON.stringify(c.variants),
        JSON.stringify(c.colors),
        JSON.stringify(c.sizes),
        JSON.stringify(c.connectivity_options),
        JSON.stringify(c.secondary_categories),
        JSON.stringify(c.gallery_images),
        c.stock_quantity,
      ]
    );
    const created = rowToPublicProduct(rows[0], req);
    console.log('[Create Product] Success, ID:', rows[0].id, 'Name:', c.name);
    await logAudit(req.admin, 'create', 'product', rows[0].id, { name: c.name });
    res.status(201).json({ product: created });
  } catch (e) {
    console.error('[Create Product] Error:', e.message, 'Code:', e.code);
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Duplicate legacy_override_id or constraint violation' });
    }
    if (e.code === '42703') {
      return res.status(503).json({
        error:
          'Database schema is missing a column the API expects (often compare_at_price, stock_quantity, or show_preorder_price). Run sql/008_ensure_product_admin_columns.sql once, or sql/009_show_preorder_price.sql if only pre-order price visibility is missing.',
        code: e.code,
      });
    }
    if (e.code === '22001') {
      return res.status(400).json({
        error: 'A field is too long for the database (e.g. name or title over 500 characters). Shorten the text and try again.',
      });
    }
    if (e.code === '23514') {
      return res.status(400).json({
        error: 'Database rejected a value (check constraint). Check price ≥ 0 and rating between 0 and 5.',
        code: e.code,
      });
    }
    res.status(500).json({
      error: 'Failed to create product',
      code: e.code,
      detail: process.env.NODE_ENV !== 'production' ? e.message : undefined,
    });
  }
});

adminProductsRouter.put('/products/:dbId', requirePool, requireAdmin, async (req, res) => {
  try {
    const dbId = Number(req.params.dbId);
    console.log('[Update Product] Request from:', req.admin?.email, 'Product ID:', dbId, 'Name:', req.body.name);
    if (!Number.isFinite(dbId)) return res.status(400).json({ error: 'Invalid id' });
    const c = bodyToRowColumns(req.body);
    const errs = validateProductPayload(c);
    if (errs.length) {
      console.error('[Update Product] Validation errors:', errs);
      return res.status(400).json({ error: errs.join('; ') });
    }

    const { rows } = await pool.query(
      `UPDATE products SET
        legacy_override_id = $1,
        name = $2,
        title = $3,
        description = $4,
        price = $5,
        compare_at_price = $6,
        primary_image_url = $7,
        rating = $8,
        category = $9,
        brand = $10,
        video_url = $11,
        is_preorder = $12,
        show_preorder_price = $13,
        is_active = $14,
        features = $15::jsonb,
        specifications = $16::jsonb,
        variants = $17::jsonb,
        colors = $18::jsonb,
        sizes = $19::jsonb,
        connectivity_options = $20::jsonb,
        secondary_categories = $21::jsonb,
        gallery_images = $22::jsonb,
        stock_quantity = $23,
        updated_at = NOW()
      WHERE id = $24
      RETURNING *`,
      [
        c.legacy_override_id,
        c.name,
        c.title,
        c.description,
        c.price,
        c.compare_at_price,
        c.primary_image_url,
        c.rating,
        c.category,
        c.brand,
        c.video_url,
        c.is_preorder,
        c.show_preorder_price,
        c.is_active,
        JSON.stringify(c.features),
        JSON.stringify(c.specifications),
        JSON.stringify(c.variants),
        JSON.stringify(c.colors),
        JSON.stringify(c.sizes),
        JSON.stringify(c.connectivity_options),
        JSON.stringify(c.secondary_categories),
        JSON.stringify(c.gallery_images),
        c.stock_quantity,
        dbId,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    console.log('[Update Product] Success, ID:', dbId, 'Name:', c.name);
    await logAudit(req.admin, 'update', 'product', dbId, { name: c.name });
    res.json({ product: rowToPublicProduct(rows[0], req) });
  } catch (e) {
    console.error('[Update Product] Error:', e.message, 'Code:', e.code);
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Duplicate legacy_override_id' });
    }
    if (e.code === '42703') {
      return res.status(503).json({
        error:
          'Database schema is missing a column the API expects. Run sql/008_ensure_product_admin_columns.sql (includes show_preorder_price) or sql/009_show_preorder_price.sql on your database.',
        code: e.code,
      });
    }
    if (e.code === '22001') {
      return res.status(400).json({ error: 'A field is too long for the database.' });
    }
    res.status(500).json({
      error: 'Failed to update product',
      code: e.code,
      detail: process.env.NODE_ENV !== 'production' ? e.message : undefined,
    });
  }
});

adminProductsRouter.delete('/products/:dbId', requirePool, requireAdmin, async (req, res) => {
  try {
    const dbId = Number(req.params.dbId);
    if (!Number.isFinite(dbId)) return res.status(400).json({ error: 'Invalid id' });
    const r = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING id`, [dbId]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    await logAudit(req.admin, 'delete', 'product', dbId, {});
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ── Bulk actions ───────────────────────────────────────────────────────────
adminProductsRouter.post('/products/bulk', requirePool, requireAdmin, async (req, res) => {
  try {
    const { ids, action, value } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const numIds = ids.map(Number).filter(Number.isFinite);
    if (numIds.length === 0) {
      return res.status(400).json({ error: 'No valid ids provided' });
    }

    let affected = 0;

    switch (action) {
      case 'activate': {
        const r = await pool.query(
          `UPDATE products SET is_active = true, updated_at = NOW() WHERE id = ANY($1::int[])`,
          [numIds]
        );
        affected = r.rowCount;
        break;
      }
      case 'deactivate': {
        const r = await pool.query(
          `UPDATE products SET is_active = false, updated_at = NOW() WHERE id = ANY($1::int[])`,
          [numIds]
        );
        affected = r.rowCount;
        break;
      }
      case 'delete': {
        const r = await pool.query(
          `DELETE FROM products WHERE id = ANY($1::int[])`,
          [numIds]
        );
        affected = r.rowCount;
        break;
      }
      case 'change_category': {
        if (!value || typeof value !== 'string') {
          return res.status(400).json({ error: 'value (category name) is required for change_category' });
        }
        const r = await pool.query(
          `UPDATE products SET category = $1, updated_at = NOW() WHERE id = ANY($2::int[])`,
          [value.trim(), numIds]
        );
        affected = r.rowCount;
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown action "${action}". Valid: activate, deactivate, delete, change_category` });
    }

    await logAudit(req.admin, 'bulk_' + action, 'product', null, { ids: numIds, affected, value });
    res.json({ ok: true, affected });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Bulk action failed' });
  }
});
