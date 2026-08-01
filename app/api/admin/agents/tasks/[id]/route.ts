import { NextRequest } from "next/server";
import { requireAgentAdmin } from "@/lib/agents/agent-auth";
import { isValidUUID } from "@/lib/auth";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getSupabaseServer } from "@/lib/supabase/server";
import { taskApprovalSchema } from "@/lib/agents/command-contracts";
import {
  getAgentTask,
  setAgentTaskApproval,
  toAgentTaskResponse,
} from "@/lib/agents/task-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const denied = requireAgentAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isValidUUID(id)) {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid task ID.", 400);
  }

  try {
    const supabase = getSupabaseServer();
    const task = await getAgentTask(supabase, id);
    if (!task) {
      return apiError(ErrorCode.NOT_FOUND, "Agent task not found.", 404);
    }

    const includeInput =
      request.nextUrl.searchParams.get("includeInput") === "true";
    return apiSuccess({ task: toAgentTaskResponse(task, includeInput) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      `Unable to read task: ${message.slice(0, 500)}`,
      503,
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const denied = requireAgentAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isValidUUID(id)) {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid task ID.", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const parsed = taskApprovalSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Invalid task decision.",
      400,
    );
  }

  try {
    const supabase = getSupabaseServer();
    const task = await setAgentTaskApproval(
      supabase,
      id,
      parsed.data.action,
      parsed.data.note,
    );

    // This records acceptance, rejection, or cancellation of a recommendation
    // only. It does not file forms, send messages, charge customers, change
    // case status, or perform another irreversible action.
    return apiSuccess({ task: toAgentTaskResponse(task) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "AGENT_TASK_NOT_FOUND") {
      return apiError(ErrorCode.NOT_FOUND, "Agent task not found.", 404);
    }
    if (
      [
        "AGENT_APPROVAL_NOT_REQUIRED",
        "AGENT_TASK_NOT_WAITING_APPROVAL",
        "AGENT_TASK_NOT_CANCELLABLE",
      ].includes(message)
    ) {
      return apiError(ErrorCode.BAD_REQUEST, "Invalid task transition.", 409);
    }

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Unable to update task decision.",
      503,
    );
  }
}
