# OpsBoard

**Live demo:** [https://opsboard-topaz.vercel.app](https://opsboard-topaz.vercel.app)  
**Source code:** [https://github.com/Lyr1cU/OpsBoard](https://github.com/Lyr1cU/OpsBoard)

Internal ops dashboard for a small digital agency — projects, tasks, deadlines, team invites, and AI weekly reports in one place.

Portfolio / full-stack pet project with a working production deploy.

---

## For recruiters & reviewers

### What is this?

OpsBoard is a **full-stack web application** (not a landing page or mockup). It models an internal tool a 3–8 person agency would use to answer:

- What projects are we running?
- Who is working on what?
- What is overdue?
- What did the team finish this week?

Open it in a **browser** — no install needed.

### Tech at a glance

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion |
| Backend | Next.js Server Actions + API Routes (Vercel serverless) |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Auth | Supabase Auth (email/password, cookie sessions) |
| Access | Account type (Team Lead / Member) + per-project Lead / Member |
| AI | Groq API — weekly summary from completed tasks |
| Deploy | Vercel (Frankfurt / `fra1`) |

### Roles

| Layer | Label | Meaning |
|-------|--------|---------|
| **Account** | Team Lead (`ADMIN`) | Can **create** projects (becomes owner / Project Lead) |
| **Account** | Member (`MEMBER`) | Cannot create projects; joins via **invite by email** |
| **Project** | Project Lead | Owner or `PROJECT_LEAD` — edit project/tasks, invite, generate reports |
| **Project** | Member | `PROJECT_MEMBER` — view project; change status only on **own** assigned tasks |

At **register**, choose Team Lead or Member. Seed demo: `maya.chen@studio.co` owns the sample projects; other seed users are Members on those projects.

**Dashboard differs by account type:**

- **Team Lead** — team-wide KPIs, status chart, and deadlines across accessible projects
- **Member** — personal workload (open / overdue / in progress, chart, deadlines = **their** tasks only); Active Projects still counts projects they can access

### Try it in ~2 minutes

1. Open **[opsboard-topaz.vercel.app](https://opsboard-topaz.vercel.app)**
2. Click **Register** — email + password (6+ chars) and pick **Team Lead** or **Member**. No email confirmation required.
3. After login you land on the **Dashboard** (team overview or personal workload, depending on role).
4. Suggested path:

| Step | Page | What to check |
|------|------|----------------|
| 1 | **Projects** | Only projects you own or joined. Team Lead: **New project**. |
| 2 | **Project detail** | Tasks + **Project team**. Leads: invite by email, edit / archive / delete. |
| 3 | **Tasks** | Filters + **My tasks**. Members: status disabled on others' tasks. |
| 4 | **Reports** | Pick a project (Lead only), generate AI weekly report. |
| 5 | **Team** | Directory of people on your projects. |
| 6 | **Bell** | Overdue & soon-due notifications for accessible projects. |

5. **Sign out** when done (header, top right).

Demo data is shared. Soft motion (Framer Motion) on lists and modals; toasts (Sonner) on success/error.

### Interview talking points

- Next.js App Router + Server Components vs client-only SPA
- Auth: Supabase JWT → cookies → middleware-protected routes
- RBAC: account type vs project Lead/Member (`permissions.ts`, `ProjectMember`)
- Dashboard scoping: team aggregates vs personal `assigneeId` filter for Members
- Optimistic UI with React 19 `useOptimistic` for task status
- Prisma: User, Project, ProjectMember, Task, Report, Activity
- Groq prompt design for per-project weekly reports
- Deploy: Vercel + Supabase pooler, env vars, auth redirect URLs

---

## Features

- **Auth** — register (Team Lead / Member), login, logout; dashboard requires a session
- **Ownership** — project owner + `ProjectMember`; invite by email on project detail
- **Projects** — accessible-only list; create (Team Lead); edit/archive/delete (project Lead)
- **Tasks** — Lead CRUD; Members update status on own tasks; optimistic status; My tasks
- **Dashboard** — Lead: team KPIs; Member: personal workload; recent activity
- **AI Reports** — Groq weekly summary per project (Lead generate)
- **Team** — directory across accessible projects
- **Notifications** — overdue and due-soon in the header bell
- **UX** — Framer Motion, Sonner toasts, responsive layout, light/dark theme

---

## Routes

| Route | Description |
|-------|-------------|
| `/login`, `/register` | Auth (register includes account type) |
| `/` | Dashboard (team or personal by role) |
| `/projects`, `/projects/[id]` | Projects list & detail (+ invite) |
| `/tasks` | Accessible tasks + filters |
| `/reports` | AI weekly reports |
| `/team` | Team directory |

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

- Use **Project URL** from Settings → API (not `/rest/v1/`)
- On Windows, prefer **Session pooler** locally; **Transaction pooler** (port `6543`) on Vercel
- Dev: Authentication → Email → Confirm email = off

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

Live at [opsboard-topaz.vercel.app](https://opsboard-topaz.vercel.app).

To redeploy from a fork:

1. Import the repo on [vercel.com/new](https://vercel.com/new)
2. Framework: **Next.js**
3. Set env vars (same as `.env`, with `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`)
4. Supabase → Authentication → URL Configuration → add your Vercel URL

`vercel.json` pins functions to **Frankfurt (`fra1`)** — same region as Supabase `eu-central-1`.

---

## Design

UI mockups: `design/screenshots/`  
v0 reference: `design/v0-mockups/`
