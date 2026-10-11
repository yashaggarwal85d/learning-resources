// Lets several routine runs of one domain work at once without clashing (ROUTINE.md section 1).
// Each run claims one topic on the `claims` branch (one JSON file per claimed topic). A run keeps its claim alive
// with a heartbeat; a claim whose heartbeat stops (the run hit a limit or died) can be taken over and resumed.
// A topic may only be started once the topic before it has its content final (written, reviewed and checked; only narration
// and shipping left), so the new topic can follow on from what the learner will actually see.
//
//   node scripts/claim.mjs next <domain>        claim this run's job; prints JSON: action make | resume | release | wait
//   node scripts/claim.mjs set <topic-id> <topic-folder>   record the topic's id and folder on this run's claim
//   node scripts/claim.mjs final                this topic's content is final and pushed: the next topic may start
//   node scripts/claim.mjs keepalive            run in the background: a heartbeat every 15 minutes while this run works
//   node scripts/claim.mjs mine                 exit 2 if another run has taken this claim over (then stop)
//   node scripts/claim.mjs stop "<reason>"      this run can't finish: hand the topic back at once (the next run resumes it)
//   node scripts/claim.mjs done                 shipped or released: drop the claim
//   node scripts/claim.mjs status [<domain>]    every claim, with its age
//
// <domain> is a domain id, title or topic-id prefix ("data-structures-and-algorithms", "Data Structures & Algorithms", "dsa", "German").
// Settings: CLAIM_MAX_PARALLEL (default 5) runs per domain at once; a claim is stale after 90 minutes without a heartbeat;
// a topic whose runs stopped 3 times is blocked (reported, not retried) until a human looks at it and deletes its claim.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const BRANCH = 'claims';
const STALE_MIN = Number(process.env.CLAIM_STALE_MIN ?? 90);
const BEAT_MIN = Number(process.env.CLAIM_BEAT_MIN ?? 15);
const MAX = Number(process.env.CLAIM_MAX_PARALLEL ?? 5);
const MAX_ATTEMPTS = 3;

const git = (args, cwd = root) => spawnSync('git', args, { cwd, encoding: 'utf8' });
// This run's claim ({ domain, file, owner }), kept inside the clone so every shell and background job of the run finds it.
const local = join(resolve(root, git(['rev-parse', '--git-dir']).stdout.trim() || '.git'), 'run-claim.json');
const now = () => new Date().toISOString();
const ageMin = (iso) => (Date.now() - Date.parse(iso)) / 60000;
const stale = (c) => ageMin(c.beatAt) > STALE_MIN;
const die = (msg) => { console.error(`claim: ${msg}`); process.exit(2); };
class Busy extends Error {}
process.on('uncaughtException', (e) => { console.error(`claim: ${e.message}`); process.exit(2); });

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

// Unmerged topic branches with no claim (a run from before claims existed, or one whose claim was lost):
// their registry entry says which syllabus topic they hold, so the next run resumes them instead of starting over.
function orphans(domain, reg) {
  const prefix = { 'data-engineering': 'de.', 'data-structures-and-algorithms': 'dsa.', 'german-language': 'ger.', 'rust-systems-engineering': 'rust.' }[domain];
  const found = new Map();
  const heads = git(['ls-remote', '--heads', 'origin', `refs/heads/topic/${prefix}*`]).stdout.trim().split('\n').filter(Boolean);
  for (const line of heads) {
    const ref = line.split('\t')[1];
    if (git(['fetch', '-q', 'origin', ref]).status !== 0) continue;
    const src = git(['show', 'FETCH_HEAD:site/src/topics/registry.ts']).stdout;
    for (const m of src.matchAll(/id: '([^']+)',[\s\S]*?slug: '([^']+)',[\s\S]*?syllabusTitle: '([^']+)'/g)) {
      const [, id, slug, title] = m;
      if (`refs/heads/topic/${id}` === ref && !reg.has(title)) found.set(title, { topicId: id, folder: `site/src/topics/${slug}` });
    }
  }
  return found;
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
  throw new Busy('could not save the claims branch after 8 tries (network or contention); try again');
}

// Runs that claimed before the claim file moved into the clone kept it in the temp folder; still find theirs.
const legacy = join(tmpdir(), 'run-claim.json');
const mine = () => {
  if (!existsSync(local) && existsSync(legacy)) writeFileSync(local, readFileSync(legacy));
  return existsSync(local) ? JSON.parse(readFileSync(local, 'utf8')) : die('this run has no claim (run `next` first)');
};

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
  const lost = orphans(domain, reg);
  const res = transact(({ all, write }) => {
    // Claims are found by topic title, not position, so a syllabus reorder can never point a claim at the wrong topic.
    // New claims are filed under the title's slug; older ones keep the file they were saved in.
    const claims = all().filter((c) => c.domain === domain);
    const byTitle = new Map(claims.map((c) => [c.title, c]));
    const slugify = (x) => x.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
    const fileOf = (t) => byTitle.get(t.title)?.file ?? `claims/${domain}/${slugify(t.title)}.json`;
    const claimOf = (t) => { const c = byTitle.get(t.title); if (!c) return null; const { file, ...rest } = c; return rest; };
    // Claims left behind by a run that shipped but died before `done` (the topic is live), or for a title no longer in
    // the syllabus: noise, removed.
    const titles = new Set(order.map((t) => t.title));
    for (const c of claims) if (!titles.has(c.title) || reg.get(c.title)?.status === 'live') write(c.file, null);
    const blocked = [];
    const active = claims.filter((c) => titles.has(c.title) && reg.get(c.title)?.status !== 'live' && !stale(c));
    if (active.length >= MAX) return { action: 'wait', reason: `${active.length} runs already working on this domain (limit ${MAX})`, working: active.map((c) => c.title) };
    const neighbour = (i) => {
      if (i < 0 || i >= order.length) return null;
      const t = order[i], r = reg.get(t.title), c = claimOf(t);
      return { title: t.title, status: r ? r.status : c ? (stale(c) ? 'abandoned' : c.final ? 'content final' : 'in progress') : 'not started', topicId: r?.id ?? c?.topicId ?? null, branch: c?.topicId ? `topic/${c.topicId}` : null, folder: r ? `site/src/topics/${r.slug}` : c?.folder ?? null, final: !!(r || c?.final) };
    };
    for (let i = 0; i < order.length; i++) {
      const t = order[i], r = reg.get(t.title), o = lost.get(t.title);
      let c = claimOf(t);
      if (r?.status === 'live') continue;
      if (!c && !r && o) c = { ...o, startedAt: 'before claims', beatAt: new Date(0).toISOString() }; // an orphaned branch: resume it
      if (c && !stale(c)) continue; // another run is on it
      if (c && (c.attempts ?? 1) >= MAX_ATTEMPTS) {
        // Its runs keep stopping: don't burn another run on it. Later topics may go on only if its content is final.
        blocked.push(`"${t.title}" stopped ${c.attempts} times (last: ${c.note ?? 'no reason given'}); needs a human`);
        if (c.final) continue;
        return { action: 'wait', reason: blocked.join('; '), blocked };
      }
      let action;
      if (r?.status === 'held') {
        if (!order.slice(0, i).every((x) => reg.get(x.title)?.status === 'live')) continue; // waits for the topics before it
        action = 'release';
      } else if (c) action = 'resume'; // its run stopped: take it over from its last pushed checkpoint
      else {
        const prev = neighbour(i - 1);
        if (prev && !prev.final) return { action: 'wait', reason: `"${prev.title}" isn't content-final yet; this topic must follow on from it` };
        action = 'make';
      }
      const claim = { domain, index: i + 1, title: t.title, chapter: t.chapter, action, topicId: r?.id ?? c?.topicId ?? null, folder: r ? `site/src/topics/${r.slug}` : c?.folder ?? null, final: !!(r || c?.final), owner, startedAt: now(), beatAt: now(), attempts: (c?.attempts ?? 0) + 1, takenOverFrom: c ? c.startedAt : undefined, lastNote: c?.note };
      write(fileOf(t), claim);
      return { action, file: fileOf(t), attempt: claim.attempts, ...(c?.note ? { previousRunStopped: c.note } : {}), ...(blocked.length ? { blocked } : {}), topic: { index: i + 1, title: t.title, chapter: t.chapter, topicId: claim.topicId, branch: claim.topicId ? `topic/${claim.topicId}` : null, folder: claim.folder }, previous: neighbour(i - 1), next: neighbour(i + 1) };
    }
    return { action: 'wait', reason: blocked.length ? blocked.join('; ') : 'nothing left to start in this domain', ...(blocked.length ? { blocked } : {}) };
  });
  if (res.file) writeFileSync(local, JSON.stringify({ domain, file: res.file, owner }));
  console.log(JSON.stringify(res, null, 2));
} else if (['set', 'final', 'outlined', 'beat', 'done', 'stop'].includes(cmd)) {
  const me = mine();
  if (cmd === 'set' && !(args[0] && args[1])) die('usage: set <topic-id> <topic-folder>');
  const ok = transact(({ read, write }) => {
    const c = read(me.file);
    if (!c || c.owner !== me.owner) return false;
    if (cmd === 'done') write(me.file, null);
    // stop: stale at once, so the next run resumes it; the note says why, for that run and for a human.
    else if (cmd === 'stop') write(me.file, { ...c, beatAt: new Date(0).toISOString(), note: args.join(' ') || 'stopped' });
    else write(me.file, { ...c, beatAt: now(), ...(cmd === 'set' ? { topicId: args[0], folder: args[1] } : {}), ...(cmd === 'final' ? { final: true } : {}) });
    return true;
  });
  if (!ok) die('another run has taken this claim over: stop, and leave its branch alone');
  if (cmd === 'done' || cmd === 'stop') { rmSync(local, { force: true }); rmSync(legacy, { force: true }); }
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
    if (!existsSync(local) && !existsSync(legacy)) process.exit(0);
    if (!working()) { console.error('claim: run idle, heartbeat stopped'); process.exit(0); }
    const me = mine();
    let ok;
    try {
      ok = transact(({ read, write }) => { const c = read(me.file); if (!c || c.owner !== me.owner) return false; write(me.file, { ...c, beatAt: now() }); return true; });
    } catch (e) {
      console.error(`claim: heartbeat failed, retrying next beat: ${e.message}`); // a network blip must not end the heartbeat
      continue;
    }
    if (!ok) { console.error('claim: taken over by another run'); process.exit(1); }
  }
} else if (cmd === 'status') {
  const rows = transact(({ all }) => all()).filter((c) => !args[0] || c.domain.includes(args[0].toLowerCase()));
  for (const c of rows) console.log(`${c.domain} #${c.index} ${c.title} [${c.action}${c.final ? ', content final' : ''}, attempt ${c.attempts ?? 1}] ${c.topicId ?? ''} heartbeat ${Math.round(ageMin(c.beatAt))} min ago${stale(c) ? ' (stale)' : ''}${c.note ? ` — stopped: ${c.note}` : ''}`);
  if (!rows.length) console.log('no claims');
} else {
  die('usage: next <domain> | set <topic-id> <folder> | final | keepalive | mine | stop "<reason>" | done | status [<domain>]');
}
