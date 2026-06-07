# TaskFlow — Project & Task Management Dashboard

A full-stack project and task management app with a drag-and-drop Kanban board, built with Next.js 16, TypeScript, Tailwind CSS v4, and Redux Toolkit. Deployed on Vercel.

---

## Features

- Login, Register, Forgot Password with route protection
- Dashboard with stat cards and analytics charts
- Kanban board with drag-and-drop across 6 status columns
- Task detail page with banner image and metadata
- Full Projects CRUD with progress tracking
- Ownership-based permissions (creator can edit/delete their own tasks)
- Admin role can delete any task
- Dark / Light mode
- Toast notifications on every action
- Responsive layout (mobile → desktop)

---

## Tech Stack


| Framework | Next.js 16 + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Redux Toolkit |
| Forms | React Hook Form + Zod v4 |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| Theme | next-themes |
| Toasts | Sonner |
| Tests | Vitest + React Testing Library |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/haiderali428/Cplus-Soft-Assessment.git
cd Cplus-Soft-Assessment
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

### 3. Start the mock API server

```bash
npm run mock
```

Runs json-server on `http://localhost:4000`.

### 4. Start the Next.js dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Folder Structure

```
cplus-soft/
├── src/
│   ├── app/
│   │   ├── (auth)/                     # Auth pages (login, register, forgot-password)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                        # Next.js API route handlers
│   │   │   ├── _data/
│   │   │   │   └── store.ts            # MongoDB connection + CRUD factory
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts            # GET /api/tasks, POST /api/tasks
│   │   │   │   └── [id]/route.ts       # GET, PATCH, DELETE /api/tasks/:id
│   │   │   ├── projects/
│   │   │   │   ├── route.ts            # GET /api/projects, POST /api/projects
│   │   │   │   └── [id]/route.ts       # GET, PATCH, DELETE /api/projects/:id
│   │   │   ├── users/
│   │   │   │   ├── route.ts            # GET /api/users, POST /api/users
│   │   │   │   └── [id]/route.ts       # GET /api/users/:id
│   │   │   └── health/route.ts         # GET /api/health — DB connection check
│   │   ├── dashboard/                  # Protected dashboard pages
│   │   │   ├── page.tsx                # Stats overview + charts
│   │   │   ├── board/page.tsx          # Kanban board
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx            # Projects list
│   │   │   │   └── [id]/page.tsx       # Project detail
│   │   │   └── layout.tsx
│   │   ├── tasks/[id]/page.tsx         # Task detail page
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                    # Root redirect
│   ├── components/
│   │   ├── dashboard/                  # StatCard, TaskCategoryChart, TaskStatusChart
│   │   ├── layout/                     # Navbar, Sidebar, Providers, AuthBootstrap
│   │   ├── projects/                   # ProjectCard, ProjectFormModal, DeleteProjectModal
│   │   ├── tasks/                      # KanbanBoard, KanbanColumn, TaskCard, AddTaskModal
│   │   ├── typography/                 # Heading, SubHeading, CardDesc, Paragraph
│   │   └── ui/                         # Button, Modal, InputField, Badge, Alert, Spinner…
│   ├── hooks/
│   │   ├── redux.ts                    # Typed useAppDispatch / useAppSelector
│   │   └── useUsers.ts
│   ├── lib/
│   │   ├── api.ts                      # Axios instance + API helpers
│   │   ├── stats.ts                    # computeDashboardStats util
│   │   ├── utils.ts
│   │   └── schemas/                    # Zod schemas (auth, task, project)
│   ├── store/
│   │   ├── index.ts                    # Redux store setup
│   │   ├── authSlice.ts
│   │   ├── tasksSlice.ts
│   │   ├── projectsSlice.ts
│   │   └── uiSlice.ts
│   ├── types/index.ts                  # Shared TypeScript types
│   ├── middleware.ts                   # Next.js route protection middleware
│   └── __tests__/                      # Vitest unit tests
├── db.json                             # Empty — all data lives in MongoDB Atlas
├── .env.local                          # Local env vars (never committed)
├── .env.example                        # Template for env vars
└── package.json
```

---

## Database — MongoDB Atlas

All data (tasks, projects, users) is stored in **MongoDB Atlas** and shared across every user and every Vercel serverless instance.

**Collections:**

| Collection | Description |
|---|---|
| `tasks` | All task records |
| `projects` | All project records |
| `users` | Registered user accounts |

**How it works:**
- The API route `src/app/api/_data/store.ts` opens a single `MongoClient` connection per serverless process and reuses it across requests via `globalThis.__mongoClient`.
- A unique index on the `id` field is created on first connection (idempotent — safe to run repeatedly).
- No seed data is auto-inserted — the database starts empty and is populated entirely through the app.

**Setup for local development:**

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Database Access → add a user with `readWrite` on your database
3. Network Access → allow `0.0.0.0/0`
4. Copy the connection string and add it to `.env.local`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/taskflow
```

**Setup on Vercel:**

Add `MONGODB_URI` in **Vercel → Settings → Environment Variables** (do **not** use the `NEXT_PUBLIC_` prefix — this key must stay server-only and never reach the browser).

Verify the connection at: `https://your-app.vercel.app/api/health`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string. Server-only — no `NEXT_PUBLIC_` prefix. |
| `NEXT_PUBLIC_API_URL` | No | API base URL. Omit on Vercel (uses built-in `/api` routes). Set to `http://localhost:4000` only if running json-server locally. |

---

## Demo Accounts

| Email | Password | Role |
|---|---|---|
| `admin@taskflow.dev` | `password123` | **admin** |
| `alirao@taskflow.dev` | `password123` | member |
| `umar@taskflow.dev` | `password123` | member |
| `asim@taskflow.dev` | `password123` | member |
| `danial@taskflow.dev` | `password123` | member |

---

## Available Scripts

```bash
npm run dev          # Dev server → http://localhost:3000
npm run build        # Production build
npm run start        # Serve production build
npm run mock         # json-server → http://localhost:4000
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
```

---

## Running Tests

```bash
npm run test
```

```bash
npm run test:watch
```

---

## Docker

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| API | http://localhost:4000 |

```bash
docker compose down
```

---

## API Testing (Postman)

Full request/response examples for every endpoint are documented in [api_test.md](api_test.md).

**Endpoints covered:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | MongoDB connection check + document counts |
| GET | `/api/users` | List all users |
| GET | `/api/users?email=x` | Find user by email |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project by ID |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

**Quick start:**
1. Open `api_test.md` for ready-to-paste request bodies and expected responses
2. Set the `{{base}}` variable in Postman to `http://localhost:3000` (local) or your Vercel URL (production)
3. Hit `GET {{base}}/api/health` first to confirm the database is connected

---

## Deployed on Vercel

Live at: `https://cplus-soft-assessment.vercel.app/`

No extra setup needed — the built-in Next.js API routes (`/api/*`) serve all data on Vercel with no external services required.
