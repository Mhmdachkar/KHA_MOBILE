/**
 * Normalized storefront catalog: static + API merge with full commerce fields.
 */

import type { Product } from "@/data/products";
import type { GreenLionProduct } from "@/data/greenLionProducts";
import {
  eachApiCatalogProduct,
  getAllGreenLionProductsMerged,
  getProductFromApiById,
  isStorefrontIdSuppressed,
} from "@/data/productLookup";
import {
  phoneAccessories,
  wearablesProducts,
  smartphoneProducts,
  tabletProducts,
  iphoneCases,
  gamingConsoles,
  electronicsProducts,
} from "@/data/products";
import { resolveSalePrice } from "@/lib/storefrontPricing";

export interface StorefrontColor {
  name: string;
  image?: string;
  stock?: string;
  price?: number | "";
}

export interface StorefrontVariant {
  key: string;
  label: string;
  price: number;
  ram?: string;
  storage?: string;
  description?: string;
}

export interface StorefrontSize {
  name: string;
  price?: number | string | null;
  stock?: string;
  description?: string;
}

export interface StorefrontProduct {
  id: number;
  dbId?: number;
  name: string;
  title?: string;
  description?: string;
  price: number;
  /** Resolved lowest sell price for listings (variants/sizes). */
  displayPrice: number;
  compareAtPrice?: number | null;
  image: string;
  images?: string[];
  rating: number;
  category: string;
  brand?: string;
  variants?: StorefrontVariant[];
  colors?: StorefrontColor[];
  sizes?: StorefrontSize[];
  isPreorder?: boolean;
  showPreorderPrice?: boolean;
  stockQuantity?: number | null;
  secondaryCategories?: string[];
  connectivityOptions?: string[];
}

function normalizeImages(image: string, images?: string[]): string[] {
  if (images?.length) return images;
  return image ? [image] : [];
}

/** JSONB may be stored as an object; coerce to array for admin/API rows. */
export function coerceVariantArray(raw: unknown): StorefrontVariant[] {
  if (Array.isArray(raw)) return raw as StorefrontVariant[];
  if (raw && typeof raw === "object") return Object.values(raw) as StorefrontVariant[];
  return [];
}

function slugKeyPart(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Ensure unique variant keys and numeric prices (fixes admin rows with duplicate/empty keys). */
export function normalizeStorefrontVariants(
  raw: unknown
): StorefrontVariant[] | undefined {
  const list = coerceVariantArray(raw);
  if (!list.length) return undefined;

  const seen = new Set<string>();
  const out: StorefrontVariant[] = [];

  list.forEach((item, i) => {
    if (!item || typeof item !== "object") return;
    const label =
      String(item.label ?? "").trim() ||
      [item.storage, item.ram].filter(Boolean).join(" · ").trim() ||
      `Configuration ${i + 1}`;

    let key = String(item.key ?? "").trim();
    if (!key) key = slugKeyPart(label) || `variant-${i}`;
    let uniqueKey = key;
    let suffix = 0;
    while (seen.has(uniqueKey)) {
      suffix += 1;
      uniqueKey = `${key}-${suffix}`;
    }
    seen.add(uniqueKey);

    const price =
      typeof item.price === "string" ? Number.parseFloat(item.price) : Number(item.price);

    out.push({
      ...item,
      key: uniqueKey,
      label,
      price: Number.isFinite(price) ? price : 0,
    });
  });

  return out.length ? out : undefined;
}

function fromRegular(p: Product): StorefrontProduct {
  const images = normalizeImages(p.image, p.images);
  const base = {
    id: p.id,
    dbId: (p as Product & { dbId?: number }).dbId,
    name: p.name,
    title: p.title,
    description: p.description,
    price: typeof p.price === "number" ? p.price : Number.parseFloat(String(p.price)) || 0,
    compareAtPrice: p.compareAtPrice ?? null,
    image: images[0] || p.image,
    images,
    rating: p.rating ?? 4.5,
    category: p.category,
    brand: p.brand,
    variants: normalizeStorefrontVariants(p.variants),
    colors: p.colors,
    sizes: p.sizes,
    isPreorder: p.isPreorder,
    showPreorderPrice: p.showPreorderPrice,
    stockQuantity: (p as Product & { stockQuantity?: number | null }).stockQuantity ?? null,
    secondaryCategories: p.secondaryCategories,
    connectivityOptions: p.connectivityOptions,
  };
  return {
    ...base,
    displayPrice: resolveSalePrice(base),
  };
}

function fromGreenLion(g: GreenLionProduct): StorefrontProduct {
  const images = g.images?.length ? g.images : [];
  const base = {
    id: g.id,
    dbId: (g as GreenLionProduct & { dbId?: number }).dbId,
    name: g.name,
    title: g.title,
    description: g.description,
    price: typeof g.price === "number" ? g.price : Number.parseFloat(String(g.price)) || 0,
    compareAtPrice: g.compareAtPrice ?? null,
    image: images[0] || "",
    images,
    rating: g.rating ?? 4.5,
    category: g.category,
    brand: g.brand || "Green Lion",
    variants: normalizeStorefrontVariants(g.variants),
    colors: g.colors,
    sizes: g.sizes,
    isPreorder: g.isPreorder,
    showPreorderPrice: g.showPreorderPrice,
    stockQuantity: (g as GreenLionProduct & { stockQuantity?: number | null }).stockQuantity ?? null,
    secondaryCategories: g.secondaryCategories,
    connectivityOptions: g.connectivityOptions,
  };
  return {
    ...base,
    displayPrice: resolveSalePrice(base),
  };
}

/** Storefront row for a product id (same source as grids/carousels). */
export function getStorefrontProductById(
  catalog: StorefrontProduct[],
  id: number
): StorefrontProduct | undefined {
  return catalog.find((p) => p.id === id);
}

/** Build full storefront catalog (call after registerPublicApiProducts). */
export function buildStorefrontCatalog(): StorefrontProduct[] {
  const staticProducts = [
    ...phoneAccessories,
    ...wearablesProducts,
    ...smartphoneProducts,
    ...tabletProducts,
    ...iphoneCases,
    ...gamingConsoles,
    ...electronicsProducts,
  ];

  const greenLion = getAllGreenLionProductsMerged();
  const mergedStatic = staticProducts
    .filter((p) => !isStorefrontIdSuppressed(p.id))
    .map((p) => {
      const override = getProductFromApiById(p.id);
      return fromRegular(override || p);
    });

  const mergedGreen = greenLion
    .filter((g) => !isStorefrontIdSuppressed(g.id))
    .map((g) => fromGreenLion(g));

  const uniqueMap = new Map<number, StorefrontProduct>();
  for (const p of [...mergedStatic, ...mergedGreen]) {
    uniqueMap.set(p.id, p);
  }

  eachApiCatalogProduct((storefrontId, hit) => {
    if (!uniqueMap.has(storefrontId)) {
      if (hit.kind === "green") {
        uniqueMap.set(storefrontId, fromGreenLion(hit.product as GreenLionProduct));
      } else {
        uniqueMap.set(storefrontId, fromRegular(hit.product as Product));
      }
    }
  });

  return Array.from(uniqueMap.values());
}

export function isGreenLionProduct(product: StorefrontProduct): boolean {
  return (
    product.id >= 5000 ||
    product.brand === "Green Lion" ||
    product.name?.startsWith("Green Lion")
  );
}
