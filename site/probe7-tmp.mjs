import { chromium, devices } from 'playwright';
const [url, out, tag] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] }).catch(() => chromium.launch());
const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
await page.goto(url, { waitUntil: 'networkidle' });
const reel = page.locator('section[aria-label]').first();
const count = () => page.evaluate(() => document.querySelectorAll('.reel-body').length);
await reel.locator('[aria-label^="Step "]').nth(0).click();
await reel.getByRole('button', { name: /^Turn narration on/ }).click();
console.log(tag, 'narration on, step 1:', await count());
await reel.locator('[aria-label^="Step "]').nth(1).click();
for (const s of [2, 5, 10, 20, 30]) { await page.waitForTimeout(s === 2 ? 2000 : (s - [2, 5, 10, 20, 30][[2, 5, 10, 20, 30].indexOf(s) - 1]) * 1000); console.log(tag, `step 2 after ${s}s:`, await count()); }
await page.screenshot({ path: `${out}/${tag}-narr.png` });
await browser.close();
