# Operator Workflow — Hutchrok Solutions Group

This guide explains how to process veteran formation cases from intake to completion using the admin console.

---

## Accessing the Admin Console

Navigate to:

```
https://YOUR_DOMAIN/admin?token=YOUR_ADMIN_TOKEN
```

The admin token is required on every page load. Bookmark the full URL for quick access.

---

## Pipeline Overview

Every case flows through **9 stages** in order. The dashboard groups them into three categories:

| Category | Statuses | Meaning |
| --- | --- | --- |
| **Needs Action** | Lead, Eligibility Pending, VVL Pending, Ready for Intake | Cases waiting on client documents or operator triage |
| **In Progress** | In Review, Ready for Filing, Submitted | Cases being actively processed |
| **Closed** | Accepted, Completed | Cases finished or handed off |

### Status Progression

```
LEAD
 └→ ELIGIBILITY_PENDING    (veteran eligibility under review)
     └→ VVL_PENDING         (waiting for Veteran Verification Letter)
         └→ READY_FOR_INTAKE (VVL confirmed — intake can proceed)
             └→ IN_REVIEW    (operator reviewing intake data)
                 └→ READY_FOR_FILING  (Form 205 prepared)
                     └→ SUBMITTED      (filed with Texas SOS)
                         └→ ACCEPTED   (SOS accepted the filing)
                             └→ COMPLETED (documents delivered, case closed)
```

---

## Processing a New Case

### 1. Triage (LEAD)

When a new intake arrives, it creates a case with status **LEAD**.

- Open the case from the dashboard
- Review the applicant's contact info, business details, and ownership structure
- Check whether the applicant is a veteran (indicated by the veteran badge)
- If veteran: advance to **ELIGIBILITY_PENDING**
- If non-veteran / general inquiry: process as a standard service request

### 2. Eligibility Review (ELIGIBILITY_PENDING)

- Review eligibility quiz answers (shown if the applicant completed the quiz)
- Confirm veteran status, discharge type, Texas residence, and ownership percentage
- If eligible: advance to **VVL_PENDING**
- If not eligible: contact the client about alternative services

### 3. VVL Collection (VVL_PENDING)

The **Veteran Verification Letter (VVL)** from the Texas Veterans Commission is required for the free filing fee waiver.

- Check the VVL status indicator on the case:
  - **Has VVL** — client already has it; verify the document is uploaded
  - **Applied — Waiting on TVC** — follow up with the client periodically
  - **Not Started** — guide the client to apply at the TVC website
- A **blocking alert** (orange card) appears when VVL is missing
- Once VVL is confirmed and uploaded, use Quick Action: **"Mark VVL Received"** → advances to READY_FOR_INTAKE

### 4. Intake Verification (READY_FOR_INTAKE → IN_REVIEW)

- Verify all intake fields are complete and accurate:
  - Business name, entity type, principal address
  - Organizer name and title
  - Owner/member details with roles
  - Registered agent preference
- A **blocking alert** appears if intake data is incomplete
- When everything checks out, use Quick Action: **"Mark Intake Complete"** → advances to IN_REVIEW

### 5. Operator Review (IN_REVIEW → READY_FOR_FILING)

This is the hands-on review stage:

- Cross-reference intake data against uploaded documents
- Prepare the Texas Form 205 (Certificate of Formation — LLC)
- Verify the filing fee waiver documentation is in order
- Assign the case to yourself and set a due date
- Add internal notes about any special circumstances
- When the filing package is ready, use Quick Action: **"Ready for Filing"**

### 6. Filing Submission (READY_FOR_FILING → SUBMITTED)

- Submit the formation documents to the Texas Secretary of State
- Record the submission date in internal notes
- Use Quick Action: **"Mark as Submitted"**

### 7. Acceptance (SUBMITTED → ACCEPTED)

- Monitor for SOS response (typically 3–5 business days for fee-waived filings)
- When the SOS confirms acceptance, upload the stamped Certificate of Formation
- Use Quick Action: **"Mark as Accepted"**

### 8. Completion & Handoff (ACCEPTED → COMPLETED)

- Deliver the formation documents to the client
- If the client expressed interest in post-filing services, use the **Launch Services Handoff** section:
  - Check service interest boxes (credit enablement, EIN, business banking, etc.)
  - Set the recommended next service
  - Toggle "Case is launch-ready"
  - Add handoff notes for the services team
- Use Quick Action: **"Complete Case"**

---

## Key Features Reference

### Quick Actions

The blue Quick Actions card appears on every case detail page. It shows only the actions valid for the current status — one click advances the case to the next stage.

### Blocking Alerts

Orange alert cards appear at the top when something prevents the case from advancing:

- **"VVL document has not been uploaded"** — needs VVL before moving past VVL_PENDING
- **"Intake data appears incomplete"** — missing required fields

### Documents

- Upload PDFs, JPGs, or PNGs (max 10 MB each)
- Files are validated by extension, MIME type, and magic bytes
- Download links use time-limited signed URLs (1 hour)
- Common documents: VVL letter, Certificate of Formation, filed Form 205

### Internal Notes

Free-text area for operator-to-operator communication. Notes persist across saves and are only visible in the admin console.

### Assignment & Due Date

- Assign cases to specific team members by name
- Set due dates to track filing deadlines
- Both fields appear on the dashboard case cards for at-a-glance tracking

---

## Daily Workflow Checklist

1. Open the admin dashboard
2. Check **Needs Action** count — these are your priority cases
3. Process VVL_PENDING cases: follow up on missing VVL letters
4. Review READY_FOR_INTAKE cases: verify intake data completeness
5. Work IN_REVIEW cases: prepare filing packages
6. Check SUBMITTED cases: monitor for SOS responses
7. Complete ACCEPTED cases: deliver documents, set up handoffs
8. Review assigned cases and due dates — nothing should be overdue

---

## Troubleshooting

| Issue | Solution |
| --- | --- |
| "Unauthorized" when loading admin | Re-check the `?token=` in your bookmarked URL |
| Case not appearing after intake | Refresh the dashboard; check Supabase `filing_cases` table |
| Upload rejected | File must be PDF/JPG/PNG, under 10 MB, with valid content |
| Quick Action not showing | Quick Actions are filtered by current status — verify the case is at the expected stage |
| Save fails | Check browser console for network errors; verify Supabase connectivity |
