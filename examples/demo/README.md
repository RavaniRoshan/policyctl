# policyctl demo

A self-contained example showing how a repo uses **policyctl** to govern coding agents.

## What's here

- `.policyctl.yml` — the policy (rules + vars + exceptions)
- `.policyctl.test.json` — fixture cases the policy is tested against
- `.github/workflows/policy.yml` — CI that runs `policyctl check` on every push

## Try it

```bash
npx @policyctl/cli init --template full     # already here, but shows the scaffold
npx @policyctl/cli list                    # show the loaded rules
npx @policyctl/cli test                    # run the fixture suite
npx @policyctl/cli gen claude              # wire Claude Code hooks + pre-commit
npx @policyctl/cli doctor                  # confirm everything is in place
npx @policyctl/cli check                   # evaluate the current diff
```

## What this policy enforces

1. **`migrations-via-generator`** — DB migrations under `db/migrations/**` must be produced by
   `make migrate`; the hook blocks the handwrite at write-time, the CI gate fails the build if
   the generator signature is missing. A sanctioned exception whitelists the bootstrap file.
2. **`no-protected-edits`** — agents cannot edit `README.md`, `package.json`, or `tsconfig.json`.
3. **`no-secrets-in-commits`** — diff regex catches obvious secret patterns (GH tokens, AWS keys,
   OpenAI keys) and fails the build.
4. **`tests-for-src`** — every `src/**/*.ts` change should ship a matching `*.test.ts` change
   (warn-only).
