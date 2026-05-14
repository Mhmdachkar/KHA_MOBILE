-- KHA Mobile — Orders v2 (P0-01)
-- Run AFTER 007_orders.sql.
-- Adds: checkout_type, coupon_discount snapshot, source_ip / user_agent for audit,
-- and idempotency_key (unique when set) so duplicate submits don't create
-- duplicate orders.
--
-- Apply: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f sql/009_orders_v2.sql

BEGIN;

-- Track which checkout flow produced the order (analytics + admin filtering).
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS checkout_type VARCHAR(30) NOT NULL DEFAULT 'product';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'orders' AND constraint_name = 'orders_checkout_type_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_checkout_type_check
      CHECK (checkout_type IN ('product', 'streaming', 'recharge', 'gift_card', 'admin_manual'));
  END IF;
END $$;

-- Snapshot of the discount value applied at order time (audit + analytics).
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- Lightweight forensic columns for fraud / abuse review.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS source_ip VARCHAR(64) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS user_agent VARCHAR(500) DEFAULT NULL;

-- Idempotency: same key returns the existing order instead of creating a duplicate.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(80) DEFAULT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_idempotency
  ON orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Seed admin-editable storefront settings used by the new orders flow.
INSERT INTO site_settings (key, value)
  VALUES ('whatsapp_number', '"96181861811"'::jsonb)
  ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value)
  VALUES ('delivery_fee', '4'::jsonb)
  ON CONFLICT (key) DO NOTHING;

COMMIT;
