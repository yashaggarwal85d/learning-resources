// Mechanical checks on every finished topic's files, run on every build (QUALITY.md #35).
// They replace what reviewers used to check by eye, so reviews can spend their effort on judgement.
//   1. narration.json has one entry per reel step, in order, with an `answer` exactly on the predict steps;
//   2. narration lines are speakable: no digits, symbols or code-style names (numbers and names are written as said);
//   3. every number in the reel's on-screen text (reel.tsx) is computed or asserted in examples.py.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { TopicMeta } from '../topics/registry';

type Line = string | { de: string } | { beat: number };
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

export function checkTopicFiles(topics: TopicMeta[]) {
  const errors: string[] = [];
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
      // 2. Speakable lines.
      narr.forEach((n, i) =>
        [...n.lines, ...(n.answer ?? [])].forEach((x) => {
          const text = typeof x === 'string' ? x : 'de' in x ? x.de : null;
          if (text === null) return;
          const bad = text.match(UNSPEAKABLE) ?? text.match(CODE_NAME);
          if (bad) errors.push(`${t.id}: narration step ${i + 1} has "${bad[0]}" in "${text}". Write numbers, symbols and names the way they are said.`);
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
  }
  if (errors.length) throw new Error(`Topic file checks failed (QUALITY.md #35):\n- ${errors.join('\n- ')}`);
}
