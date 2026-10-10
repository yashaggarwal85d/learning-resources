// Runs every pre-ship check from ROUTINE.md section 6 in one command and prints a timing summary.
//   node scripts/check-all.mjs                  all checks (from the repo root or site/)
//   node scripts/check-all.mjs --only reels     just the named checks (docs, examples, build, narration, reels, links)
//   node scripts/check-all.mjs --skip links     everything except the named checks
// Order is cheapest first. A failing check doesn't stop the others (so one run lists every problem), except that
// reels needs a good build. Starts and stops `astro preview` itself. Exit code 1 if any check failed.
import { spawn, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const site = `${root}/site`;
const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1].split(',') : null);
const only = arg('--only');
const skip = arg('--skip') ?? [];
const PORT = 4321;
const URL_ROOT = `http://127.0.0.1:${PORT}/learning-resources/`;

// The examples use Python 3.12 syntax; where `python3` is older (some images), use python3.12 if it exists.
const py312 = spawnSync('python3', ['-c', 'import sys; sys.exit(sys.version_info >= (3, 12))']).status === 1 ? null : spawnSync('which', ['python3.12'], { encoding: 'utf8' }).stdout.trim();
const env = { ...process.env, ...(py312 && !process.env.PYTHON ? { PYTHON: py312 } : {}) };
const run = (cmd, args, cwd = site) => spawnSync(cmd, args, { cwd, stdio: 'inherit', env }).status === 0;

async function withPreview(fn) {
  const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], { cwd: site, stdio: 'ignore' });
  try {
    for (let i = 0; i < 60; i++) {
      if (await fetch(URL_ROOT).then((r) => r.ok, () => false)) return fn();
      await sleep(500);
    }
    console.error('astro preview did not start');
    return false;
  } finally {
    server.kill();
  }
}

const results = {};
const checks = [
  ['docs', () => run('node', ['scripts/check-docs.mjs'], root)],
  ['examples', () => run('npm', ['run', 'test:examples'])],
  ['build', () => run('npm', ['run', 'build'])],
  ['narration', () => run('npm', ['run', 'test:narration'])],
  ['reels', () => (results.build?.ok === false ? (console.error('skipped: build failed'), false) : withPreview(() => run('npm', ['run', 'test:reels', '--', URL_ROOT])))],
  ['links', () => run('npm', ['run', 'check:links'])],
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
