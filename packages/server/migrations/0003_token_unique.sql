-- Add UNIQUE constraint + index on users.token for fast lookups and integrity.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_token ON users(token);
