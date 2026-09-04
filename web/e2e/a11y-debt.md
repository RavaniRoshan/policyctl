# Accessibility debt register

Measured 2026-09-04 via `web/e2e/a11y.spec.ts` (axe-core, WCAG 2.1 A/AA, 15 routes,
desktop-light). **Zero critical violations** — the CI gate blocks on critical.

## 2026-09-04 pass: functional secondary text fixed

All `text-black-alpha-48` body/secondary text → `text-black-alpha-64` (~2.9:1 → ~5.3:1),
plus the npm footer link (alpha-56 → 64). Verified visually: aesthetic preserved.

## 2026-09-04 pass 2: heat-ink token for small functional text

`--heat-ink` added (`#b24300` light / `#ff8a50` dark, ~5.7:1 on white). All small
functional heat text (links, labels, code keywords, selected states) now uses it;
display type intentionally keeps `--heat-100` (passes the 3:1 large-text criterion).
Verified: zero heat findings remain on sampled pages.

## Remaining (decorative/brand — needs product call, see options below)

| Pattern | Example | Ratio | Needed |
|---|---|---|---|
| `text-black-alpha-32` microcopy (eyebrows, index strips, kbd) | `[ overview · … ]` | 1.94 | 4.5 |
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
