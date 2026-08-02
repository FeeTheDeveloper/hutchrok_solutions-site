# Deployment and production verification


## 0. Current verified production state

- [x] OpenAI production credential validated through the existing intake triage path.
- [x] Synthetic intake produced a structured `ai_triage` result.
- [x] Synthetic intake, case, and audit rows removed after validation.
- [x] Agent registry and task ledger migrations applied.
- [ ] Application overlay merged and deployed.
- [ ] Metadata-only notification logger deployed.
- [ ] Core application RLS hardened after server-secret verification.

## 1. Repository checks

- [ ] Overlay copied into the repository with paths preserved.
- [ ] Existing `lib/agents/intake-triage.ts` reviewed before replacement.
- [ ] `@openai/agents` and Zod v4 present in `package.json`.
- [ ] `node scripts/verify-agent-bundle.mjs` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] Targeted ESLint passes.
- [ ] `npm run build` passes.

## 2. Database

Production migrations `agent_command_center` and
`enable_pg_net_for_agent_jobs` are already applied to Supabase project
`igiuifkvunrnmgamyzqw`. The second migration only enables the extension; no
cron job, trigger, or outbound request is created.

- [ ] Migration history contains `agent_command_center`.
- [ ] Migration history contains `enable_pg_net_for_agent_jobs`.
- [ ] `agent_definitions` contains six rows.
- [ ] `agent_tasks` exists with RLS enabled.
- [ ] Anon and authenticated roles have no privileges on either agent table.
- [ ] Do not re-run migration 011 without comparing schema and migration
      history.

## 3. Vercel environment

Set server-side values in Production, Preview, and Development:

- [ ] `OPENAI_API_KEY`
- [ ] `SUPABASE_SECRET_KEY`
- [ ] `ADMIN_TOKEN`
- [ ] Optional `OPENAI_COMMAND_MODEL`
- [ ] Optional `OPENAI_TRIAGE_MODEL`

Do not create `NEXT_PUBLIC_OPENAI_API_KEY` or
`NEXT_PUBLIC_SUPABASE_SECRET_KEY`.

## 4. Deploy

- [ ] Merge the feature branch.
- [ ] Confirm the production deployment reaches READY.
- [ ] Confirm no secret-bearing values appear in build or runtime logs.

## 5. Health check

```bash
curl -fsS \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$SITE_URL/api/admin/agents/health"
```

Expected: `status` is `ready`, both configuration booleans are true, and the
registry is returned.

## 6. Synthetic OpenAI test

Use an existing non-sensitive test filing case or create a dedicated test
record. Do not use a real client's information.

```bash
curl -fsS -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Hutchrok-Operator: deployment-smoke-test" \
  "$SITE_URL/api/admin/agents/run" \
  --data-binary @- <<JSON
{
  "agentType": "case_action_planner",
  "subjectType": "filing_case",
  "subjectId": "$TEST_CASE_ID",
  "objective": "Create the next safe operator plan for this synthetic filing case.",
  "priority": "p2",
  "idempotencyKey": "deployment-smoke:$TEST_CASE_ID",
  "context": {"testRun": true}
}
JSON
```

Expected:

- HTTP 200;
- task status `waiting_approval`;
- structured output includes facts, assumptions, blockers, and recommended
  actions;
- retrying the same request returns `reused: true`;
- no contact data, addresses, identifiers, or private documents appear in the
  task output or Vercel logs.

## 7. Approval test

```bash
curl -fsS -X PATCH \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  "$SITE_URL/api/admin/agents/tasks/$TASK_ID" \
  --data '{"action":"reject","note":"Synthetic deployment test."}'
```

Expected: status and approval state become `rejected`; no case, message,
payment, filing, or external system changes occur.

## 8. Release gate

Keep Compliance Review, Client Success Draft, and Executive Brief disabled
until staff RBAC, approval UI, and authoritative source integrations are
complete.

## Separate P0 security work

The existing application tables and case-document storage policies must be
hardened in a separate tested migration. Do not remove their permissive
policies until all server routes are confirmed to use a server secret/service
credential, or production intake and uploads may break.
