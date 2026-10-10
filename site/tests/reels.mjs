// Smoke test for every live reel, run in CI after the build (QUALITY.md lists
// the issues each check guards against). Usage:
//   node tests/reels.mjs http://localhost:4321/learning-resources/
// Fails (exit 1) on any page error, sideways scroll, empty panel, missing
// control, or a step that doesn't render, at desktop and phone sizes.
import { chromium, devices } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const root = process.argv[2] ?? 'http://localhost:4321/learning-resources/';
const slugs = [...readFileSync(new URL('../src/topics/registry.ts', import.meta.url), 'utf8').matchAll(/slug: '([^']+)',[\s\S]*?status: '(live|held)'/g)]
  .filter((m) => m[2] === 'live')
  .map((m) => m[1]);
const failures = [];
const fail = (msg) => failures.push(msg);
mkdirSync('test-results', { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const [device, opts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['phone', { ...devices['iPhone 13'] }],
]) {
  for (const slug of slugs) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const where = `${device} ${slug}`;
    page.on('pageerror', (e) => fail(`${where}: page error: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && fail(`${where}: console error: ${m.text()}`));
    await page.goto(`${root}${slug}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Playback controls exist (issue: no way to pause or restart).
    for (const name of [/^(Pause|Play) \(P\)$/, /^Replay this step/, /^Restart the reel/]) {
      if (!(await page.getByRole('button', { name }).count())) fail(`${where}: missing control ${name}`);
    }
    // Pause really freezes the clock.
    const bar = () => page.locator('[aria-label^="Step "] span span').first().evaluate((e) => parseFloat(e.style.width));
    await page.getByRole('button', { name: /^(Pause|Play) \(P\)$/ }).click();
    const a = await bar();
    await page.waitForTimeout(700);
    if ((await bar()) !== a) fail(`${where}: pause does not freeze the step`);
    await page.getByRole('button', { name: /^(Pause|Play) \(P\)$/ }).click();

    // Every step renders; predict steps can be answered.
    const steps = await page.locator('[aria-label^="Step "]').count();
    if (!steps) fail(`${where}: no steps`);
    for (let i = 0; i < steps; i++) {
      await page.locator('[aria-label^="Step "]').nth(i).click();
      await page.waitForTimeout(400);
      await page.keyboard.press('ArrowRight'); // finish the animation
      await page.waitForTimeout(250);
      const options = page.locator('section button.rounded-xl:not([disabled])');
      if (await options.count()) {
        await options.first().click();
        await page.waitForTimeout(250);
      }
      const visual = await page.locator('section [data-visual]').last().evaluate((el) => el.querySelectorAll('svg, pre').length + el.innerText.trim().length);
      if (!visual) fail(`${where}: step ${i + 1} has an empty visual`);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (sw > 0) fail(`${where}: step ${i + 1} scrolls sideways by ${sw}px`);
      await page.screenshot({ path: `test-results/${device}-${slug.split('/').pop()}-${String(i + 1).padStart(2, '0')}.png` });
    }

    // Panels open with content, and still do on the second open (issue: empty sheet after reopening).
    for (const [button, label] of [['Prerequisites', 'Prerequisites'], ['Deep dive', 'Deep dive'], ['Sources', 'Deep dive'], ['Prerequisites', 'Prerequisites']]) {
      await page.getByRole('button', { name: button, exact: true }).first().click();
      await page.waitForTimeout(700);
      const text = await page.getByRole('dialog', { name: label }).innerText().catch(() => '');
      if (text.length < 200) fail(`${where}: ${button} panel is empty or missing`);
      const sameTab = await page.locator('[role="dialog"] a[href^="http"]:not([target="_blank"])').count();
      if (sameTab) fail(`${where}: ${sameTab} outside link(s) in ${button} open in the same tab`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
    await ctx.close();
  }
}
await browser.close();
if (failures.length) {
  console.error(`Reel smoke test failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`Reel smoke test passed: ${slugs.length} live reel(s) at desktop and phone sizes.`);
