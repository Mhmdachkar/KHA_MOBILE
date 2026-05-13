-- KHA Mobile — Orders Management
-- Run: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f sql/007_orders.sql

BEGIN;

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),

  -- Customer info (no user accounts yet — stored inline)
  customer_name VARCHAR(255) NOT NULL DEFAULT '',
  customer_email VARCHAR(255) NOT NULL DEFAULT '',
  customer_phone VARCHAR(50) DEFAULT '',
  shipping_address TEXT DEFAULT '',

  -- Totals
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Coupon applied (nullable FK)
  coupon_code VARCHAR(50) DEFAULT NULL,

  -- Payment
  payment_method VARCHAR(50) DEFAULT '',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),

  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders (order_number);

-- ---------------------------------------------------------------------------
-- Order line items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500) DEFAULT '',
  variant_label VARCHAR(255) DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

-- ---------------------------------------------------------------------------
-- Helper: generate order number sequence (e.g. KHA-000001)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'KHA-' || LPAD(NEW.id::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_number ON orders;
CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

COMMIT;
