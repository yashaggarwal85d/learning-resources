import { chromium, devices } from 'playwright';
const [url, out, tag] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
await page.goto(url, { waitUntil: 'networkidle' });
const reel = page.locator('section[aria-label]').first();
for (let k = 0; k < 12; k++) { await reel.locator('[aria-label^="Step "]').nth(k % 2).click(); await page.waitForTimeout(80); }
await reel.locator('[aria-label^="Step "]').nth(1).click();
await page.waitForTimeout(2000);
const n = await page.evaluate(() => ({ bodies: document.querySelectorAll('.reel-body').length, visuals: document.querySelectorAll('[data-visual]').length }));
console.log(tag, JSON.stringify(n));
await page.screenshot({ path: `${out}/${tag}-flip.png` });
await browser.close();
