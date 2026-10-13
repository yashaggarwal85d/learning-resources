// Lets several routine runs of one domain work at once without clashing (ROUTINE.md section 1).
// Each run claims one topic on the `claims` branch (one JSON file per claimed topic). A run keeps its claim alive
// with a heartbeat; a claim whose heartbeat stops (the run hit a limit or died) can be taken over and resumed.
// Three stages, decoupled (owner decision 2026-10-13): DRAFT runs plan a chapter (CHAPTER.md: every topic's scope,
// outcomes, concepts, bridge and handoff) once every topic of the chapter before is drafted, and draft its topics in
// parallel (research, content plan, fact-check, every file including the professor's narration script), each pushed as
// a topic branch and handed over; REVIEW runs take a drafted topic, review it, fix it, check it and ship it held (parked);
// the owner's PC narrates and releases (.claude/skills/narrate). Topics finished out of order ship held, and a release
// run (the PC) makes them live in order, as a chain.
//
//   node scripts/claim.mjs next <domain> [--role draft|review]
//                                               claim this run's job; prints JSON: action plan | draft | review | release | wait
//                                               (--role draft: plan and draft jobs only; --role review: review jobs only; no role: any)
//   node scripts/claim.mjs drafted              this topic's draft is pushed: hand it to a review run (the draft run goes on to its next job)
//   node scripts/claim.mjs set <topic-id> <topic-folder>   record the topic's id and folder on this run's claim
//   node scripts/claim.mjs final                this topic's content is final (reviewed, checked) and pushed
//   node scripts/claim.mjs keepalive            run in the background: a heartbeat every 15 minutes while this run works
//   node scripts/claim.mjs mine                 exit 2 if another run has taken this claim over (then stop)
//   node scripts/claim.mjs stop "<reason>"      this run can't finish: hand the topic back at once (the next run resumes it)
//   node scripts/claim.mjs done                 shipped or released: drop the claim
//   node scripts/claim.mjs status [<domain>]    every claim, with its age
//   node scripts/claim.mjs open [<domain>...]   how many runs could start work now, per domain (nothing is claimed)
//   node scripts/claim.mjs expire <minutes>     after an outage (a usage limit): claims silent this long are dead now, free to resume
//
// <domain> is a domain id, title or topic-id prefix ("data-structures-and-algorithms", "Data Structures & Algorithms", "dsa", "Rust").
// Settings: CLAIM_MAX_PARALLEL (default 4) runs per domain at once (runs whose topic is content-final, narrating or
// shipping, don't count against either limit); a claim is stale after 90 minutes without a heartbeat;
// scripts/claim-settings.json: { "finishOnly": true } starts nothing new except the topics in "restart" (titles);
// "maxTotal" overrides CLAIM_MAX_TOTAL; "narration": "pc" parks finished topics (shipped held, no narration) for the
// owner's PC, which narrates in bulk and releases them (.claude/skills/narrate): release jobs are then handed out only
// when CLAIM_RELEASE=1 is set (the PC), never to a routine run.
// a topic whose runs stopped 3 times (or vanished 6 times, as on a usage limit) is blocked (reported, not retried) until a
// human looks at it and deletes its claim. CLAIM_MAX_TOTAL (default 8) caps the runs of all domains together.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const BRANCH = 'claims';
const STALE_MIN = Number(process.env.CLAIM_STALE_MIN ?? 90);
const BEAT_MIN = Number(process.env.CLAIM_BEAT_MIN ?? 15);
const MAX = Number(process.env.CLAIM_MAX_PARALLEL ?? 4); // runs of one domain at once
// Runs of all domains at once. They share one account's usage limit (with its owner's own sessions): 26 runs started
// together hit the five-hour limit within three minutes and all died (QUALITY.md #46).
// The owner's switches, in scripts/claim-settings.json on main: finishOnly (resume and release started topics, start
// nothing new: no chapter plans, no new topics) and maxTotal (runs of all domains at once).
const SETTINGS = (() => { try { return JSON.parse(readFileSync(join(root, 'scripts/claim-settings.json'), 'utf8')); } catch { return {}; } })();
const MAX_TOTAL = Number(process.env.CLAIM_MAX_TOTAL ?? SETTINGS.maxTotal ?? 8);
const restart = new Set(SETTINGS.restart ?? []); // topic titles to start again while finishing (their runs died before saving)
const MAX_STOPS = 3; // a topic whose runs gave up (claim.mjs stop) this often is blocked for a human
const MAX_DEATHS = 6; // runs that vanished without a word (a usage limit, a lost container) count separately, and more loosely

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
  const alias = { de: 'data-engineering', dsa: 'data-structures-and-algorithms', rust: 'rust-systems-engineering' };
  domainArg = alias[domainArg.toLowerCase()] ?? domainArg;
  const want = domainArg.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, ' ').trim();
  const d = domains.find((x) => [x.id, x.title].some((n) => { const s = n.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, ' ').trim(); return s === want || s.startsWith(want + ' '); }));
  if (!d) die(`unknown domain "${domainArg}"`);
  // Topics marked *(skipped)* in the syllabus stay in the curriculum but get no reel: they are never handed out, never
  // waited for, and a chapter is complete without them.
  const order = d.milestones.flatMap((m) => m.chapters.flatMap((c) => c.topics.filter((t) => !t.skipped).map((t) => ({ title: t.title, chapter: `${c.number} ${c.title}`, m, c }))));
  const reg = new Map(TOPICS.filter((t) => t.domain === d.id).map((t) => [t.syllabusTitle, t]));
  return { domain: d.id, order, reg };
}

const PREFIX = { 'data-engineering': 'de', 'data-structures-and-algorithms': 'dsa', 'rust-systems-engineering': 'rust' };
const words = (x, n) => x.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter((w) => !['and', 'the', 'of', 'a', 'an', 'in', 'to', 'for', 'with', 'its'].includes(w)).slice(0, n).join('-');

// Where a new topic goes, so parallel runs in one chapter never invent two folders for it: the chapter's folder as
// already used by a topic on main or by a claim of another run, else one made from the syllabus titles.
function placeFor(domain, t, reg, claims, plans = new Map()) {
  if (plans.has(t.c.number)) {
    const slug = words(t.title, 4);
    return { topicId: `${PREFIX[domain]}.${slug}`, folder: `site/src/topics/${domain}/${plans.get(t.c.number)}/${slug}` };
  }
  const same = (m, c) => m === t.m.number && c === t.c.number;
  const fromReg = [...reg.values()].find((r) => same(r.milestone.number, r.chapter.number));
  const fromClaim = claims.find((c) => c.folder && c.milestone === t.m.number && c.chapterNumber === t.c.number);
  const milestoneDir = [...reg.values()].find((r) => r.milestone.number === t.m.number)?.slug.split('/')[1] ?? claims.find((c) => c.folder && c.milestone === t.m.number)?.folder.split('/')[4] ?? `m${t.m.number}-${words(t.m.title, 3)}`;
  const chapterDir = fromReg ? fromReg.slug.split('/').slice(0, 3).join('/') : fromClaim ? fromClaim.folder.split('/').slice(3, 6).join('/') : `${domain}/${milestoneDir}/ch${String(t.c.number).padStart(2, '0')}-${words(t.c.title, 3)}`;
  const slug = words(t.title, 4);
  return { topicId: `${PREFIX[domain]}.${slug}`, folder: `site/src/topics/${chapterDir}/${slug}` };
}

// Chapters whose plan (CHAPTER.md) is on main: chapter number -> "<milestone dir>/<chapter dir>".
function chapterPlans(domain) {
  git(['fetch', '-q', 'origin', 'main']);
  const out = new Map();
  for (const p of git(['ls-tree', '-r', '--name-only', 'origin/main', '--', `site/src/topics/${domain}/`]).stdout.split('\n')) {
    const m = p.match(/^site\/src\/topics\/[^/]+\/(m\d+-[^/]+\/ch(\d+)-[^/]+)\/CHAPTER\.md$/);
    if (m) out.set(Number(m[2]), m[1]);
  }
  return out;
}

// Unmerged topic branches with no claim (a run from before claims existed, or one whose claim was lost):
// their registry entry says which syllabus topic they hold, so the next run resumes them instead of starting over.
function orphans(domain, reg) {
  const prefix = { 'data-engineering': 'de.', 'data-structures-and-algorithms': 'dsa.', 'rust-systems-engineering': 'rust.' }[domain];
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
  if (!existsSync(local)) die('this run has no claim (run `next` first)');
  const me = JSON.parse(readFileSync(local, 'utf8'));
  return { ...me, files: me.files ?? [me.file] }; // a release run holds several claims (a chain of topics)
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

// Everything a decision needs about one domain: syllabus order, registry, orphan branches and planned chapters.
async function context(domainArg) {
  const { domain, order, reg } = await course(domainArg);
  const lost = orphans(domain, reg);
  const plans = chapterPlans(domain); // chapter number -> chapter folder, for chapters whose CHAPTER.md is on main
  const chapters = [...new Map(order.map((t) => [t.c.number, t])).values()].map((t) => ({ number: t.c.number, title: t.c.title, m: t.m, c: t.c }));
  return { domain, order, reg, lost, plans, chapters };
}

// The job the next run of a domain gets, as a transaction over the claims (`next` saves it; `open` only simulates it).
function decide({ domain, order, reg, lost, plans, chapters }, owner, role = 'any') {
  const drafts = role !== 'review'; // may plan chapters and draft topics
  const reviews = role !== 'draft'; // may review drafted topics
  return ({ all, write }) => {
    // Claims are found by title (a topic's syllabus title, or "Chapter N plan" for a chapter plan), never by position,
    // so a syllabus reorder can't point a claim at the wrong job. New claims are filed under the title's slug.
    const claims = all().filter((c) => c.domain === domain);
    const byTitle = new Map(claims.map((c) => [c.title, c]));
    const slugify = (x) => x.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
    const fileOf = (title) => byTitle.get(title)?.file ?? `claims/${domain}/${slugify(title)}.json`;
    const claimOf = (title) => { const c = byTitle.get(title); if (!c) return null; const { file, ...rest } = c; return rest; };
    const planTitle = (ch) => `Chapter ${ch.number} plan: ${ch.title}`;
    // Noise: claims of live topics (their run died before `done`), of chapters already planned, or of titles gone from the syllabus.
    const titles = new Set([...order.map((t) => t.title), ...chapters.map(planTitle)]);
    for (const c of claims)
      if (!titles.has(c.title) || reg.get(c.title)?.status === 'live' || (c.kind === 'chapter-plan' && plans.has(c.chapterNumber))) write(c.file, null);
    const live = (t) => reg.get(t.title)?.status === 'live';
    const blocked = [];
    // A run whose topic is content-final is only narrating and shipping: the voice runs on the container's CPU and the run
    // makes a few calls an hour, so it doesn't count against the run limits (the owner's choice, 2026-10-12).
    const busy = (c) => !stale(c) && !c.final;
    const active = claims.filter((c) => titles.has(c.title) && reg.get(c.title)?.status !== 'live' && !(c.kind === 'chapter-plan' && plans.has(c.chapterNumber)) && busy(c));
    if (active.length >= MAX) return { action: 'wait', reason: `${active.length} runs already working on this domain (limit ${MAX})`, working: active.map((c) => c.title) };
    const elsewhere = all().filter((c) => c.domain !== domain && busy(c)).length;
    if (active.length + elsewhere >= MAX_TOTAL) return { action: 'wait', reason: `${active.length + elsewhere} runs already working across all domains (limit ${MAX_TOTAL})` };
    // A stale claim counts as a stop if its run said why (claim.mjs stop), else as a death (the run vanished).
    const stops = (c) => (c.stops ?? 0) + (c.note ? 1 : 0);
    const deaths = (c) => (c.deaths ?? 0) + (c.note ? 0 : 1);
    const tooOften = (c, title) => {
      if (!c || (stops(c) < MAX_STOPS && deaths(c) < MAX_DEATHS)) return false;
      blocked.push(`"${title}" ${stops(c) >= MAX_STOPS ? `stopped ${stops(c)} times (last: ${c.note ?? c.lastNote ?? 'no reason given'})` : `lost its run ${deaths(c)} times (usage limits or lost containers)`}; needs a human`);
      return true;
    };
    // A claim's stage: 'draft' (being drafted), 'review' (drafted, in review, or content-final and not yet shipped),
    // 'release' (a release chain, the PC's). Claims from before the stages existed are placed by what they were doing.
    const stageOf = (c) => c.stage ?? (c.action === 'release' ? 'release' : c.final ? 'review' : 'draft');
    const describe = (i) => {
      if (i < 0 || i >= order.length) return null;
      const t = order[i], r = reg.get(t.title), c = claimOf(t.title);
      const status = r ? r.status : !c ? 'not started' : c.final ? 'content final' : c.drafted && stale(c) ? 'drafted, waiting for review' : stale(c) ? 'abandoned' : stageOf(c) === 'review' ? 'in review' : 'being drafted';
      return { title: t.title, status, topicId: r?.id ?? c?.topicId ?? null, branch: !r && c?.topicId ? `topic/${c.topicId}` : null, folder: r ? `site/src/topics/${r.slug}` : c?.folder ?? null };
    };
    const claimJob = (title, fields) => {
      const c = claimOf(title);
      const claim = { domain, title, owner, startedAt: now(), beatAt: now(), attempts: (c?.attempts ?? 0) + 1, ...(c ? { stops: stops(c), deaths: deaths(c) } : {}), takenOverFrom: c ? c.startedAt : undefined, lastNote: c?.note ?? c?.lastNote, ...fields };
      write(fileOf(title), claim);
      return { file: fileOf(title), claim, previousRunStopped: c?.note };
    };
    const chapterInfo = (ch) => ({ number: ch.number, title: ch.title, plan: plans.has(ch.number) ? `site/src/topics/${domain}/${plans.get(ch.number)}/CHAPTER.md` : null });

    // 1. Release: held topics whose earlier topics are all live, as one consecutive chain (each gets a seam check).
    // With narration parked for the PC, only the PC releases (it narrates first): routines never get this job.
    const releaseHere = SETTINGS.narration !== 'pc' || process.env.CLAIM_RELEASE === '1';
    const firstOpen = order.findIndex((t) => !live(t));
    if (releaseHere && firstOpen >= 0 && reg.get(order[firstOpen].title)?.status === 'held') {
      const chain = [];
      for (let i = firstOpen; i < order.length && reg.get(order[i].title)?.status === 'held'; i++) {
        const c = claimOf(order[i].title);
        if (c && !stale(c)) break;
        if (tooOften(c, order[i].title)) break;
        chain.push(i);
      }
      if (chain.length) {
        const files = chain.map((i) => claimJob(order[i].title, { kind: 'topic', action: 'release', index: i + 1, chapter: order[i].chapter, chapterNumber: order[i].c.number, milestone: order[i].m.number, topicId: reg.get(order[i].title).id, folder: `site/src/topics/${reg.get(order[i].title).slug}`, final: true }).file);
        return { action: 'release', files, topics: chain.map((i) => ({ index: i + 1, title: order[i].title, topicId: reg.get(order[i].title).id, folder: `site/src/topics/${reg.get(order[i].title).slug}` })), previous: describe(chain[0] - 1), next: describe(chain.at(-1) + 1) };
      }
    }

    // 2. Review: a drafted topic handed over by its draft run (claim.mjs drafted), or a review that stopped; in syllabus order.
    //    A review run starts at ROUTINE.md section 4 on the topic's branch. A topic whose content is final but whose run
    //    stopped before shipping is resumed here too (the review stage ends with the ship).
    for (let i = 0; i < order.length && reviews; i++) {
      const t = order[i], r = reg.get(t.title), c = claimOf(t.title);
      if (r || !c || !stale(c) || stageOf(c) !== 'review' || tooOften(c, t.title)) continue;
      const { file, claim, previousRunStopped } = claimJob(t.title, { kind: 'topic', action: 'review', stage: 'review', index: i + 1, chapter: t.chapter, chapterNumber: t.c.number, milestone: t.m.number, topicId: c.topicId ?? null, folder: c.folder ?? null, final: !!c.final, drafted: true });
      return { action: 'review', file, attempt: claim.attempts, previousRunStopped: c.drafted && !c.reviewAttempts ? undefined : previousRunStopped, contentFinal: !!c.final, topic: { index: i + 1, title: t.title, chapter: chapterInfo(t.c), topicId: claim.topicId, branch: claim.topicId ? `topic/${claim.topicId}` : null, folder: claim.folder }, previous: describe(i - 1), next: describe(i + 1) };
    }
    // 2b. Resume a draft whose run stopped (or an unclaimed topic branch from before claims): the draft run continues it.
    for (let i = 0; i < order.length && drafts; i++) {
      const t = order[i], r = reg.get(t.title);
      let c = claimOf(t.title);
      if (r) continue;
      if (!c && lost.get(t.title)) c = { ...lost.get(t.title), startedAt: 'before claims', beatAt: new Date(0).toISOString(), stage: 'draft' };
      if (!c || !stale(c) || stageOf(c) !== 'draft' || tooOften(c, t.title)) continue;
      const { file, claim, previousRunStopped } = claimJob(t.title, { kind: 'topic', action: 'draft', stage: 'draft', index: i + 1, chapter: t.chapter, chapterNumber: t.c.number, milestone: t.m.number, topicId: c.topicId ?? null, folder: c.folder ?? null, final: false });
      return { action: 'draft', resumed: true, file, attempt: claim.attempts, previousRunStopped, topic: { index: i + 1, title: t.title, chapter: chapterInfo(t.c), topicId: claim.topicId, branch: claim.topicId ? `topic/${claim.topicId}` : null, folder: claim.folder }, previous: describe(i - 1), next: describe(i + 1) };
    }
    for (const ch of chapters) {
      const c = claimOf(planTitle(ch));
      if (drafts && c && stale(c) && !plans.has(ch.number) && !tooOften(c, planTitle(ch))) return planJob(ch, true);
    }

    // 3. Plan the next chapter (never while finishing started work only). Chapters go in sequence: a chapter is planned once
    // every topic of the chapter before it is at least drafted (in the registry, content-final, or handed to review), so its
    // plan builds on what that chapter really teaches while the reviews of that chapter go on in parallel (the decoupling).
    const complete = (ch) => order.filter((t) => t.c.number === ch.number).every((t) => reg.get(t.title) || claimOf(t.title)?.final || claimOf(t.title)?.drafted);
    for (let k = 0; k < chapters.length && drafts && !SETTINGS.finishOnly; k++) {
      const ch = chapters[k];
      if (plans.has(ch.number)) continue;
      if (claimOf(planTitle(ch))) break; // being planned (or blocked)
      if (k > 0 && !(plans.has(chapters[k - 1].number) && complete(chapters[k - 1]))) break;
      if (order.filter((t) => t.c.number === ch.number).every((t) => reg.get(t.title)?.status === 'live')) continue; // nothing left to plan
      return planJob(ch, false);
    }

    // 4. Draft: the first topic nobody is on, in a planned chapter.
    for (let i = 0; i < order.length && drafts; i++) {
      const t = order[i];
      if (reg.get(t.title) || claimOf(t.title) || lost.get(t.title)) continue;
      if (!plans.has(t.c.number)) continue;
      if (SETTINGS.finishOnly && !restart.has(t.title)) continue; // finishing: only topics whose runs died are started again
      const place = placeFor(domain, t, reg, claims, plans);
      const { file, claim } = claimJob(t.title, { kind: 'topic', action: 'draft', stage: 'draft', index: i + 1, chapter: t.chapter, chapterNumber: t.c.number, milestone: t.m.number, topicId: place.topicId, folder: place.folder, final: false });
      return { action: 'draft', file, attempt: claim.attempts, topic: { index: i + 1, title: t.title, chapter: chapterInfo(t.c), topicId: place.topicId, branch: `topic/${place.topicId}`, folder: place.folder, use: place }, previous: describe(i - 1), next: describe(i + 1) };
    }
    const reason = blocked.length ? blocked.join('; ') : role === 'review' ? 'no drafted topic is waiting for review' : role === 'draft' ? (SETTINGS.finishOnly ? 'finishing started topics only (scripts/claim-settings.json): nothing new is drafted' : 'every topic of the planned chapter is drafted or being drafted; the next chapter is planned once they are all drafted') : SETTINGS.finishOnly ? 'finishing started topics only (scripts/claim-settings.json): nothing new is started' : 'nothing to draft or review now';
    return { action: 'wait', reason, ...(blocked.length ? { blocked } : {}) };

    function planJob(ch, resuming) {
      const first = order.find((t) => t.c.number === ch.number);
      const dir = placeFor(domain, first, reg, claims, plans).folder.split('/').slice(3, 6).join('/');
      const topics = order.map((t, i) => [t, i]).filter(([t]) => t.c.number === ch.number).map(([t, i]) => {
        const d = describe(i);
        return { index: i + 1, title: t.title, status: d.status, ...(reg.get(t.title) || claimOf(t.title) ? { topicId: d.topicId, folder: d.folder, branch: d.branch } : placeFor(domain, t, reg, claims, plans)) };
      });
      const prev = chapters[chapters.indexOf(ch) - 1];
      const { file, claim, previousRunStopped } = claimJob(planTitle(ch), { kind: 'chapter-plan', action: 'plan', chapterNumber: ch.number, milestone: ch.m.number, folder: `site/src/topics/${dir}` });
      return { action: 'plan', file, attempt: claim.attempts, ...(resuming ? { previousRunStopped } : {}), chapter: { number: ch.number, title: ch.title, milestone: ch.m.number, plan: `site/src/topics/${dir}/CHAPTER.md`, branch: `plan/${PREFIX[domain]}-ch${String(ch.number).padStart(2, '0')}`, topics }, previousChapter: prev ? chapterInfo(prev) : null };
    }
  };
}

if (cmd === 'next') {
  const roleIdx = args.indexOf('--role');
  const role = roleIdx >= 0 ? args[roleIdx + 1] : 'any';
  if (!['draft', 'review', 'any'].includes(role)) die('usage: next <domain> [--role draft|review]');
  const ctx = await context(args.filter((a, i) => a !== '--role' && i !== roleIdx + 1)[0] ?? die('usage: next <domain> [--role draft|review]'));
  const { domain } = ctx;
  const owner = randomUUID();
  const res = transact(decide(ctx, owner, role));
  const files = res.files ?? (res.file ? [res.file] : []);
  if (files.length) writeFileSync(local, JSON.stringify({ domain, files, owner }));
  console.log(JSON.stringify(res, null, 2));
} else if (['set', 'final', 'outlined', 'beat', 'done', 'stop', 'drafted'].includes(cmd)) {
  const me = mine();
  if (cmd === 'set' && !(args[0] && args[1])) die('usage: set <topic-id> <topic-folder>');
  const ok = transact(({ read, write }) => {
    const cs = me.files.map((f) => [f, read(f)]);
    if (cs.some(([, c]) => !c || c.owner !== me.owner)) return false;
    for (const [f, c] of cs) {
      if (cmd === 'done') write(f, null);
      // stop: stale at once, so the next run resumes it; the note says why, for that run and for a human.
      else if (cmd === 'stop') write(f, { ...c, beatAt: new Date(0).toISOString(), note: args.join(' ') || 'stopped' });
      // drafted: the draft is pushed; hand the topic to a review run at once (stale, stage review), with no stop counted.
      else if (cmd === 'drafted') write(f, { ...c, beatAt: new Date(0).toISOString(), stage: 'review', drafted: true, draftedAt: now(), note: undefined, lastNote: c.note ?? c.lastNote, stops: 0, deaths: 0 });
      else write(f, { ...c, beatAt: now(), ...(cmd === 'set' ? { topicId: args[0], folder: args[1] } : {}), ...(cmd === 'final' ? { final: true } : {}) });
    }
    return true;
  });
  if (!ok) die('another run has taken this claim over: stop, and leave its branch alone');
  if (cmd === 'done' || cmd === 'stop' || cmd === 'drafted') { rmSync(local, { force: true }); rmSync(legacy, { force: true }); }
  console.log(`claim: ${cmd} ok`);
} else if (cmd === 'mine') {
  const me = mine();
  const ok = transact(({ read }) => me.files.every((f) => read(f)?.owner === me.owner));
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
      ok = transact(({ read, write }) => {
        const cs = me.files.map((f) => [f, read(f)]);
        if (cs.some(([, c]) => !c || c.owner !== me.owner)) return false;
        for (const [f, c] of cs) write(f, { ...c, beatAt: now() });
        return true;
      });
    } catch (e) {
      console.error(`claim: heartbeat failed, retrying next beat: ${e.message}`); // a network blip must not end the heartbeat
      continue;
    }
    if (!ok) { console.error('claim: taken over by another run'); process.exit(1); }
  }
} else if (cmd === 'open') {
  // How many runs could start work now, per domain: hand out jobs to imaginary runs until every answer is "wait",
  // one domain at a time in turn so the total cap is shared fairly. Nothing is saved. The dispatcher fires each
  // domain's routine this many times (routine runs can't start runs themselves).
  const ctxs = [];
  for (const d of args.length ? args : Object.keys(PREFIX)) ctxs.push(await context(d));
  const mem = new Map(transact(({ all }) => all()).map(({ file, ...c }) => [file, c]));
  const view = { all: () => [...mem].map(([file, c]) => ({ file, ...c })), write: (f, v) => (v === null ? mem.delete(f) : mem.set(f, v)) };
  const out = Object.fromEntries(ctxs.map((c) => [c.domain, { open: 0, jobs: [] }]));
  for (let more = true; more; ) {
    more = false;
    for (const ctx of ctxs) {
      const res = decide(ctx, randomUUID())(view);
      if (res.action === 'wait') continue;
      out[ctx.domain].open++;
      out[ctx.domain].jobs.push(`${res.action}: ${res.topic?.title ?? res.chapter?.title ?? res.topics?.map((t) => t.title).join(', ')}`);
      more = true;
    }
  }
  console.log(JSON.stringify(out, null, 2));
} else if (cmd === 'expire') {
  // When every run died at once (a usage limit), their claims would block the run limit until each went stale on its own.
  // This marks claims without a heartbeat for <minutes> as dead now; the next runs resume them (a death, not a stop).
  const mins = Number(args[0]);
  if (!(mins >= 30)) die('usage: expire <minutes>  (30 or more, so a working run is never expired)');
  const gone = transact(({ all, write }) => all().filter((c) => !stale(c) && ageMin(c.beatAt) > mins).map((c) => (write(c.file, { ...c, beatAt: new Date(0).toISOString() }), c.title)));
  console.log(gone.length ? `expired ${gone.length}: ${gone.join('; ')}` : 'nothing to expire');
} else if (cmd === 'status') {
  const rows = transact(({ all }) => all()).filter((c) => !args[0] || c.domain.includes(args[0].toLowerCase()));
  for (const c of rows) console.log(`${c.domain} ${c.kind === 'chapter-plan' ? '' : `#${c.index} `}${c.title} [${c.action}${c.stage ? `, stage ${c.stage}` : ''}${c.drafted && !c.final ? ', drafted' : ''}${c.final ? ', content final' : ''}, attempt ${c.attempts ?? 1}] ${c.topicId ?? ''} heartbeat ${Math.round(ageMin(c.beatAt))} min ago${stale(c) ? ' (stale)' : ''}${c.note ? ` — stopped: ${c.note}` : ''}`);
  if (!rows.length) console.log('no claims');
} else {
  die('usage: next <domain> [--role draft|review] | set <topic-id> <folder> | drafted | final | keepalive | mine | stop "<reason>" | done | status [<domain>] | open [<domain>...] | expire <minutes>');
}
