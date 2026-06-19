// FrameLane brand-kit converter (off-script orchestrator).
// Produces the exact claude.ai/design upload layout from a Next.js app by
// bundling the real components with Next/Clerk stubbed. Reuses the skill's
// contract helpers (previewHtmlModule, providerWrapper, vendorReact,
// emitReviewPage, stampHeader, sync-hashes) so the output format is identical
// to the converter's.
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { reactShim } from './lib/bundle.mjs';
import { stampHeader } from './lib/bundle.mjs';
import { vendorReact, previewHtmlModule, providerWrapper, emitReviewPage } from './lib/emit.mjs';
import { styleShaFor, renderHashFor, auxShaFor, sourceKeyFor, configSlicesFor, KEY_RECIPE } from './lib/sync-hashes.mjs';

import { buildBundle } from './brand/bundle-step.mjs';
import { buildCss } from './brand/css-step.mjs';
import { buildFonts } from './brand/fonts-step.mjs';
import { COMPONENTS, GLOBAL, PKG, VERSION } from './brand/components.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const OUT = resolve(process.argv[2] || join(REPO, 'ds-bundle'));
const PREVIEWS_DIR = join(REPO, '.design-sync', 'previews');
const NM = join(REPO, 'node_modules');

// ── per-component preview customization ──────────────────────────────────
// Most sections render themselves in a dark frame. A few need a sized host
// (canvas backgrounds, the vertical sidebar). The render body goes inside
// <Frame>; `$NS.Name` is the bundle component.
const PREVIEW_BODY = {
  DotGrid: `<div style={{ position: 'relative', height: 420, overflow: 'hidden' }}><C /></div>`,
  GlobeNetwork: `<div style={{ position: 'relative', height: 480, overflow: 'hidden' }}><C /></div>`,
  ConsoleSidebar: `<div style={{ height: 640, display: 'flex' }}><C /></div>`,
  Logo: `<div style={{ padding: 24 }}><C /></div>`,
};

function defaultPreviewSrc(name) {
  const body = PREVIEW_BODY[name] ?? `<C />`;
  return `// Authored preview for ${name} (FrameLane brand kit).
// Renders the real bundled component inside a dark page frame — the backdrop
// FrameLane's sections are designed against.
import * as React from 'react';

const NS = (window as any).FrameLane;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--fg)',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        minHeight: '100%',
      }}
    >
      {children}
    </div>
  );
}

export function Default() {
  const C = NS.${name};
  return (
    <Frame>
      ${body}
    </Frame>
  );
}
`;
}

function ensurePreviews() {
  mkdirSync(PREVIEWS_DIR, { recursive: true });
  let created = 0;
  for (const c of COMPONENTS) {
    const p = join(PREVIEWS_DIR, `${c.name}.tsx`);
    if (!existsSync(p)) { writeFileSync(p, defaultPreviewSrc(c.name)); created++; }
  }
  console.error(`  previews: ${created} generated, ${COMPONENTS.length - created} already authored`);
}

async function compilePreviews() {
  mkdirSync(join(OUT, '_preview'), { recursive: true });
  const built = new Set();
  for (const c of COMPONENTS) {
    const src = join(PREVIEWS_DIR, `${c.name}.tsx`);
    if (!existsSync(src)) continue;
    try {
      await build({
        entryPoints: [src],
        bundle: true,
        format: 'iife',
        globalName: '__dsPreview',
        platform: 'browser',
        target: 'es2020',
        jsx: 'automatic',
        nodePaths: [NM],
        plugins: [reactShim],
        loader: { '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'dataurl' },
        define: { 'process.env.NODE_ENV': '"production"' },
        outfile: join(OUT, '_preview', `${c.name}.js`),
        logLevel: 'warning',
        footer: { js: 'try{window.__dsPreview=__dsPreview}catch(e){}' },
      });
      built.add(c.name);
    } catch (e) {
      console.error(`  ! preview build failed: ${c.name} — ${e.message?.split('\n')[0] || e}`);
    }
  }
  console.error(`  compiled previews: ${built.size}/${COMPONENTS.length}`);
  return built;
}

// Light props extraction from the component source — most sections are
// propless; surface a real prop type when the signature carries one.
function propsBodyFor(c) {
  const src = readFileSync(join(REPO, c.file), 'utf8');
  const re = new RegExp(`export function ${c.name}\\s*\\(([^)]*)\\)`);
  const m = re.exec(src);
  if (!m || !m[1].trim()) return '';
  // inline type annotation: ({ a }: { a?: T }) or (props: { ... })
  const tm = /:\s*\{([\s\S]*?)\}\s*$/.exec(m[1]);
  if (tm) return tm[1].split(';').map((s) => s.trim()).filter(Boolean).map((s) => `  ${s};`).join('\n');
  return '';
}

function emitComponent(c, built) {
  const dir = join(OUT, 'components', c.group, c.name);
  mkdirSync(dir, { recursive: true });

  // .jsx — re-export stub (matches converter format).
  writeFileSync(
    join(dir, `${c.name}.jsx`),
    `// Re-export of ${PKG}@${VERSION} ${c.name}. Implementation is in the root _ds_bundle.js (window.${GLOBAL}).\n` +
      `Object.assign(window, { ${c.name}: window.${GLOBAL}.${c.name} });\n`,
  );

  // .d.ts — props interface.
  const body = propsBodyFor(c);
  const dts =
    `import * as React from 'react';\n\n` +
    `/**\n * ${c.name} — from ${PKG}@${VERSION} (${c.file}).\n */\n` +
    `export interface ${c.name}Props {\n${body || '  [key: string]: never;'}\n}\n\n` +
    `export declare const ${c.name}: React.ComponentType<${c.name}Props>;\n`;
  writeFileSync(join(dir, `${c.name}.d.ts`), dts);

  // .prompt.md — first line is the element-index summary the design agent reads.
  const head = `${c.name} from ${PKG}. Use via \`window.${GLOBAL}.${c.name}\` (bundle loaded from the root \`_ds_bundle.js\`). A FrameLane ${c.group.toLowerCase()} component — render on a dark surface (\`background: var(--bg)\`).\n`;
  const propsSection = body
    ? `\n## Props\n\n\`\`\`ts\ninterface ${c.name}Props {\n${body}\n}\n\`\`\`\n`
    : `\n## Props\n\nNo props — renders a complete, self-contained ${c.group.toLowerCase().replace(/s$/, '')} section.\n`;
  const example = `\n## Example\n\n\`\`\`jsx\nimport { ${c.name} } from '${PKG}';\n\n<div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>\n  <${c.name} />\n</div>\n\`\`\`\n`;
  writeFileSync(join(dir, `${c.name}.prompt.md`), head + propsSection + example);

  // .html — preview card via the skill's exact template.
  const wrap = providerWrapper(null, GLOBAL, false);
  const bundleCssLink = '\n  <link rel="stylesheet" href="../../../_ds_bundle.css">';
  const html = built.has(c.name)
    ? previewHtmlModule(c.group, c.name, GLOBAL, wrap, '', bundleCssLink, '', {})
    : previewHtmlModule(c.group, c.name, GLOBAL, wrap, '', bundleCssLink, '', {}); // always authored here
  writeFileSync(join(dir, `${c.name}.html`), html);
}

function writeStylesCss() {
  writeFileSync(
    join(OUT, 'styles.css'),
    `/* FrameLane design system — single stylesheet entry. */\n` +
      `@import "./fonts/fonts.css";\n` +
      `@import "./tokens/tokens.css";\n` +
      `@import "./_ds_bundle.css";\n`,
  );
}

function writeReadme() {
  const header = existsSync(join(REPO, '.design-sync', 'conventions.md'))
    ? readFileSync(join(REPO, '.design-sync', 'conventions.md'), 'utf8').trimEnd() + '\n\n'
    : '';
  const byGroup = new Map();
  for (const c of COMPONENTS) { if (!byGroup.has(c.group)) byGroup.set(c.group, []); byGroup.get(c.group).push(c); }
  const index = [...byGroup.entries()].map(([g, cs]) =>
    `### ${g}\n${cs.map((c) => `- \`${c.name}\``).join('\n')}`).join('\n\n');
  const readme = `# ${GLOBAL} (${PKG}@${VERSION})

The FrameLane marketing/brand component kit, extracted from the production
Next.js app as a single browser bundle. Every component is the real shipped code
(Next.js \`<Link>\`/\`<Image>\` and Clerk hooks are stubbed for standalone render).

## Where things are

- \`_ds_bundle.js\` — whole-kit bundle at the project root; loads every component to \`window.${GLOBAL}\`.
- \`styles.css\` — single stylesheet entry; \`@import\`s fonts, tokens, and component styles (\`_ds_bundle.css\`). Link this one file.
- \`components/<group>/<Name>/\` — \`<Name>.prompt.md\` (usage), \`<Name>.d.ts\` (types), \`<Name>.html\` (preview card).
- \`tokens/tokens.css\` — design tokens (CSS custom properties).
- \`fonts/\` — self-hosted Geist, Geist Mono, Instrument Serif.

## Loading

\`\`\`html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
\`\`\`

Components are then at \`window.${GLOBAL}.*\`.

## Components

${index}
`;
  writeFileSync(join(OUT, 'README.md'), (header + readme));
}

function writeAnchor(built) {
  const styleSha = styleShaFor(OUT, { includeBundleBody: true });
  const renderHashes = {};
  const sourceKeys = {};
  const slices = configSlicesFor({}, join(REPO, '.design-sync'));
  for (const c of COMPONENTS) {
    renderHashes[c.name] = renderHashFor(OUT, c, {});
    const srcSha = createHash('sha256').update(readFileSync(join(REPO, c.file))).digest('hex').slice(0, 12);
    sourceKeys[c.name] = sourceKeyFor(c.name, {
      globalSlice: slices.global,
      componentSlice: slices.componentFor(c.name),
      srcSha,
      designSyncDir: join(REPO, '.design-sync'),
    });
  }
  // sourceHashes from the @ds-bundle header (written by stampHeader).
  const hdr = readFileSync(join(OUT, '_ds_bundle.js'), 'utf8').split('\n', 1)[0];
  const sourceHashes = JSON.parse(hdr.replace(/^\/\* @ds-bundle: /, '').replace(/ \*\/$/, '')).sourceHashes ?? {};
  const bundleBody = readFileSync(join(OUT, '_ds_bundle.js'), 'utf8');
  const bundleSha12 = createHash('sha256').update(bundleBody.slice(bundleBody.indexOf('\n') + 1)).digest('hex').slice(0, 12);
  const anchor = {
    shape: 'package',
    keyRecipe: KEY_RECIPE,
    styleSha,
    bundleSha12,
    renderHashes,
    sourceKeys,
    sourceHashes,
    auxSha: auxShaFor(OUT),
    builtBy: 'cc-design-sync-brand',
  };
  writeFileSync(join(OUT, '_ds_sync.json'), JSON.stringify(anchor, null, 2) + '\n');
}

async function main() {
  if (existsSync(OUT)) {
    // Only wipe a prior bundle (must contain _ds_bundle.js or be empty).
    const entries = readdirSync(OUT);
    if (entries.length && !entries.includes('_ds_bundle.js') && !entries.includes('README.md')) {
      console.error(`[OUT_UNSAFE] refusing to wipe ${OUT} — not a prior bundle`); process.exit(1);
    }
    rmSync(OUT, { recursive: true, force: true });
  }
  mkdirSync(OUT, { recursive: true });

  console.error('▸ bundle');
  await buildBundle(OUT);
  console.error('▸ css');
  await buildCss(OUT);
  console.error('▸ fonts');
  buildFonts(OUT);
  console.error('▸ styles.css'); writeStylesCss();
  console.error('▸ vendor react');
  mkdirSync(join(OUT, '_vendor'), { recursive: true });
  await vendorReact({ nodeModules: NM, out: OUT });
  console.error('▸ previews'); ensurePreviews();
  const built = await compilePreviews();
  console.error('▸ emit components');
  for (const c of COMPONENTS) emitComponent(c, built);
  // stampHeader needs the per-component files on disk (it hashes them).
  const inlinedExternals = ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'];
  stampHeader(join(OUT, '_ds_bundle.js'), { namespace: GLOBAL, components: COMPONENTS, inlinedExternals });
  console.error('▸ readme'); writeReadme();
  console.error('▸ review page'); emitReviewPage({ OUT, components: COMPONENTS });
  console.error('▸ anchor'); writeAnchor(built);
  // Sentinel for the app's self-check.
  writeFileSync(join(OUT, '_ds_needs_recompile'), JSON.stringify({ by: 'design-sync-cli' }));
  console.error(`\n✓ ${COMPONENTS.length} components → ${OUT}`);
}

main().catch((e) => { console.error(e.stack || e); process.exit(1); });
