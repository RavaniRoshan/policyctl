-- Adds a per-org incoming webhook URL for daily compliance reports.
-- Consumers paste a Slack/Discord incoming webhook URL; the Worker POSTs
-- a JSON summary after each daily report + on-demand regeneration.
-- Null = webhook delivery disabled (default for all existing orgs).

ALTER TABLE orgs ADD COLUMN report_webhook_url TEXT;
