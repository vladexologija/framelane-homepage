// Compile the app's real globals.css through Tailwind v4 (the same plugin the
// app uses) so _ds_bundle.css is faithful to production. Scans the component
// sources + authored previews for utility classes.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const require = createRequire(join(REPO, 'node_modules', 'noop.js'));

export async function buildCss(out) {
  const postcss = require('postcss');
  const tailwind = require('@tailwindcss/postcss');
  const globalsPath = join(REPO, 'src', 'app', 'globals.css');
  let input = readFileSync(globalsPath, 'utf8');
  // Brand-kit theme bridge — defines the shadcn-style tokens the draft
  // components expect, mapped to the FrameLane palette (see the file).
  const bridge = join(REPO, '.design-sync', 'theme-bridge.css');
  if (existsSync(bridge)) input += '\n' + readFileSync(bridge, 'utf8');
  // Force the content sources (Tailwind v4 auto-detection can miss files
  // outside the CSS entry's tree). Paths are relative to globals.css (src/app).
  input +=
    '\n@source "../components";\n@source "../app";\n@source "../../.design-sync/previews";\n';
  const result = await postcss([tailwind()]).process(input, { from: globalsPath, to: join(out, '_ds_bundle.css') });

  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, '_ds_bundle.css'), result.css);

  // tokens/tokens.css — extract the :root design-token block for the DS pane's
  // token overview (README reader looks here first).
  const tokenMatch = readFileSync(globalsPath, 'utf8').match(/:root\s*\{[\s\S]*?\}/);
  mkdirSync(join(out, 'tokens'), { recursive: true });
  writeFileSync(
    join(out, 'tokens', 'tokens.css'),
    '/* FrameLane design tokens — CSS custom properties (verbatim from src/app/globals.css). */\n' +
      (tokenMatch ? tokenMatch[0] : ':root {}') +
      '\n',
  );

  console.error(`  _ds_bundle.css: ${(result.css.length / 1024).toFixed(0)} KB`);
  return result.css.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = resolve(process.argv[2] || join(REPO, 'ds-bundle'));
  buildCss(out).then(() => console.error('OK')).catch((e) => { console.error(e.stack || e); process.exit(1); });
}
