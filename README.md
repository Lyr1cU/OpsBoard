# OpsBoard

Internal ops dashboard for a small digital agency team.  
Pet-project / portfolio — see [opsboard-brief.md](./opsboard-brief.md) for full spec.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- PostgreSQL + Prisma
- **Supabase Auth** (Phase 1)
- **Groq AI** (Phase 4 — weekly reports)

## Getting started

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. **Project Settings → API** — copy **Project URL** (ends with `.supabase.co`, **without** `/rest/v1/`) and **anon public** key into `.env`  
   Do **not** copy the URL from **Integrations → Data API** — that REST endpoint breaks Supabase Auth.
3. For local dev, disable email confirmation: **Authentication → Providers → Email → Confirm email = off**

### 2. Database (Phase 2)

1. **Project Settings → Database → Connection string → URI**
2. Copy the **Direct connection** string (port `5432`, host `db.<ref>.supabase.co`)
3. Replace `[YOUR-PASSWORD]` with your database password and set in `.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
```

**Windows / no IPv6:** Direct host often fails with `P1001`. In the **Connect** dialog switch to **Session pooler** (port `5432`, host `aws-0-<region>.pooler.supabase.com`) and use the username `postgres.<project-ref>`:

```env
DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

4. Push schema and seed demo data:

```bash
npm run db:push
npm run db:seed
```

### 3. Environment

```bash
cp .env.example .env
```

Fill in at minimum:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres
GROQ_API_KEY=gsk_...          # https://console.groq.com/keys
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

## Auth (Phase 1)

- Register at `/register`
- Sign in at `/login`
- Dashboard routes require a session (Supabase cookies, not localStorage)
- **Sign out** button in the header
- On first login, your Supabase user is synced into the Prisma `User` table

## Projects & Tasks (Phase 2)

- `/projects` — list, filter (All / Active / Archived), create project
- `/projects/[id]` — project detail, add tasks, change status, archive/restore
- `/tasks` — all tasks with filters + status dropdown
- REST API: `/api/projects`, `/api/tasks` (same data layer)

## Dashboard (Phase 3)

- `/` — live stats from PostgreSQL: active projects, open/overdue/in-progress tasks
- Pie chart by task status (To Do / In Progress / Done)
- Upcoming deadlines list (sorted by due date, overdue highlighted)

## AI Reports (Phase 4)

1. Get a free API key at [console.groq.com](https://console.groq.com/keys)
2. Add `GROQ_API_KEY` to `.env`
3. Open `/reports` → **Generate weekly report**
4. Takes tasks marked **Done** in the last 7 days → Groq summary in English → saved to `Report` table

## Routes

| Route | Status |
|-------|--------|
| `/login`, `/register` | Supabase Auth |
| `/` | Dashboard (PostgreSQL aggregations) |
| `/projects`, `/projects/[id]` | PostgreSQL via Prisma |
| `/tasks` | PostgreSQL via Prisma |
| `/reports` | AI weekly reports (Groq + PostgreSQL) |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run db:generate` — generate Prisma client
- `npm run db:push` — push schema to database (needs `DATABASE_URL`)
- `npm run db:seed` — seed demo projects, tasks, team members
- `npm run db:studio` — Prisma Studio

## Design

UI mockups: `design/screenshots/`  
v0 reference: `design/v0-mockups/`

---

## Deploy (Vercel + GitHub)

OpsBoard is built for [Vercel](https://vercel.com) + the same Supabase project you use locally.  
One database = demo seed data is visible to everyone who signs in.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: OpsBoard MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USER/opsboard.git
git push -u origin main
```

Do **not** commit `.env` — it is already in `.gitignore`.

### 2. Import on Vercel

1. [vercel.com/new](https://vercel.com/new) → Import your GitHub repo
2. Framework: **Next.js** (auto-detected)
3. Build command: `npm run build` (default)
4. Add **Environment Variables** (Production + Preview):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key from Supabase |
| `DATABASE_URL` | **Session pooler** URI (same as local `.env`) |
| `GROQ_API_KEY` | `gsk_...` |
| `GROQ_MODEL` | `llama-3.1-8b-instant` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

5. Deploy

> **Important:** On Vercel use the **Session pooler** `DATABASE_URL`, not Direct connection (`db.xxx.supabase.co`).

### 3. Supabase Auth (production URLs)

In Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** add `https://your-app.vercel.app/**`

Keep **Confirm email = off** so recruiters can register and try the app immediately.

### 4. Database (one-time, if not done yet)

From your machine (with `DATABASE_URL` in `.env`):

```bash
npm run db:push
npm run db:seed
```

Production uses the same Supabase Postgres — no separate prod DB needed for a portfolio demo.

### 5. Put the live link in README

After deploy, add at the top of this file:

```markdown
**Live demo:** https://your-app.vercel.app
```

Recruiters can **Register** → explore seeded projects/tasks → try **Generate weekly report** on `/reports`.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Login works locally, not on Vercel | Check Supabase Site URL + Redirect URLs |
| `P1001` / DB errors on Vercel | Use Session pooler `DATABASE_URL` |
| Empty projects list | Run `npm run db:seed` against your Supabase DB |
| AI reports fail | Add `GROQ_API_KEY` in Vercel env vars |
