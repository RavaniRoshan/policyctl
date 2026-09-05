# AGENTS.md — policyctl

This file documents the project structure, conventions, and workflows for AI agents and human contributors. **If you're an AI agent picking up this repo, read this file in full before making any changes.** It encodes the fundamental engineering principles the team has agreed on.

## Project Overview

**policyctl** is a provider-agnostic policy runtime for coding agents. One `.policyctl.yml` file enforces deterministic rules across Claude Code, OpenAI Codex, Cursor, and CI pipelines.

- **Free CLI**: local-first, MIT-licensed, full hooks + CI gate
- **Cloud** ($5/seat/month): shared policy versioning, audit feed, AI rule authoring, CSV export, live sessions, daily compliance reports

### Pricing Tiers

| Tier | Monthly | Annual | Features |
|---|---|---|---|
| **Free (Open Source)** | $0 | N/A | All CLI commands, hooks, CI gate, 8 matchers, MIT licensed, local-first |
| **Cloud** | $5/seat | $50/seat | Policy versioning, audit feed, AI (analyzer + author), daily reports, CSV export, live sessions, 14-day trial |

**Seat** = any `org_member` with role `owner`, `admin`, or `member` (excluding `viewer`). Annual billing is a simplified 2-month discount (pay $50 instead of $60).

**Regional targeting**: Stripe Checkout supports multiple payment methods and currencies. For Chinese developers, consider adding Alipay/WeChat Pay via a local payment provider. For UK developers, GBP pricing and Faster Payments support. The pricing page should display prices in the user's local currency.

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

### 3. **Auth0 callback URLs do NOT use a trailing slash.**
- The frontend sends `redirect_uri = ${origin}` (no trailing slash), matching the Auth0 quickstart convention
- In the Auth0 dashboard, Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins should use the no-trailing-slash variants
- Both `http://localhost:5173` and `https://policyctl-web.pages.dev` must be in the Auth0 application's Allowed Callback URLs list

### 4. **Object storage (R2) stays removed; Filebase holds report archives.**
- CSV exports stream directly from the Worker response — no object storage needed
- Daily compliance reports persist in KV (`POLICYCTL_CACHE`) with a 7-day TTL
- The same reports are also archived as JSON in Filebase (`reports/daily/{orgId}/{date}.json`, S3-compatible, `packages/server/src/storage.ts`) — viewable via `GET /api/report/daily/archives`
- AI insights persist in D1 (`ai_insights` table) for audit and dashboard stats
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
│   ├── server/           # Cloudflare Workers API (Hono + D1 + KV)
│   └── types/            # @policyctl/types — shared API contract types (Worker ↔ SPA)
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

### Auth Flow

Auth0 (Universal Login) handles all authentication on the frontend via `@auth0/auth0-react`. The SPA obtains an RS256-signed access token and sends it as a `Bearer` token. The Worker verifies it with `jose` + Auth0's JWKS endpoint (cached in KV).

The legacy CLI magic-link flow (`POST /api/login` with `?token=`) is retained for backward compatibility — `requireUser()` tries JWT verification first, then falls back to the legacy token lookup.

**Turnstile** is enforced on `/api/login` (verified when a `turnstile_token` is present in the request body). The SPA's AuthPage uses Auth0 Universal Login, which has its own bot protection. The `TURNSTILE_SECRET_SITE` secret must be set via `wrangler secret put` or passed through CI/CD.

### Endpoints

| Endpoint | Method | Returns |
|---|---|---|
| `/api/login` | POST | `{ token, email, id }` (legacy CLI magic-link) |
| `/api/me` | GET | `{ user }` or `{ user: null }` |
| `/api/orgs` | GET | `{ orgs: Org[] }` |
| `/api/orgs` | POST | `{ org: Org }` |
| `/api/orgs/:id/members` | POST | Add member to org |
| `/api/orgs/:id` | DELETE | Delete org (cascade; requires owner role) |
| `/api/analytics` | GET | `{ compliance_score, active_sessions, violations_24h, ai_insights }` |
| `/api/violations` | GET | `Violation[]` |
| `/api/policy` | GET | `{ yaml }` |
| `/api/policy` | POST | `{ ok, version, id }` |
| `/api/policy/versions` | GET | `PolicyVersion[]` |
| `/api/policy/versions/:id/rollback` | POST | `{ ok }` |
| `/api/report` | POST | `{ ok, count }` |
| `/api/export/violations.csv` | GET | CSV download (streams directly) |
| `/api/ai/analyze` | POST | `{ summary, violations, suggestedRules }` (paid tier required) |
| `/api/ai/author` | POST | `{ rule, explanation }` (paid tier required) |
| `/api/billing/status` | GET | `{ subscription, is_paid, is_trial, days_remaining_in_trial, seat_count, plan, has_api_key }` |
| `/api/billing/checkout` | POST (body: `{ plan, interval }`) | `{ url }` (Stripe Checkout redirect) |
| `/api/billing/portal` | POST | `{ url }` (Stripe Customer Portal redirect) |
| `/api/billing/api-key` | POST | `{ key }` (generate control-plane API key) |
| `/api/webhook/stripe` | POST | Stripe webhook handler (raw body, signature verified) |
| `/api/report/daily` | GET | `{ report, message? }` |
| `/api/report/daily/resend` | POST | `{ ok, message }` (regenerate report on demand) |
| `/api/session/init` | POST | Session stub |
| `/api/session/:key/stream` | GET | WebSocket to DO |
| `/api/session/:key/report` | POST | Report to DO |

### Type Alignment

Shared API contract types live in `packages/types/src/index.ts` (`@policyctl/types`). Both the Worker and the SPA import from this package, so response shapes stay in sync at compile time.

### Billing & Subscriptions

The control plane uses Stripe Checkout for subscriptions. Key rules:

- **Subscription tier is at the org level** — each org has one Stripe subscription. Seats = non-viewer `org_members` (roles: owner, admin, member). Viewers are excluded from billing.
- **14-day free trial** — starts at checkout time, not at signup. `subscription_status` is `trialing` during the trial, then `active` once payment is processed.
- **Tier gating** — `isOrgActive(org)` returns `true` for `active` or `trialing` status. AI endpoints (`/api/ai/analyze`, `/api/ai/author`) return 403 with `code: "UPGRADE_REQUIRED"` for non-paid orgs.
- **Secrets** — `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set via `wrangler secret put` (never committed). Price IDs (`STRIPE_PRICE_ID_GROWTH_MONTHLY`, `STRIPE_PRICE_ID_GROWTH_ANNUAL`) are safe to commit as `[vars]`. Pro-tier price IDs (`STRIPE_PRICE_ID_PRO_MONTHLY/ANNUAL`) are kept for future expansion.
- **Webhook** — `POST /api/webhook/stripe` receives raw body for signature verification. Handles `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded/failed`, `customer.subscription.trial_will_end`.
- **Customer portal** — `POST /api/billing/portal` creates a Stripe-hosted session for users to manage payment methods, upgrade/downgrade, and cancel.
- **Annual discount** — Simplified 2-month discount (pay $50/seat/year instead of $60). Implemented as separate Stripe price IDs.
- **Legacy server-rendered dashboard** (`dashboard.ts`) has been deprecated. The root `/` route now redirects to the SPA frontend. The CLI retains the legacy magic-link token path (`requireUser()` falls back to it) for backward compatibility.
- **CLI tier awareness** — `requirePaidPlan()` in `packages/cli/src/hosted.ts` checks `/api/billing/status` before any cloud command (`push`, `report`, `pull`, `check --report`). Free users get a clear error message with a link to start a trial.

The backend uses `toWebUser()`, `toWebOrg()`, `toWebViolation()`, `toWebPolicyVersion()`, and `toWebAnalytics()` mappers to convert D1 rows (numbers, nullable fields) to the shapes the frontend expects (strings, ISO dates). Never let the frontend guess at shape — if a backend field is `string | null`, the frontend type must say so too.

## Demo Data Layer

`web/src/lib/demo-data.ts` provides realistic mock data for the dashboard when the Worker is unavailable. It is only active in non-production builds (see Fundamental Principle #1). To disable in a specific preview, set `USE_DEMO = false` in `web/src/lib/hooks.ts` and wire `VITE_API_BASE` correctly.

The demo data is never extended to add fake "production" behavior. If you need a new shape, add it to the actual Worker endpoint and to the demo data in parallel.

## User Flows

### Happy Path

```
Landing (/) → Signup → Onboarding → Choose plan (pricing page) → Billing (start trial) → Dashboard
```

### Auth States

- **Unauthenticated**: Can view Landing, Docs, Login, Signup
- **Authenticated, no subscription**: Can access Dashboard, Onboarding, Settings; AI/paywall-gated
- **Trial or Paid**: Full access including AI endpoints
- **Session expiry**: `RequireAuth` redirects to `/login?next=<path>`, login redirects back

### Billing Flow

1. User lands on `/pricing` or clicks "Start free trial" from the Landing page
2. Chooses billing interval (monthly $5 or annual $50)
3. Clicks "Start free trial" → calls `POST /api/billing/checkout?plan=growth&interval=annual`
4. Server creates a Stripe Checkout Session with 14-day trial → redirects to Stripe
5. After successful checkout, Stripe webhook fires → org's `subscription_status` set to `trialing`
6. User is redirected back to `/dashboard/billing` showing trial countdown
7. At trial end, if payment succeeds → status becomes `active`; if it fails → `past_due`

### Onboarding

- 4 steps: Welcome → Workspace → Install → Push
- Skippable ("Skip for now")
- Completion persisted in `localStorage` (`policyctl-onboarding-complete`)
- The Workspace step creates an org via `POST /api/orgs` (best-effort — navigation proceeds even if the org already exists)

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

The frontend deploys to Cloudflare Pages and the Worker deploys to Cloudflare Workers via GitHub Actions. Push to `main` triggers:
1. `ci` — build, type-check, test
2. `deploy` — deploys `packages/server` to Cloudflare Workers and `web/dist` to Cloudflare Pages project `policyctl-web`

Pull requests to `main` get a Pages preview deploy (`preview-web` in `preview.yml`).
There is intentionally no staging Worker: a `--name` override would reuse the
production D1/KV bindings (see the note in `deploy.yml`).

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
- `@policyctl/types` → `packages/types/src/index.ts`

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
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
```

### Backend (`packages/server/wrangler.toml`)

```
TURNSTILE_SECRET_SITE=your-secret-key    # via wrangler secret put or CI/CD
AUTH0_DOMAIN=your-tenant.us.auth0.com     # via [vars]
AUTH0_AUDIENCE=your-api-audience          # via [vars]
# Stripe (passed through CI/CD secrets or set via wrangler secret put — never committed):
#   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
# Stripe price IDs (safe to commit via [vars]):
STRIPE_PRICE_ID_GROWTH_MONTHLY, STRIPE_PRICE_ID_GROWTH_ANNUAL
STRIPE_PRICE_ID_PRO_MONTHLY, STRIPE_PRICE_ID_PRO_ANNUAL
```

The `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are passed through CI/CD (see `.github/workflows/deploy.yml`) or set via `wrangler secret put`. Price IDs are safe to commit as `[vars]` — run `node scripts/setup-stripe-prices.mjs` to create real Stripe products/prices and auto-write the IDs into `wrangler.toml`. Growth ($5/mo, $50/yr) and Pro ($12/mo, $120/yr) products should be set up. For Chinese developers, Stripe Checkout automatically offers Alipay and WeChat Pay when the customer's locale is `zh`.

## Common Tasks for AI Agents

### "Add a new dashboard page"
1. Create `web/src/pages/dashboard/MyPage.tsx`
2. Add a type to `packages/types/src/index.ts` if the endpoint returns a new shape
3. Add an API method to `web/src/lib/api.ts` using the shared type
4. Add a hook to `web/src/lib/hooks.ts` (using `fetchData` for dev fallback)
5. Add the route in `web/src/App.tsx` under the `/dashboard` parent
6. Add a sidebar item in `web/src/components/layout/DashboardShell.tsx`

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
