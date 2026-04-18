CREATE TABLE IF NOT EXISTS discord_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  guild_id TEXT,
  user_id TEXT,
  details TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_discord_audit_log_created_at
  ON discord_audit_log(created_at);
