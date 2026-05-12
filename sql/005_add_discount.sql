-- KHA Mobile — add compare_at_price (original/before-discount price) to products
-- Run in Supabase SQL Editor or: psql "$DATABASE_URL" -f sql/005_add_discount.sql

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(12, 2) DEFAULT NULL;

COMMENT ON COLUMN products.compare_at_price IS
  'Original price before discount. When set and > price, storefront can show "was $X, now $Y" and a % badge.';
