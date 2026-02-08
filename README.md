# Hutchrok Solutions Group — Website

A veteran-owned business enablement firm delivering compliant business formation, operational structuring, and execution support.

Built with **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

---

## Pages

| Route                | Description                                  |
| -------------------- | -------------------------------------------- |
| `/`                  | Home — hero, services overview, how it works |
| `/services`          | Detailed services + engagement packages      |
| `/formation-filings` | Formation & filings details + FAQ            |
| `/credit-enablement` | Business credit readiness & enablement       |
| `/veteran-owned`     | Brand story + veteran operator mindset       |
| `/mission`           | Mission pillars + systems-first blueprint    |
| `/contact`           | Intake form + contact info                   |
| `/api/intake`        | POST — intake form submissions (persists to Supabase) |
| `/admin`             | Admin console — case list (token-guarded)    |
| `/admin/cases/[id]`  | Case detail — edit status, notes, assignment |

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

### Requirements
- Node.js 20+
- npm 9+

---

## Build & Deploy

### Build locally
```bash
npm run build
npm start
```

### Deploy to Vercel
1. Push to GitHub
2. Connect repository on [vercel.com](https://vercel.com)
3. Vercel auto-detects Next.js — no custom config needed
4. Set environment variables (if any) in Vercel dashboard

```bash
# Or deploy via CLI
npx vercel --prod
```

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout (nav + footer)
│   ├── page.tsx                # Home page
│   ├── globals.css             # Tailwind + brand theme
│   ├── icon.svg                # Favicon
│   ├── api/
│   │   ├── intake/route.ts     # Intake API (POST → Supabase)
│   │   └── admin/cases/
│   │       ├── route.ts        # GET all cases
│   │       └── [id]/route.ts   # GET/PATCH single case
│   ├── admin/
│   │   ├── page.tsx            # Admin console
│   │   └── cases/[id]/page.tsx # Case detail page
│   ├── services/page.tsx
│   ├── formation-filings/page.tsx
│   ├── credit-enablement/page.tsx
│   ├── veteran-owned/page.tsx
│   ├── mission/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── layout/
│   │   ├── navbar.tsx          # Sticky top nav
│   │   └── footer.tsx          # Site footer
│   ├── ui/                     # shadcn/ui primitives
│   └── intake-form.tsx         # Reusable intake form
├── lib/
│   ├── types.ts                # Data models + enums
│   ├── utils.ts                # shadcn utility (cn)
│   ├── supabase/
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── client.ts           # Browser-side Supabase client
│   ├── db/
│   │   └── schema.sql          # SQL schema for Supabase
│   └── services/               # Future backend integrations
│       ├── index.ts
│       └── intake.ts           # Stub service
└── public/
    ├── brand/logo.png          # Brand logo
    └── logo.png                # Logo copy
```

---

## Backend Phase — Next Steps

This frontend is **backend-ready**. Here's the roadmap:

---

## Play 03 Setup — Intake Persistence + Filing Cases + Admin Console

### Environment Variables

Add these to your `.env.local` (and Vercel dashboard for production):

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI...your-anon-key
ADMIN_TOKEN=some-strong-random-secret
```

> `ADMIN_TOKEN` is a simple shared secret used to protect the admin console. Replace with real auth in a future play.

### Supabase Setup

1. Create a [Supabase](https://supabase.com) project (free tier is fine).
2. Go to **SQL Editor** in the Supabase dashboard.
3. Paste and run the contents of [`lib/db/schema.sql`](lib/db/schema.sql).
4. Copy your **Project URL** and **anon/public key** from **Settings → API**.
5. Set the env vars above.

### What Changed

| File | Description |
| ---- | ----------- |
| `lib/supabase/server.ts` | Server-side Supabase client helper |
| `lib/supabase/client.ts` | Browser-side Supabase client helper |
| `lib/db/schema.sql` | SQL schema for `intake_submissions` + `filing_cases` |
| `lib/types.ts` | Added `FilingCase`, `CaseStatus`, `CASE_STATUSES` |
| `app/api/intake/route.ts` | Now persists to DB + auto-creates a filing case |
| `app/api/admin/cases/route.ts` | GET all cases (with status filter) |
| `app/api/admin/cases/[id]/route.ts` | GET single case / PATCH to update |
| `app/admin/page.tsx` | Admin console — case list with filters |
| `app/admin/cases/[id]/page.tsx` | Case detail page — edit status, notes, etc. |

### Routes Added

| Route | Type | Description |
| ----- | ---- | ----------- |
| `/admin?token=...` | Page | Admin console (token-guarded) |
| `/admin/cases/[id]?token=...` | Page | Case detail & editing |
| `/api/admin/cases?token=...&status=...` | API GET | List cases |
| `/api/admin/cases/[id]?token=...` | API GET/PATCH | Read/update a case |

### Data Flow

1. User submits intake form → `POST /api/intake`
2. API validates → inserts into `intake_submissions`
3. API generates case number (`HSG-YYYY-XXXX`) → inserts into `filing_cases`
4. Response includes `caseNumber` + `caseId`
5. Admin visits `/admin?token=SECRET` → sees all cases
6. Admin clicks a case → `/admin/cases/[id]` → updates status, notes, assignment

---

## Play 02 & Earlier — Previous Setup

### 1. Database
- Add **Prisma** ORM (`npx prisma init`)
- Create Intake model in `prisma/schema.prisma`
- Use PostgreSQL (Vercel Postgres, Neon, or Supabase)
- Update `/api/intake` to save submissions to DB

### 2. Authentication
- Add **NextAuth.js** or **Clerk** for admin login
- Protect admin routes with middleware
- Add role-based access (admin, staff)

### 3. Admin Dashboard
- Build `/admin` route group (protected)
- Intake submissions viewer + status management
- Client management and notes
- Reporting and analytics

### 4. Email Integration
- Add **Resend** or **SendGrid**
- Send confirmation email on intake submission
- Admin notification emails

### 5. CRM Integration
- Connect to HubSpot, Salesforce, or custom CRM
- Sync intake submissions automatically
- Track client lifecycle

### 6. Payments
- Add **Stripe** for service payments
- Create pricing page with checkout flow
- Invoice generation

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Button, Card, Badge, Accordion, Input, Select, etc.)
- **Icons:** Lucide React
- **Deployment:** Vercel-optimized (no server dependencies)

---

## License

Proprietary — Hutchrok Solutions Group LLC. All rights reserved.
