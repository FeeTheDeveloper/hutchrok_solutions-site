/**
 * Centralized admin authentication guard.
 *
 * Replaces duplicated `isAuthorized()` functions across API routes.
 * Uses constant-time comparison to prevent timing attacks on the token.
 */

import { NextRequest } from "next/server";
import { apiError, ErrorCode } from "@/lib/api-response";

// ── Constant-time string comparison ──

/**
 * Compare two strings in constant time to prevent timing attacks.
 * Returns true only if both strings are non-empty and identical.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a dummy comparison to avoid leaking length info via timing
    let result = a.length ^ b.length;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      result |= (a.charCodeAt(i % a.length) || 0) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ── Admin token extraction ──

/**
 * Extract the admin token from the request.
 * Checks Authorization header first (preferred), then query param (legacy).
 */
export function extractAdminToken(request: NextRequest): string | null {
  // Prefer Authorization header
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  if (bearer) return bearer;

  // Fall back to query param (for admin UI which navigates via URL)
  const queryToken = request.nextUrl.searchParams.get("token");
  if (queryToken) return queryToken;

  return null;
}

/**
 * Check if the request carries a valid admin token.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function isAdminAuthorized(request: NextRequest): boolean {
  const token = extractAdminToken(request);
  const expected = process.env.ADMIN_TOKEN;
  if (!token || !expected) return false;
  return timingSafeEqual(token, expected);
}

/**
 * Guard helper — returns a 401 response if unauthorized, or null if OK.
 * Usage:
 *   const denied = requireAdmin(request);
 *   if (denied) return denied;
 */
export function requireAdmin(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return apiError(ErrorCode.UNAUTHORIZED, "Invalid or missing admin token.", 401);
  }
  return null;
}

// ── Ops token validation ──

/**
 * Check if the request carries a valid OPS_TOKEN.
 * Used for inbound Power Automate / external service webhooks.
 */
export function isOpsAuthorized(request: NextRequest): boolean {
  const header = request.headers.get("x-ops-token");
  const expected = process.env.OPS_TOKEN;
  if (!header || !expected) return false;
  return timingSafeEqual(header, expected);
}

/**
 * Guard helper — returns a 401 response if unauthorized, or null if OK.
 */
export function requireOps(request: NextRequest) {
  if (!isOpsAuthorized(request)) {
    return apiError(ErrorCode.UNAUTHORIZED, "Invalid or missing OPS_TOKEN.", 401);
  }
  return null;
}

// ── UUID validation ──

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validate a string is a well-formed UUID. */
export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}
