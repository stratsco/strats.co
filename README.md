# strats.co

This repository was reset in April 2026. The previous codebase was a **Jekyll** marketing site for **StratsCo**—positioned as a Discord community for people who play massively multiplayer games. It lived at [https://strats.co](https://strats.co).

**What used to be here (for archaeology only):**

- Standard Jekyll layout: `_config.yml`, `Gemfile`, collections for static pages, blog-style **news** under `/news/`, **game** landing pages under `/game/:slug/`, and **short redirects** under `/x/:slug/` (affiliate/partner links, Discord, etc.).
- A Bootstrap-based theme with SCSS, vendor JS, and a single demo post from 2018.

Nothing from that stack remains in the tree on purpose. The next iteration of this repo will define a new purpose and stack for strats.co.

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

Use the **same core toolchain** so new work can reuse components, tokens, and patterns from the TailAdmin kit without a parallel stack:

1. **Vite 6 + TypeScript 5.x** — build, strict compiler options in line with `tsconfig.app.json` (bundler resolution, `noUnusedLocals` / `noUnusedParameters`, etc.).
2. **React 19** — UI layer.
3. **Tailwind CSS v4 + PostCSS** — styling; **@tailwindcss/forms** if we keep form-heavy UI; carry over or simplify `@theme` tokens as the brand evolves.
4. **React Router 7** — client-side routing for a SPA (or hybrid later if we add SSR).
5. **ESLint 9** + **typescript-eslint** + React hooks/refresh plugins — same quality bar as the template.
6. **vite-plugin-svgr** — optional but already proven in the template for icon pipelines.
7. **clsx** + **tailwind-merge** — conditional classes and Tailwind-safe merging.
8. **react-helmet-async** — document title, meta, and social tags for public pages.

**Add from the template only when a feature needs it:** ApexCharts, FullCalendar, Swiper, SimpleBar, Flatpickr, Prism, drag-and-drop, file upload, Floating UI widgets, etc. A lean marketing site may omit most of these initially.

**Node:** TailAdmin’s README recommends **Node 18+** (20+ preferred).

This section is a **living reference**; pin exact versions in `package.json` when the app is scaffolded.
