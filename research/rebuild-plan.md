# policyctl — Complete Rebuild & Engineering Plan

> Generated: 2026-08-30 · Status: Planning Phase · Scope: Full frontend rebuild, backend alignment, CI/CD, and dynamic workflow

---

## Part 1: Codebase Grounding (Current State)

### 1.1 What policyctl Is

**policyctl** is a provider-agnostic policy runtime for coding AI agents. It solves the problem that prompt files (`CLAUDE.md`, `.cursorrules`, `AGENTS.md`) are advisory and routinely ignored by agents.

**Core value proposition:** Write one `.policyctl.yml` file encoding procedural rules, enforce them deterministically inside Claude Code, OpenAI Codex, Cursor, and CI — at tool-call time via generated hooks, and again as a hard gate on the git diff.

**Business model:** Free MIT CLI + $5/seat/month hosted control plane (policy versioning, audit dashboard, analytics, cross-repo sync).

### 1.2 Current Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                    │
│  Claude Code · Codex · Cursor · GitHub Actions · CLI login         │
│       │              │        │        │           │                │
│       └──────────────┴────────┴────────┴───────────┘                │
│                              │ generated hooks + Bearer token       │
│                    ┌─────────▼──────────┐                           │
│                    │   policyctl CLI     │                           │
│                    │   (eval --hook)     │                           │
│                    └─────────┬──────────┘                           │
│                              │ npm: @policyctl/cli + @policyctl/core│
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                     ┌─────────▼──────────┐
                     │  Cloudflare Worker  │
                     │  (policyctl-server) │
                     │  Hono + D1 + KV     │
                     │  + R2 + AI + DO     │
                     └─────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐    ┌─────▼─────┐   ┌─────▼──────┐
         │  D1     │    │    KV     │   │  Durable   │
         │ SQLite  │    │  Cache    │   │  Objects   │
         │(users,  │    │(policy,   │   │(sessions,  │
         │ orgs,   │    │ session)  │   │ WebSocket) │
         │ policy, │    └───────────┘   └────────────┘
         │ violat.)│
         └─────────┘
```

### 1.3 Monorepo Structure

| Package | Purpose | Status |
|---------|---------|--------|
| `packages/cli/` | Commander.js CLI binary (`@policyctl/cli`) | Shipped · v0.1.6 |
| `packages/core/` | Policy engine, matchers, loader (`@policyctl/core`) | Shipped · v0.1.6 |
| `packages/server/` | Cloudflare Worker API + dashboard | Shipped · live at `*.workers.dev` |
| `packages/design-system/` | CSS tokens + component styles | Shipped · tokens.css |
| `site/` | Static marketing + docs (Vite, vanilla HTML) | Shipped · `policyctl.pages.dev` |
| `web/` | React + Tailwind SPA dashboard | Built but NOT deployed to Pages |

### 1.4 Cloudflare Resources in Use

| Resource | Binding | Purpose |
|----------|---------|---------|
| **Pages** | `policyctl` project | Static site → `policyctl.pages.dev` |
| **Workers** | `policyctl-server` | API control plane |
| **D1** | `DB` (`policyctl`) | Primary database (SQLite at edge) |
| **KV** | `POLICYCTL_CACHE` | Sub-ms policy + session cache |
| **R2** | `R2` (`policyctl` bucket) | CSV exports |
| **Workers AI** | `AI` | LLM inference (Llama 4 Scout) |
| **Durable Objects** | `POLICY_SESSION` | Live enforcement sessions + WebSocket |
| **Turnstile** | Secret/env | Anti-bot on auth |
| **Cron Triggers** | `0 9 * * *` | Daily compliance report |

### 1.5 CI/CD Current State

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | Push/PR to main | Install, build, test, CLI smoke test |
| `pages.yml` | Push to main, manual | Build `site/`, deploy to Cloudflare Pages |
| `publish.yml` | Tag `v*.*.*` | Build, publish `@policyctl/core` + `@policyctl/cli` to npm, GitHub release |

**Gap:** The `web/` React SPA has NO deployment pipeline. It's built locally but never deployed.

---

## Part 2: Wiring Audit — What's Connected, What's Not

### 2.1 Frontend ↔ Backend Wiring

| Connection | Status | Notes |
|------------|--------|-------|
| `site/` (static) → `policyctl.pages.dev` | ✅ Working | Deployed via `pages.yml` |
| `web/` (React SPA) → Cloudflare Pages | ❌ NOT deployed | No Pages project, no CI pipeline |
| `web/` → `policyctl-server` Worker | ✅ Wired in code | `VITE_API_BASE` env var, but SPA isn't live |
| `site/` → `web/` routing | ❌ No connection | Static site and SPA are completely separate |
| CLI → Worker API | ✅ Working | Bearer token auth, live |
| Worker → D1 | ✅ Working | Migrations applied |
| Worker → KV | ✅ Working | Session + policy cache |
| Worker → R2 | ✅ Configured | CSV export bucket |
| Worker → Workers AI | ✅ Configured | Llama model bound |
| Worker → Durable Objects | ✅ Configured | Session streaming |
| Worker → Turnstile | ⚠️ Test key only | Real key needs Cloudflare dashboard |
| Worker → Google OAuth | ⚠️ Code written | Needs Google Cloud Console credentials |

### 2.2 Critical Gaps Identified

1. **`web/` SPA is not deployed.** The React dashboard exists in code but has no Cloudflare Pages project and no CI pipeline. This is the #1 priority.

2. **No custom domain.** Everything runs on `*.workers.dev` and `*.pages.dev`. The user flow plan references `dash.policyctl.io` which doesn't exist yet.

3. **Static site (`site/`) and SPA (`web/`) are disconnected.** The static site has its own landing/docs. The SPA also has its own landing/docs. They need to be unified or properly routed.

4. **Dashboard data is hardcoded.** The `web/` dashboard pages show mock data, not real API calls.

5. **No preview deployments.** No staging environment, no PR previews.

6. **No infrastructure-as-code.** All Cloudflare resources configured manually via CLI.

7. **OAuth not production-ready.** Google OAuth code exists but credentials aren't set up.

8. **Turnstile using test key.** Production key not configured.

---

## Part 3: Frontend Rebuild — Design Persona & Strategy

### 3.1 Design Research Phase

Before writing any code, we need to establish the design persona. This requires:

1. **Loading the UI/UX Pro Max skill** — to access 84 styles, 192 color palettes, 74 font pairings, 192 product types, 98 UX guidelines, 104 icon entries, 16 GSAP motion presets, and 25 chart types.

2. **Loading the Design Taste Frontend skill** — to ensure the result doesn't look templated, with real design systems and audit-first approach.

3. **Analyzing the product's unique positioning:**
   - Developer tool (CLI-first)
   - AI agent governance (trust + control)
   - Compliance/audit (precision + authority)
   - Multi-provider (Claude, Codex, Cursor)
   - Small team / indie (not enterprise bloat)

### 3.2 Design Persona Options

After research, we'll evaluate these directions:

| Persona | Vibe | Best For | Risk |
|---------|------|----------|------|
| **"The Console"** | Dark, terminal-inspired, monospace-heavy, hacker aesthetic | CLI-native devs, feels like a power tool | Can feel cold, unapproachable |
| **"The Control Room"** | Data-dense, real-time, mission-control, glowing indicators | DevOps/SRE audience, emphasizes monitoring | Can feel overwhelming |
| **"The Compliance Layer"** | Clean, authoritative, institutional, trust signals | Enterprise buyers, emphasizes safety | Can feel boring, generic |
| **"The Agent's Leash"** | Playful-but-precise, constraint as feature, subtle humor | Indie devs, approachable | Can feel unserious |

**Recommended approach:** A hybrid — **"The Deterministic Console"** — combining the precision of a terminal with the polish of a modern SaaS control panel. Dark-by-default, data-rich but not cluttered, with moments of delight (shader backgrounds, smooth transitions) that reward exploration.

### 3.3 Design System Decisions to Make

- **Color palette:** Current emerald/teal + amber + indigo-blue. Keep or evolve?
- **Typography:** Space Grotesk + Inter + JetBrains Mono. Keep or evolve?
- **Motion:** Current cubic-bezier(.4,0,.2,1) 200ms. Keep or evolve?
- **Component style:** shadcn/ui vs custom vs hybrid?
- **Dark mode:** Default dark (current) or light option?
- **Illustration style:** WebGL shaders (current) vs SVG vs none?
- **Density:** Data-dense (current) vs spacious?

### 3.4 Pages to Build (From Scratch)

| Page | Route | Purpose | Priority |
|------|-------|---------|----------|
| Landing | `/` | Marketing hero, social proof, CTA | P0 |
| Docs | `/docs` | Full documentation with search | P0 |
| Login | `/login` | Auth (email + OAuth + Turnstile) | P0 |
| Signup | `/signup` | Auth (email + OAuth + Turnstile) | P0 |
| Onboarding | `/onboarding` | 4-step tutorial for new users | P1 |
| Dashboard Overview | `/dashboard` | Compliance score, sessions, violations | P0 |
| Sessions | `/dashboard/sessions` | Live enforcement feed | P1 |
| Policies | `/dashboard/policies` | Version table + rollback | P1 |
| AI | `/dashboard/ai` | Rule author + diff analyzer | P2 |
| Reports | `/dashboard/reports` | Daily compliance + CSV export | P2 |
| Settings | `/dashboard/settings` | Account, API key, logout | P1 |
| 404 | `/*` | Catch-all | P2 |

### 3.5 User Flow to Design

```
[Discovery]
  Landing → Docs → Signup CTA
         ↘ GitHub → npm install → CLI usage → Login prompt

[Signup]
  /signup → Email+Password+Turnstile → /onboarding
          → Google OAuth → /onboarding

[Onboarding] (4 steps)
  Step 1: policyctl init (scaffold)
  Step 2: policyctl gen (hooks)
  Step 3: policyctl check (CI gate)
  Step 4: policyctl login (connect dashboard)
  → /dashboard

[Dashboard Usage]
  Overview → Sessions (live feed)
           → Policies (versions, rollback)
           → AI (author rules)
           → Reports (compliance, export)
           → Settings (account, logout)

[Return User]
  /login → /dashboard (or /onboarding if first time)
```

### 3.6 Navigation Architecture

```
┌─────────────────────────────────────────────────────┐
│  Marketing Site (public)                            │
│  ┌───────────────────────────────────────────────┐  │
│  │ Nav: Logo · Docs · Pricing · GitHub · Sign In │  │
│  └───────────────────────────────────────────────┘  │
│  Routes: / (landing) · /docs                        │
├─────────────────────────────────────────────────────┤
│  Auth Flow (public)                                 │
│  Routes: /login · /signup · /onboarding             │
├─────────────────────────────────────────────────────┤
│  Dashboard (authenticated)                          │
│  ┌────────┬────────────────────────────────────┐   │
│  │Sidebar │  Header (title, ⌘K, user menu)     │   │
│  │        ├────────────────────────────────────┤   │
│  │Overview│  Main content (Outlet)              │   │
│  │Sessions│                                      │   │
│  │Policies│                                      │   │
│  │AI      │                                      │   │
│  │Reports │                                      │   │
│  │Settings│                                      │   │
│  │        │                                      │   │
│  └────────┴────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Part 4: Backend Alignment & Improvements

### 4.1 What's Already Done (Keep)

| Component | Status | Action |
|-----------|--------|--------|
| D1 schema (users, orgs, members, policy_versions, violations) | ✅ Complete | Keep |
| KV caching layer | ✅ Complete | Keep |
| R2 CSV export | ✅ Complete | Keep |
| Durable Objects (session streaming) | ✅ Complete | Keep |
| Workers AI (Llama model) | ✅ Complete | Keep |
| Auth (signup, login, OAuth, Turnstile) | ✅ Complete | Keep |
| All API endpoints | ✅ Complete | Keep |
| Cron trigger (daily report) | ✅ Complete | Keep |

### 4.2 What Needs Improvement

| Issue | Current State | Target State | Effort |
|-------|--------------|--------------|--------|
| Dashboard data | Hardcoded mock data in `web/` | Real API calls to Worker | Medium |
| Onboarding state | KV flag exists but not wired | Full onboarding completion tracking | Low |
| Analytics endpoint | Exists but returns static data | Real aggregation from violations table | Medium |
| AI endpoints | Exists but untested | Test with real Llama model, add rate limiting | Medium |
| Session streaming | DO implemented | Test WebSocket flow, add reconnection | Medium |
| Error handling | Basic | Structured errors, frontend toast system | Low |
| Rate limiting | None | Add KV-based rate limiting on auth endpoints | Low |
| CORS | Needs verification | Proper CORS for Pages → Worker | Low |

### 4.3 New Backend Features Needed

| Feature | Purpose | Priority |
|---------|---------|----------|
| `/api/analytics` real data | Aggregate violations, sessions, compliance score | P0 |
| `/api/sessions/live` WebSocket | Real-time session streaming to dashboard | P1 |
| `/api/onboarding/status` | Track onboarding completion per step | P1 |
| `/api/policy/validate` | Validate YAML before saving | P1 |
| Health check endpoint | For CI/CD verification | P2 |
| API versioning | `/api/v1/` prefix for future-proofing | P2 |

---

## Part 5: CI/CD Pipeline Design

### 5.1 Target Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                            │
│  main branch ──────────────────────────────────────────┐           │
│  feature branches ──┐                                   │           │
│  tags v*.*.* ──────┐│                                   │           │
│                     ││                                   │           │
│  ┌──────────────────▼▼──────────────────────────────────▼────────┐  │
│  │                    GitHub Actions                              │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │  ci.yml     │  │  deploy.yml  │  │  publish.yml        │  │  │
│  │  │  (on push)  │  │  (on merge)  │  │  (on tag)           │  │  │
│  │  │             │  │              │  │                     │  │  │
│  │  │  · Lint     │  │  · Build web │  │  · Build core/cli   │  │  │
│  │  │  · Typecheck│  │  · Build site│  │  · Publish npm      │  │  │
│  │  │  · Test     │  │  · Deploy    │  │  · GitHub Release   │  │  │
│  │  │  · Build    │  │    Pages     │  │                     │  │  │
│  │  │  · Smoke    │  │  · Deploy    │  │                     │  │  │
│  │  │    test     │  │    Worker    │  │                     │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  preview.yml (on PR)                                    │  │  │
│  │  │  · Build web + site                                     │  │  │
│  │  │  · Deploy to preview URL                                │  │  │
│  │  │  · Post PR comment with preview link                    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Cloudflare                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │  │
│  │  │ Pages        │  │ Pages        │  │ Worker             │  │  │
│  │  │ (production) │  │ (preview)    │  │ (policyctl-server) │  │  │
│  │  │ policyctl.   │  │ pr-123.      │  │ API + dashboard    │  │  │
│  │  │ pages.dev    │  │ pages.dev    │  │                    │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Workflow Definitions

#### `ci.yml` — Continuous Integration (on every push/PR)

```yaml
# Triggers: push to any branch, PR to main
# Steps:
  1. Checkout code
  2. Setup pnpm 9 + Node 24
  3. Install dependencies
  4. Lint (eslint if configured, or tsc --noEmit)
  5. Typecheck all packages
  6. Run unit tests (vitest for core, cli)
  7. Build all packages (core, cli, server, web, site)
  8. CLI smoke test (policyctl --help, policyctl init, policyctl check)
  9. Upload build artifacts (for downstream jobs)
```

#### `deploy.yml` — Deployment (on merge to main)

```yaml
# Triggers: push to main (after CI passes)
# Steps:
  1. Download build artifacts from CI
  2. Deploy site/ to Cloudflare Pages (policyctl project)
  3. Deploy web/ to Cloudflare Pages (new: policyctl-app project)
  4. Deploy Worker (policyctl-server) via wrangler
  5. Run D1 migrations (if any new)
  6. Smoke test production endpoints
  7. Post deploy summary to GitHub
```

#### `preview.yml` — PR Previews

```yaml
# Triggers: PR opened/updated
# Steps:
  1. Build web/ and site/
  2. Deploy to preview Pages URL (pr-{number}.policyctl.pages.dev)
  3. Post/update PR comment with preview link
  4. Deploy Worker to staging (optional)
```

#### `publish.yml` — npm Publishing (on version tag)

```yaml
# Existing workflow — keep as is
# Triggers: push tags v*.*.*
# Steps: build core/cli, publish to npm, GitHub release
```

### 5.3 Environment Strategy

| Environment | Branch | Pages URL | Worker URL | Purpose |
|-------------|--------|-----------|------------|---------|
| Production | `main` | policyctl.pages.dev | policyctl-server.workers.dev | Live product |
| Staging | `staging` | staging.policyctl.pages.dev | policyctl-server-staging.workers.dev | Pre-release testing |
| Preview | PR branches | pr-{n}.policyctl.pages.dev | (same staging) | PR review |

### 5.4 Secrets Management

| Secret | Where | How Set |
|--------|-------|---------|
| `CLOUDFLARE_API_TOKEN` | GitHub Actions | Repo settings → Secrets |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions | Repo settings → Secrets |
| `NPM_TOKEN` | GitHub Actions | Repo settings → Secrets |
| `TURNSTILE_SECRET_SITE` | Worker | `wrangler secret put` |
| `OAUTH_GOOGLE_CLIENT_ID` | Worker | `wrangler secret put` |
| `OAUTH_GOOGLE_CLIENT_SECRET` | Worker | `wrangler secret put` |
| `R2_ACCESS_KEY_ID` | Worker | `wrangler secret put` |
| `R2_SECRET_ACCESS_KEY` | Worker | `wrangler secret put` |

---

## Part 6: Dynamic Workflow — How We Work

### 6.1 Development Workflow

```
┌──────────────────────────────────────────────────────────────┐
│  Local Development                                           │
│                                                              │
│  1. git checkout -b feature/xxx                             │
│  2. pnpm install                                            │
│  3. pnpm dev (runs all packages in parallel)                │
│     - site/ → Vite dev server (localhost:5173)              │
│     - web/ → Vite dev server (localhost:5174)               │
│     - server/ → wrangler dev (localhost:8787)               │
│  4. Make changes, test locally                              │
│  5. pnpm test (run all tests)                               │
│  6. git push → triggers CI                                  │
│  7. Open PR → triggers preview deploy                       │
│  8. Review preview, request changes if needed               │
│  9. Merge to main → triggers production deploy              │
│  10. Verify production                                      │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Task Breakdown (Implementation Order)

#### Phase 0: Foundation (This Week)
- [ ] Load UI/UX Pro Max + Design Taste skills
- [ ] Research and define design persona
- [ ] Create design tokens (colors, typography, spacing, motion)
- [ ] Set up Cloudflare Pages project for `web/`
- [ ] Configure CI/CD pipelines (ci.yml, deploy.yml, preview.yml)
- [ ] Set up staging environment

#### Phase 1: Core Pages (Week 2-3)
- [ ] Build new Landing page (from scratch, new design)
- [ ] Build new Docs page (from scratch, new design)
- [ ] Build new Login page (from scratch, new design)
- [ ] Build new Signup page (from scratch, new design)
- [ ] Wire auth flow to Worker API
- [ ] Deploy to production

#### Phase 2: Dashboard (Week 3-4)
- [ ] Build Dashboard shell (sidebar + header)
- [ ] Build Overview page (real API data)
- [ ] Build Sessions page (real-time feed)
- [ ] Build Policies page (versions + rollback)
- [ ] Build Settings page
- [ ] Build Onboarding flow

#### Phase 3: Advanced Features (Week 4-5)
- [ ] Build AI page (rule author + analyzer)
- [ ] Build Reports page (compliance + CSV export)
- [ ] WebSocket session streaming
- [ ] Analytics aggregation
- [ ] Rate limiting

#### Phase 4: Polish & Launch (Week 5-6)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Production secrets rotation

### 6.3 Quality Gates

| Gate | Criteria | Automated? |
|------|----------|------------|
| Lint pass | No ESLint/TS errors | ✅ |
| Typecheck pass | No TypeScript errors | ✅ |
| Unit tests pass | All vitest tests green | ✅ |
| Build success | All packages build | ✅ |
| CLI smoke test | `policyctl --help` works | ✅ |
| Preview deploy | Pages deploy succeeds | ✅ |
| API smoke test | Worker endpoints respond | ✅ |
| Lighthouse score | > 90 performance | 🔲 Manual |
| Accessibility | WCAG 2.1 AA | 🔲 Manual |

### 6.4 Verification Strategy

After every deployment:
1. **Automated smoke tests** — curl key endpoints, verify 200s
2. **Manual checklist** — landing loads, signup works, dashboard renders
3. **Preview links** — every PR gets a live preview
4. **Rollback plan** — `git revert` + redeploy, or Pages rollback

---

## Part 7: Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Design persona doesn't resonate | Medium | High | Research phase first, get user feedback before building |
| Cloudflare Pages → Worker CORS issues | Medium | Medium | Test early, configure CORS headers properly |
| OAuth setup complexity | Medium | Low | Use test mode first, defer production OAuth |
| Scope creep | High | Medium | Strict phase boundaries, ship MVP first |
| Breaking existing CLI users | Low | High | Keep CLI stable, version API separately |
| D1 migration failures | Low | High | Test migrations on local first, backup before migrate |
| Turnstile production key setup | Low | Medium | Use test key initially, swap when ready |

---

## Part 8: Open Questions for User

Before implementation begins, these need answers:

1. **Design direction preference** — Should I present 2-3 design persona options with mockups, or proceed with the recommended "Deterministic Console" direction?

2. **Custom domain** — Is `dash.policyctl.io` (or similar) available, or should we stick with `*.pages.dev` for now?

3. **Scope confirmation** — Should the static `site/` be fully replaced by the React SPA, or should they coexist (SPA handles dashboard, static site handles marketing)?

4. **OAuth priority** — Is Google OAuth needed for launch, or can email/password suffice initially?

5. **Staging environment** — Do you want a full staging environment, or is production-only acceptable for now?

6. **Cloudflare API token** — Do you have a Cloudflare API token with the right scopes (Pages, Workers, D1, KV, R2) ready to add to GitHub Secrets?

---

## Appendix A: File Inventory (Current State)

### Frontend (web/) — To Be Rebuilt
```
web/src/
├── App.tsx                    # Router (BrowserRouter)
├── main.tsx                   # Entry point
├── lib/
│   ├── auth.tsx               # AuthProvider, RequireAuth, useAuth
│   ├── api.ts                 # API client
│   └── use-reveal.ts          # Scroll-reveal hook
├── pages/
│   ├── Landing.tsx            # 306 lines, full marketing page
│   ├── Docs.tsx               # Documentation page
│   ├── Login.tsx              # 39 lines, thin wrapper
│   ├── Signup.tsx             # 36 lines, thin wrapper
│   ├── Onboarding.tsx         # 4-step tutorial
│   └── Dashboard.tsx          # 272 lines, all dashboard pages
└── components/
    ├── ui/
    │   ├── auth-section-1.tsx # 200 lines, auth form
    │   ├── button.tsx         # shadcn Button
    │   ├── card.tsx           # shadcn Card
    │   ├── input.tsx          # shadcn Input
    │   ├── badge.tsx          # shadcn Badge
    │   ├── code-block.tsx     # Code display
    │   ├── callout.tsx        # Note/Tip/Warning/Danger
    │   ├── command-palette.tsx # ⌘K palette
    │   ├── turnstile.tsx      # Cloudflare Turnstile
    │   ├── gradient-wave.tsx  # WebGL shader (762 lines)
    │   ├── gradient-wave-demo.tsx
    │   └── brand-icons.tsx    # Logo/icons
    └── layout/
        ├── MarketingNav.tsx   # Public nav
        ├── Footer.tsx         # Public footer
        ├── Sidebar.tsx        # Dashboard sidebar
        └── DashboardHeader.tsx # Dashboard header
```

### Frontend (site/) — Static, May Be Replaced
```
site/
├── index.html                 # 38KB landing page
├── docs.html                  # 29KB documentation
├── vite.config.ts             # Multi-page build
├── public/
│   ├── gradient-wave.js       # Vanilla WebGL shader
│   └── llms.txt               # LLM-ready docs
└── src/                       # (minimal JS)
```

### Backend (packages/server/) — Mostly Complete
```
packages/server/src/
├── index.ts                   # Hono app, all routes
├── auth.ts                    # Signup, login, OAuth, Turnstile
├── store.ts                   # D1 queries
├── cache.ts                   # KV cache layer
├── session.ts                 # Durable Object
├── ai.ts                      # Workers AI integration
├── s3.ts                      # R2 export
├── dashboard.ts               # Server-rendered HTML
└── types.ts                   # Shared types
```

---

## Appendix B: Key Metrics to Track

| Metric | How | Target |
|--------|-----|--------|
| Page load time | Lighthouse | < 2s |
| Time to interactive | Lighthouse | < 3s |
| Lighthouse performance | Lighthouse | > 90 |
| API response time | Worker logs | < 200ms |
| Test coverage | vitest --coverage | > 80% |
| Build time | CI logs | < 5min |
| Deploy time | CI logs | < 3min |

---

*This plan is a living document. It will be updated as design decisions are made and implementation progresses.*
