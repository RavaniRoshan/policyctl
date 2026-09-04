---
title: GitLab CI Gate
description: Enforce policyctl as a merge-request gate in GitLab CI using policyctl check.
---

The same `policyctl check` gate from [GitHub Actions](/docs/tutorials/ci-pipeline-setup/) runs on GitLab — only the workflow syntax differs.

## Step 1: Create the CI job

Add to `.gitlab-ci.yml` in your repository root:

```yaml
policyctl-gate:
  image: node:24
  stage: test
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  before_script:
    - git fetch origin "$CI_DEFAULT_BRANCH"
  script:
    - npx -y @policyctl/cli@latest check --from "origin/$CI_DEFAULT_BRANCH" --to HEAD
```

How it works:

1. `check` diffs `origin/<default-branch>` against `HEAD` and evaluates all `scope: ci` / `scope: both` rules.
2. Exit `0` passes, `1` warns-and-passes, `2` fails the pipeline and blocks the merge request.

## Step 2: Stream violations to Cloud (optional)

For the hosted audit feed, store the control-plane token as a **masked** CI/CD variable named `POLICYCTL_TOKEN`, then append `--report`:

```yaml
  script:
    - npx -y @policyctl/cli@latest check --from "origin/$CI_DEFAULT_BRANCH" --to HEAD --report
```

The CLI reads `POLICYCTL_TOKEN` from the environment automatically — never hardcode it in the YAML.
