# policyctl — web app

The unified React + Vite + Tailwind + TypeScript SPA for policyctl.
This is the **only** web surface — landing, docs, auth, onboarding, and
the dashboard all live here.

## Design language

Firecrawl-inspired **blueprint minimalism**:

- White technical drawing. 1px hairline grid. Mono annotations in brackets
  (`[ 200 OK ]`, `[ .JSON ]`, `// Developer First //`).
- Single accent: **heat orange** `#fa5d19` (only color, does all emphasis work).
- Structural corners (CurvyRect SVG brackets), not border-radius on structure.
- Living wireframes: scramble-decode chips, marquees, count-ups.
- Linear slow loops, `prefers-reduced-motion` respected everywhere.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind 3.4 (1 unit = 1 px, custom heat scale) |
| Components | `@policyctl/design-system` (Firecrawl primitives) |
| Routing | React Router v7 |
| Data | TanStack Query 5 |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Icons | Phosphor |
| Markdown | `react-markdown` + remark-gfm + rehype-slug + rehype-highlight |

## Routes

| Path | Page |
| --- | --- |
| `/` | Landing — hero + 5 sections + pricing + FAQ + CTA |
| `/docs` | Documentation viewer (markdown + search) |
| `/login` | Sign in (RHF + Zod, Turnstile) |
| `/signup` | Create account |
| `/onboarding` | 4-step wizard (auth required) |
| `/dashboard` | Overview (auth required) |
| `/dashboard/sessions` | Enforcement log + sheet detail |
| `/dashboard/policies` | Version table + expandable YAML |
| `/dashboard/ai` | Rule author + analyzer with history |
| `/dashboard/reports` | Delivery schedule + latest report |
| `/dashboard/settings` | Account, API key, theme, danger zone |

## Run

```bash
pnpm install
pnpm --filter policyctl-web dev      # http://localhost:5173
pnpm --filter policyctl-web build    # type-check + vite build
```

## Deploy

Outputs to `dist/`. Configure your host (Cloudflare Pages, etc.) to serve
`dist/` with SPA fallback. The `_redirects` file is preserved.

## Token source

Tokens live in `packages/design-system/src/tokens.css`. Read those before
tweaking colors, spacing, or motion.