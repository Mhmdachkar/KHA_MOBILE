# Catalog & Storefront — Critical Issues Audit

**Date:** 2026-05-17  
**Scope:** Deep code review of admin product save → public catalog → category pages, and parallel flows (PDP, cart, checkout, Home).  
**Method:** Static analysis of production paths (not runtime instrumentation). Recent fixes to catalog refresh and category normalization are noted where they reduce but do not eliminate underlying issues.

---

## Executive summary

| Severity | Count |
|----------|------:|
| Critical | 4 |
| High | 8 |
| Medium | 6 |
| Low | 3 |

The **highest business risk** is a split between **database truth** (admin + orders) and **storefront truth** (static TypeScript catalog + active API merge). Admin can deactivate or delete a DB row while the storefront still shows the static product. Separately, **checkout repricing** looks up products by Postgres `id`, but the cart sends **storefront `id`** (`legacy_override_id` when set), so most overridden SKUs skip server price and `is_active` enforcement.

---

## Files scanned (similar feature surface)

| Area | Paths |
|------|--------|
| Catalog provider | `src/context/CatalogContext.tsx` |
| API merge | `src/data/productLookup.ts`, `src/lib/catalogProduct.ts` |
| Category routing/filter | `src/lib/catalogFilters.ts`, `src/lib/storefrontCategories.ts` |
| Category UI | `src/pages/CategoryPage.tsx`, `src/pages/Accessories.tsx`, `src/pages/Products.tsx` |
| PDP / Home | `src/pages/ProductDetail.tsx`, `src/pages/Home.tsx` |
| Recommendations | `src/components/PersonalizedRecommendations.tsx` |
| Admin | `src/pages/admin/AdminProductEditor.tsx`, `src/pages/admin/AdminProductList.tsx` |
| Public API | `server/routes/publicCatalog.js` |
| Admin API | `server/routes/adminProducts.js` |
| Mapping | `server/lib/productMapper.js`, `server/lib/storefrontCategories.js` |
| Orders | `server/lib/orders.js`, `src/pages/Checkout.tsx` |

---

## Critical

### C1 — Inactive legacy overrides still visible on storefront

**Where:** `buildStorefrontCatalog()` in `src/lib/catalogProduct.ts` (L201–235), `getProductFromApiById` in `src/data/productLookup.ts`, `publicCatalog.js` (`WHERE is_active = true`).

**What happens:** Public API omits inactive rows. Merge always seeds **static** products first; API only overlays matching ids. If a row with `legacy_override_id` is set inactive, it disappears from the API map and the **static fallback is shown again**.

**Reproduce:** Admin → edit product with static override ID → set **Inactive** → save → open `/product/{legacyId}` or category page. Product still appears with static price/images.

**Fix direction:** Tombstone set of inactive override ids from admin API, or second query for inactive overrides to suppress static ids; PDP must not use `findStoreProductSplit` when override is inactive.

---

### C2 — Admin DELETE does not remove storefront listing for static-backed products

**Where:** `DELETE` in `server/routes/adminProducts.js` (L399–405); same merge as C1.

**What happens:** Deleting the DB row does not remove bundled static catalog entries. Storefront continues to list the product at the legacy storefront id.

**Reproduce:** Delete an overridden product in admin → still on category grid and PDP.

**Fix direction:** Document as “hide via inactive” only, or implement explicit suppress list / soft-delete flag consumed by `buildStorefrontCatalog`.

---

### C3 — Checkout repricing uses DB primary key; cart sends storefront id

**Where:** `repriceItems()` in `server/lib/orders.js` (L152–183); `storefrontIdFromRow()` in `server/lib/productMapper.js` (L6–9).

**What happens:** Cart `productId` is storefront id (`legacy_override_id` when set). SQL uses `WHERE id = ANY($1)` (Postgres PK). No match → server **trusts client `unitPrice`** and logs a warning (L177–183).

**Reproduce:** Add a static/legacy product (e.g. storefront id 127) to cart; change price in admin or tamper payload at checkout → order may complete at wrong price.

**Fix direction:** Resolve by `legacy_override_id` OR send `dbId` in cart lines; reject product checkout when DB row missing.

---

### C4 — `is_active` / stock checks bypassed for legacy storefront ids at checkout

**Where:** Same as C3 — `PRODUCT_INACTIVE` only when `productMap.get(it.productId)` hits (L185–189).

**What happens:** Inactive DB products tied to legacy ids never hit the map → checkout proceeds with client price (combines with C1).

**Reproduce:** Deactivate legacy product (C1), add to cart from PDP, complete checkout.

**Fix direction:** Same as C3; optionally fail closed for `checkoutType === 'product'` when id not found in DB.

---

## High

### H1 — PDP uses `findStoreProductSplit` before unified catalog visibility

**Where:** `src/pages/ProductDetail.tsx` (L43–67).

**What happens:** Product page loads from static/API split even when `catalogRow` is missing or product should be hidden (C1). User can view and add to cart.

**Fix direction:** Gate on `getStorefrontProductById(storefrontProducts, id)`; 404 if absent.

---

### H2 — Home trending uses `getProductsByCategoryMerged` (not `storefrontProducts`)

**Where:** `src/pages/Home.tsx` (L429–453).

**What happens:** Trending carousels use **regular-only** merged static helpers. Omits API-only products and Green Lion paths that category pages show via `filterByCategoryPage(storefrontProducts, …)`.

**Reproduce:** Compare Home “Audio” / curated IDs vs `/audio` after adding API-only or Green Lion SKU.

**Fix direction:** Use `useCatalog().storefrontProducts` + `filterByCategoryPage` / same sort as `CategoryPage`.

---

### H3 — Two category filter implementations diverge

**Where:** `getProductsByCategoryMerged` in `src/data/productLookup.ts` (L213–229) vs `matchesStorefrontCategory` in `src/lib/catalogFilters.ts` (L86–168).

**What happens:** Merged helper matches `category` / `secondaryCategories` only. Category pages add **name heuristics** (e.g. phone accessory + “cable” → Charging; Accessories exclusions).

**Reproduce:** Product with `category: "Phone Accessories"` may appear on `/audio` via filters but not in Home merged list.

**Fix direction:** Single filter: `matchesStorefrontCategory` everywhere.

---

### H4 — Stale catalog race (overlapping `refreshCatalog`)

**Where:** `src/context/CatalogContext.tsx` (mount, visibility, BroadcastChannel); `CategoryPage.tsx` / `Accessories.tsx` also call `refreshCatalog` on mount.

**What happens:** No request sequencing or abort. Slow overlapping responses can apply **older** data to `lastApiProductsRef` (last-write-wins).

**Mitigation already added:** Keep last good API snapshot on failure (does not fix ordering).

**Fix direction:** Monotonic request id or `AbortController`; ignore stale responses.

---

### H5 — Bulk `change_category` skips category normalization

**Where:** `server/routes/adminProducts.js` (L407–415) vs `bodyToRowColumns` in `productMapper.js` (normalized category).

**What happens:** Bulk writes raw `value.trim()`. Typos like `smartphones` persist until read through mapper on public API only.

**Reproduce:** Bulk change category to `smartphones` → admin list filter `category === "Smartphones"` may miss rows.

**Fix direction:** `normalizeStorefrontCategory(value)` in bulk handler.

---

### H6 — Category alias `case` / `cases` → `iPhone Cases`

**Where:** `src/lib/storefrontCategories.ts` (L78–82), `server/lib/storefrontCategories.js`.

**What happens:** Generic “case” / “cases” normalize to **iPhone Cases**, not Accessories.

**Reproduce:** Admin saves category `Cases` for a generic case → wrong category page.

**Fix direction:** Remove broad aliases; keep `iphone case(s)` only.

---

### H7 — Admin list category filter missing **iPhone Cases**

**Where:** `src/pages/admin/AdminProductList.tsx` (L32) vs `CANONICAL_STOREFRONT_CATEGORIES` in editor.

**What happens:** Cannot filter admin list to iPhone Cases only (except search / All).

**Fix direction:** Align `CATEGORIES` with canonical list.

---

### H8 — Gaming category page defaults brand filter to Sony

**Where:** `src/pages/CategoryPage.tsx` (L164–170).

**What happens:** Opening `/gaming` sets `selectedSmartphoneBrand` to `"Sony"`, hiding non-Sony gaming products until user resets filter.

**Reproduce:** Open `/gaming` with mixed catalog → fewer products than expected.

**Fix direction:** Default `"All"`; optional Sony highlight without filtering.

---

## Medium

### M1 — Redundant parallel catalog fetches

**Where:** `CatalogContext` + per-page `refreshCatalog` on `CategoryPage` / `Accessories`.

**Impact:** Extra API load, possible flicker, worsens H4.

**Fix direction:** Centralize refresh in provider; pages rely on `catalogLoaded` / `catalogTick`.

---

### M2 — Accessories charging sub-tab: bare `usb` in name

**Where:** `matchesAccessoriesSubTab` in `src/lib/catalogFilters.ts` (L456–474).

**Impact:** Non-charging products with “usb” in name appear under Charging tab.

---

### M3 — `mapApiToGreenLion` omits `isActive` (regular path sets it)

**Where:** `src/data/productLookup.ts` (L97–127 vs L130–155).

**Impact:** Future client checks on `isActive` in lookup layer wrong for Green Lion rows.

---

### M4 — `isGreenLionProduct` id heuristic (`id >= 5000`)

**Where:** `src/lib/catalogProduct.ts` (L238–244).

**Impact:** API-only products with high numeric ids may be sorted/treated as Green Lion incorrectly.

---

### M5 — `BroadcastChannel` created per publish without `close`

**Where:** `src/context/CatalogContext.tsx` (`broadcastCatalogUpdate`).

**Impact:** Minor leak on heavy admin save sessions.

---

### M6 — `allProducts.ts` / legacy helpers still used in some paths

**Where:** `src/data/allProducts.ts` uses `getProductsByCategoryMerged`.

**Impact:** Any remaining imports bypass unified catalog (grep before refactor).

---

## Low

### L1 — Dead `Gaming.tsx` wrapper vs `App.tsx` routes

**Where:** `src/pages/Gaming.tsx`, `src/App.tsx` routes `/gaming` → `CategoryPage` directly.

**Impact:** Confusing for maintainers; risk if old import reintroduced.

---

### L2 — `Home.tsx` trending `useMemo` deps omit `storefrontProducts`

**Where:** `src/pages/Home.tsx` (L451) — depends on `catalogTick` but not unified catalog.

**Impact:** Less relevant until H2 fixed.

---

### L3 — Public vs admin stats `is_active` semantics

**Where:** `publicCatalog.js` strict `true` vs stats `COALESCE(is_active, true)`.

**Impact:** Low unless NULL legacy rows exist.

---

## Already improved (recent work — not fully closed)

| Change | Addresses | Does not fix |
|--------|-----------|----------------|
| `lastApiProductsRef` on failed refresh | Transient API failure wiping catalog | C1, C2, C3 |
| `normalizeStorefrontCategory` on save/read | Many category typos | H6 broad aliases, H5 bulk |
| `BroadcastChannel` catalog sync | Multi-tab staleness | H4 ordering |
| Category page `refreshCatalog` on navigation | Fresh data when opening category | C1, C2, H2 |
| Admin analytics / sidebar DB stats | Separate concern | Catalog merge |

---

## Recommended fix priority

1. **C1 + C2 + H1** — Single visibility model: inactive/deleted overrides hide static; PDP/cart use `storefrontProducts` only.  
2. **C3 + C4** — Order repricing by `legacy_override_id` or cart `dbId`.  
3. **H2 + H3** — One catalog + one filter for Home, category pages, recommendations.  
4. **H5, H6, H7** — Admin category consistency.  
5. **H4, M1** — Fetch deduplication and stale-guard.  
6. **H8** — Gaming default filter UX.

---

## Verification checklist (QA)

1. Create product with `legacy_override_id` → deactivate → confirm absent on `/smartphones` and PDP.  
2. Delete same product → confirm absent on storefront.  
3. Add legacy-id product to cart → checkout → confirm server price matches DB, inactive blocked.  
4. Compare Home trending vs `/audio` for same API-only SKU.  
5. Open `/gaming` — confirm default shows all brands, not Sony-only.  
6. Bulk-change category to typo → confirm admin filter and category page behavior.

---

## Related docs

- `STOREFRONT_COMMERCE.md` — merge rules (may be partially outdated vs this audit)  
- `specs/ADMIN_SYSTEM_SPEC.md` — admin API reference  
- `AGENT_HANDOFF_STOREFRONT.md` — storefront architecture
