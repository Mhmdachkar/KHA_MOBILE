-- Dev seed: default admin (change email immediately in production if needed).
-- Password (dev): kamel102030 — bcrypt cost 10 (regenerate with server/scripts/hash-admin-password.mjs).
-- Apply after 001_schema.sql:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f sql/002_seed_admin.sql

BEGIN;

INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES (
  'kamelamer@admin.com',
  '$2b$10$GVyEC4fX4Bdb1XDRccq1he3x871HKjSUR.4juO5Ag9nY0Ge3IKMmG',
  'Store Admin',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Optional default settings (frontend can read via API later)
INSERT INTO site_settings (key, value)
VALUES ('catalog', '{"mode":"merge","notes":"merge = static catalog + DB rows; overrides use legacy_override_id"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMIT;
