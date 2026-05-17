# UX/Functional Fixes Summary

**Session Date**: May 16, 2026
**Focus**: Product variant, image, and cart UX issues (de-prioritizing security/performance per user request)

---

## Completed Fixes (5 Issues)

### Bug 1: Variant Selection Visual Contrast
**File**: `src/pages/ProductDetail.tsx`
**Problem**: All variant cards appeared visually similar — the active state (`bg-primary/5`) was too subtle to distinguish from unselected.
**Fix**: 
- Changed active state from `border-primary bg-primary/5` to `border-2 border-primary bg-primary/10 shadow-md ring-2 ring-primary/30`
- Added a small checkmark icon in the top-right corner of the selected variant
- Made selected variant label text primary-colored for additional emphasis
- Unselected variants now have neutral gray appearance with subtle hover

### Bug 2: Uploaded Images Not Showing on Storefront
**File**: `server/lib/productMapper.js`
**Problem**: Color and variant images stored in JSONB columns (`colors`, `variants`, `sizes`) were passed through raw as relative paths (`/uploads/xxx.png`). These resolved against the frontend origin instead of the API server, causing 404s.
**Root Cause**: `rowToPublicProduct()` expanded URLs for `primary_image_url` and `gallery_images`, but JSONB nested images were not processed.
**Fix**: 
- Added `expandJsonbImages()` helper function that walks arrays and expands any `image` property URLs using `expandMediaUrlForPublicClient()`
- Applied this to `colors`, `variants`, and `sizes` columns in `rowToPublicProduct()`
- Backend tests: All 61 tests pass

### Bug 3: Add-to-Cart Without Variant Selection
**Files**: 
- `src/components/ProductCard.tsx` (new variant picker overlay)
- `src/pages/Products.tsx` (pass variants prop)
- `src/pages/CategoryPage.tsx` (pass variants prop)
- `src/components/ThisWeeksFavorites.tsx` (redirect to product page for variants)

**Problem**: When users clicked the cart icon on a product card with multiple variants, it added the product at the base price with no variant information — wrong price and missing variant label.

**Fix**:
- Added `variants?: ProductVariant[]` prop to `ProductCard`
- When cart button is clicked on a product with variants, a professional inline variant picker overlay appears
- User selects a variant from the overlay, then it adds to cart with correct variant price, key, and label
- For `ThisWeeksFavorites` (featured cards), clicking "Add to Cart" on a multi-variant product redirects to the product detail page instead of showing a picker (cleaner UX for featured section)

### Bug 4: Cart Dashboard Missing Size Parameter
**File**: `src/components/CartDashboard.tsx`
**Problem**: The `removeFromCart` and `updateQuantity` calls were missing the `size` parameter. Products with different sizes couldn't be independently managed because `isSameCartItem()` checks size for uniqueness.

**Fix**: Added `item.size` parameter to all three cart operation calls:
- `removeFromCart(item.id, item.variantKey, item.color, item.size)`
- `updateQuantity(item.id, item.quantity - 1, item.variantKey, item.color, item.size)`
- `updateQuantity(item.id, item.quantity + 1, item.variantKey, item.color, item.size)`

### Bug 5: Color/Size Selection Visual Contrast
**File**: `src/pages/ProductDetail.tsx`
**Problem**: Color and size selectors had the same subtle `bg-primary/5` active state as the variant selector (before Bug 1 fix).

**Fix**: Applied the same stronger visual contrast improvements:
- Active: `border-2 border-primary bg-primary/10 text-primary ring-2 ring-primary/30 font-semibold shadow-sm`
- Inactive: `border border-border hover:border-primary/40 text-muted-foreground hover:bg-muted/30`

---

## Deferred Work (Per User Request)

The following items from the PRD triage were explicitly **de-prioritized** by the user to focus on the UX/functional issues above:

### Phase 1: Security Hardening
- P0-02: JWT secret hardening
- P0-04: Rate limiting
- P1-03: `is_active` check on products
- P1-10: Failed login audit logging
- P1-04: CORS credentials

### Phase 3: UX/Data
- P1-06: Categories management
- P1-07: Price validation UI
- P2-07: Image validation
- P2-03: Currency utility
- P2-11: Cache headers

### Phase 4: Admin UX
- P2-01/P2-12: Monolith splits
- P2-05/P2-06: Dashboard + analytics
- P2-09: Soft-delete
- P2-08: Audit improvements

### Phase 5: Polish
- P3 items deferred

**Reference**: See `specs/PRD_TRIAGE.md` for full details on these deferred items.

---

## Testing Recommendations

1. **Backend**: `npm run test:server` — All 61 tests pass ✓
2. **Frontend**: `npx vitest run` — Run to verify no regressions
3. **Manual verification**:
   - Upload a product with color/variant images via admin → verify images appear on storefront
   - Click cart icon on a product card with variants → verify variant picker appears and adds correct variant
   - On product detail page → verify variant/color/size selection visual contrast is clear
   - Add multiple items with different sizes to cart → verify each can be independently removed/updated

---

## Phase 2 consolidation (May 2026)

| Area | Verified in repo |
|------|------------------|
| `catalogFilters.ts` + CategoryPage on `storefrontProducts` | Yes |
| Header search uses unified catalog | Yes |
| PersonalizedRecommendations / ThisWeeksFavorites pricing | Yes |
| Products “newest” sort uses `dbId` | Yes |
| PDP sticky mobile buy bar + Home Recently viewed | Yes |

See `STOREFRONT_COMMERCE.md` and `STOREFRONT_COMMERCE_STATUS.md`.

---

## Next Steps

The user's current priority is UX/functional fixes. The next batch of work should be determined by the user based on:
- Testing results from the fixes above
- Any new UX issues discovered during testing
- When ready, return to the phased implementation plan in `specs/PRD_TRIAGE.md` (starting with Phase 1 Security)
