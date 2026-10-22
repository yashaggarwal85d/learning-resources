// The in-page notes editor, against a fake GitHub API (nothing is sent to GitHub). Usage:
//   node tests/editor.mjs http://localhost:4321/learning-resources/
// Checks: the file loads with no credentials; text that would fail the build cannot be saved; a save opens a prefilled
// GitHub issue (topic, file, the sha it read, the exact edited text) instead of writing anywhere; the phone panel is a
// full-height drawer.
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

/** A page with a fake GitHub: `remote` is what GET returns. Any write would show up as a request on `gets`/other methods. */
async function open(opts) {
  const ctx = await browser.newContext(opts);
  const state = { gets: 0, others: [] };
  await ctx.route('https://api.github.com/**', async (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      state.gets++;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: Buffer.from(original).toString('base64'), sha: `sha${state.gets}`, encoding: 'base64' }) });
    }
    state.others.push({ method: req.method(), url: req.url() });
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
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

// 1. The file loads without credentials; invalid text cannot be saved; a valid save opens a prefilled GitHub issue
// (the notes-edit workflow applies it with the repository's NOTES_EDIT_TOKEN) instead of writing to the contents API.
{
  const { ctx, page, state } = await open({ viewport: { width: 1440, height: 900 } });
  const opened = [];
  await ctx.route('https://github.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>issue form</p>' }));
  ctx.on('page', (p) => opened.push(p.url()));
  const auths = [];
  page.on('request', (r) => r.url().startsWith('https://api.github.com/') && auths.push(r.headers().authorization ?? null));
  const d = await openPre(page);
  if (!(await d.getByText('Edits save through a GitHub issue').count())) fail('the panel does not say that edits go through a GitHub issue');
  await d.getByRole('button', { name: 'Edit pre-notes', exact: true }).click();
  const box = d.getByRole('textbox', { name: /pre-notes\.md/ });
  await box.waitFor();
  if (auths.some(Boolean)) fail('the file was read with credentials, although it never sends a token');
  const save = d.getByRole('button', { name: 'Save via GitHub issue', exact: true });
  if (!(await save.isDisabled())) fail('Save is enabled before anything changed');
  await box.fill('- **Only one**: a note.\n');
  if (!(await save.isDisabled())) fail('Save is enabled for pre-notes that fail the build rules');
  if (!(await d.getByLabel('Problems that would fail the build').count())) fail('the problems list is missing for invalid pre-notes');
  const edited = original.replace(/\n$/, '') + '\n- **Write amplification**: bytes written to the device per byte the application writes. *Where you meet it:* compaction tuning.\n';
  await box.fill(edited);
  await d.getByRole('button', { name: 'Preview', exact: true }).click();
  await page.waitForTimeout(700);
  if (!(await d.locator('.deep strong', { hasText: 'Write amplification' }).count())) fail('the preview does not show the edited text');
  await d.getByRole('button', { name: 'Markdown', exact: true }).click();
  await save.click();
  await page.waitForTimeout(1500);
  if (state.others.length) fail(`the save wrote to the contents API (${state.others.map((o) => `${o.method} ${o.url}`).join(', ')})`);
  const url = opened.find((u) => u.startsWith('https://github.com/yashaggarwal85d/learning-resources/issues/new'));
  if (!url) fail(`a save did not open a new GitHub issue (opened: ${opened.join(', ') || 'nothing'})`);
  else {
    const q = new URL(url).searchParams;
    const body = q.get('body') ?? '';
    if (!q.get('title')?.startsWith('[notes-edit] Pre-notes: ')) fail(`the issue title is "${q.get('title')}"`);
    for (const line of [`Topic: ${ID}`, `File: ${FILE}`, 'Base: sha1', 'Kind: pre']) if (!body.includes(line)) fail(`the issue body lacks "${line}"`);
    const fenced = body.match(/^(~{4,})markdown\n([\s\S]*?)\n\1$/m);
    if (!fenced || fenced[2] + '\n' !== edited) fail('the issue body does not carry the edited text exactly, fenced');
  }
  if (!(await d.getByText(/Opened a GitHub issue/).count())) fail('the panel does not say an issue was opened');
  await ctx.close();
}

// 2. A phone gets a full-height drawer, and the editor fits in it.
{
  const { ctx, page } = await open({ ...devices['iPhone 13'] });
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
console.log('Editor test passed: no credentials sent, validation, issue route with sha and exact text, phone drawer.');
