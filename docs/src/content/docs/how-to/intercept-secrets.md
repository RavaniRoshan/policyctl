---
title: Intercept Leaked Secrets
description: Recipe for configuring deterministic regex matchers to prevent agents from committing API keys and secret tokens.
---

Coding agents often paste API keys, database connection strings, or personal access tokens directly into code or test fixtures during task execution.

Using `diff_regex` in `policyctl`, you can intercept secret patterns deterministically in under 12ms before code leaves the machine.

---

## The Recipe

Add this rule to `.policyctl.yml`:

```yaml
rules:
  - id: no-leaked-secrets
    description: "Scan commit diffs for known provider token patterns"
    tags: [security, credentials]
    scope: ci
    enforce: fail
    message: "Potential secret token detected in patch diff: {{path}}"
    when:
      diff_regex: >-
        (?i)(
        aws_secret_access_key|
        ghp_[A-Za-z0-9_]{36}|
        github_pat_[A-Za-z0-9_]{82}|
        sk-[a-zA-Z0-9]{20,}|
        xox[baprs]-[0-9]{10,}-[a-zA-Z0-9]{24}|
        -----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----
        )
```

---

## Supported Pattern Signatures

| Provider / Token Type | Example Pattern Syntax |
|---|---|
| **AWS Secret Access Key** | `(?i)aws_secret_access_key` |
| **GitHub Personal Access Token** | `ghp_[A-Za-z0-9_]{36}` |
| **OpenAI Secret Key** | `sk-[a-zA-Z0-9]{20,}` |
| **Slack Bot / App Token** | `xox[baprs]-[0-9]{10,}-[a-zA-Z0-9]{24}` |
| **SSH / RSA Private Keys** | `-----BEGIN (RSA\|EC\|OPENSSH) PRIVATE KEY-----` |

---

## Testing Secret Interception

Create a dummy file with a mock test key:

```bash
echo 'const apiKey = "sk-proj-0123456789abcdefghijklmnopqrstuvwxyz";' > test_secret.js
git add test_secret.js
```

Run `policyctl check`:

```bash
policyctl check
```

Output:
```text
🛑 FAILED: no-leaked-secrets
Message: Potential secret token detected in patch diff: test_secret.js
```

Clean up:
```bash
git rm -f test_secret.js
```
