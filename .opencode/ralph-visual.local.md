---
active: true
iteration: 0
max_iterations: 12
completion_promise: null
---

# Visual perfection loop: policyctl marketing + dashboard surfaces

## Objective
Every public route pixel-tight at 3 breakpoints × light/dark; dashboard audited
against kpi-dashboard-design (5-7 KPIs, trends/targets context, drilldown,
methodology transparency) + ui-ux-pro-max (tokens, a11y, states); fixes applied
and re-verified via screenshots.

## Completion Criteria
Complete when TODO.md shows [x] ALL_TASKS_COMPLETE

## Verification Commands
- `pnpm --filter policyctl-web build` (tsc + vite)
- `node web/scripts/visual-audit.mjs` (screenshots into web/visual/)
- Read screenshots with the Read tool before marking visual items done

## Context
- Skills: kpi-dashboard-design (.agents/skills/kpi-dashboard-design/SKILL.md),
  ui-ux-pro-max (design tokens, a11y)
- Tokens: heat #fa5d19, hairline #ededed, Geist; no hardcoded hex in components
- Demo data ONLY in non-production MODE (never weaken this)
- Dashboard routes need Auth0 login: screenshot those manually via preview URL;
  harness covers public routes + build-time checks for the rest

## Instructions
1. Check TODO.md for the next incomplete task
2. Implement, screenshot, READ the screenshot, fix, re-screenshot
3. Mark done only with screenshot/build evidence
4. Dashboard-behind-auth items: code-level fix + build evidence, screenshots manual
