-- KHA Mobile — Coupons, Audit Log, Stock Tracking
-- Run: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f sql/006_coupons_audit_stock.sql

BEGIN;

-- ---------------------------------------------------------------------------
-- Stock quantity on products (NULL = unlimited / not tracked)
-- ---------------------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL;

COMMENT ON COLUMN products.stock_quantity IS
  'Inventory count. NULL means stock is not tracked (unlimited). 0 = out of stock.';

-- ---------------------------------------------------------------------------
-- Coupons / discount codes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage'
    CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(12, 2) DEFAULT NULL,
  max_discount_amount NUMERIC(12, 2) DEFAULT NULL,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (UPPER(code));
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons (is_active);

-- ---------------------------------------------------------------------------
-- Admin audit log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON audit_log (admin_id);

COMMIT;
