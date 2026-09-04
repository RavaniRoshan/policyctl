-- Premium waitlist (free-launch mode). No payments yet: interested users
-- leave an email and the owner is notified.
CREATE TABLE IF NOT EXISTS waitlist (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  interest   TEXT,
  source     TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
