# Storefront Commerce Architecture

Frontend commerce layer for KHA Mobile: pricing, catalog, cart policy, checkout.

## Modules

| Module | Role |
|--------|------|
| `src/lib/storefrontPricing.ts` | `resolveSalePrice`, `getCardPricePresentation`, `getPdpPricePresentation`, `formatMoney` |
| `src/lib/addToCartPolicy.ts` | When to show picker vs redirect to PDP; OOS and multi-color rules |
| `src/lib/catalogProduct.ts` | `buildStorefrontCatalog()` → `StorefrontProduct[]` (static + API + Green Lion) |
| `src/lib/catalogFilters.ts` | Category path resolve, `filterByCategoryPage`, shared sort |
| `src/lib/stockStatus.ts` | PDP stock badge copy |
| `src/data/rechargeCatalog.ts` | Recharge / Alfa SKUs for Recharges + Checkout |
| `src/lib/couponApi.ts` | `POST /api/public/validate-coupon` |

## Data flow

```
CatalogContext (storefrontProducts)
  → storefrontPricing → ProductCard / ProductDetail / list pages
  → addToCartPolicy → ProductCard / carousels (surface: grid | carousel | featured)
  → CartContext → Checkout (server re-prices + coupon)
```

## Catalog

- `CatalogContext` builds `storefrontProducts` once per `catalogTick`.
- API merge copies `variants`, `compareAtPrice`, `showPreorderPrice`, `stockQuantity` for all products including Green Lion (`id >= 5000`).
- `displayPrice` on each row is `resolveSalePrice(product)`.

## Checkout

- Coupons: UI applies code via `validateCouponCode`; `couponCode` sent on `submitOrder`.
- Server is authoritative; `PRICE_MISMATCH` / `OUT_OF_STOCK` refresh catalog and show toast.
- Recharges: single catalog in `rechargeCatalog.ts` (retail sell price, not face value on card label).

## Verification

See `STOREFRONT_COMMERCE_STATUS.md` for Open/Fixed checklist.

## Future optional

Cart localStorage could store `{ id, variantKey, color, size, quantity }` only and resolve prices from `storefrontProducts` at render time (larger migration; not required for pricing accuracy today because checkout re-prices server-side).
