const { chromium } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function test() {
  const distDir = path.resolve('dist');
  const server = http.createServer((req, res) => {
    let p = req.url.split('?')[0];
    if (p === '/') p = '/index.html';
    let file = path.join(distDir, p);
    if (!fs.existsSync(file)) file = path.join(distDir, 'index.html');
    const ext = path.extname(file);
    const mime = ext === '.html' ? 'text/html' : ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream';
    res.writeHead(200, {'Content-Type': mime});
    res.end(fs.readFileSync(file));
  }).listen(4317);

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const viewports = [320, 360, 375, 390, 402, 430, 768, 1024];
  const routes = [
    '/',
    '/shop',
    '/product/iphone-18-pro',
    '/cart',
    '/checkout',
    '/account',
    '/auth',
    '/contact',
    '/track',
    '/admin',
    '/compare',
    '/wishlist',
    '/returns'
  ];

  let totalOverflows = 0;

  for (const w of viewports) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    for (const route of routes) {
      await page.goto('http://localhost:4317' + route);
      await page.waitForTimeout(150);
      const overflows = await page.evaluate(() => {
        const sw = document.documentElement.scrollWidth;
        const cw = document.documentElement.clientWidth;
        const diff = sw - cw;
        if (diff <= 1) return null;

        const culprits = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.right > cw + 1) {
            culprits.push({
              tag: el.tagName,
              cls: (el.className || '').toString().slice(0, 80),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            });
          }
        }
        return { sw, cw, diff, culprits: culprits.slice(0, 4) };
      });

      if (overflows) {
        totalOverflows++;
        console.log(`[OVERFLOW] w=${w} route=${route}: diff=${overflows.diff}px (sw=${overflows.sw}, cw=${overflows.cw})`);
        console.log('   Culprits:', JSON.stringify(overflows.culprits, null, 2));
      }
    }
    await page.close();
  }

  await browser.close();
  server.close();
  console.log(`Finished overflow inspection. Total overflows detected: ${totalOverflows}`);
}

test().catch(console.error);
