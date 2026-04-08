# StratsCo

This repository was reset in April 2026. The previous codebase was a **Jekyll** marketing site for **StratsCo**—positioned as a Discord community for people who play massively multiplayer games. It lived at [https://strats.co](https://strats.co).

**What used to be here (for archaeology only):**

- Standard Jekyll layout: `_config.yml`, `Gemfile`, collections for static pages, blog-style **news** under `/news/`, **game** landing pages under `/game/:slug/`, and **short redirects** under `/x/:slug/` (affiliate/partner links, Discord, etc.).
- A Bootstrap-based theme with SCSS, vendor JS, and a single demo post from 2018.

Nothing from that stack remains in the tree on purpose. The next iteration of this repo will define a new purpose and stack for strats.co.

---

## Target platform: Cloudflare

**Goals:** Cloudflare-native hosting, **TypeScript** everywhere it helps, edge-friendly runtimes, low idle cost.

**Vocabulary:** **[Hono](https://hono.dev/)** is an HTTP **router/middleware** for Workers/Pages Functions. **[Astro](https://docs.astro.build/en/guides/deploy/cloudflare/)** and **[Remix](https://remix.run/docs/en/main/guides/deployment#cloudflare)** are **application frameworks** (rendering, routing, data loading). Hono complements a static or Astro front end; it is usually **redundant** inside Remix, which already owns the server entry.

### Recommended default (marketing + content first, interactive app where needed)

Use this unless the pivot is explicitly “dashboard is the whole product.”

1. **Hosting:** [Cloudflare Pages](https://developers.cloudflare.com/pages/) for the built site + [Pages Functions](https://developers.cloudflare.com/pages/functions/) for server-only work.
2. **Front end:** **[Astro](https://docs.astro.build/en/guides/deploy/cloudflare/)** + TypeScript for public pages (SEO, MD/MDX, minimal JS by default).
3. **TailAdmin-shaped UI:** reuse **React + Tailwind** via **[Astro React islands](https://docs.astro.build/en/guides/integrations-guide/react/)** and/or a **client-mounted shell** (e.g. `/app`) for dashboard-style experiences—same component vocabulary as the reference template, different page assembly than a pure SPA.
4. **APIs:** **[Hono](https://hono.dev/)** behind **`/api/*`** in Pages Functions for secrets, writes, webhooks, and anything that must not run in the browser. Bind **D1** / **KV** / **R2** here via [Wrangler](https://developers.cloudflare.com/workers/wrangler/).
5. **Data:** **[D1](https://developers.cloudflare.com/d1/)** for relational **source of truth** (entities, migrations, SQL). **[KV](https://developers.cloudflare.com/kv/)** for **cache, flags, rate limits, ephemeral keys**—not as a substitute for normalized data.
6. **Object storage:** add **[R2](https://developers.cloudflare.com/r2/)** when there is a real need (user uploads, large exports, blobs). Static build output stays on Pages unless architecture demands otherwise.

### Alternate: app-first (logged-in product dominates)

If most value is behind auth and server mutations are central:

- **[Remix on Cloudflare](https://remix.run/docs/en/main/guides/deployment#cloudflare)** as the primary app: loaders/actions map cleanly to **D1** and bindings; **skip Hono** unless a separate API Worker is intentionally split out.
- Porting **TailAdmin** still means **React**, but **Remix routing** replaces **React Router** for that app shell.

### What we are not optimizing for by default

- **[Next.js on Cloudflare Workers](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/)** — supported, but higher operational surface than Remix/Astro here. Use only if the team is already committed to Next.

### Optional later

- **[Durable Objects](https://developers.cloudflare.com/durable-objects/)** when we need strong per-object consistency, coordination, or WebSockets—not a stand-in for D1.

---

## Reference template: TailAdmin React Pro (v2.x)

The local copy **TailAdmin React Pro** (`tailadmin-react-pro-2.0-main`, package `tailadmin-react` **2.2.2**) is the baseline for tooling and UI conventions. It is an admin/dashboard template ([tailadmin.com](https://tailadmin.com)), not the final information architecture for a public marketing site, but its stack is a good match for a modern React front end.

### What that project uses

| Area | Choices |
|------|--------|
| **Runtime** | React 19, React DOM 19 (`react-jsx`, strict TypeScript) |
| **Build** | Vite 6, `tsc -b` then `vite build`, native ESM (`"type": "module"`) |
| **Styling** | **Tailwind CSS v4** via `@import "tailwindcss"` in CSS, **PostCSS** with `@tailwindcss/postcss`, **@tailwindcss/forms**; large design tokens in `@theme` (brand/gray palettes, custom breakpoints, typography scale); **Outfit** from Google Fonts; **dark** via `@custom-variant dark` |
| **Routing** | **React Router 7** (`BrowserRouter`, `Routes`, `Route`) |
| **Head / SEO** | **react-helmet-async** (wrapped at app root) |
| **Class names** | **clsx**, **tailwind-merge** |
| **Overlays / positioning** | **@floating-ui/react**; **@popperjs/core** also present |
| **Charts** | **ApexCharts**, **react-apexcharts** |
| **Calendar** | **@fullcalendar/** (core, react, daygrid, timegrid, list, interaction) |
| **Maps** | **@react-jvectormap/core**, **@react-jvectormap/world** |
| **UI utilities** | **simplebar-react** (scrollbars), **swiper**, **flatpickr** (dates), **prismjs** (syntax highlight), **react-dropzone**, **react-dnd** + **react-dnd-html5-backend** |
| **Lint** | **ESLint 9** flat config (`eslint.config.js`), **typescript-eslint**, **@eslint/js**, **eslint-plugin-react-hooks**, **eslint-plugin-react-refresh**, **globals** |
| **Vite plugins** | **@vitejs/plugin-react**, **vite-plugin-svgr** (SVGs as React components) |

**Source layout (informative):** `src/App.tsx`, `src/pages/`, `src/components/`, `src/layout/`, `src/context/` (e.g. theme), `src/hooks/`, `src/utils/`, `src/icons/`, global styles in `src/index.css`.

### Planned stack for strats.co (aligned with the reference)

Reuse **TailAdmin’s UI toolchain** (React, Tailwind v4, clsx/tailwind-merge, etc.) inside the **Cloudflare default** above: Astro owns public pages; React islands or an app shell carry dashboard-style UI; **Hono** owns `/api/*` unless we switch to the **Remix** alternate.

1. **Astro** (+ TypeScript) for the main site; **@astrojs/react** where interactive UI is needed.
2. **React 19** — UI layer for islands / app regions (match template major over time).
3. **Tailwind CSS v4 + PostCSS** — styling; **@tailwindcss/forms** when forms matter; reuse or simplify `@theme` tokens from the template.
4. **Vite** — used under the hood by Astro (and by any standalone Vite sub-app if we split one); prefer **current Vite / TypeScript majors** at scaffold time that satisfy [Workers/Pages runtime](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) constraints.
5. **React Router 7** — only inside a **dedicated SPA shell** if we mount TailAdmin-style routing there; not required for static Astro pages. **Remix** replaces it in the app-first alternate.
6. **ESLint** + **typescript-eslint** + React hooks/refresh — same quality bar as the template (upgrade majors when pins allow).
7. **vite-plugin-svgr** — use via Astro/Vite config if we keep importing SVGs as components.
8. **clsx** + **tailwind-merge** — conditional classes and Tailwind-safe merging.
9. **SEO/meta** — Astro **[layouts and `<head>`](https://docs.astro.build/en/basics/layouts/)**; **react-helmet-async** only inside React subtrees if still useful there.

**Deploy:** **Cloudflare Pages** (Astro adapter); **Pages Functions** + **Hono** for APIs; **D1** + **KV** (+ **R2** when needed) via Wrangler bindings.

**Add from the template only when a feature needs it:** ApexCharts, FullCalendar, Swiper, SimpleBar, Flatpickr, Prism, drag-and-drop, file upload, Floating UI widgets, etc. A lean marketing site may omit most of these initially.

**Node:** TailAdmin’s README recommends **Node 18+** (20+ preferred).

This section is a **living reference**; pin exact versions in `package.json` when the app is scaffolded.
