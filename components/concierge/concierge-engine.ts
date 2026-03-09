import {
  CONCIERGE_MODE_CONFIG,
  type ConciergeMode,
  type ConciergeNode,
  type ContextNudge,
} from "@/components/concierge/concierge-config";
import type { AppRole } from "@/lib/auth/roles";

export function resolveConciergeModeFromPath(pathname: string): ConciergeMode {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/dashboard")) return "client";
  return "public";
}

export function resolveConciergeModeFromAuth({
  isSignedIn,
  role,
  pathname,
}: {
  isSignedIn: boolean;
  role: AppRole | null;
  pathname: string;
}): ConciergeMode {
  if (!isSignedIn) return "public";
  if (role === "admin") return "admin";

  // TODO(auth-rbac): when Clerk role claims are fully rolled out,
  // remove path-based fallback and rely entirely on session role.
  if (pathname.startsWith("/admin")) return "admin";
  return "client";
}

export function resolveContextNudge(
  mode: ConciergeMode,
  pathname: string,
): ContextNudge | null {
  const nudges = CONCIERGE_MODE_CONFIG[mode].contextNudges;
  const sorted = Object.keys(nudges).sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (pathname.startsWith(prefix)) return nudges[prefix];
  }
  return null;
}

export function getNode(mode: ConciergeMode, nodeId: string): ConciergeNode {
  const config = CONCIERGE_MODE_CONFIG[mode];
  return config.nodes[nodeId] ?? config.nodes[config.rootNodeId];
}
