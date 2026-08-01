import { NextRequest } from "next/server";
import { requireAgentAdmin } from "@/lib/agents/agent-auth";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  listAgentTasks,
  toAgentTaskResponse,
} from "@/lib/agents/task-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/agents/tasks?status=...&agentType=...&limit=25 */
export async function GET(request: NextRequest) {
  const denied = requireAgentAdmin(request);
  if (denied) return denied;

  const status = request.nextUrl.searchParams.get("status") || undefined;
  const agentType =
    request.nextUrl.searchParams.get("agentType") || undefined;
  const requestedLimit = Number(
    request.nextUrl.searchParams.get("limit") || "25",
  );
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(100, Math.floor(requestedLimit)))
    : 25;

  try {
    const supabase = getSupabaseServer();
    const tasks = await listAgentTasks(supabase, {
      status,
      agentType,
      limit,
    });
    return apiSuccess({
      tasks: tasks.map((task) => toAgentTaskResponse(task)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      `Failed to list agent tasks: ${message.slice(0, 500)}`,
      500,
    );
  }
}
