export type PermissionScope =
  | "platform"
  | "game"
  | "guild"
  | "content"
  | "none";

export type PermissionContext = {
  userId: string;
  resourceId: string;
  tenantId?: string;
  guildId?: string;
};

export type ResolvedPermissions = {
  canRead: boolean;
  canWrite: boolean;
  canModerate: boolean;
  scope: PermissionScope;
  cacheKey: string;
};

export function buildPermissionCacheKey(ctx: PermissionContext): string {
  const tenant = ctx.tenantId ?? "global";
  const guild = ctx.guildId ?? "none";
  return `permissions:${ctx.userId}:${tenant}:${guild}:${ctx.resourceId}`;
}

export async function resolvePermissions(
  ctx: PermissionContext
): Promise<ResolvedPermissions> {
  const cacheKey = buildPermissionCacheKey(ctx);

  return {
    canRead: true,
    canWrite: false,
    canModerate: false,
    scope: "none",
    cacheKey
  };
}
