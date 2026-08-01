# Production OpenAI validation — 2026-08-01

## Result

The existing Hutchrok Intake Triage Agent was verified end-to-end against the
production Vercel deployment and Supabase project using a synthetic record.

Validated path:

```text
POST https://www.hutchrok.com/api/intake
  -> Supabase intake submission
  -> filing case creation
  -> OpenAI Agents SDK intake triage
  -> structured Zod result
  -> audit_log action ai_triage
```

## Observed outcome

- HTTP response: `201 Created`
- Agent output: structured eligibility summary, two blocker flags, and three
  recommended next steps
- Correctly detected:
  - VVL status was `not_started`
  - the synthetic entity was not fully veteran-owned
- Bootstrap task ledger result: `completed`
- Credential verification: `passed`
- Recorded duration: `33,443 ms`

## Cleanup

The synthetic audit event, filing case, and intake submission were deleted
after verification. The production application tables returned to zero rows.
The non-client bootstrap verification record remains in `agent_tasks` as an
internal deployment record with cleanup marked `completed`.

## Privacy finding during the test

The current production notification dispatcher serialized the full `contact`
object into Vercel logs. The application overlay includes a replacement
`lib/notifications/dispatcher.ts` that logs only event metadata and whether a
contact object was present. The replacement must be merged and deployed before
real client traffic is accepted.
