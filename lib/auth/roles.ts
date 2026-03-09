export const APP_ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

/** Server-side variant — extracts role from Clerk JWT sessionClaims. */
export function getRoleFromClaims(claims: Record<string, unknown> | null): AppRole | null {
  const metadata = claims?.metadata as Record<string, unknown> | undefined;
  const role = metadata?.role;

  if (role === APP_ROLES.ADMIN || role === APP_ROLES.CLIENT) {
    return role;
  }

  // TODO(auth-rbac): map role from Clerk Organizations or custom JWT template claims.
  return null;
}

/** Client-side variant — extracts role from Clerk user publicMetadata. */
export function getRoleFromMetadata(metadata: Record<string, unknown> | undefined | null): AppRole | null {
  const role = metadata?.role;
  if (role === APP_ROLES.ADMIN || role === APP_ROLES.CLIENT) {
    return role;
  }
  return null;
}
