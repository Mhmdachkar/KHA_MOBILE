-- KHA Mobile — ensure columns required by POST/PUT /api/admin/products exist.
-- Run once in Supabase SQL Editor if product save returns 500 / "undefined_column".
-- Idempotent: safe to re-run.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(12, 2) DEFAULT NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL;

COMMENT ON COLUMN products.compare_at_price IS
  'Original price before discount. When set and > price, storefront can show discount.';
COMMENT ON COLUMN products.stock_quantity IS
  'Inventory count. NULL = not tracked; 0 = out of stock.';
