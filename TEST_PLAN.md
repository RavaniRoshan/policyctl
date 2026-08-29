# policyctl — Production-Readiness Test Plan

Run this checklist before launch. Each item should be ✅ green. Phases A/B/C.

---

## Phase A — local-first runtime (CLI + engine)

- [ ] `npm view @policyctl/cli version` → `0.1.6` (latest tag correct)
- [ ] `npm view @policyctl/core version` → `0.1.6`
- [ ] `@policyctl/cli@0.1.0` … `@0.1.5` show `deprecated` (not installable by accident)
- [ ] `pnpm --filter @policyctl/core test` passes (engine unit tests)
- [ ] `pnpm --filter @policyctl/cli test` passes (check/eval regression tests)
- [ ] `node packages/cli/dist/cli.js --help` prints all commands
- [ ] `policyctl init --template full` scaffolds `.policyctl.yml`
- [ ] `policyctl list` / `policyctl gen claude` run without error on a sample policy
- [ ] GitHub release `v0.1.6` exists and publish workflow is idempotent

## Phase B — hosted control plane (Worker + D1)

- [ ] Worker live at `https://policyctl-server.shivamkumar10958.workers.dev`
- [ ] `POST /api/login {email}` → `{token, email, id}` (200)
- [ ] `POST /api/policy {yaml}` creates version 1; a second push → version 2
- [ ] `GET /api/policy` returns the current version's yaml
- [ ] `GET /api/policy/versions` lists versions newest-first
- [ ] `POST /api/policy/versions/:id/rollback` restores an older version
- [ ] `POST /api/report` + `GET /api/violations` round-trips a violation
- [ ] `GET /api/orgs` / `POST /api/orgs` / `POST /api/orgs/:id/members` all 200
- [ ] Auth is enforced (missing/invalid Bearer → 401)
- [ ] `/dashboard` renders with KPI tiles, SVG chart, distribution bars, versions table
- [ ] Dashboard returns to login page for invalid token
- [ ] `pnpm --filter @policyctl/server build` (tsc + CSS inline) is clean

## Phase C — analytics & fleet

- [ ] `POST /api/report` with `actor:"human"` and `actor:"agent"` both 200
- [ ] `GET /api/analytics?days=30` returns total, byActor (grouped correctly), byRepo, byRule, trend, repeatOffenders
- [ ] Repeat offenders only include `(rule, repo)` with count > 1
- [ ] `GET /api/export/violations.csv` returns `text/csv` + `content-disposition` header
- [ ] CSV header row: `id,repo,rule_id,enforce,message,agent,actor,created_at`
- [ ] Dashboard "Export CSV" button triggers the download
- [ ] R2 secrets (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`) are set on the Worker
- [ ] Inline CSV fallback works even before the R2 bucket is provisioned

## Site — marketing + docs

- [ ] Landing (`policyctl.pages.dev`) returns 200, premium markers present
- [ ] WebGL gradient script serves (200) and mounts behind hero
- [ ] Hero copy readable: scrim + text-shadow present, content z-index above gradient
- [ ] All landing links resolve (GitHub, npm, /docs)
- [ ] Docs (`/docs`) returns 200, 3-column layout (nav + content + TOC)
- [ ] Docs Cmd+K search dialog present, theme toggle present, AI actions present
- [ ] Docs edit/issue utility links present
- [ ] `pnpm --filter policyctl-site build` is clean
- [ ] `pnpm --filter policyctl-web build` (React + Tailwind) is clean — component compiles

## Cross-cutting

- [ ] `pnpm install` resolves cleanly across all workspaces
- [ ] `pnpm -r build` (core, cli, server, site, web) all pass
- [ ] `pnpm -r test` all pass
- [ ] No secrets committed (npm token, R2 keys, Cloudflare token are only in GitHub secrets / Wrangler)
- [ ] `web/dist`, `site/dist`, `packages/*/dist`, `*.tsbuildinfo` are gitignored
- [ ] README badges, Links table, API surface, and Roadmap are current
- [ ] Design system tokens used consistently (no raw purple/blue outside tokens)
