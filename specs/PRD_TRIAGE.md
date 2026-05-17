# KHA Mobile Critical Issues PRD — Triage & Implementation Spec

> Generated from codebase audit on 2026-05-16.
> Supersedes the original PRD where noted.

---

## 1. PRD vs Reality — Issue Status

Many P0 issues listed in the PRD have **already been implemented**. This triage
corrects the record so we focus effort on what's actually broken.

### Already Fixed (no work needed)

| PRD ID  | Title                                     | Evidence                                                                                             |
|---------|-------------------------------------------|------------------------------------------------------------------------------------------------------|
| P0-01   | Orders never persist                      | `server/lib/orders.js` — full transactional `createOrder()` with stock lock, coupon, idempotency     |
| P0-03   | Admin token leaked in URL                 | `server/middleware/auth.js` — `req.query.token` fallback removed; `AdminOrders.tsx` uses fetch+header|
| P0-05   | Hardcoded localhost in Checkout           | `apiBase()` reads `VITE_API_URL`; `orderEmail.js` reads `SITE_URL`; only dev fallbacks remain        |
| P0-06   | No stock decrement                        | `orders.js:356-378` — `FOR UPDATE` lock + atomic decrement inside order transaction                  |
| P0-07   | Coupon used_count never incremented       | `coupons.js:80-91` — `incrementCouponUsage()` called inside order transaction                        |
| P1-01   | Coupon PUT uses COALESCE                  | `adminCoupons.js:82` — full replacement, no COALESCE; nullable fields set directly                   |
| P1-11   | Audit log not paginated                   | `adminAudit.js:7-50` — page/limit/entity_type/action params supported                               |
| P2-04   | Admin notification on new order           | `publicOrders.js:95-98` — `sendOrderEmail()` called post-commit, fire-and-forget                     |

### Still Broken — Remaining Issues (22 items)

#### P0 — Critical (2 remaining)

| ID    | Title                           | Severity | File(s)                              |
|-------|---------------------------------|----------|--------------------------------------|
| P0-02 | JWT_SECRET defaults to weak key | Critical | `server/middleware/auth.js:3`        |
| P0-04 | No rate limiting on login       | Critical | `server/routes/adminAuth.js`         |

#### P1 — High (7 remaining)

| ID    | Title                                          | File(s)                                                  |
|-------|-------------------------------------------------|----------------------------------------------------------|
| P1-02 | Orphan images on product delete/update          | `server/routes/adminProducts.js:331-343`                 |
| P1-03 | Deactivated admins can use existing 7-day JWTs  | `server/middleware/auth.js:17-36`                         |
| P1-04 | CORS credentials: true unnecessary              | `server/index.js:53`                                     |
| P1-05 | AdminLayout trusts token presence, no /admin/me | `src/pages/admin/AdminLayout.tsx:38-42`                   |
| P1-06 | Categories are free-text (duplicates)           | `server/routes/adminProducts.js`, `AdminProductEditor.tsx`|
| P1-07 | Price validation not surfaced in UI             | `AdminProductEditor.tsx`                                  |
| P1-09 | No admin "create order" workflow                | `server/routes/adminOrders.js` (missing POST)             |
| P1-10 | Failed login attempts not audited               | `server/routes/adminAuth.js`                              |

#### P2 — Medium (10 remaining)

| ID    | Title                                          |
|-------|-------------------------------------------------|
| P2-01 | AdminProductEditor.tsx monolith (56 KB)         |
| P2-02 | WhatsApp number hardcoded (partially fixed via site_settings; verify all paths) |
| P2-03 | Currency formatting not centralised             |
| P2-05 | Admin dashboard is empty landing page           |
| P2-06 | No /api/admin/analytics/summary endpoint        |
| P2-07 | Image upload: no dimension/SVG validation       |
| P2-08 | Audit log error handling                        |
| P2-09 | No soft-delete for orders                       |
| P2-10 | Order status transitions unguarded              |
| P2-11 | No cache headers on catalog endpoint            |
| P2-12 | AdminSiteContent.tsx monolith                   |

#### P3 — Low (10 items)

P3-01 through P3-10 — consistency, tooling, i18n scaffolding. Deferred.

---

## 2. Recommended Implementation Phases

### Phase 1: Security Hardening

**Effort: ~3 hours | Impact: High | Risk: Low | Dependencies: None**

| Item  | Description                                                    | Detail                                                                                                                                     |
|-------|----------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| P0-02 | JWT_SECRET must fail loudly in production if missing or weak   | In `auth.js`: if `NODE_ENV === 'production'` and `JWT_SECRET` is unset or ≤ 20 chars, `throw` at startup. Remove `'dev-only-change-me'` default for prod. |
| P0-04 | Login rate limiting                                            | Add in-memory sliding-window limiter on `/api/admin/login`. 5 attempts per IP per 15 min. 429 response when exceeded. No external deps.   |
| P1-03 | Check `is_active` on every authenticated request               | In `requireAdmin`: after JWT verify, query `admin_users` for `is_active`. Cache for 60 s per `sub` to avoid per-request DB hits.           |
| P1-10 | Audit failed login attempts                                    | In `adminAuth.js`: on wrong-password or inactive-user, call `logAudit(null, 'login_failed', 'admin_user', null, { email, ip })`.          |
| P1-04 | Remove `credentials: true` from CORS (or justify)             | Auth uses `Authorization` header, not cookies. Remove `credentials: true` to reduce attack surface. If needed for future cookie auth, add `SameSite=Strict`. |

### Phase 2: Admin Correctness

**Effort: ~5 hours | Impact: High | Risk: Low**

| Item  | Description                                                    | Detail                                                                                                                                     |
|-------|----------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| P1-05 | Add `/api/admin/me` endpoint + client validation               | New route in `adminAuth.js`: `GET /me` — verify JWT, check `is_active`, return user info. In `AdminLayout.tsx`: on mount, call `/me`; on 401 redirect to login. |
| P1-02 | Clean orphan images on product delete/update                   | On `DELETE /products/:id`: before deleting, read the row, collect `primary_image_url` + `gallery_images` + `colors[].image`; `fs.unlink` matching `/uploads/` files. On `PUT`: diff old vs new image URLs; unlink removed ones. |
| P1-09 | Admin "create order" endpoint                                  | `POST /api/admin/orders` — reuse `createOrder()` from `lib/orders.js` with `checkoutType: 'admin_manual'`. Requires `requireAdmin`. Frontend: add "New Order" button to `AdminOrders.tsx` with a form for customer + items. |
| P2-10 | Order status transition guards                                 | Define valid transitions: `pending→confirmed→shipped→delivered`, `*→cancelled`. Reject invalid transitions in `PUT /orders/:id` with 409. |

### Phase 3: UX & Data Quality

**Effort: ~4 hours | Impact: Medium | Risk: Low**

| Item  | Description                                                    |
|-------|----------------------------------------------------------------|
| P1-06 | Constrain categories: add `/api/admin/categories` endpoint returning distinct values; `AdminProductEditor.tsx` uses autocomplete/select instead of freetext |
| P1-07 | Surface price validation errors field-by-field in `AdminProductEditor.tsx` (currently server returns one concatenated string) |
| P2-07 | Image upload validation: reject SVG, enforce max 4096×4096 dimensions server-side (sharp or image-size lib) |
| P2-03 | Create `lib/currency.ts` utility; replace all `$${n.toFixed(2)}` callsites |
| P2-11 | Add `Cache-Control` + `ETag` headers to `GET /api/public/products` |

### Phase 4: Admin UX (Lower Priority)

**Effort: ~8 hours | Impact: Medium | Risk: Low**

| Item  | Description                                                    |
|-------|----------------------------------------------------------------|
| P2-01 | Split `AdminProductEditor.tsx` (56 KB) into section components |
| P2-12 | Split `AdminSiteContent.tsx` similarly                         |
| P2-05 | Admin dashboard with KPI cards (total orders, revenue, etc.)   |
| P2-06 | `/api/admin/analytics/summary` endpoint                        |
| P2-09 | Soft-delete for orders (add `deleted_at` column)               |
| P2-08 | Audit log error handling improvements                          |

### Phase 5: Polish (P3)

Deferred — consistency, tooling, i18n scaffolding.

---

## 3. Open Questions for User

Before starting implementation, these decisions affect the spec:

### Q1 — JWT secret enforcement
> Should the server refuse to start in production without a strong JWT_SECRET,
> or just log a warning? (Recommendation: hard-fail.)

### Q2 — Rate limiter storage
> In-memory (simple, lost on restart) or external (Redis)?
> For a single-instance Express server, in-memory is fine.
> If running multiple replicas, need Redis or a DB-backed approach.

### Q3 — is_active check caching
> P1-03 adds a DB query per admin request. Cache TTL of 60 s acceptable?
> (Means a deactivated admin can access the system for up to 60 s after deactivation.)

### Q4 — Image cleanup strategy (P1-02)
> Synchronous `fs.unlink` in the delete handler, or background job?
> For low-volume usage, synchronous is simpler. For high-volume, queue it.

### Q5 — Order status machine (P2-10)
> Proposed transitions:
> ```
> pending → confirmed → shipped → delivered
>       ↘ cancelled
> confirmed → cancelled
> shipped   → cancelled (with stock restore?)
> ```
> Should cancellation of a shipped order restore stock?

### Q6 — Multi-admin RBAC
> Current system has `role` column but doesn't enforce it.
> Should Phase 1 include role-based access (staff vs owner)?
> Or defer to Phase 4?

### Q7 — Soft vs hard delete for products
> `DELETE /products/:id` currently hard-deletes. Switch to soft-delete
> (`deleted_at` column) now, or defer?

---

## 4. Recommendation

**Start with Phase 1 (Security Hardening)** because:

- 2–3 hours of work
- Zero dependencies or data migrations
- Closes the two remaining P0 issues
- Quick wins build confidence for Phase 2

Then proceed to **Phase 2 (Admin Correctness)** — highest remaining impact.

**Awaiting your answers to Q1–Q7 and phase approval.**
