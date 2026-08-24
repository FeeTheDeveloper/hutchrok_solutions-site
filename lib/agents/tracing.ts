/**
 * Cloudflare Workers agent tracing for our `@openai/agents` custom harness.
 *
 * Cloudflare's Agents dashboard doesn't auto-instrument third-party SDKs like
 * `@openai/agents`, so each turn is wrapped manually in an `invoke_agent`
 * span with a nested `chat` span, per:
 * https://developers.cloudflare.com/agents/runtime/operations/observability/tracing/#custom-harnesses
 *
 * Metadata only (no message/tool payloads) — this app handles veteran/
 * business PII, so we don't record `gen_ai.input.messages` etc.
 *
 * No-ops outside the Cloudflare Workers runtime (e.g. `next build` or
 * `next dev` without `initOpenNextCloudflareForDev()` wired up), so this is
 * safe to call from any environment.
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface TraceableSpan {
  setAttribute(key: string, value: unknown): void;
}

interface Tracing {
  enterSpan<T>(name: string, callback: (span: TraceableSpan) => T | Promise<T>): Promise<T>;
}

function getTracing(): Tracing | null {
  try {
    const ctx = getCloudflareContext().ctx as { tracing?: Tracing } | undefined;
    return ctx?.tracing ?? null;
  } catch {
    return null;
  }
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
 * span, matching the standard Cloudflare agent trace structure.
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
