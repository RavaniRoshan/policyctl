# policyctl Design System — "The Agent's Leash"

> Version: 2.0 · Generated: 2026-08-30 · Status: Approved for Implementation
> Persona: Playful constraint — "Your agents run free, within fences."

---

## 0. Design Read

**Reading this as:** A developer tool landing + dashboard for technical buyers (staff engineers, DevOps, AI-curious teams), with a playful-but-credible language, leaning toward a **dark-mode Vibrant & Block-based** aesthetic with **claymorphism micro-interactions** and **terminal-native credibility**.

**Three dials:**
- `DESIGN_VARIANCE: 8` — Asymmetric, playful, unexpected compositions
- `MOTION_INTENSITY: 7` — Fluid with moments of delight (spring physics, bouncy interactions)
- `VISUAL_DENSITY: 4` — Marketing: airy and spacious. Dashboard: standard app density.

---

## 1. Color System

### 1.1 Core Palette (Evolved from v1.0)

The v1.0 emerald/teal was too close to generic "AI green." v2.0 shifts to a distinctive **teal-coral** pairing that's ownable and playful while maintaining compliance/trust semantics.

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `--bg-primary` | `#0A0F1A` | Deepest background | Page background, inset surfaces |
| `--bg-surface` | `#111827` | Card/panel background | Cards, modals, sidebars |
| `--bg-elevated` | `#1F2937` | Elevated surface | Hover states, active inputs, dropdowns |
| `--bg-overlay` | `rgba(10,15,26,0.8)` | Modal overlay | Backdrops, scrims |
| `--fg-primary` | `#F9FAFB` | Primary text | Headings, body, labels |
| `--fg-secondary` | `#9CA3AF` | Secondary text | Captions, placeholders, metadata |
| `--fg-muted` | `#6B7280` | Muted text | Disabled states, timestamps |
| `--border` | `rgba(255,255,255,0.08)` | Default border | Cards, inputs, dividers |
| `--border-hover` | `rgba(255,255,255,0.12)` | Hover border | Interactive hover states |

### 1.2 Brand Colors (NEW — distinctive teal-coral)

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `--brand` | `#2DD4BF` | Primary brand | Logo, links, active states, "compliant" |
| `--brand-hover` | `#5EEAD4` | Brand hover | Button hover, link hover |
| `--brand-muted` | `rgba(45,212,191,0.1)` | Brand tint | Selected rows, subtle highlights |
| `--accent` | `#F97316` | Accent (coral) | CTAs, highlights, "attention", warnings |
| `--accent-hover` | `#FB923C` | Accent hover | CTA hover states |
| `--accent-muted` | `rgba(249,115,22,0.1)` | Accent tint | Warning backgrounds, subtle alerts |

### 1.3 Semantic Colors

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `--success` | `#22C55E` | Success | "PASS", "compliant", "allowed" |
| `--success-muted` | `rgba(34,197,94,0.1)` | Success tint | Success backgrounds |
| `--danger` | `#EF4444` | Danger | "FAIL", "violation", "blocked" |
| `--danger-muted` | `rgba(239,68,68,0.1)` | Danger tint | Error backgrounds |
| `--warning` | `#EAB308` | Warning | "WARN", "caution" |
| `--warning-muted` | `rgba(234,179,8,0.1)` | Warning tint | Warning backgrounds |
| `--info` | `#3B82F6` | Info | "INFO", "session active" |
| `--info-muted` | `rgba(59,130,246,0.1)` | Info tint | Info backgrounds |

### 1.4 Color Philosophy

- **Teal (`#2DD4BF`)** = "the fence" — safety, compliance, control. The brand owns this.
- **Coral (`#F97316`)** = "the agent" — energy, action, the thing being controlled. Used for CTAs.
- **Never use pure black (`#000000`)** — always off-black (`#0A0F1A`) for depth without OLED smear.
- **Never use pure white (`#FFFFFF`)** — always off-white (`#F9FAFC`) for reduced eye strain.
- **One accent per view** — either teal OR coral dominates, never equal weight.
- **Status colors are immutable** — success is always green, danger always red, warning always amber.

---

## 2. Typography

### 2.1 Font Stack (Evolved)

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| Display | **Space Grotesk** | system-ui, sans-serif | Hero headlines, section titles |
| Body | **Inter** | system-ui, sans-serif | Body text, descriptions, UI labels |
| Mono | **JetBrains Mono** | ui-monospace, monospace | Code, SHAs, file paths, policy IDs, terminal output |

**Why this stack:**
- Space Grotesk has character without being gimmicky — technical but warm
- Inter is the most readable sans at small sizes — essential for dashboard density
- JetBrains Mono is the developer-native monospace — credibility for CLI users

### 2.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 0.75rem (12px) | 1rem | 400 | Timestamps, badges, captions |
| `--text-sm` | 0.875rem (14px) | 1.25rem | 400 | Secondary text, nav items |
| `--text-base` | 1rem (16px) | 1.5rem | 400 | Body text, inputs |
| `--text-lg` | 1.125rem (18px) | 1.75rem | 400 | Lead paragraphs |
| `--text-xl` | 1.25rem (20px) | 1.75rem | 500 | Card titles, section subtitles |
| `--text-2xl` | 1.5rem (24px) | 2rem | 600 | Section headings (mobile) |
| `--text-3xl` | 1.875rem (30px) | 2.25rem | 600 | Section headings (desktop) |
| `--text-4xl` | 2.25rem (36px) | 2.5rem | 700 | Hero subhead |
| `--text-5xl` | 3rem (48px) | 1.1 | 700 | Hero headline (short) |
| `--text-6xl` | 3.75rem (60px) | 1.05 | 700 | Hero headline (impact) |

### 2.3 Typography Rules

- **Display type (Space Grotesk)** uses `tracking-tight` (-0.02em) for headlines, `tracking-normal` for subheadings
- **Body type (Inter)** uses `tracking-normal`, never tracked out
- **Mono type (JetBrains Mono)** uses `tracking-normal`, limited to 12/14/16px sizes
- **Max body width:** 65ch for readability
- **Minimum body size:** 14px (never smaller for body text)
- **Uppercase labels:** `text-xs uppercase tracking-[0.16em] font-mono` — used sparingly (max 1 per 3 sections)

---

## 3. Spacing & Layout

### 3.1 Spacing Scale (8px grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 0.25rem (4px) | Tight gaps, icon-to-label |
| `--space-2` | 0.5rem (8px) | Inline spacing, badge padding |
| `--space-3` | 0.75rem (12px) | Input padding (vertical) |
| `--space-4` | 1rem (16px) | Card padding (mobile), section gaps |
| `--space-5` | 1.5rem (24px) | Card padding (desktop), input padding (horizontal) |
| `--space-6` | 2rem (32px) | Section padding (mobile) |
| `--space-7` | 3rem (48px) | Section padding (desktop) |
| `--space-8` | 4rem (64px) | Hero padding, major section breaks |
| `--space-9` | 6rem (96px) | Page-level spacing |
| `--space-10` | 8rem (128px) | Hero top/bottom (desktop) |

### 3.2 Layout Rules

- **Content max-width:** 1280px (`max-w-7xl`) for marketing, 1440px for dashboard
- **Marketing sections:** `py-16 md:py-24 lg:py-32` (generous whitespace)
- **Dashboard sections:** `p-6` standard, `p-4` dense
- **Grid:** CSS Grid over flexbox math. Never `w-[calc(33%-1rem)]`.
- **Breakpoints:** sm 640, md 768, lg 1024, xl 1280, 2xl 1536
- **Mobile-first:** All layouts start single-column, expand at `md`

### 3.3 Shape Consistency

- **Cards:** `border-radius: 16px` (rounded, friendly, clay-like)
- **Buttons:** `border-radius: 12px` (slightly less than cards)
- **Inputs:** `border-radius: 8px` (functional, not decorative)
- **Badges/Pills:** `border-radius: 999px` (full pill)
- **Modals:** `border-radius: 20px` (most prominent surface)

---

## 4. Motion & Interaction

### 4.1 Timing

| Token | Value | Usage |
|-------|-------|-------|
| `--dur-fast` | 150ms | Micro-interactions (hover, focus) |
| `--dur-base` | 200ms | Default transitions |
| `--dur-slow` | 300ms | Modals, drawers, page transitions |
| `--dur-slower` | 500ms | Hero reveals, complex choreography |

### 4.2 Easing

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Exits, dismissals |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounces, celebrations |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default, continuous motion |

### 4.3 Motion Rules

- **Exit faster than enter** — exits at 150ms, entrances at 300ms
- **Stagger children** — list items cascade with 50ms delay between each
- **Spring physics for playful moments** — "blocked" celebrations, compliance streaks
- **Reduced motion** — all animations collapse to instant under `prefers-reduced-motion`
- **Motion must communicate** — hierarchy, feedback, state change. Never decorative-only.
- **Max one marquee per page** — if used, it's the hero background or the logo wall, not both.

### 4.4 Key Animations

| Animation | Trigger | Effect | Duration |
|-----------|---------|--------|----------|
| Hero reveal | Page load | Fade up + scale from 0.95 | 600ms |
| Card hover | Mouse enter | Scale 1.02 + border brighten | 200ms |
| Button press | Mouse down | Scale 0.97 | 100ms |
| Status change | Data update | Flash color + subtle pulse | 300ms |
| Violation blocked | New violation | Shake + red flash | 400ms |
| Compliance milestone | Score threshold | Spring bounce + confetti | 800ms |
| Scroll reveal | Enter viewport | Fade up + slide 24px | 500ms |
| Sidebar expand | Toggle | Slide + fade children | 250ms |

---

## 5. Components

### 5.1 Button

```
Variants: primary (coral) | secondary (teal) | ghost | outline | danger
Sizes: sm (h-8, px-3, text-sm) | md (h-10, px-4, text-sm) | lg (h-12, px-6, text-base)
States: default | hover | active | disabled | loading
```

- **Primary:** Coral bg (`#F97316`), white text, hover `#FB923C`, active scale 0.97
- **Secondary:** Teal bg (`#2DD4BF`), dark text (`#0A0F1A`), hover `#5EEAD4`
- **Ghost:** Transparent, border `rgba(255,255,255,0.1)`, hover `rgba(255,255,255,0.05)`
- **Outline:** Transparent, border `--border`, hover border `--border-hover`
- **Danger:** Red bg (`#EF4444`), white text
- **Loading:** Spinner replaces text, disabled state
- **Focus ring:** 2px solid `--brand`, offset 2px

### 5.2 Card

```
Variants: default | elevated | interactive | stat
```

- **Default:** `--bg-surface` bg, `border: 1px solid --border`, radius 16px, padding 24px
- **Elevated:** Same + `box-shadow: 0 4px 12px rgba(0,0,0,0.3)`
- **Interactive:** Same as default + hover: border `--border-hover`, cursor pointer
- **Stat:** Centered, large number display, mono font for value

### 5.3 Input

```
Types: text | email | password | search | textarea
States: default | focus | error | disabled
```

- **Default:** `--bg-elevated` bg, border `--border`, radius 8px, padding 12px 16px
- **Focus:** Border `--brand`, ring `0 0 0 3px --brand-muted`
- **Error:** Border `--danger`, error text below
- **Disabled:** Opacity 0.5, cursor not-allowed
- **Label:** Above input, `text-sm font-medium`, `gap-2` between label and input

### 5.4 Badge / Pill

```
Tones: brand | accent | success | danger | warning | info | muted
```

- **Base:** `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono`
- **Brand:** `--brand-muted` bg, `--brand` text
- **Accent:** `--accent-muted` bg, `--accent` text
- **Success:** `--success-muted` bg, `--success` text
- **Danger:** `--danger-muted` bg, `--danger` text
- **Warning:** `--warning-muted` bg, `--warning` text
- **Info:** `--info-muted` bg, `--info` text
- **Muted:** `--bg-elevated` bg, `--fg-secondary` text

### 5.5 Code Block

```
Features: header bar, copy button, line numbers, diff highlighting
```

- **Container:** `--bg-primary` bg, border `--border`, radius 12px
- **Header:** `flex items-center justify-between px-4 py-2.5 border-b --border`
- **File path:** Left, mono, `text-sm --fg-secondary`
- **Lang tag:** Right, mono, `text-xs uppercase tracking-wider --fg-muted`
- **Body:** `p-4 overflow-x-auto mono text-sm leading-relaxed`
- **Copy button:** Ghost, hover `--brand` text, green check on success (2s)
- **Line numbers:** Left gutter, `text-xs --fg-muted`, `select-none`
- **Diff:** `+` lines green tint, `-` lines red tint

### 5.6 Callout

```
Types: note | tip | warning | danger
```

- **Base:** `rounded-lg border p-4 flex gap-3`
- **Note:** `--info` left border, `--info-muted` bg
- **Tip:** `--brand` left border, `--brand-muted` bg
- **Warning:** `--warning` left border, `--warning-muted` bg
- **Danger:** `--danger` left border, `--danger-muted` bg
- **Icon:** Left, 20px, semantic color
- **Title:** `font-medium text-sm`, body: `text-sm --fg-secondary`

### 5.7 Command Palette (⌘K)

```
Trigger: Cmd/Ctrl+K or button
Features: fuzzy search, keyboard nav, focus trap, Esc to close
```

- **Overlay:** `--bg-overlay`, `backdrop-blur-sm`
- **Panel:** `--bg-surface`, border `--border`, radius 16px, max-w-lg, centered
- **Input:** Full-width, `--bg-elevated`, mono, `text-lg`
- **Results:** Scrollable list, max-h-80
- **Item:** `px-4 py-3`, hover `--bg-elevated`, selected `--brand-muted`
- **Kbd:** Right-aligned, `--bg-elevated` bg, radius 4px, mono `text-xs`

### 5.8 Status Pill (Dashboard)

```
States: ACTIVE | IDLE | KILLED | PASS | WARN | FAIL
```

- **Base:** `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono`
- **ACTIVE:** `--success-muted` bg, `--success` text, dot `bg-success` (pulse animation)
- **IDLE:** `--bg-elevated` bg, `--fg-secondary` text, dot `bg-fg-muted`
- **KILLED:** `--danger-muted` bg, `--danger` text, dot `bg-danger`
- **PASS:** `--success-muted` bg, `--success` text
- **WARN:** `--warning-muted` bg, `--warning` text
- **FAIL:** `--danger-muted` bg, `--danger` text

### 5.9 Navigation

**Marketing Nav:**
- Height: 64px (desktop), 56px (mobile)
- Background: `--bg-primary/80`, `backdrop-blur-md`
- Position: Sticky top, z-index 50
- Items: Logo left, links center, CTA right
- Mobile: Hamburger menu, full-screen drawer

**Dashboard Sidebar:**
- Width: 256px (expanded), 72px (collapsed icon-only)
- Background: `--bg-surface`
- Position: Fixed left, full height
- Items: Icon + label, active state `--brand-muted` bg + `--brand` text
- Footer: Settings, user menu

**Dashboard Header:**
- Height: 64px
- Background: `--bg-primary/80`, `backdrop-blur-md`
- Content: Page title left, search/⌘K center, user menu right

---

## 6. Page-Specific Patterns

### 6.1 Landing Page

**Sections (in order):**
1. **Nav** — Sticky, minimal, logo + links + CTA
2. **Hero** — Full viewport, asymmetric split (60/40), headline + subtext + terminal demo
3. **Social proof** — Logo wall (real logos, no labels), single testimonial
4. **How it works** — 3-step process, numbered, code examples
5. **Features** — Bento grid (asymmetric), 6-8 features with icons
6. **Comparison** — Side-by-side (soft vs hard enforcement)
7. **Pricing** — 2 cards (CLI free, Control Plane paid)
8. **FAQ** — Accordion, 5-6 questions
9. **CTA** — Final conversion section
10. **Footer** — Links, social, copyright

**Hero rules:**
- Headline max 2 lines, subtext max 20 words
- CTA visible without scroll
- One primary visual (terminal demo or animated illustration)
- No trust logos inside hero (separate section)

**Layout variance:**
- Alternate section compositions (never two identical layouts consecutively)
- Use bento grid for features, not 3 equal cards
- Use full-width quote, not inline testimonial

### 6.2 Docs Page

**Layout:** 3-column (sidebar nav + content + TOC)
- **Left sidebar:** Section navigation, collapsible groups, search
- **Center content:** Prose, code blocks, callouts, diagrams
- **Right TOC:** Scroll-spy headings, "Edit on GitHub" link

**Features:**
- Client-side search (Cmd+K or search input)
- Version selector (if multiple versions)
- Code copy on click
- Previous/next navigation at bottom
- Breadcrumbs

### 6.3 Auth Pages (Login/Signup)

**Layout:** Split screen (50/50 on desktop, stacked on mobile)
- **Left:** Form (email, password, social buttons, Turnstile)
- **Right:** Brand panel (tagline, illustration, shader background)

**Rules:**
- Form labels above inputs
- Error messages inline (below field)
- Loading state on submit button
- Social buttons: Google + Apple (if configured)
- "Forgot password?" link (if implemented)
- Toggle between login/signup

### 6.4 Dashboard

**Layout:** Sidebar + header + main content area

**Overview page:**
- 4 stat cards (compliance score, active sessions, violations, AI insights)
- 2-column grid: Recent sessions (2/3) + AI insight (1/3)
- Callout for tips

**Sessions page:**
- Expandable rows showing tool calls
- Status pills (ACTIVE/IDLE/KILLED)
- Filter by status, repo, time range

**Policies page:**
- Data table with sortable columns
- Inline rollback action
- Version diff view

**AI page:**
- 2-column: Input (left) + Output (right)
- Textarea for rule description
- Code block for structured output

**Reports page:**
- Compliance summary card
- CSV export button
- Daily report preview

**Settings page:**
- Account info (email, provider)
- API key display (masked)
- Logout button

---

## 7. Accessibility Requirements

### 7.1 Color Contrast

| Combination | Ratio | Passes |
|-------------|-------|--------|
| `--fg-primary` on `--bg-primary` | 15:1 | AAA |
| `--fg-secondary` on `--bg-surface` | 7.5:1 | AAA |
| `--brand` on `--bg-primary` | 8.2:1 | AAA |
| `--accent` on `--bg-primary` | 6.8:1 | AA |
| `--success` on `--success-muted` | 5.1:1 | AA |
| `--danger` on `--danger-muted` | 5.3:1 | AA |

### 7.2 Interaction

- All interactive elements: `cursor-pointer`
- All clickable elements: `min-height: 44px` (touch targets)
- Focus states: visible ring (`2px solid --brand, offset 2px`)
- Keyboard navigation: all functions accessible via keyboard
- Skip-to-content link for screen readers

### 7.3 Motion

- All animations: `prefers-reduced-motion` media query
- Infinite loops: pause under reduced motion
- Parallax/scroll-hijack: collapse to static

### 7.4 Semantics

- Proper heading hierarchy (h1 → h2 → h3, never skip)
- `aria-label` on icon-only buttons
- `role="alert"` on error messages
- `aria-live="polite"` on dynamic content updates

---

## 8. Performance Budget

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Interaction to Next Paint | < 200ms | Lighthouse |
| Total Bundle Size | < 200KB (initial) | Webpack Bundle Analyzer |
| Time to Interactive | < 3.5s | Lighthouse |

**Strategies:**
- Code splitting by route (React.lazy + Suspense)
- Lazy load below-fold images
- Preload hero image
- Self-host fonts (no Google Fonts CDN)
- SVG icons only (no icon font)
- Grain/noise on fixed pseudo-elements only (never scrolling containers)

---

## 9. Migration from v1.0

### 9.1 What Changes

| v1.0 | v2.0 | Reason |
|------|------|--------|
| Emerald `#34d399` | Teal `#2DD4BF` | More distinctive, less "AI green" |
| Amber `#F59E0B` | Coral `#F97316` | Warmer, more playful |
| Indigo-blue `#4F6EF7` | (removed as primary CTA) | Coral is now primary CTA |
| `#0B0F0D` bg | `#0A0A1A` bg | Deeper, more cinematic |
| Radius 6/10/16/24px | Radius 8/12/16/20px | Friendlier, more consistent |
| Inter + Space Grotesk + JetBrains | Same | Keep — already good |

### 9.2 What Stays

- Font stack (Space Grotesk + Inter + JetBrains Mono)
- Dark-mode-first approach
- 8px spacing grid
- Component library structure (shadcn-style)
- Token-driven architecture (CSS variables)
- Status color semantics (green = good, red = bad, amber = warn)

### 9.3 Migration Steps

1. Update `packages/design-system/src/tokens.css` with new tokens
2. Update Tailwind config to map new tokens
3. Rebuild all components with new tokens
4. Update `web/` pages one by one
5. Remove `site/` static HTML (absorbed into React SPA)

---

## 10. Implementation Checklist

### Pre-Development
- [ ] Design system approved
- [ ] Figma/wireframes for key pages (optional but recommended)
- [ ] Component library scaffolded
- [ ] CI/CD pipeline configured
- [ ] Cloudflare Pages project created

### Development
- [ ] Tokens → CSS variables → Tailwind config
- [ ] Base components (Button, Card, Input, Badge, CodeBlock, Callout)
- [ ] Layout components (Nav, Sidebar, Header, Footer)
- [ ] Marketing pages (Landing, Docs)
- [ ] Auth pages (Login, Signup, Onboarding)
- [ ] Dashboard pages (Overview, Sessions, Policies, AI, Reports, Settings)
- [ ] Command palette (⌘K)
- [ ] Real-time session streaming

### Quality
- [ ] Lighthouse > 90 on all pages
- [ ] WCAG 2.1 AA compliance
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive (375px → 1440px)
- [ ] Reduced motion tested
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (VoiceOver or NVDA)

### Launch
- [ ] Production secrets configured
- [ ] Custom domain (if applicable)
- [ ] Analytics integrated
- [ ] Error monitoring (Sentry or similar)
- [ ] Performance monitoring
- [ ] Backup/rollback plan documented

---

*This design system is the single source of truth for all visual decisions. Any deviation requires explicit approval.*
