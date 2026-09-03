---
title: Cloud Control Plane API
description: Complete REST API reference for the hosted policyctl control plane endpoints, authentication, and schemas.
---

The `policyctl` cloud control plane runs on Cloudflare Workers (`packages/server`) backed by Cloudflare D1 (SQL), KV cache, and Durable Objects.

**Base URL**: `https://policyctl-server.shivamkumar10958.workers.dev`

---

## Authentication

All protected endpoints require an RS256 Auth0 JWT bearer token or an organization API token:

```http
Authorization: Bearer <TOKEN>
```

---

## Endpoints

### 1. Policies & Versioning

#### `GET /api/policy`
Returns the active `.policyctl.yml` string for the organization.
- **Query Params**: `org=<org_id>`
- **Response**: `{ "yaml": "version: 1\nrules: ..." }`

#### `POST /api/policy`
Uploads a new policy version.
- **Query Params**: `org=<org_id>`
- **Body**: `{ "yaml": "string", "note": "optional commit note" }`
- **Response**: `{ "ok": true, "version": 4, "id": 18 }`

#### `GET /api/policy/versions`
Lists the last 50 policy versions with author metadata and timestamps.
- **Response**: `Array<PolicyVersion>`

#### `POST /api/policy/versions/:id/rollback`
Rolls back active policy to a historical version ID.
- **Response**: `{ "ok": true }`

---

### 2. Violations & Audit Feed

#### `POST /api/report`
Ingests evaluation results from CI or CLI sessions.
- **Body**:
  ```json
  {
    "repo": "organization/repo-name",
    "agent": "claude",
    "results": [
      {
        "ruleId": "no-secrets",
        "enforce": "fail",
        "message": "Secret detected"
      }
    ],
    "actor": "agent"
  }
  ```
- **Response**: `{ "ok": true, "count": 1 }`

#### `GET /api/violations`
Fetches the last 200 recorded violation events.
- **Response**: `Array<Violation>`

#### `GET /api/export/violations.csv`
Streams an unbuffered CSV file containing up to 5,000 violation records directly from the edge.

---

### 3. Analytics & Compliance

#### `GET /api/analytics`
Returns real-time organizational metrics:
```json
{
  "compliance_score": 98.4,
  "active_sessions": 3,
  "violations_24h": 2,
  "ai_insights": 14
}
```

#### `GET /api/report/daily`
Fetches the cached daily 09:00 UTC compliance summary from KV.

#### `POST /api/report/daily/resend`
Regenerates the 24-hour compliance report on demand.

---

### 4. AI Semantic Endpoints *(Paid Tier Gated)*

#### `POST /api/ai/author`
Generates a typed rule from natural language.
- **Body**: `{ "intent": "Block all modifications to .env files" }`
- **Response**: `{ "rule": "...", "explanation": "..." }`

#### `POST /api/ai/analyze`
Analyzes a unified patch diff for policy and security recommendations.
- **Body**: `{ "diff": "..." }`
- **Response**: `{ "summary": "...", "violations": [...], "suggestedRules": [...] }`
