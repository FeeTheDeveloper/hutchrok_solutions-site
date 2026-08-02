import { NextRequest } from "next/server";
import { requireAgentAdmin } from "@/lib/agents/agent-auth";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  listAgentTasks,
  toAgentTaskResponse,
} from "@/lib/agents/task-store";
import { taskListQuerySchema } from "@/lib/agents/contracts";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/agents/tasks?status=...&agentType=...&limit=25 */
export async function GET(request: NextRequest) {
  const denied = requireAgentAdmin(request);
  if (denied) return denied;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`agent-tasks:${ip}`, { limit: 60, windowMs: 60_000 }).allowed) {
    return apiError(ErrorCode.RATE_LIMITED, "Too many requests.", 429);
  }

  const parsed = taskListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return apiError(ErrorCode.VALIDATION_ERROR, "Invalid task query.", 400);

  try {
    const supabase = getSupabaseServer();
    const tasks = await listAgentTasks(supabase, {
      status: parsed.data.status,
      agentType: parsed.data.agentType,
      limit: parsed.data.limit,
    });
    return apiSuccess({
      tasks: tasks.map((task) => toAgentTaskResponse(task)),
    });
  } catch {
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to list agent tasks.",
      500,
    );
  }
}
