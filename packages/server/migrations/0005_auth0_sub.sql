-- Phase 1: Auth0 integration — identify users by their Auth0 sub claim.
-- The `token` column is retained for the legacy CLI magic-link flow, but the
-- primary identity for the SPA is now auth0_sub (from the JWT `sub` claim).
ALTER TABLE users ADD COLUMN auth0_sub TEXT;

-- Auth0 subs are unique per tenant; enforce uniqueness so we can upsert safely.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth0_sub ON users(auth0_sub) WHERE auth0_sub IS NOT NULL;
