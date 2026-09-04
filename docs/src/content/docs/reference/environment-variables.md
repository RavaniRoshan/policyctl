---
title: Environment Variables
description: Complete reference for every environment variable used by the CLI, the web dashboard, and the Cloudflare Worker.
---

> **Machine-readable:** [Raw Markdown](/docs/reference/environment-variables.md) · [llms.txt](/docs/llms.txt)

## CLI

| Variable | Purpose | Required when |
|---|---|---|
| `POLICYCTL_TOKEN` | Control-plane API token for `push`, `pull`, and `check --report` | Using Cloud sync or audit streaming |

Obtain a token via `policyctl login` or `POST /api/billing/api-key`. In CI, store it as an encrypted secret (GitHub Actions secret, masked GitLab variable) — never commit it.

## Web dashboard (`web/.env`, `VITE_` prefix)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE` | Worker API origin (default `https://policyctl-server.shivamkumar10958.workers.dev`) |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile site key for bot protection on auth forms |
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain for Universal Login |
| `VITE_AUTH0_CLIENT_ID` | Auth0 application client ID |

## Worker (`packages/server/wrangler.toml` `[vars]` + secrets)

Public `[vars]` (safe to commit):

| Variable | Purpose |
|---|---|
| `TURNSTILE_SITE_KEY` | Public Turnstile site key |
| `AUTH0_DOMAIN` / `AUTH0_AUDIENCE` / `AUTH0_CLI_CLIENT_ID` | JWT verification + CLI device flow |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist for `/api` |
| `STRIPE_PRICE_ID_GROWTH_MONTHLY` / `_ANNUAL` | Public Stripe price IDs |

Secrets (set via `wrangler secret put`, never committed):

| Variable | Purpose |
|---|---|
| `TURNSTILE_SECRET_SITE` | Server-side Turnstile verification |
| `STRIPE_SECRET_KEY` | Subscription + checkout server calls |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
