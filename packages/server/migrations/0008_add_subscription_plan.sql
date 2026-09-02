-- Phase 12G: Add plan column for Growth/Pro tier distinction.
-- Maps to Stripe price IDs configured in wrangler.toml.

ALTER TABLE orgs ADD COLUMN plan TEXT DEFAULT 'free';
-- Plan values: 'free' | 'growth' | 'pro'
-- 'free' = CLI-only, no cloud access
-- 'growth' = $5/seat/month — versioning, audit feed, CSV export, limited AI
-- 'pro' = $12/seat/month — unlimited AI, live sessions, advanced analytics

ALTER TABLE subscriptions ADD COLUMN plan TEXT NOT NULL DEFAULT 'paid';
-- Plan values mirror orgs.plan: 'growth' | 'pro'
