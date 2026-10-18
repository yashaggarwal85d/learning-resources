// The in-page notes editor, against a fake GitHub API (nothing is sent to GitHub). Usage:
//   node tests/editor.mjs http://localhost:4321/learning-resources/
// Checks: no Edit button without a token; with one, the file loads; text that would fail the build cannot be saved; a save
// sends the sha it read, a commit message with the topic's Unlock line and the edited text; a file that changed on GitHub is
// never overwritten (the differences are shown); the phone panel is a full-height drawer.
import { chromium, devices } from 'playwright';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.argv[2] ?? 'http://localhost:4321/learning-resources/';
const SLUG = 'data-engineering/m1-foundations/ch01-cs-foundations/b-trees-vs-lsm';
const ID = 'de.b-trees-vs-lsm';
const TITLE = 'B+-trees vs LSM-trees at a glance'; // its registry title; the feed holds several reels, so every query is scoped to this one
const FILE = `site/src/topics/${SLUG}/pre-notes.md`;
const original = readFileSync(new URL(`../src/topics/${SLUG}/pre-notes.md`, import.meta.url), 'utf8');
const failures = [];
const fail = (m) => failures.push(m);

const preinstalled = () => {
  const r = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!existsSync(r)) return undefined;
  for (const d of readdirSync(r).filter((d) => d.startsWith('chromium-')).sort().reverse())
    for (const bin of ['chrome-linux/chrome', 'chrome-linux64/chrome']) if (existsSync(`${r}/${d}/${bin}`)) return `${r}/${d}/${bin}`;
};
const browser = await chromium.launch().catch((err) => {
  const exe = preinstalled();
  if (!exe) throw err;
  return chromium.launch({ executablePath: exe });
});

/** A page with a fake GitHub: `remote` is what GET returns, `puts` records each PUT, `putStatus(n)` the answer to the n-th. */
async function open(opts, { token, putStatus = () => 200, remote = original }) {
  const ctx = await browser.newContext(opts);
  if (token) await ctx.addInitScript((t) => localStorage.setItem('lr.edit.token', t), token);
  const state = { puts: [], gets: 0, remote };
  await ctx.route('https://api.github.com/**', async (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      state.gets++;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: Buffer.from(state.remote).toString('base64'), sha: `sha${state.gets}`, encoding: 'base64' }) });
    }
    const body = JSON.parse(req.postData());
    state.puts.push({ url: req.url(), auth: req.headers().authorization, body });
    const status = putStatus(state.puts.length);
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(status === 200 ? { content: { sha: 'newsha' } } : { message: 'conflict' }) });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fail(`page error: ${e.message}`));
  await page.goto(`${root}${SLUG}/`);
  await page.waitForSelector('section[aria-label]', { timeout: 20000 }).catch(() => {});
  return { ctx, page, state };
}
const openPre = async (page) => {
  // The feed holds several reels at once: scope to this topic's own section, as reels.mjs does.
  await page.locator(`section[aria-label=${JSON.stringify(TITLE)}]`).getByRole('button', { name: 'Pre-notes', exact: true }).first().click();
  await page.getByRole('dialog', { name: 'Notes' }).waitFor();
  await page.waitForTimeout(500);
  return page.getByRole('dialog', { name: 'Notes' });
};

// 1. No token: no Edit button.
{
  const { ctx, page } = await open({ viewport: { width: 1440, height: 900 } }, {});
  const d = await openPre(page);
  if (await d.getByRole('button', { name: /^Edit pre-notes$/ }).count()) fail('an Edit button shows without a token');
  if (!(await d.getByText('Editing is off').count())) fail('the panel does not offer to set an edit token');
  await ctx.close();
}

// 2. Token set: edit, validate, save.
{
  const { ctx, page, state } = await open({ viewport: { width: 1440, height: 900 } }, { token: 'test-token' });
  const d = await openPre(page);
  await d.getByRole('button', { name: 'Edit pre-notes', exact: true }).click();
  const ta = d.getByRole('textbox', { name: /pre-notes\.md/ });
  await ta.waitFor();
  if ((await ta.inputValue()) !== original) fail('the editor did not load the file from GitHub');
  const save = d.getByRole('button', { name: 'Save to GitHub' });
  if (!(await save.isDisabled())) fail('Save is enabled before anything changed');
  await ta.fill('- **Only one**: a note.\n');
  if (!(await save.isDisabled())) fail('Save is enabled for pre-notes that fail the build rules');
  if (!(await d.getByLabel('Problems that would fail the build').count())) fail('the problems list is missing for invalid pre-notes');
  const edited = original.replace('- **Index**:', '- **Index (edited)**:');
  await ta.fill(edited);
  await d.getByRole('button', { name: 'Preview', exact: true }).click();
  await page.waitForTimeout(700);
  if (!(await d.locator('.deep strong', { hasText: 'Index (edited)' }).count())) fail('the preview does not show the edited text');
  await d.getByRole('button', { name: 'Markdown', exact: true }).click();
  await save.click();
  await page.waitForTimeout(700);
  const put = state.puts[0];
  if (!put) fail('Save sent nothing');
  else {
    if (!put.url.endsWith(`/contents/${FILE}`)) fail(`saved to ${put.url}`);
    if (put.auth !== 'Bearer test-token') fail('the token was not sent as a Bearer token');
    if (put.body.sha !== 'sha1') fail(`the save quoted sha ${put.body.sha}, not the one it read`);
    if (put.body.branch !== 'main') fail(`the save went to branch ${put.body.branch}`);
    if (Buffer.from(put.body.content, 'base64').toString('utf8') !== edited) fail('the saved text differs from the edited text');
    if (!put.body.message.includes(`Unlock: ${ID}`)) fail('the commit message has no Unlock line for the topic');
  }
  if (!(await d.getByRole('status').filter({ hasText: 'Saved to GitHub' }).count())) fail('no "Saved to GitHub" state after a save');
  if (!(await d.getByRole('status').filter({ hasText: 'about 4 min' }).count())) fail('the saved state does not say when it goes live');
  if (!(await d.locator('.deep strong', { hasText: 'Index (edited)' }).count())) fail('the panel does not show the saved text');
  await ctx.close();
}

// 3. The file changed on GitHub: never overwrite, show the differences.
{
  const { ctx, page, state } = await open({ viewport: { width: 1440, height: 900 } }, { token: 'test-token', putStatus: () => 409 });
  const d = await openPre(page);
  await d.getByRole('button', { name: 'Edit pre-notes', exact: true }).click();
  const ta = d.getByRole('textbox', { name: /pre-notes\.md/ });
  await ta.waitFor();
  const mine = original.replace('- **Index**:', '- **Index (mine)**:');
  await ta.fill(mine);
  state.remote = original.replace('- **Index**:', '- **Index (theirs)**:');
  await d.getByRole('button', { name: 'Save to GitHub' }).click();
  await page.waitForTimeout(800);
  if (state.puts.length !== 1) fail(`a conflicting save was sent ${state.puts.length} times`);
  if (!(await d.getByRole('alert').filter({ hasText: 'Nothing was overwritten' }).count())) fail('no conflict message');
  const diff = await d.getByLabel('Differences from the version on GitHub').innerText().catch(() => '');
  if (!diff.includes('Index (theirs)') || !diff.includes('Index (mine)')) fail('the conflict view does not show both versions');
  if (await d.getByRole('button', { name: 'Save to GitHub' }).count()) fail('the conflict view still offers to save over GitHub’s version');
  await d.getByRole('button', { name: 'Take GitHub’s version' }).click();
  if (!(await ta.inputValue()).includes('Index (theirs)')) fail('taking GitHub’s version did not load it');
  await ctx.close();
}

// 4. A phone gets a full-height drawer, and the editor fits in it.
{
  const { ctx, page } = await open({ ...devices['iPhone 13'] }, { token: 'test-token' });
  const d = await openPre(page);
  await d.getByRole('button', { name: 'Edit pre-notes', exact: true }).click();
  await d.getByRole('textbox', { name: /pre-notes\.md/ }).waitFor();
  const box = await d.boundingBox();
  const vp = page.viewportSize();
  if (!box || box.width < vp.width - 2 || box.height < vp.height - 2) fail(`the phone editor is ${Math.round(box?.width ?? 0)}x${Math.round(box?.height ?? 0)} in ${vp.width}x${vp.height}`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (sw > 0) fail(`the phone editor scrolls sideways by ${sw}px`);
  await ctx.close();
}

await browser.close();
if (failures.length) {
  console.error(`Editor test failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('Editor test passed: token gate, validation, save with sha and Unlock line, conflict without overwrite, phone drawer.');
