# Filing Type → Form Routing Guide

This document maps each filing type to the correct Texas Secretary of State (SOS) or state agency form. Use it to route incoming cases to the appropriate forms and checklists during the filings workflow.

## Routing Table

| Filing Type | Entity Type | Primary Form(s) | Notes / Checklist Items |
| --- | --- | --- | --- |
| LLC Formation (Texas) | Limited Liability Company | Form 205 (`205_boc.pdf`) | Requires registered agent info, management structure (member-managed or manager-managed), organizer signature |
| For-Profit Corp Formation (Texas) | For-Profit Corporation | Form 201 (`201_boc.pdf`) | Requires share structure, registered agent, initial directors, incorporator signature |
| Nonprofit Corp Formation (Texas) | Nonprofit Corporation | Form 202 (`202_boc.pdf`) | Requires purpose clause (IRS-compliant if seeking 501(c)(3)), registered agent, initial directors |
| Veteran-Owned Business Certification | Any (existing entity) | Form 05-904 (`05-904.pdf`) | Requires TVC verification letters, ownership percentage documentation (must total 100% veteran ownership), DD-214 or equivalent |

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
