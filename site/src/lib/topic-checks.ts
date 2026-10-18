// Mechanical checks on every finished topic's files, run on every build (QUALITY.md #35).
// They replace what reviewers used to check by eye, so reviews can spend their effort on judgement.
//   1. narration.json has one entry per reel step, in order, with an `answer` exactly on the predict steps;
//   2. narration lines are speakable: no digits, symbols or code-style names (numbers and names are written as said),
//      and no line longer than the voice's token budget allows (narration/voice.json → pace.max_words_per_line);
//   3. every number in the reel's on-screen text (reel.tsx) is computed or asserted in examples.py;
//   4. the panel's tabs have their files: prerequisites.mdx (links only), pre-notes.md (the topic's own terms, in brief;
//      QUALITY.md #50), post-notes.md (the Deep dive) and references.md, each obeying lib/notes-rules.ts;
//   5. the narration teaches instead of reading the description (the step's body; owner rule 2026-10-13, QUALITY.md #54):
//      no step's narration shares half or more of its four-word phrases with its description, and no description sentence
//      of eight words or more is spoken verbatim, unless the topic predates the rule and is listed in
//      src/topics/narration-backlog.json (only shrinks). The narration is the voice and the captions; the persona is the
//      MIT professor of PROJECT_PLAN.md (Narration → The narrator's persona).
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { TopicMeta } from '../topics/registry';
import { postNotesProblems, preNotesProblems, sourcesProblems } from './notes-rules';

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

    // 4. The panel's four tabs have their files (PROJECT_PLAN.md, "Prerequisites first" and the notes; owner decision 2026-10-17):
    //    prerequisites.mdx is links only; pre-notes.md, post-notes.md and references.md are Markdown that obey notes-rules.ts
    //    (the same rules the in-page editor applies before it saves).
    const prePath = resolve(dir, 'prerequisites.mdx');
    const pre = existsSync(prePath) ? readFileSync(prePath, 'utf8') : '';
    if (/data-section="basics"|class="check"/.test(pre)) errors.push(`${t.id}: prerequisites.mdx is links only now; move the Basics section to pre-notes.md and delete the prose around the links.`);
    const notes: [string, (s: string) => string[]][] = [
      ['pre-notes.md', preNotesProblems],
      ['post-notes.md', postNotesProblems],
      ['references.md', sourcesProblems],
    ];
    for (const [file, problems] of notes) {
      const p = resolve(dir, file);
      if (!existsSync(p)) errors.push(`${t.id}: no ${file}. Every topic has pre-notes.md, post-notes.md and references.md next to its reel (ROUTINE.md section 3).`);
      else for (const msg of problems(readFileSync(p, 'utf8'))) errors.push(`${t.id}: ${file} ${msg}`);
    }
    if (existsSync(resolve(dir, 'index.mdx'))) errors.push(`${t.id}: index.mdx is gone; the Deep dive is post-notes.md and the sources are references.md.`);
  }
  if (errors.length) throw new Error(`Topic file checks failed (QUALITY.md #35, #50, #54):\n- ${errors.join('\n- ')}`);
}
