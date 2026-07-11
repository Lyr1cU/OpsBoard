# OpsBoard — бриф / ТЗ (v0.1)

**Тип:** pet-проект, portfolio + закрытие пробелов в стеке  
**Формат:** внутренняя ops-панель для маленькой digital-команды  
**Срок MVP:** 2–3 недели по вечерам (не дедлайн, а ориентир)

---

## 1. Зачем проект

**Бизнес-контекст (вымышленный, но правдоподобный):**  
Команда из 3–8 человек ведёт несколько клиентских проектов (сайты, реклама, контент). Им нужен один инструмент: кто что делает, по каким проектам, что просрочено, короткий отчёт за неделю — без Notion/Excel/Telegram.

**Твоя цель как разработчика:**
- Показать **full-stack на современном стеке** (не «ещё один Flask»)
- Закрыть пробелы из вакансий: Next.js, TS, PostgreSQL, Auth, Tailwind, Docker, LLM API
- Иметь **live URL + GitHub** для Djinni / собесов
- Уметь объяснить архитектуру за 5 минут

**Не цель:** коммерческий продукт, идеальный дизайн, 100% feature parity с Jira.

---

## 2. Пользователи и роли

| Роль | Кто | Что может |
|------|-----|-----------|
| **Admin** | владелец / тимлид | всё + управление проектами |
| **Member** | исполнитель | свои задачи, смена статуса, просмотр проектов |

**MVP:** одна организация (без multi-tenant). Роли можно упростить до «все равны», если auth затянется — но лучше заложить `role` в БД сразу.

---

## 3. Стек (фиксированный для v1)

| Слой | Технология | Зачем |
|------|------------|-------|
| Framework | **Next.js 14+** (App Router) | UI + API, как в вакансиях |
| Язык | **TypeScript** | везде |
| Стили | **Tailwind CSS** | быстрая вёрстка |
| UI | **shadcn/ui** | готовые компоненты |
| БД | **PostgreSQL** (через **Supabase**) | не SQLite |
| ORM | **Prisma** | схема, миграции |
| Auth | **Supabase Auth** | email/password, JWT |
| Charts | **Recharts** | dashboard |
| AI | **Groq API** (OpenAI-compatible) | weekly summary, $0 на free tier |
| Deploy | **Vercel** | фронт + serverless API |
| Local dev | **Docker Compose** (опционально) | `app` + при желании local Postgres |

**Осознанно не в v1:** Nest.js, Stripe, Redis, микросервисы, мобилка.

### AI: почему Groq

- **Бесплатно:** ключ на [console.groq.com](https://console.groq.com), карта не нужна
- **Free tier:** ~30 запросов/мин, тысячи запросов/день — для weekly summary с запасом
- **OpenAI-compatible:** OpenAI SDK + `baseURL: https://api.groq.com/openai/v1`
- **Рекомендуемая модель:** `llama-3.1-8b-instant` или `llama-3.3-70b-versatile`
- **Альтернатива (тоже free):** Gemini API — если Groq не подойдёт

---

## 4. Сущности данных (Prisma)

```
User          — id, email, name, role (ADMIN | MEMBER), createdAt
Project       — id, name, description?, status (ACTIVE | ARCHIVED), clientName?, createdAt
Task          — id, title, description?, status (TODO | IN_PROGRESS | DONE), priority?, dueDate?, projectId, assigneeId?, createdAt, updatedAt
Report        — id, projectId?, weekStart, content (AI text), createdAt, createdById
```

**Связи:**
- Project → много Task
- User → много Task (assignee)
- Report привязан к проекту или ко всей команде (на выбор — в MVP достаточно «глобальный weekly report»)

**Индексы (минимум):** `Task.projectId`, `Task.assigneeId`, `Task.status`, `Task.dueDate`.

---

## 5. Функциональные требования (MVP)

### 5.1 Auth
- [ ] Регистрация / вход (email + password)
- [ ] Защищённые страницы — без логина редирект на `/login`
- [ ] Logout
- [ ] Сессия через Supabase (не самописный token в localStorage)

### 5.2 Проекты
- [ ] Список проектов (карточки или таблица)
- [ ] Создать / редактировать / архивировать проект
- [ ] Страница проекта: инфо + список задач проекта

### 5.3 Задачи
- [ ] CRUD задачи
- [ ] Поля: title, description, status, priority (low/medium/high), due date, assignee, project
- [ ] Смена статуса (dropdown или drag — drag опционально, не блокер)
- [ ] Фильтр: по проекту, статусу, assignee

### 5.4 Dashboard (`/`)
- [ ] Виджеты: всего задач, по статусам, просроченные (due < today && status != DONE)
- [ ] График: задачи по статусам (pie или bar)
- [ ] Список «ближайшие дедлайны» (топ 5–10)

### 5.5 AI Weekly Summary
- [ ] Кнопка «Generate weekly report»
- [ ] Берёт задачи со статусом DONE за последние 7 дней
- [ ] Отправляет в LLM промпт → сохраняет в `Report`, показывает пользователю
- [ ] История отчётов (список + просмотр)

**Пример промпта (черновик):**
> Summarize completed work for a digital agency team. Tasks: [JSON list of titles, projects, assignees]. Output: 3–5 bullet points in Ukrainian, professional tone.

### 5.6 Общее
- [ ] Адаптив: нормально на desktop + терпимо на mobile
- [ ] Пустые состояния («нет задач» — не пустой экран)
- [ ] Базовая обработка ошибок (toast / alert)

---

## 6. Нефункциональные требования

- Код в **одном monorepo** на GitHub
- **README:** что это, стек, как запустить, env-переменные, скрины
- **`.env.example`** без секретов
- Не коммитить `.env`, ключи API
- TypeScript **strict** (или почти strict)
- ESLint по дефолту Next — не отключать всё подряд

---

## 7. Структура приложения (ориентир)

```
opsboard/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      # sidebar + header
│   │   │   ├── page.tsx        # dashboard
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   └── reports/
│   │   └── api/
│   │       ├── projects/
│   │       ├── tasks/
│   │       └── reports/generate/
│   ├── components/
│   │   ├── ui/                 # shadcn
│   │   └── ...                 # TaskCard, ProjectForm, etc.
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── supabase/
│   │   └── groq.ts               # OpenAI SDK → Groq endpoint
│   └── types/
├── docker-compose.yml          # опционально
├── .env.example
└── README.md
```

**Паттерн API:** Route Handlers в `app/api/*` → Prisma → JSON. Server Components для списков где можно; Client Components для форм и интерактива.

---

## 8. Экраны (wireframe словами)

| URL | Содержимое |
|-----|------------|
| `/login` | форма входа |
| `/register` | форма регистрации |
| `/` | dashboard + виджеты |
| `/projects` | список проектов + кнопка «New» |
| `/projects/[id]` | детали + задачи проекта |
| `/tasks` | все задачи + фильтры |
| `/reports` | список AI-отчётов + кнопка generate |

**Layout:** слева sidebar (Dashboard, Projects, Tasks, Reports), сверху user menu + logout.

---

## 9. Env-переменные

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # только server-side, если нужен

# Database (Supabase Postgres connection string for Prisma)
DATABASE_URL=

# Groq (https://console.groq.com/keys)
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Фазы реализации

### Фаза 0 — Setup (1 вечер)
- `create-next-app` + TS + Tailwind + ESLint
- shadcn init
- Supabase project + Prisma connect
- Первая миграция, пустой layout

**Критерий готовности:** `npm run dev` открывается, БД коннектится, Prisma Studio видит таблицы.

### Фаза 1 — Auth (1–2 вечера)
- Login / Register / Logout
- Protected layout

**Критерий:** без логина не зайти на `/`.

### Фаза 2 — Projects + Tasks CRUD (3–4 вечера)
- API routes + формы
- Связи project ↔ task ↔ user

**Критерий:** можно создать проект, навесить задачи, сменить статус.

### Фаза 3 — Dashboard (1–2 вечера)
- Агрегации + Recharts
- Просроченные / дедлайны

**Критерий:** на главной видна реальная картина по данным.

### Фаза 4 — AI Reports (1 вечер)
- Groq API key + `lib/groq.ts` (OpenAI SDK, Groq base URL)
- Endpoint + UI
- Сохранение в БД

**Критерий:** кнопка → текст отчёта через Groq → запись в истории.

### Фаза 5 — Polish + Deploy (1–2 вечера)
- README, скрины, `.env.example`
- Vercel deploy
- Docker Compose (если успеешь)

**Критерий:** live URL в README, репо публичный.

---

## 11. Критерии приёмки MVP (чеклист «готово к портфолио»)

- [ ] Live demo на Vercel
- [ ] GitHub с понятным README
- [ ] Auth работает
- [ ] Минимум 2 проекта и 10 задач в демо-данных (seed script — плюс)
- [ ] Dashboard с графиком
- [ ] AI report генерируется и сохраняется
- [ ] Можешь за 5 минут объяснить: стек, схема БД, как идёт запрос от кнопки до БД
- [ ] В резюме/Djinni: **одна строка** с ссылкой

---

## 12. Вне скоупа v1 (backlog)

- Приглашения в команду по email
- Комментарии к задачам
- Файлы / attachments
- Уведомления
- Kanban drag-and-drop
- Экспорт в Google Sheets
- Stripe / billing
- Тесты (unit/e2e) — nice to have, не блокер MVP

---

## 13. Риски и как не утонуть

| Риск | Что делать |
|------|------------|
| Застрял на auth | Supabase docs + один гайд, не писать своё |
| Prisma + Supabase connection | взять connection string **Session mode** / pooler из доки Supabase |
| Cursor генерит мусор | одна фича за промпт, потом **прочитать** и упростить |
| Раздувание UI | shadcn как есть, не кастомить дизайн |
| Groq rate limit (429) | короткий retry; для демо не критично; кэш отчётов в БД |

---

## 14. Как работать с Cursor (практика)

**Хорошие промпты по фазам:**
1. *«Setup Next.js 14 App Router + Prisma + Supabase Auth по этому ТЗ, schema.prisma как в разделе 4»*
2. *«Route handler GET/POST /api/projects с валидацией zod»*
3. *«Dashboard page: server component, aggregate task counts, Recharts pie chart»*
4. *«POST /api/reports/generate: fetch DONE tasks last 7 days, Groq API (OpenAI SDK), save Report»*

**Плохие промпты:**
- *«Сделай весь проект»* — получишь кашу
- *«Добавь Nest и Redis»* — не по ТЗ

**Правило:** после каждой фазы — сам прогони сценарий руками, закоммить (если хочешь), обнови README.

---

## 15. Одна строка для резюме (черновик)

> **OpsBoard** — internal ops dashboard (Next.js, TypeScript, PostgreSQL/Supabase, Prisma, Groq AI weekly reports). [GitHub] · [Live demo]

---

## 16. Имя и брендинг (опционально)

Варианты: **OpsBoard**, **TeamPulse**, **SprintDesk**, **AgencyOps**.  
Для портфолио имя не критично — важнее README и demo.
