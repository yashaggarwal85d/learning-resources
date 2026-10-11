// Smoke test for every live reel, run in CI after the build (QUALITY.md lists
// the issues each check guards against). Usage:
//   node tests/reels.mjs http://localhost:4321/learning-resources/
// Fails (exit 1) on any page error, sideways scroll, empty panel, missing
// control, or a step that doesn't render, at desktop and phone sizes.
import { chromium, devices } from 'playwright';
import { readFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';

const root = process.argv[2] ?? 'http://localhost:4321/learning-resources/';
const slugs = [...readFileSync(new URL('../src/topics/registry.ts', import.meta.url), 'utf8').matchAll(/slug: '([^']+)',[\s\S]*?status: '(live|held)'/g)]
  .filter((m) => m[2] === 'live')
  .map((m) => m[1]);
const failures = [];
const fail = (msg) => failures.push(msg);
mkdirSync('test-results', { recursive: true });

// Browser: CHROMIUM_PATH if set, else Playwright's own; if that isn't installed (e.g. a cloud session with a
// pre-installed Chromium of another build), fall back to any Chromium under PLAYWRIGHT_BROWSERS_PATH or /opt/pw-browsers.
const preinstalled = () => {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!existsSync(root)) return undefined;
  for (const d of readdirSync(root).filter((d) => d.startsWith('chromium-')).sort().reverse())
    for (const bin of ['chrome-linux/chrome', 'chrome-linux64/chrome']) if (existsSync(`${root}/${d}/${bin}`)) return `${root}/${d}/${bin}`;
};
const browser = await chromium
  .launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  .catch((err) => {
    const exe = preinstalled();
    if (!exe) throw err;
    return chromium.launch({ executablePath: exe });
  });
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

    // Touch gestures on phones: swipe left = next step, swipe right = previous, a vertical swipe leaves the step alone.
    if (device === 'phone') {
      const cdp = await ctx.newCDPSession(page);
      const drag = async (x0, y0, x1, y1) => {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
        for (let k = 1; k <= 8; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * k) / 8, y: y0 + ((y1 - y0) * k) / 8 }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(500);
      };
      const stepNow = async () => (await page.locator('[aria-current="step"]').getAttribute('aria-label'))?.match(/^Step (\d+)/)?.[1];
      // Swipe from a plain step (a predict step waits for an answer; checked below).
      const dots = page.locator('[aria-label^="Step "]');
      const nDots = await dots.count();
      let from = -1;
      for (let i = 1; i < nDots - 1 && from < 0; i++) if ((await dots.nth(i).getAttribute('data-predict')) === null) from = i;
      await dots.nth(from).click();
      await page.waitForTimeout(400);
      const box = await page.locator('section [data-visual]').last().boundingBox();
      const y = box.y + box.height / 2;
      const s0 = await stepNow();
      await drag(320, y, 70, y);
      const s1 = await stepNow();
      if (Number(s1) !== Number(s0) + 1) fail(`${where}: swipe left didn't go to the next step (${s0} -> ${s1})`);
      await drag(70, y, 320, y);
      const s2 = await stepNow();
      if (Number(s2) !== Number(s0)) fail(`${where}: swipe right didn't go back (${s1} -> ${s2})`);
      // On an unanswered predict step, swiping left must not skip the question.
      const firstPredict = await page.locator('[aria-label^="Step "][data-predict]').first();
      if (await firstPredict.count()) {
        await firstPredict.click();
        await page.waitForTimeout(400);
        const p0 = await stepNow();
        await drag(320, y, 70, y);
        if ((await stepNow()) !== p0) fail(`${where}: swipe left skipped an unanswered predict step (${p0})`);
      }
      // A swipe must work wherever it starts, on every step (code panels and charts must not swallow it).
      const total = await page.locator('[aria-label^="Step "]').count();
      for (let i = 1; i < total; i++) {
        await page.locator('[aria-label^="Step "]').nth(i).click();
        await page.waitForTimeout(500);
        for (const x0 of [60, 200]) {
          await drag(x0, y, x0 + 250 > 380 ? 380 : x0 + 250, y);
          const now = Number(await stepNow());
          if (now !== i) fail(`${where}: swipe right from x=${x0} on step ${i + 1} went to step ${now} instead of ${i}`);
          await page.locator('[aria-label^="Step "]').nth(i).click();
          await page.waitForTimeout(300);
        }
      }
      // ...including from the caption (title and text): it is its own scroll container, and a swipe there used to be cancelled by the browser (QUALITY.md #36).
      for (const i of [1, from]) {
        await page.locator('[aria-label^="Step "]').nth(i).click();
        await page.waitForTimeout(500);
        const cap = await page.locator('[aria-roledescription="reel"] h2').last().boundingBox();
        for (const [x0, x1, delta] of [[290, 60, 1], [60, 290, -1]]) {
          const before = Number(await stepNow());
          if (delta === 1 && (await page.locator(`[aria-label^="Step ${before}:"][data-predict]`).count())) continue; // an unanswered predict step holds
          await drag(x0, cap.y + cap.height / 2, x1, cap.y + cap.height / 2);
          const now = Number(await stepNow());
          if (now !== before + delta && !(before === 1 && delta === -1)) fail(`${where}: swipe from the caption on step ${before} went to ${now}`);
          await page.locator('[aria-label^="Step "]').nth(i).click();
          await page.waitForTimeout(300);
        }
      }
      // A tap works like Instagram stories: right side = next step at once (even mid-animation), left third = previous.
      const tap = async (x, yy) => {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: yy }] });
        await page.waitForTimeout(60);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(500);
      };
      await page.locator('[aria-label^="Step "]').nth(from).click();
      await page.waitForTimeout(300); // the step is still animating
      const t0 = Number(await stepNow());
      await tap(250, y);
      if (Number(await stepNow()) !== t0 + 1) fail(`${where}: a tap on the right didn't go to the next step at once (${t0} -> ${await stepNow()})`);
      await tap(40, y);
      if (Number(await stepNow()) !== t0) fail(`${where}: a tap on the left didn't go back (${await stepNow()} instead of ${t0})`);
      const before = await stepNow();
      await drag(200, y, 210, y - 120);
      await page.evaluate(() => document.querySelector('.snap-y')?.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(300);
      if ((await stepNow()) !== before) fail(`${where}: a vertical swipe changed the step (${before} -> ${await stepNow()})`);
      await cdp.detach();
    }

    // Narration (when the reel has it): sound on shows captions that advance; pause freezes them; the next step switches clip.
    const soundOn = page.getByRole('button', { name: /^Turn narration on/ });
    if (await soundOn.count()) {
      await page.locator('[aria-label^="Step "]').first().click();
      await soundOn.click();
      await page.waitForTimeout(2500);
      // Where the captions are: the line on screen and how many of its words are lit.
      const at = async () => `${await page.locator('[aria-live="off"] p').innerText().catch(() => '')}|${await page.locator('[aria-live="off"] p span.text-crema').count()}`;
      const a1 = await at();
      await page.waitForTimeout(1500);
      const a2 = await at();
      if (a1 === a2 || a1.endsWith('|0')) fail(`${where}: narration captions don't advance (${a1} -> ${a2})`);
      await page.getByRole('button', { name: /^(Pause|Play) \(P\)$/ }).click();
      const p1 = await at();
      await page.waitForTimeout(1200);
      if ((await at()) !== p1) fail(`${where}: narration keeps going while paused`);
      await page.getByRole('button', { name: /^(Pause|Play) \(P\)$/ }).click();
      const first = await page.locator('[aria-live="off"] p').innerText();
      await page.locator('[aria-label^="Step "]').nth(2).click();
      await page.waitForTimeout(2500);
      const second = await page.locator('[aria-live="off"] p').innerText().catch(() => '');
      if (!second || second === first) fail(`${where}: narration didn't switch clips with the step`);
      await page.getByRole('button', { name: /^Turn narration off/ }).click();
    }

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
