# Logging Guide

## Overview
Comprehensive logging has been added throughout the admin panel and API to help diagnose issues.

## Frontend Logging (Browser Console)

### Admin Product Editor (`AdminProductEditor.tsx`)
- `[AdminProductEditor] Loading product` - When loading an existing product
- `[AdminProductEditor] Product loaded successfully` - Product data fetched
- `[AdminProductEditor] Uploading file` - File upload started
- `[AdminProductEditor] Upload successful` - File uploaded, shows URL
- `[AdminProductEditor] Starting save` - Save button clicked
- `[AdminProductEditor] Save successful` - Product created/updated
- `[AdminProductEditor] Validation errors` - Form validation failed
- All errors are logged with `[AdminProductEditor]` prefix

### Admin Product List (`AdminProductList.tsx`)
- `[AdminProductList] Loading admin products` - Loading product list
- `[AdminProductList] Loaded X products` - Products loaded successfully
- `[AdminProductList] Deleting product` - Delete action started
- `[AdminProductList] Product deleted successfully` - Delete completed
- `[AdminProductList] Bulk action` - Bulk operation started
- All errors are logged with `[AdminProductList]` prefix

### Catalog Context (`CatalogContext.tsx`)
- `[CatalogContext] Refreshing catalog` - Public catalog refresh started
- `[CatalogContext] Loaded X products from API` - Products fetched
- `[CatalogContext] Catalog refresh complete` - Refresh completed
- All errors are logged with `[CatalogContext]` prefix

## Backend Logging (Server Console)

### Upload Endpoint
- `[Upload] File uploaded: filename, size, type` - Successful upload
- `[Upload] Generated URL: ...` - Shows the URL returned to client
- `[Upload] Error: ...` - Upload failures

### Product Creation
- `[Create Product] Request from: email, Product name: ...` - New product request
- `[Create Product] Success, ID: X, Name: ...` - Product created
- `[Create Product] Validation errors: [...]` - Invalid data
- `[Create Product] Error: ...` - Database or server errors

### Product Update
- `[Update Product] Request from: email, Product ID: X` - Update request
- `[Update Product] Success, ID: X, Name: ...` - Product updated
- `[Update Product] Validation errors: [...]` - Invalid data
- `[Update Product] Error: ...` - Database or server errors

### Public Catalog
- `[Public Catalog] Fetching active products` - Storefront catalog request
- `[Public Catalog] Found X active products` - Products returned
- `[Public Catalog] Error: ...` - Fetch failures

## Success/Error Notifications

### Success Messages (Green Toast)
- ✓ Product created successfully - Shows when new product is saved
- ✓ Changes saved successfully - Shows when existing product is updated  
- ✓ Deleted successfully - Shows when product is deleted
- ✓ Done — X product(s) [action] - Shows for bulk actions

### Error Messages (Red Toast)
- Validation failed - Form data is invalid
- Create/Update failed - Server rejected the request
- Upload failed - Image upload error
- Delete failed - Deletion error
- Bulk action failed - Bulk operation error

## How to Debug Issues

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Perform the action** (save product, upload image, etc.)
4. **Look for log messages** with relevant prefix
5. **Check for error messages** in red

For server issues:
1. **Check server console** where you run `npm run dev`
2. **Look for error logs** with contextual information
3. **Database errors show code** (e.g., `Code: 23505` for duplicates)

## Common Error Codes

- `400` - Bad request (validation error)
- `401` - Unauthorized (login expired)
- `404` - Not found
- `409` - Conflict (duplicate entry)
- `500` - Server error
- `503` - Service unavailable (DB schema mismatch)

Database codes:
- `23505` - Duplicate key violation
- `42703` - Undefined column (missing schema migration)
- `22001` - String too long
- `23514` - Check constraint violation
