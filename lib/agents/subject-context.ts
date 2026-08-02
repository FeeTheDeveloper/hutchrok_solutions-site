import type { getSupabaseServer } from "@/lib/supabase/server";
import type { AgentSubjectType } from "@/lib/agents/command-contracts";

type SupabaseServer = ReturnType<typeof getSupabaseServer>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function summarizeOwners(value: unknown) {
  if (!Array.isArray(value)) return { count: 0, roles: [] as string[] };

  const roles = value
    .map((owner) => {
      const row = asRecord(owner);
      return typeof row.role === "string" ? row.role.slice(0, 100) : null;
    })
    .filter((role): role is string => Boolean(role));

  return { count: value.length, roles };
}

function minimizeIntake(row: Record<string, unknown>) {
  return {
    id: row.id,
    createdAt: row.created_at,
    businessStage: row.business_stage,
    serviceNeeded: row.service_needed,
    veteranStatus: row.veteran_status,
    vvlStatus: row.vvl_status,
    businessNameProvided:
      typeof row.business_name === "string" && row.business_name.trim().length > 0,
    entityType: row.entity_type,
    businessPurpose: row.business_purpose,
    texasConfirmed: row.texas_confirmed,
    launchTimeline: row.launch_timeline,
    allOwnersVeterans: row.all_owners_veterans,
    fullyVeteranOwned: row.fully_veteran_owned,
    owners: summarizeOwners(row.owner_details),
    organizerTitle: row.organizer_title,
    registeredAgentPreference: row.registered_agent_preference,
    operatorReviewConfirmed: row.operator_review_confirmed,
    eligibilityAnswersProvided: Boolean(row.eligibility_answers),
    eligibilityAnswerKeys:
      row.eligibility_answers && typeof row.eligibility_answers === "object"
        ? Object.keys(row.eligibility_answers as Record<string, unknown>).slice(0, 25)
        : [],
    dbaNameProvided:
      typeof row.dba_name === "string" && row.dba_name.trim().length > 0,
    nonprofitPurpose: row.nonprofit_purpose,
    intakeDetailKeys:
      row.intake_detail && typeof row.intake_detail === "object"
        ? Object.keys(row.intake_detail as Record<string, unknown>).slice(0, 25)
        : [],
  };
}

async function loadIntake(
  supabase: SupabaseServer,
  intakeId: string,
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from("intake_submissions")
    .select(
      "id, created_at, business_stage, service_needed, veteran_status, vvl_status, business_name, entity_type, business_purpose, texas_confirmed, launch_timeline, all_owners_veterans, fully_veteran_owned, owner_details, organizer_title, registered_agent_preference, operator_review_confirmed, eligibility_answers, dba_name, nonprofit_purpose, intake_detail",
    )
    .eq("id", intakeId)
    .single();

  if (error || !data) {
    throw new Error(`SUBJECT_INTAKE_NOT_FOUND:${error?.message ?? intakeId}`);
  }

  return minimizeIntake(data as Record<string, unknown>);
}

async function loadCase(
  supabase: SupabaseServer,
  caseId: string,
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from("filing_cases")
    .select(
      "id, intake_id, case_number, status, assigned_to, due_date, notes, handoff_data, ops_synced_at, created_at, updated_at",
    )
    .eq("id", caseId)
    .single();

  if (error || !data) {
    throw new Error(`SUBJECT_CASE_NOT_FOUND:${error?.message ?? caseId}`);
  }

  const filingCase = data as Record<string, unknown>;
  const intakeId = String(filingCase.intake_id);
  const intake = await loadIntake(supabase, intakeId);

  const { data: documents, error: documentsError } = await supabase
    .from("case_documents")
    .select("mime, size, uploaded_at")
    .eq("case_id", caseId)
    .order("uploaded_at", { ascending: false });

  if (documentsError) {
    throw new Error(`SUBJECT_DOCUMENTS_UNAVAILABLE:${documentsError.message}`);
  }

  const documentRows = (documents ?? []) as Array<Record<string, unknown>>;
  const documentTypes = Array.from(
    new Set(
      documentRows
        .map((document) =>
          typeof document.mime === "string" ? document.mime : null,
        )
        .filter((mime): mime is string => Boolean(mime)),
    ),
  );

  const { data: events, error: eventsError } = await supabase
    .from("audit_log")
    .select("action, actor, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (eventsError) {
    throw new Error(`SUBJECT_EVENTS_UNAVAILABLE:${eventsError.message}`);
  }

  return {
    case: {
      id: filingCase.id,
      caseNumber: filingCase.case_number,
      status: filingCase.status,
      assigned: Boolean(filingCase.assigned_to),
      dueDate: filingCase.due_date,
      notesPresent:
        typeof filingCase.notes === "string" && filingCase.notes.trim().length > 0,
      handoffDataPresent: Boolean(filingCase.handoff_data),
      opsSyncedAt: filingCase.ops_synced_at,
      createdAt: filingCase.created_at,
      updatedAt: filingCase.updated_at,
    },
    intake,
    documents: {
      count: documentRows.length,
      mimeTypes: documentTypes,
      latestUploadAt: documentRows[0]?.uploaded_at ?? null,
    },
    recentEvents: (events ?? []).map((event: unknown) => {
      const row = event as Record<string, unknown>;
      return {
        action: row.action,
        createdAt: row.created_at,
      };
    }),
  };
}

async function loadPipelineSnapshot(supabase: SupabaseServer) {
  const { data: cases, error: casesError } = await supabase
    .from("filing_cases")
    .select("status, created_at, updated_at");

  if (casesError) {
    throw new Error(`PIPELINE_CASES_UNAVAILABLE:${casesError.message}`);
  }

  const countsByStatus: Record<string, number> = {};
  for (const item of cases ?? []) {
    const row = item as Record<string, unknown>;
    const status = String(row.status || "UNKNOWN");
    countsByStatus[status] = (countsByStatus[status] || 0) + 1;
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("agent_tasks")
    .select("status, agent_type, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (tasksError) {
    throw new Error(`PIPELINE_AGENT_TASKS_UNAVAILABLE:${tasksError.message}`);
  }

  const agentTaskCounts: Record<string, number> = {};
  for (const item of tasks ?? []) {
    const row = item as Record<string, unknown>;
    const status = String(row.status || "UNKNOWN");
    agentTaskCounts[status] = (agentTaskCounts[status] || 0) + 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    totalCases: (cases ?? []).length,
    caseCountsByStatus: countsByStatus,
    recentAgentTaskCountsByStatus: agentTaskCounts,
  };
}

/**
 * Load only verified, allowlisted data needed for the selected task. Contact
 * details, addresses, raw documents, bank data, and government identifiers
 * are intentionally excluded.
 */
export async function loadVerifiedSubjectContext(
  supabase: SupabaseServer,
  subjectType: AgentSubjectType,
  subjectId?: string,
): Promise<Record<string, unknown>> {
  switch (subjectType) {
    case "filing_case":
      if (!subjectId) throw new Error("SUBJECT_ID_REQUIRED");
      return loadCase(supabase, subjectId);
    case "intake_submission":
      if (!subjectId) throw new Error("SUBJECT_ID_REQUIRED");
      return loadIntake(supabase, subjectId);
    case "pipeline_snapshot":
      return loadPipelineSnapshot(supabase);
    case "internal_project":
    case "corporate_record":
      return {};
  }

  return {};
}
