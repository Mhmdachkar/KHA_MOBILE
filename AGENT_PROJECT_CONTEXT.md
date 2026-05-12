# KHA Mobile / Elegant Gadget Emporium — Project handoff for agents & developers

**Purpose:** This file is the single source of truth for *where the project stands* so a new chat or developer can orient quickly without scanning the entire tree. Read this first, then open only the files referenced in [Key files](#key-files).

**Live storefront:** `https://khamobile.store/`  
**API backend (Render):** `https://kha-mobile.onrender.com` (example; confirm in deployment dashboard)

---

## 1. What this product is

- **Customer-facing site:** React 18 + TypeScript + Vite + React Router + Tailwind + shadcn/Radix + Framer Motion + TanStack Query. E‑commerce style catalog (phones, tablets, audio, wearables, gaming, accessories, etc.), cart, favorites, checkout flow, category pages, product detail pages.
- **Admin area:** JWT-protected dashboard under `/admin/*` for catalog CRUD, **site content** (homepage sections), uploads, and a legacy local analytics view.
- **Backend:** Node.js **Express** (ES modules) with `pg` talking to **PostgreSQL** (hosted on **Supabase**). Not Deno Edge Functions — the Express app is deployed separately (e.g. Render).
- **Data strategy:** The storefront is still driven largely by **static TypeScript product data** (`src/data/products.ts`, `src/data/greenLionProducts.ts`). The database can **override** any product that shares the same storefront `id` via `legacy_override_id`, or add **new** rows without a legacy id. Merging logic lives in `src/data/productLookup.ts` and is fed API rows through `CatalogContext`.

---

## 2. Repository layout (high level)

| Area | Path | Notes |
|------|------|--------|
| Storefront | `src/` | Pages, components, contexts, `lib/`, `data/` |
| Admin UI | `src/pages/admin/` | Login, layout, product list/editor, site content |
| Backend | `server/` | `index.js`, `routes/`, `middleware/`, `lib/`, `uploads/` |
| SQL | `sql/` | Schema + seeds (run in Supabase SQL Editor or `psql`) |
| Assets | `src/assets/` | Large image/video set (phones, Tablets, accessories, audio, …) |

---

## 3. Database & SQL migrations

Run **in order** on the Supabase project database:

1. **`sql/001_schema.sql`** — Creates `admin_users`, `site_settings`, `products` (with JSONB fields, `legacy_override_id`, identity id starting at 100000 for DB-only products).
2. **`sql/002_seed_admin.sql`** — Seeds/updates default admin. Uses `ON CONFLICT (email) DO UPDATE` so re-running updates password hash and metadata.
3. **`sql/003_seed_products.sql`** — Bulk seed of products aligned with static ids; many rows used placeholder image URLs intentionally; real images on the site come from **Vite-resolved imports** in TS until overrides use real URLs or uploads.
4. **`sql/004_seed_site_settings.sql`** — Default JSON blobs for homepage-driven keys (announcements, hero, flagship showcase, new arrivals, weekly favorites).

**Important:** Do not commit real production secrets inside SQL comments or seeds; treat seeds as dev/bootstrap only unless reviewed.

---

## 4. Backend API (Express)

**Entry:** `server/index.js`  
**Must load env first:** `import 'dotenv/config';` as the first import (ESM hoisting issue was fixed this way).

### 4.1 CORS

- Controlled by **`FRONTEND_ORIGIN`** (comma-separated list, no spaces required but trim is applied).
- Must include the **exact** browser origin for the storefront, e.g. `https://khamobile.store` and local dev origins (`http://localhost:5173`, `http://localhost:8080`, etc.).

### 4.2 Health

- `GET /api/health` — Returns OK and whether `DATABASE_URL` is set.

### 4.3 Public API

- `GET /api/public/products` — Active products from DB, mapped via `server/lib/productMapper.js` (`rowToPublicProduct`). Storefront `id` = `legacy_override_id` when set, else DB `id`.
- `GET /api/public/settings` — Optional `?keys=...` for site settings JSON.

### 4.4 Admin API (Bearer JWT)

Mounted under `/api/admin` (see `server/routes/adminAuth.js`, `adminProducts.js`, `adminSettings.js`):

- **Auth:** `POST /api/admin/login` — bcrypt verify against `admin_users`.
- **Products:** list/get/create/update/delete + `POST /api/admin/upload` (Multer → `server/uploads/`, URLs via `API_PUBLIC_URL` or request host).
- **Settings:** `GET/PUT` under `/api/admin/settings` (keyed rows in `site_settings`).

### 4.5 Email

- `POST /api/send-order-email` — Resend integration when `RESEND_API_KEY` and `ADMIN_EMAIL` are set.

---

## 5. PostgreSQL / Supabase connectivity (production pitfalls)

- **Use the Supabase *transaction pooler* connection string** (typically port **6543**, pooler host) for serverless / IPv4-only hosts like **Render free tier**.
- **Direct** `db.<ref>.supabase.co:5432` can resolve to **IPv6**; Render then failed with `ENETUNREACH` on IPv6. Fix was switching `DATABASE_URL` to the **pooler** URL on Render.
- URL-encode special characters in passwords inside `DATABASE_URL`.

---

## 6. Environment variables

### 6.1 Frontend (Vite) — repo root `.env` / Netlify “Environment variables”

| Variable | Role |
|----------|------|
| `VITE_API_URL` | Base URL for API (e.g. `https://kha-mobile.onrender.com` in production). **Netlify does not read committed `.env` for build secrets by default** — set these in the Netlify UI so production bundles do not keep pointing at `localhost:3001`. |
| `VITE_SITE_URL` | Canonical storefront origin **without trailing slash** (e.g. `https://khamobile.store`). Used for “View store” / admin login links in `src/lib/adminApi.ts`. |
| `VITE_SUPABASE_URL` | Supabase project URL (used by client where Supabase client is wired). |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public). |

Types: `src/vite-env.d.ts`.

### 6.2 Backend — `server/.env` / Render env

| Variable | Role |
|----------|------|
| `DATABASE_URL` | Postgres connection string (prefer **pooler** on Render). |
| `JWT_SECRET` | Signs admin JWTs. |
| `FRONTEND_ORIGIN` | CORS allowlist (comma-separated). |
| `SITE_URL` | Logged / optional consistency with storefront. |
| `API_PUBLIC_URL` | Optional absolute base for generated upload URLs. |
| `PORT` | Render sets automatically; local default often 3001. |
| `RESEND_API_KEY` / `ADMIN_EMAIL` | Order email path. |

**Security:** Never commit real `.env` files to public repos. Use `.env.example` patterns only.

---

## 7. Deployment topology (as implemented)

| Layer | Typical host | Notes |
|--------|--------------|--------|
| Static SPA | **Netlify** (or similar) | Build: Vite `npm run build`; publish `dist/`. Env vars must be set in host UI. |
| API | **Render** Web Service | Root directory `server/`, `npm install`, `npm start` (`node index.js`). |

After changing `VITE_*` on Netlify, trigger a **redeploy** (often “Clear cache and deploy”) so hashed JS picks up the new API base URL.

---

## 8. Authentication & admin UX

- **Login page:** `/admin/login` — uses `adminFetch` / `POST ${VITE_API_URL}/api/admin/login`. Token stored in `localStorage` (key in `src/lib/adminApi.ts`).
- **Layout:** `src/pages/admin/AdminLayout.tsx` — desktop sidebar uses **`fixed` left column + `sm:ml-56` on main** so the nav does not scroll away with long lists.
- **Mobile:** Drawer + top bar; nav items close drawer on route change.
- **Touch:** Several admin controls use `touch-manipulation` / `touchAction: 'manipulation'` for better mobile behavior.

### 8.1 Password changes

- `server/scripts/hash-admin-password.mjs` — utility to generate bcrypt hashes for seeding or manual SQL updates.
- `sql/002_seed_admin.sql` — re-runnable upsert for admin email/password metadata.

---

## 9. Catalog & product merging (critical for agents)

### 9.1 Static sources

- `src/data/products.ts` — `phoneAccessories`, `wearablesProducts`, `smartphoneProducts`, `tabletProducts`, `iphoneCases`, `gamingConsoles`, `electronicsProducts`; helpers `getProductById`, `getProductsByCategory`.
- `src/data/greenLionProducts.ts` — `greenLionProducts` array + category helpers.
- `src/data/productLookup.ts` — **`registerPublicApiProducts`**, merged getters (`getProductsByCategoryMerged`, `getAllGreenLionProductsMerged`, etc.), maps API payloads to `Product` / `GreenLionProduct` shapes.

### 9.2 Runtime merge

- `src/context/CatalogContext.tsx` — On mount calls `GET ${VITE_API_URL}/api/public/products`, then `registerPublicApiProducts(...)`. On failure, registers `[]` and sets `lastError` (storefront still works from static data).
- Exposes **`allProducts`**: union of static arrays + `getAllGreenLionProductsMerged()`, deduped by numeric `id`. Recomputes when `catalogTick` changes after refresh.
- Also exposes: `catalogLoaded`, `loading`, `refreshCatalog` / **`refresh`** (alias), `lastError`.

### 9.3 Admin product list (current behavior)

- **`src/pages/admin/AdminProductList.tsx`** uses **`useCatalog().allProducts`** so the admin **sees the same merged universe as the storefront** (correct images from bundled assets for static rows).
- **Delete:** Only allowed when **`dbId`** is present (row exists in DB). Static-only rows show a toast explaining removal must be done in code.
- **Edit links:** Currently `Link` to `/admin/products/${p.dbId}`. **Gap:** Static-only products often have **no `dbId`** on merged objects, so edit may not work until either (a) a DB row exists with matching `legacy_override_id`, or (b) the list is enriched with `dbId` from `GET /api/admin/products` by matching storefront `id`. New agents: verify this UX and patch if the client reports broken edit.

---

## 10. Site content (homepage CMS)

- **Context:** `src/context/SiteSettingsContext.tsx` — loads public settings keys, merges with defaults, exposes `refresh`.
- **Admin UI:** `src/pages/admin/AdminSiteContent.tsx` — tabs for announcements, hero, flagship showcase (including **product swap** via product id), new arrivals, weekly favorites.
- **Backend:** `server/routes/adminSettings.js` (admin CRUD), `server/routes/publicSettings.js` (public read).
- **Storefront usage:** e.g. `AnnouncementBar`, `Home.tsx` sections, `NewArrivalShowcase`, `ThisWeeksFavorites` — wired to settings where implemented.

---

## 11. Frontend routing (admin subset)

From `src/App.tsx`:

- `/admin/login` — public.
- `/admin` — `AdminLayout` with children:
  - `/admin/products` — list.
  - `/admin/products/new` — create.
  - `/admin/products/:dbId` — edit **by database id** (not storefront id).
  - `/admin/site-content` — CMS tabs.
  - `/admin/analytics` — legacy dashboard.

---

## 12. Known issues & operational notes

1. **Netlify env:** Production bundle must receive `VITE_API_URL` at **build** time from the host env, not only from a local `.env` file.
2. **Render cold start:** Free tier may sleep; first request after idle can be slow.
3. **Admin list vs DB ids:** Full catalog visibility in admin is intentional; aligning **edit** with DB rows may need a follow-up (see §9.3).
4. **React Router v6** deprecation warnings in console may still appear until router upgrades/migrations.
5. **CSS minify warnings** during Vite build have been observed; build still succeeded — treat as cleanup backlog unless broken styles appear.

---

## 13. Key files (bookmark list)

| Topic | File(s) |
|-------|---------|
| App shell & routes | `src/App.tsx` |
| API base & admin token | `src/lib/adminApi.ts` |
| Catalog fetch & `allProducts` | `src/context/CatalogContext.tsx` |
| Site settings fetch | `src/context/SiteSettingsContext.tsx` |
| Merge logic | `src/data/productLookup.ts` |
| Static products | `src/data/products.ts`, `src/data/greenLionProducts.ts` |
| Admin layout / nav | `src/pages/admin/AdminLayout.tsx` |
| Admin products | `src/pages/admin/AdminProductList.tsx`, `AdminProductEditor.tsx` |
| Admin site CMS | `src/pages/admin/AdminSiteContent.tsx` |
| Server entry | `server/index.js` |
| DB pool | `server/lib/db.js` |
| Product JSON mapping | `server/lib/productMapper.js` |
| Admin products API | `server/routes/adminProducts.js` |
| Auth | `server/routes/adminAuth.js`, `server/middleware/auth.js` |
| SQL | `sql/001_schema.sql` … `004_seed_site_settings.sql` |
| Password hash helper | `server/scripts/hash-admin-password.mjs` |

---

## 14. Suggested order for a new agent task

1. Read this document.
2. Confirm **Netlify** `VITE_*` and **Render** `DATABASE_URL` / `FRONTEND_ORIGIN` / `JWT_SECRET`.
3. Hit `GET /api/health` on the deployed API.
4. For data issues, verify SQL migrations applied on Supabase.
5. For storefront vs admin discrepancies, trace `productLookup` + `CatalogContext` + specific page.

---

## 15. Changelog-style summary (what was done across the project arc)

- Added PostgreSQL schema and product/admin/settings seeds under `sql/`.
- Implemented Express admin auth (JWT + bcrypt), admin product CRUD, Multer uploads, public catalog + public settings routes.
- Wired storefront **CatalogContext** to merge API products into `productLookup`; added **SiteSettingsProvider** and homepage/admin CMS for dynamic blocks.
- Built **admin dashboard** pages (products list/editor, site content, analytics shell) with **mobile-first** responsive work (layout, filters, touch).
- Configured **canonical URLs** (`VITE_SITE_URL`, `SITE_URL`) and admin login/store links.
- Deployed API to **Render**; fixed **IPv6 / pooler** `DATABASE_URL` issue; fixed **CORS** with `FRONTEND_ORIGIN`.
- Addressed **Netlify** env for client API base (avoid `localhost` in production).
- Admin **sidebar** pinned with fixed positioning + main content offset.
- Admin product list switched to **merged catalog** (`allProducts`) so thumbnails match the site (bundled asset URLs), not only DB `primary_image_url`.
- Extended **CatalogContext** to compute and export **`allProducts`** plus `loading` / `refresh` alias.
- Removed ephemeral docs/scripts that were superseded (e.g. Supabase bucket upload guide / one-off checklists) in favor of this single handoff file.

---

*Last updated for agent onboarding. When making significant architectural changes, update this file in the same PR.*
