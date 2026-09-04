---
title: CLI Command Reference
description: Complete reference documentation for all 22 policyctl CLI commands, options, and exit codes.
---

> **Machine-readable:** [Raw Markdown](/docs/reference/cli-commands.md) · [llms.txt](/docs/llms.txt)

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
| [`login`](#cloud-commands) | `policyctl login [--server <url>]` | Authenticate via Auth0 device flow |
| [`logout`](#cloud-commands) | `policyctl logout` | Clear local credentials |
| [`whoami`](#cloud-commands) | `policyctl whoami [--server <url>]` | Show the authenticated user and org |
| [`config`](#cloud-commands) | `policyctl config [key]` / `config:set` / `config:get` | View, set, or get local configuration |
| [`push`](#cloud-commands) | `policyctl push [--policy <path>] [--dry-run]` | Uploads `.policyctl.yml` to hosted version feed |
| [`pull`](#cloud-commands) | `policyctl pull [--force] [--dry-run]` | Downloads active policy from cloud control plane |
| [`report`](#cloud-commands) | `policyctl report [--repo <name>]` | Streams evaluation outcome JSON to hosted feed |
| [`author`](#cloud-commands) | `policyctl author "<prompt>"` | Generate a rule from natural language (paid tier) |
| [`org:list`](#cloud-commands) | `policyctl org:list` | List organizations for the authenticated user |
| [`org:members`](#cloud-commands) | `policyctl org:members <orgId>` | List members of an organization |
| [`org:invite`](#cloud-commands) | `policyctl org:invite <orgId> <email> [--role <r>]` | Invite a member to an organization |

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

## `policyctl list`

Prints an ASCII table of all rules in the loaded policy:

```bash
policyctl list [--policy <path>]
```

---

## `policyctl gen`

Writes provider hook glue (`claude` | `codex` | `cursor`) plus a pre-commit hook. Preview without writing via `--print`:

```bash
policyctl gen codex --print
```

---

## Cloud Commands

Cloud commands authenticate via `policyctl login`, which runs the Auth0 device
flow and saves tokens to `~/.policyctl/config.json` (permissions `0600`).
Expired access tokens refresh silently using the stored refresh token.

- **`policyctl login [--server <url>]`**: Device-code login; prints a verification URI and code.
- **`policyctl logout`**: Clears local credentials (tokens, email, org).
- **`policyctl whoami [--server <url>]`**: Prints the authenticated user and org (exit 4 if logged out).
- **`policyctl config [key]`**: Lists all local config, or prints one key (`server | email | orgId`).
- **`policyctl config:set <key> <value>`** / **`policyctl config:get <key>`**: Set or read one key.
- **`policyctl push [--policy <path>] [--dry-run] [--note <text>]`**: Validates and uploads the local policy (paid tier required).
- **`policyctl pull [--policy <path>] [--force] [--dry-run]`**: Downloads and validates the active policy before writing.
- **`policyctl report [--repo <name>] [--agent <name>]`**: Streams violation JSON from stdin to the hosted feed.
- **`policyctl author "<prompt>"`**: Generates a rule from natural language via `/api/ai/author` (paid tier required).
- **`policyctl org:list`**: Lists organizations for the authenticated user.
- **`policyctl org:members <orgId>`**: Lists members and roles.
- **`policyctl org:invite <orgId> <email> [--role owner|admin|member|viewer]`**: Invites a member (default role `member`).
