# Phase B+ — User Flow & Interaction Plan

> Comprehensive end-to-end user journey: first-time signup → onboarding → dashboard → ongoing use.

## 1. Authentication Flow

### First-time visitor
1. Lands on `https://policyctl.pages.dev` (static marketing site, WebGL shader hero)
2. Clicks **"Install policyctl"** → copies `npm i -g @policyctl/cli` (or "Get started" in pricing)
3. CLI works locally — no signup required for basic use
4. To access the **hosted control plane** (audit trail, policy versioning, dashboard), user clicks "Sign in" in the CLI or navigates to `https://dash.policyctl.io`

### Signup flow (web → `/signup`)
```
┌─────────────────────────────────────────────────┐
│  AuthSectionOne (mode="signup")                 │
│  ┌──────────────────────────────┐  ┌─────────┐  │
│  │  First name  Last name       │  │ Google  │  │
│  │  Email       Password        │  │ Apple   │  │
│  │  [Turnstile widget]          │  │         │  │
│  │  [ ] Don't email me          │  │  OR     │  │
│  │  [ ] Terms & Privacy         │  │         │  │
│  │  [ CREATE ACCOUNT ]          │  │         │  │
│  └──────────────────────────────┘  └─────────┘  │
└─────────────────────────────────────────────────┘
```

1. User fills form → Turnstile challenge renders (Cloudflare test key in dev, real key in prod)
2. User clicks "Create account" → frontend calls `POST /api/auth/signup`
   - Body: `{ email, password, displayName, turnstile }`
3. Server (`index.ts:POST /api/auth/signup`):
   - Verifies Turnstile via `verifyTurnstile()` → if fail, returns 403
   - Checks for existing user by email → if exists, returns 409
   - Calls `createUser()` → hashes password (PBKDF2-SHA256), generates token, creates org + membership
   - Sets session cookie (`pc_session` token, HttpOnly, Secure, SameSite=Lax, 30-day TTL)
   - Returns `{ user: { id, email, displayName, provider } }`
4. Frontend (`auth.tsx:signup()`): sets user in React context, redirects to `/onboarding`

### Login flow (web → `/login`)
Same UI, mode="login". Server calls `POST /api/auth/login`:
- Verify Turnstile → fetch user by email → `verifyPassword(password, user.password_hash)` → set cookie → cache in KV
- Returns `{ user }` on success, 401 on invalid credentials

### OAuth flow (Google)
1. User clicks "Continue with Google" → frontend calls `GET /api/auth/oauth/google`
2. Server redirects to Google OAuth consent screen
3. Google redirects to `GET /api/auth/oauth/callback?code=...`
4. Server exchanges code → fetches Google userinfo → `upsertUser()` → sets cookie → redirects to `/dashboard`
5. Frontend's `AuthProvider` on mount calls `GET /api/me` → receives `{ user }` from cookie → restores session

### CLI auth (`policyctl login --control-plane`)
- Opens browser to `https://dash.policyctl.io` (auth via cookie) OR
- Exchanges email+password via `POST /api/auth/login` → receives token
- Saves token to `~/.policyctl/config.json`
- `--server <url>` overrides the API base URL

## 2. Onboarding (first-time dashboard visit)

Triggered **only for new users** (detected via `first_seen_at` timestamp or empty org).

The `Onboarding` page (`/web/src/pages/Onboarding.tsx`) presents a 4-step interactive tutorial:

### Step 1: Scaffold your policy
```
policyctl init --template full
```
- Shows the generated `.policyctl.yml` with default rules (migrations, secrets, readme, tests)
- User marks "done" after running

### Step 2: Generate provider hooks
```
policyctl gen claude
policyctl gen codex
policyctl gen cursor
```
- Explains: writes `.claude/settings.json`, `.codex/config.toml`, `.cursor/hooks.json`
- Shows the generated hook pointing at `policyctl eval --hook`

### Step 3: Gate the diff
```
policyctl check
policyctl check --report
```
- Shows a sample CI failure (terminal demo with PASS/WARN/FAIL output)
- User marks done after adding `.github/workflows/policy.yml`

### Step 4: Connect the dashboard
```
policyctl login --control-plane
```
- Exchanges CLI auth → dashboard sync
- Violations stream to `/dashboard/sessions`

### After onboarding
- Button: "Go to dashboard" → navigates to `/dashboard`
- Onboarding flag stored in KV (`onboarding:complete:{userId}`) so it doesn't repeat

## 3. Dashboard (authenticated SPA)

Route: `/dashboard` (nested under `DashboardShell` with sidebar + header)

### Layout
```
┌──────────┬─────────────────────────────────┐
│ Sidebar  │  Header                         │
│          │  Title |  Notification icon  ⋮ │
├──────────┼─────────────────────────────────┤
│          │  Main content (Outlet)           │
│          │                                 │
│          │                                 │
└──────────┴─────────────────────────────────┘
```

- **Sidebar** (`/web/src/components/layout/Sidebar.tsx`): Overview, Sessions, Policies, AI, Reports, Settings
- **Header** (`/web/src/components/layout/DashboardHeader.tsx`): dynamic title + user menu (⌘K, notifications, avatar)
- **⌘K command palette** (`/web/src/components/ui/command-palette.tsx`): quick nav + command runner

### Sub-pages
| Route | Purpose | Data source |
| --- | --- | --- |
| `/dashboard` (Overview) | Compliance score, active sessions, violations 24h, AI insights | `GET /api/analytics?days=1`, `GET /api/me` |
| `/dashboard/sessions` | Live enforcement sessions + tool calls | `GET /api/violations` (recent) + WS stream (Phase D) |
| `/dashboard/policies` | Policy versions table (rollback, diff) | `GET /api/policy/versions` |
| `/dashboard/ai` | Rule author + diff analyzer | `POST /api/ai/author`, `POST /api/ai/analyze` |
| `/dashboard/reports` | Daily compliance + CSV export | `GET /api/report/daily`, `GET /api/export/violations.csv` |
| `/dashboard/settings` | Account info, API key, logout | `GET /api/me`, `POST /api/auth/logout` |

### Interaction details
- **Stat cards**: compliance score (teal/green gradient), active sessions (live count), violations 24h (red if >0), AI insights (amber)
- **Sessions**: expandable rows showing tool calls (e.g. "Edit README.md ❌ protected")
- **Policies table**: columns for name, enforce level, scope, tag (required/optional) with inline rollback
- **AI panel**: text input → POST to `/api/ai/author` → structured JSON output with copy button
- **Reports**: daily compliance report at 9am UTC (cron trigger), CSV export via R2 presigned URL
- **Settings**: show email/provider from `/api/me`, API key (`pc_live_••••`), logout clears cookie + redirects to `/`

## 4. Micro-interactions & edge cases

| Scenario | Behavior |
| --- | --- |
| User visits `/dashboard` without auth | `RequireAuth` → `GET /api/me` returns null → redirect to `/login?next=/dashboard` |
| User signs up → no onboarding shown | Check KV `onboarding:complete` flag; if missing, route to `/onboarding` |
| Turnstile fails to load | Widget hidden, submit button stays disabled until token obtained; server still runs (test key in dev) |
| OAuth not configured on server | `GET /api/auth/oauth/google` returns 501 → frontend shows toast "OAuth unavailable" |
| API server unreachable | `AuthProvider` catch → `user = null` → redirect to login |
| Violation export with no R2 | Returns inline CSV response with `Content-Disposition: attachment` |
| Dark mode preference | Persists via `localStorage` + `prefers-color-scheme` media query (no FOUC after first visit) |
| ⌘K command palette | `Cmd/Ctrl+K` opens modal; type to fuzzy-filter routes + commands; `Esc` closes |

## 5. Data flow summary

```
┌────────────┐     POST /api/auth/signup      ┌──────────────┐
│  Browser   │ ──────────────────────────────→ │  Workers      │
│  (SPA)     │                                  │  (D1 + KV +   │
└────────────┘ ←────────────────────────────── │   R2 + AI)    │
                 cookie: pc_session             └──────┬───────┘
                                                        │
          ┌──────────────────────┐                      │
          │ CLI (local)          │                      │
          │ `policyctl login`    │ ─ Bearer token ──────┤
          │ `policyctl check`    │                      │
          └──────────────────────┘                      │
                                                        │
          ┌──────────────────────┐                      │
          │ CI (GitHub Actions)  │ ─ Bearer token ──────┤
          │ `policyctl check`    │                      │
          └──────────────────────┘                      │
                                                        ▼
                                              GET /api/analytics, /api/violations, etc.
```

## 6. Security & compliance checklist

- [x] Turnstile widget on signup/login forms (Cloudflare test key in dev, real key in prod)
- [x] Session cookies: HttpOnly, Secure, SameSite=Lax, 30-day TTL
- [x] PBKDF2-SHA256 password hashing (100k iterations, per-user salt)
- [x] Bearer token auth for CLI/CI (stored in `~/.policyctl/config.json`)
- [x] KV cache for session lookups (sub-ms, invalidation on auth events)
- [ ] Turnstile real site key (requires Cloudflare dashboard widget creation — API token lacks Turnstile:Edit scope)
- [ ] OAuth Google client credentials (need Google Cloud Console setup)
SYNTHESIS_EOF
echo "done"