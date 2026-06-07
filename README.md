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

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `/api` | API base URL. Set to `http://localhost:4000` in `.env.local` to use json-server locally. Leave unset on Vercel to use the built-in API routes. |

---

## Demo Accounts

| Email | Password | Role |
|---|---|---|
| `admin@gmail.com` | `password123` | **admin** |
| `alirao@gmail.com` | `password123` | member |
| `umar@gmail.com` | `password123` | member |
| `asim2003@gmail.com` | `password123` | member |

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

## Deployed on Vercel

Live at: `https://cplus-soft-assessment.vercel.app/`

No extra setup needed — the built-in Next.js API routes (`/api/*`) serve all data on Vercel with no external services required.
