/**
 * Normalized storefront catalog: static + API merge with full commerce fields.
 */

import type { Product } from "@/data/products";
import type { GreenLionProduct } from "@/data/greenLionProducts";
import {
  eachApiCatalogProduct,
  getAllGreenLionProductsMerged,
  getProductFromApiById,
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
    variants: p.variants,
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
    variants: g.variants,
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
  const mergedStatic = staticProducts.map((p) => {
    const override = getProductFromApiById(p.id);
    return fromRegular(override || p);
  });

  const mergedGreen = greenLion.map((g) => fromGreenLion(g));

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
