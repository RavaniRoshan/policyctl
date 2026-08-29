-- policyctl Phase B schema (Cloudflare D1 / SQLite)
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT UNIQUE NOT NULL,
  token      TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orgs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  current_version INTEGER,            -- points to policy_versions.id
  created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS org_members (
  org_id     INTEGER NOT NULL,
  user_id    INTEGER NOT NULL,
  role       TEXT NOT NULL,           -- owner | admin | member | viewer
  created_at INTEGER NOT NULL,
  PRIMARY KEY (org_id, user_id)
);

CREATE TABLE IF NOT EXISTS policy_versions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id     INTEGER NOT NULL,
  version    INTEGER NOT NULL,        -- sequential per org
  yaml       TEXT NOT NULL,
  author_id  INTEGER,
  note       TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS violations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id     INTEGER NOT NULL,
  repo       TEXT,
  rule_id    TEXT,
  enforce    TEXT,
  message    TEXT,
  agent      TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_policy_org ON policy_versions(org_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_violations_org ON violations(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_user ON org_members(user_id);
