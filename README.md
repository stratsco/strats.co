# strats.co

Site source for [strats.co](https://strats.co). **TypeScript** end to end.

## Architecture (default)

| Piece | Choice |
|--------|--------|
| Host | [Cloudflare Pages](https://developers.cloudflare.com/pages/) + [Pages Functions](https://developers.cloudflare.com/pages/functions/) |
| Public pages | [Astro](https://docs.astro.build/en/guides/deploy/cloudflare/) |
| Interactive UI | React ([islands](https://docs.astro.build/en/guides/integrations-guide/react/) and/or a client shell e.g. `/app`) + **Tailwind CSS v4** |
| API | [Hono](https://hono.dev/) on `/api/*` (secrets, writes, webhooks) |
| Data | [D1](https://developers.cloudflare.com/d1/) for relational data; [KV](https://developers.cloudflare.com/kv/) for cache, flags, rate limits |
| Blobs | [R2](https://developers.cloudflare.com/r2/) only when uploads/exports need it |
| Config | [Wrangler](https://developers.cloudflare.com/workers/wrangler/) bindings |

**Hono** = HTTP router in Functions. **Astro** = site framework. They stack; Hono is redundant if you later move the whole app to **Remix on Cloudflare** (loaders/actions + D1; skip Hono unless you split an API Worker).

**UI reference:** **TailAdmin React Pro** (React + Tailwind v4 dashboard kit) — reuse components/tokens; do not treat it as the site shell.

**Tooling:** ESLint + typescript-eslint, strict TS. Use Astro/Vite/Node versions that match Cloudflare’s [supported runtimes](https://developers.cloudflare.com/workers/runtime-apis/nodejs/).
