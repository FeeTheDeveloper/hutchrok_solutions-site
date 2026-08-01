import { NextRequest } from "next/server";
import { requireAgentAdmin } from "@/lib/agents/agent-auth";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  listAgentDefinitions,
  listAgentTasks,
} from "@/lib/agents/task-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/agents/health
 * Configuration and ledger health. This checks key presence, not key validity.
 */
export async function GET(request: NextRequest) {
  const denied = requireAgentAdmin(request);
  if (denied) return denied;

  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const supabaseSecretConfigured = Boolean(process.env.SUPABASE_SECRET_KEY);

  try {
    const supabase = getSupabaseServer();
    const [agents, recentTasks] = await Promise.all([
      listAgentDefinitions(supabase),
      listAgentTasks(supabase, { limit: 10 }),
    ]);

    return apiSuccess({
      status:
        openaiConfigured && supabaseSecretConfigured
          ? "ready"
          : "configuration_required",
      openaiConfigured,
      supabaseSecretConfigured,
      commandModel:
        process.env.OPENAI_COMMAND_MODEL ||
        agents.find((agent) => agent.agentType === "case_action_planner")
          ?.defaultModel ||
        "gpt-4.1-mini",
      agents,
      recentTasks: recentTasks.map((task) => ({
        id: task.id,
        agentType: task.agentType,
        subjectType: task.subjectType,
        subjectId: task.subjectId,
        status: task.status,
        priority: task.priority,
        approvalStatus: task.approvalStatus,
        model: task.model,
        durationMs: task.durationMs,
        errorCode: task.errorCode,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
      note: "Health confirms configuration and database access; run a synthetic task to validate the OpenAI credential.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      `Agent ledger unavailable: ${message.slice(0, 500)}`,
      503,
    );
  }
}
