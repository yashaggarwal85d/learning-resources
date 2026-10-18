// Runs every pre-ship check from ROUTINE.md (sections 5 and 8) in one command and prints a timing summary.
//   node scripts/check-all.mjs                  all checks (from the repo root or site/)
//   node scripts/check-all.mjs --only reels     just the named checks (locked, docs, sources, build, narration, reels, links)
//   node scripts/check-all.mjs --skip links     everything except the named checks
//   node scripts/check-all.mjs --only reels --topic asymptotic-notation   the reel test for matching reels only (while fixing)
//   node scripts/check-all.mjs --changed [base]  every check, with the reel and link checks limited to what the changes
//                                                from <base> (default origin/main) can affect (scripts/affected.mjs);
//                                                all reels and links when shared code changed
// Order is cheapest first. A failing check doesn't stop the others (so one run lists every problem), except that
// reels needs a good build. Starts and stops `astro preview` itself. Exit code 1 if any check failed.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = `${root}/site`;
const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1].split(',') : null);
const only = arg('--only');
const skip = arg('--skip') ?? [];
let topic = arg('--topic')?.[0];
let linkFiles = [];
if (process.argv.includes('--changed')) {
  const { affected } = await import('./affected.mjs');
  const base = process.argv[process.argv.indexOf('--changed') + 1];
  const a = affected(base && !base.startsWith('--') ? base : 'origin/main');
  if (!a.all) {
    topic = a.slugs.length ? a.slugs.join(',') : 'none';
    linkFiles = a.mdx.length ? a.mdx : null; // null: no topic changed, no links to check
  }
  console.log(a.all ? 'changed: shared code, so every reel and link is checked' : `changed: ${a.slugs.length ? a.slugs.join(', ') : 'no reel'}`);
}
const PORT = 4321;
const URL_ROOT = `http://127.0.0.1:${PORT}/learning-resources/`;

// npm and npx are .cmd files on Windows and only start through a shell.
const shell = process.platform === 'win32';
const env = process.env;
const run = (cmd, args, cwd = site, extra = {}) => spawnSync(cmd, args, { cwd, stdio: 'inherit', shell, env: { ...env, ...extra } }).status === 0;
// The reel test runs on a build that also has pages for held topics (finished, waiting for earlier topics), so they are
// tested before they ship; the build check above is the real, live-only site.
const HELD = { PREVIEW_HELD: '1' };

async function withPreview(fn) {
  const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], { cwd: site, stdio: 'ignore', shell });
  try {
    for (let i = 0; i < 60; i++) {
      if (await fetch(URL_ROOT).then((r) => r.ok, () => false)) return fn();
      await sleep(500);
    }
    console.error('astro preview did not start');
    return false;
  } finally {
    server.kill();
    // Astro's preview keeps running in the background after the command exits; stop it so the next run starts clean.
    spawnSync('npx', ['astro', 'preview', 'stop'], { cwd: site, stdio: 'ignore', shell });
  }
}

const results = {};
const checks = [
  ['locked', () => run('node', ['scripts/check-locked.mjs'], root)],
  ['docs', () => run('node', ['scripts/check-docs.mjs'], root)],
  // Quotes in SOURCES.md, word for word against the fetched sources, for the topics being checked (--topic or --changed).
  ['sources', () => {
    const folders = (topic && topic !== 'none' ? topic.split(',') : []).map((t) => `site/src/topics/${t}`).filter((f) => existsSync(`${root}/${f}/SOURCES.md`));
    if (!folders.length) return console.log('no SOURCES.md to check for these topics'), true;
    return folders.every((f) => run('node', ['scripts/sources.mjs', 'check', f], root));
  }],
  ['build', () => run('npm', ['run', 'build'])],
  ['narration', () => run('npm', ['run', 'test:narration'])],
  ['reels', () => (results.build?.ok === false ? (console.error('skipped: build failed'), false) : run('npm', ['run', 'build'], site, HELD) && withPreview(() => run('npm', ['run', 'test:reels', '--', URL_ROOT, ...(topic ? [topic] : [])], site, HELD)))],
  ['links', () => (linkFiles === null ? (console.log('no topic changed: no links to check'), true) : run('node', ['scripts/check-links.mjs', ...linkFiles], root))],
];

for (const [name, fn] of checks) {
  if ((only && !only.includes(name)) || skip.includes(name)) continue;
  console.log(`\n=== ${name} ===`);
  const start = Date.now();
  const ok = await fn();
  results[name] = { ok, secs: (Date.now() - start) / 1000 };
}

console.log('\nCheck summary');
for (const [name, r] of Object.entries(results)) console.log(`  ${r.ok ? 'pass' : 'FAIL'}  ${name.padEnd(10)} ${r.secs.toFixed(1)}s`);
process.exit(Object.values(results).every((r) => r.ok) ? 0 : 1);
