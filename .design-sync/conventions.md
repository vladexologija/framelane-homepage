# FrameLane brand kit — how to build with it

These are the real marketing/console components from the FrameLane Next.js app,
bundled as `window.FrameLane.*`. They are **dark-theme, full-width page
sections** (a hero, a comparison table, a pricing-style CTA, etc.), not small
form controls. Compose a page by stacking them; each renders its own content.

## Setup — render on a dark surface

The components are designed against a dark page backdrop and inherit it. Always
mount them inside a container that sets the FrameLane background and text color,
or the page will be light-on-light:

```jsx
<div style={{ background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
  <FrameLane.Hero />
  <FrameLane.Capabilities />
</div>
```

No provider is required — Next.js `<Link>`/`<Image>` and Clerk are stubbed in the
bundle, so every component renders standalone. Link `styles.css` once; it pulls
in the tokens, the three brand fonts (Geist, Geist Mono, Instrument Serif), and
all component CSS.

## Styling idiom — CSS-variable tokens + a small class vocabulary

Style your own layout glue with these, not generic Tailwind colors. Three layers:

**1. Design tokens (CSS custom properties)** — use via `var(--…)` in inline styles:

- color (surfaces): `--bg`, `--bg-2`, `--bg-elev`, `--bg-elev-2`
- color (text): `--fg`, `--fg-2`, `--fg-mute`, `--fg-dim`
- color (brand): `--orange` (primary accent), `--orange-hi`, `--orange-soft`
- color (status): `--green`, `--red`
- lines: `--line`, `--line-strong`
- layout: `--gutter`, `--maxw` (1240px content width)
- fonts: `--font-geist-sans`, `--font-geist-mono`, `--font-instrument-serif`

**2. Utility classes** (from globals.css — prefer these over reinventing):

- `btn` + `btn-primary` (orange) / `btn-ghost` (outline) / `btn-sm` — buttons
- `card` — bordered gradient panel · `pill` — rounded tag · `lede` — intro paragraph
- `mono` — Geist Mono · `serif-i` — italic Instrument Serif (used for accent words in headings)
- `eyebrow` — uppercase mono label · `num-marker` — orange mono index · `wrap` — centered max-width container · `section-tag` — orange-dash section label

**3. Tailwind v4 utilities** are available, including brand-mapped tokens:
`bg-accent`/`text-accent-foreground` (orange), `text-muted`/`text-muted-foreground`
(muted grey), `bg-card`, `text-foreground`, `border-muted-foreground`,
`font-mono`, `font-logo`. Standard Tailwind utilities (flex, grid, spacing) work too.

## Where the truth lives

- `styles.css` → `tokens/tokens.css` (every token, verbatim), `_ds_bundle.css`
  (all component + utility CSS), `fonts/fonts.css`. Read these before styling.
- `components/<group>/<Name>/<Name>.prompt.md` and `<Name>.d.ts` — per component.

## Idiomatic snippet

```jsx
<section style={{ background: 'var(--bg)', color: 'var(--fg)', padding: '120px 0' }}>
  <div className="wrap">
    <span className="eyebrow">Why FrameLane</span>
    <h2>Built for <span className="serif-i">real video</span>.</h2>
    <p className="lede">Render production-ready output through API or MCP.</p>
    <a className="btn btn-primary" href="#">Request access →</a>
  </div>
</section>
```
