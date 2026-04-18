import { Hono } from "hono";
import { enqueueRoleSync } from "../jobs/role-sync";

type SyncBindings = {
  ROLE_SYNC_QUEUE: Queue<{
    guildId: string;
    userId: string;
    reason: "manual_refresh";
    requestedAt: string;
  }>;
};

export const syncRoute = new Hono<{ Bindings: SyncBindings }>();

syncRoute.post("/sync/refresh", async (c) => {
  const guildId = c.req.query("guildId");
  const userId = c.req.query("userId");

  if (!guildId || !userId) {
    return c.json({ ok: false, error: "guildId and userId are required." }, 400);
  }

  await enqueueRoleSync(c.env.ROLE_SYNC_QUEUE, {
    guildId,
    userId,
    reason: "manual_refresh",
    requestedAt: new Date().toISOString()
  });

  return c.json({ ok: true, queued: true });
});
