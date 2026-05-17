import { apiBase } from "./adminApi";

function joinApiBase(path: string): string {
  const base = apiBase().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Admin / editor: resolve any stored product or media URL for `<img src>`.
 *
 * - **`/uploads/...`** always loads from the API server (`VITE_API_URL` or localhost:3001 in dev).
 * - Absolute **non-upload** URLs (CDN, bundled assets) are left unchanged.
 * - `blob:` / `data:` unchanged.
 * - Other root-relative paths stay on the **current page origin** (Vite / Netlify assets).
 */
export function resolveImageUrl(url: string | undefined): string {
  if (!url || !String(url).trim()) return "";
  const u = String(url).trim();

  if (/^(blob:|data:)/i.test(u)) return u;

  if (u.startsWith("//")) {
    if (typeof window !== "undefined" && window.location?.protocol) {
      return `${window.location.protocol}${u}`;
    }
    return `https:${u}`;
  }

  if (/^https?:\/\//i.test(u)) {
    try {
      const parsed = new URL(u);
      if (parsed.pathname.startsWith("/uploads/")) {
        return joinApiBase(parsed.pathname + parsed.search);
      }
    } catch {
      /* ignore */
    }
    return u;
  }

  if (u.startsWith("/uploads/") || u.startsWith("uploads/")) {
    return joinApiBase(u.startsWith("/") ? u : `/${u}`);
  }

  if (u.startsWith("/")) return u;

  return joinApiBase(u);
}

export function resolveImageUrls(urls: (string | undefined)[]): string[] {
  return urls.map(resolveImageUrl).filter((url): url is string => !!url);
}
