import { z } from "zod";

const baseEnvSchema = z.object({
  APP_ENV: z.enum(["development", "preview", "production"]).default("development")
});

const webEnvSchema = baseEnvSchema.extend({
  DISCORD_SYNC_TTL_MINUTES: z.coerce.number().int().positive().default(15)
});

const discordEnvSchema = baseEnvSchema.extend({
  DISCORD_API_BASE: z.string().url().default("https://discord.com/api/v10"),
  ROLE_SYNC_STALE_MINUTES: z.coerce.number().int().positive().default(15)
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;
export type DiscordRuntimeEnv = z.infer<typeof discordEnvSchema>;

export function parseWebEnv(env: Record<string, string | undefined>): WebEnv {
  return webEnvSchema.parse(env);
}

export function parseDiscordEnv(
  env: Record<string, string | undefined>
): DiscordRuntimeEnv {
  return discordEnvSchema.parse(env);
}
