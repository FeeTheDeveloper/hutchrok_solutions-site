import {
  CONCIERGE_MODE_CONFIG,
  type ConciergeMode,
  type ConciergeNode,
  type ContextNudge,
} from "@/components/concierge/concierge-config";

export function resolveConciergeModeFromPath(pathname: string): ConciergeMode {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/dashboard")) return "client";
  return "public";
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
