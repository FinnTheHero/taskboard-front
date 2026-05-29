# TaskBoard Frontend

React + Tailwind CSS SPA for the TaskBoard design-patterns project. Connects to the Express API at `http://localhost:4000/api`.

## Core features (Sprint 2 scope)

- **Auth** — register, login, JWT session
- **Boards** — list and create (auto To Do / In Progress / Done columns)
- **Kanban** — drag & drop tasks between columns
- **Tasks** — create with title, description, deadline, priority (Low → Critical)
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

## Later sprints (not in this UI yet)

- In-app / email reminders (Observer + Factory on backend)
- Team collaboration & comments
- Full statistics dashboard
