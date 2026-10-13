// Does a topic's narration teach, and is it speakable? The same checks the build runs (site/src/lib/topic-checks.ts,
// checks 1, 2 and 5), on one or more topic folders, without a build: for the teacher pass and for a quick look.
//   node scripts/narration-teaches.mjs site/src/topics/<domain>/<milestone>/<chapter>/<topic> [...]
// Prints, per step: the share of the narration's four-word phrases found in the caption (must be under 50%), any caption
// sentence of eight words or more spoken verbatim (must be none), the word count of the longest line (at most 50), and
// unspeakable lines (digits, symbols, code names). Exit 1 if any topic fails.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
process.chdir(join(root, 'site'));
const { captions, readsTheScreen, reelSteps } = await import(join(root, 'site/src/lib/topic-checks.ts'));
const VOICE = JSON.parse(readFileSync(join(root, 'site/narration/voice.json'), 'utf8'));
const MAX_WORDS = VOICE.pace.max_words_per_line;
const UNSPEAKABLE = /[0-9_=<>{}[\]()/\\*#@|~^$%&`+]/;
const CODE_NAME = /\b[a-z]+[A-Z]\w*\b/;

let failed = false;
for (const arg of process.argv.slice(2)) {
  const dir = resolve(root, arg);
  const reel = readFileSync(join(dir, 'reel.tsx'), 'utf8');
  const steps = reelSteps(reel);
  const caps = captions(reel);
  const narr = JSON.parse(readFileSync(join(dir, 'narration.json'), 'utf8')).steps;
  const problems = [];
  if (narr.length !== steps.length) problems.push(`narration.json has ${narr.length} steps, reel.tsx has ${steps.length}`);
  if (caps.length !== steps.length) problems.push(`${caps.length} caption bodies for ${steps.length} steps (write each as body: (<>…</>))`);
  const rows = [];
  narr.forEach((n, i) => {
    const s = steps[i];
    const lines = [...n.lines, ...(n.answer ?? [])].filter((x) => typeof x === 'string');
    const spoken = lines.join(' ');
    const r = caps[i] !== undefined ? readsTheScreen(caps[i], spoken) : { share: 0, verbatim: null };
    const longest = Math.max(0, ...lines.map((l) => l.split(/\s+/).filter(Boolean).length));
    const bad = lines.filter((l) => UNSPEAKABLE.test(l) || CODE_NAME.test(l));
    const flags = [];
    if (r.share >= 0.5) flags.push('READS THE SCREEN');
    if (r.verbatim) flags.push(`VERBATIM: "${r.verbatim.slice(0, 50)}…"`);
    if (s && s.predict && !n.answer?.length) flags.push('predict step without an answer clip');
    if (s && !s.predict && n.answer) flags.push('answer clip on a step with no predict question');
    if (longest > MAX_WORDS) flags.push(`line of ${longest} words (limit ${MAX_WORDS})`);
    for (const l of bad) flags.push(`unspeakable: "${l.slice(0, 50)}"`);
    if (flags.length) failed = true;
    rows.push(`  step ${String(i + 1).padStart(2)}  caption-overlap ${String(Math.round(r.share * 100)).padStart(3)}%  longest ${String(longest).padStart(2)}w  ${flags.join('; ')}`);
  });
  if (problems.length) failed = true;
  console.log(`${arg}${problems.length ? '\n  ' + problems.join('\n  ') : ''}\n${rows.join('\n')}`);
}
process.exit(failed ? 1 : 0);
