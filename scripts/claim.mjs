// Lets several routine runs of one domain work at once without clashing (ROUTINE.md section 1).
// Each run claims one topic on the `claims` branch (one JSON file per claimed topic). A run keeps its claim alive
// with a heartbeat; a claim whose heartbeat stops (the run hit a limit or died) can be taken over and resumed.
// A topic may only be started once the topic before it has a pushed plan (OUTLINE.md), so it can follow on from it.
//
//   node scripts/claim.mjs next <domain>        claim this run's job; prints JSON: action make | resume | release | wait
//   node scripts/claim.mjs set <topic-id> <topic-folder>   record the topic's id and folder on this run's claim
//   node scripts/claim.mjs outlined             this topic's OUTLINE.md is pushed: the next topic may start
//   node scripts/claim.mjs keepalive            run in the background: a heartbeat every 15 minutes while this run works
//   node scripts/claim.mjs mine                 exit 1 if another run has taken this claim over (then stop)
//   node scripts/claim.mjs done                 shipped or released: drop the claim
//   node scripts/claim.mjs status [<domain>]    every claim, with its age
//
// <domain> is a domain id, title or topic-id prefix ("data-structures-and-algorithms", "Data Structures & Algorithms", "dsa", "German").
// Settings: CLAIM_MAX_PARALLEL (default 2) runs per domain at once; a claim is stale after 90 minutes without a heartbeat.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const BRANCH = 'claims';
const STALE_MIN = Number(process.env.CLAIM_STALE_MIN ?? 90);
const BEAT_MIN = 15;
const MAX = Number(process.env.CLAIM_MAX_PARALLEL ?? 2);
const local = join(tmpdir(), 'run-claim.json'); // this run's claim: { domain, file, owner }

const git = (args, cwd = root) => spawnSync('git', args, { cwd, encoding: 'utf8' });
const now = () => new Date().toISOString();
const ageMin = (iso) => (Date.now() - Date.parse(iso)) / 60000;
const stale = (c) => ageMin(c.beatAt) > STALE_MIN;
const die = (msg) => { console.error(`claim: ${msg}`); process.exit(2); };

// The syllabus order and the registry, read the same way the build reads them.
async function course(domainArg) {
  process.chdir(join(root, 'site'));
  const { loadDomains } = await import(join(root, 'site/src/lib/syllabus.ts'));
  const { TOPICS } = await import(join(root, 'site/src/topics/registry.ts'));
  const domains = loadDomains(); // reads ../syllabus relative to site/
  process.chdir(root);
  const alias = { de: 'data-engineering', dsa: 'data-structures-and-algorithms', ger: 'german-language', rust: 'rust-systems-engineering' };
  domainArg = alias[domainArg.toLowerCase()] ?? domainArg;
  const want = domainArg.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, ' ').trim();
  const d = domains.find((x) => [x.id, x.title].some((n) => { const s = n.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, ' ').trim(); return s === want || s.startsWith(want + ' '); }));
  if (!d) die(`unknown domain "${domainArg}"`);
  const order = d.milestones.flatMap((m) => m.chapters.flatMap((c) => c.topics.map((t) => ({ title: t.title, chapter: `${c.number} ${c.title}` }))));
  const reg = new Map(TOPICS.filter((t) => t.domain === d.id).map((t) => [t.syllabusTitle, t]));
  return { domain: d.id, order, reg };
}

// Read the claims branch, let `fn` change files in it, and save with a compare-and-swap push; retry if another run won.
function transact(fn) {
  const url = git(['remote', 'get-url', 'origin']).stdout.trim();
  for (let attempt = 0; attempt < 8; attempt++) {
    const dir = mkdtempSync(join(tmpdir(), 'claims-'));
    try {
      const cloned = git(['clone', '-q', '--depth', '1', '--branch', BRANCH, '--single-branch', url, dir], tmpdir()).status === 0;
      if (!cloned) git(['init', '-q', '-b', BRANCH], dir);
      const base = cloned ? git(['rev-parse', 'HEAD'], dir).stdout.trim() : '';
      const read = (f) => (existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), 'utf8')) : null);
      const all = () => (existsSync(join(dir, 'claims')) ? readdirSync(join(dir, 'claims')).flatMap((d) => readdirSync(join(dir, 'claims', d)).map((f) => ({ file: `claims/${d}/${f}`, ...read(`claims/${d}/${f}`) }))) : []);
      const writes = new Map();
      const result = fn({ read, all, write: (f, v) => writes.set(f, v) });
      if (!writes.size) return result;
      for (const [f, v] of writes) {
        if (v === null) rmSync(join(dir, f), { force: true });
        else { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), JSON.stringify(v, null, 2) + '\n'); }
      }
      // One commit, replaced on every save, so the branch never grows; the lease makes the save atomic.
      git(['add', '-A'], dir);
      git(['checkout', '-q', '--orphan', `save-${attempt}`], dir);
      git(['-c', 'user.name=claims', '-c', 'user.email=claims@users.noreply.github.com', 'commit', '-q', '--allow-empty', '-m', 'Routine claims (generated; replaced on every save)'], dir);
      if (git(['push', '-q', `--force-with-lease=refs/heads/${BRANCH}:${base}`, url, `HEAD:refs/heads/${BRANCH}`], dir).status === 0) return result;
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
    spawnSync('sleep', [String(1 + Math.random() * 3 * (attempt + 1))]);
  }
  die('could not save the claims branch after 8 tries');
}

const mine = () => (existsSync(local) ? JSON.parse(readFileSync(local, 'utf8')) : die('this run has no claim (run `next` first)'));

// Is this run still working? The session transcript was written lately, or a long job (narration, checks, setup) is running.
function working() {
  const projects = join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), 'projects');
  const walk = (d) => (existsSync(d) ? readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : n.endsWith('.jsonl') ? [statSync(join(d, n)).mtimeMs] : [])) : []);
  const latest = Math.max(0, ...walk(projects));
  if (Date.now() - latest < 60 * 60000) return true;
  return spawnSync('pgrep', ['-f', 'narrate.sh|gen_takes|check-all.mjs|setup.sh|npm ci'], { encoding: 'utf8' }).stdout.trim() !== '';
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'next') {
  const { domain, order, reg } = await course(args[0] ?? die('usage: next <domain>'));
  const owner = randomUUID();
  const res = transact(({ read, all, write }) => {
    const file = (i) => `claims/${domain}/${String(i + 1).padStart(3, '0')}.json`;
    const active = all().filter((c) => c.domain === domain && !stale(c));
    if (active.length >= MAX) return { action: 'wait', reason: `${active.length} runs already working on this domain (limit ${MAX})`, working: active.map((c) => c.title) };
    const neighbour = (i) => {
      if (i < 0 || i >= order.length) return null;
      const t = order[i], r = reg.get(t.title), c = read(file(i));
      return { title: t.title, status: r ? r.status : c ? (stale(c) ? 'abandoned' : 'in progress') : 'not started', topicId: r?.id ?? c?.topicId ?? null, branch: c?.topicId ? `topic/${c.topicId}` : null, folder: r ? `site/src/topics/${r.slug}` : c?.folder ?? null, outlined: !!(r || c?.outlined) };
    };
    for (let i = 0; i < order.length; i++) {
      const t = order[i], r = reg.get(t.title), c = read(file(i));
      if (r?.status === 'live') continue;
      if (c && !stale(c)) continue; // another run is on it
      let action;
      if (r?.status === 'held') {
        if (!order.slice(0, i).every((x) => reg.get(x.title)?.status === 'live')) continue; // waits for the topics before it
        action = 'release';
      } else if (c) action = 'resume'; // its run stopped: take it over from its last pushed checkpoint
      else {
        const prev = neighbour(i - 1);
        if (prev && !prev.outlined) return { action: 'wait', reason: `"${prev.title}" has no pushed plan yet; this topic must follow on from it` };
        action = 'make';
      }
      const claim = { domain, index: i + 1, title: t.title, chapter: t.chapter, action, topicId: r?.id ?? c?.topicId ?? null, folder: r ? `site/src/topics/${r.slug}` : c?.folder ?? null, outlined: !!(r || c?.outlined), owner, startedAt: now(), beatAt: now(), takenOverFrom: c ? c.startedAt : undefined };
      write(file(i), claim);
      return { action, file: file(i), topic: { index: i + 1, title: t.title, chapter: t.chapter, topicId: claim.topicId, branch: claim.topicId ? `topic/${claim.topicId}` : null, folder: claim.folder }, previous: neighbour(i - 1), next: neighbour(i + 1) };
    }
    return { action: 'wait', reason: 'nothing left to start in this domain' };
  });
  if (res.file) writeFileSync(local, JSON.stringify({ domain, file: res.file, owner }));
  console.log(JSON.stringify(res, null, 2));
} else if (['set', 'outlined', 'beat', 'done'].includes(cmd)) {
  const me = mine();
  const ok = transact(({ read, write }) => {
    const c = read(me.file);
    if (!c || c.owner !== me.owner) return false;
    if (cmd === 'done') write(me.file, null);
    else write(me.file, { ...c, beatAt: now(), ...(cmd === 'set' ? { topicId: args[0], folder: args[1] } : {}), ...(cmd === 'outlined' ? { outlined: true } : {}) });
    return true;
  });
  if (!ok) die('another run has taken this claim over: stop, and leave its branch alone');
  if (cmd === 'done') rmSync(local, { force: true });
  console.log(`claim: ${cmd} ok`);
} else if (cmd === 'mine') {
  const me = mine();
  const ok = transact(({ read }) => read(me.file)?.owner === me.owner);
  if (!ok) die('another run has taken this claim over: stop, and leave its branch alone');
  console.log('claim: still yours');
} else if (cmd === 'keepalive') {
  // Started in the background once per run. Stops when the claim is gone or taken over, or when the run stops working.
  for (;;) {
    spawnSync('sleep', [String(BEAT_MIN * 60)]);
    if (!existsSync(local)) process.exit(0);
    if (!working()) { console.error('claim: run idle, heartbeat stopped'); process.exit(0); }
    const me = JSON.parse(readFileSync(local, 'utf8'));
    const ok = transact(({ read, write }) => { const c = read(me.file); if (!c || c.owner !== me.owner) return false; write(me.file, { ...c, beatAt: now() }); return true; });
    if (!ok) { console.error('claim: taken over by another run'); process.exit(1); }
  }
} else if (cmd === 'status') {
  const rows = transact(({ all }) => all()).filter((c) => !args[0] || c.domain.includes(args[0].toLowerCase()));
  for (const c of rows) console.log(`${c.domain} #${c.index} ${c.title} [${c.action}${c.outlined ? ', outlined' : ''}] ${c.topicId ?? ''} heartbeat ${Math.round(ageMin(c.beatAt))} min ago${stale(c) ? ' (stale)' : ''}`);
  if (!rows.length) console.log('no claims');
} else {
  die('usage: next <domain> | set <topic-id> <folder> | outlined | keepalive | mine | done | status [<domain>]');
}
