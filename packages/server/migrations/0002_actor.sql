-- Phase C: attribute violations to agent vs human.
ALTER TABLE violations ADD COLUMN actor TEXT;
CREATE INDEX IF NOT EXISTS idx_violations_actor ON violations(org_id, actor);
