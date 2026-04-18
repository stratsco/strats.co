import type { RoleSyncJob } from "../types";
import { insertAuditLog } from "../repositories/audit-log-repository";

export async function enqueueRoleSync(
  queue: Queue<RoleSyncJob>,
  payload: RoleSyncJob
): Promise<void> {
  await queue.send(payload);
}

export async function processRoleSyncBatch(
  db: D1Database,
  batch: MessageBatch<RoleSyncJob>
): Promise<void> {
  for (const message of batch.messages) {
    await insertAuditLog(db, {
      action: "role_sync_queued",
      guildId: message.body.guildId,
      userId: message.body.userId,
      details: message.body.reason,
      createdAt: new Date().toISOString()
    });
    message.ack();
  }
}
