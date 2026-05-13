# KHA Mobile Admin — Feature Roadmap & Enhancement Plan

> A prioritized list of powerful features to give the admin **full control** over the storefront, customer experience, marketing, and business operations.

---

## Current State (Already Implemented)

| Module | Status |
|--------|--------|
| Product CRUD + merged catalog | Done |
| Bulk actions (activate/deactivate/delete/recategorize) | Done |
| Discount pricing (compare-at-price) | Done |
| Stock tracking | Done |
| Orders management (list, view, status update) | Done |
| Coupons (CRUD, %, fixed, date range, max uses) | Done |
| Media Library (upload, browse, delete) | Done |
| Site Content CMS (hero, announcements, showcases) | Done |
| Activity/Audit Log | Done |
| Order email notifications (Resend) | Done |
| Admin auth (JWT + bcrypt) | Done |

---

## Priority 1 — High Impact, Recommended Next

### 1.1 Dashboard Analytics (Real-time Overview)

**What:** A proper admin home page with real-time KPIs instead of the current analytics shell.

**Features:**
- Total revenue (today / this week / this month / all-time)
- Order count + average order value (AOV)
- Top selling products (last 7/30 days)
- Revenue chart (line graph — daily/weekly/monthly toggle)
- Orders by status breakdown (pending, confirmed, shipped, delivered, cancelled)
- Low stock alerts (products below threshold)
- Recent orders feed (live list)
- Conversion rate (views → cart → checkout, if tracking is added)

**Backend needed:**
- `GET /api/admin/dashboard` — aggregated stats from orders table
- Optional: store daily snapshots in a `daily_stats` table for fast historical charts

---

### 1.2 Customer Management

**What:** Full customer database with order history, notes, and segmentation.

**Features:**
- Customer list with search, sort, and filters
- Customer detail page: name, email, phone, address, total spent, order history
- Add notes/tags to customers (e.g., "VIP", "wholesale", "problem customer")
- Export customer list as CSV
- Email individual customer from admin (with template)
- Customer groups/segments for targeted promotions

**Backend needed:**
- `customers` table (auto-created from orders or manual add)
- CRUD routes under `/api/admin/customers`

---

### 1.3 Notification Center & Push/WhatsApp Integration

**What:** Let the admin send targeted messages to customers.

**Features:**
- In-app notification bell in admin showing recent events (new order, low stock, review)
- WhatsApp message templates for order confirmations, shipping updates
- SMS/WhatsApp broadcast to customer segments
- Email marketing: simple newsletter builder or integration with Mailchimp/Resend lists
- Configurable triggers: "Send WhatsApp when order status = shipped"

**Backend needed:**
- `notifications` table for admin alerts
- WhatsApp Business API integration (or Twilio)
- Webhook triggers on order status changes

---

### 1.4 Shipping & Delivery Zones

**What:** Let the admin configure delivery areas, fees, and estimated times.

**Features:**
- Define delivery zones (by city/region/country)
- Set delivery fee per zone (flat or weight-based)
- Free shipping threshold per zone ("Free delivery above $100")
- Estimated delivery time display ("2-3 days for Beirut")
- Enable/disable delivery to specific zones
- Pickup option toggle (in-store pickup with address)

**Backend needed:**
- `shipping_zones` table
- Public API: `GET /api/public/shipping-zones`
- Checkout integration: auto-calculate fee based on selected zone

---

### 1.5 Product Reviews & Ratings (User-Generated)

**What:** Allow customers to leave reviews; admin can moderate.

**Features:**
- Review submission on product page (name, rating, comment, optional photo)
- Admin moderation queue: approve/reject/feature reviews
- Average rating auto-calculated and displayed on product cards
- "Verified purchase" badge (if order history exists)
- Report/flag abusive reviews
- Admin can respond to reviews publicly

**Backend needed:**
- `product_reviews` table
- Public: `GET /api/public/products/:id/reviews`
- Admin: `GET/PUT/DELETE /api/admin/reviews`

---

## Priority 2 — Powerful Business Features

### 2.1 Flash Sales & Scheduled Promotions

**What:** Create time-limited sales that auto-start and auto-end.

**Features:**
- Create a "Flash Sale" with start/end datetime
- Select products (or entire categories) included in the sale
- Set sale-specific discount % or fixed override price
- Countdown timer on storefront (auto-displays when sale is active)
- Admin scheduled calendar view of upcoming/past sales
- Auto-revert prices when sale ends

**Backend needed:**
- `flash_sales` table with start/end timestamps
- `flash_sale_products` join table
- Cron job or on-request check: "is this product in an active sale?"

---

### 2.2 Multi-Admin & Role-Based Access Control (RBAC)

**What:** Support multiple staff accounts with different permission levels.

**Features:**
- Roles: Super Admin, Manager, Staff, Viewer
- Permissions matrix: who can create/edit/delete products, manage orders, view analytics, manage coupons, edit site content
- Invite new admin by email (sends invite link)
- Activity log shows which admin did what
- Disable/suspend admin accounts without deleting

**Backend needed:**
- `admin_roles` + `admin_permissions` tables (or JSONB permissions on `admin_users`)
- Middleware: `requirePermission('products.write')` instead of just `requireAdmin`

---

### 2.3 Inventory Alerts & Auto-Actions

**What:** Never run out of stock without knowing.

**Features:**
- Set low-stock threshold per product (default: 5 units)
- Email alert when stock drops below threshold
- Auto-deactivate product when stock = 0
- Restock reminders (admin configurable)
- Inventory history log: "Stock changed from 10 → 7 on May 12"
- Bulk stock update (CSV upload)

**Backend needed:**
- `stock_history` table for audit trail
- Background check on order placement: decrement stock, trigger alerts

---

### 2.4 SEO & Meta Management

**What:** Give admin control over how pages appear in Google.

**Features:**
- Per-product: custom meta title, meta description, URL slug
- Per-category: custom SEO fields
- Global defaults (site title template, OG image fallback)
- Sitemap auto-generation
- Admin preview: "This is how your product looks in Google"
- Schema.org structured data (Product, Review, BreadcrumbList) auto-generated

**Backend needed:**
- Add `meta_title`, `meta_description`, `slug` columns to `products`
- `GET /api/public/sitemap` — dynamic XML sitemap

---

### 2.5 Abandoned Cart Recovery

**What:** Re-engage customers who added items but didn't complete checkout.

**Features:**
- Track cart sessions (store cart state server-side with email if provided)
- Admin view: list of abandoned carts with items + customer email
- Manual "Send reminder" button (email template)
- Auto-send reminder after configurable delay (1h, 24h, 3d)
- Include a unique recovery link that restores their cart
- Stats: recovery rate, revenue recovered

**Backend needed:**
- `cart_sessions` table
- Email automation trigger
- Public: `GET /api/public/cart/recover/:token`

---

## Priority 3 — Advanced / Growth Features

### 3.1 Multi-Language (i18n) Support

**What:** Serve the storefront in multiple languages (Arabic + English).

**Features:**
- Admin can add product translations (name, description, features) per language
- Language switcher on storefront
- RTL layout support for Arabic
- Site content CMS translations (hero text, announcements)
- URL prefix routing: `/en/products/...`, `/ar/products/...`

---

### 3.2 Product Bundles & "Frequently Bought Together"

**What:** Create bundle deals and cross-sell recommendations.

**Features:**
- Create bundles: "iPhone 16 + Case + Screen Protector" at a bundle price
- Admin picks products + sets bundle discount
- "Frequently Bought Together" widget on product pages (admin-curated or auto from order data)
- "Complete the Look" cross-sell section

---

### 3.3 Loyalty Points & Rewards Program

**What:** Reward returning customers with points.

**Features:**
- Earn X points per $1 spent
- Redeem points for discount at checkout
- Admin can grant/revoke points manually
- Bonus point campaigns ("Double points this weekend!")
- Tiered membership: Bronze → Silver → Gold with increasing benefits

---

### 3.4 Wishlist / Back-in-Stock Notifications

**What:** Let customers subscribe to out-of-stock products.

**Features:**
- "Notify me when available" button on sold-out products
- Admin sees list of watchers per product
- Auto-email/WhatsApp when product is restocked
- Admin can see most-wanted out-of-stock items (demand signal)

---

### 3.5 Advanced Image Management

**What:** Professional-grade media handling.

**Features:**
- Auto-resize and WebP conversion on upload (server-side)
- Image CDN integration (Cloudinary / Imgix) — admin pastes URL or uploads
- Drag-and-drop gallery reordering
- Image alt-text editing (SEO + accessibility)
- Bulk image upload via ZIP
- Image AI: auto-generate alt text, background removal

---

### 3.6 Returns & Refunds Management

**What:** Structured return/refund workflow.

**Features:**
- Customer submits return request (reason, photos)
- Admin return queue: approve/deny, partial refund, replacement
- Refund tracking (amount, method, date)
- Return policy editor (displayed on storefront)
- Stats: return rate, top-returned products, common reasons

---

### 3.7 Store Settings & Configuration Panel

**What:** Central place for all store-wide settings.

**Features:**
- Store name, logo, favicon upload
- Business info: address, phone, email, social links
- Currency & region settings
- Tax configuration (tax rate, tax-included toggle)
- Maintenance mode toggle ("Store is under maintenance" page)
- Custom CSS injection (for advanced users)
- Google Analytics / Facebook Pixel / TikTok Pixel IDs

---

### 3.8 Export & Reporting

**What:** Downloadable reports for accounting and analysis.

**Features:**
- Export orders as CSV/Excel (date range filter)
- Export products as CSV (for bulk editing in spreadsheet → re-import)
- Export customers as CSV
- Monthly revenue report (PDF)
- Tax report (total tax collected by period)
- Inventory valuation report (total stock × cost price)

---

### 3.9 A/B Testing for Homepage Sections

**What:** Test different hero images, copy, or product showcases.

**Features:**
- Admin creates variant A and variant B for any site content section
- System randomly shows one variant to each visitor
- Admin sees conversion/CTR stats after X days
- "Declare winner" button — winning variant becomes permanent

---

### 3.10 Webhooks & Integrations Panel

**What:** Let the admin connect the store to external services.

**Features:**
- Webhook configuration: trigger URL on events (new order, product update, stock change)
- Pre-built integrations: Google Sheets (auto-log orders), Zapier, Slack notifications
- API key management: generate read-only or full-access API keys for third parties
- Integration status dashboard (last ping, errors)

---

## Implementation Priority Matrix

| Feature | Effort | Business Impact | Suggested Sprint |
|---------|--------|-----------------|------------------|
| Dashboard Analytics | Medium | Very High | Sprint 1 |
| Customer Management | Medium | High | Sprint 1 |
| Shipping Zones | Low | High | Sprint 1 |
| Flash Sales / Scheduled | Medium | Very High | Sprint 2 |
| Multi-Admin RBAC | Medium | High | Sprint 2 |
| Inventory Alerts | Low | High | Sprint 2 |
| SEO & Meta | Low | Medium | Sprint 2 |
| Reviews & Ratings | Medium | High | Sprint 3 |
| Notification Center | Medium | Medium | Sprint 3 |
| Abandoned Cart Recovery | High | Very High | Sprint 3 |
| Product Bundles | Medium | High | Sprint 4 |
| Store Settings Panel | Low | Medium | Sprint 4 |
| Export & Reporting | Medium | High | Sprint 4 |
| Multi-Language (i18n) | High | High | Sprint 5 |
| Loyalty Points | High | Medium | Sprint 5 |
| Back-in-Stock Notifications | Low | Medium | Sprint 5 |
| Returns Management | Medium | Medium | Sprint 6 |
| A/B Testing | High | Medium | Sprint 6 |
| Webhooks & Integrations | High | Medium | Sprint 6 |
| Advanced Image Management | Medium | Low | Sprint 6 |

---

## Quick Wins (Can implement in < 1 hour each)

1. **Duplicate Product button** — clone an existing product to speed up catalog entry
2. **Product sort order** — drag-and-drop or manual "position" field to control display order
3. **Quick inline edit** — edit price/stock directly from the product list (no page navigation)
4. **Dark/light mode toggle** in admin panel
5. **Keyboard shortcuts** — `N` for new product, `S` for save, `/` for search
6. **Favorite/pin products** — admin pins frequently-edited products to the top
7. **Last edited timestamp** on product cards
8. **Print order** button — generates a print-friendly receipt/packing slip
9. **Copy product link** — one-click copy storefront URL for sharing
10. **Batch image upload** — drop multiple images, auto-assign to gallery

---

## Architecture Notes for Implementation

### Database migrations pattern
Each new feature gets a numbered SQL file: `sql/006_customers.sql`, `sql/007_flash_sales.sql`, etc.

### API pattern
- Admin routes: `server/routes/admin<Feature>.js` → mounted at `/api/admin/...`
- Public routes: `server/routes/public<Feature>.js` → mounted at `/api/public/...`
- All admin routes use `requireAdmin` middleware (or future `requirePermission`)

### Frontend pattern
- New admin pages: `src/pages/admin/Admin<Feature>.tsx`
- Register route in `src/App.tsx` under the `<AdminLayout>` outlet
- Add nav item in `AdminLayout.tsx` (`catalogNav` or `siteNav` arrays)

---

*This document is a living roadmap. Update it as features are completed or priorities shift. When starting a feature, ask the agent to read this file first for context.*
