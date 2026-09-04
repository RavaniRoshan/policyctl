# Accessibility debt register

Measured 2026-09-04 via `web/e2e/a11y.spec.ts` (axe-core, WCAG 2.1 A/AA, 15 routes,
desktop-light). **Zero critical violations** — the CI gate blocks on critical.

## Known serious debt: color-contrast (98 nodes, 5 sampled routes)

One systemic rule. Failing patterns (fg on light surface, ratio):

| Pattern | Example | Ratio | Needed |
|---|---|---|---|
| `text-black-alpha-32` microcopy (eyebrows, index strips, kbd) | `[ overview · … ]` | 1.94 | 4.5 |
| `text-black-alpha-48` secondary (timestamps, hints) | `Sep 04, 07:03 AM` | 2.92 | 4.5 |
| `text-black-alpha-56` links/body-secondary | npm footer link | 3.69 | 4.5 |
| `text-heat-100` small text on white | View-all links, theme labels | 3.18–3.32 | 4.5 |
| `text-success` (#10b981) stat numerals | `94%` at 40px | 2.53 | 3.0 (large) |

## Decision needed (product, not engineering)

The faint mono microcopy and heat accents ARE the blueprint aesthetic. Options:

1. **Accept + document**: treat microcopy/eyebrow labels as decorative, fix only
   functional text (timestamps → alpha-64, links stay heat but gain underline on
   hover/focus as a non-color cue). Smallest diff, keeps the look.
2. **Token ramp redesign**: introduce light-mode text variants (darker heat/grays
   for `<18px` text), re-verify dark mode fully. Correct but wide blast radius.

Do not silently weaken the gate: serious findings print per-route in CI output
(`[a11y-watchlist]`) as the ratchet. Promote to blocking once the above is decided.
