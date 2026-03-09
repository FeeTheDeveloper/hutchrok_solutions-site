import type { SessionClaims } from "@clerk/types";

export const APP_ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export function getRoleFromClaims(claims: SessionClaims | null): AppRole | null {
  const role = claims?.metadata?.role;

  if (role === APP_ROLES.ADMIN || role === APP_ROLES.CLIENT) {
    return role;
  }

  // TODO(auth-rbac): map role from Clerk Organizations or custom JWT template claims.
  return null;
}
