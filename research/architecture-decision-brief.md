# policyctl — Architecture & Auth Decision Brief

> Generated: 2026-08-30 · Supersedes relevant sections of `rebuild-plan.md`

---

## Part A: Architecture Pattern — What the Industry Does

### Cloudflare's Pattern (Subdomain Isolation)

```
cloudflare.com          → Marketing (SEO, product pages, pricing)
dash.cloudflare.com     → Authenticated dashboard (React SPA)
developers.cloudflare.com → Documentation (separate publishing surface)
```

**Key decisions:**
- Hard hostname boundary between marketing, dashboard, and docs
- Marketing CTA → `dash.cloudflare.com/sign-up`
- Docs deep-link into dashboard via `dash.cloudflare.com/?to=/:account/<route>`
- Dashboard migrated from `www.cloudflare.com/a` → `dash.cloudflare.com` (deliberate split)
- Docs are public, crawlable, content-oriented; dashboard owns authenticated state

**When to use this:** Enterprise-grade security, separate teams, independent deploy cadences.

### Firecrawl's Pattern (Same-Origin Path Routing)

```
www.firecrawl.dev/           → Marketing
www.firecrawl.dev/signin     → Auth gate (same origin)
www.firecrawl.dev/app        → Dashboard (same origin)
docs.firecrawl.dev           → Documentation (separate host)
api.firecrawl.dev            → API (separate host)
```

**Key decisions:**
- Marketing, auth, and app share one origin — smooth brand transition
- "Start for free" CTA → `/signin` (same page, no hostname switch)
- Docs still separated as `docs.firecrawl.dev`
- API separated as `api.firecrawl.dev`

**When to use this:** Single team, unified brand experience, simpler DNS/SSL, faster iteration.

### Recommendation for policyctl

**Use Firecrawl's pattern (same-origin path routing).** Here's why:

| Factor | Cloudflare Pattern | Firecrawl Pattern | Winner |
|--------|-------------------|-------------------|--------|
| DNS/SSL complexity | 3 hostnames | 1 hostname + docs | Firecrawl |
| Brand continuity | Jarrent hostname switch | Seamless transition | Firecrawl |
| Deploy isolation | Full independence | Shared pipeline | Cloudflare (but not critical at our scale) |
| Team structure | Separate teams | One team | Firecrawl (matches reality) |
| SEO | Marketing isolated | Marketing on same origin | Firecrawl (better link equity) |
| Complexity | Higher | Lower | Firecrawl |

**Target architecture:**

```
policyctl.pages.dev/                → Landing (marketing)
policyctl.pages.dev/docs            → Documentation (or docs.policyctl.pages.dev)
policyctl.pages.dev/login           → Login
policyctl.pages.dev/signup          → Signup
policyctl.pages.dev/onboarding      → Onboarding
policyctl.pages.dev/dashboard        → Dashboard overview
policyctl.pages.dev/dashboard/*     → Dashboard sub-routes
```

**One Cloudflare Pages project. One React SPA. Path-based routing.**

The static `site/` (vanilla HTML) gets absorbed into the React SPA. The `web/` React app expands to cover landing + docs + auth + dashboard.

---

## Part B: Auth Alternatives — What Fits Cloudflare Workers

### Comparison Matrix

| Provider | Free Tier | Email/Password | Worker Native | Setup | Best For |
|----------|-----------|---------------|---------------|-------|----------|
| **Auth0** | 25,000 MAU | ✅ | ✅ (OIDC + JWT) | Medium | B2C apps, generous free tier |
| **Clerk** | 50,000 MRU | ✅ | ✅ (edge-optimized) | Low | Fastest polished UI |
| **Supabase Auth** | Generous | ✅ | ✅ (REST API) | Low-Medium | Open-source preference |
| **Firebase Auth** | Spark (no billing) | ✅ | ✅ (REST API) | Low-Medium | Google ecosystem |
| **Cloudflare Access** | <50 users free | ❌ (OTP only) | ✅ (gateway) | Medium | Internal/team apps only |
| **Custom D1 + Turnstile** | Workers free tier | ✅ (you build it) | ✅ (native) | High | Maximum control, zero vendor |
| **GitHub OAuth** | Free | ❌ (OAuth only) | ✅ | Low | Developer-only audiences |

### Analysis: What Works Without Google Cloud Billing

The user's concern: Google Cloud Console requires a billing account for OAuth credentials. Here are the alternatives ranked:

#### Tier 1: Best Fit (Email/Password + No Billing Required)

1. **Auth0** — Free up to 25,000 MAU, no credit card needed, supports email/password + social. Works with Workers via OIDC. Most generous free tier for B2C.

2. **Clerk** — Free up to 50,000 MRU, no credit card needed, prebuilt UI components, edge-optimized. Fastest path to polished auth.

3. **Supabase Auth** — Free tier, has an official Cloudflare Workers quickstart, open-source. Adds a separate project outside Cloudflare.

4. **Firebase Auth** — Spark plan has no billing requirement for email/password auth. REST API works from Workers.

#### Tier 2: Cloudflare-Native (More Work, Full Control)

5. **Custom D1 + Turnstile** — What policyctl already has partially built. No vendor, no billing, full control. But you own password hashing, verification, reset, rate limiting, breach policy, CSRF — the full security lifecycle.

#### Tier 3: Social-Only (No Email/Password)

6. **GitHub OAuth** — Free, no billing, perfect for developer audience. But no email/password fallback.

### Recommendation

**Short-term (launch):** Keep the existing custom D1 + Turnstile + email/password approach. It's already mostly built and works. Add:
- Rate limiting on auth endpoints
- Email verification (use a transactional email service)
- CSRF protection

**Medium-term (post-launch):** Evaluate Clerk or Auth0 if custom auth becomes a maintenance burden. Clerk is fastest to integrate; Auth0 has a more generous free tier.

**Why not switch now:** The auth backend (signup, login, sessions, cookies, Turnstile) is already implemented in `packages/server/src/auth.ts`. The frontend auth flow is built. Switching auth providers now would delay the core frontend rebuild without meaningful user benefit.

---

## Part C: Design Persona Options

Three distinct directions, each with a different emotional positioning and visual language.

### Option 1: "The Deterministic Console"

**Vibe:** Terminal precision meets SaaS polish. Every pixel communicates "this tool works."

**Emotional promise:** "Your agents will obey. Guaranteed."

**Visual language:**
- Near-black background (#0B0F0D)
- Emerald/teal primary (compliance, "go", success)
- Amber warnings (attention, caution)
- Indigo-blue CTAs (action, forward motion)
- JetBrains Mono for all machine-readable data
- Space Grotesk for headings (technical but human)
- Subtle WebGL shader accents (not full-screen)
- Tight spacing, data-dense but not cramped
- Status pills, terminal-style code blocks, scan lines

**Best for:** Staff engineers, DevOps, tool evaluation by technical buyers.

**Reference aesthetic:** Linear's precision + Vercel's dark mode + Railway's terminal warmth.

### Option 2: "The Compliance Layer"

**Vibe:** Institutional authority. The tool your security team would design if they made tools.

**Emotional promise:** "Audit-ready. Always."

**Visual language:**
- Cool gray backgrounds (not warm slate)
- Blue primary (trust, institutional)
- Emerald only for "compliant" states
- Inter + IBM Plex Mono (more formal)
- Generous whitespace, clear hierarchy
- Badge-heavy UI (compliance status everywhere)
- Charts and metrics forward
- Minimal motion, serious tone

**Best for:** Enterprise buyers, security teams, regulated industries.

**Reference aesthetic:** Stripe Dashboard + Datadog + compliance SaaS.

### Option 3: "The Agent's Leash"

**Vibe:** Playful constraint. The tool that tames chaos with a smile.

**Emotional promise:** "Your agents run free — within fences."

**Visual language:**
- Dark but warmer (deep purple-black)
- Teal + coral (unexpected combo)
- Rounded, soft, friendly components
- Animated illustrations (agents on leashes, fences)
- Micro-interactions everywhere (bounce, wiggle)
- Hand-drawn icon accents alongside technical mono
- Humorous copy ("Your agent tried to edit README. We said no.")
- Gamification elements (compliance streaks, "days since incident")

**Best for:** Indie devs, small teams, developers who hate enterprise UX.

**Reference aesthetic:** Notion's friendliness + Vercel's dark mode + a dash of Duolingo.

### Recommendation

**Option 1: "The Deterministic Console"** — with elements of Option 3's personality in copy and micro-interactions.

Why:
- The product is technical (CLI-first, developer audience) — Option 2 is too corporate
- The product enforces rules (not playful) — Option 3 undermines the core value
- Option 1 matches the existing design language (already dark, emerald, mono) — less rebuild
- But: inject moments of delight (smooth transitions, satisfying "blocked" animations) to avoid feeling cold

**Key differentiator:** The design should feel like *infrastructure you trust* — not a marketing site with a dashboard bolted on, and not a toy. The confidence of a well-built tool.

---

## Part D: Updated Architecture Decision

### Final Structure

```
┌──────────────────────────────────────────────────────────────┐
│  policyctl.pages.dev (ONE Cloudflare Pages project)          │
│  ONE React SPA (built from web/, absorbing site/ content)    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Public Routes                                          │  │
│  │  /           → Landing (hero, social proof, CTA)       │  │
│  │  /docs       → Documentation (searchable, code-heavy)  │  │
│  │  /login      → Auth gate                               │  │
│  │  /signup     → Auth gate                               │  │
│  │  /pricing    → Pricing page                            │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Authenticated Routes                                   │  │
│  │  /onboarding             → 4-step tutorial             │  │
│  │  /dashboard              → Overview                    │  │
│  │  /dashboard/sessions     → Live enforcement            │  │
│  │  /dashboard/policies     → Versions + rollback         │  │
│  │  /dashboard/ai           → Rule author + analyzer      │  │
│  │  /dashboard/reports      → Compliance + export         │  │
│  │  /dashboard/settings     → Account                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │ fetch + cookie
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  policyctl-server.workers.dev (Cloudflare Worker)            │
│  Hono + D1 + KV + R2 + AI + Durable Objects + Turnstile      │
│  (Existing — keep as-is, improve incrementally)              │
└──────────────────────────────────────────────────────────────┘
```

### What Changes vs. Current State

| Current | Target | Action |
|---------|--------|--------|
| `site/` (static HTML) on Pages | Absorbed into React SPA | Rebuild landing/docs in React |
| `web/` (React SPA) not deployed | Deployed to Pages as the main app | New Pages project + CI pipeline |
| Marketing + dashboard disconnected | Unified path-based routing | Single SPA, one deploy |
| Dashboard shows mock data | Dashboard calls real API | Wire frontend to Worker endpoints |
| Docs in static HTML | Docs as a React route | Rebuild docs with search + TOC |
| No preview deploys | Every PR gets a live URL | `preview.yml` workflow |
| No staging | Staging environment | `staging` branch + Pages env |
| Manual deploy only | Full CI/CD pipeline | `ci.yml` + `deploy.yml` |

### What Stays the Same

| Component | Action |
|-----------|--------|
| `packages/cli/` | Keep as-is (shipped, v0.1.6) |
| `packages/core/` | Keep as-is (shipped, v0.1.6) |
| `packages/server/` | Keep architecture, wire real data to endpoints |
| D1 schema | Keep, add migrations only if new fields needed |
| KV, R2, AI, DO | Keep as-is |
| Auth (D1 + Turnstile + email/password) | Keep, add rate limiting + email verification |
| `publish.yml` (npm) | Keep as-is |
| Design tokens | Evolve, don't replace wholesale |

---

## Part E: Design System Direction (Option 1 Refined)

### Tokens (Evolve Current)

| Token | Current | Target | Rationale |
|-------|---------|--------|-----------|
| Background | #0B0F0D | #0B0F0D | Keep — distinctive, ownable |
| Primary | emerald/teal | emerald/teal | Keep — compliance = green |
| Accent | amber | amber | Keep — warnings = amber |
| Action CTA | indigo-blue | indigo-blue | Keep — distinct from brand |
| Surface | #121618 | #121618 | Keep — already good |
| Border | rgba(255,255,255,.06) | rgba(255,255,255,.06) | Keep — subtle |
| Font display | Space Grotesk | Space Grotesk | Keep — technical + human |
| Font body | Inter | Inter | Keep — best UI sans |
| Font mono | JetBrains Mono | JetBrains Mono | Keep — developer-native |
| Motion | 200ms ease | 200ms ease | Keep — fast, responsive |
| Radius | 6/10/16/24px | 6/10/16/24px | Keep — already refined |

### What Changes in the Rebuild

1. **Component consistency** — Current `web/` components are good but need to be extended for landing/docs (not just dashboard)
2. **Landing page** — Move from static HTML to React, make it dynamic and interactive
3. **Docs** — Rebuild with client-side search, version selector, interactive examples
4. **Navigation** — Unified nav that adapts: public (marketing) vs private (dashboard shell)
5. **Micro-interactions** — Add satisfying state transitions (rule blocked ✓, violation ✗, session live ●)
6. **Illustrations** — Replace heavy WebGL shader with lighter SVG/CSS animations for performance
7. **Content density** — Dashboard gets denser (more data per screen); marketing gets more whitespace

### Visual Hierarchy Principles

1. **One primary action per view** — blue button, always visible
2. **Monospace for everything machine-readable** — policy IDs, SHAs, file paths, commands
3. **Status communicated through color + shape** — not color alone (accessibility)
4. **Data-forward, not chrome-forward** — minimize borders, shadows, decorative elements
5. **Motion means something** — transitions indicate state change, not decoration

---

## Part F: Implementation Sequence (Refined)

### Phase 0: Foundation
- [ ] Set up Cloudflare Pages project for unified SPA
- [ ] Create `deploy.yml` CI/CD pipeline
- [ ] Create `preview.yml` for PR previews
- [ ] Load UI/UX Pro Max + Design Taste skills for design phase
- [ ] Define final design tokens based on Option 1
- [ ] Create component library foundation (Button, Card, Input, Badge, etc.)

### Phase 1: Public Pages
- [ ] Build new Landing (hero, social proof, how-it-works, features, pricing, CTA)
- [ ] Build new Docs (search, TOC, code examples, version selector)
- [ ] Build Login + Signup (keep auth backend, rebuild UI)
- [ ] Wire auth to Worker API
- [ ] Deploy to production (replace current static site)

### Phase 2: Authenticated Pages
- [ ] Build Dashboard shell (sidebar + header + command palette)
- [ ] Build Overview (real API data)
- [ ] Build Sessions (real-time feed)
- [ ] Build Policies (versions + rollback)
- [ ] Build Settings (account, API key, logout)
- [ ] Build Onboarding (4-step tutorial)

### Phase 3: Advanced Features
- [ ] Build AI page (rule author + analyzer)
- [ ] Build Reports page (compliance + CSV)
- [ ] WebSocket session streaming
- [ ] Analytics aggregation
- [ ] Rate limiting on auth endpoints

### Phase 4: Polish
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] SEO (meta tags, structured data, sitemap)
- [ ] Production secrets rotation

---

## Part G: Open Questions Resolved

| Question | Answer |
|----------|--------|
| Architecture pattern? | Firecrawl-style same-origin path routing |
| Static site + SPA relationship? | Merge into one SPA |
| Auth provider? | Keep custom D1 + Turnstile (already built) |
| Design persona? | "The Deterministic Console" (Option 1) |
| Docs location? | `/docs` route within the SPA |
| Custom domain? | Stick with `*.pages.dev` for now |

---

*This brief supersedes the architecture and auth sections of `rebuild-plan.md`. The implementation phases and CI/CD design remain valid.*
