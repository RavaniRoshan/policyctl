---
title: Installation
description: Install the policyctl CLI via npx, npm, or Docker, verify it, and scaffold your first policy file.
---

## Option 1: npx (no install)

Run directly without installing anything:

```bash
npx -y @policyctl/cli@latest init --all
```

Best for trying policyctl or for CI runners.

## Option 2: Global npm install (recommended for hooks)

Hook commands fire on every agent tool call, so a globally installed binary keeps latency minimal:

```bash
npm install -g @policyctl/cli

# Verify
policyctl --version
policyctl doctor
```

## Option 3: Docker

A published image is available from GitHub Container Registry:

```bash
docker run --rm -v "$PWD:/repo" -w /repo ghcr.io/ravaniroshan/policyctl:latest check
```

## Scaffold your first policy

In your repository root:

```bash
policyctl init --all
```

This writes `.policyctl.yml` and auto-generates hook files for every detected provider (Claude Code, Codex, Cursor), plus a pre-commit hook. Confirm with:

```bash
policyctl doctor
```

`doctor` validates the environment, hook files, and policy syntax, and reports per-provider status.

## Uninstall

```bash
npm rm -g @policyctl/cli
```

Hook files (`.claude/settings.json`, `.codex/hooks/hooks.json`, `.cursor/hooks.json`) are plain files in your repo — delete the ones you no longer want.

## Next steps

- [Introduction](/docs/get-started/introduction/) — what policyctl is and why it works
- [Quickstart](/docs/tutorials/getting-started/) — your first BLOCK in 5 minutes
