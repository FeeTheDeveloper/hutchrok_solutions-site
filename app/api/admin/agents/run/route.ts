import { NextRequest } from "next/server";
import { requireAgentAdmin } from "@/lib/agents/agent-auth";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServer } from "@/lib/supabase/server";
import { agentExecutionRequestSchema } from "@/lib/agents/contracts";
import { executeAgentTask } from "@/lib/agents/runner";
import { toAgentTaskResponse } from "@/lib/agents/task-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/agents/run
 * Runs one recommendation-only Hutchrok command task.
 */
export async function POST(request: NextRequest) {
  const denied = requireAgentAdmin(request);
  if (denied) return denied;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const rl = rateLimit(`agent-run:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return apiError(ErrorCode.RATE_LIMITED, "Too many agent requests.", 429);
  }

  if (!process.env.OPENAI_API_KEY) {
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "OPENAI_API_KEY is not configured in this deployment.",
      503,
    );
  }

  if (!process.env.SUPABASE_SECRET_KEY) {
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "SUPABASE_SECRET_KEY is required for the server-only agent ledger.",
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const parsed = agentExecutionRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "request";
      if (!fields[key]) fields[key] = issue.message;
    }
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Invalid agent task request.",
      400,
      fields,
    );
  }

  try {
    const supabase = getSupabaseServer();
    const requestedBy =
      request.headers.get("x-hutchrok-operator") || "admin-api";
    const result = await executeAgentTask(
      supabase,
      parsed.data,
      requestedBy.slice(0, 200),
    );

    return apiSuccess({
      reused: result.reused,
      task: toAgentTaskResponse(result.task),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "AGENT_DISABLED") {
      return apiError(ErrorCode.BAD_REQUEST, "This agent is disabled.", 409);
    }
    if (["AGENT_DEFINITION_NOT_FOUND", "AGENT_UNKNOWN"].includes(message)) {
      return apiError(ErrorCode.NOT_FOUND, "Agent definition not found.", 404);
    }
    if (message === "AGENT_NOT_IMPLEMENTED") {
      return apiError(ErrorCode.BAD_REQUEST, "This agent is not available for operator execution.", 409);
    }
    if (message.startsWith("SUBJECT_")) {
      return apiError(
        ErrorCode.NOT_FOUND,
        "The requested agent subject could not be loaded.",
        404,
      );
    }

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "The agent task failed. Review the task ledger and runtime logs.",
      500,
    );
  }
}
