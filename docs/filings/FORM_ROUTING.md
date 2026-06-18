# Filing Type → Form Routing Guide

This document maps each filing type to the correct Texas Secretary of State (SOS) or state agency form. Use it to route incoming cases to the appropriate forms and checklists during the filings workflow.

## Routing Table

| Filing Type | Entity Type Key | Primary Form(s) | Notes / Checklist Items |
| --- | --- | --- | --- |
| LLC Formation (Texas) | `llc` | Form 205 (`205_boc.pdf`) | Requires registered agent info, management structure (member-managed or manager-managed), organizer signature |
| For-Profit Corp Formation (Texas) | `corp` | Form 201 (`201_boc.pdf`) | Requires share structure, registered agent, initial directors, incorporator signature |
| Nonprofit Corp Formation (Texas) | `nonprofit` | Form 202 (`202_boc.pdf`) | Requires purpose clause (IRS-compliant if seeking 501(c)(3)), registered agent, initial directors |
| Professional Corp Formation (Texas) | `professional_corp` | Form 203 (`203_boc.pdf`) | Licensed professional services; requires registered agent, initial directors, incorporator signature, professional-service purpose statement |
| Professional Association Formation (Texas) | `professional_association` | Form 204 (`204_boc.pdf`) | For associations of licensed professionals; requires registered agent and governing-authority details |
| Professional LLC Formation (Texas) | `professional_llc` | Form 206 (`206_boc.pdf`) | Licensed professional LLC; requires registered agent, management structure, professional-service purpose statement |
| Limited Partnership Formation (Texas) | `limited_partnership` | Form 207 (`207_boc.pdf`) | Requires general partner(s), registered agent, partnership details |
| Veteran-Owned Business Certification | Any (existing entity) | Form 05-904 (`05-904.pdf`) | Requires TVC verification letters, ownership percentage documentation (must total 100% veteran ownership), DD-214 or equivalent |

> **Form source:** Official current versions of all formation forms above are bundled in this directory (`docs/filings/`). Entity-type keys match `ENTITY_TEMPLATE_MAP` in [`lib/filings/template-map.ts`](../../lib/filings/template-map.ts). Always re-verify the latest version against the [Texas Secretary of State](https://www.sos.state.tx.us/corp/forms_702.shtml) before filing.

## Workflow Notes

1. **Intake → Case Creation**: When a new intake is submitted with a `serviceNeeded` of `formation-filings`, the system creates a filing case with status `NEW`.
2. **Admin Review**: Admin reviews the case, identifies entity type and state, then routes to the correct form(s) from this table.
3. **Document Collection**: Admin requests required supporting documents from the client via the case notes and status updates.
4. **Filing Submission**: Once all documents are collected and reviewed, admin files with the appropriate state agency.
5. **Confirmation**: Status moves to `FILED` → `COMPLETED` once confirmation is received from the SOS.

## Important

- Always verify current form versions and requirements directly with the [Texas Secretary of State](https://www.sos.state.tx.us/corp/forms_702.shtml) before filing.
- This guide is for internal routing purposes only and does not constitute legal advice.
- Requirements may change — confirm with the client and SOS before submission.
