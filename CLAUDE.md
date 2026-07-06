# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

GitFolio — a Next.js app that signs a developer in with GitHub, syncs all their repos into Postgres, scores each repo's "health", builds a force-graph of the repos, and runs Claude to produce repo/profile improvement analyses and README drafts. The `Design/` folder holds the static HTML/CSS design spec (GitHub-dark palette, IBM Plex Sans + JetBrains Mono) that the React UI is built to match — treat `Design/DESIGN.md` as the source of truth for visual work.

## Commands

```bash
npm run dev          # dev server (respects PORT env; .env sets PORT=5162, else Next defaults to 3000)
npm run build        # prisma generate + next build
npm run lint         # eslint (next lint)
npm run db:push      # push prisma schema to DB (no migration files — schema-push workflow)
npm run db:studio    # prisma studio
npm run db:generate  # regenerate prisma client after editing schema.prisma
```

There is **no test suite** — `@playwright/test` is installed but there is no `playwright.config` and no spec files.

After changing `prisma/schema.prisma`, run `db:generate` (and `db:push` to sync the DB) before the new fields are usable — `build` also runs `prisma generate`.

## Critical: Next.js version

Per `AGENTS.md`, this is **Next.js 16** with breaking changes from what's in training data. Read the relevant guide under `node_modules/next/dist/docs/` before writing App Router / route-handler / config code. React is 19.2 and the **React Compiler is enabled** (`babel-plugin-react-compiler`), so avoid manual `useMemo`/`useCallback` micro-optimizations. `next.config.ts` uses `output: 'standalone'` (Docker) and only allowlists `avatars.githubusercontent.com` for `next/image`.

## Architecture

**Auth & GitHub token flow.** NextAuth v4 (`src/app/api/auth/[...nextauth]/route.ts`), GitHub OAuth, JWT sessions, scopes `read:user user:email repo`. On sign-in the user is upserted into Postgres and their GitHub access token is **AES-256-GCM encrypted** (`src/lib/encryption.ts`, keyed by `ENCRYPTION_KEY`, a 64-char hex string) before being stored on `User.githubAccessToken`. The session callback re-reads the DB to attach `user.id` and `user.githubLogin`. `middleware.ts` gates all app routes (`/dashboard`, `/repos`, `/profile`, `/analytics`, `/onboarding`, `/settings`, `/graph`) and redirects logged-in users away from `/` and `/auth/login`.

**GitHub access.** Always go through `GitHubClient` in `src/lib/github.ts` — its constructor takes the *encrypted* token and decrypts internally, so pass `user.githubAccessToken` straight from the DB. It wraps Octokit and includes rate-limit handling (`handleRateLimit`).

**Repo sync + health score.** `POST /api/github/sync` fetches every repo, processes in batches of 10, and computes a 0–100 `healthScore` from `HEALTH_WEIGHTS` (README present/long, description, topics, license, recent commit, issues, stars, not-a-fork, dependencies) starting at a base of 50. This is the canonical place repos get written; the same weighting logic is duplicated inline in that route, not extracted.

**AI layer.** `src/lib/ai.ts` uses the Anthropic SDK (`new Anthropic()` reads `ANTHROPIC_API_KEY` from env). Model id is a constant repeated in `analyzeRepository`, `analyzeProfile`, and `generateReadme` — update it there. Claude is prompted to return JSON; `extractJSON()` is a bracket-matching parser that tolerates prose around the JSON and validates against expected keys (`REPO_EXPECTED_KEYS` / `PROFILE_EXPECTED_KEYS`). Results persist to the `RepoAnalysis` / `ProfileAnalysis` tables. API entry points live under `src/app/api/ai/`.

**Graph.** `src/lib/graph.ts::buildGraphData(userId)` turns a user's repos into nodes and derives edges of type `shared-dependency`, `same-language`, or `fork-of`. Snapshots persist to `GraphSnapshot`. Rendered client-side with `reactflow`/`d3`.

**Data layer.** Prisma + Postgres (Neon in prod), singleton client in `src/lib/db.ts`. Models: `User`, `Repository`, `RepoAnalysis`, `ProfileAnalysis`, `GraphSnapshot` — all children cascade-delete from `User`. JSON-typed columns (`languages`, `dependencies`, `strengths`, `skillMap`, graph `nodes`/`edges`, …) are cast with `as any` at the Prisma boundary.

**Client state.** Two systems: `@tanstack/react-query` for server data (query keys `['repos']`, `['repo', id]`, `['graph']`, `['profile-analysis']`, `['repo-analysis', repoId]` — hooks in `src/hooks/` own the `fetch` calls and cache invalidation) and `zustand` with `persist` for UI/local state (`src/store/index.ts`, exposes `useUIStore`, `useRepoStore`). Note `src/types/index.ts` and `src/store/index.ts` each redeclare the domain interfaces (`Repository`, `GraphNode`, …) with slightly different date typings (`Date` vs `string`) — keep them in sync when changing shapes.

**Routing.** App Router. Authenticated pages live in the `src/app/(dashboard)/` route group under a shared top-nav `layout.tsx`. Path alias `@/*` → `src/*`.

**Styling.** Tailwind v4 (`@import "tailwindcss"` in `globals.css`) plus design tokens as CSS custom properties, alongside per-component plain-CSS files (`Button.tsx` + `button.css`, etc.). Match the existing pattern for the component you're editing rather than introducing a new styling approach.

## Environment

Required env vars (see `.env.example`): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `ENCRYPTION_KEY` (generate with `openssl rand -hex 32`). Deployment target is Vercel; see `AGENTS.md` for the full Vercel/OAuth-callback checklist.
