import type { Product } from "@/data/products";
import type { GreenLionProduct } from "@/data/greenLionProducts";
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

function mapApiToProduct(p: ApiPublicProduct): Product {
  const imgs = p.images?.length ? p.images : [p.image];
  return {
    id: p.id,
    dbId: p.dbId,
    legacyOverrideId: p.legacyOverrideId,
    name: p.name,
    title: p.title,
    price: p.price,
    image: p.image,
    images: imgs.length > 1 ? imgs : imgs.length === 1 ? [imgs[0]] : undefined,
    rating: p.rating,
    category: p.category,
    brand: p.brand,
    description: p.description,
    features: p.features || [],
    specifications: p.specifications || [],
    variants: p.variants?.length ? p.variants : undefined,
    colors: p.colors?.length ? p.colors : undefined,
    sizes: p.sizes?.length ? p.sizes : undefined,
    connectivityOptions: p.connectivityOptions?.length ? p.connectivityOptions : undefined,
    secondaryCategories: p.secondaryCategories?.length ? p.secondaryCategories : undefined,
    video: p.video,
    isPreorder: p.isPreorder,
    isActive: p.isActive,
  } as Product;
}

function mapApiToGreenLion(p: ApiPublicProduct): GreenLionProduct {
  const imgs = p.images?.length ? p.images : [p.image];
  return {
    id: p.id,
    dbId: p.dbId,
    legacyOverrideId: p.legacyOverrideId,
    name: p.name,
    title: p.title,
    price: typeof p.price === "number" ? p.price : Number(p.price),
    images: imgs,
    rating: p.rating,
    category: p.category,
    brand: p.brand || "Green Lion",
    description: p.description,
    features: p.features || [],
    specifications: p.specifications || [],
    colors: p.colors?.length ? p.colors : undefined,
    variants: p.variants?.length ? p.variants : undefined,
    connectivityOptions: p.connectivityOptions?.length ? p.connectivityOptions : undefined,
    secondaryCategories: p.secondaryCategories?.length ? p.secondaryCategories : undefined,
    video: p.video,
    isPreorder: p.isPreorder,
    isActive: p.isActive,
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
      apiByStorefrontId.set(p.id, { kind: "green", product: mapApiToGreenLion(p) });
    } else {
      apiByStorefrontId.set(p.id, { kind: "regular", product: mapApiToProduct(p) });
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

/** Apply DB-backed rows on top of a flat listing (by storefront product id). */
export function eachApiCatalogProduct(fn: (storefrontId: number, hit: ApiHit) => void) {
  apiByStorefrontId.forEach((hit, storefrontId) => fn(storefrontId, hit));
}
