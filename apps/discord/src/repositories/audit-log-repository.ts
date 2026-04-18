import type { AuditEvent } from "../types";

export async function insertAuditLog(
  db: D1Database,
  event: AuditEvent
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO discord_audit_log (action, guild_id, user_id, details, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5)`
    )
    .bind(
      event.action,
      event.guildId ?? null,
      event.userId ?? null,
      event.details ?? null,
      event.createdAt
    )
    .run();
}
