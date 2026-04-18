export type DiscordEnv = {
  APP_ENV: string;
  DISCORD_API_BASE: string;
  ROLE_SYNC_STALE_MINUTES: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_BOT_TOKEN: string;
  SESSIONS: KVNamespace;
  AUDIT_DB: D1Database;
  ROLE_SYNC_QUEUE: Queue<RoleSyncJob>;
};

export type RoleSyncJob = {
  guildId: string;
  userId: string;
  reason: "on_login" | "manual_refresh" | "cron";
  requestedAt: string;
};

export type AuditEvent = {
  action: string;
  guildId?: string;
  userId?: string;
  details?: string;
  createdAt: string;
};
