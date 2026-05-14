import { apiBase } from "./adminApi";

/** True only when VITE_API_URL is explicitly set (not the localhost fallback). */
function hasConfiguredApiBase(): boolean {
  const env = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  return Boolean(env && !env.startsWith("http://localhost") && !env.startsWith("http://127.0.0.1"));
}

function joinApiBase(path: string): string {
  const base = apiBase().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Admin / editor: resolve any stored product or media URL for `<img src>`.
 *
 * - Always serves **`/uploads/...`** from **`apiBase()`** (same server as `VITE_API_URL`),
 *   even when the DB still has a full `https://other-host/uploads/...` from an old deploy.
 * - Absolute **non-upload** URLs (CDN, etc.) are left unchanged.
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

  // Any http(s) URL that points at our uploads folder → rewrite host to apiBase
  // only when VITE_API_URL is explicitly configured (avoids localhost rewrites in prod).
  if (/^https?:\/\//i.test(u)) {
    if (hasConfiguredApiBase()) {
      try {
        const parsed = new URL(u);
        if (parsed.pathname.startsWith("/uploads/")) {
          return joinApiBase(parsed.pathname + parsed.search);
        }
      } catch {
        /* ignore */
      }
    }
    return u;
  }

  if (u.startsWith("/uploads/") || u.startsWith("uploads/")) {
    if (hasConfiguredApiBase()) {
      return joinApiBase(u.startsWith("/") ? u : `/${u}`);
    }
    return u;
  }

  if (u.startsWith("/")) return u;

  return joinApiBase(u);
}

export function resolveImageUrls(urls: (string | undefined)[]): string[] {
  return urls.map(resolveImageUrl).filter((url): url is string => !!url);
}
