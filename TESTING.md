# policyctl — Production Readiness Testing Plan

> Status: Ready for execution. All Phases A–D built and pushed. This plan verifies end-to-end correctness before public launch.

## 0. Pre-flight checklist

| Item | Status | How to verify |
|---|---|---|
| Git committed & pushed | ✅ | `git log --oneline -1` == `9880fca`; `git push origin main --tags` succeeds |
| npm packages published | ✅ | `npm view @policyctl/cli version` → `0.1.6`; `npm view @policyctl/core version` → `0.1.6` |
| GitHub tag v0.1.6 | ✅ | `git rev-parse v0.1.6` == latest commit SHA |
| README updated | ✅ | Badges link to live URLs; install + quickstart commands copy-pasteable |
| Docs site built | ✅ | `pnpm --filter policyctl-site build` → `dist/docs.html`, `dist/index.html` |
| Server builds | ✅ | `pnpm --filter @policyctl/server build` → no TS errors |

---

## 1. Phase A — CLI engine (local-first runtime)

### 1.1 Unit tests
```bash
pnpm --filter @policyctl/core test
pnpm --filter @policyctl/cli test
```
- Expect: all `evaluate` matcher tests pass (path, command, tool, diff_contains, diff_not_contains, diff_regex, diff_paths_glob, diff_paths_not_glob)
- Expect: all `check`/`eval` regression tests pass

### 1.2 Binary smoke test
```bash
npx @policyctl/cli --version        # → 0.1.6
npx @policyctl/cli list             # works with empty dir
```

### 1.3 Rule enforcement (hook + CI)
```bash
policyctl init --template full           # generates .policyctl.yml with default rules
policyctl list                           # shows 4 rules: migrations, readme, secrets, tests
policyctl gen claude                     # writes .claude/settings.json with PreToolUse hook
policyctl gen codex                      # writes .codex/config.toml with Starlark exec-policy
policyctl gen cursor                     # writes .cursor/hooks.json
policyctl check                          # runs against git diff, exits non-zero on violations
```
- **Migrations rule**: create a file in `db/migrations/` without the generator signature → `policyctl check` must FAIL
- **README rule**: edit README.md → `policyctl check` must WARN
- **Secrets rule**: add a line matching `BEGIN PRIVATE KEY` → `policyctl check` must BLOCK
- **Tests rule**: remove a test file → `policyctl check` must WARN

### 1.4 Hook evaluator (stdin JSON)
```bash
echo '{"tool":"bash","command":"DROP TABLE users"}' | policyctl eval --hook
# expect: exit code 2 (block)
```

---

## 2. Phase B — Hosted control plane (auth, orgs, policy sync)

### 2.1 Server deployment
```bash
cd packages/server
wrangler deploy
```
- Expect: deploys cleanly with no errors
- Expect: secrets are set (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `TURNSTILE_SECRET_SITE`)

### 2.2 Auth flow (signup → dashboard)
**Browser flow:**
1. Navigate to `https://dash.policyctl.io` (or `http://localhost:5173` for local dev)
2. Click "Create an account"
3. Fill form: first name, last name, email, password
4. Turnstile widget renders (test key in dev, real key in prod)
5. Check "Terms & Privacy"
6. Click "Create account"
7. **Expected**: redirected to `/onboarding`

**API test (curl):**
```bash
# Signup
curl -X POST https://policyctl-server.shivamkumar10958.workers.dev/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Passw0rd!","displayName":"Test","turnstile":"<valid_token>"}' \
  -c cookies.txt -v

# Check session cookie is set
cat cookies.txt | grep pc_session

# Fetch authenticated user
curl https://policyctl-server.shivamkumar10958.workers.dev/api/me \
  -b cookies.txt
# expect: { "user": { "id": ..., "email": "test@example.com", ... } }
```

### 2.3 Login flow
```bash
curl -X POST https://policyctl-server.shivamkumar10958.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Passw0rd!","turnstile":"<token>"}' \
  -c cookies.txt -v
# expect: 200 + session cookie
```

### 2.4 Legacy CLI login (backward compat)
```bash
npx @policyctl/cli login --email test@example.com --server https://policyctl-server.shivamkumar10958.workers.dev
# expect: authenticates via POST /api/login (legacy endpoint)
```

### 2.5 OAuth (Google)
- Navigate to `https://policyctl-server.shivamkumar10958.workers.dev/api/auth/oauth/google`
- **Expected**: 302 redirect to Google consent screen (if `OAUTH_GOOGLE_CLIENT_ID` is set)
- **Expected**: 501 "OAuth not configured" if not set

### 2.6 Policy versioning
```bash
# Push policy
policyctl login --server https://policyctl-server.shivamkumar10958.workers.dev
policyctl push --note "initial policy"
# expect: version 1 created

# Fetch policy
policyctl pull
# expect: .policyctl.yml matches latest version

# List versions
curl https://policyctl-server.shivamkumar10958.workers.dev/api/policy/versions \
  -b cookies.txt
# expect: array of versions

# Rollback
curl -X POST https://policyctl-server.shivamkumar10958.workers.dev/api/policy/versions/1/rollback \
  -b cookies.txt
# expect: 200 + restored version
```

### 2.7 Turnstile verification
- Signup without Turnstile token → expect 403
- Login with invalid Turnstile token → expect 403
- Signup with valid test token → expect 200

---

## 3. Phase C — Analytics & dashboard (UI + exports)

### 3.1 Web app build
```bash
cd web && pnpm build
# expect: tsc passes, vite build succeeds, 1943+ modules transformed
```

### 3.2 Dashboard routing
- `/` → Landing page (with WebGL gradient-wave hero)
- `/docs` → Documentation site (with Cmd+K, AI actions, callouts)
- `/login` → AuthSectionOne (mode=login, with Turnstile)
- `/signup` → AuthSectionOne (mode=signup, with Turnstile)
- `/onboarding` → Step-by-step tutorial (requires auth)
- `/dashboard` → Overview (requires auth)
- `/dashboard/sessions` → Live sessions
- `/dashboard/policies` → Policy versions table
- `/dashboard/ai` → AI rule authoring
- `/dashboard/reports` → Daily compliance + CSV export
- `/dashboard/settings` → Account settings

### 3.3 Dashboard UI components
Each page renders with:
- `<DashboardShell>` wrapper (sidebar + header)
- `<Sidebar>` with active route indicator
- `<DashboardHeader>` with dynamic title + user menu
- `⌘K` command palette (fuzzy filter, keyboard nav)
- Dark/light theme toggle (persists in localStorage)

### 3.4 Violation reporting
```bash
# Simulate a violation
curl -X POST https://policyctl-server.shivamkumar10958.workers.dev/api/report \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"repo":"test/repo","ruleId":"migrations-via-generator","enforce":"block","message":"Handwritten migration detected","agent":"Claude Code"}'
# expect: 200 + violation stored in D1

# Fetch violations
curl https://policyctl-server.shivamkumar10958.workers.dev/api/violations \
  -b cookies.txt
# expect: array of violations
```

### 3.5 Analytics
```bash
curl "https://policyctl-server.shivamkumar10958.workers.dev/api/analytics?days=7" \
  -b cookies.txt
# expect: { complianceScore, activeSessions, violations24h, trend: [...] }
```

### 3.6 CSV export
```bash
curl "https://policyctl-server.shivamkumar10958.workers.dev/api/export/violations.csv" \
  -b cookies.txt -o violations.csv
# expect: CSV file with columns: id, repo, rule_id, enforce, message, agent, created_at
```

### 3.7 Site (marketing + docs)
```bash
cd site && pnpm build
# expect: dist/index.html (38kB), dist/docs.html (29kB), dist/assets/design-system.css (8kB)
# expect: WebGL gradient-wave.js loads in hero
# expect: docs.html has Cmd+K, AI menu, callouts, scroll-spy TOC
```

### 3.8 Pages deployment
```bash
cd site
wrangler deploy
# expect: deploys to policyctl.pages.dev
```

---

## 4. Phase D — AI + real-time sessions

### 4.1 Workers AI rule authoring
```bash
curl -X POST https://policyctl-server.shivamkumar10958.workers.dev/api/ai/author \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"description":"Prevent editing README.md without a review","scope":"both"}'
# expect: structured YAML rule with when/enforce/scope
```

### 4.2 AI diff analysis
```bash
curl -X POST https://policyctl-server.shivamkumar10958.workers.dev/api/ai/analyze \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"diff":"+ CREATE TABLE users (id INT)","repo":"test/repo"}'
# expect: risk assessment + suggested policy
```

### 4.3 Durable Objects session streaming
- Init a session via `POST /api/session/init`
- Connect via WebSocket to `/api/session/:key/stream`
- Expect: live tool-call events flow over the socket

### 4.4 Daily compliance report (cron)
- Cron trigger fires at 9am UTC
- Expect: report generated and stored in R2
- `GET /api/report/daily` → returns last report

---

## 5. Cross-cutting concerns

### 5.1 Design system consistency
| Site | Check |
|---|---|
| Landing (`site/index.html`) | WebGL hero, 11 sections, Cloudflare-style layout |
| Docs (`site/docs.html`) | 3-col grid, Cmd+K, AI dropdown, callouts, code chrome, scroll-spy, skip link |
| Web app (`web/`) | shadcn + Tailwind + TypeScript, all pages use design tokens |
| README | Treats repo as marketing page — badges, problem, quick start, pricing, competition |

### 5.2 Cloudflare resource usage
- D1: reads < 100ms (KV cache for sessions)
- KV: used for session cache + onboarding flags
- R2: CSV exports + daily reports
- Turnstile: protects signup + login
- Workers AI: gated behind paid tier (Phase D)

### 5.3 Security audit
- [ ] Turnstile test key → replace with real widget (Cloudflare dashboard)
- [ ] Google OAuth client ID/secret → set via `wrangler secret put`
- [ ] R2 bucket created and bound in wrangler.toml
- [ ] Session cookies: HttpOnly, Secure, SameSite=Lax
- [ ] PBKDF2-SHA256: 100k iterations, per-user salt
- [ ] No secrets in git (verify: `git grep "PRIVATE KEY"` → no results)

---

## 6. Launch readiness matrix

| Criteria | Phase A | Phase B | Phase C | Phase D |
|---|---|---|---|---|
| Code committed + pushed | ✅ | ✅ | ✅ | ✅ |
| Builds pass | ✅ | ✅ | ✅ | ✅ |
| Tests pass | ✅ | n/a | n/a | n/a |
| npm published | ✅ v0.1.6 | n/a | n/a | n/a |
| Server deployed | n/a | ✅ | ✅ | ✅ |
| Site deployed | n/a | n/a | ✅ | n/a |
| Auth works | n/a | ✅ | ✅ | ✅ |
| Dashboard works | n/a | n/a | ✅ | ✅ |
| Design system | ✅ | n/a | ✅ | n/a |
| README as marketing | ✅ | ✅ | ✅ | ✅ |
