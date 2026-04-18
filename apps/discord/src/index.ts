import { Hono } from "hono";
import { healthRoute } from "./routes/health";
import { interactionsRoute } from "./routes/interactions";
import { oauthRoute } from "./routes/oauth";
import { guildLinkRoute } from "./routes/guild-link";
import { syncRoute } from "./routes/sync";
import { enqueueRoleSync, processRoleSyncBatch } from "./jobs/role-sync";
import type { DiscordEnv } from "./types";

const app = new Hono<{ Bindings: DiscordEnv }>();

app.route("/", healthRoute);
app.route("/", interactionsRoute);
app.route("/", oauthRoute);
app.route("/", guildLinkRoute);
app.route("/", syncRoute);

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: DiscordEnv): Promise<void> {
    const staleGuilds = ["example-guild"];
    for (const guildId of staleGuilds) {
      await enqueueRoleSync(env.ROLE_SYNC_QUEUE, {
        guildId,
        userId: "system",
        reason: "cron",
        requestedAt: new Date().toISOString()
      });
    }
  },
  async queue(batch: MessageBatch<{ guildId: string; userId: string; reason: "on_login" | "manual_refresh" | "cron"; requestedAt: string }>, env: DiscordEnv): Promise<void> {
    await processRoleSyncBatch(env.AUDIT_DB, batch);
  }
};
