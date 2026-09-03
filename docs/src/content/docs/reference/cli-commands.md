---
title: CLI Command Reference
description: Complete reference documentation for all 12 policyctl CLI commands, options, and exit codes.
---

The `policyctl` CLI is the execution engine that runs locally on developer machines and in CI/CD pipelines.

---

## Command Matrix

| Command | Synopsis | Primary Purpose |
|---|---|---|
| [`init`](#policyctl-init) | `policyctl init [--template <t>] [--force]` | Scaffolds `.policyctl.yml` and provisions agent hooks |
| [`check`](#policyctl-check) | `policyctl check [--from <ref>] [--to <ref>] [--report]` | Evaluates CI rules against git diff |
| [`eval`](#policyctl-eval) | `policyctl eval --hook [--policy <path>]` | Evaluates hook rules on tool-call JSON from stdin |
| [`list`](#policyctl-list) | `policyctl list [--policy <path>]` | Prints ASCII table of all defined policy rules |
| [`gen`](#policyctl-gen) | `policyctl gen <provider> [--print]` | Generates adapter hook files for Claude, Cursor, Codex |
| [`doctor`](#policyctl-doctor) | `policyctl doctor` | Validates environment, hook files, and policy syntax |
| [`trace`](#policyctl-trace) | `policyctl trace --mode <hook\|ci> [--diff <f>]` | Detailed step-by-step evaluation debugger |
| [`test`](#policyctl-test) | `policyctl test [--suite <file>]` | Runs `.policyctl.test.json` automated test suites |
| [`login`](#policyctl-login) | `policyctl login --email <email>` | Authenticates CLI with the cloud control plane |
| [`push`](#policyctl-push) | `policyctl push [--policy <path>]` | Uploads `.policyctl.yml` to hosted version feed |
| [`pull`](#policyctl-pull) | `policyctl pull [--force]` | Downloads active policy from cloud control plane |
| [`report`](#policyctl-report) | `policyctl report [--repo <name>]` | Streams evaluation outcome JSON to hosted feed |

---

## Global Options

- `--version`, `-V`: Output current binary version.
- `--help`, `-h`: Display help text and available commands.

---

## `policyctl init`

Scaffolds a `.policyctl.yml` configuration and auto-generates hooks for any detected agents.

```bash
policyctl init [options]
```

### Options
- `--template <name>`: Template to scaffold (`default`, `migrations`, `secrets`, `readme`, `full`). Default: `default`.
- `--path <dir>`: Target directory for initialization. Default: current directory.
- `--force`: Overwrite existing `.policyctl.yml` file.
- `--all`: Auto-generate hook files for all detected providers (`claude`, `cursor`, `codex`).

---

## `policyctl check`

Evaluates git diffs against all rules where `scope: ci` or `scope: both`.

```bash
policyctl check [options]
```

### Options
- `--from <ref>`: Base git ref (default: `HEAD~1` or parent commit).
- `--to <ref>`: Target git ref (default: `HEAD` or working directory).
- `--policy <path>`: Path to `.policyctl.yml`. Default: auto-discovered.
- `--json`: Output evaluation verdict as JSON.
- `--report`: Push results to cloud control plane (requires `POLICYCTL_TOKEN`).
- `--repo <name>`: Repository identifier for audit feed (e.g., `owner/repo`).

### Exit Codes
- `0`: All rules passed.
- `1`: One or more `enforce: warn` rules triggered.
- `2`: One or more `enforce: block` or `enforce: fail` rules triggered.
- `3`: Missing policy file or fatal error.

---

## `policyctl eval`

Evaluates agent tool-call events piped via stdin. **Engineered to fail open** on missing or invalid policy files so agent operations are never bricked accidentally.

```bash
echo '{"tool_name": "Edit", "tool_input": {"file_path": "README.md"}}' | policyctl eval --hook
```

### Options
- `--hook`: Enable hook evaluation mode.
- `--policy <path>`: Explicit policy path.
- `--json`: Emit JSON verdict payload.

---

## `policyctl doctor`

Runs an automated system diagnostic verifying:
1. Presence and syntax of `.policyctl.yml`.
2. Discoverability of `policyctl` binary on system `$PATH`.
3. Existence and validity of `.git/hooks/pre-commit`.
4. Claude Code `.claude/settings.json` hook wiring.
5. Cursor `.cursor/hooks.json` and `.cursor/rules/policy.mdc`.
6. OpenAI Codex `.codex/hooks/hooks.json`.

---

## `policyctl trace`

Interactive rule debugger that explains why each matcher passed or failed:

```bash
policyctl trace --mode ci --diff sample.patch
```

Displays color-coded breakdown of `[all]` and `[any]` groups.

---

## `policyctl test`

Runs test assertions against your policy using fixture suites (default: `.policyctl.test.json`):

```bash
policyctl test --suite .policyctl.test.json
```

---

## Cloud Commands

- **`policyctl login --email dev@example.com`**: Saves authentication token to `~/.policyctl/config.json` (permissions `0600`).
- **`policyctl push`**: Pushes local policy to cloud versioning feed.
- **`policyctl pull`**: Pulls latest versioned policy down.
- **`policyctl report`**: Streams violation payloads directly to the hosted dashboard.
