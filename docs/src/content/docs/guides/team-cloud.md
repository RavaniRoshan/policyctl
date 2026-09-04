---
title: Team & Cloud Sync
description: Share policies across a team with organizations, push/pull versioning, member seats, violation audit, and the Cloud dashboard.
---

Local hooks protect one machine. **Cloud sync** distributes the same `.policyctl.yml` to a whole team, collects every violation into an audit feed, and gates Cloud-only features (AI authoring, daily compliance reports) behind a subscription.

## Concepts: orgs, members, seats

- An **organization** owns one policy version feed and one audit trail.
- Members have roles: `owner`, `admin`, `member`, or `viewer`.
- **Seats** are billed members (`owner`/`admin`/`member` — `viewer` is free). Cloud is **$5/seat/month** or **$50/seat/year**, with a **14-day free trial** that starts at checkout.

## Step 1: Authenticate the CLI

```bash
policyctl login --email you@company.com
```

This opens the device / magic-link flow and stores a token for `push`, `pull`, and `report`. Check status anytime with `policyctl whoami`, leave with `policyctl logout`.

## Step 2: Create an org and invite the team

```bash
policyctl org:list
policyctl org:members <orgId>
policyctl org:invite <orgId> teammate@company.com
```

Or create the org from the dashboard onboarding flow (`/onboarding`), which calls `POST /api/orgs` on your behalf.

## Step 3: Push and pull shared policy

```bash
# Upload the local file as the org's active version
policyctl push

# Teammates fetch it
policyctl pull
```

Every push creates an immutable version. Roll back from the dashboard (`/dashboard/policies`) or keep history for audit.

## Step 4: Stream violations to the audit feed

```bash
policyctl report --repo owner/repo
```

In CI, add `--report` to `policyctl check` with `POLICYCTL_TOKEN` set — every PR evaluation lands in the org's violation feed, compliance score, and daily report. CSV export streams straight from the API (`GET /api/export/violations.csv`).

## Step 5: Start the trial and manage billing

Pick a plan on `/pricing` → Stripe Checkout (14-day trial, no charge until it ends) → manage seats, payment method, and cancellation from the customer portal (`/dashboard/billing`). AI endpoints (`/api/ai/analyze`, `/api/ai/author`, and the CLI's `policyctl author "<prompt>"`) return `403 UPGRADE_REQUIRED` until the org is on trial or paid.

## Reference

- [Cloud API Endpoints](/docs/reference/api-cloud/) — every endpoint, method, and shape
- [Environment Variables](/docs/reference/environment-variables/) — tokens and secrets for CI and self-hosting
