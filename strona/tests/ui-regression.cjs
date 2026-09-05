// Run after npm run build. Uses an existing Playwright installation and browser:
// PORTFOLIO_PLAYWRIGHT_MODULE=/path/to/playwright PORTFOLIO_BROWSER=/path/to/browser node tests/ui-regression.cjs
const { chromium } = require(process.env.PORTFOLIO_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const root = path.resolve(__dirname, '../dist/client');
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      const routePath = path.extname(pathname) ? pathname : pathname.replace(/\/$/, '') + '/index.html';
      const file = path.resolve(root, '.' + routePath);
      if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const content = await fs.readFile(file);
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      res.end(content);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.PORTFOLIO_BROWSER, headless: true });
    for (const settings of [
      { viewport: { width: 1440, height: 900 } },
      { viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true },
      { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' },
    ]) {
      const context = await browser.newContext(settings);
      let requests = 0;
      let responseCode = 200;
      let submitted;
      const errors = [];
      await context.route('**/*', async route => {
        const url = route.request().url();
        if (url === base + '/api/contact') {
          requests++;
          submitted = route.request().postDataJSON();
          await new Promise(resolve => setTimeout(resolve, 250));
          return route.fulfill({ status: responseCode, contentType: 'application/json', body: JSON.stringify(responseCode === 200 ? { ok: true } : { blad: '<b>test błędu</b>' }) });
        }
        if (!url.startsWith(base + '/')) return route.abort();
        return route.continue();
      });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base);
      await page.waitForFunction(() => !document.querySelector('#kontakt-form fieldset').disabled);
      assert.match(await page.locator('h1').innerText(), /Zamieniam ręczne procesy/);
      assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'page overflow');
      await page.locator('#kontakt-imie').fill('Test');
      await page.locator('#kontakt-email').fill('test@example.invalid');
      await page.locator('#kontakt-tresc').fill('Test formularza — dane syntetyczne.');
      await page.evaluate(() => {
        document.dispatchEvent(new Event('astro:page-load'));
        const form = document.querySelector('#kontakt-form');
        form.requestSubmit(); form.requestSubmit();
      });
      await page.waitForFunction(() => document.querySelector('#kontakt-status').textContent.includes('wysłane'));
      assert.equal(requests, 1, 'duplicate submission');
      assert.equal(submitted.name, 'Test');
      assert.equal(await page.locator('#kontakt-tresc').inputValue(), '');
      assert.equal(await page.locator('#kontakt-imie').isEnabled(), true);
      responseCode = 429;
      await page.locator('#kontakt-imie').fill('Test');
      await page.locator('#kontakt-email').fill('test@example.invalid');
      await page.locator('#kontakt-tresc').fill('Zachowaj po błędzie.');
      await page.locator('#kontakt-form').evaluate(form => form.requestSubmit());
      await page.waitForFunction(() => document.querySelector('#kontakt-status').textContent.includes('test błędu'));
      assert.equal(await page.locator('#kontakt-status b').count(), 0, 'error interpreted as HTML');
      assert.equal(await page.locator('#kontakt-tresc').inputValue(), 'Zachowaj po błędzie.');
      responseCode = 503;
      await page.locator('#kontakt-form').evaluate(form => form.requestSubmit());
      await page.locator('#kontakt-status a[href^="mailto:"]').waitFor();
      assert.equal(await page.locator('#kontakt-imie').isEnabled(), true);
      if (!settings.isMobile) {
        await page.locator('#terminal-fab').click();
        await page.keyboard.press('Tab');
        assert.equal(await page.locator('#terminal-zamknij').evaluate(el => el === document.activeElement), true);
        await page.keyboard.press('Shift+Tab');
        assert.equal(await page.locator('#terminal-in').evaluate(el => el === document.activeElement), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#terminal-fab').evaluate(el => el === document.activeElement), true);
      }
      await page.locator('a[href="/case-studies/planer"]').click();
      await page.waitForURL('**/case-studies/planer');
      await page.getByRole('link', { name: /zapytaj_o_projekt/ }).click();
      await page.waitForURL('**/#kontakt');
      await page.waitForFunction(() => !document.querySelector('#kontakt-form fieldset').disabled);
      assert.deepEqual(errors, []);
      console.log('PASS UI:', JSON.stringify(settings));
      await context.close();
    }
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(base);
    assert.equal(await page.locator('#kontakt-imie').isDisabled(), true);
    assert.equal(await page.locator('#kontakt-content a[href^="mailto:"]').isVisible(), true);
    assert.equal(await page.locator('#kontakt-form').getAttribute('method'), 'post');
    assert.match(await page.locator('h1').innerText(), /Zamieniam ręczne procesy/);
    console.log('PASS no-JS fallback');
    await context.close();
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
