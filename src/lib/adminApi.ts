const TOKEN_KEY = "kha_admin_token";

export function apiBase(): string {
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
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
  const res = await fetch(`${apiBase()}${path}`, { ...options, headers });
  return res;
}
