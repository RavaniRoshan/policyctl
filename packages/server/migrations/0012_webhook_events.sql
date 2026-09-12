-- Stripe webhook observability: idempotency + failure triage.
-- Every verified event is recorded once; failures return 500 so Stripe retries.
CREATE TABLE IF NOT EXISTS webhook_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_event_id TEXT NOT NULL UNIQUE,
  type            TEXT NOT NULL,
  org_id          INTEGER,
  status          TEXT NOT NULL DEFAULT 'received',
  error           TEXT,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_org ON webhook_events(org_id);
