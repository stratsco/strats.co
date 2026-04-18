# Strats.co — Plan Summary (v3, all-Cloudflare)

A multi-game knowledge hub with first-class guilds, deep Discord integration, and a three-surface content model — built entirely on Cloudflare's developer platform, zero external infrastructure at MVP.

---

## The Thesis in One Paragraph

Strats differentiates from Maxroll (editorial) and Fextralife (community wiki) by adding a third pillar neither has: **first-class guilds with Discord integration**. The platform supports editorial canonical content, guild-owned content, and community content as three distinct surfaces with their own rules. Built on Cloudflare's developer platform end-to-end, Strats inherits global edge distribution, zero egress fees, and a coherent set of primitives (Workers, D1, R2, Durable Objects, Hyperdrive, Images) that lets a solo developer ship what used to require a platform team.

---

## The Cloudflare Stack — What Goes Where

| Layer | Cloudflare Product | Purpose |
|---|---|---|
| **Frontend + CMS** | Workers (via OpenNext adapter) | Next.js + Payload in one Worker, globally distributed |
| **Primary database** | Hyperdrive → Postgres (Neon / Supabase / PlanetScale) | CMS content, guilds, users, permissions |
| **Lightweight data** | D1 (SQLite) | Per-game reference data, cached computations, analytics |
| **Media** | R2 | User uploads, guild avatars, screenshots — zero egress |
| **Image delivery** | Images (transform-only mode) | On-the-fly resize/format from R2 — avoid storage fees |
| **Real-time state** | Durable Objects | Tool sessions, live planner collaboration |
| **Async jobs** | Queues + Workers | Role sync batches, email, content processing |
| **KV** | Workers KV | Session cache, permission cache, short-lived flags |
| **Scheduled work** | Workers Cron Triggers | Periodic role resync safety net, stale cache refresh |
| **Network** | DNS + CDN + WAF | Baseline for every Cloudflare site, included |
| **Auth gateway** | Access (optional) | Staff-only admin paths, beta gates |
| **Analytics** | Web Analytics | Privacy-friendly, no cookies, included free |

**Everything runs on Cloudflare. Zero external infrastructure.**

**Minimum viable cost at launch:** Workers Paid ($5/month). Everything else has a free tier generous enough to last through early traffic. R2 storage at $0.015/GB is negligible for launch scale.

---

## Deployment Architecture

### Main app (Next.js + Payload)

Deploy via **OpenNext adapter** (`@opennextjs/cloudflare`). This is the officially supported path as of 2026 — not Pages, which is being deprecated for full-stack Next.js.

```
┌─────────────────────────────────────────────────┐
│  Cloudflare Worker: strats-web                  │
│  ├── Next.js frontend (SSR, ISR)                │
│  ├── Payload CMS (admin + API)                  │
│  ├── Bindings:                                  │
│  │   ├── HYPERDRIVE → Postgres                  │
│  │   ├── MEDIA_BUCKET → R2                      │
│  │   ├── IMAGES → Cloudflare Images             │
│  │   ├── SESSIONS → KV                          │
│  │   └── TOOL_STATE → Durable Objects namespace │
│  └── Routes: *.strats.co                        │
└─────────────────────────────────────────────────┘
```

**Why OpenNext over Pages:** Pages is being phased out for full-stack Next.js. Workers + OpenNext is the path forward. Both Cloudflare and the Next.js ecosystem are converging here. A single `wrangler deploy` ships the whole thing.

**Key config:** `nodejs_compat` flag required, `compatibility_date` recent. Payload ships with `maxUses: 1` in its Postgres pool when using Hyperdrive (Hyperdrive handles pooling).

### Discord infrastructure (all-Cloudflare)

**Everything runs on Workers. No VPS, no gateway websocket, no external services.**

The key insight: most of what Strats needs from Discord does NOT require a persistent websocket connection to Discord's gateway. The gateway is only necessary for *real-time events* (e.g., "user X's role changed in Discord right this second"). For a content platform with <1k active users at launch, near-real-time sync via REST is equivalent.

```
┌─────────────────────────────────────┐
│  Cloudflare Worker: strats-discord  │
│  ├── Slash commands (HTTP)          │
│  ├── OAuth login + callbacks        │
│  ├── Server linking verification    │
│  ├── Push roles to Discord (REST)   │
│  ├── Pull user roles on login       │
│  ├── Cron-triggered batch resync    │
│  └── Bot audit log → D1             │
└─────────────────────────────────────┘
```

**Sync strategy without gateway:**

1. **On-login resync** (primary): when a user loads any Strats page, if their cached permissions are >15min old, Worker calls Discord REST (`GET /guilds/{id}/members/{user}`), resolves roles, updates KV cache. Sub-100ms added to cold page load.
2. **Cron-triggered full sync** (safety net): Workers Cron runs every 30 min, walks active guilds, refreshes any stale cache entries. Guarantees eventual consistency.
3. **Interaction-triggered sync** (on-demand): `/strats refresh` slash command forces immediate resync for that user.

**Net effect for users:** role changes propagate within 15 minutes via on-login, or immediately via `/strats refresh`. Indistinguishable from real-time for practical purposes.

**Why not real-time gateway on Durable Objects?** Technically possible — Discord lifted its IP block on Cloudflare Workers connecting to the gateway around 2023, and DOs can hold persistent websockets. But: (a) DOs don't hibernate on *outbound* websocket connections, so a gateway DO stays pinned in memory and incurs constant duration charges (kills the cost advantage), (b) every deploy restarts every DO, disconnecting the gateway, (c) no mature library for Discord gateway on Workers runtime — you'd be porting discord.js yourself.

**Future escape hatch (if real-time ever becomes essential):**
- Option A: Small Fly.io or Hetzner node ($5/month) runs discord.js gateway, publishes events to a Cloudflare Queue. Workers do everything else.
- Option B: Port gateway to Durable Object (wait for hibernation support on outbound websockets).

Don't build either until a real user need forces it.

**OAuth scopes (minimum):** `identify`, `guilds`, `guilds.members.read`, optional `email`.

**Bot permissions at onboarding:** view channels only. Role management added opt-in per feature.

**Privileged intents:** `GuildMembers` would be required for gateway-based sync. Since we're not using gateway, we only need REST access. **No privileged intent approval needed.** This also means no 100-server verification gate — nice simplification.

---

## Database Strategy

**Postgres via Hyperdrive, not D1** for the main app. Here's why, and when to use each.

### Primary: Postgres + Hyperdrive

- Use a managed Postgres provider (Neon, Supabase, PlanetScale Postgres)
- Put Hyperdrive in front of it — connection pooling + query cache, included with Workers Paid
- Payload has first-class Postgres support; no custom adapter needed
- Hyperdrive turns your single-region Postgres into something that *feels* globally distributed

**Why not D1 for main DB:** D1 is SQLite. Works great for simple apps, but you'll hit scale limits on a content-heavy multi-tenant site. Complex queries, full-text search, relational joins across tenants — Postgres handles all this cleanly. Cloudflare's own Payload template uses D1 because it's the single-click path, but for Strats specifically, the Postgres path is worth the extra setup.

**Provider pick:** Neon is the natural fit — serverless Postgres, scale-to-zero, branching for preview deploys, cheap. Supabase also works if you want the broader platform.

### Secondary: D1 where it makes sense

D1 is great for:
- **Per-game reference data** that doesn't change often (item databases, skill lists) — fast reads, no connection overhead
- **Analytics rollups** — query logs, tool usage stats
- **Audit logs** — bot push actions, permission changes, moderation history
- **Cache warming tables** — precomputed leaderboards, tier rankings

Split concerns: Payload owns the "write" path to Postgres. Background jobs can snapshot to D1 for fast reads at the edge.

### KV for sessions and ephemeral data

- Session cache (5–15 min TTL)
- Resolved permission cache (invalidate on role change)
- Feature flags
- Rate limit counters

KV is eventually consistent — don't use it as a source of truth for anything that matters.

---

## Media & Images

### R2 for everything uploaded

- Guild avatars, banners, screenshots, user-uploaded build images, imported game assets
- Zero egress means you don't pay when images are viewed — huge for a gaming site with image-heavy pages
- S3-compatible API; Payload has an R2 adapter

### Cloudflare Images — transform-only mode

Critical detail from the research: **never store images *in* Cloudflare Images if R2 is an option.** Images charges separately for storage, delivery, and transformation. Storage in Images adds 25–50% to your bill with no benefit.

Correct pattern:
1. Store originals in R2
2. Use Cloudflare Images transformations to resize/reformat on the fly
3. Transformed results cache at the edge — repeat requests don't incur charges
4. Pay only per unique transformation (~$0.50 per 1,000)

This gives you responsive images, format negotiation (WebP/AVIF), art direction, and CDN delivery — cheaply.

### When to consider alternatives

Past ~5k unique images with 3+ sizes each, BunnyCDN's flat-rate optimizer ($9.50/month) becomes cheaper. Revisit if image transformation bills get uncomfortable at scale.

---

## Real-Time Features — Durable Objects

Strats doesn't need real-time for most pages, but a few features benefit hugely:

- **Tool sessions:** collaborative build planning — multiple guild members editing a loadout together. One DO per session, WebSockets for presence + state sync.
- **Guild dashboards:** live member status, raid signup updates. One DO per guild.
- **Draft content lock:** two authors editing the same guide — DO holds the lock, broadcasts edits.
- **Discord bot state (Workers side):** per-guild configuration cache, rate limit budgets, in-flight operation tracking.

Each DO has an embedded SQLite database. Use for state that needs coordination, not for persistent storage of important data (that's Postgres).

**Don't over-reach:** most pages don't need DOs. Reach for them only when the alternative is "poll Postgres every 2 seconds from every client."

---

## Jobs & Async Work — Queues

Cloudflare Queues for:
- Discord role sync jobs (enqueued by gateway service)
- Push operations to Discord (rate-limited, batched)
- Email sends
- Content post-processing (generate OG images, extract structured data)
- Webhook retries

Built-in: dead-letter queues, retries, batching, backpressure. Replaces BullMQ + Redis from the original plan. One less service to run.

---

## Performance & Caching Strategy

Cloudflare's cache is the single biggest performance lever.

### Rendering modes

- **Static content** (guides, database entries, guild public pages): ISR with long revalidation, cached at edge. `revalidate` on publish via Payload hooks.
- **Dynamic content** (dashboards, editor, user settings): SSR, noindex, no cache.
- **Tool pages**: SSR shell with game data, client-side hydration for interaction. Shell caches; state lives in DO or client.
- **Saved artifacts** (build URLs, loadout permalinks): ISR, cache aggressively, invalidate on author update.

### Cache API for tool artifacts

Every saved build/loadout is an indexable page. Use the Workers Cache API:
- First request: SSR, cache with 1-hour edge TTL
- Subsequent requests: cache hit, sub-50ms response globally
- Author edit: purge that specific URL via Cache API
- Purge-by-tag for bulk invalidations (e.g., patch release invalidates all D4 tool pages)

### Smart Placement

Workers can be placed *near the database* instead of near the user for DB-heavy requests — reduces Hyperdrive query latency from 20–30ms to 1–3ms. Toggle in `wrangler.jsonc`. Use for admin/editor paths (DB-heavy), not public content paths (already cached).

---

## Architecture & Stack (Updated)

**Foundation:** Payload CMS 3.x + Next.js, running on Cloudflare Workers via OpenNext adapter.

**Multi-tenancy:** Payload's official Multi-Tenant plugin. Each game is a tenant.

**Authentication:** Discord OAuth as primary. Sessions cached in KV. Discord account = Strats account by default.

**Why this stack:** Avoids reinventing CMS / rich text / media. Cloudflare handles everything you'd otherwise pay AWS/Vercel to do, at a fraction of the cost, with better egress economics for a media-heavy site.

---

## Guild Model — First-Class Entity (unchanged)

A guild is its own object, not a wrapper around a Discord server.

- **Guild** → belongs to 1+ Games, has 1 owner, many officers/members
- **DiscordLink** → a guild can link 0, 1, or many Discord servers (alliance case)
- **Membership** → user ↔ guild, with role tier (owner, officer, member, applicant, alumni)
- **RoleMapping** → per Discord server: "this Discord role = this Strats permission"

Users can belong to multiple guilds in the same game. UI needs an "acting as" switcher.

---

## Guild Onboarding — Progressive Verification (unchanged)

**Tier 0 — Draft (instant)** → noindex, provisional name, 5 collaborators max
**Tier 1 — Claimed (Discord-linked)** → pretty URL, public, indexed, role mapping unlocked
**Tier 2 — Verified (community signal)** → verified badge, protected name, full features

Name scope: per-game. Reserved list of famous names for manual review.

Schema fields from day one: `status`, `verificationTier`, `claimedAt`, `verifiedAt`, `lastActivityAt`, `protectedName`, `disputeState`, `ownerUserId`, `ownershipHistory`.

---

## Discord Bot — All-Cloudflare (updated)

**Everything on Workers. No external services.**

- Slash commands via HTTP interactions endpoint
- OAuth callbacks for user login and server linking
- Role sync via Discord REST (pulled on user login + Cron safety net)
- Push operations (add/remove roles) via Discord REST, triggered by Strats events
- Rate-limit budgeting per Discord route, in-memory via Durable Object if needed
- Audit log to D1

**Sync model (no gateway needed):**
- **On-login resync** (primary): cache check in KV, refresh from Discord REST if stale (>15min)
- **Cron safety net**: Workers Cron every 30min walks active guilds, refreshes stale entries
- **Manual refresh**: `/strats refresh` slash command for user-triggered updates

**OAuth scopes (minimum):** `identify`, `guilds`, `guilds.members.read`, optional `email`.

**Bot permissions at onboarding:** view channels only. Role management added opt-in per feature.

**No privileged intents required** — we're using REST only, not gateway events. This also sidesteps Discord's 100-server verification gate for `GUILD_MEMBERS` intent.

**Push discipline:** every push answers 4 questions in code — (1) admin enabled this feature? (2) bot role above target? (3) under rate limit? (4) idempotent retry? All pushes logged to admin-viewable audit table in D1.

**Future escape hatch (only if real-time becomes essential):**
- Path A: Small Fly.io/Hetzner node ($5/month) runs discord.js gateway, publishes to Cloudflare Queue
- Path B: Port gateway to Durable Object (wait for outbound-websocket hibernation feature)
- Don't build either until a real user need forces it

---

## Permission Model (unchanged)

**Four role tiers:** Platform → Game/Tenant → Guild → Content

**Resolution order (top-down):**
1. Platform bans/suspensions
2. Explicit page-level grants
3. Guild role
4. Game role
5. Platform default

**Single `resolvePermissions(user, resource)` service.** Cache results in KV with invalidation on role change.

---

## Content — Three Surfaces (unchanged)

| Surface | Owner | Editors | Visibility | Byline | Review |
|---|---|---|---|---|---|
| **Editorial** | Appointed author | Author + game leads + admins | Public, indexed, canonical | Prominent | Direct publish |
| **Guild** | The guild | Guild members per role | Public or private | Guild name | Guild's own rules |
| **Community** | The community | Trusted registered users | Public | Contributor | Queue for protected |

**Canonical guide conflict resolution:** don't merge, don't pick. Both exist, labeled, cross-linked.

**Author tiers:** Contributor → Author → Game Lead → Platform Admin. **Invitation-only** upward path.

**Revision discipline:** Payload versioning on from day one. Full diffs, attribution, rollback, audit trails.

---

## SEO & URL Strategy (unchanged, with Cloudflare-specific notes)

**Subdirectory** architecture: `strats.co/eve-online/...`, not `eve.strats.co`.

**URL structure:**
```
strats.co/                                    → hub
strats.co/[game]/                             → game homepage
strats.co/[game]/guides/[slug]                → editorial
strats.co/[game]/db/[category]/[slug]         → database
strats.co/[game]/tools/[tool]                 → tools
strats.co/[game]/news/[slug]                  → news
strats.co/[game]/guilds/[guild-slug]          → guild home
strats.co/[game]/guilds/[guild-slug]/[page]   → guild page
strats.co/u/[username]                        → user profile
```

**Cloudflare-specific SEO wins:**
- DNS, CDN, HTTP/3, Brotli, automatic image optimization — all on by default
- Argo Smart Routing optional for dynamic routes (probably skip at launch)
- Web Analytics (free, privacy-friendly) replaces Google Analytics if you want

**Sitemaps:** generated by Next.js, cached at edge. Split by game.

**URL migration infrastructure:** Payload versioning + a `Redirects` collection in Payload. Worker middleware consults redirects before routing.

---

## Tools — The Moat (unchanged strategy, Cloudflare-powered execution)

**Defensibility tiers** (S → C):
- Planners / builders (saved state, shareable)
- Calculators / solvers
- Trackers
- Databases with UX
- Guild-specific tools
- Content tools

**Tools-as-pages SEO on Cloudflare:**
- Every saved build lives at its own URL
- SSR with edge caching via Cache API
- Purge on author edit
- Durable Object for live collaboration if multi-user editing matters

**Data pipeline:** background Workers ingest from game APIs / community sources, normalize into Postgres (source of truth) and D1 (per-game fast-read replicas). Version per patch. Single source for all tools.

**First tools sequencing:**
1. One killer Tier S tool for launch game
2. Supporting database with good UX
3. One Tier A calculator that differentiates
4. One guild-specific tool

---

## Launch Strategy (unchanged)

**Game archetype fit** (best → worst):
- MMOs (WoW, FFXIV, ESO): ✅ best overall
- EVE Online: ✅ strongest specific — S-tier guilds, great API
- Survival / sandbox: ✅ underrated
- Competitive team games: ⚠️ viable for team niche only
- Upcoming MMOs: ⚠️ highest risk/reward
- ARPGs: ❌ Maxroll's home turf
- Gacha: ❌ wrong pattern

**MVP discipline:**
- One game populated
- 3 editorial authors you personally recruited
- One Tier-S tool, polished
- Basic guild pages (Discord link, on-login role sync, guild pages)
- **100% Cloudflare — zero external infrastructure**
- **Skip at launch:** community editing, private pages, real-time gateway sync, advanced features

**90-day plan:**
- Month 1: Closed beta, 3–5 partner guilds, 3 authors
- Month 2: Open signups, ship 2 features the beta asked for
- Month 3: Retention evaluation (D/WAU per user is the metric)
- Months 4–6: Second game only if retention proves out

---

## Cost Model (updated — no external infra)

**Monthly spend at launch (first 3 months, ~1k users):**

| Item | Cost |
|---|---|
| Cloudflare Workers Paid | $5 |
| Neon Postgres (free tier) | $0 |
| R2 storage (~10GB) | $0.15 |
| Cloudflare Images (transforms) | ~$1–5 |
| Domain | ~$1/month amortized |
| **Total** | **~$7–15/month** |

**Monthly spend at modest scale (10k users, 50k sessions/mo):**

| Item | Cost |
|---|---|
| Cloudflare Workers Paid | $5 + usage (~$10–20) |
| Neon Postgres | $19 (Launch plan) |
| R2 storage + operations | ~$5 |
| Cloudflare Images | ~$20 |
| **Total** | **~$50–70/month** |

The zero egress on R2 is the unsung hero. A content site with heavy images on AWS S3 at similar scale would be paying hundreds in bandwidth alone. And zero external services means one less provider, one less bill, one less set of credentials, one less thing to monitor.

---

## Monetization (unchanged)

Build with `entitlements` layer from day one, even if free at launch.

- Editorial → ads/sponsorship
- Guild features → subscriptions (private pages, custom subdomain, analytics, ad-free)
- Community → SEO long-tail

Guild subscriptions easier to sell than individual subs (one officer pays, guild benefits).

Billing provider: **Stripe** (you're already connected). Stripe's Cloudflare Workers integration is straightforward — webhook endpoint on a Worker, store subscription state in Postgres.

---

## What to Watch / Gotchas

Things the research surfaced that could bite:

- **Payload-on-Cloudflare is still maturing.** The official template is new (late 2025). Beta features land often; pin versions.
- **Worker size limits.** The Payload+Next.js bundle was >3MB at template release, requiring the paid plan. Keep an eye on bundle size; dead-code elimination matters.
- **Next.js 14 support being dropped Q1 2026.** Build on Next.js 15 or 16. Don't start on 14.
- **Node.js compatibility is improving but not complete.** Some npm packages still won't work on Workers. Test early, before committing to a dependency.
- **Discord REST rate limits** apply to all your role-sync calls. Per-guild limits are real. Batch resyncs through a Queue with throttling, don't fan-out from a single Worker invocation.
- **If you ever need gateway:** Durable Objects can hold persistent outbound websockets, but they don't hibernate on outbound connections (open feature request at `cloudflare/workerd#4864`). Every deploy disconnects all DOs and re-IDENTIFY'ing with Discord burns rate-limit budget. Plan around this if/when you go that route.
- **Vinext is interesting but don't bet on it.** Cloudflare shipped a Next.js reimplementation on Vite (Feb 2026). Promising but experimental. Stay on OpenNext + Next.js proper until Vinext has a track record.
- **Hyperdrive caching requires understanding.** It caches prepared statements; some ORMs (Kysely, raw sql.unsafe) disable this silently. Payload's default Postgres adapter works well; watch if you add custom queries.

---

## Open Questions / Next Threads

- "Acting as" UX for users in multiple guilds
- Permission resolver service deep design
- Data pipeline architecture (the infra that enables tool #3+)
- Dispute & name-conflict resolution flow
- **Specific launch game decision**
- Gateway-service-or-not decision at MVP

---

## The Spine, in Three Lines (updated)

1. **Payload + Next.js on Cloudflare Workers** (OpenNext), Postgres via Hyperdrive, R2 for media, Images for transforms, D1 for fast-read replicas, Durable Objects where real-time matters. **Zero external infrastructure.**
2. **Guilds are first-class.** Discord linked but not synonymous. Bot is HTTP-only on Workers; sync via REST on login + Cron safety net. Real-time gateway deferred until demand forces it.
3. **Three content surfaces** (editorial, guild, community). Tools are the moat. Launch one game, ship one killer tool, prove retention before expanding.
