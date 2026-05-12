/**
 * Map DB row <-> API JSON (camelCase for frontend).
 * Storefront `id` uses legacy_override_id when set so /product/:id URLs stay stable.
 */

export function storefrontIdFromRow(row) {
  if (row.legacy_override_id != null) return Number(row.legacy_override_id);
  return Number(row.id);
}

function normalizeGallery(primary, gallery) {
  const g = Array.isArray(gallery) ? gallery : [];
  const merged = [primary, ...g].filter(Boolean);
  return [...new Set(merged)];
}

export function rowToPublicProduct(row) {
  const primary = row.primary_image_url;
  const gallery = normalizeGallery(primary, row.gallery_images);
  const images = gallery.length > 1 ? gallery : gallery.length === 1 ? [gallery[0]] : [];

  return {
    id: storefrontIdFromRow(row),
    dbId: Number(row.id),
    legacyOverrideId: row.legacy_override_id != null ? Number(row.legacy_override_id) : null,
    name: row.name,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    image: primary,
    images: images.length > 0 ? images : [primary],
    rating: Number(row.rating),
    category: row.category,
    brand: row.brand || undefined,
    video: row.video_url || undefined,
    isPreorder: row.is_preorder,
    isActive: row.is_active,
    features: row.features || [],
    specifications: row.specifications || [],
    variants: row.variants || [],
    colors: row.colors || [],
    sizes: row.sizes || [],
    connectivityOptions: row.connectivity_options || [],
    secondaryCategories: row.secondary_categories || [],
  };
}

export function bodyToRowColumns(body) {
  const b = body || {};
  return {
    legacy_override_id: b.legacyOverrideId ?? b.legacy_override_id ?? null,
    name: b.name,
    title: b.title ?? b.name,
    description: b.description ?? '',
    price: b.price,
    primary_image_url: b.primaryImageUrl ?? b.primary_image_url ?? b.image,
    rating: b.rating ?? 4.5,
    category: b.category,
    brand: b.brand ?? null,
    video_url: b.videoUrl ?? b.video_url ?? b.video ?? null,
    is_preorder: b.isPreorder ?? b.is_preorder ?? false,
    is_active: b.isActive ?? b.is_active ?? true,
    features: b.features ?? [],
    specifications: b.specifications ?? [],
    variants: b.variants ?? [],
    colors: b.colors ?? [],
    sizes: b.sizes ?? [],
    connectivity_options: b.connectivityOptions ?? b.connectivity_options ?? [],
    secondary_categories: b.secondaryCategories ?? b.secondary_categories ?? [],
    gallery_images: b.galleryImages ?? b.gallery_images ?? [],
  };
}
