# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start Vite dev server on :5173 (proxies /api → localhost:4000)
pnpm build        # tsc -b && vite build (runs full type-check before bundling)
pnpm lint         # eslint .
pnpm preview      # serve the dist/ output locally
```

There are no tests in this project.

## Environment

Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend base URL (e.g. `http://localhost:4000/api`). In dev the Vite proxy rewrites `/api` → `localhost:4000`, so the fallback `"/api"` in `src/api/client.ts` works without `.env`. In production (Cloudflare Pages) `VITE_API_URL` must be set as a build environment variable to point at the deployed API.

## Architecture

**Data flow:** All API calls go through `src/api/client.ts` → `api<T>()`, which reads the JWT from `localStorage` and throws `ApiError` on non-OK responses. Feature-specific modules (`auth.ts`, `boards.ts`, `tasks.ts`) call `api<T>()` with typed generics.

**Auth:** `AuthContext` (`src/context/AuthContext.tsx`) holds `user | null` and `loading`. It validates the stored token via `GET /auth/me` on mount. `ProtectedRoute` redirects unauthenticated users to `/login`.

**Routing:** `App.tsx` wraps everything in `<AuthProvider>` then `<BrowserRouter>`. Protected routes nest under `<ProtectedRoute>` → `<Layout>`. Boards live at `/boards` and `/boards/:boardId`.

**Kanban:** `BoardPage` fetches board + columns, passes the `Board` object to `KanbanBoard`, which renders `KanbanColumn` instances. Drag-and-drop uses `@dnd-kit`. Each column fetches its tasks independently with an optional `?sort=` query param mapped to `SortKey` (`deadline | priority | created | assignee`).

**TypeScript strictness:** `tsconfig.app.json` enables `erasableSyntaxOnly: true` (required for Node 23+ native TS strip mode). This means **parameter property shorthand** (`constructor(public foo: T)`) is forbidden — use explicit field declarations instead. It also enables `verbatimModuleSyntax`, so all type-only imports must use `import type`.
