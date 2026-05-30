# TaskBoard Frontend

React + Tailwind CSS SPA for the TaskBoard design-patterns project. Connects to the Express API at `http://localhost:4000/api`.

## Core features

- **Auth** — register, login, JWT session
- **Boards** — list and create (auto To Do / In Progress / Done columns)
- **Kanban** — drag & drop with position-aware moves (within and across columns)
- **Tasks** — create with title, description, deadline, priority (Low → Critical)
- **Sort** — per-column strategy sort (`priority`, `deadline`, `created`, `assignee`) via `?sort=`
- **Comments** — view and post comments on a task (triggers backend `task.commented`)
- **Archive** — bulk-archive all tasks in the Done column
- **Progress** — completion bar from Done column vs total tasks

## Setup

```bash
pnpm install   # or npm install
cp .env.example .env
pnpm dev
```

Ensure the [TaskBoard API](http://localhost:4000) is running. Vite proxies `/api` to port 4000 in development.

## Stack

| Layer | Choice |
|-------|--------|
| UI | React 19, Tailwind CSS 4 |
| Routing | React Router 7 |
| Drag & drop | @dnd-kit |
| API | Fetch + typed service modules |

## Project structure

```
src/
  api/          # REST client (auth, boards, tasks)
  components/   # Kanban, TaskCard, modals
  context/      # AuthProvider
  pages/        # Login, Boards, Board view
  types/        # Shared TypeScript models
```

## Backend pattern integration

| Pattern | Frontend usage |
|---------|----------------|
| **Strategy** | Column sort dropdown → `GET /tasks/by-column/:id?sort=` |
| **Transactions** | Move with `position`, archive completed |
| **Observer** | Comments and moves trigger server-side notifications |

In-app / email notifications are handled on the API (no UI required). Transfer ownership is exposed in `boards.ts` for future team UI.
