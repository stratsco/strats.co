CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL,
  surface_type TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  body_json JSONB NOT NULL,
  is_canonical BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, slug, surface_type)
);

CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY,
  source_path TEXT UNIQUE NOT NULL,
  destination_path TEXT NOT NULL,
  status_code SMALLINT NOT NULL DEFAULT 301,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
