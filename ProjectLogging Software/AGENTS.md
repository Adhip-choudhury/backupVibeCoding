# AGENTS.md — ProjectLogging Software

## Repo structure

- **Workspace root:** `Desktop\vibe coding\ProjectLogging Software`
- **Git root:** `C:\Users\rajib` (home dir — the workspace is a subdirectory). Be careful with git commands; run them from the workspace.
- **No commits yet** — greenfield project.
- Source code lives in `src/app/` (Next.js App Router pages) and `src/components/` (React components).
- Data is persisted in `localStorage` — no database needed to develop.

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Auth:** localStorage-based (SHA-256 hashed passwords) via `src/lib/auth.ts` + `src/contexts/AuthContext.tsx`
- **AI:** Vercel AI SDK (`ai`, `@ai-sdk/openai`) — available but not yet wired
- **UI:** All UI is hand-rolled with Tailwind; no component library

## Architecture

| Directory | Purpose |
|-----------|---------|
| `src/app/` | App Router pages (`/`, `/projects/new`, `/projects/[id]`, `/login`, `/signup`) |
| `src/components/` | Reusable React components |
| `src/contexts/` | React contexts (`AuthContext.tsx`) |
| `src/lib/` | Types, storage helpers, utilities |

Key files:
- `src/lib/storage.ts` — `localStorage` CRUD wrapper for projects
- `src/lib/types.ts` — `Project` interface (id, name, description, status, priority, tags, timestamps)
- `src/lib/auth.ts` — `localStorage`-based user auth with SHA-256 password hashing
- `src/contexts/AuthContext.tsx` — Auth provider using `useSyncExternalStore`
- `src/components/projects/ProjectForm.tsx` — used for both create and edit

## Commands

```powershell
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Prod build (runs TS & lint)
npm run lint       # ESLint
npm start          # Start prod server
```

## Conventions

- Pages use `"use client"` since they read from `localStorage` and use `useParams`.
- `src/lib/storage.ts` guards `typeof window` for SSR safety.
- Use `getProjects()`, `addProject()`, `updateProject()`, `deleteProject()` for data access.
- After mutations, call `router.push("/")` + `router.refresh()` to sync the dashboard.
- All pages except `/login` and `/signup` redirect to `/login` if `session` is null via `useEffect`.
- Auth context (`useAuth()`) uses `useSyncExternalStore` — no `loading` state; `session` is `null` when unauthenticated.
- Use `registerUser()`, `loginUser()`, `logoutUser()`, `getSession()` from `src/lib/auth.ts` for direct auth operations outside React.
- Login/signup pages auto-redirect to `/` if `session` already exists.

## Git caution

The git repo lives at `C:\Users\rajib` and tracks *everything* in the home dir. Before committing, always check `git status` from the workspace and stage only workspace files. Consider initializing a clean repo within the workspace or adding a proper `.gitignore`.

## Installed OpenCode skills (`.agents/skills/`)

| Skill | Source | Use when |
|-------|--------|----------|
| `nextjs` | vercel-labs/vercel-plugin | Next.js routing, components, data fetching |
| `ai-sdk` | vercel/ai | AI features, streaming, tool calling |
| `frontend-design` | anthropics/skills | UI design, polished frontend |

Skills auto-load when matching file patterns or code patterns are detected.
