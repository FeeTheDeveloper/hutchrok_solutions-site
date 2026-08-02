# Add Hutchrok Agent Command Center

## Architecture summary

Adds a server-only agent registry, allowlisted context loaders, recursive redaction, an idempotent task ledger, structured OpenAI Agents SDK execution, and operator approval endpoints. Browser input cannot select a model or system prompt.

## Agents implemented

- Case Action Planner: structured recommendation only.
- Service Router: routes only to the server-side Hutchrok service catalog.
- Existing Intake Triage remains integrated and registered.
- Compliance Review, Client Success Draft, and Executive Brief remain registered but disabled/unavailable for operator execution until separately implemented.

## API routes

- `GET /api/admin/agents/health`
- `POST /api/admin/agents/run`
- `GET /api/admin/agents/tasks`
- `GET/PATCH /api/admin/agents/tasks/[id]`

All require `Authorization: Bearer <ADMIN_TOKEN>`; query-string-only tokens are rejected.

## Approval boundaries

Agents analyze, route, prioritize, recommend, and draft. Approval records an operator decision in `agent_tasks` only. It never submits filings, changes case status, sends messages, charges/refunds customers, alters government/banking/tax records, or deletes documents.

## Database changes and security findings

The additive registry/task migration already exists. A separate review-only core RLS migration is included but must not be applied until Preview validation and explicit human approval. Existing core tables and Storage currently have permissive anonymous policies; see `docs/AGENT_COMMAND_CENTER_SECURITY_PLAN.md`.

## Tests run

See the final PR checks and handoff for exact results: agent harness, TypeScript, ESLint, and Next.js production build.

## Known limitations

- Rate limiting is in-memory/per-instance.
- Only planner/router are operator-executable in Phase 1.
- Live agent output depends on model access and database registry state.
- Legacy non-agent admin routes still support query tokens.

## Required Vercel variables

`OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, and `ADMIN_TOKEN`; optional `OPENAI_COMMAND_MODEL`.

## Production verification plan

Deploy to Preview, verify unauthorized/query-token rejection, run planner/router against synthetic records, test idempotency and decisions, then execute every regression in the security plan. Do not apply the core RLS migration until reviewed and explicitly approved.
