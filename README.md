# OpsBoard

**Live demo:** [https://opsboard-topaz.vercel.app](https://opsboard-topaz.vercel.app)  
**Source code:** [https://github.com/Lyr1cU/OpsBoard](https://github.com/Lyr1cU/OpsBoard)

Internal ops dashboard for a small digital agency — track projects, tasks, deadlines, and AI-generated weekly reports in one place.

Pet-project / portfolio. Full spec: [opsboard-brief.md](./opsboard-brief.md)

---

## For recruiters & reviewers

### What is this?

OpsBoard is a **full-stack web application** (not a landing page or mockup). It simulates an internal tool a 3–8 person agency would use to answer:

- What projects are we running?
- Who is working on what?
- What is overdue?
- What did the team finish this week?

You open it in a **browser** — no install needed.

### Tech at a glance

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Next.js Server Actions + API Routes (Vercel serverless) |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Auth | Supabase Auth (email/password, cookie sessions) |
| AI | Groq API — weekly summary from completed tasks |
| Deploy | Vercel (Frankfurt region) |

### Try it in ~2 minutes

1. Open **[opsboard-topaz.vercel.app](https://opsboard-topaz.vercel.app)**
2. Click **Register** — any email + password (6+ chars). No email confirmation required.
3. After login you land on the **Dashboard** — live stats from the database.
4. Suggested click path:

| Step | Page | What to check |
|------|------|----------------|
| 1 | **Projects** | 5 demo client projects (seed data). Create a new one with **New project**. |
| 2 | **Project detail** | Open any project → task list → **Add task** → change **Status** dropdown. |
| 3 | **Tasks** | All tasks, filters by project / status / assignee. |
| 4 | **Reports** | **Generate weekly report** — AI summary of tasks marked Done in the last 7 days. |
| 5 | **Bell icon** (header) | Notifications for overdue & soon-due tasks. |

5. **Sign out** when done (header, top right).

Demo data is shared — everyone sees the same seeded projects after registering.

### What you can ask me about in an interview

- Why Next.js App Router + Server Components vs client-only SPA
- Auth flow: Supabase JWT → cookies → protected routes (middleware)
- Prisma schema: User, Project, Task, Report relations
- How dashboard aggregations are computed from PostgreSQL
- Groq prompt design for weekly reports
- Deploy: Vercel + Supabase pooler, env vars, auth redirect URLs

---

## Features

- **Auth** — register, login, logout; dashboard routes require a session
- **Projects** — list, filter (Active / Archived), create, archive, detail view
- **Tasks** — CRUD via UI, status change, filters, mobile card layout
- **Dashboard** — active projects, open/overdue tasks, status chart, upcoming deadlines
- **AI Reports** — Groq-generated weekly summary, saved to database
- **Notifications** — overdue and due-soon tasks in the header bell
- **Responsive** — desktop sidebar + mobile hamburger menu

---

## Routes

| Route | Description |
|-------|-------------|
| `/login`, `/register` | Auth |
| `/` | Dashboard |
| `/projects`, `/projects/[id]` | Projects list & detail |
| `/tasks` | All tasks + filters |
| `/reports` | AI weekly reports history |

---

## Local development

### Prerequisites

- Node.js 20+
- Supabase project (free tier)
- Groq API key (free, for AI reports)

### Setup

```bash
git clone https://github.com/Lyr1cU/OpsBoard.git
cd OpsBoard
cp .env.example .env
npm install
```

Fill `.env` — see [.env.example](./.env.example). Minimum:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://postgres.xxx:...@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Supabase tips:**

- Use **Project URL** from Settings → API (not `/rest/v1/` from Data API)
- On Windows, Direct connection often fails — use **Session pooler** locally, **Transaction pooler** (port `6543`) on Vercel
- Disable email confirmation for dev: Authentication → Email → Confirm email = off

```bash
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |

---

## Deploy (Vercel)

Already deployed at [opsboard-topaz.vercel.app](https://opsboard-topaz.vercel.app).

To redeploy from your fork:

1. Import repo on [vercel.com/new](https://vercel.com/new)
2. Framework: **Next.js**
3. Set env vars (same as `.env`, with `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`)
4. Supabase → Authentication → URL Configuration → add your Vercel URL

`vercel.json` pins functions to **Frankfurt (`fra1`)** — same region as Supabase `eu-central-1`.

---

## Design

UI mockups: `design/screenshots/`  
v0 reference: `design/v0-mockups/`
