# Hutchrok Solutions Group — Intake → Filing Cases → Admin Console

Compliance-first intake system for business formation and filings workflow. Captures client information, auto-creates filing cases, and provides an admin console for case management, document uploads, and status tracking — ready for Microsoft 365 operational wiring.

---

## Features

- **Intake form submission** → persists to Supabase + auto-creates a filing case with a unique case number
- **Admin console** to manage cases, update statuses, add notes, and assign team members
- **Document uploads** to a private Supabase Storage bucket with signed-URL downloads
- **Zod validation** shared between client and server for consistent field-level errors
- **Rate limiting** on public endpoints (in-memory, Vercel-safe)
- **Backend-ready foundation** for Microsoft 365 operational workflows (SharePoint, Power Automate, Lists)

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase Postgres |
| File Storage | Supabase Storage (private bucket + signed URLs) |
| Validation | Zod (shared client/server schema) |
| Deployment | Vercel |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev
```

**Requirements:** Node.js 20+, npm 9+

---

## Environment Variables

Create a `.env.local` file in the project root (and set these in your Vercel project settings for production):

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI...your-anon-key
ADMIN_TOKEN=some-strong-random-secret
```

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL (Settings → API) |
| `SUPABASE_ANON_KEY` | Supabase anon/public key (Settings → API) |
| `ADMIN_TOKEN` | Shared secret used to protect the admin console via `?token=...` query param. Replace with real auth (NextAuth, Clerk, etc.) in a future iteration. |
| `OPS_TOKEN` | Shared secret that Power Automate (or any external caller) sends in the `X-Ops-Token` header to authenticate ops integration endpoints. |
| `OPS_WEBHOOK_URL` | *(Optional)* Power Automate HTTP-trigger URL. When set, the app emits outbound webhook events on status changes and document inserts. |

> **Never commit `.env.local` to the repository.** The `.gitignore` already excludes it.

---

## Supabase Setup

1. Create a [Supabase](https://supabase.com) project (free tier works).
2. Open the **SQL Editor** in the Supabase dashboard.
3. Paste and run the contents of [`lib/db/schema.sql`](lib/db/schema.sql) — this creates all three tables, indexes, triggers, and RLS policies.
4. Go to **Storage** in the dashboard.
5. Create a new bucket named **`case-documents`** and set it to **Private**.
6. Copy your **Project URL** and **anon/public key** from **Settings → API** and add them to `.env.local`.

> Storage downloads use signed URLs generated server-side. No public access is needed on the bucket.

---

## Demo Script (5 minutes)

A step-by-step walkthrough to demonstrate the full intake-to-filing workflow. For a detailed QA checklist, see [`docs/DEMO_CHECKLIST.md`](docs/DEMO_CHECKLIST.md).

### 1. Submit an Intake

1. Visit **`/contact`**
2. Fill out and submit the intake form with valid data
3. Note the **case number** returned on success (e.g., `HSG-2026-0001`)

### 2. Open the Admin Console

1. Visit **`/admin?token=YOUR_ADMIN_TOKEN`**
2. The case list shows the new submission with status `NEW`

### 3. Manage the Case

1. Click the case row → opens **`/admin/cases/[id]?token=...`**
2. Update status to `IN_REVIEW`, add notes, set a due date
3. Save changes — verify they persist on reload

### 4. Upload a Document

1. On the case detail page, scroll to **Documents**
2. Upload a PDF or image (max 10 MB)
3. Verify it appears in the list with a download link (signed URL)
4. Optionally delete the document to verify removal

---

## Routes

| Route | Method | Description |
| --- | --- | --- |
| `/` | GET | Home — hero, trust band, authority signals, services, concierge |
| `/contact` | GET | Intake form + contact info |
| `/services` | GET | Detailed services + engagement packages |
| `/formation-filings` | GET | Formation & filings details + FAQ |
| `/credit-enablement` | GET | Business credit readiness & enablement |
| `/veteran-owned` | GET | Brand story + veteran operator mindset |
| `/mission` | GET | Mission pillars + systems-first blueprint |
| `/free-filing` | GET | Core conversion page — $0 filing for veterans |
| `/eligibility` | GET | Eligibility quiz with process transparency |
| `/how-it-works` | GET | 5-step filing process walkthrough |
| `/verification-help` | GET | TVC verification letter guidance |
| `/launch-services` | GET | Post-filing service packages |
| `/faq` | GET | Frequently asked questions |
| `/guides` | GET | SEO content hub — 10 veteran-focused guides |
| `/guides/[slug]` | GET | Individual guide pages (10 routes) |
| `/admin?token=...` | GET | Admin console — case list with status filter |
| `/admin/cases/[id]?token=...` | GET | Case detail — edit status, notes, docs |
| `/api/intake` | POST | Submit intake (Zod validated, rate limited) |
| `/api/admin/cases?token=...` | GET | List all cases (optional `status` filter) |
| `/api/admin/cases/[id]?token=...` | GET/PATCH | Read or update a single case |
| `/api/cases/[id]/upload?token=...` | POST | Upload a document (multipart, 10 MB max) |
| `/api/cases/[id]/documents?token=...` | GET/DELETE | List documents / delete a document |
| `/api/ops/case-linked` | POST | Power Automate → link SharePoint folder to a case |
| `/api/ops/status-sync` | POST | Power Automate → sync case status from M365 |
| `/api/ops/doc-published` | POST | Power Automate → mark a document as published to SharePoint |

---

## Data Model

Three tables in Supabase Postgres (see [`lib/db/schema.sql`](lib/db/schema.sql) for full DDL):

### `intake_submissions`

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid (PK) | Auto-generated |
| `created_at` | timestamptz | Submission timestamp |
| `name` | text | Client full name |
| `email` | text | Client email |
| `phone` | text | Client phone |
| `business_stage` | text | Selected business stage |
| `service_needed` | text | Selected service type |
| `message` | text | Optional message |

### `filing_cases`

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid (PK) | Auto-generated |
| `intake_id` | uuid (FK) | References `intake_submissions` |
| `case_number` | text (unique) | Format: `HSG-YYYY-XXXX` |
| `status` | text | `NEW` · `IN_REVIEW` · `NEEDS_INFO` · `IN_PROGRESS` · `FILED` · `COMPLETED` |
| `assigned_to` | text | Team member name |
| `due_date` | date | Target completion date |
| `notes` | text | Admin notes |
| `sharepoint_folder_url` | text | URL of the SharePoint case folder (set by ops integration) |
| `ms_list_item_id` | text | Microsoft Lists item ID (set by ops integration) |
| `ops_synced_at` | timestamptz | Timestamp of last ops sync event |
| `created_at` | timestamptz | Case creation time |
| `updated_at` | timestamptz | Auto-updated on change |

### `case_documents`

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid (PK) | Auto-generated |
| `case_id` | uuid (FK) | References `filing_cases` |
| `filename` | text | Original file name |
| `mime` | text | MIME type |
| `size` | int | Bytes |
| `storage_path` | text | Path in Supabase Storage bucket |
| `sharepoint_item_id` | text | SharePoint item ID (set by ops integration) |
| `uploaded_at` | timestamptz | Upload timestamp |

---

## Filing Document Support (Texas)

Reference forms used for routing and checklisting in the filings workflow. Placeholders are included under [`docs/filings/`](docs/filings/); download official versions from the [Texas Secretary of State](https://www.sos.state.tx.us/corp/forms_702.shtml).

| Form | Description |
| --- | --- |
| Form 201 (`201_boc.pdf`) | Certificate of Formation — For-Profit Corporation |
| Form 202 (`202_boc.pdf`) | Certificate of Formation — Nonprofit Corporation |
| Form 205 (`205_boc.pdf`) | Certificate of Formation — Limited Liability Company |
| Form 05-904 (`05-904.pdf`) | Certification of New Veteran-Owned Business |

See [`docs/filings/FORM_ROUTING.md`](docs/filings/FORM_ROUTING.md) for the full filing-type-to-form routing table.

---

## Project Structure

```text
├── app/
│   ├── layout.tsx                  # Root layout (nav + footer)
│   ├── page.tsx                    # Home page
│   ├── globals.css                 # Tailwind + brand theme
│   ├── api/
│   │   ├── intake/route.ts         # POST intake (Zod + rate limit)
│   │   ├── admin/cases/
│   │   │   ├── route.ts            # GET all cases
│   │   │   └── [id]/route.ts       # GET/PATCH single case
│   │   └── cases/[id]/
│   │       ├── upload/route.ts     # POST file upload
│   │       └── documents/route.ts  # GET list / DELETE doc
│   ├── admin/
│   │   ├── page.tsx                # Admin console
│   │   └── cases/[id]/page.tsx     # Case detail + documents
│   ├── contact/page.tsx
│   ├── services/page.tsx
│   ├── formation-filings/page.tsx
│   ├── credit-enablement/page.tsx
│   ├── veteran-owned/page.tsx
│   ├── mission/page.tsx
│   ├── free-filing/page.tsx        # Core conversion page
│   ├── eligibility/page.tsx        # Eligibility quiz
│   ├── how-it-works/page.tsx       # 5-step process
│   ├── verification-help/page.tsx
│   ├── launch-services/page.tsx
│   ├── faq/page.tsx
│   └── guides/                     # SEO content cluster (10 guides)
│       ├── page.tsx                # Guide index
│       └── [slug]/page.tsx         # Individual guide routes
├── components/
│   ├── layout/
│   │   ├── navbar.tsx              # Sticky top nav
│   │   └── footer.tsx              # Site footer
│   ├── ui/                         # shadcn/ui primitives
│   ├── concierge/
│   │   ├── hutchrok-concierge.tsx   # Inline + floating concierge
│   │   └── concierge-data.ts       # Decision tree + context nudges
│   ├── authority-signals.tsx        # Trust & authority section components
│   ├── guide-layout.tsx             # Reusable guide article layout
│   ├── eligibility-quiz.tsx
│   ├── intake-form.tsx             # Intake form (Zod client validation)
│   ├── veteran-intake-form.tsx
│   └── activity-illustrations.tsx
├── lib/
│   ├── types.ts                    # Data models + enums
│   ├── utils.ts                    # Utility helpers (cn)
│   ├── validation.ts               # Zod intake schema (shared)
│   ├── rate-limit.ts               # In-memory rate limiter
│   ├── api-response.ts             # Standardized API response helpers
│   ├── supabase/
│   │   ├── server.ts               # Server-side Supabase client
│   │   └── client.ts               # Browser-side Supabase client
│   ├── db/
│   │   └── schema.sql              # Full SQL schema
│   └── services/
│       ├── index.ts
│       └── intake.ts               # Intake service stub
├── docs/
│   ├── DEMO_CHECKLIST.md           # QA / demo walkthrough
│   └── filings/
│       ├── FORM_ROUTING.md         # Filing type → form mapping
│       ├── 201_boc.pdf             # Form 201 placeholder
│       ├── 202_boc.pdf             # Form 202 placeholder
│       ├── 205_boc.pdf             # Form 205 placeholder
│       └── 05-904.pdf              # Form 05-904 placeholder
└── public/
    └── brand/                      # Brand assets
```

---

## Growth Phases (Completed)

| Phase | Focus | What Was Added |
| --- | --- | --- |
| 6 | SEO Content Cluster | 10 veteran-focused guide routes under `/guides`, reusable `GuideLayout` with related-guides linking, guides index page |
| 7 | Concierge Enhancements | Guided decision-tree funnel, lead capture with email prompt, pathname-based context awareness, inline trust signals |
| 8 | Authority Signals | 5 reusable components (`SocialProofStrip`, `WhyHutchrokSection`, `TexasExpertiseSection`, `TrustBadgeStrip`, `ProcessTransparencyBanner`) integrated across homepage, free-filing, how-it-works, and eligibility pages |

---

## Next Step: Microsoft 365 Ops Layer (Planned)

The current system handles intake, case management, and document storage. The next phase wires this into Microsoft 365 for operational workflows:

| Capability | 365 Service | Description |
| --- | --- | --- |
| Case folder creation | **SharePoint** | Auto-create a "Client Cases" library folder per case number on case creation |
| Compliance tracking | **Microsoft Lists** | Mirror `filing_cases` into a List for team dashboards and views |
| Notifications | **Power Automate** | Trigger flows on status changes: new case alert, needs-info reminder, filed/completed notification |
| Document storage (optional) | **SharePoint** | Store uploaded documents in the case folder (or keep Supabase + link) |
| Team assignment | **Teams** | Post to a channel when a case is assigned or escalated |

Integration approach: Power Automate webhook triggered by Supabase database webhooks or a Next.js API route that calls the Microsoft Graph API on case status changes.

---

## Microsoft 365 Ops Wiring

Three inbound API routes allow Power Automate (or any webhook caller) to push M365 state back into the app. An outbound webhook emitter notifies Power Automate when events happen inside the app.

### 1. Environment Variables

Add these to `.env.local` (and to your Vercel project settings):

```env
# Shared secret – Power Automate sends this in the X-Ops-Token header
OPS_TOKEN=generate-a-strong-random-secret

# (Optional) Power Automate HTTP-trigger URL for outbound events
OPS_WEBHOOK_URL=https://prod-xx.westus.logic.azure.com:443/workflows/...
```

### 2. Database Migration

Run [`lib/db/schema-ops.sql`](lib/db/schema-ops.sql) in the Supabase SQL Editor to add the new columns:

```sql
alter table filing_cases
  add column if not exists sharepoint_folder_url text,
  add column if not exists ms_list_item_id       text,
  add column if not exists ops_synced_at          timestamptz;

alter table case_documents
  add column if not exists sharepoint_item_id text;
```

### 3. Inbound API Routes (Power Automate → App)

All three routes require the `X-Ops-Token` header.

#### POST `/api/ops/case-linked`

Called after Power Automate creates a SharePoint folder for a case.

```json
{
  "case_id": "b1c2d3e4-...",
  "sharepoint_folder_url": "https://yourtenant.sharepoint.com/sites/Cases/Shared%20Documents/HSG-2026-0001",
  "ms_list_item_id": "42"
}
```

Response:

```json
{ "ok": true, "case": { "id": "...", "case_number": "HSG-2026-0001", "sharepoint_folder_url": "...", "ms_list_item_id": "42", "ops_synced_at": "..." } }
```

#### POST `/api/ops/status-sync`

Called when a case status changes in Microsoft Lists / Planner.

```json
{
  "case_id": "b1c2d3e4-...",
  "status": "IN_PROGRESS",
  "ms_list_item_id": "42"
}
```

Response:

```json
{ "ok": true, "case": { "id": "...", "case_number": "HSG-2026-0001", "status": "IN_PROGRESS", "ops_synced_at": "..." } }
```

#### POST `/api/ops/doc-published`

Called after a document is copied to SharePoint.

```json
{
  "case_id": "b1c2d3e4-...",
  "document_id": "a1b2c3d4-...",
  "sharepoint_item_id": "item-id-from-graph"
}
```

Response:

```json
{ "ok": true, "document": { "id": "...", "filename": "articles.pdf", "sharepoint_item_id": "item-id-from-graph" } }
```

### 4. Outbound Webhook (App → Power Automate)

When `OPS_WEBHOOK_URL` is configured, the app fires HTTP POSTs on:

| Event | Trigger |
| --- | --- |
| `case.status_changed` | Admin updates case status via PATCH |
| `case.document_inserted` | (Wire via Supabase Database Webhook on `case_documents` INSERT) |
| `case.created` | (Wire via Supabase Database Webhook on `filing_cases` INSERT) |

Sample outbound payload:

```json
{
  "event": "case.status_changed",
  "timestamp": "2026-02-27T15:30:00.000Z",
  "payload": {
    "case_id": "b1c2d3e4-...",
    "case_number": "HSG-2026-0001",
    "old_status": "NEW",
    "new_status": "IN_REVIEW"
  }
}
```

### 5. Power Automate Setup (Quick Start)

1. **Create an Instant Cloud Flow** with the trigger **"When an HTTP request is received"**.
2. Copy the generated URL → set it as `OPS_WEBHOOK_URL` in your environment.
3. Add a **Parse JSON** step with the schema above.
4. Branch on `event` to route to different actions:
   - `case.status_changed` → update a Microsoft List item, send a Teams notification
   - `case.created` → create a SharePoint folder, call `/api/ops/case-linked` to store the URL
5. For the return call, add an **HTTP** action:
   - Method: `POST`
   - URL: `https://yoursite.com/api/ops/case-linked`
   - Headers: `X-Ops-Token: <your OPS_TOKEN value>`
   - Body: the JSON shown above

### 6. Admin UI

The case detail page (`/admin/cases/[id]`) now displays:

- **SharePoint Folder** link (opens in new tab) when `sharepoint_folder_url` is set
- **Last ops sync** timestamp when `ops_synced_at` is set
- **MS List ID** badge when `ms_list_item_id` is set

---

## Build & Deploy (Vercel)

Vercel has first-class support for Next.js — no adapter needed. Push to `main` and Vercel builds + deploys automatically.

```bash
# Production build (local verification)
npm run build
```

### Vercel Project Settings

- **Framework Preset:** Next.js (auto-detected)
- **Build command:** `npm run build` (default)
- **Output directory:** `.next` (default)
- **Environment variables:** set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_TOKEN`, and `OPS_TOKEN` in Settings → Environment Variables

Vercel automatically handles serverless functions for API routes and edge middleware.

---

## License

Proprietary — Hutchrok Solutions Group LLC. All rights reserved.
