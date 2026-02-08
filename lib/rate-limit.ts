/**
 * Simple in-memory IP-based rate limiter.
 * Vercel-safe: uses a Map that resets on cold start.
 * Good enough for basic abuse protection; upgrade to
 * Upstash Redis or similar for production at scale.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Garbage-collect stale entries every 60 seconds
const GC_INTERVAL = 60_000;
let lastGc = Date.now();

function gc() {
  const now = Date.now();
  if (now - lastGc < GC_INTERVAL) return;
  lastGc = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitConfig {
  /** Max requests allowed in the window. Default: 5 */
  limit?: number;
  /** Window duration in milliseconds. Default: 60_000 (1 min) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a given key (typically IP) is within the rate limit.
 * Returns whether the request is allowed + remaining count.
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const { limit = 5, windowMs = 60_000 } = config;
  const now = Date.now();

  gc();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count++;

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}
