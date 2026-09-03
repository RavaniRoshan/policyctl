---
title: Require Companion Tests
description: Recipe for mandating that changes to application code in src/ are accompanied by corresponding test file changes.
---

When AI agents implement features or refactor code, they often neglect to author or update unit tests unless forced by automated checks.

Using `diff_paths_glob` paired with `diff_paths_not_glob`, `policyctl` can assert that any pull request touching production code also touches a test file.

---

## The Recipe

Add the following rule to your `.policyctl.yml`:

```yaml
rules:
  - id: require-companion-tests
    description: "Modifications to src/ must be accompanied by changes in test files"
    tags: [quality, testing]
    scope: ci
    enforce: warn # Use 'warn' for soft guidance or 'fail' for mandatory enforcement
    message: "Files under src/ were modified without matching *.test.ts or *.spec.ts files."
    when:
      all:
        - { diff_paths_glob: "src/**/*.ts" }
      any:
        - { diff_paths_not_glob: "**/*.test.ts" }
        - { diff_paths_not_glob: "**/*.spec.ts" }
```

---

## How It Works

1. **`diff_paths_glob: "src/**/*.ts"`**: Evaluates to `true` if any file matching `src/**/*.ts` exists in the commit diff.
2. **`diff_paths_not_glob: "**/*.test.ts"`**: Evaluates to `true` if **no file** in the diff matches `**/*.test.ts`.
3. When both conditions hold, the rule triggers and notifies the developer (or blocks the build if set to `enforce: fail`).

---

## Setting Enforcement Levels

- **Guidance (`enforce: warn`)**: Emits a prominent warning in the CI summary without blocking the merge. Useful when rolling out the policy to existing codebases.
- **Mandatory (`enforce: fail`)**: Hard CI failure. The agent must write tests before the branch can merge.
