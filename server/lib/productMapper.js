/**
 * Map DB row <-> API JSON (camelCase for frontend).
 * Storefront `id` uses legacy_override_id when set so /product/:id URLs stay stable.
 */

export function storefrontIdFromRow(row) {
  if (row.legacy_override_id != null) return Number(row.legacy_override_id);
  return Number(row.id);
}

/** Collapse `https://host/uploads/x` → `/uploads/x` so DB stays host-agnostic. */
function stripToUploadPath(url) {
  if (url == null || url === '') return url;
  const s = String(url).trim();
  const m = s.match(/(\/uploads\/[^?#]+)/);
  if (m) return m[1];
  return s;
}

function stripGalleryUrls(gallery) {
  if (!Array.isArray(gallery)) return [];
  return gallery
    .map((x) => (typeof x === 'string' ? stripToUploadPath(x) : x))
    .filter((x) => x != null && x !== '');
}

/**
 * Public JSON: make upload paths absolute using API_PUBLIC_URL when set
 * (Netlify storefront + Render API).
 * 
 * IMPORTANT: Always returns full URLs for /uploads/ paths so storefront can load them.
 */
function expandMediaUrlForPublicClient(url, req) {
  if (url == null || url === '') return '';
  const s = String(url).trim();
  if (!s) return '';
  
  // If already a full URL
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (u.pathname.startsWith('/uploads/')) {
        const base = process.env.API_PUBLIC_URL?.replace(/\/$/, '');
        if (base) return `${base}${u.pathname}${u.search}`;
        // Fallback: use request origin
        if (req) {
          const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
          const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3001';
          return `${proto}://${host}${u.pathname}${u.search}`;
        }
      }
      return s;
    } catch {
      return s;
    }
  }
  
  // Relative path - convert to full URL
  const path = s.startsWith('uploads/') ? `/${s}` : s.startsWith('/') ? s : `/${s}`;
  if (path.startsWith('/uploads/')) {
    const base = process.env.API_PUBLIC_URL?.replace(/\/$/, '');
    if (base) return `${base}${path}`;
    
    // Fallback: build from request if available
    if (req) {
      const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
      const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3001';
      return `${proto}://${host}${path}`;
    }
  }
  return s;
}

function expandJsonbImages(arr, req) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (item == null || typeof item !== 'object') return item;
    const copy = { ...item };
    if (copy.image) copy.image = expandMediaUrlForPublicClient(copy.image, req);
    return copy;
  });
}

function normalizeGallery(primary, gallery) {
  const g = Array.isArray(gallery) ? gallery : [];
  const merged = [primary, ...g].filter(Boolean);
  return [...new Set(merged)];
}

export function rowToPublicProduct(row, req) {
  const primaryRaw = row.primary_image_url;
  const primary = expandMediaUrlForPublicClient(primaryRaw, req);
  const gallery = normalizeGallery(primaryRaw, row.gallery_images).map(url => expandMediaUrlForPublicClient(url, req));
  const images = gallery.length > 1 ? gallery : gallery.length === 1 ? [gallery[0]] : [];

  return {
    id: storefrontIdFromRow(row),
    dbId: Number(row.id),
    legacyOverrideId: row.legacy_override_id != null ? Number(row.legacy_override_id) : null,
    name: row.name,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    image: primary,
    images: images.length > 0 ? images : [primary],
    rating: Number(row.rating),
    category: row.category,
    brand: row.brand || undefined,
    video: row.video_url || undefined,
    isPreorder: row.is_preorder,
    showPreorderPrice: row.show_preorder_price !== false,
    isActive: row.is_active,
    features: row.features || [],
    specifications: row.specifications || [],
    variants: expandJsonbImages(row.variants, req),
    colors: expandJsonbImages(row.colors, req),
    sizes: expandJsonbImages(row.sizes, req),
    connectivityOptions: row.connectivity_options || [],
    secondaryCategories: row.secondary_categories || [],
    stockQuantity: row.stock_quantity != null ? Number(row.stock_quantity) : null,
  };
}

function finiteOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** When not pre-order, always true (ignored on storefront). When pre-order, default show price. */
function preorderShowPriceFromBody(b) {
  const pre = Boolean(b?.isPreorder ?? b?.is_preorder);
  if (!pre) return true;
  const v = b?.showPreorderPrice ?? b?.show_preorder_price;
  if (v === false || v === 'false' || v === 0 || v === '0') return false;
  return true;
}

export function bodyToRowColumns(body) {
  const b = body || {};
  const legacyRaw = b.legacyOverrideId ?? b.legacy_override_id ?? null;
  const legacy =
    legacyRaw === null || legacyRaw === undefined || legacyRaw === ''
      ? null
      : finiteOrNull(legacyRaw);

  const rawRating = Number(b.rating ?? 4.5);
  const rating = Number.isFinite(rawRating)
    ? Math.min(5, Math.max(0, rawRating))
    : 4.5;

  const rawPrimary = b.primaryImageUrl ?? b.primary_image_url ?? b.image ?? '';
  const primary_image_url =
    typeof rawPrimary === 'string' ? stripToUploadPath(rawPrimary) : rawPrimary;

  const rawGallery = b.galleryImages ?? b.gallery_images ?? [];
  const gallery_images = stripGalleryUrls(Array.isArray(rawGallery) ? rawGallery : []);

  return {
    legacy_override_id: legacy,
    name: b.name,
    title: b.title ?? b.name,
    description: b.description ?? '',
    price: finiteOrNull(b.price),
    compare_at_price: (b.compareAtPrice != null && b.compareAtPrice !== '')
      ? finiteOrNull(b.compareAtPrice)
      : finiteOrNull(b.compare_at_price ?? null),
    primary_image_url,
    rating,
    category: b.category,
    brand: b.brand ?? null,
    video_url: b.videoUrl ?? b.video_url ?? b.video ?? null,
    is_preorder: b.isPreorder ?? b.is_preorder ?? false,
    show_preorder_price: preorderShowPriceFromBody(b),
    is_active: b.isActive ?? b.is_active ?? true,
    features: b.features ?? [],
    specifications: b.specifications ?? [],
    variants: b.variants ?? [],
    colors: b.colors ?? [],
    sizes: b.sizes ?? [],
    connectivity_options: b.connectivityOptions ?? b.connectivity_options ?? [],
    secondary_categories: b.secondaryCategories ?? b.secondary_categories ?? [],
    gallery_images,
    stock_quantity:
      b.stockQuantity != null && b.stockQuantity !== ''
        ? finiteOrNull(b.stockQuantity)
        : finiteOrNull(b.stock_quantity ?? null),
  };
}
