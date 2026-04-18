export type CollectionName =
  | "games"
  | "guilds"
  | "memberships"
  | "discordLinks"
  | "roleMappings"
  | "guides";

type CollectionScaffold = {
  slug: CollectionName;
  description: string;
  isTenantScoped: boolean;
};

type PayloadScaffoldConfig = {
  db: {
    provider: "postgres";
    pooling: "hyperdrive";
    maxUses: 1;
  };
  plugins: {
    multiTenant: {
      enabled: boolean;
      tenantCollection: "games";
    };
  };
  collections: CollectionScaffold[];
};

export const payloadScaffoldConfig: PayloadScaffoldConfig = {
  db: {
    provider: "postgres",
    pooling: "hyperdrive",
    maxUses: 1
  },
  plugins: {
    multiTenant: {
      enabled: true,
      tenantCollection: "games"
    }
  },
  collections: [
    {
      slug: "games",
      description: "Top-level game tenant records.",
      isTenantScoped: false
    },
    {
      slug: "guilds",
      description: "First-class guild entities with verification lifecycle.",
      isTenantScoped: true
    },
    {
      slug: "memberships",
      description: "User-to-guild relationship with role tiers.",
      isTenantScoped: true
    },
    {
      slug: "discordLinks",
      description: "External Discord server linkage and metadata.",
      isTenantScoped: true
    },
    {
      slug: "roleMappings",
      description: "Discord role to Strats permission mappings.",
      isTenantScoped: true
    },
    {
      slug: "guides",
      description: "Editorial, guild, and community content records.",
      isTenantScoped: true
    }
  ]
};
