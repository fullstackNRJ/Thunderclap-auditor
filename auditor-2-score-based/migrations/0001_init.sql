-- Migration: Initial Schema for Audit Reports and App Config
CREATE TABLE IF NOT EXISTS audit_reports (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  messaging_score INTEGER NOT NULL,
  section_scores TEXT NOT NULL, -- JSON string
  evidence TEXT NOT NULL,       -- JSON string
  ai1_prompt TEXT,
  ai1_response TEXT,
  ai2_prompt TEXT,
  ai2_response TEXT,
  prioritized_fixes TEXT NOT NULL, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default configuration placeholders
INSERT OR IGNORE INTO app_config (key, value) VALUES ('ai1_system_prompt', 'You are an expert marketing auditor...');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('ai2_system_prompt', 'Based on this audit score...');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('scoring_weights', '{"positioning": 20, "value": 20, "icp": 20, "clarity": 15, "proof": 15, "cta": 10}');
