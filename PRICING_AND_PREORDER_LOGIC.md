# Product Pricing and Pre-order Logic

## Overview

This document describes the pricing validation and display logic for products, with special handling for pre-order items.

## Pricing Rules

### 1. General Pricing
- Products can have a price of **$0.00 or greater**
- Price must be a valid finite number
- Price cannot be negative

### 2. Pre-order Specific Rules
- **Pre-order products CANNOT have a price of zero**
- If a product is marked as pre-order (`isPreorder: true`), it must have `price > 0`
- This validation is enforced in both:
  - Frontend: `AdminProductEditor.tsx` (line ~275)
  - Backend: `adminProducts.js` `validateProductPayload` function (line ~118)

## Display Logic

### Storefront Display Rules

The storefront follows these rules for displaying product prices:

#### Rule 1: Pre-order with Zero Price
**IF** `isPreorder === true` **AND** `price === 0`
**THEN** Display: `"Pre-order"` (text only, no price shown)

**Note:** Due to validation, this scenario should not occur in practice, but the UI is prepared for it.

#### Rule 2: All Other Cases
**ELSE** Display: `"$X.XX"` (formatted price)

This applies to:
- Regular products (pre-order or not) with price > 0
- Pre-order products with any price > 0

### Implementation Files

The display logic is implemented in:

1. **`src/components/ProductCard.tsx`** (line ~170)
   - Product cards in listings/grids
   ```tsx
   {isPreorder && Number(price) === 0 ? (
     <p className="text-primary">Pre-order</p>
   ) : (
     <p>${typeof price === "string" ? price : price.toFixed(2)}</p>
   )}
   ```

2. **`src/pages/ProductDetail.tsx`** (multiple locations)
   - Main price display (line ~811)
   - Variant price display (line ~958)
   - Bundle main product display (line ~1470)
   - Bundle item display (line ~1526)
   - Helper function `formatPrice` (line ~180)

## Validation

### Frontend Validation (`AdminProductEditor.tsx`)

Located in the `save` function (line ~267):

```typescript
const priceStr = String(form.price).trim();
const priceNum = Number(priceStr);

// Check price is valid (0 or greater)
if (priceStr === "" || isNaN(priceNum) || priceNum < 0) {
  toast({ 
    variant: "destructive", 
    title: "Valid price is required (must be 0 or greater)" 
  });
  return;
}

// Pre-order products cannot have zero price
if (form.isPreorder && priceNum === 0) {
  toast({ 
    variant: "destructive", 
    title: "Pre-order products cannot have a zero price" 
  });
  return;
}
```

### Backend Validation (`adminProducts.js`)

Located in `validateProductPayload` function (line ~115):

```javascript
function validateProductPayload(c) {
  const errors = [];
  
  if (!c.name) errors.push('name is required');
  
  // Price must be valid and >= 0
  if (c.price == null || !Number.isFinite(Number(c.price)) || Number(c.price) < 0) {
    errors.push('valid price is required');
  }
  
  // Pre-order products must have a price greater than zero
  if (c.is_preorder && Number(c.price) === 0) {
    errors.push('pre-order products cannot have a zero price');
  }
  
  if (!c.category) errors.push('category is required');
  
  if (c.compare_at_price != null && Number(c.compare_at_price) <= Number(c.price)) {
    errors.push('compare_at_price must be greater than price when set');
  }
  
  return errors;
}
```

## User Feedback

### Admin Panel
When attempting to save a product with invalid pricing:

- **Empty or negative price:** "Valid price is required (must be 0 or greater)"
- **Pre-order with zero price:** "Pre-order products cannot have a zero price"

### Storefront
- Pre-order products with zero price (if they exist) show "Pre-order" text in primary color
- All other products show their price in the standard gradient color scheme

## Testing Checklist

- [ ] Create a regular product with price = $0.00 → Should succeed
- [ ] Create a regular product with price > $0.00 → Should succeed
- [ ] Create a pre-order product with price = $0.00 → Should fail with error message
- [ ] Create a pre-order product with price > $0.00 → Should succeed
- [ ] Verify storefront displays "Pre-order" for any pre-order items with $0.00 price
- [ ] Verify storefront displays "$X.XX" for all products with price > $0.00
- [ ] Edit existing product: Change from regular to pre-order with $0.00 → Should fail
- [ ] Edit existing product: Change from regular to pre-order with price > $0.00 → Should succeed

## Edge Cases Handled

1. **String vs Number Price:** Price can be stored as either string or number. The code uses `Number(price)` for safe conversion before comparison.

2. **Floating Point Comparison:** Uses strict equality (`=== 0`) after Number conversion, which is safe for zero comparison.

3. **Missing Price Field:** Both frontend and backend check for `null`, `undefined`, empty string, and `NaN` cases.

4. **Price Display Formatting:** The `formatPrice` helper function handles both string and numeric price types consistently.

## Summary

The pricing and pre-order logic ensures:
- Admins have flexibility to set zero prices for regular products (e.g., free promotional items)
- Pre-order products always have a meaningful price (> $0.00)
- Storefront clearly indicates pre-order status when applicable
- Validation is enforced at both frontend (UX) and backend (security) layers
