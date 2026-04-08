# strats.co

Site source for [strats.co](https://strats.co). **TypeScript** end to end.

**Repository:** One GitHub repo for everything—site, API, and Discord integration—as separate **deployables** in-tree (separate CI jobs when a host/runtime differs), not separate repos.

## Architecture (default)

| Piece | Choice |
|--------|--------|
| Host | [Cloudflare Pages](https://developers.cloudflare.com/pages/) + [Pages Functions](https://developers.cloudflare.com/pages/functions/) |
| Public pages | [Astro](https://docs.astro.build/en/guides/deploy/cloudflare/) |
| Interactive UI | React ([islands](https://docs.astro.build/en/guides/integrations-guide/react/) and/or a client shell e.g. `/app`) + **Tailwind CSS v4** |
| API | [Hono](https://hono.dev/) on `/api/*` (secrets, writes, webhooks) |
| Discord | See below—first-class, not an afterthought |
| Data | [D1](https://developers.cloudflare.com/d1/) for relational data; [KV](https://developers.cloudflare.com/kv/) for cache, flags, rate limits |
| Blobs | [R2](https://developers.cloudflare.com/r2/) only when uploads/exports need it |
| Config | [Wrangler](https://developers.cloudflare.com/workers/wrangler/) bindings |

### Discord

Discord exposes two main integration shapes—plan for **both** up front so we do not paint ourselves into a corner.

1. **[Interactions](https://discord.com/developers/docs/interactions/receiving-and-responding)** (slash commands, buttons, modals, selects): Discord `POST`s to a public **Interactions Endpoint**. Handle on the **same stack** as the site: **Hono** route (e.g. `/interactions` or under `/api/discord/...`), verify the request with the app’s **public key**, respond with JSON or deferred updates. **Fits Workers/Pages Functions** well; use **KV** for idempotency / deduping retries if needed.

2. **[Gateway](https://discord.com/developers/docs/topics/gateway)** (always-on events: messages, presence, guild lifecycle without a user invoking a slash command): needs a **long-lived WebSocket** client. **Do not run that on Workers.** Keep a small **Node (or Bun) process** in this repo (e.g. `apps/discord-gateway`) and deploy it to a process host (Fly.io, Railway, etc.). It should treat **D1-backed state** as owned by the **HTTP API**—call **`/api/*`** (or an internal route + service secret) instead of opening a second database writer path unless we deliberately introduce one.

**Shared contract:** One **TypeScript** surface for types/commands between site, API, and Discord handlers (`packages/shared` or similar when we scaffold). **Secrets:** Discord `DISCORD_PUBLIC_KEY`, `DISCORD_APPLICATION_ID`, `DISCORD_BOT_TOKEN` (gateway only), and interaction signing keys live in **Wrangler secrets** / the gateway host’s env—not in client bundles.

**Hono** = HTTP router in Functions. **Astro** = site framework. They stack; Hono is redundant if you later move the whole app to **Remix on Cloudflare** (loaders/actions + D1; skip Hono unless you split an API Worker).

**UI reference:** **TailAdmin React Pro** (React + Tailwind v4 dashboard kit) — reuse components/tokens; do not treat it as the site shell.

**Tooling:** ESLint + typescript-eslint, strict TS. Use Astro/Vite/Node versions that match Cloudflare’s [supported runtimes](https://developers.cloudflare.com/workers/runtime-apis/nodejs/).

## Environment variables

- **`.env.example`** — full list of keys; copy to **`.env`** for local Astro/Vite/scripts.
- **`.dev.vars.example`** — copy to **`.dev.vars`** for **[Wrangler](https://developers.cloudflare.com/workers/wrangler/)** local dev (Pages/Worker env). Same secret names as above; `.dev.vars` is gitignored.
- **Deployed:** `wrangler secret put <NAME>` (and [Pages project env](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables) for build-time vars). Never commit real values.

**Cloudflare in Cursor:** use **Wrangler** in the terminal (`wrangler login`, `wrangler whoami`, `wrangler secret put …`). Use the **Cloudflare Bindings** MCP (accounts, D1, KV, R2, workers) and **Cloudflare Docs** MCP when wiring resources; **Workers Builds** / **Observability** MCPs when debugging deploys and logs.
