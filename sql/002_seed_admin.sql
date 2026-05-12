-- Dev seed: default admin (change email/password immediately in production).
-- Password plain text (dev only): ChangeMe123!
-- Hash generated with bcrypt cost 10.
-- Apply after 001_schema.sql:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f sql/002_seed_admin.sql

BEGIN;

INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES (
  'admin@khamobile.local',
  '$2b$10$y5yBYTY7uD4GPlSubpfrw.A4acv2vdmgiowsvB9BI7YpR21HeQREy',
  'Store Admin',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Optional default settings (frontend can read via API later)
INSERT INTO site_settings (key, value)
VALUES ('catalog', '{"mode":"merge","notes":"merge = static catalog + DB rows; overrides use legacy_override_id"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMIT;
