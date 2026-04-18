type CloudflareEnv = {
  HYPERDRIVE: {
    connectionString: string;
  };
};

export function getPostgresConnectionString(env: CloudflareEnv): string {
  if (!env.HYPERDRIVE?.connectionString) {
    throw new Error("Missing HYPERDRIVE binding connection string.");
  }

  return env.HYPERDRIVE.connectionString;
}
