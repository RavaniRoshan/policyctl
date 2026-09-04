-- Dismissal state for violations. Dismissed rows stay in the audit log but
-- are hidden from the default feed (see listViolations includeDismissed flag).
ALTER TABLE violations ADD COLUMN dismissed_at INTEGER;
ALTER TABLE violations ADD COLUMN dismissed_by INTEGER;
ALTER TABLE violations ADD COLUMN dismiss_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_violations_dismissed ON violations(org_id, dismissed_at);
