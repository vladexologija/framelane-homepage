// Headless render check: serve ds-bundle, open every component card in
// chromium, screenshot it, and report empty/broken/error renders.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { COMPONENTS } from './components.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const OUT = resolve(process.argv[2] || join(REPO, 'ds-bundle'));
const ONLY = (process.argv[3] || '').split(',').filter(Boolean);

const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };

function serve(root) {
  return new Promise((res) => {
    const srv = createServer((req, rq) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      let fp = join(root, p);
      try {
        if (existsSync(fp) && statSync(fp).isFile()) {
          rq.writeHead(200, { 'content-type': MIME[extname(fp)] || 'application/octet-stream' });
          rq.end(readFileSync(fp));
          return;
        }
      } catch {}
      rq.writeHead(404); rq.end('not found');
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}

async function main() {
  const { srv, port } = await serve(OUT);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  const shotDir = join(OUT, '_screenshots');
  mkdirSync(shotDir, { recursive: true });
  const list = COMPONENTS.filter((c) => !ONLY.length || ONLY.includes(c.name));
  const results = [];
  for (const c of list) {
    const url = `http://127.0.0.1:${port}/components/${c.group}/${c.name}/${c.name}.html`;
    const errs = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', (e) => errs.push(String(e.message || e).split('\n')[0]));
    let info = { name: c.name, group: c.group, errs, rootEmpty: true, text: '', height: 0, pngBytes: 0 };
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(1200);
      info = { ...info, ...(await page.evaluate(() => {
        const g = document.getElementById('g') || document.body;
        const t = (g.textContent || '').trim();
        const warn = t.startsWith('⚠');
        return { rootEmpty: !g.childElementCount && !t, text: t.slice(0, 80), warn, height: Math.round(g.getBoundingClientRect().height) };
      })) };
      const shot = join(shotDir, `${c.group}__${c.name}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      info.pngBytes = statSync(shot).size;
    } catch (e) {
      info.errs.push('NAV: ' + (e.message || e).split('\n')[0]);
    }
    const bad = info.rootEmpty || info.warn || info.pngBytes < 5000 || info.errs.length > 0;
    info.bad = bad;
    results.push(info);
    console.error(`${bad ? '✗' : '✓'} ${c.name.padEnd(16)} h=${String(info.height).padStart(4)} png=${String(Math.round(info.pngBytes / 1024)).padStart(4)}KB ${info.errs[0] ? '  ERR: ' + info.errs[0] : ''}${info.warn ? '  WARN: ' + info.text : ''}`);
  }
  writeFileSync(join(OUT, '.render-check.json'), JSON.stringify(results, null, 2));
  await browser.close();
  srv.close();
  const badCount = results.filter((r) => r.bad).length;
  console.error(`\n${badCount === 0 ? '✓ all clean' : '✗ ' + badCount + ' bad'} (${results.length} checked)`);
}
main().catch((e) => { console.error(e.stack || e); process.exit(1); });
