/**
 * In-memory sliding-window rate limiter for admin login (P0-04).
 * Resets per IP every 15 minutes; max 5 attempts per window.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** @type {Map<string, { count: number, resetAt: number }>} */
const buckets = new Map();

export function clientIp(req) {
  const forwarded = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim();
  return forwarded || req.ip || 'unknown';
}

/**
 * @returns {{ allowed: true } | { allowed: false, retryAfterSec: number }}
 */
export function checkLoginRateLimit(ip) {
  const key = String(ip || 'unknown');
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { allowed: true };
}

/** Test helper */
export function resetLoginRateLimits() {
  buckets.clear();
}
