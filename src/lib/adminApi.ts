const TOKEN_KEY = "kha_admin_token";

/**
 * API origin for fetch() calls.
 * - Set VITE_API_URL for a remote API (e.g. Render).
 * - In local dev with no VITE_API_URL, use same-origin paths so Vite proxies to :3001.
 * - Production build without VITE_API_URL falls back to localhost (set env on deploy).
 */
/** Default API host when VITE_API_URL is unset in production builds (Netlify → Render). */
const DEFAULT_PRODUCTION_API = "https://kha-mobile.onrender.com";

export function apiBase(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  if (import.meta.env.DEV) return "";
  return DEFAULT_PRODUCTION_API;
}

/** Public storefront origin, no trailing slash (e.g. https://khamobile.com). */
export function siteUrl(): string {
  const raw = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:8080";
}

/** Full URL to the admin sign-in page (share with staff). */
export function adminLoginAbsoluteUrl(): string {
  return `${siteUrl()}/admin/login`;
}

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${apiBase()}${path}`, {
    ...options,
    cache: options.cache ?? "no-store",
    headers,
  });
  if (res.status === 401 && !path.includes("/login")) {
    setAdminToken(null);
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }
  return res;
}
