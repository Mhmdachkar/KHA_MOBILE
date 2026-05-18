# Critical Problems — Catalog, Storefront & Checkout

**Last updated:** 2026-05-17  
**Purpose:** Single reference for **critical** (business/security) issues in the admin → catalog → storefront → checkout pipeline.  
**Related:** Full severity breakdown in `CATALOG_STOREFRONT_CRITICAL_AUDIT.md`.

---

## Executive summary

| ID | Problem | Risk | Code fix status |
|----|---------|------|-----------------|
| **C1** | Inactive legacy overrides still visible (static fallback) | Customers see delisted products; wrong price/stock | **Implemented** — needs QA |
| **C2** | Admin delete does not hide static-backed listings | “Deleted” products still sellable on storefront | **Partial** — legacy override delete → deactivate; non-legacy hard delete unchanged |
| **C3** | Checkout repricing used DB PK; cart sent storefront id | Wrong order totals; price tampering | **Implemented** — needs QA |
| **C4** | `is_active` / stock bypassed for legacy ids at checkout | Inactive SKUs can still be purchased | **Implemented** — needs QA |
| **C5** | Other UI paths still use `findStoreProductSplit` | Suppressed/inactive products can appear outside category/PDP | **Open** |
| **C6** | Pure static SKUs with no DB row fail checkout | Legitimate static-only products may not complete orders | **Open** (by design unless migrated) |

The root cause for **C1–C4** is the same architectural split:

- **Database truth** — admin products, orders, `is_active`, stock, `legacy_override_id`
- **Storefront truth** — bundled TypeScript catalog + merge with `GET /api/public/products`

When those diverge, the storefront and checkout can disagree with admin.

---

## C1 — Inactive legacy overrides still visible on storefront

### Problem

Public catalog API returns only `is_active = true`. The storefront merge seeds **static** products first and overlays API rows by storefront id. When an admin deactivates a row that has `legacy_override_id`, the API row disappears but the **static product with that id reappears**.

### Impact

- Product remains on category grids, search, and (before PDP fix) product pages  
- Static price, images, and variants shown instead of admin state  
- Customers can add delisted items to cart  

### Where

| Layer | File |
|-------|------|
| Public API | `server/routes/publicCatalog.js` |
| Suppression registry | `src/data/productLookup.ts` (`registerSuppressedStorefrontIds`) |
| Catalog build | `src/lib/catalogProduct.ts` (`buildStorefrontCatalog`) |
| Provider | `src/context/CatalogContext.tsx` |
| PDP | `src/pages/ProductDetail.tsx` |

### Intended fix (landed)

1. API returns `suppressedStorefrontIds`: inactive rows with non-null `legacy_override_id`.  
2. Client registers suppression and **skips** those ids when building static/Green Lion lists.  
3. PDP gates on `getStorefrontProductById(storefrontProducts, id)` after `catalogLoaded`.

### Still needs to be solved / verified

- [ ] **Runtime QA:** Deactivate legacy product → absent on category page, PDP 404, not in `storefrontProducts`.  
- [ ] **Multi-tab:** Second tab receives suppression via catalog refresh / `BroadcastChannel`.  
- [ ] **Residual (C5):** Favorites, checkout UI, flagship hero, `allProducts.ts` helpers may still resolve via `findStoreProductSplit` and show suppressed ids.

### Reproduce (before fix)

1. Admin → product with `legacy_override_id` → **Inactive** → save.  
2. Open `/product/{legacyId}` and category page → product still visible with static data.

---

## C2 — Admin DELETE does not remove storefront listing

### Problem

Hard-deleting a Postgres row does not remove entries from the bundled static catalog. Any product that exists only in TypeScript data (or only matched by storefront id) can remain visible and purchasable.

### Impact

- Admin believes product is removed; storefront still lists it  
- Orders may reference stale client prices if checkout does not resolve a DB row  

### Where

| Layer | File |
|-------|------|
| Admin DELETE | `server/routes/adminProducts.js` |
| Catalog merge | `src/lib/catalogProduct.ts` |

### Intended fix (partial)

- Rows with `legacy_override_id`: **DELETE** → `is_active = false` (deactivate), not `DELETE FROM`, so **C1 suppression** applies.  
- Rows **without** `legacy_override_id`: still **hard-deleted**; static catalog entry **unchanged**.

### Still needs to be solved

- [ ] **Policy:** Document that static-backed products must be hidden via **Inactive**, not delete, OR implement a persistent suppress/tombstone table for static ids.  
- [ ] **Hard delete non-legacy:** Static-only ids (never in DB) cannot be “deleted” from admin at all — need import + deactivate workflow.  
- [ ] **Runtime QA:** Delete legacy-backed product → storefront absent (same as inactive).

### Reproduce

1. Admin → delete product that was created with `legacy_override_id`.  
2. Before fix: still on storefront. After fix: should behave like inactive (C1).

---

## C3 — Checkout repricing used DB primary key; cart sent storefront id

### Problem

Storefront cart lines use **storefront id** (`legacy_override_id` when set, else DB `id`). `repriceItems()` queried `WHERE id = ANY($1)` using that value as Postgres PK. No match → server **trusted client `unitPrice`**.

### Impact

- Admin price changes ignored at checkout for most overridden SKUs  
- Malicious or stale client payloads could complete at wrong price  
- Financial and compliance risk  

### Where

| Layer | File |
|-------|------|
| Repricing | `server/lib/orders.js` (`repriceItems`, `normalizeOrderPayload`) |
| Cart payload | `src/context/CartContext.tsx`, `src/pages/Checkout.tsx` |
| Id mapping | `server/lib/productMapper.js` (`storefrontIdFromRow`) |

### Intended fix (landed)

1. Cart lines include optional `dbId` (from `ProductCard`, PDP).  
2. `repriceItems()` resolves row by `dbId`, then `legacy_override_id`, then PK.  
3. Server sets `unitPrice` from DB; unknown product lines → **409** `PRODUCT_NOT_FOUND`.

### Still needs to be solved / verified

- [ ] **Runtime QA:** Add legacy-id product to cart → checkout total matches admin price after price change.  
- [ ] **Legacy carts:** Old localStorage carts without `dbId` still work if `productId` matches `legacy_override_id` (verify).  
- [ ] **C6:** Static-only products with no DB row now **fail checkout** — decide product policy (migrate all SKUs to DB vs. controlled allowlist).

### Reproduce

1. Add product with storefront id = `legacy_override_id` to cart.  
2. Change price in admin.  
3. Before fix: checkout uses old client price. After fix: server price.

---

## C4 — `is_active` and stock checks bypassed for legacy storefront ids

### Problem

Same lookup bug as **C3**: inactive or out-of-stock DB rows were never loaded into the reprice map when the cart sent a legacy storefront id. Checkout could complete using client price.

### Impact

- Deactivated products (C1) still purchasable  
- Stock limits not enforced for overridden SKUs  

### Where

Same as **C3** — `server/lib/orders.js` (`repriceItems`).

### Intended fix (landed)

After correct row resolution, enforce:

- `!product.is_active` → **409** `PRODUCT_INACTIVE`  
- Stock vs `quantity` when not preorder  

### Still needs to be solved / verified

- [ ] **Runtime QA:** Deactivate product → checkout blocked with clear error.  
- [ ] **Cart held before deactivation:** User with item already in cart — confirm 409 on submit (expected).  
- [ ] **Server does not read `suppressedStorefrontIds`:** Relies on DB row still existing (deactivated). Hard-deleted non-legacy static ids are a separate gap (C2).

---

## C5 — Residual: `findStoreProductSplit` bypasses unified visibility (OPEN)

### Problem

Several flows still resolve products via `findStoreProductSplit`, which can return **static** data even when the unified catalog (`storefrontProducts`) has hidden the product (C1).

### Impact

- Favorites, checkout sidebar, hero showcase, or legacy listing helpers may show names/images/prices for delisted SKUs  
- Inconsistent UX vs category pages and PDP  

### Where (non-exhaustive)

| File | Usage |
|------|--------|
| `src/context/FavoritesContext.tsx` | Favorite product display |
| `src/pages/Checkout.tsx` | Cart line display |
| `src/components/ThisWeeksFavorites.tsx` | Curated favorites |
| `src/components/NewArrivalShowcase.tsx` | Showcase product |
| `src/pages/Home.tsx` | Flagship showcase |
| `src/data/allProducts.ts` | Legacy category aggregations |

### What needs to be done

- [ ] Replace with `getStorefrontProductById(storefrontProducts, id)` or remove entry when absent.  
- [ ] Deprecate `getProductsByCategoryMerged` for any customer-facing surface (see audit **H3**).

---

## C6 — Pure static SKUs without a DB row (OPEN — policy)

### Problem

After fail-closed repricing, any cart line with a `productId` that does not resolve to a `products` row is **rejected** at checkout (`PRODUCT_NOT_FOUND`).

### Impact

- Bundled catalog items never imported into Postgres **cannot be purchased** online  
- May be correct for security, or may break launch catalog if most SKUs are static-only  

### What needs to be done (choose one)

1. **Migrate:** Ensure every sellable storefront id has a DB row (seed script / admin import). **Recommended.**  
2. **Allowlist:** Server endpoint or config for explicit static ids with server-defined price (no client trust).  
3. **Revert fail-closed** for ids not in DB (reintroduces C3/C4 — not recommended).

---

## Verification checklist (must pass before closing criticals)

Use this after deploying API + frontend changes and restarting the server.

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Legacy product → **Inactive** | Hidden on category pages; PDP not found; not in `storefrontProducts` |
| 2 | Legacy product → **Delete** in admin | Same as inactive (deactivated, not hard-deleted) |
| 3 | Add legacy product to cart → checkout | Total = DB price; inactive → blocked |
| 4 | Change admin price → checkout again | New price applied |
| 5 | Tamper `unitPrice` in request | Server ignores; uses DB price |
| 6 | Product in favorites while active → then inactive | Favorite UI should not present as buyable (after C5) |
| 7 | Static-only SKU (no DB row) in cart | Clear error OR successful checkout per C6 policy |

---

## Recommended order of work

1. **QA C1–C4** using the checklist above (blocks calling criticals “done”).  
2. **C5** — Remove `findStoreProductSplit` from customer-facing paths.  
3. **C6** — Decide static-only policy; run DB seed/import for all sellable ids.  
4. **C2 completion** — Tombstone table or admin UX that never implies hard delete removes static listings.

---

## Key files (quick index)

```
server/routes/publicCatalog.js      # active products + suppressedStorefrontIds
server/routes/adminProducts.js      # delete → deactivate for legacy_override_id
server/lib/orders.js                # reprice by dbId / legacy_override_id
src/context/CatalogContext.tsx      # fetch + suppression + stale guard
src/data/productLookup.ts           # registerSuppressedStorefrontIds
src/lib/catalogProduct.ts           # buildStorefrontCatalog
src/pages/ProductDetail.tsx         # PDP visibility gate
src/pages/Checkout.tsx              # cart payload dbId
src/context/CartContext.tsx         # CartProduct.dbId
```

---

## Related documentation

- `CATALOG_STOREFRONT_CRITICAL_AUDIT.md` — full critical/high/medium/low audit  
- `STOREFRONT_COMMERCE.md` — merge rules (may predate suppression)  
- `AGENT_HANDOFF_STOREFRONT.md` — architecture handoff  
- `specs/ADMIN_SYSTEM_SPEC.md` — admin API reference
