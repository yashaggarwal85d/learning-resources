// Smoke test for every live reel, run in CI after the build (QUALITY.md lists
// the issues each check guards against). Usage:
//   node tests/reels.mjs http://localhost:4321/learning-resources/ [slug-part,slug-part,...]
// With slug parts (e.g. asymptotic-notation), only the matching reels are tested; "none" tests no reel.
// With PREVIEW_HELD=1 (and a site built with it), held topics are tested too.
// scripts/affected.mjs picks the parts for a change (check-all --changed, and CI).
// Fails (exit 1) on any page error, sideways scroll, empty panel, missing
// control, a step that doesn't render, or text in a drawing that is clipped,
// overlaps or runs into other text, or is too small to read, at desktop and phone sizes.
import { chromium, devices } from 'playwright';
import { readFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';

const root = process.argv[2] ?? 'http://localhost:4321/learning-resources/';
// Each reel to test, with its title: the feed holds several reels at once, so every check is scoped to this reel's
// section (labelled with the title), never to the whole page.
const parts = process.argv[3] ? process.argv[3].split(',').filter(Boolean) : null;
const slugs = [...readFileSync(new URL('../src/topics/registry.ts', import.meta.url), 'utf8').matchAll(/slug: '([^']+)',\s*title: '((?:[^'\\]|\\.)*)',[\s\S]*?status: '(live|held)'/g)]
  .map((m) => [m[0], m[1], m[3], m[2].replace(/\\'/g, "'")])
  // Held topics (PREVIEW_HELD=1 builds give them pages) are tested when named: on their own branch and in CI for a push
  // that changes them. A full sweep tests live reels; a held topic gets the full test again when it is released.
  .filter((m) => (m[2] === 'live' ? !parts || parts.some((p) => m[1].includes(p)) : m[2] === 'held' && process.env.PREVIEW_HELD === '1' && !!parts && parts.some((p) => m[1].includes(p))))
  .map((m) => ({ slug: m[1], title: m[3] }));
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
// Text in the step's drawing, at its finished state: every visible piece of text must sit inside the drawing,
// must not overlap another piece of text, and must be at least MIN_TEXT_PX tall on screen (QUALITY.md #16-18, #36).
const MIN_TEXT_PX = 9; // 13 units on the 600-unit canvas at phone width, with the phone text scale
const layoutProblems = (reel) =>
  reel.locator('[data-visual]').last().evaluate((root, minPx) => {
    const box = root.getBoundingClientRect();
    const seen = (el) => {
      for (let e = el; e && e !== root.parentElement; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.15) return false;
        // Screen-reader-only text (sr-only: clipped to a 1 px box) is meant to be invisible.
        if ((cs.clip && cs.clip !== 'auto' && /rect\(0/.test(cs.clip)) || (cs.overflow === 'hidden' && e.getBoundingClientRect().width <= 1)) return false;
      }
      return true;
    };
    const items = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent.trim();
      if (!text || !seen(n.parentElement)) continue;
      const svgText = n.parentElement.closest('text');
      const r = svgText ? svgText.getBoundingClientRect() : (() => { const g = document.createRange(); g.selectNodeContents(n); return g.getBoundingClientRect(); })();
      if (r.width < 1 || r.height < 1) continue;
      if (items.some((x) => x.node === (svgText ?? n))) continue;
      // The block an HTML text run flows in: pieces of one sentence (styled spans) sit flush by design.
      let block = n.parentElement;
      while (block && block !== root && getComputedStyle(block).display.startsWith('inline')) block = block.parentElement;
      items.push({ node: svgText ?? n, text: text.slice(0, 40), r, code: !!n.parentElement.closest('pre'), block: svgText ? null : block });
    }
    const out = [];
    for (const { text, r, node } of items) {
      const el = node.nodeType === 1 ? node : node.parentElement;
      if (r.left < box.left - 2 || r.right > box.right + 2 || r.top < box.top - 2 || r.bottom > box.bottom + 2) out.push(`text "${text}" runs outside the drawing`);
      else if (el.scrollWidth > el.clientWidth + 2 && ['hidden', 'clip'].includes(getComputedStyle(el).overflowX)) out.push(`text "${text}" is cut off`);
      const h = r.height; // rendered line height, so scaled drawings count at their real size
      if (h < minPx) out.push(`text "${text}" is ${h.toFixed(1)}px tall (minimum ${minPx})`);
    }
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i].r, b = items[j].r;
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w > 2 && h > 2 && w * h > 0.15 * Math.min(a.width * a.height, b.width * b.height)) out.push(`text "${items[i].text}" overlaps "${items[j].text}"`);
        // Side by side on one line with no visible gap (code tokens sit flush by design, so code is left out).
        else if (!items[i].code && !items[j].code && !(items[i].block && items[i].block === items[j].block) && w > -4 && h > 0.5 * Math.min(a.height, b.height)) out.push(`text "${items[i].text}" runs into "${items[j].text}"`);
      }
    return out;
  }, MIN_TEXT_PX);

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
  for (const { slug, title } of slugs) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const where = `${device} ${slug}`;
    page.on('pageerror', (e) => fail(`${where}: page error: ${e.message}`));
    // A reel without narration yet (it is made last, ROUTINE.md section 7) asks for a manifest that isn't there; whether
    // narration exists is test:narration's job, so that one 404 is not an error here. Every other console error is.
    const noNarrationYet = (m) => m.text().startsWith('Failed to load resource') && /\/audio\/[^/]+\/manifest\.json$/.test(m.location().url ?? '');
    page.on('console', (m) => m.type() === 'error' && !noNarrationYet(m) && fail(`${where}: console error: ${m.text()}`));
    await page.goto(`${root}${slug}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready); // measure text in the real fonts, never a fallback
    const reel = page.locator(`section[aria-label=${JSON.stringify(title)}]`);
    if (!(await reel.count())) fail(`${where}: no reel section titled "${title}"`);
    await page.waitForTimeout(800);

    // Playback controls exist (issue: no way to pause or restart).
    for (const name of [/^(Pause|Play) \(P\)$/, /^Replay this step/, /^Restart the reel/]) {
      if (!(await reel.getByRole('button', { name }).count())) fail(`${where}: missing control ${name}`);
    }
    // Pause really freezes the clock.
    const bar = () => reel.locator('[aria-label^="Step "] span span').first().evaluate((e) => parseFloat(e.style.width));
    await reel.getByRole('button', { name: /^(Pause|Play) \(P\)$/ }).click();
    const a = await bar();
    await page.waitForTimeout(700);
    if ((await bar()) !== a) fail(`${where}: pause does not freeze the step`);
    await reel.getByRole('button', { name: /^(Pause|Play) \(P\)$/ }).click();

    // Touch gestures on phones: swipe left = next step, swipe right = previous, a vertical swipe leaves the step alone.
    if (device === 'phone') {
      const cdp = await ctx.newCDPSession(page);
      const drag = async (x0, y0, x1, y1) => {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
        for (let k = 1; k <= 8; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * k) / 8, y: y0 + ((y1 - y0) * k) / 8 }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(500);
      };
      const stepNow = async () => (await reel.locator('[aria-current="step"]').getAttribute('aria-label'))?.match(/^Step (\d+)/)?.[1];
      // Swipe from a plain step (a predict step waits for an answer; checked below).
      const dots = reel.locator('[aria-label^="Step "]');
      const nDots = await dots.count();
      let from = -1;
      for (let i = 1; i < nDots - 1 && from < 0; i++) if ((await dots.nth(i).getAttribute('data-predict')) === null) from = i;
      await dots.nth(from).click();
      await page.waitForTimeout(400);
      const box = await reel.locator('[data-visual]').last().boundingBox();
      const y = box.y + box.height / 2;
      const s0 = await stepNow();
      await drag(320, y, 70, y);
      const s1 = await stepNow();
      if (Number(s1) !== Number(s0) + 1) fail(`${where}: swipe left didn't go to the next step (${s0} -> ${s1})`);
      await drag(70, y, 320, y);
      const s2 = await stepNow();
      if (Number(s2) !== Number(s0)) fail(`${where}: swipe right didn't go back (${s1} -> ${s2})`);
      // On an unanswered predict step, swiping left must not skip the question.
      const firstPredict = await reel.locator('[aria-label^="Step "][data-predict]').first();
      if (await firstPredict.count()) {
        await firstPredict.click();
        await page.waitForTimeout(400);
        const p0 = await stepNow();
        for (let k = 0; k < 3; k++) await drag(320, y, 70, y);
        if ((await stepNow()) !== p0) fail(`${where}: swipe left skipped an unanswered predict step (${p0})`);
        // Each of those swipes nudges the options; the step's text must still be there once (QUALITY.md #48: it piled up).
        const bodies = await reel.locator('.reel-body').count();
        if (bodies !== 1) fail(`${where}: after swiping on an unanswered predict step its text is shown ${bodies} times`);
      }
      // A swipe must work wherever it starts, on every step (code panels and charts must not swallow it).
      const total = await reel.locator('[aria-label^="Step "]').count();
      for (let i = 1; i < total; i++) {
        await reel.locator('[aria-label^="Step "]').nth(i).click();
        await page.waitForTimeout(500);
        for (const x0 of [60, 200]) {
          await drag(x0, y, x0 + 250 > 380 ? 380 : x0 + 250, y);
          const now = Number(await stepNow());
          if (now !== i) fail(`${where}: swipe right from x=${x0} on step ${i + 1} went to step ${now} instead of ${i}`);
          await reel.locator('[aria-label^="Step "]').nth(i).click();
          await page.waitForTimeout(300);
        }
      }
      // ...including from the caption (title and text): it is its own scroll container, and a swipe there used to be cancelled by the browser (QUALITY.md #36).
      for (const i of [1, from]) {
        await reel.locator('[aria-label^="Step "]').nth(i).click();
        await page.waitForTimeout(500);
        const cap = await reel.locator('[aria-roledescription="reel"] h2').last().boundingBox();
        for (const [x0, x1, delta] of [[290, 60, 1], [60, 290, -1]]) {
          const before = Number(await stepNow());
          if (delta === 1 && (await reel.locator(`[aria-label^="Step ${before}:"][data-predict]`).count())) continue; // an unanswered predict step holds
          await drag(x0, cap.y + cap.height / 2, x1, cap.y + cap.height / 2);
          const now = Number(await stepNow());
          if (now !== before + delta && !(before === 1 && delta === -1)) fail(`${where}: swipe from the caption on step ${before} went to ${now}`);
          await reel.locator('[aria-label^="Step "]').nth(i).click();
          await page.waitForTimeout(1500); // the leaving step's caption must be gone (a swipe that starts on it loses its pointerup, QUALITY.md #49); after a swipe into a predict step the caption area is still re-flowing, and a swipe starting on its option buttons is (rightly) ignored
        }
      }
      // A tap works like Instagram stories: right side = next step at once (even mid-animation), left third = previous.
      const tap = async (x, yy) => {
        // A real finger drifts a little while it taps (a few pixels); the browser may then cancel the pointer, but still sends a click.
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: yy }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 3, y: yy + 7 }] });
        await page.waitForTimeout(60);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(500);
      };
      await reel.locator('[aria-label^="Step "]').nth(from).click();
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
    const soundOn = reel.getByRole('button', { name: /^Turn narration on/ });
    if (await soundOn.count()) {
      await reel.locator('[aria-label^="Step "]').first().click();
      await soundOn.click();
      await page.waitForTimeout(2500);
      // Where the captions are: the line on screen and how many of its words are lit.
      const at = async () => `${await reel.locator('[aria-live="off"] p').innerText().catch(() => '')}|${await reel.locator('[aria-live="off"] p span.text-crema').count()}`;
      const a1 = await at();
      await page.waitForTimeout(1500);
      const a2 = await at();
      if (a1 === a2 || a1.endsWith('|0')) fail(`${where}: narration captions don't advance (${a1} -> ${a2})`);
      await reel.getByRole('button', { name: /^(Pause|Play) \(P\)$/ }).click();
      // The pause lands a frame or two after the click (a React effect); sample once it shows, or a word lit in between reads as moving.
      await reel.getByRole('button', { name: 'Play (P)' }).waitFor({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(200);
      const p1 = await at();
      await page.waitForTimeout(1200);
      if ((await at()) !== p1) fail(`${where}: narration keeps going while paused`);
      await reel.getByRole('button', { name: /^(Pause|Play) \(P\)$/ }).click();
      const first = await reel.locator('[aria-live="off"] p').innerText();
      await reel.locator('[aria-label^="Step "]').nth(2).click();
      await page.waitForTimeout(2500);
      const second = await reel.locator('[aria-live="off"] p').innerText().catch(() => '');
      if (!second || second === first) fail(`${where}: narration didn't switch clips with the step`);
      await reel.getByRole('button', { name: /^Turn narration off/ }).click();
    }

    // Every step renders; predict steps can be answered.
    const steps = await reel.locator('[aria-label^="Step "]').count();
    if (!steps) fail(`${where}: no steps`);
    for (let i = 0; i < steps; i++) {
      await reel.locator('[aria-label^="Step "]').nth(i).click();
      // Let the step's own clock finish (its progress bar fills); a key press to skip the animation could move on a step.
      await page
        .waitForFunction((el) => parseFloat(el.querySelector('span span')?.style.width ?? '0') >= 99, await reel.locator('[aria-current="step"]').elementHandle(), { timeout: 20000 })
        .catch(() => fail(`${where}: step ${i + 1} never finished its animation`));
      await page.waitForTimeout(300);
      // A question step (its dot is marked data-predict) shows its answer options in a two-column grid in the caption.
      const options = reel.locator('div.grid-cols-2 > button:not([disabled])');
      if (await reel.locator('[aria-current="step"][data-predict]').count()) {
        // The question frame, as the learner first sees it, for the looks review.
        await page.screenshot({ path: `test-results/${device}-${slug.split('/').pop()}-${String(i + 1).padStart(2, '0')}-q.png` });
        await options.first().click();
        await page.waitForTimeout(600);
      }
      const visual = await reel.locator('[data-visual]').last().evaluate((el) => el.querySelectorAll('svg, pre').length + el.innerText.trim().length);
      if (!visual) fail(`${where}: step ${i + 1} has an empty visual`);
      for (const p of await layoutProblems(reel)) fail(`${where}: step ${i + 1}: ${p}`);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (sw > 0) fail(`${where}: step ${i + 1} scrolls sideways by ${sw}px`);
      await page.screenshot({ path: `test-results/${device}-${slug.split('/').pop()}-${String(i + 1).padStart(2, '0')}.png` });
    }

    // Panels open with content, and still do on the second open (issue: empty sheet after reopening).
    for (const [button, label] of [['Prerequisites', 'Prerequisites'], ['Deep dive', 'Deep dive'], ['Sources', 'Deep dive'], ['Prerequisites', 'Prerequisites']]) {
      await reel.getByRole('button', { name: button, exact: true }).first().click();
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
