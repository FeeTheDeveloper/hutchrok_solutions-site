import { NextRequest } from "next/server";
import { requireAgentAdmin } from "@/lib/agents/agent-auth";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  listAgentDefinitions,
} from "@/lib/agents/task-store";
import { REGISTERED_AGENT_COUNT } from "@/lib/agents/registry";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/agents/health
 * Configuration and ledger health. This checks key presence, not key validity.
 */
export async function GET(request: NextRequest) {
  const denied = requireAgentAdmin(request);
  if (denied) return denied;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`agent-health:${ip}`, { limit: 30, windowMs: 60_000 }).allowed) {
    return apiError(ErrorCode.RATE_LIMITED, "Too many requests.", 429);
  }

  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);
  try {
    const supabase = getSupabaseServer();
    const agents = await listAgentDefinitions(supabase);

    return apiSuccess({
      configured: openaiConfigured && Boolean(process.env.SUPABASE_SECRET_KEY),
      registryCount: REGISTERED_AGENT_COUNT,
      enabledAgents: agents.filter((agent) => agent.enabled).map((agent) => agent.agentType),
      databaseConnectivity: true,
      openaiKeyConfigured: openaiConfigured,
      applicationVersion: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "development",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Agent database connectivity check failed.",
      503,
    );
  }
}
