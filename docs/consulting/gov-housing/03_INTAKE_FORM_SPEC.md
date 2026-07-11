# Client Intake Form — Gov-Housing Consulting

**Repo Location:** `docs/consulting/gov-housing/03_INTAKE_FORM_SPEC.md`
**Implementation target:** extend the existing `/contact` intake flow (`components/intake-form.tsx`, `lib/validation.ts`, `intake_submissions` table)

---

## Integration Plan (Minimal Change, Reuses Existing Pipeline)
1. Add `"gov-housing-consulting"` to the `service_needed` enum in `lib/validation.ts` (Zod) and `lib/types.ts`.
2. Store structured answers below as JSON in `message`, or add a nullable `intake_detail jsonb` column to `intake_submissions` (preferred — one migration, no new table).
3. Existing trigger auto-creates the `filing_cases` record (`HSG-YYYY-XXXX`) — no changes needed to case management.
4. Power Automate `case.created` event already fires → route gov-housing cases to a dedicated SharePoint folder template.

## Intake Questions

### A. Contact & Entity
1. Full name / entity name holding title
2. Email / phone
3. Is the property held personally or in an LLC/trust?
4. Veteran status (Yes/No) — *for benefit-eligibility routing only; non-veterans are welcome clients but are ineligible for veteran-specific benefits*

### B. Property Profile
5. Property address, city, ZIP
6. Property type (SFR / duplex / multifamily / land)
7. Number of units available for lease
8. Bedrooms/bathrooms per available unit
9. Year built (pre-1978 triggers lead-paint requirements)
10. Current condition self-rating (turn-key / minor repairs / major rehab)
11. Currently occupied or vacant?
12. Target monthly rent

### C. Program Readiness
13. Have you ever leased to a Section 8 / voucher tenant? (Y/N)
14. Are you registered with your local housing authority as a landlord? (Y/N/unsure)
15. Do you know which PHA serves this address? (capture name if yes)
16. Timeline to have a tenant placed (30/60/90+ days)
17. Interest scope: single placement / portfolio conversion / project-based vouchers / federal development

### D. Federal Contracting (conditional — only if D-17 includes development or contracting)
18. SAM.gov registration status (active / expired / none)
19. UEI number (if any)
20. Any existing government contract experience

### E. Engagement Fit
21. What outcome defines success in 12 months?
22. Budget authority confirmed for consulting fees? (Y/N)
23. Preferred communication channel

## Scoring / Routing Logic
- **Fast-track (Pathway A):** vacant unit + turn-key condition + PHA known → move directly to Readiness tier proposal.
- **Standard:** occupied or repairs needed → Insight tier first; readiness gap report is the first paid deliverable.
- **Escalate (Pathway B/D):** portfolio conversion or development interest → schedule strategy session; Concierge tier scoping.

---

## Implementation Notes (as built)

- **Placement:** delivered as a dedicated page at **`/gov-housing-consulting`** (the veteran LLC filing wizard still owns `/contact`). The same intake pipeline is reused — POST `/api/intake` with `formType: "gov-housing-consulting"`, which inserts an `intake_submissions` row and auto-creates the `filing_cases` record.
- **Storage:** the 23 structured answers are persisted to the new nullable **`intake_detail jsonb`** column (migration 008), alongside the computed routing result.
- **Routing:** `lib/consulting/gov-housing.ts#routeGovHousingIntake` implements the scoring above (escalate takes precedence over fast-track, else standard) and the computed pathway is stored in `intake_detail.routing` and shown to the client on submit.
- **Federal section (D)** is shown only when `interestScope` includes `federal_development`.
- **service_needed** value: `gov-housing-consulting`; `business_stage`: `consulting`.
- Files: `components/gov-housing-intake-form.tsx`, `app/gov-housing-consulting/page.tsx`, `lib/consulting/gov-housing.ts`, schema in `lib/validation.ts` (`govHousingIntakeSchema`), API branch in `app/api/intake/route.ts`, migration `lib/db/migration-008-intake-detail.sql`.
