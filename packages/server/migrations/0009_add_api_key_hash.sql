-- Phase: Add API key hash to orgs for CLI↔dashboard identity linking.
-- api_key_hash stores a SHA-256 hash of the control-plane key, never the raw key.

ALTER TABLE orgs ADD COLUMN api_key_hash TEXT DEFAULT NULL;
