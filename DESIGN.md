# FrameLane Design Reference

## Section order (AgentMail-parity IA)

1. Hero (tagline + dual CTA + SDK code tabs)
2. Logo wall (placeholder names until real partners)
3. Capability grid (9 tiles — one per API primitive)
4. Scale / metrics block (4 stat cards)
5. Use cases (5 agent-shaped cards)
6. Testimonials (3 quote cards — placeholder until real)
7. FAQ accordion
8. CTA banner (repeat Start free / Docs)
9. Footer (4-column link groups)

## Interaction patterns reused

- Tabbed code switcher (Python / TypeScript / cURL) — pure React state
- FAQ accordion — single-open, chevron rotation
- Mobile nav — collapsible with max-height transition
- Hover states on cards — border tint + bg shift
- Canvas-backed bento visuals — animated dot fields and globe/network arcs

## Background system

- Site background uses the navy from `public/logo.png` as the base color
- Repeating WhatsApp-style doodle wallpaper in `public/video-pattern.svg`
- Pattern uses original video-production line icons: clapperboards, cameras, reels, timelines, play controls, waveforms, editing scissors, and related video motifs
- Pattern is intentionally subtle but visible: white line art at low opacity over the navy base
- Bento metrics retain lightweight canvas animations for depth and motion

## Fonts & licensing

- **Eurostile Extended Bold** — heading / display font, expected as a licensed local font or bundled asset
- **Geist** (sans) + **Geist Mono** — body / mono fonts loaded via `next/font/google`, SIL Open Font License
- No proprietary fonts from any competitor site

## UI primitives

- **Tailwind CSS v4** — utility-first, no extracted component library
- **Lucide React** — MIT-licensed icon set
- **clsx + tailwind-merge** — className composition
- **framer-motion** — MIT, available for scroll animations (not yet wired)

## Color tokens (navy theme only for now)

| Token             | Value     | Usage                  |
|-------------------|-----------|------------------------|
| background        | `#1f274a` | Page bg / logo navy    |
| foreground        | `#fafafa` | Primary text           |
| muted             | `#c0c6da` | Secondary text         |
| muted-foreground  | `#8d96b8` | Tertiary / disabled    |
| border            | `#3a4470` | Dividers, card borders |
| card              | `#222b52` | Card / code bg         |
| card-hover        | `#2a3461` | Card hover bg          |
| accent            | `#faa329` | Primary brand orange   |
| accent-foreground | `#ffd38a` | Accent text / labels   |
| success           | `#22c55e` | Checkmarks, positive   |

## What is NOT sourced from competitors

- No scraped CSS, JS bundles, images, illustrations, or SVGs
- No copied marketing copy — all text is original for FrameLane
- Logo wall names are fictional placeholders
- Testimonial quotes are fictional placeholders
