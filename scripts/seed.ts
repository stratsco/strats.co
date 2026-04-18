const gameSeed = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "eve-online",
  name: "EVE Online"
};

const guildSeed = {
  id: "22222222-2222-4222-8222-222222222222",
  gameId: gameSeed.id,
  ownerUserId: "33333333-3333-4333-8333-333333333333",
  slug: "starter-guild",
  name: "Starter Guild",
  status: "draft"
};

console.log("Seed scaffold (placeholder):");
console.log(JSON.stringify({ gameSeed, guildSeed }, null, 2));
console.log(
  "\nConnect this script to Payload or direct Postgres writes once env bindings are provisioned."
);
