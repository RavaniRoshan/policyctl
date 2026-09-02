-- Persist AI analysis and authoring results for each org.
-- Populated by POST /api/ai/analyze and POST /api/aii/author.
CREATE TABLE ai_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL REFERENCES orgs(id),
  kind TEXT NOT NULL,           -- 'analyze' | 'author'
  input_text TEXT NOT NULL,     -- the user's prompt / diff
  output_json TEXT NOT NULL,    -- the full AI response as JSON
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_ai_insights_org ON ai_insights(org_id);
CREATE INDEX idx_ai_insights_created ON ai_insights(org_id, created_at DESC);
