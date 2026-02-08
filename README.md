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
| `/api/intake`        | POST stub for intake form submissions        |

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
│   ├── api/intake/route.ts     # Intake API stub (POST)
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
│   ├── types.ts                # Intake data model + enums
│   ├── utils.ts                # shadcn utility (cn)
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
