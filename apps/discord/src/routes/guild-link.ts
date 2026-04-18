import { Hono } from "hono";
import { z } from "zod";
import { insertAuditLog } from "../repositories/audit-log-repository";

const guildLinkSchema = z.object({
  guildId: z.string(),
  discordServerId: z.string(),
  verifiedByUserId: z.string()
});

export const guildLinkRoute = new Hono<{ Bindings: { AUDIT_DB: D1Database } }>();

guildLinkRoute.post("/guilds/:id/link", async (c) => {
  const body = guildLinkSchema.parse(await c.req.json());
  const guildId = c.req.param("id");

  await insertAuditLog(c.env.AUDIT_DB, {
    action: "guild_linked",
    guildId,
    userId: body.verifiedByUserId,
    details: `discord_server_id=${body.discordServerId}`,
    createdAt: new Date().toISOString()
  });

  return c.json({
    ok: true,
    guildId,
    linkedDiscordServerId: body.discordServerId
  });
});
