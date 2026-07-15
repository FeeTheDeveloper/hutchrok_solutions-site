# Federal Contract Prep — Service Line

> Note: this directory was referenced as the copy source (`README.md`,
> `service-offer.md`, `sop-contract-prep.md`) but did not exist in the repo
> when the service line was built. This README documents the offer **as
> implemented** from the build brief. Replace/expand with the full
> service-offer and SOP docs when available — the code pulls copy from
> `lib/consulting/federal-contract-prep.ts`, not from these docs.

## Offer

Consulting that gets small businesses federal-ready. Hutchrok Solutions
Group LLC — veteran-owned, UEI PT36H4F81AU9, SAM.gov registration in
progress.

| Tier | Fee | Scope |
| --- | --- | --- |
| Strategic Roadmap | `FEDERAL_FEE_ROADMAP` env (placeholder `$[FEE_1]`) | Flat-fee strategy session: readiness gap review, NAICS shortlist, written roadmap |
| Operational Blueprint | `FEDERAL_FEE_BLUEPRINT` env (placeholder `$[FEE_2]`) | Document + SAM.gov registration readiness, capability statement, 30-day follow-up |
| Concierge | `FEDERAL_FEE_CONCIERGE` env (placeholder `$[FEE_3]`) | Certification navigation, opportunity monitoring, renewal management, quarterly reviews |

Display fees are env-driven — set the three variables in Vercel to replace
the placeholders.

## Intake (Stage 1)

Route: `/services/federal-contract-prep` → `POST /api/federal-intake`.
Fields: contact, legal entity name (exact IRS match), state of formation,
entity type, EIN status (have / don't-have **only**), revenue lines,
employee count, annual receipts range, veteran status (self-reported),
SAM.gov attempt history, TCPA-style consent.

Readiness score (server-side only, never returned to the client):
+25 has EIN · +25 entity formed · +25 receipts documented · +25 no stalled
SAM attempt.

## Guardrails (structural — do not relax)

- Never collect SSN, EIN numbers, bank info, or login credentials.
- No SDVOSB/VOSB certification claims in any copy.
- No award guarantees or influence language.
- Lead scoring stays server-side.
- Required disclaimer (verbatim, near submit and in the page footer):
  "Operational business consulting only — not legal or tax advice. No
  contract awards are guaranteed. Verify requirements at SAM.gov and
  SBA.gov."

## Open TODOs

- `TODO(federal-intake-db)` — `federal_intake_cases` table migration +
  live Supabase insert (`app/api/federal-intake/route.ts`).
- `TODO(federal-intake-email)` — Resend notification to ceo@hutchrok.com.
- Set `FEDERAL_FEE_ROADMAP` / `FEDERAL_FEE_BLUEPRINT` / `FEDERAL_FEE_CONCIERGE`.
