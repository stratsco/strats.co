const requiredCloudflareBindings = [
  "HYPERDRIVE",
  "MEDIA_BUCKET",
  "SESSIONS",
  "AUDIT_DB",
  "ROLE_SYNC_QUEUE"
];

const setupSteps = [
  "Create a Hyperdrive config that points to Neon Postgres.",
  "Create R2 bucket `strats-media`.",
  "Create KV namespace for `SESSIONS`.",
  "Create Durable Object namespace for tool state when collaborative tooling starts.",
  "Create D1 database for `AUDIT_DB`.",
  "Create queue `strats-role-sync` and add discord worker as consumer.",
  "Set Discord secrets with `wrangler secret put`."
];

console.log("Strats scaffold bootstrap checklist\n");
console.log("Required bindings:");
for (const binding of requiredCloudflareBindings) {
  console.log(`- ${binding}`);
}

console.log("\nCloudflare setup steps:");
for (const step of setupSteps) {
  console.log(`- ${step}`);
}
