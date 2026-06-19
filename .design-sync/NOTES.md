# design-sync notes — FrameLane brand kit

## What this is

This repo is a **Next.js 16 app, not a component library**, so the standard
design-sync converter can't run on it. Instead a **bespoke off-converter
orchestrator** under `.ds-sync/brand*` extracts the marketing/console components
into the claude.ai/design upload layout. It reuses the skill's contract helpers
(`.ds-sync/lib/`: emit/bundle/sync-hashes) so the output format stays identical
to the converter's, and writes custom glue for the Next.js-specific bits.

- Project: **FrameLane Brand Kit** — `d13b68f3-c830-4a2f-8ed5-d24cdb4486d4`
  (https://claude.ai/design/p/d13b68f3-c830-4a2f-8ed5-d24cdb4486d4)
- Global: `window.FrameLane.*`. 19 components in 4 groups (Sections, Chrome, Primitives, Decoration).

## How the build works

`node .ds-sync/brand-build.mjs ./ds-bundle` runs, in order:
1. **bundle** (`brand/bundle-step.mjs`) — synthetic entry re-exports every
   component in `brand/components.mjs`; esbuild → IIFE at `window.FrameLane`.
   Next.js/Clerk imports are replaced by `brand/stubs.mjs` (Link→`<a>`,
   Image→`<img>` resolving `/logo.png` from a bundled data-URL, `usePathname`,
   `useClerk`, etc.). `@/` aliases resolve via tsconfig paths.
2. **css** (`brand/css-step.mjs`) — compiles the app's real `src/app/globals.css`
   through Tailwind v4 (the same plugin the app uses) + `.design-sync/theme-bridge.css`.
3. **fonts** (`brand/fonts-step.mjs`) — self-hosts Geist / Geist Mono / Instrument
   Serif from `@fontsource` (installed under `.ds-sync/node_modules`) and defines
   the `--font-*` vars next/font injects at runtime.
4. emit per-component files, compile previews, stamp header, README (with the
   `.design-sync/conventions.md` header), `_ds_sync.json`.

Render check: `node .ds-sync/brand/render-check.mjs ./ds-bundle [Name,Name]`
(playwright + chromium, build 1228 / playwright 1.61, cached under
`~/Library/Caches/ms-playwright`). Screenshots → `ds-bundle/_screenshots/`.

## Key decisions

- **Two component tiers.** Live/wired (Hero, UseCases, Capabilities, HowItWorks,
  Comparisons, GetStarted, Nav, Footer, Logo, ConsoleSidebar) use globals.css
  vocabulary and render perfectly. Workflows & FAQ are unused but clean. A draft
  set (Examples, ScaleBlock, Testimonials, CtaBanner, CodeTabs + GlobeNetwork/
  DotGrid) was written against shadcn-style tokens (`text-muted-foreground`,
  `bg-accent`, `font-logo`, …) that **globals.css never defines** — so in the
  live app they render colorless. **`.design-sync/theme-bridge.css` maps that
  vocabulary onto the FrameLane palette** so they render on-brand. Without it,
  CtaBanner shows a bright ASCII-grid artifact and the others lose accent colors.
- All 19 graded good (styled/complete/plausible) via headless screenshots.
- Components are full-width dark sections; previews wrap each in a `var(--bg)`
  frame (the backdrop they're designed against). DotGrid/GlobeNetwork/
  ConsoleSidebar get a sized host (see `PREVIEW_BODY` in brand-build.mjs).

## Re-sync risks / watch-list

- **`.ds-sync/lib/` is a copy of the skill's helpers**, vendored so the build is
  self-contained. If the skill's output contract changes, these won't auto-update
  — re-copy from the skill bundle and diff.
- **`.ds-sync/node_modules` is gitignored** — on a fresh clone, run
  `(cd .ds-sync && npm i esbuild playwright-core playwright @fontsource/geist-sans @fontsource/geist-mono @fontsource/instrument-serif)`
  and `npx playwright install chromium` before re-building.
- **Stub coverage is minimal** (only the imports the current components use). If
  a component starts importing a new `next/*` or `@clerk/*` symbol, add it to
  `brand/stubs.mjs` or the bundle will fail to resolve it.
- **`render-check.mjs` uses `waitUntil:'load'`** (not networkidle) — UseCases and
  other framer-motion components never reach networkidle.
- **Logo `/logo.png`** is inlined as a data-URL via the synthetic entry; if the
  logo file moves, update `bundle-step.mjs`.
- New components: add to `brand/components.mjs` (name/file/group), rebuild, render-check.

## Known render warns

None — all components render non-empty with no page errors.
