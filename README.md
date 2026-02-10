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
| Deployment | Cloudflare Pages (Next.js Functions) |

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

Create a `.env.local` file in the project root (and set these in the Cloudflare Pages project settings for production):

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

4. Visit **`/admin?token=YOUR_ADMIN_TOKEN`**
5. The case list shows the new submission with status `NEW`

### 3. Manage the Case

6. Click the case row → opens **`/admin/cases/[id]?token=...`**
7. Update status to `IN_REVIEW`, add notes, set a due date
8. Save changes — verify they persist on reload

### 4. Upload a Document

9. On the case detail page, scroll to **Documents**
10. Upload a PDF or image (max 10 MB)
11. Verify it appears in the list with a download link (signed URL)
12. Optionally delete the document to verify removal

---

## Routes

| Route | Method | Description |
| --- | --- | --- |
| `/` | GET | Home — hero, services overview, how-it-works |
| `/contact` | GET | Intake form + contact info |
| `/services` | GET | Detailed services + engagement packages |
| `/formation-filings` | GET | Formation & filings details + FAQ |
| `/credit-enablement` | GET | Business credit readiness & enablement |
| `/veteran-owned` | GET | Brand story + veteran operator mindset |
| `/mission` | GET | Mission pillars + systems-first blueprint |
| `/admin?token=...` | GET | Admin console — case list with status filter |
| `/admin/cases/[id]?token=...` | GET | Case detail — edit status, notes, docs |
| `/api/intake` | POST | Submit intake (Zod validated, rate limited) |
| `/api/admin/cases?token=...` | GET | List all cases (optional `status` filter) |
| `/api/admin/cases/[id]?token=...` | GET/PATCH | Read or update a single case |
| `/api/cases/[id]/upload?token=...` | POST | Upload a document (multipart, 10 MB max) |
| `/api/cases/[id]/documents?token=...` | GET/DELETE | List documents / delete a document |

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

```
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
│   └── mission/page.tsx
├── components/
│   ├── layout/
│   │   ├── navbar.tsx              # Sticky top nav
│   │   └── footer.tsx              # Site footer
│   ├── ui/                         # shadcn/ui primitives
│   ├── intake-form.tsx             # Intake form (Zod client validation)
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

## Build & Deploy (Cloudflare Pages)

Cloudflare Pages supports Next.js via the `@cloudflare/next-on-pages` adapter.

```bash
# Production build
npm run build

# Generate Cloudflare Pages output
npx @cloudflare/next-on-pages
```

**Cloudflare Pages settings**

- **Build command:** `npm run build && npx @cloudflare/next-on-pages`
- **Build output directory:** `.vercel/output/static`
- **Environment variables:** set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ADMIN_TOKEN` in the project settings

Cloudflare Pages will run the generated Functions for the API routes.

---

## License

Proprietary — Hutchrok Solutions Group LLC. All rights reserved.
