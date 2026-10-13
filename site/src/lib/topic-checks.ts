// Mechanical checks on every finished topic's files, run on every build (QUALITY.md #35).
// They replace what reviewers used to check by eye, so reviews can spend their effort on judgement.
//   1. narration.json has one entry per reel step, in order, with an `answer` exactly on the predict steps;
//   2. narration lines are speakable: no digits, symbols or code-style names (numbers and names are written as said),
//      and no line longer than the voice's token budget allows (narration/voice.json → pace.max_words_per_line);
//   3. every number in the reel's on-screen text (reel.tsx) is computed or asserted in examples.py;
//   4. prerequisites.mdx opens with a Basics section (the topic's own terms, in brief; QUALITY.md #50), unless the topic
//      was finished before that rule (2026-10-12) and is listed in src/topics/basics-backlog.json, which only shrinks;
//   5. the narration teaches instead of reading the description (the step's body; owner rule 2026-10-13, QUALITY.md #54):
//      no step's narration shares half or more of its four-word phrases with its description, and no description sentence
//      of eight words or more is spoken verbatim, unless the topic predates the rule and is listed in
//      src/topics/narration-backlog.json (only shrinks). The narration is the voice and the captions; the persona is the
//      MIT professor of PROJECT_PLAN.md (Narration → The narrator's persona).
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { TopicMeta } from '../topics/registry';

const VOICE = JSON.parse(readFileSync(resolve(process.cwd(), 'narration/voice.json'), 'utf8'));
const MAX_WORDS: number = VOICE.pace.max_words_per_line;

type Line = string | { beat: number };
type Step = { lines: Line[]; answer?: Line[] };

/** Reel steps as written in reel.tsx: each starts with a 6-space-indented `title:` (the scaffold's format). */
export function reelSteps(src: string) {
  const starts = [...src.matchAll(/^ {6}title: (['"`])(.*?)\1,?$/gm)];
  return starts.map((m, i) => {
    const body = src.slice(m.index!, i + 1 < starts.length ? starts[i + 1].index : src.length);
    return { title: m[2], predict: /^ {6}predict:/m.test(body) };
  });
}

// Digits, symbols and code-style names (camelCase, snake_case) don't belong in a spoken line.
// All-caps acronyms (CI, CPU, CPUs) are fine: the voice spells them.
const UNSPEAKABLE = /[0-9_=<>{}[\]()/\\*#@|~^$%&`+]/;
const CODE_NAME = /\b[a-z]+[A-Z]\w*\b/;

/** Numbers that appear in examples.py, as values (1_000_000, 1,000,000 and 1e6 all count). */
function numbersIn(src: string) {
  const vals = new Set<number>();
  for (const m of src.matchAll(/(?<![\w.])\d[\d_,]*(?:\.\d+)?(?:e-?\d+)?/gi)) {
    const v = Number(m[0].replace(/[_,]/g, ''));
    if (Number.isFinite(v)) vals.add(v);
  }
  return vals;
}
const near = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

// The Basics section of a Prerequisites panel: <section class="prereq basics" data-section="basics"> … </section>,
// first in the file, 4–14 bullets of the form "- **Term**: definition. *Where you meet it:* scenario.", under 400
// words, no links (ROUTINE.md section 3).
const BASICS_RE = /<section\b[^>]*\bdata-section="basics"[^>]*>([\s\S]*?)<\/section>/;
export function basicsSection(src: string) {
  return src.match(BASICS_RE)?.[1] ?? null;
}
export function basicsProblems(src: string, body: string) {
  const problems: string[] = [];
  if (src.search(/<section\b/) !== src.search(BASICS_RE)) problems.push('must be the first section in prerequisites.mdx.');
  const bullets = body.match(/^\s*- \*\*[^*\n]+\*\*/gm)?.length ?? 0;
  if (bullets < 4 || bullets > 14) problems.push(`has ${bullets} term bullet(s) ("- **Term**: …"); it needs 4 to 14.`);
  const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words > 400) problems.push(`is ${words} words; keep it under 400: a primer, not a lesson.`);
  if (/<Resource\b|href=|\]\(/.test(body)) problems.push('has a link; resources belong in the sections below it.');
  return problems;
}

/** The description of each reel step (its `body`, the paragraph under the animation), as plain words, in step order:
 * `body: (<>…</>)` or `body: <>…</>`. */
export function captions(src: string) {
  const out: string[] = [];
  for (const m of src.matchAll(/body:\s*\(?\s*<>([\s\S]*?)<\/>/g)) out.push(m[1].replace(/\{[^}]*\}/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  return out;
}
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
const grams = (w: string[], n = 4) => new Set(w.slice(0, Math.max(0, w.length - n + 1)).map((_, i) => w.slice(i, i + n).join(' ')));
/** How much of a step's narration is its description read aloud: the share of the narration's four-word phrases that
 * occur in the description (0–1), and the first description sentence of eight words or more said verbatim, if any. */
export function readsTheScreen(caption: string, narration: string) {
  const n = words(narration), c = words(caption);
  const g = grams(n), cg = grams(c);
  let hit = 0;
  for (const x of g) if (cg.has(x)) hit++;
  const share = g.size ? hit / g.size : 0;
  const spoken = ' ' + n.join(' ') + ' ';
  const verbatim = caption.split(/(?<=[.!?])\s+/).map((s) => words(s)).find((s) => s.length >= 8 && spoken.includes(' ' + s.join(' ') + ' '));
  return { share, verbatim: verbatim ? verbatim.join(' ') : null };
}

export function checkTopicFiles(topics: TopicMeta[]) {
  const errors: string[] = [];
  const backlogPath = resolve(process.cwd(), 'src/topics/basics-backlog.json');
  const backlog: string[] = existsSync(backlogPath) ? JSON.parse(readFileSync(backlogPath, 'utf8')).pending : [];
  const narrBacklogPath = resolve(process.cwd(), 'src/topics/narration-backlog.json');
  const narrBacklog: string[] = existsSync(narrBacklogPath) ? JSON.parse(readFileSync(narrBacklogPath, 'utf8')).pending : [];
  for (const t of topics) {
    const dir = resolve(process.cwd(), 'src/topics', t.slug);
    const reelSrc = readFileSync(resolve(dir, 'reel.tsx'), 'utf8');
    const steps = reelSteps(reelSrc);

    // 1. Narration lines up with the reel.
    const narrPath = resolve(dir, 'narration.json');
    if (!existsSync(narrPath)) errors.push(`${t.id}: no narration.json`);
    else {
      const narr: Step[] = JSON.parse(readFileSync(narrPath, 'utf8')).steps;
      if (narr.length !== steps.length) errors.push(`${t.id}: narration.json has ${narr.length} steps, reel.tsx has ${steps.length}. One narration entry per step, in order.`);
      steps.forEach((s, i) => {
        const n = narr[i];
        if (!n) return;
        if (s.predict && !n.answer?.length) errors.push(`${t.id}: step ${i + 1} ("${s.title}") is a predict step but its narration has no "answer".`);
        if (!s.predict && n.answer) errors.push(`${t.id}: step ${i + 1} ("${s.title}") has an "answer" in narration.json but no predict question.`);
      });
      // 5. The narrator teaches; the caption is the written anchor (owner rule 2026-10-13). A step whose narration is its
      //    caption read aloud fails, unless the topic predates the rule and is listed in src/topics/narration-backlog.json.
      const caps = captions(reelSrc);
      const reading: string[] = [];
      if (caps.length === steps.length) {
        narr.forEach((n, i) => {
          const spoken = [...n.lines, ...(n.answer ?? [])].filter((x): x is string => typeof x === 'string').join(' ');
          const r = readsTheScreen(caps[i], spoken);
          if (r.share >= 0.5) reading.push(`step ${i + 1} ("${steps[i].title}"): ${Math.round(r.share * 100)}% of its narration is the description word for word`);
          else if (r.verbatim) reading.push(`step ${i + 1} ("${steps[i].title}"): speaks the description sentence "${r.verbatim.slice(0, 60)}…" verbatim`);
        });
      } else errors.push(`${t.id}: reel.tsx has ${steps.length} steps but ${caps.length} descriptions could be read; write each step's description as body: (<>…</>).`);
      if (narrBacklog.includes(t.id)) {
        if (!reading.length) errors.push(`${t.id}: its narration teaches now, but it is still listed in src/topics/narration-backlog.json. Remove it from the list.`);
      } else if (reading.length) {
        errors.push(`${t.id}: the narration reads the description instead of teaching (PROJECT_PLAN.md, Narration → The narrator's persona; .claude/skills/narrate/teacher-pass.md): ${reading.join('; ')}. Rewrite those steps' lines as the professor's explanation of the picture (why, what to watch, what goes wrong otherwise), not the description. Only a topic finished before 2026-10-13 may be listed in src/topics/narration-backlog.json instead.`);
      }
      // 2. Speakable lines.
      narr.forEach((n, i) =>
        [...n.lines, ...(n.answer ?? [])].forEach((x) => {
          const text = typeof x === 'string' ? x : null;
          if (text === null) return;
          const bad = text.match(UNSPEAKABLE) ?? text.match(CODE_NAME);
          if (bad) errors.push(`${t.id}: narration step ${i + 1} has "${bad[0]}" in "${text}". Write numbers, symbols and names the way they are said.`);
          const words = text.split(/\s+/).filter(Boolean).length;
          if (words > MAX_WORDS) errors.push(`${t.id}: narration step ${i + 1} has a ${words}-word line (limit ${MAX_WORDS}: the voice truncates longer lines, and no take of one passes). Split it: "${text.slice(0, 60)}…"`);
        }),
      );
    }

    // 3. Numbers on screen are computed in examples.py.
    const exPath = resolve(dir, 'examples.py');
    const known = existsSync(exPath) ? numbersIn(readFileSync(exPath, 'utf8')) : new Set<number>();
    // Step durations and deliberately wrong answer options ({ label: '12' } without correct: true) aren't claims.
    const text = reelSrc.replace(/^\s*duration: [\d.]+,?$/gm, '').replace(/\{ label: (['"`]).*?\1 \}/g, '');
    const missing = new Set<string>();
    for (const m of text.matchAll(/(?<![\w.#-])(\d[\d,]*(?:\.\d+)?)(\s*%)?(?![\w.]?\d)/g)) {
      const raw = m[1];
      if (/^(19|20)\d\d$/.test(raw)) continue; // a year
      const v = Number(raw.replace(/,/g, ''));
      const ok = [...known].some((k) => near(k, v) || (m[2] && near(k, v / 100)));
      if (!ok) missing.add(raw + (m[2] ? '%' : ''));
    }
    if (missing.size)
      errors.push(`${t.id}: reel.tsx shows ${[...missing].join(', ')}, which examples.py doesn't compute or assert. Every number on screen comes from executed truth.`);

    // 4. The Prerequisites panel opens with a Basics section (PROJECT_PLAN.md, "Prerequisites first"; owner rule 2026-10-12),
    //    unless the topic predates the rule and is listed in src/topics/basics-backlog.json (ROUTINE.md section 1B adds it).
    const prePath = resolve(dir, 'prerequisites.mdx');
    const pre = existsSync(prePath) ? readFileSync(prePath, 'utf8') : '';
    const basics = basicsSection(pre);
    if (backlog.includes(t.id)) {
      if (basics) errors.push(`${t.id}: has a Basics section but is still listed in src/topics/basics-backlog.json. Remove it from the list.`);
    } else if (!basics) {
      errors.push(
        `${t.id}: prerequisites.mdx has no Basics section (<section class="prereq basics" data-section="basics">, first in the file). Write it as ROUTINE.md section 3 says: the topic's own terms, one bold-term bullet each with a definition and a scenario. Only a topic finished before 2026-10-12 may be listed in src/topics/basics-backlog.json instead.`,
      );
    } else {
      for (const p of basicsProblems(pre, basics)) errors.push(`${t.id}: the Basics section ${p}`);
    }
  }
  if (errors.length) throw new Error(`Topic file checks failed (QUALITY.md #35, #50, #54):\n- ${errors.join('\n- ')}`);
}
