-- Phase B+: auth columns for users table (password hashing, display name, provider).
-- The store.ts code already references these columns; this migration makes the
-- schema match the code so `wrangler d1 migrations apply` is safe.
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'email';
