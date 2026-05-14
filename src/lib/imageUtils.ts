import { apiBase } from "./adminApi";

function joinApiBase(path: string): string {
  const base = apiBase().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Resolves a product or media URL for use in <img src> inside the admin (and storefront when needed).
 *
 * - Absolute URLs (http/https), blob:, and data: URIs are returned unchanged.
 * - Protocol-relative URLs (//...) are prefixed with the current page protocol when in a browser.
 * - **`/uploads/...`** and **`uploads/...`** are always resolved against **`apiBase()`** (Express static),
 *   not the Vite dev server — this is the usual fix when admin shows broken images for DB products.
 * - Other root-relative paths (`/assets/...`, etc.) stay relative to the **current origin** (Vite / Netlify).
 * - Other relative paths are joined to `apiBase()` as a fallback.
 */
export function resolveImageUrl(url: string | undefined): string {
  if (!url || !String(url).trim()) return "";
  const u = String(url).trim();

  if (/^(https?:|blob:|data:)/i.test(u)) return u;

  if (u.startsWith("//")) {
    if (typeof window !== "undefined" && window.location?.protocol) {
      return `${window.location.protocol}${u}`;
    }
    return `https:${u}`;
  }

  // API-hosted uploads (never served by Vite on port 8080)
  if (u.startsWith("/uploads/") || u.startsWith("uploads/")) {
    return joinApiBase(u.startsWith("/") ? u : `/${u}`);
  }

  // Storefront / Vite static assets (hashed bundles, public/, etc.)
  if (u.startsWith("/")) return u;

  return joinApiBase(u);
}

/** Resolves multiple image URLs (galleries, etc.). */
export function resolveImageUrls(urls: (string | undefined)[]): string[] {
  return urls.map(resolveImageUrl).filter((url): url is string => !!url);
}
