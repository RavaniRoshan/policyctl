# policyctl Design System

policyctl's visual language, defined as **primitives** (the six pillars) with a thin component
library built on top — the same model Cloudflare uses for its own console. Every surface
(CLI, marketing site, docs, dashboard, auth) reads from these tokens so a change cascades
everywhere.

## The six pillars

1. **Logo** — `◆ policyctl` wordmark. The diamond is the brand mark; emerald, never recolored.
2. **Typography** — `Space Grotesk` (display/headings), `Inter` (body), `JetBrains Mono` (code, SHAs, paths).
3. **Color** — token-driven 10-step scales per hue (see below). Dark mode inverts luminosity, keeps hue + saturation.
4. **Layout** — `darkest` console background (`#0B0F0D`), **8px spacing grid**, 1120px content max-width, 3-column docs rhythm.
5. **Icons** — `lucide-react` line icons, 1.4px stroke, currentColor.
6. **Motion** — `cubic-bezier(.4,0,.2,1)`, 200ms default; respect `prefers-reduced-motion`.

## Color tokens (source of truth: `packages/design-system/src/tokens.css`)

| Role | Hue | Primary steps | Usage |
|---|---|---|---|
| Brand (pc) | emerald/teal | `pc-400 #34d399`, `pc-500 #0D9373`, `pc-600 #0a7d62` | brand, links, success, "allowed" |
| Accent (ac) | amber | `ac-400 #fbbf24`, `ac-500 #F59E0B` | attention, warnings, highlights |
| Action (ab) | indigo-blue | `ab-500 #4F6EF7`, `ab-600 #3d5ce5` | **primary CTA buttons** (unique indigo-blue) |
| Neutral (n) | warm slate | `n-100 #eef1f3` text, `n-800 #1f2529` card, `n-900 #121618` panel, `n-950 #0B0F0D` bg, `n-1000 #070a09` inset | surfaces, text, borders |
| Semantic | — | `success #0D9373`, `warn #F59E0B`, `danger #ef4444`, `info #3b82f6` | status pills |

**Status pill colors:** `ACTIVE` = pc-400, `IDLE` = n-400, `KILLED`/`FAIL` = danger, `WARN` = ac-400, `PASS` = pc-400.

## Spacing (8px grid)

`--space-1` 0.25rem → `--space-8` 4rem. Map to Tailwind defaults (1=0.25rem … 16=4rem).

## Radii & shadows

`--r-sm` 6px, `--r-md` 10px, `--r-lg` 16px, `--r-xl` 24px, `--r-pill` 999px.
`--sh-glow` emerald glow for primary actions.

## Component library (built on primitives)

Located in `web/src/components/ui` (shadcn-style, token-driven):

- **Button** — `variant: primary (ab) | ghost | outline | danger`; always has focus ring + loading state.
- **Card** — `pc-card` surface: subtle border `rgba(255,255,255,.06)`, emerald radial hover glow.
- **Input** — dark field, `n-900` bg, focus ring `pc-400`.
- **Badge / Pill** — mono, used for status, `required`/`optional`, provider tags.
- **CodeBlock** — header bar (file path left, lang right), copy → green check 2s, line numbers, diff `+`/`-`.
- **Callout** — Note (info) / Tip (pc) / Warning (ac) / Danger (danger).
- **CommandPalette** — ⌘K fuzzy nav + actions, focus trap, `Esc` closes.

## Dark mode

Default theme is dark (`n-950` bg). Light theme is opt-in via `.light` class on `<html>`,
inverting neutral luminosity. Brand hues keep saturation.

## Usage rules

- Never hardcode hex in components — use `bg-pc-600`, `text-n-100`, `border-n-800`, etc.
- One primary CTA per view (blue). Secondary actions = ghost/outline.
- Monospace for anything machine-readable: SHAs, file paths, policy IDs, commands.
- Every interactive element: visible focus ring + `aria-label` where text is absent.
