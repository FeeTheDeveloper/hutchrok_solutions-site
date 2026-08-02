import type { getSupabaseServer } from "@/lib/supabase/server";
import type { AgentType, Priority } from "@/lib/agents/contracts";
import { redactAgentError, redactAgentInput } from "@/lib/agents/redaction";

type SupabaseServer = ReturnType<typeof getSupabaseServer>;

function asRowObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export interface AgentDefinition {
  agentType: string;
  displayName: string;
  description: string;
  enabled: boolean;
  defaultModel: string;
  agentVersion: string;
  requiresHumanApproval: boolean;
  triggerMode: "automatic" | "operator" | "scheduled";
}

export interface AgentTaskRecord {
  id: string;
  agentType: string;
  subjectType: string;
  subjectId: string | null;
  idempotencyKey: string | null;
  status: string;
  priority: Priority;
  input: unknown;
  output: unknown;
  requiresApproval: boolean;
  approvalStatus: string;
  requestedBy: string;
  model: string | null;
  agentVersion: string | null;
  traceId: string | null;
  durationMs: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapDefinition(row: Record<string, unknown>): AgentDefinition {
  return {
    agentType: String(row.agent_type),
    displayName: String(row.display_name),
    description: String(row.description),
    enabled: Boolean(row.enabled),
    defaultModel: String(row.default_model),
    agentVersion: String(row.agent_version),
    requiresHumanApproval: Boolean(row.requires_human_approval),
    triggerMode: String(row.trigger_mode) as AgentDefinition["triggerMode"],
  };
}

function mapTask(row: Record<string, unknown>): AgentTaskRecord {
  return {
    id: String(row.id),
    agentType: String(row.agent_type),
    subjectType: String(row.subject_type),
    subjectId: row.subject_id ? String(row.subject_id) : null,
    idempotencyKey: row.idempotency_key
      ? String(row.idempotency_key)
      : null,
    status: String(row.status),
    priority: String(row.priority) as Priority,
    input: row.input,
    output: row.output,
    requiresApproval: Boolean(row.requires_approval),
    approvalStatus: String(row.approval_status),
    requestedBy: String(row.requested_by),
    model: row.model ? String(row.model) : null,
    agentVersion: row.agent_version ? String(row.agent_version) : null,
    traceId: row.trace_id ? String(row.trace_id) : null,
    durationMs: typeof row.duration_ms === "number" ? row.duration_ms : null,
    errorCode: row.error_code ? String(row.error_code) : null,
    errorMessage: row.error_message ? String(row.error_message) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

const TASK_SELECT = [
  "id",
  "agent_type",
  "subject_type",
  "subject_id",
  "idempotency_key",
  "status",
  "priority",
  "input",
  "output",
  "requires_approval",
  "approval_status",
  "requested_by",
  "model",
  "agent_version",
  "trace_id",
  "duration_ms",
  "error_code",
  "error_message",
  "created_at",
  "updated_at",
].join(", ");

export function toAgentTaskResponse(
  task: AgentTaskRecord,
  includeInput = false,
) {
  const { input, ...safeTask } = task;
  return includeInput ? { ...safeTask, input } : safeTask;
}

export async function getAgentDefinition(
  supabase: SupabaseServer,
  agentType: string,
): Promise<AgentDefinition | null> {
  const { data, error } = await supabase
    .from("agent_definitions")
    .select(
      "agent_type, display_name, description, enabled, default_model, agent_version, requires_human_approval, trigger_mode",
    )
    .eq("agent_type", agentType)
    .maybeSingle();

  if (error) throw new Error(`AGENT_DEFINITION_READ_FAILED:${error.message}`);
  return data ? mapDefinition(data as Record<string, unknown>) : null;
}

export async function listAgentDefinitions(
  supabase: SupabaseServer,
): Promise<AgentDefinition[]> {
  const { data, error } = await supabase
    .from("agent_definitions")
    .select(
      "agent_type, display_name, description, enabled, default_model, agent_version, requires_human_approval, trigger_mode",
    )
    .order("agent_type", { ascending: true });

  if (error) throw new Error(`AGENT_DEFINITION_LIST_FAILED:${error.message}`);
  return (data ?? []).map((row: unknown) =>
    mapDefinition(row as Record<string, unknown>),
  );
}

export interface CreateTaskInput {
  agentType: AgentType;
  subjectType: string;
  subjectId?: string;
  idempotencyKey?: string;
  priority: Priority;
  input: unknown;
  requiresApproval: boolean;
  requestedBy: string;
  model: string;
  agentVersion: string;
}

async function findTaskByIdempotency(
  supabase: SupabaseServer,
  agentType: string,
  idempotencyKey: string,
): Promise<AgentTaskRecord | null> {
  const { data, error } = await supabase
    .from("agent_tasks")
    .select(TASK_SELECT)
    .eq("agent_type", agentType)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error) {
    throw new Error(`AGENT_TASK_IDEMPOTENCY_READ_FAILED:${error.message}`);
  }
  const row = asRowObject(data);
  if (!row) return null;
  return mapTask(row);
}

export async function createAgentTask(
  supabase: SupabaseServer,
  input: CreateTaskInput,
): Promise<{ task: AgentTaskRecord; reused: boolean }> {
  if (input.idempotencyKey) {
    const existing = await findTaskByIdempotency(
      supabase,
      input.agentType,
      input.idempotencyKey,
    );
    if (existing) return { task: existing, reused: true };
  }

  const { data, error } = await supabase
    .from("agent_tasks")
    .insert({
      agent_type: input.agentType,
      subject_type: input.subjectType,
      subject_id: input.subjectId ?? null,
      idempotency_key: input.idempotencyKey ?? null,
      status: "queued",
      priority: input.priority,
      input: redactAgentInput(input.input),
      output: null,
      requires_approval: input.requiresApproval,
      approval_status: input.requiresApproval ? "pending" : "not_required",
      requested_by: input.requestedBy,
      model: input.model,
      agent_version: input.agentVersion,
      redaction_applied: true,
    })
    .select(TASK_SELECT)
    .single();

  if (error || !data) {
    if (error?.code === "23505" && input.idempotencyKey) {
      const raced = await findTaskByIdempotency(
        supabase,
        input.agentType,
        input.idempotencyKey,
      );
      if (raced) return { task: raced, reused: true };
    }

    throw new Error(
      `AGENT_TASK_CREATE_FAILED:${error?.message ?? "No task returned"}`,
    );
  }

  const createdRow = asRowObject(data);
  if (!createdRow) throw new Error("AGENT_TASK_CREATE_FAILED:INVALID_ROW");

  return { task: mapTask(createdRow), reused: false };
}

export async function markAgentTaskRunning(
  supabase: SupabaseServer,
  taskId: string,
): Promise<void> {
  const { error } = await supabase
    .from("agent_tasks")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
      error_code: null,
      error_message: null,
    })
    .eq("id", taskId)
    .eq("status", "queued");

  if (error) throw new Error(`AGENT_TASK_START_FAILED:${error.message}`);
}

export async function completeAgentTask(
  supabase: SupabaseServer,
  taskId: string,
  output: unknown,
  durationMs: number,
  requiresApproval: boolean,
  traceId?: string | null,
): Promise<AgentTaskRecord> {
  const { data, error } = await supabase
    .from("agent_tasks")
    .update({
      status: requiresApproval ? "waiting_approval" : "completed",
      output: redactAgentInput(output),
      duration_ms: durationMs,
      requires_approval: requiresApproval,
      approval_status: requiresApproval ? "pending" : "not_required",
      completed_at: new Date().toISOString(),
      trace_id: traceId ?? null,
    })
    .eq("id", taskId)
    .eq("status", "running")
    .select(TASK_SELECT)
    .single();

  if (error || !data) {
    throw new Error(
      `AGENT_TASK_COMPLETE_FAILED:${error?.message ?? "No task returned"}`,
    );
  }
  const row = asRowObject(data);
  if (!row) throw new Error("AGENT_TASK_COMPLETE_FAILED:INVALID_ROW");
  return mapTask(row);
}

export async function failAgentTask(
  supabase: SupabaseServer,
  taskId: string,
  errorCode: string,
  errorValue: unknown,
  durationMs: number,
  traceId?: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("agent_tasks")
    .update({
      status: "failed",
      error_code: errorCode.slice(0, 200),
      error_message: redactAgentError(errorValue),
      duration_ms: durationMs,
      completed_at: new Date().toISOString(),
      trace_id: traceId ?? null,
    })
    .eq("id", taskId)
    .in("status", ["queued", "running"]);

  if (error) {
    console.error("[agent-task-store] Failed to mark task failed:", error.code);
  }
}

export async function listAgentTasks(
  supabase: SupabaseServer,
  options: { status?: string; agentType?: string; limit: number },
): Promise<AgentTaskRecord[]> {
  let query = supabase
    .from("agent_tasks")
    .select(TASK_SELECT)
    .order("created_at", { ascending: false })
    .limit(options.limit);

  if (options.status) query = query.eq("status", options.status);
  if (options.agentType) query = query.eq("agent_type", options.agentType);

  const { data, error } = await query;
  if (error) throw new Error(`AGENT_TASK_LIST_FAILED:${error.message}`);
  const rows = Array.isArray(data) ? data : [];
  return rows
    .map((row: unknown) => asRowObject(row))
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map((row) => mapTask(row));
}

export async function getAgentTask(
  supabase: SupabaseServer,
  taskId: string,
): Promise<AgentTaskRecord | null> {
  const { data, error } = await supabase
    .from("agent_tasks")
    .select(TASK_SELECT)
    .eq("id", taskId)
    .maybeSingle();

  if (error) throw new Error(`AGENT_TASK_READ_FAILED:${error.message}`);
  const row = asRowObject(data);
  if (!row) return null;
  return mapTask(row);
}

export async function setAgentTaskApproval(
  supabase: SupabaseServer,
  taskId: string,
  action: "approve" | "reject" | "cancel",
  note?: string,
): Promise<AgentTaskRecord> {
  const current = await getAgentTask(supabase, taskId);
  if (!current) throw new Error("AGENT_TASK_NOT_FOUND");

  if (action === "cancel") {
    if (!["queued", "waiting_approval"].includes(current.status)) {
      throw new Error("AGENT_TASK_NOT_CANCELLABLE");
    }
  } else {
    if (!current.requiresApproval) throw new Error("AGENT_APPROVAL_NOT_REQUIRED");
    if (current.status !== "waiting_approval") {
      throw new Error("AGENT_TASK_NOT_WAITING_APPROVAL");
    }
  }

  const status =
    action === "approve"
      ? "approved"
      : action === "reject"
        ? "rejected"
        : "cancelled";
  const approvalStatus =
    action === "approve"
      ? "approved"
      : action === "reject"
        ? "rejected"
        : current.approvalStatus;

  const currentOutput =
    current.output && typeof current.output === "object"
      ? (current.output as Record<string, unknown>)
      : {};

  const output = {
    ...currentOutput,
    humanDecision: {
      action,
      note: note ? redactAgentInput(note) : null,
      decidedAt: new Date().toISOString(),
    },
  };

  const { data, error } = await supabase
    .from("agent_tasks")
    .update({
      status,
      approval_status: approvalStatus,
      output,
    })
    .eq("id", taskId)
    .select(TASK_SELECT)
    .single();

  if (error || !data) {
    throw new Error(
      `AGENT_TASK_APPROVAL_FAILED:${error?.message ?? "No task returned"}`,
    );
  }
  const row = asRowObject(data);
  if (!row) throw new Error("AGENT_TASK_APPROVAL_FAILED:INVALID_ROW");
  const task = mapTask(row);
  console.info(action === "approve" ? "agent_task_approved" : action === "reject" ? "agent_task_rejected" : "agent_task_cancelled", {
    taskId: task.id,
    agentType: task.agentType,
    subjectType: task.subjectType,
    subjectId: task.subjectId,
    status: task.status,
    traceId: task.traceId,
  });
  return task;
}


/**
 * Record an already-completed automatic result, such as Intake Triage.
 * Best-effort and idempotent per subject.
 */
export async function recordAutomaticAgentResult(
  supabase: SupabaseServer,
  input: {
    agentType: "intake_triage";
    subjectType: string;
    subjectId: string;
    output: unknown;
    model: string;
    agentVersion: string;
  },
): Promise<void> {
  if (!process.env.SUPABASE_SECRET_KEY) return;

  const now = new Date().toISOString();
  const { error } = await supabase.from("agent_tasks").insert({
    agent_type: input.agentType,
    subject_type: input.subjectType,
    subject_id: input.subjectId,
    idempotency_key: `${input.agentType}:${input.subjectId}`,
    status: "completed",
    priority: "p1",
    input: { subjectId: input.subjectId },
    output: redactAgentInput(input.output),
    requires_approval: false,
    approval_status: "not_required",
    requested_by: "intake-api",
    model: input.model,
    agent_version: input.agentVersion,
    redaction_applied: true,
    started_at: now,
    completed_at: now,
  });

  if (error && error.code !== "23505") {
    console.error("[agent-task-store] Automatic task insert failed:", error.code);
  }
}
