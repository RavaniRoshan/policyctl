---
title: .policyctl.yml Schema Spec
description: Complete technical schema specification for .policyctl.yml including vars, exceptions, rules, and when clauses.
---

The `.policyctl.yml` file defines all declarative rules, variable mappings, and exception exemptions for a project.

---

## Top-Level Schema

```yaml
version: 1

# 1. Variables dictionary
vars:
  <variable_name>: <string_value>

# 2. Post-evaluation exception list
exceptions:
  - rule: <rule_id>
    path: <glob_pattern>
    enforce: ignore | warn
    note: <justification_string>

# 3. Rule definitions list
rules:
  - id: <unique_string_id>
    description: <optional_human_description>
    tags: [<optional_tag_1>, <optional_tag_2>]
    scope: hook | ci | both
    enforce: block | fail | warn
    message: <optional_template_string>
    when: <Matchers | WhenGroup>
```

---

## Root Fields

### `version`
- **Type**: `number`
- **Required**: Yes
- **Value**: Must be `1`.

### `vars`
- **Type**: `Record<string, string>`
- **Required**: No
- **Description**: Reusable path and pattern variables. Referenced in rules via `${variable_name}`. If a variable is not found in `vars`, `policyctl` checks `process.env[variable_name]`.

### `exceptions`
- **Type**: `Array<Exception>`
- **Required**: No
- **Description**: Whitelist exemptions evaluated *after* rules match.
  - `rule` (`string`): Target rule ID.
  - `path` (`string`): File path or glob matching the exemption.
  - `enforce` (`"ignore" | "warn"`): Downgrades the violation. `"ignore"` suppresses it completely.
  - `note` (`string`): Audit justification.

### `rules`
- **Type**: `Array<Rule>`
- **Required**: Yes
- **Description**: The array of rules evaluated during hook calls or CI runs.

---

## Rule Object Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | **Yes** | Stable, unique identifier (e.g., `no-secrets`, `protect-readme`). |
| `scope` | `"hook" \| "ci" \| "both"` | **Yes** | Target execution surface. |
| `enforce` | `"block" \| "fail" \| "warn"` | **Yes** | Severity and runtime action. |
| `when` | `Matchers \| WhenGroup` | **Yes** | Predicates that trigger the rule. |
| `description` | `string` | No | Human-readable explanation. Used in Cursor `.mdc` generation. |
| `tags` | `string[]` | No | Categories for grouping in CLI table and audit feeds. |
| `message` | `string` | No | Template string displayed on violation. Supports `{{ruleId}}`, `{{path}}`, and `{{tool}}`. |

---

## The `when` Structure

The `when` clause can be defined in two formats:

### Flat Matchers (Implicit AND)
All specified matchers must evaluate to `true`:

```yaml
when:
  path: "db/migrations/**"
  tool: "Edit"
```

### Structured Group (`WhenGroup`)
Combines `all` (AND) and `any` (OR) blocks:

```yaml
when:
  all:
    - path: "src/**/*.ts"
  any:
    - diff_not_contains: "export default"
    - diff_regex: "(?i)TODO: refactor"
```

A `WhenGroup` triggers if:
- **Every** item in the `all` array matches, **AND**
- **At least one** item in the `any` array matches.
