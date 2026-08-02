import type { AgentType } from "@/lib/agents/contracts";
import { createCaseActionPlanner } from "@/lib/agents/case-action-planner";
import { createServiceRouter } from "@/lib/agents/service-router";
import { getAgentDefinition, type AgentDefinition } from "@/lib/agents/task-store";
import type { getSupabaseServer } from "@/lib/supabase/server";

type SupabaseServer = ReturnType<typeof getSupabaseServer>;
type ExecutableAgent =
  | ReturnType<typeof createCaseActionPlanner>
  | ReturnType<typeof createServiceRouter>;
type AgentFactory = (model: string) => ExecutableAgent;

const STATIC_REGISTRY: Record<AgentType, { implementation: AgentFactory | null }> = {
  intake_triage: { implementation: null },
  case_action_planner: { implementation: createCaseActionPlanner },
  service_router: { implementation: createServiceRouter },
  compliance_review: { implementation: null },
  client_success_draft: { implementation: null },
  executive_brief: { implementation: null },
};

export const REGISTERED_AGENT_COUNT = Object.keys(STATIC_REGISTRY).length;

export async function resolveRegisteredAgent(
  supabase: SupabaseServer,
  agentType: AgentType,
): Promise<{ definition: AgentDefinition; model: string; agent: ExecutableAgent }> {
  const metadata = STATIC_REGISTRY[agentType];
  if (!metadata) throw new Error("AGENT_UNKNOWN");
  const definition = await getAgentDefinition(supabase, agentType);
  if (!definition) throw new Error("AGENT_DEFINITION_NOT_FOUND");
  if (!definition.enabled) throw new Error("AGENT_DISABLED");
  if (!metadata.implementation) throw new Error("AGENT_NOT_IMPLEMENTED");

  const envModel = process.env.OPENAI_COMMAND_MODEL?.trim();
  const model = envModel || definition.defaultModel;
  if (!model) throw new Error("AGENT_MODEL_NOT_CONFIGURED");
  return { definition, model, agent: metadata.implementation(model) };
}
