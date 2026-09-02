-- Phase 12A: Subscription + billing data model.
-- Track org-level Stripe subscriptions for the control plane tier.

-- Add billing columns to orgs table.
ALTER TABLE orgs ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE orgs ADD COLUMN stripe_sub_id TEXT;
ALTER TABLE orgs ADD COLUMN subscription_status TEXT DEFAULT 'free';
-- Status values: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
ALTER TABLE orgs ADD COLUMN subscription_tier TEXT DEFAULT 'free';
-- Tier values: 'free' | 'paid'
ALTER TABLE orgs ADD COLUMN seat_count INTEGER DEFAULT 1;
ALTER TABLE orgs ADD COLUMN trial_ends_at INTEGER;
ALTER TABLE orgs ADD COLUMN current_period_end INTEGER;
ALTER TABLE orgs ADD COLUMN price_id TEXT;

-- Subscriptions history table (audit trail of all subscription events).
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL REFERENCES orgs(id),
  stripe_sub_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'paid',
  seat_count INTEGER NOT NULL DEFAULT 1,
  price_id TEXT,
  current_period_start INTEGER,
  current_period_end INTEGER,
  trial_start INTEGER,
  trial_end INTEGER,
  cancel_at_period_end INTEGER DEFAULT 0,
  canceled_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_sub_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
