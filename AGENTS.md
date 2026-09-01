# AGENTS.md — policyctl

This file documents the project structure, conventions, and workflows for AI agents and human contributors. **If you're an AI agent picking up this repo, read this file in full before making any changes.** It encodes the fundamental engineering principles the team has agreed on.

## Project Overview

**policyctl** is a provider-agnostic policy runtime for coding agents. One `.policyctl.yml` file enforces deterministic rules across Claude Code, OpenAI Codex, Cursor, and CI pipelines.

- **Free CLI**: local-first, MIT-licensed, full hooks + CI gate
- **Cloud control plane**: policy versioning, audit dashboard, violation feed, CSV export, AI rule authoring

## Fundamental Engineering Principles

These are non-negotiable. Every change must respect them.

### 1. **Production must not contain mock data, demo banners, or "Coming soon" placeholders that ship.**
- Mock data lives in `web/src/lib/demo-data.ts`
- It is ONLY active when `import.meta.env.PROD === false` (i.e. dev + preview builds)
- In production builds, Vite tree-shakes all mock paths
- A "Demo data" banner appears at the top of the dashboard in dev/preview to make this obvious
- Verified by: `grep -r "DEMO_ANALYTICS\|demo-data" web/dist/` returns zero matches in production builds

### 2. **Three environments are strict and separate:**
- **dev** (`pnpm dev`, `localhost:5173`) — fast HMR, mock data, debug logs
- **preview** (`pnpm preview`, `localhost:4173`) — production build served locally, still uses mock data
- **production** (Cloudflare Pages, `policyctl-web.pages.dev`) — real Worker API, no mock, no debug logs, minified

The build mode is detected via `import.meta.env.MODE` and `import.meta.env.PROD`. Never check `window.location.hostname` or similar runtime checks for environment detection.

### 3. **Auth0 callback URLs must end with a trailing slash.**
- The frontend sends `redirect_uri = ${origin}/` (with trailing slash)
- All callback URLs in the Auth0 dashboard must include the trailing slash variant
- Both `http://localhost:5173/` and `https://policyctl-web.pages.dev/` must be in the Auth0 application's Allowed Callback URLs list

### 4. **R2 storage has been fully removed.**
- CSV exports stream directly from the Worker response
- No object storage, no card details needed
- All R2 references removed from `wrangler.toml`, `index.ts`, secrets
- `web/public/favicon.svg` and `logo-*.png` are static assets only

### 5. **The theme defaults to light.**
- `ThemeProvider` default is `"light"`, not `"system"`
- `index.html` has an inline script that applies the saved theme before React boots to prevent FOUC
- Users can opt into Dark or System from `/dashboard/settings`

### 6. **Mock the brand consistently.**
- The "P with shield + checkmark" mark is `PolicyctlMark` at `web/src/components/brand/PolicyctlMark.tsx`
- It uses `currentColor` so it adapts to dark/light themes
- Used in: nav, sidebar, auth page, favicon, PWA icons
- Source image (`ChatGPT Image ...png`) is gitignored

## Architecture

```
policyctl/
├── packages/
│   ├── cli/              # @policyctl/cli — npm package, static binary
│   ├── core/             # Policy engine (matchers, evaluators)
│   ├── design-system/    # Shared UI primitives (tokens, components)
│   └── server/           # Cloudflare Workers API (Hono + D1 + KV)
├── web/                  # React SPA (Vite + Tailwind + React Router)
├── examples/             # Example .policyctl.yml files
├── AGENTS.md             # this file
├── DESIGN.md             # legacy design notes
└── .github/workflows/    # CI/CD
```

**Note:** `site/` and `research/` directories were removed. Do not recreate them.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite 6 + Tailwind 3.4 |
| Routing | React Router v7 |
| Data fetching | TanStack Query 5 |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Icons | Phosphor Icons |
| Auth | Auth0 (Universal Login) |
| Charts | Recharts |
| Backend | Cloudflare Workers (Hono) + D1 + KV |
| AI | Workers AI (semantic policy intelligence) |

## Design System

The frontend uses a **Firecrawl-inspired blueprint minimalism** design language:

- **Single accent**: heat orange `#fa5d19` — reserved for emphasis, ticks, active states, primary CTAs
- **Hairline borders**: 1px `#ededed` structural grid
- **CurvyRect corners**: SVG corner brackets (no border-radius on structure)
- **Typography**: Geist Sans (Suisse stand-in) at 400/500/600/700 weights
- **Spacing**: 1 Tailwind unit = 1 px (no rem jump)
- **Container**: 1112px max width, 16px side padding (0 on mobile)
- **Breakpoints**: sm 390, md 576, lg 996 (custom)

### Key CSS Variables

```css
--heat-100: #fa5d19       # accent
--accent-black: #262626    # primary text
--accent-white: #f5f5f5    # inverse text
--background-base: #f9f9f9 # page bg
--surface: #ffffff         # card bg
--border-faint: #ededed    # hairline
```

### Component Primitives (in `packages/design-system/src/`)

All prefixed with `pcl-`:
- `.pcl-btn`, `.pcl-btn--primary`, `.pcl-btn--secondary`, `.pcl-btn--tertiary`, `.pcl-btn--danger`
- `.pcl-card`, `.pcl-card--floating`
- `.pcl-badge`, `.pcl-badge--heat`, `.pcl-badge--danger`
- `.pcl-input`, `.pcl-codeblock`
- `.pcl-section`, `.pcl-section__badge`, `.pcl-section__title`, `.pcl-section__subtitle`
- `.pcl-index-strip`, `.pcl-link`

### Blueprint Components (TSX)

- `<CurvyRect>` — SVG corner brackets
- `<Section>` — section header with index strip
- `<Marquee>` — double-track marquee (visibility-gated)
- `<Scramble>` — glyph scramble-decoder
- `<Typewriter>` — cycling placeholder strings
- `<CountUp>` — animated number counter
- `<FeatureTabs>` / `<PillTabs>` — sliding-pill tabs
- `<Sheet>` / `<Modal>` — focus-trapped overlays
- `<CommandPalette>` — ⌘K fuzzy nav
- `<ToastProvider>` / `useToast()` — notification system

## API Integration

The frontend (`web/src/lib/api.ts`) calls the backend at `VITE_API_BASE` (default: `https://policyctl-server.shivamkumar10958.workers.dev`).

### Endpoints

| Endpoint | Method | Returns |
|---|---|---|
| `/api/me` | GET | `{ user }` or `{ user: null }` |
| `/api/auth/signup` | POST | `{ user }` |
| `/api/auth/login` | POST | `{ user }` |
| `/api/auth/logout` | POST | `{ ok: true }` |
| `/api/analytics` | GET | `{ compliance_score, active_sessions, violations_24h, ai_insights }` |
| `/api/violations` | GET | `Violation[]` |
| `/api/policy/versions` | GET | `PolicyVersion[]` |
| `/api/ai/analyze` | POST | `{ summary, violations, suggestedRules }` |
| `/api/ai/author` | POST | `{ rule, explanation }` |
| `/api/export/violations.csv` | GET | CSV download (streams directly) |

### Type Alignment

The backend uses `toWebUser()`, `toWebViolation()`, `toWebPolicyVersion()`, and `toWebAnalytics()` mappers to convert D1 rows (numbers, nullable fields) to the shapes the frontend expects (strings, ISO dates). Never let the frontend guess at shape — if a backend field is `string | null`, the frontend type must say so too.

## Demo Data Layer

`web/src/lib/demo-data.ts` provides realistic mock data for the dashboard when the Worker is unavailable. It is only active in non-production builds (see Fundamental Principle #1). To disable in a specific preview, set `USE_DEMO = false` in `web/src/lib/hooks.ts` and wire `VITE_API_BASE` correctly.

The demo data is never extended to add fake "production" behavior. If you need a new shape, add it to the actual Worker endpoint and to the demo data in parallel.

## User Flows

### Happy Path

```
Landing (/) → Signup → Onboarding → Dashboard → Sessions/Policies/AI/Reports/Settings
```

### Auth States

- **Unauthenticated**: Can view Landing, Docs, Login, Signup
- **Authenticated**: Can access Dashboard, Onboarding, Settings
- **Session expiry**: `RequireAuth` redirects to `/login?next=<path>`, login redirects back

### Onboarding

- 4 steps: Welcome → Workspace → Install → Push
- Skippable ("Skip for now")
- Completion persisted in `localStorage` (`policyctl-onboarding-complete`)
- Does NOT create org/repo/policy via API — displays CLI instructions only

## Development

### Setup

```bash
pnpm install
```

### Dev Server

```bash
cd web && pnpm dev          # http://localhost:5173
```

### Build

```bash
cd web && pnpm build        # type-check + vite build to dist/
```

### Preview Production Build

```bash
cd web && pnpm preview      # http://localhost:4173
```

### Deploy

The frontend deploys to Cloudflare Pages via GitHub Actions. Push to `main` triggers:
1. `ci` — lint, type-check, build, test
2. `deploy-worker` — deploys `packages/server` to Cloudflare Workers
3. `deploy-pages` — deploys `web/dist` to Cloudflare Pages project `policyctl-web`

**Important:** Do not create a duplicate Pages project called `policyctl` — that's a known footgun. Always use `policyctl-web`.

## Conventions

### File Naming

- Components: PascalCase (`Button.tsx`, `DashboardShell.tsx`)
- Pages: PascalCase in `pages/` directory
- Hooks: camelCase with `use` prefix (`useAuth`, `useAnalytics`)
- Utilities: camelCase (`utils.ts`, `cn()`)

### Import Aliases

- `@/` → `web/src/`
- `@policyctl/design-system` → `packages/design-system/src/index.ts`

### Token Usage

**Never hardcode hex values.** Always use CSS variables or Tailwind config tokens:
- ✅ `text-accent-black`, `bg-background-base`, `border-border-faint`
- ❌ `text-[#262626]`, `bg-[#f9f9f9]`

### Accessibility

- All interactive elements must have visible focus rings (`:focus-visible` — 2px heat-orange outline)
- Form errors must use `aria-invalid` + `aria-describedby` + `role="alert"`
- Touch targets must be ≥44×44px
- Respect `prefers-reduced-motion`
- Use semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>`)
- All icon-only buttons need `aria-label`

### Animation

- Micro-interactions: 150–300ms with `cubic-bezier(0.4, 0, 0.2, 1)` (Firecrawl's "standard" easing)
- Loops (marquees, counters): visibility-gated via IntersectionObserver
- Page transitions: instant (no route-transition library)
- Framer Motion `useReducedMotion()` must be respected for accessibility

## Testing

### Core Package

```bash
cd packages/core && pnpm test    # vitest
```

### Server

No tests yet. Response-shape contracts should be tested against `web/src/lib/api.ts` types — every endpoint change must be reflected in the frontend types.

## Environment Variables

### Frontend (`web/.env`)

```
VITE_API_BASE=https://policyctl-server.shivamkumar10958.workers.dev
VITE_TURNSTILE_SITE_KEY=your-site-key
```

### Backend (`packages/server/wrangler.toml`)

```
TURNSTILE_SECRET_SITE=your-secret-key    # via wrangler secret put
```

## Common Tasks for AI Agents

### "Add a new dashboard page"
1. Create `web/src/pages/dashboard/MyPage.tsx`
2. Use `useQuery` from `@/lib/hooks` for data
3. If data is new, add a type to `web/src/lib/api.ts` AND a corresponding store function in `packages/server/src/store.ts`
4. Add the route in `web/src/App.tsx` under the `/dashboard` parent
5. Add a sidebar item in `web/src/components/layout/DashboardShell.tsx`

### "Add a new UI component"
1. Decide if it's generic (in `packages/design-system/`) or app-specific (in `web/src/components/`)
2. Generic: add to `packages/design-system/src/blueprint/` + export from `index.ts`
3. App-specific: add to `web/src/components/`
4. Use existing tokens (`var(--heat-100)`, `bg-background-base`, etc.)
5. Follow the `pcl-` class prefix convention if it's a primitive

### "Fix a visual bug on landing/dashboard"
1. Check which design system token should be used
2. Add the fix to the component
3. Verify it works in both light and dark mode
4. Verify the production build doesn't include any debug code

## License

MIT
