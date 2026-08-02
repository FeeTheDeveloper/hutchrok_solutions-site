import { randomBytes } from "node:crypto";
import { Runner, setDefaultOpenAIKey } from "@openai/agents";
import type { getSupabaseServer } from "@/lib/supabase/server";
import type { AgentExecutionRequest } from "@/lib/agents/contracts";
import { loadAgentContext, EXISTING_SERVICE_SLUGS } from "@/lib/agents/context";
import { resolveRegisteredAgent } from "@/lib/agents/registry";
import { redactAgentError, redactAgentInput } from "@/lib/agents/redaction";
import {
  completeAgentTask, createAgentTask, failAgentTask, markAgentTaskRunning,
} from "@/lib/agents/task-store";

type SupabaseServer = ReturnType<typeof getSupabaseServer>;

function errorCode(error: unknown) {
  const message = error instanceof Error ? error.message : "AGENT_RUN_FAILED";
  const candidate = message.split(":", 1)[0];
  return /^[A-Z0-9_]{3,80}$/.test(candidate) ? candidate : "AGENT_RUN_FAILED";
}

function createTraceId() {
  return `trace_${randomBytes(16).toString("hex")}`;
}

export async function executeAgentTask(
  supabase: SupabaseServer,
  request: AgentExecutionRequest,
  requestedBy: string,
) {
  if (!process.env.SUPABASE_SECRET_KEY) throw new Error("SUPABASE_SECRET_KEY_MISSING");

  const { definition, model, agent } = await resolveRegisteredAgent(supabase, request.agentType);
  const context = redactAgentInput(await loadAgentContext(supabase, request));
  const minimizedInput = redactAgentInput({
    subjectType: request.subjectType,
    subjectId: request.subjectId,
    operatorInputKeys: Object.keys(request.input).slice(0, 25),
    context,
  });

  const created = await createAgentTask(supabase, {
    agentType: request.agentType,
    subjectType: request.subjectType,
    subjectId: request.subjectId,
    idempotencyKey: request.idempotencyKey,
    priority: request.priority,
    input: minimizedInput,
    requiresApproval: definition.requiresHumanApproval,
    requestedBy,
    model,
    agentVersion: definition.agentVersion,
  });
  if (created.reused) return { reused: true, task: created.task };

  const started = Date.now();
  const traceId = createTraceId();
  await markAgentTaskRunning(supabase, created.task.id);
  console.info("agent_run_started", {
    taskId: created.task.id, agentType: request.agentType, subjectType: request.subjectType,
    subjectId: request.subjectId, status: "running", traceId,
  });

  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");
    setDefaultOpenAIKey(apiKey);

    const runner = new Runner({
      workflowName: `hutchrok_${request.agentType}`,
      traceId,
      traceIncludeSensitiveData: false,
    });
    const result = await runner.run(agent, JSON.stringify({
      subjectType: request.subjectType,
      subjectId: request.subjectId,
      priority: request.priority,
      context,
    }));
    if (!result.finalOutput) throw new Error("AGENT_EMPTY_OUTPUT");

    if (request.agentType === "service_router") {
      const slug = (result.finalOutput as { recommendedServiceSlug?: string | null }).recommendedServiceSlug;
      if (slug && !EXISTING_SERVICE_SLUGS.has(slug)) throw new Error("SERVICE_SLUG_NOT_IN_CATALOG");
    }

    const durationMs = Date.now() - started;
    const task = await completeAgentTask(
      supabase, created.task.id, result.finalOutput, durationMs,
      definition.requiresHumanApproval, traceId,
    );
    console.info("agent_run_completed", {
      taskId: task.id, agentType: request.agentType, subjectType: request.subjectType,
      subjectId: request.subjectId, status: task.status, durationMs, traceId,
    });
    return { reused: false, task };
  } catch (error) {
    const durationMs = Date.now() - started;
    const code = errorCode(error);
    await failAgentTask(supabase, created.task.id, code, redactAgentError(error), durationMs, traceId);
    console.error("agent_run_failed", {
      taskId: created.task.id, agentType: request.agentType, subjectType: request.subjectType,
      subjectId: request.subjectId, status: "failed", durationMs, traceId, errorCode: code,
    });
    throw new Error(code);
  }
}
