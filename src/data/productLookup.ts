import type { Product } from "@/data/products";
import type { GreenLionProduct } from "@/data/greenLionProducts";
import { normalizeStorefrontVariants } from "@/lib/catalogProduct";
import {
  normalizeStorefrontCategory,
  normalizeSecondaryCategories,
} from "@/lib/storefrontCategories";
import { getProductById, getProductsByCategory } from "@/data/products";
import {
  getGreenLionProductById,
  getGreenLionProductsByCategory,
  greenLionProducts,
} from "@/data/greenLionProducts";

/** Shape returned by GET /api/public/products */
export type ApiPublicProduct = {
  id: number;
  dbId: number;
  legacyOverrideId: number | null;
  name: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  rating: number;
  category: string;
  brand?: string;
  video?: string;
  isPreorder?: boolean;
  isActive?: boolean;
  compareAtPrice?: number | null;
  /** When pre-order: if false, storefront hides the numeric price. */
  showPreorderPrice?: boolean;
  stockQuantity?: number | null;
  features: string[];
  specifications: Array<{ label: string; value: string }>;
  variants?: Product["variants"];
  colors?: Product["colors"];
  sizes?: Product["sizes"];
  connectivityOptions: string[];
  secondaryCategories: string[];
};

export type ApiHit = { kind: "regular" | "green"; product: Product | GreenLionProduct };

const apiByStorefrontId = new Map<number, ApiHit>();
let suppressedStorefrontIds = new Set<number>();

/** Inactive DB rows with legacy_override_id — hide matching static catalog entries. */
export function registerSuppressedStorefrontIds(ids: number[]) {
  suppressedStorefrontIds = new Set(ids.filter((id) => Number.isFinite(id)));
}

export function isStorefrontIdSuppressed(id: number): boolean {
  return suppressedStorefrontIds.has(id);
}

/** Seed SQL uses placehold.co URLs; keep real photos from the bundled static catalog until admin replaces them. */
export function isSeedPlaceholderImageUrl(url: string | undefined): boolean {
  if (url == null) return true;
  const s = String(url).trim();
  if (!s) return true;
  const low = s.toLowerCase();
  return low.includes("placehold.co") || low.includes("via.placeholder.com");
}

function shouldPreferStaticCatalogImage(url: string | undefined): boolean {
  return isSeedPlaceholderImageUrl(url);
}

/**
 * Admin editor / previews: use bundled static photos when the API row still has seed placeholders.
 */
export function resolvePrimaryImageWithStaticFallback(api: {
  id: number;
  image?: string;
  legacyOverrideId?: number | null;
}): string {
  const raw = api.image != null ? String(api.image) : "";
  if (!shouldPreferStaticCatalogImage(raw)) return raw;
  const legacy = api.legacyOverrideId;
  if (legacy != null) {
    const gl = getGreenLionProductById(legacy);
    if (gl?.images?.[0]) return gl.images[0];
  }
  const reg = getProductById(api.id);
  if (reg?.image != null && String(reg.image).trim() !== "") return String(reg.image);
  return raw;
}

function mergeRegularWithStaticImages(apiProduct: Product, staticPeer: Product): Product {
  return {
    ...apiProduct,
    image: staticPeer.image,
    images: staticPeer.images?.length ? staticPeer.images : [staticPeer.image],
  };
}

function mergeGreenWithStaticImages(apiProduct: GreenLionProduct, staticPeer: GreenLionProduct): GreenLionProduct {
  return {
    ...apiProduct,
    images: staticPeer.images?.length ? staticPeer.images : apiProduct.images,
  };
}

function firstNonEmptyImage(...candidates: (string | undefined | null)[]): string {
  for (const c of candidates) {
    const s = c != null ? String(c).trim() : "";
    if (s) return s;
  }
  return "";
}

function mapApiToProduct(p: ApiPublicProduct): Product {
  const primary = firstNonEmptyImage(p.image, ...(p.images ?? []));
  const rawImgs = (p.images?.length ? p.images : primary ? [primary] : []).filter(
    (u) => u != null && String(u).trim() !== ""
  );
  const images = rawImgs.length
    ? rawImgs.includes(primary)
      ? rawImgs
      : primary
        ? [primary, ...rawImgs]
        : rawImgs
    : primary
      ? [primary]
      : [];
  return {
    id: p.id,
    dbId: p.dbId,
    legacyOverrideId: p.legacyOverrideId,
    name: p.name,
    title: p.title,
    price: p.price,
    image: primary,
    images: images.length > 1 ? images : images.length === 1 ? [images[0]] : undefined,
    rating: p.rating,
    category: normalizeStorefrontCategory(p.category),
    brand: p.brand,
    description: p.description,
    features: p.features || [],
    specifications: p.specifications || [],
    variants: normalizeStorefrontVariants(p.variants),
    colors: p.colors?.length ? p.colors : undefined,
    sizes: p.sizes?.length ? p.sizes : undefined,
    connectivityOptions: p.connectivityOptions?.length ? p.connectivityOptions : undefined,
    secondaryCategories: p.secondaryCategories?.length
      ? normalizeSecondaryCategories(p.secondaryCategories)
      : undefined,
    video: p.video,
    isPreorder: p.isPreorder,
    showPreorderPrice: p.showPreorderPrice !== false,
    isActive: p.isActive,
    compareAtPrice: p.compareAtPrice ?? undefined,
    stockQuantity: p.stockQuantity ?? null,
  } as Product;
}

function mapApiToGreenLion(p: ApiPublicProduct): GreenLionProduct {
  const primary = firstNonEmptyImage(p.image, ...(p.images ?? []));
  const rawImgs = (p.images?.length ? p.images : primary ? [primary] : []).filter(
    (u) => u != null && String(u).trim() !== ""
  );
  const images = rawImgs.length
    ? rawImgs.includes(primary)
      ? rawImgs
      : primary
        ? [primary, ...rawImgs]
        : rawImgs
    : primary
      ? [primary]
      : [];
  return {
    id: p.id,
    dbId: p.dbId,
    legacyOverrideId: p.legacyOverrideId,
    name: p.name,
    title: p.title,
    price: typeof p.price === "number" ? p.price : Number(p.price),
    images,
    rating: p.rating,
    category: normalizeStorefrontCategory(p.category),
    brand: p.brand || "Green Lion",
    description: p.description,
    features: p.features || [],
    specifications: p.specifications || [],
    colors: p.colors?.length ? p.colors : undefined,
    variants: normalizeStorefrontVariants(p.variants),
    connectivityOptions: p.connectivityOptions?.length ? p.connectivityOptions : undefined,
    secondaryCategories: p.secondaryCategories?.length ? p.secondaryCategories : undefined,
    video: p.video,
    isPreorder: p.isPreorder,
    showPreorderPrice: p.showPreorderPrice !== false,
    compareAtPrice: p.compareAtPrice ?? undefined,
    stockQuantity: p.stockQuantity ?? null,
  } as GreenLionProduct;
}

/**
 * Replace / extend static catalog with rows from the API.
 * Call from CatalogProvider after GET /api/public/products.
 */
export function registerPublicApiProducts(rows: ApiPublicProduct[]) {
  apiByStorefrontId.clear();
  for (const p of rows) {
    const legacy = p.legacyOverrideId;
    const isGreen = legacy != null && getGreenLionProductById(legacy) !== undefined;
    if (isGreen) {
      const mapped = mapApiToGreenLion(p);
      const staticPeer = getGreenLionProductById(legacy!);
      const resolvedImage = firstNonEmptyImage(mapped.images?.[0], p.image);
      const product =
        staticPeer && shouldPreferStaticCatalogImage(resolvedImage)
          ? mergeGreenWithStaticImages(mapped, staticPeer)
          : mapped;
      apiByStorefrontId.set(p.id, { kind: "green", product });
    } else {
      const mapped = mapApiToProduct(p);
      const staticPeer = getProductById(p.id);
      const resolvedImage = firstNonEmptyImage(mapped.image, ...(mapped.images ?? []));
      const product =
        staticPeer && shouldPreferStaticCatalogImage(resolvedImage)
          ? mergeRegularWithStaticImages(mapped, staticPeer)
          : mapped;
      apiByStorefrontId.set(p.id, { kind: "regular", product });
    }
  }
}

export function getProductFromApiById(id: number): Product | null {
  const hit = apiByStorefrontId.get(id);
  if (hit && hit.kind === "regular") {
    return hit.product as Product;
  }
  return null;
}

export function findStoreProductSplit(id: number): {
  regularProduct: Product | null;
  greenLionProduct: GreenLionProduct | null;
} {
  const hit = apiByStorefrontId.get(id);
  if (hit) {
    if (hit.kind === "green") {
      return { regularProduct: null, greenLionProduct: hit.product as GreenLionProduct };
    }
    return { regularProduct: hit.product as Product, greenLionProduct: null };
  }
  return {
    regularProduct: getProductById(id) ?? null,
    greenLionProduct: getGreenLionProductById(id) ?? null,
  };
}

export function getProductsByCategoryMerged(category: string): Product[] {
  const base = getProductsByCategory(category);
  const replaced = base.map((p) => {
    const hit = apiByStorefrontId.get(p.id);
    if (hit && hit.kind === "regular") return hit.product as Product;
    return p;
  });
  const baseIds = new Set(replaced.map((p) => p.id));
  const extras: Product[] = [];
  for (const [, hit] of apiByStorefrontId) {
    if (hit.kind !== "regular") continue;
    const prod = hit.product as Product;
    const matches =
      prod.category === category || prod.secondaryCategories?.includes(category);
    if (matches && !baseIds.has(prod.id)) extras.push(prod);
  }
  return [...replaced, ...extras];
}

export function getGreenLionProductsByCategoryMerged(category: string): GreenLionProduct[] {
  const base = getGreenLionProductsByCategory(category);
  const replaced = base.map((p) => {
    const hit = apiByStorefrontId.get(p.id);
    if (hit && hit.kind === "green") return hit.product as GreenLionProduct;
    return p;
  });
  const baseIds = new Set(replaced.map((p) => p.id));
  const extras: GreenLionProduct[] = [];
  for (const [, hit] of apiByStorefrontId) {
    if (hit.kind !== "green") continue;
    const g = hit.product as GreenLionProduct;
    const matches =
      g.category === category || g.secondaryCategories?.includes(category);
    if (matches && !baseIds.has(g.id)) extras.push(g);
  }
  return [...replaced, ...extras];
}

/** Full Green Lion list with API overrides and API-only Green Lion rows. */
export function getAllGreenLionProductsMerged(): GreenLionProduct[] {
  const baseMerged = greenLionProducts.map((p) => {
    const hit = apiByStorefrontId.get(p.id);
    if (hit?.kind === "green") return hit.product as GreenLionProduct;
    return p;
  });
  const existing = new Set(baseMerged.map((p) => p.id));
  const extra: GreenLionProduct[] = [];
  for (const [, hit] of apiByStorefrontId) {
    if (hit.kind !== "green") continue;
    const g = hit.product as GreenLionProduct;
    if (!existing.has(g.id)) extra.push(g);
  }
  return [...baseMerged, ...extra];
}

registerPublicApiProducts([]);
registerSuppressedStorefrontIds([]);

/** Apply DB-backed rows on top of a flat listing (by storefront product id). */
export function eachApiCatalogProduct(fn: (storefrontId: number, hit: ApiHit) => void) {
  apiByStorefrontId.forEach((hit, storefrontId) => fn(storefrontId, hit));
}
