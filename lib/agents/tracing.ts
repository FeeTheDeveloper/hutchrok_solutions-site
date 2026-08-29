/**
 * Optional app-level tracing harness for `@openai/agents`.
 *
 * This remains runtime-agnostic for Vercel/Node. If a runtime-specific tracer
 * is registered on `globalThis.__HUTCHROK_TRACING__`, agent turns are wrapped
 * with spans; otherwise this is a no-op.
 */

interface TraceableSpan {
  setAttribute(key: string, value: unknown): void;
}

interface Tracing {
  enterSpan<T>(name: string, callback: (span: TraceableSpan) => T | Promise<T>): Promise<T>;
}

interface GlobalTracingContext {
  __HUTCHROK_TRACING__?: Tracing;
}

function getTracing(): Tracing | null {
  return (globalThis as GlobalTracingContext).__HUTCHROK_TRACING__ ?? null;
}

export interface AgentIdentity {
  /** Shared logical agent name, e.g. "hutchrok_case_action_planner". Never per-request data. */
  agentName: string;
  /** Stable identifier for the agent instance/deployment. */
  agentId: string;
  /** Groups turns into a session — e.g. the case or conversation this turn belongs to. */
  conversationId: string;
}

function setIdentityAttributes(
  span: TraceableSpan,
  identity: AgentIdentity,
  operation: "invoke_agent" | "chat",
) {
  span.setAttribute("gen_ai.operation.name", operation);
  span.setAttribute("gen_ai.agent.name", identity.agentName);
  span.setAttribute("gen_ai.agent.id", identity.agentId);
  span.setAttribute("gen_ai.conversation.id", identity.conversationId);
}

/**
 * Wraps one agent turn in an `invoke_agent` span containing a nested `chat`
 * span when tracing is available.
 */
export async function traceAgentTurn<T>(
  identity: AgentIdentity,
  model: string,
  run: () => Promise<T>,
): Promise<T> {
  const tracing = getTracing();
  if (!tracing) return run();

  return tracing.enterSpan(`invoke_agent ${identity.agentName}`, async (span) => {
    setIdentityAttributes(span, identity, "invoke_agent");
    return tracing.enterSpan(`chat ${model}`, async (chatSpan) => {
      setIdentityAttributes(chatSpan, identity, "chat");
      chatSpan.setAttribute("gen_ai.request.model", model);
      return run();
    });
  });
}
