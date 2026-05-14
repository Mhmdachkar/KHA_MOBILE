-- Pre-order storefront price visibility (admin-controlled).
-- Run once if you do not use sql/008_ensure_product_admin_columns.sql (which also adds this).

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_preorder_price BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN products.show_preorder_price IS
  'When is_preorder: if false, storefront hides the numeric price (shows Pre-order only).';
