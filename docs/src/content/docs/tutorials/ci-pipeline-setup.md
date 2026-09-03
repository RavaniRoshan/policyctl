---
title: GitHub Actions CI Gate
description: Learn how to configure policyctl in your GitHub Actions CI pipeline as a mandatory, deterministic merge gate.
---

While agent hooks prevent mistakes in developer environments, the **CI Gate** ensures that no PR created by an agent (or human) merges with policy violations.

The CI runner executes the exact same `.policyctl.yml` rules without drift or vendor variation.

---

## Step 1: Create the GitHub Actions Workflow

Create a new workflow file at `.github/workflows/policy.yml`:

```yaml
name: policyctl gate

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  enforce-policy:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4
        with:
          # Fetch full commit history for branch comparison
          fetch-depth: 0

      - name: Run policyctl check
        run: |
          npx -y @policyctl/cli check \
            --from origin/main \
            --to HEAD
```

---

## Step 2: How `check` Works in CI

When executed in CI:
1. `policyctl check` extracts the unified git diff between `--from origin/main` and `--to HEAD`.
2. Evaluates all rules with `scope: ci` or `scope: both`.
3. Runs matchers such as:
   - `diff_regex` (e.g., finding secret key patterns in the patch)
   - `diff_not_contains` (e.g., checking for required generator signatures)
   - `diff_paths_glob` / `diff_paths_not_glob` (e.g., enforcing companion tests)
4. Exit codes:
   - **Exit 0**: All rules passed. CI build succeeds.
   - **Exit 1**: Rules with `enforce: warn` fired. CI emits warnings but passes.
   - **Exit 2**: One or more rules with `enforce: block` or `enforce: fail` fired. CI build fails.

---

## Step 3: Stream Violations to the Cloud Dashboard (Optional)

If your organization uses the hosted control plane for audit compliance, you can stream check outcomes directly to your dashboard:

1. Obtain a control plane API token from `/dashboard/billing` or `POST /api/billing/api-key`.
2. Add the token to your GitHub repository secrets as `POLICYCTL_TOKEN`.
3. Update `.github/workflows/policy.yml` to include `--report`:

```yaml
      - name: Run policyctl check with cloud audit
        env:
          POLICYCTL_TOKEN: ${{ secrets.POLICYCTL_TOKEN }}
        run: |
          npx -y @policyctl/cli check \
            --from origin/main \
            --to HEAD \
            --report
```

Every PR evaluation is immediately logged to your organization's audit feed, compliance score, and daily report.
