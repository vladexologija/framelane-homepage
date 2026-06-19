// Build _ds_bundle.js: synthetic entry re-exporting every brand component,
// bundled to an IIFE at window.<GLOBAL>, with Next/Clerk stubbed.
import { build } from 'esbuild';
import { existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { reactShim, tsconfigPathsPlugin } from '../lib/bundle.mjs';
import { nextClerkStubs } from './stubs.mjs';
import { COMPONENTS, GLOBAL } from './components.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');

export async function buildBundle(out) {
  mkdirSync(out, { recursive: true });
  // Synthetic entry. Imports live under .ds-sync/.entry/ so relative paths
  // reach the repo root predictably.
  const entryDir = join(REPO, '.ds-sync', '.entry');
  mkdirSync(entryDir, { recursive: true });
  const logoPng = join(REPO, 'public', 'logo.png');
  const imports = COMPONENTS.map(
    (c) => `import { ${c.name} } from ${JSON.stringify(join(REPO, c.file).replace(/\.tsx?$/, ''))};`,
  ).join('\n');
  const names = COMPONENTS.map((c) => c.name).join(', ');
  const assetLine = existsSync(logoPng)
    ? `import __logo from ${JSON.stringify(logoPng)};\nif (typeof window !== 'undefined') { window.__dsAssets = Object.assign(window.__dsAssets || {}, { '/logo.png': __logo }); }`
    : '';
  const entry = join(entryDir, 'entry.tsx');
  writeFileSync(entry, `${imports}\n${assetLine}\nexport { ${names} };\n`);

  const tsconfig = join(REPO, 'tsconfig.json');
  const pathsPlugin = tsconfigPathsPlugin(tsconfig);
  const bundleJs = join(out, '_ds_bundle.js');

  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    globalName: GLOBAL,
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    nodePaths: [join(REPO, 'node_modules')],
    plugins: [pathsPlugin, reactShim, nextClerkStubs].filter(Boolean),
    loader: { '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl', '.woff': 'dataurl', '.woff2': 'dataurl' },
    define: {
      'process.env.NODE_ENV': '"production"',
      'process.env.NEXT_PUBLIC_CONSOLE_URL': '"/signup"',
      'process.env.NEXT_PUBLIC_WAITLIST_URL': '"#"',
      'process.env.NEXT_PUBLIC_API_URL': '"https://api.framelane.io/v1"',
      'process.env.FRAMELANE_API_KEY': '""',
    },
    outfile: bundleJs,
    metafile: true,
    logLevel: 'warning',
    footer: { js: `try{window.${GLOBAL}=${GLOBAL}}catch(e){}` },
  });

  console.error(`  bundle: ${(statSync(bundleJs).size / 1024).toFixed(0)} KB`);
  return bundleJs;
}

// Allow direct run for spiking.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = resolve(process.argv[2] || join(REPO, 'ds-bundle'));
  buildBundle(out).then(() => console.error('OK')).catch((e) => { console.error(e.message || e); process.exit(1); });
}
