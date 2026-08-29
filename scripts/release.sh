#!/usr/bin/env bash
# Cut a release: version bump, test, build, pack, and emit a checksum file.
# Usage: ./scripts/release.sh <version>
#   e.g. ./scripts/release.sh 0.2.0
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "usage: $0 <semver>" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 1. bump
sed -i.bak -E "s/\"version\": \"[0-9.]+\"/\"version\": \"$VERSION\"/" packages/cli/package.json packages/core/package.json packages/server/package.json
rm -f packages/cli/package.json.bak packages/core/package.json.bak packages/server/package.json.bak

# 2. test + build
pnpm -r test
pnpm --filter @policyctl/core build
pnpm --filter @policyctl/cli build
pnpm --filter @policyctl/server build

# 3. pack the CLI
TMP="$(mktemp -d)"
cd packages/cli
npm pack --pack-destination "$TMP"
TGZ="$TMP/policyctl-cli-$VERSION.tgz"
SHA="$(sha256sum "$TGZ" | awk '{print $1}')"
cd "$ROOT"

echo
echo "Release artifacts:"
echo "  npm tarball: $TGZ"
echo "  sha256:      $SHA"
echo
echo "Update homebrew-tap/policyctl.rb 'url' and 'sha256' with these values."
