# AGENTS.md — policyctl

This file documents the project structure, conventions, and workflows for AI agents and human contributors.

## Project Overview

**policyctl** is a provider-agnostic policy runtime for coding agents. One `.policyctl.yml` file enforces deterministic rules across Claude Code, OpenAI Codex, Cursor, and CI pipelines.

- **Free CLI**: local-first, MIT-licensed, full hooks + CI gate
- **Cloud control plane**: policy versioning, audit dashboard, violation feed, CSV export, AI rule authoring

## Architecture

```
policyctl/
├── packages/
│   ├── cli/              # @policyctl/cli — npm package, static binary
│   ├── core/             # Policy engine (matchers, evaluators)
│   ├── design-system/    # Shared UI primitives (tokens, components)
│   └── server/           # Cloudflare Workers API (Hono + D1 + KV + R2)
├── web/                  # React SPA (Vite + Tailwind + React Router)
├── examples/             # Example .policyctl.yml files
├── research/             # Design research artifacts
├── scripts/              # Build/deploy scripts
└── site/                 # DELETED — merged into web/
```

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite 6 + Tailwind 3.4 |
| Routing | React Router v7 |
| Data fetching | TanStack Query 5 |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Icons | Phosphor Icons |
| Charts | Recharts |
| Backend | Cloudflare Workers (Hono) + D1 + KV + R2 |
| Auth | Cloudflare Turnstile + session cookies |
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

```
--heat-100: #fa5d19       # accent
--accent-black: #262626    # primary text
--accent-white: #f5f5f5    # inverse text
--background-base: #f9f9f9 # page bg
--surface: #ffffff         # card bg
--border-faint: #ededed    # hairline
```

### Component Primitives

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

### Type Alignment

The backend uses `toWebUser()`, `toWebViolation()`, `toWebPolicyVersion()`, and `toWebAnalytics()` mappers to convert D1 rows (numbers, nullable fields) to the shapes the frontend expects (strings, ISO dates).

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

The frontend deploys to Cloudflare Pages via GitHub Actions. Push to `main` triggers deployment.

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

- All interactive elements must have visible focus rings (`:focus-visible`)
- Form errors must use `aria-invalid` + `aria-describedby` + `role="alert"`
- Touch targets must be ≥44×44px
- Respect `prefers-reduced-motion`
- Use semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>`)

### Animation

- Micro-interactions: 150–300ms
- Loops (marquees, counters): visibility-gated via IntersectionObserver
- Page transitions: instant (no route-transition library)

## Testing

### Core Package

```bash
cd packages/core && pnpm test    # vitest
```

### Server

No tests yet. Response-shape contracts should be tested against `web/src/lib/api.ts` types.

## Environment Variables

### Frontend (`web/.env`)

```
VITE_API_BASE=https://policyctl-server.shivamkumar10958.workers.dev
VITE_TURNSTILE_SITE_KEY=your-site-key
```

### Backend (`packages/server/wrangler.toml`)

```
TURNSTILE_SECRET_SITE=your-secret-key    # via wrangler secret put
OAUTH_GOOGLE_CLIENT_ID=your-client-id    # via wrangler secret put
OAUTH_GOOGLE_CLIENT_SECRET=your-secret   # via wrangler secret put
```

## License

MIT
