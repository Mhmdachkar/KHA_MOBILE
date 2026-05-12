-- KHA Mobile – Default site-content settings
-- Run AFTER 001_schema.sql
-- Each key maps to a JSONB value consumed by the frontend.
-- Editing via Admin → Site Content will upsert these rows.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- ANNOUNCEMENT BAR  (rotating ticker at the very top)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO site_settings (key, value) VALUES (
  'announcements',
  '[
    {"text": "🎉 10% OFF Premium Gaming Accessories", "highlight": true},
    {"text": "Cutting-Edge Smartphones & Latest Tech", "highlight": false},
    {"text": "Crystal-Clear Audio Excellence", "highlight": false},
    {"text": "🎁 Instant Digital Gift Cards Worldwide", "highlight": false},
    {"text": "PlayStation Store Cards – 10% OFF", "highlight": true},
    {"text": "Lightning-Fast Delivery • Free Shipping", "highlight": false}
  ]'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- HERO SECTION  (main banner at top of homepage)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO site_settings (key, value) VALUES (
  'hero',
  '{
    "badge":       "New Collection 2026",
    "headline1":   "Future",
    "headline2":   "Is Now",
    "description": "Experience the pinnacle of technology with our curated collection of premium devices, smart accessories, and cutting-edge innovations.",
    "cta1_label":  "Explore Collection",
    "cta1_url":    "/products",
    "cta2_label":  "View Deals",
    "cta2_url":    "/products",
    "stat1_value": "10K+",
    "stat1_label": "Happy Customers",
    "stat2_value": "4.9",
    "stat2_label": "Average Rating",
    "stat3_value": "50K+",
    "stat3_label": "Products Sold"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- FLAGSHIP SHOWCASE  (iPhone 16 / featured product spotlight)
-- mode "product" → pulls all data from catalog product with given productId
-- mode "custom"  → uses the custom_* fields below
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO site_settings (key, value) VALUES (
  'flagship_showcase',
  '{
    "mode":              "product",
    "productId":         500,
    "custom_badge":      "Flagship Innovation",
    "custom_name":       "iPhone 16",
    "custom_tagline":    "Redefining Excellence",
    "custom_description":"Experience unparalleled performance with the A18 chip, stunning camera system, and revolutionary design.",
    "custom_image_url":  "",
    "cta1_label":        "Order Now",
    "cta1_url":          "/product/500",
    "cta2_label":        "View All iPhones",
    "cta2_url":          "/smartphones",
    "feature_chips": [
      {"label": "A18 Pro Chip",     "sublabel": "Next-Gen Performance"},
      {"label": "ProMotion",        "sublabel": "120Hz Display"},
      {"label": "48MP Camera",      "sublabel": "Pro Photography"},
      {"label": "All-Day Battery",  "sublabel": "Up to 29 Hours"}
    ]
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- NEW ARRIVAL SHOWCASE  (rotating product showcase with highlight features)
-- Each entry: productId + up to 3 highlight features (label + value)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO site_settings (key, value) VALUES (
  'new_arrival_showcases',
  '[
    {
      "productId": 5019,
      "features": [
        {"label": "Stabilization",  "value": "3-Axis Gimbal"},
        {"label": "Smart Tracking", "value": "Face & Object Tracking"},
        {"label": "Working Time",   "value": "7-10 Hours"}
      ]
    },
    {
      "productId": 5002,
      "features": [
        {"label": "Power",        "value": "40W High Torque"},
        {"label": "Speed Levels", "value": "4 Adjustable Speeds"},
        {"label": "Quiet Motor",  "value": "<55dB Noise Level"}
      ]
    },
    {
      "productId": 5034,
      "features": [
        {"label": "Color Temperature", "value": "3000±300K"},
        {"label": "Power Input",       "value": "9V/3A, 27W Max"},
        {"label": "Wireless Output",   "value": "15W Max"}
      ]
    }
  ]'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- THIS WEEK'S FAVORITES  (6 product grid)
-- type: "regular" | "greenLion" | "recharge"
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO site_settings (key, value) VALUES (
  'weekly_favorites',
  '[
    {"id": 7,    "type": "recharge"},
    {"id": 9,    "type": "recharge"},
    {"id": 309,  "type": "regular"},
    {"id": 5031, "type": "greenLion"},
    {"id": 5027, "type": "greenLion"},
    {"id": 401,  "type": "regular"}
  ]'::jsonb
) ON CONFLICT (key) DO NOTHING;

COMMIT;
