import type { getSupabaseServer } from "@/lib/supabase/server";
import type { CommandTaskInput } from "@/lib/agents/command-contracts";
import {
  redactAgentError,
  redactAgentInput,
  redactAgentText,
} from "@/lib/agents/redaction";
import { loadVerifiedSubjectContext } from "@/lib/agents/subject-context";
import { runHutchrokCommand } from "@/lib/agents/hutchrok-command";
import {
  completeAgentTask,
  createAgentTask,
  failAgentTask,
  getAgentDefinition,
  markAgentTaskRunning,
} from "@/lib/agents/task-store";

type SupabaseServer = ReturnType<typeof getSupabaseServer>;

export async function executeCommandTask(
  supabase: SupabaseServer,
  input: CommandTaskInput,
  requestedBy: string,
) {
  const definition = await getAgentDefinition(supabase, input.agentType);
  if (!definition) throw new Error("AGENT_DEFINITION_NOT_FOUND");
  if (!definition.enabled) throw new Error("AGENT_DISABLED");

  const model = process.env.OPENAI_COMMAND_MODEL || definition.defaultModel;
  const verifiedContext = await loadVerifiedSubjectContext(
    supabase,
    input.subjectType,
    input.subjectId,
  );
  const operatorContext = redactAgentInput(input.context);
  const safeObjective = redactAgentText(input.objective);
  const safeContext = redactAgentInput({
    verifiedContext,
    operatorContext,
  });
  const safeInput: CommandTaskInput = {
    ...input,
    objective: safeObjective,
    context: {},
  };

  const created = await createAgentTask(supabase, {
    agentType: input.agentType,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    idempotencyKey: input.idempotencyKey,
    priority: input.priority,
    input: {
      objective: safeObjective,
      verifiedContext,
      operatorContext,
    },
    requiresApproval: definition.requiresHumanApproval,
    requestedBy,
    model,
    agentVersion: definition.agentVersion,
  });

  if (created.reused) {
    return {
      reused: true,
      task: created.task,
    };
  }

  const startedAt = Date.now();
  await markAgentTaskRunning(supabase, created.task.id);

  try {
    const output = await runHutchrokCommand(safeInput, safeContext, model);
    const durationMs = Date.now() - startedAt;
    const requiresApproval =
      definition.requiresHumanApproval || output.approvalRequired;

    const task = await completeAgentTask(
      supabase,
      created.task.id,
      output,
      durationMs,
      requiresApproval,
    );

    console.info("[hutchrok-agent] completed", {
      taskId: task.id,
      agentType: input.agentType,
      status: task.status,
      durationMs,
      model,
    });

    return {
      reused: false,
      task,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const safeMessage = redactAgentError(error);
    const code = safeMessage.includes(":")
      ? safeMessage.split(":", 1)[0]
      : safeMessage;

    await failAgentTask(
      supabase,
      created.task.id,
      code || "AGENT_RUN_FAILED",
      error,
      durationMs,
    );

    console.error("[hutchrok-agent] failed", {
      taskId: created.task.id,
      agentType: input.agentType,
      durationMs,
      code,
    });
    throw error;
  }
}
