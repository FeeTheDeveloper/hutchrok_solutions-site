# Hutchrok Agent Command Center

## Mission

Use the OpenAI Agents SDK inside the Hutchrok application to reduce operator
workload while preserving human control over filing, legal, financial,
client-message, and government-facing actions.

The first release intentionally uses one command agent with task-specific
instructions rather than a large multi-agent graph. The task ledger is the
control plane; the agent is the recommendation engine.

## Agent inventory

| Agent type | Initial state | Trigger | Human approval | Purpose |
| --- | --- | --- | --- | --- |
| `intake_triage` | Enabled | Automatic after veteran intake | No; advisory | Flags intake readiness and eligibility risks |
| `case_action_planner` | Enabled | Operator API call | Required | Produces the next safe case actions |
| `service_router` | Enabled | Operator API call | Required | Routes a request to the right Hutchrok division |
| `compliance_review` | Disabled | Future scheduled/operator run | Required | Flags conflicts, missing evidence, and expirations |
| `client_success_draft` | Disabled | Future operator run | Required | Drafts factual client updates; never sends |
| `executive_brief` | Disabled | Future scheduled/operator run | Required | Produces pipeline and operational briefs |

## Hard authority boundary

The command agent may analyze, classify, summarize, route, prioritize, and
draft. It may not autonomously:

- submit, sign, or amend a government filing;
- change a case status or customer record;
- send an email, text message, or notification;
- charge a customer, issue a refund, extend credit, or move money;
- modify banking, tax, SAM, ownership, or certification records;
- publish content or make a contractual commitment;
- promise funding, approval, benefits, awards, certification, filing dates, or
  housing placement.

## Verified-context loading

The application loads allowlisted data server-side before calling the model.

- `filing_case` loads case status, due date, non-contact intake facts, document
  counts/types, and recent event names.
- `intake_submission` loads non-contact business and readiness facts.
- `pipeline_snapshot` loads aggregate case and recent agent-task counts.
- `internal_project` and `corporate_record` depend on redacted operator context
  until dedicated authoritative sources are connected.

The loader excludes contact details, addresses, raw document contents,
filenames, bank data, tax identifiers, and full government identifiers.

## Database controls

### `agent_definitions`

Server-side capability registry containing enablement, model, version, trigger,
and approval requirements.

### `agent_tasks`

Task and result ledger containing:

- task type and subject;
- idempotency key;
- status and priority;
- redacted input and structured output;
- model and agent version;
- execution duration and safe error code;
- approval state and operator decision.

Both tables have RLS enabled, no anonymous/authenticated policies, and explicit
privileges only for `service_role`. The Next.js routes therefore require
`SUPABASE_SECRET_KEY`.

## API contract

Every route requires:

```http
Authorization: Bearer <ADMIN_TOKEN>
```

The legacy `?token=` pattern is intentionally rejected for agent routes.

### Health

```http
GET /api/admin/agents/health
```

Returns configuration booleans, registry metadata, and safe recent-task
summaries. It checks key presence, not OpenAI-key validity.

### Run a filing-case plan

```http
POST /api/admin/agents/run
Content-Type: application/json
```

```json
{
  "agentType": "case_action_planner",
  "subjectType": "filing_case",
  "subjectId": "00000000-0000-0000-0000-000000000000",
  "objective": "Create the next safe operator plan for this filing case.",
  "priority": "p1",
  "idempotencyKey": "case-plan:<case-id>:<case-updated-at>",
  "context": {}
}
```

### Route an intake

```json
{
  "agentType": "service_router",
  "subjectType": "intake_submission",
  "subjectId": "00000000-0000-0000-0000-000000000000",
  "objective": "Route this request to the correct Hutchrok division and define the operator handoff.",
  "priority": "p2",
  "idempotencyKey": "service-route:<intake-id>",
  "context": {}
}
```

### List tasks

```http
GET /api/admin/agents/tasks?limit=25&status=waiting_approval&agentType=case_action_planner
```

Task inputs are omitted from list responses.

### Read a task

```http
GET /api/admin/agents/tasks/<task-id>
```

Add `?includeInput=true` only for authorized troubleshooting. Stored inputs are
already minimized and redacted.

### Record a decision

```http
PATCH /api/admin/agents/tasks/<task-id>
Content-Type: application/json
```

```json
{
  "action": "approve",
  "note": "Operator reviewed the recommendation."
}
```

Allowed actions: `approve`, `reject`, and `cancel`. Approval records a human
decision only; no external action is executed.

## Observability

Safe log fields:

- task ID;
- agent type;
- task status;
- model;
- duration;
- safe error code.

Never log prompts, raw context, model outputs, contact data, addresses, private
documents, financial data, government identifiers, or secret values.
