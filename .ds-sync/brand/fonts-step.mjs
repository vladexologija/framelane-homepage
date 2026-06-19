// Self-host the three brand fonts (next/font/google in the app → shipped as
// @font-face here) and define the --font-* CSS variables the app's globals.css
// reads. Sources: @fontsource packages installed under .ds-sync/node_modules.
import { copyFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const FS = join(REPO, '.ds-sync', 'node_modules', '@fontsource');

// [fontsource pkg, file stem, family, weight, style, out filename]
const FACES = [
  ['geist-sans', 'geist-sans-latin-400-normal', 'Geist', 400, 'normal', 'geist-400.woff2'],
  ['geist-sans', 'geist-sans-latin-500-normal', 'Geist', 500, 'normal', 'geist-500.woff2'],
  ['geist-sans', 'geist-sans-latin-600-normal', 'Geist', 600, 'normal', 'geist-600.woff2'],
  ['geist-sans', 'geist-sans-latin-700-normal', 'Geist', 700, 'normal', 'geist-700.woff2'],
  ['geist-mono', 'geist-mono-latin-400-normal', 'Geist Mono', 400, 'normal', 'geist-mono-400.woff2'],
  ['geist-mono', 'geist-mono-latin-500-normal', 'Geist Mono', 500, 'normal', 'geist-mono-500.woff2'],
  ['instrument-serif', 'instrument-serif-latin-400-normal', 'Instrument Serif', 400, 'normal', 'instrument-serif-400.woff2'],
  ['instrument-serif', 'instrument-serif-latin-400-italic', 'Instrument Serif', 400, 'italic', 'instrument-serif-400-italic.woff2'],
];

export function buildFonts(out) {
  const fontsDir = join(out, 'fonts');
  mkdirSync(fontsDir, { recursive: true });
  let css = '/* FrameLane brand fonts — self-hosted from @fontsource (the app loads these via next/font/google). */\n\n';
  for (const [pkg, stem, family, weight, style, outName] of FACES) {
    const srcFile = join(FS, pkg, 'files', `${stem}.woff2`);
    if (!existsSync(srcFile)) { console.error(`  ! font missing: ${srcFile}`); continue; }
    copyFileSync(srcFile, join(fontsDir, outName));
    css += `@font-face {\n  font-family: '${family}';\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('./${outName}') format('woff2');\n}\n`;
  }
  // Define the --font-* variables next/font injects at runtime in the app.
  css += `\n:root {\n` +
    `  --font-geist-sans: 'Geist', system-ui, -apple-system, sans-serif;\n` +
    `  --font-geist-mono: 'Geist Mono', ui-monospace, 'SF Mono', monospace;\n` +
    `  --font-instrument-serif: 'Instrument Serif', Georgia, serif;\n` +
    `}\n`;
  writeFileSync(join(fontsDir, 'fonts.css'), css);
  console.error(`  fonts: ${FACES.length} faces`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildFonts(resolve(process.argv[2] || join(REPO, 'ds-bundle')));
  console.error('OK');
}
