export type GuildStatus = "draft" | "claimed" | "verified" | "suspended";
export type VerificationTier = 0 | 1 | 2;
export type MembershipTier =
  | "owner"
  | "officer"
  | "member"
  | "applicant"
  | "alumni";

export type ContentSurface = "editorial" | "guild" | "community";

export type PermissionScope =
  | "platform"
  | "game"
  | "guild"
  | "content"
  | "none";

export type RoleMapping = {
  discordRoleId: string;
  stratsPermission: PermissionScope;
};

export type GuildLifecycle = {
  status: GuildStatus;
  verificationTier: VerificationTier;
  protectedName: boolean;
  disputeState: "none" | "under_review" | "escalated" | "resolved";
};
