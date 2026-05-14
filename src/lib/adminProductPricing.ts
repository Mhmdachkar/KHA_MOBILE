/**
 * Admin Basics → catalog `price` / `compare_at_price` (sale vs list / was).
 * List price lives in "Compare at"; sale is optional for a discount.
 */

export type ResolvedCatalogPrices =
  | { ok: true; price: number; compareAtPrice: number | null }
  | { ok: false; message: string };

export function resolveCatalogPricesFromForm(saleStr: string, compareStr: string): ResolvedCatalogPrices {
  const saleTrim = saleStr.trim();
  const compareTrim = compareStr.trim();
  const saleParsed = saleTrim === "" ? NaN : Number.parseFloat(saleTrim);
  const compareParsed = compareTrim === "" ? NaN : Number.parseFloat(compareTrim);
  const hasSaleField = saleTrim !== "";
  const hasCompareField = compareTrim !== "";
  const saleFinite = hasSaleField && Number.isFinite(saleParsed);
  const compareFinite = hasCompareField && Number.isFinite(compareParsed);

  if (hasSaleField && !saleFinite) {
    return { ok: false, message: "Sale price must be a valid number (or leave blank)." };
  }
  if (hasCompareField && !compareFinite) {
    return { ok: false, message: "Compare-at price must be a valid number (or leave blank)." };
  }

  if (!saleFinite && !compareFinite) {
    return {
      ok: false,
      message:
        "Enter a list price in Compare at (was), and optionally a lower sale price for a discount.",
    };
  }

  if (compareFinite && compareParsed < 0) {
    return { ok: false, message: "Compare-at (list) price cannot be negative." };
  }
  if (saleFinite && saleParsed < 0) {
    return { ok: false, message: "Sale price cannot be negative." };
  }

  if (compareFinite && (!saleFinite || saleParsed === 0)) {
    return { ok: true, price: compareParsed, compareAtPrice: null };
  }

  if (saleFinite && !compareFinite) {
    return { ok: true, price: saleParsed, compareAtPrice: null };
  }

  if (compareParsed < saleParsed) {
    return {
      ok: false,
      message:
        "Compare-at (list) must be greater than or equal to the sale price. Leave sale blank for a single list price.",
    };
  }
  if (compareParsed === saleParsed) {
    return { ok: true, price: saleParsed, compareAtPrice: null };
  }
  return { ok: true, price: saleParsed, compareAtPrice: compareParsed };
}

export interface AdminBasicsValidationInput {
  name: string;
  price: string;
  compareAtPrice: string;
  isPreorder: boolean;
  legacyOverrideId: string;
  rating: string;
}

export function computeCatalogSaveFromBasics(form: AdminBasicsValidationInput): ResolvedCatalogPrices {
  if (!form.name.trim()) return { ok: false, message: "Name is required" };

  const r = resolveCatalogPricesFromForm(form.price, form.compareAtPrice);
  if (!r.ok) return r;
  if (form.isPreorder && r.price === 0) {
    return { ok: false, message: "Pre-order products cannot have a zero price" };
  }

  if (
    form.legacyOverrideId &&
    (Number.isNaN(Number(form.legacyOverrideId)) || Number(form.legacyOverrideId) < 0)
  ) {
    return { ok: false, message: "Legacy Override ID must be a valid positive number" };
  }

  const ratingNum = Number(form.rating);
  if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
    return { ok: false, message: "Rating must be between 0 and 5" };
  }

  return r;
}

export function validateAdminProductBasics(form: AdminBasicsValidationInput): string | null {
  const c = computeCatalogSaveFromBasics(form);
  if (c.ok === false) return c.message;
  return null;
}

/** When loading from API: show list in Compare at; sale only if a real discount row exists. */
export function formPricesFromLoadedProduct(p: {
  price: number;
  compareAtPrice?: number | null;
}): { price: string; compareAtPrice: string } {
  const pr = Number(p.price);
  const cmpRaw = p.compareAtPrice != null ? Number(p.compareAtPrice) : NaN;
  if (Number.isFinite(cmpRaw) && cmpRaw > pr) {
    return { price: String(pr), compareAtPrice: String(cmpRaw) };
  }
  return { price: "", compareAtPrice: Number.isFinite(pr) ? String(pr) : "" };
}

export function hasRetailDiscount(
  compareAt: number | null | undefined,
  salePrice: number | string
): boolean {
  const c = compareAt != null ? Number(compareAt) : NaN;
  const s = typeof salePrice === "string" ? Number.parseFloat(salePrice) : Number(salePrice);
  return Number.isFinite(c) && Number.isFinite(s) && c > s;
}

export function retailDiscountPercent(compareAt: number, salePrice: number): number {
  if (!(compareAt > 0) || !Number.isFinite(salePrice)) return 0;
  return Math.max(0, Math.round((1 - salePrice / compareAt) * 100));
}
