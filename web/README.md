# policyctl web (preview)

A small shadcn-compatible React + Vite + Tailwind + TypeScript app used as
the **integration target** for the `GradientWave` WebGL component.

## Why this exists

The marketing site (`/site`) is a static, hand-rolled multi-page Vite build
(HTML + CSS, no React) so it stays at zero JS and ships to Cloudflare Pages
in seconds. The WebGL `GradientWave` component is a React + Tailwind component
from a 21st-style design system, so we keep a separate, lean `web/` workspace
for it to be developed, tested, and demoed against.

## Structure

```
web/
├── src/
│   ├── components/ui/        # shadcn-style UI components (gradient-wave.tsx, …)
│   ├── lib/utils.ts          # `cn()` helper
│   ├── App.tsx               # demo: GradientWave adapted to policyctl tokens
│   ├── main.tsx
│   └── index.css
├── components.json           # shadcn config
├── tailwind.config.ts
├── postcss.config.cjs
├── vite.config.ts
└── tsconfig.json
```

The `components/ui/` path is the shadcn default. Keeping components there
keeps the import alias `@/components/ui/…` consistent and lets `npx shadcn add`
add more primitives later without restructuring.

## Run

```bash
pnpm --filter policyctl-web dev      # http://localhost:5173
pnpm --filter policyctl-web build    # type-check + build to dist/
```

## shadcn setup notes

If you want to extend with more components, this project is pre-wired so:

```bash
npx shadcn@latest init                # picks up components.json
npx shadcn@latest add button card    # adds to src/components/ui/
```

The current setup uses Tailwind 3 + Vite 6 + React 18 + TypeScript 5, which
is the supported matrix for shadcn-ui at the time of writing.

## Color adaptation

The component is invoked in `App.tsx` with a 6-color palette pulled from
`packages/design-system/src/tokens.css`:

```ts
colors={["#0D9373", "#02241e", "#F59E0B", "#043a2f", "#34d399", "#086651"]}
```

`darkenTop` is enabled so the hero copy stays readable.
