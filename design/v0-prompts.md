# OpsBoard — промпты для макетов

Промпты для UI-макетов OpsBoard.  
**Готовые экраны (v0):** Projects, Dashboard — скрины в `design/screenshots/`.  
**Остальные экраны:** [Raphael AI](https://raphael.app) (или аналог) — генерация **картинок** по референсу, не кода.

---

## Как работать в Raphael AI

### 1. Референс (обязательно)

Прикрепляй скрин уже готового экрана — v0 держит единый shell:

| Тема | Референс |
|------|----------|
| Light | `design/screenshots/projects/light.png` или `design/screenshots/Dashboard/light.png` |
| Dark | `design/screenshots/projects/dark.png` или `design/screenshots/Dashboard/dark.png` |

### 2. Базовый префикс (копируй в начало каждого промпта)

**Экраны с sidebar** (Project detail, Tasks, Reports):

```
High-fidelity UI mockup screenshot of a B2B SaaS web app "OpsBoard".
Match EXACTLY the visual style of the attached reference image:
same sidebar, header, search bar, theme toggle (moon/sun icon), notification bell, user menu (Jordan Diaz), typography, spacing, shadcn/ui aesthetic, blue accent color.

Desktop web app, 1440px wide, no browser chrome, no device frame.
Realistic mock data for a digital agency team.
Static mockup only — not interactive.
```

**Auth** (Login / Register — без sidebar):

```
High-fidelity UI mockup screenshot of a B2B SaaS web app "OpsBoard" auth page.
Match the brand from the attached reference: same logo, blue accent, shadcn/ui card style, clean sans-serif typography.

Centered card on subtle gray background. No sidebar.
Desktop 1440px, no device frame. Static mockup only.
```

### 3. Light и Dark — отдельные генерации

Raphael не переключает тему сам. На каждый экран:

1. Промпт + референс **light** → сохранить `light.png`
2. Тот же промпт + референс **dark** + фраза `Dark theme version, same layout` → `dark.png`

### 4. Проверка перед сохранением

- [ ] Sidebar: активный пункт соответствует экрану (Tasks, Reports…)
- [ ] Те же имена проектов, что на Projects (Northwind, Aperture, Helio…)
- [ ] Header совпадает с референсом
- [ ] Контент только в main area, shell не «уплыл»

### 5. v0-код (отдельно)

Код из v0 (Projects + Dashboard) — в `design/v0-mockups/`.  
Raphael даёт только скрины; на Фазе 0 верстаем остальное по ним, shell берём из v0.

---

## Dashboard ✅

```
Dashboard mockup in OpsBoard shell. 4 stat cards, pie chart (tasks by status), list "Upcoming deadlines" (5 items). Show 2 overdue tasks highlighted.
Sidebar: Dashboard active.
```

Скрины: `design/screenshots/Dashboard/light.png`, `design/screenshots/Dashboard/dark.png`

---

## Projects ✅

```
Projects list mockup. Grid of 4-6 project cards: name, client, ACTIVE/ARCHIVED badge, task count. Button "New project". One empty state variant optional.
Sidebar: Projects active.
```

Скрины: `design/screenshots/projects/light.png`, `design/screenshots/projects/dark.png`

---

## Project detail ✅

```
[базовый префикс с sidebar + референс]

Project detail page. Sidebar: Projects active.

Main content:
- Breadcrumb: Workspace / Projects / Northwind Rebrand
- Project info card: name "Northwind Rebrand", client "Northwind Trading Co.", description, ACTIVE badge, created date
- Buttons: Edit, Archive
- Tasks table, 6 rows: title, status badge (TODO / IN PROGRESS / DONE), priority (low/medium/high), assignee avatar, due date
- Button "Add task" (top right of table)
```

---

## Tasks ✅

```
[базовый префикс с sidebar + референс]

All tasks page. Sidebar: Tasks active.

Main content:
- Page title "Tasks"
- Filter bar: dropdowns for Project, Status, Assignee + "Clear filters"
- Table with 8-10 tasks: title, project name, status badge (TODO / IN PROGRESS / DONE), priority badge, assignee, due date
- Button "New task"
- 2 overdue tasks with red/muted due dates
```

---

## Reports ✅

```
[базовый префикс с sidebar + референс]

Reports page. Sidebar: Reports active.

Main content:
- Page title "Reports" + button "Generate weekly report" (sparkles icon)
- List of 3 past reports: week range, created date, author name, 1-line text preview
- One report expanded below or beside the list: 4 bullet points in Ukrainian summarizing completed work (professional tone)
```

---

## Login ✅

```
[базовый префикс для auth + референс projects/light.png для бренда]

Login page WITHOUT sidebar.

Centered card:
- OpsBoard logo and title
- Email and password fields
- Blue "Sign in" button
- Link "Don't have an account? Register"
```

---

## Register

```
[базовый префикс для auth + референс projects/light.png для бренда]

Register page WITHOUT sidebar.

Centered card:
- OpsBoard logo and title
- Name, email, password fields
- Blue "Create account" button
- Link "Already have an account? Sign in"
```

Для dark: референс `projects/dark.png`, в промпт добавь `Dark theme version`.

---

## Куда складывать скрины

```
design/screenshots/
├── projects/        ✅ light.png, dark.png
├── Dashboard/       ✅ light.png, dark.png
├── project-detail/  ✅ light.png, dark.png
├── tasks/           ✅ light.png, dark.png
├── reports/         ✅ light.png, dark.png
├── login/           ✅ light.png, dark.png
└── register/        light.png, dark.png
```

---

## Если Raphael «уплывает» от стиля

Добавь в промпт:

```
CRITICAL: Copy the exact sidebar and header from the reference. Only replace the main content area. Do not redesign navigation or colors.
```

Или сгенерируй заново с более чётким референсом (`Dashboard/light.png` часто лучше — больше деталей в shell).

---

## v0 (на будущее)

Когда будет подписка — оставшиеся экраны можно догнать в v0 теми же промптами (блоки «Project detail», «Tasks»…), но с префиксом для **кода**:

```
Same OpsBoard shell as Projects page. Light + dark via next-themes, shadcn tokens.
Design mockup only — mock data, no API.
```

Экспорт v0: **⋯ → Download ZIP** → `design/v0-mockups/`.
