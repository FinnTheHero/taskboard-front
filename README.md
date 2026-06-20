# TaskBoard Frontend

React + Tailwind CSS SPA for the TaskBoard design-patterns project. Connects to the Express API at `http://localhost:4000/api`.

## Core features

- **Auth** — register, login, JWT session with refresh tokens
- **Groups** — join via 6-digit code; one group per user; manager vs member roles
- **Boards** — all group boards visible; open only those you have access to
- **Kanban** — drag & drop with position-aware moves (within and across columns)
- **Tasks** — create with title, description, deadline, priority, optional assignee
- **Board focus panel** — deadline alerts and assignee filtering beside kanban columns
- **Sort** — per-column strategy sort (`priority`, `deadline`, `created`, `assignee`) via `?sort=`
- **Comments** — post comments on a task (triggers backend `task.commented`)
- **Archive** — managers bulk-archive Done column tasks
- **Group analytics** — charts dashboard at `/group/analytics` (all members)
- **Progress** — client-side completion bar on the board view (authoritative metrics on analytics API)

## Setup

```bash
pnpm install
# Edit the api URL in .env
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
| Charts | Recharts (group analytics) |
| API | Fetch + typed service modules |

## Project structure

```
src/
  api/          # REST client (auth, boards, groups, tasks)
  components/   # Kanban, focus panel, TaskCard, modals
  context/      # AuthProvider, GroupProvider
  pages/        # Login, Join group, Boards, Board, Analytics, Manage group
  types/        # Shared TypeScript models
```

## Backend pattern integration

| Pattern | Frontend usage |
|---------|----------------|
| **Strategy (sort)** | Column sort dropdown → `GET /tasks/by-column/:id?sort=` |
| **Strategy (metrics)** | Group Analytics page → `GET /groups/stats` |
| **Transactions** | Move with `position`, archive completed |
| **Observer** | Comments, moves, and assignments trigger server-side notifications |

In-app / email notifications are handled on the API (no dedicated notification UI). Managers use **Manage group** for members and board access; all members use **Analytics** for group-wide task metrics.
