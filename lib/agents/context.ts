import { LAUNCH_OFFERS } from "@/lib/launch-offers";
import { SERVICE_REQUEST_OPTIONS } from "@/lib/paid-services";
import { loadVerifiedSubjectContext } from "@/lib/agents/subject-context";
import type { AgentExecutionRequest } from "@/lib/agents/contracts";
import type { getSupabaseServer } from "@/lib/supabase/server";

type SupabaseServer = ReturnType<typeof getSupabaseServer>;

export async function loadAgentContext(supabase: SupabaseServer, request: AgentExecutionRequest) {
  const authoritative = await loadVerifiedSubjectContext(supabase, request.subjectType, request.subjectId);
  if (request.agentType !== "service_router") return { authoritative };

  return {
    authoritative,
    serviceCatalog: {
      paidServices: SERVICE_REQUEST_OPTIONS.map(({ slug, title, tag, description }) => ({ slug, title, tag, description })),
      launchOffers: LAUNCH_OFFERS.map(({ slug, title, description }) => ({ slug, title, description })),
      consultingRoutes: [
        { slug: "gov-housing-consulting", division: "government_housing" },
        { slug: "federal-contract-prep", division: "government_contracting" },
      ],
    },
  };
}

export const EXISTING_SERVICE_SLUGS = new Set([
  ...SERVICE_REQUEST_OPTIONS.map((service) => service.slug),
  ...LAUNCH_OFFERS.map((offer) => offer.slug),
  "gov-housing-consulting",
  "federal-contract-prep",
]);
