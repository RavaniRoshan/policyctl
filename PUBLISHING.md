# Publishing policyctl

This document exists because the 0.1.0 → 0.1.6 releases taught us painful lessons. Follow this exactly.

## What went wrong (so you don't repeat it)

1. **Hardcoded version** — `cli.ts` had `.version("0.1.0")`. Bumping `package.json` didn't update the bin. **Fix:** bin reads `pkg.version` from `package.json` at runtime.
2. **Workspace dep leaked to npm** — `package.json` had `"@policyctl/core": "workspace:*"`. npm can't resolve that and the install breaks for users. **Fix:** the publish workflow rewrites it to `^<version>` before `npm publish`.
3. **Post-build script rewrote `package.json`** — `fix-perm.mjs` overwrote the dep with `file:./node_modules/...`, which npm also rejected. **Fix:** script now only adds the shebang; it never touches `package.json`.
4. **Root `private: true`** — npm walked up and refused to publish `core`/`cli`. **Fix:** sub-packages set `"private": false` explicitly.
5. **No install test of the tarball** — we published, then found the bug on the user's machine. **Fix:** always `npm install <tarball>` locally before tagging.

## How to publish a release

### 1. Bump + build + test locally

```bash
# bump all three packages to the same version
NEW_VERSION=0.2.0
sed -i "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" \
  packages/cli/package.json packages/core/package.json packages/server/package.json

pnpm install
pnpm -r test
pnpm --filter @policyctl/core build
pnpm --filter @policyctl/cli build
pnpm --filter @policyctl/server build
```

### 2. Pack and install-test the tarball (critical)

```bash
cd packages/cli
npm pack
cd /tmp && rm -rf pc-test && mkdir pc-test && cd pc-test
npm install /home/shiva/projects/packages/cli/policyctl-cli-*.tgz
node node_modules/@policyctl/cli/dist/cli.js --version   # must print $NEW_VERSION
node node_modules/@policyctl/cli/dist/cli.js --help      # must not crash
cd /home/shiva/projects && rm -rf /tmp/pc-test
```

### 3. Tag and push (CI publishes)

```bash
git add -A
git commit -m "release: v$NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin main
git push origin "v$NEW_VERSION"
```

CI (`.github/workflows/publish.yml`) then:
1. Builds core + cli
2. Rewrites `workspace:*` → `^$NEW_VERSION` in `cli/package.json`
3. Publishes `@policyctl/core` first, then `@policyctl/cli`
4. Creates a GitHub release with the tarball

### 4. Verify on npm

```bash
npm view @policyctl/cli version   # should be $NEW_VERSION
npm view @policyctl/core version  # should be $NEW_VERSION
npm install -g @policyctl/cli@$NEW_VERSION
policyctl --version
```

## Rules

- **Never** manually edit `dist/` — always rebuild from `src/`.
- **Never** publish from a dirty working tree.
- **Always** run the tarball install test before tagging.
- **Never** hardcode the version in source — read it from `package.json`.
- The `core` package is a separate npm package; the `cli` depends on it as a normal semver range.
