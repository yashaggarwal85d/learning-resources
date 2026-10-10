// The coverage check (PROJECT_PLAN.md, Rule #6), run on every build: a topic is
// finished only when everything it must cover is mapped to where it is taught.
// Each topic folder has a coverage.json:
//   syllabus  every clause of the topic's syllabus line (together they must
//             cover the whole line), each mapped to where it is taught;
//   sources   the primary sources' contents, item by item;
//   expert    a "what an expert must know" list written blind by an
//             independent reviewer, item by item;
//   gapReview the adversarial gap hunt: its date, and no open items.
// A place ("at") is one of:
//   { "step": "<reel step title>" }            a step in this topic's reel.tsx
//   { "deep": "<Deep dive heading>" }          a ## or ### heading in index.mdx
//   { "topic": "<syllabus title>", "quote": "<words from its syllabus line>", "domain"?: "<id>" }
//                                              another topic whose syllabus line says it covers it
//   { "out": "<why>" }                         deliberately left out (sources and expert items only)
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Domain } from './syllabus';
import type { TopicMeta } from '../topics/registry';

type At = { step?: string; deep?: string; topic?: string; quote?: string; domain?: string; out?: string };
type Item = { item: string; at: At[] };
type Coverage = {
  topic: string;
  syllabus: { clause: string; at: At[] }[];
  sources: { source: string; items: Item[] }[];
  expert: { by: string; date: string; items: Item[] };
  gapReview: { date: string; by: string; open: string[] };
};

// Words a clause may leave out: they carry no content on their own.
const STOP = new Set(
  'a an and as at by for from how in into is it its of on one or other the their them to vs what when where which why with that this those these'.split(' '),
);
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

export function checkCoverage(domains: Domain[], topics: TopicMeta[]) {
  const scopes = new Map<string, { scope: string; index: number }>();
  for (const d of domains) {
    let i = 0;
    for (const m of d.milestones) for (const c of m.chapters) for (const t of c.topics) scopes.set(`${d.id}::${t.title}`, { scope: norm(t.scope), index: i++ });
  }

  const errors: string[] = [];
  for (const t of topics) {
    const dir = resolve(process.cwd(), 'src/topics', t.slug);
    const file = resolve(dir, 'coverage.json');
    const where = `${t.id} (coverage.json)`;
    if (!existsSync(file)) {
      errors.push(`${t.id} has no coverage.json. Map its syllabus line, primary sources and an independent expert list to where each item is taught.`);
      continue;
    }
    let cov: Coverage;
    try {
      cov = JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      errors.push(`${where}: not valid JSON (${(e as Error).message}).`);
      continue;
    }
    if (cov.topic !== t.id) errors.push(`${where}: "topic" is ${cov.topic}, expected ${t.id}.`);

    const own = scopes.get(`${t.domain}::${t.syllabusTitle}`)!;
    const steps = new Set([...readFileSync(resolve(dir, 'reel.tsx'), 'utf8').matchAll(/^\s*title: (['"`])(.*?)\1,?$/gm)].map((m) => m[2]));
    const headings = new Set([...readFileSync(resolve(dir, 'index.mdx'), 'utf8').matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));

    const checkAt = (label: string, at: At[] | undefined, allowOut: boolean) => {
      if (!at?.length) return errors.push(`${where}: "${label}" is not mapped anywhere. Teach it, or point to the topic that does.`);
      for (const a of at) {
        if (a.step !== undefined) {
          if (!steps.has(a.step)) errors.push(`${where}: "${label}" points to reel step "${a.step}", which reel.tsx doesn't have.`);
        } else if (a.deep !== undefined) {
          if (!headings.has(a.deep)) errors.push(`${where}: "${label}" points to Deep dive section "${a.deep}", which index.mdx doesn't have.`);
        } else if (a.topic !== undefined) {
          const other = scopes.get(`${a.domain ?? t.domain}::${a.topic}`);
          if (!other) errors.push(`${where}: "${label}" points to "${a.topic}", which is not a topic in syllabus/${a.domain ?? t.domain}.md.`);
          else if (!a.quote || !(other.scope + ' ' + a.topic).toLowerCase().includes(norm(a.quote).toLowerCase()))
            errors.push(`${where}: "${label}" points to "${a.topic}", but its syllabus line doesn't say "${a.quote ?? ''}". Quote the words that show it covers this.`);
          else if (a.topic === t.syllabusTitle && (a.domain ?? t.domain) === t.domain) errors.push(`${where}: "${label}" points to its own topic; point to a step or section.`);
        } else if (a.out !== undefined) {
          if (!allowOut) errors.push(`${where}: syllabus clause "${label}" is marked out of scope. The syllabus promises it: cover it, or change the syllabus.`);
          else if (!a.out.trim()) errors.push(`${where}: "${label}" is left out without a reason.`);
        } else errors.push(`${where}: "${label}" has a place that is none of step, deep, topic or out.`);
      }
    };

    // 1. The syllabus line, clause by clause, with nothing left over.
    const left = own.scope.toLowerCase().split('');
    for (const s of cov.syllabus ?? []) {
      const c = norm(s.clause).toLowerCase();
      const i = own.scope.toLowerCase().indexOf(c);
      if (!c || i < 0) errors.push(`${where}: clause "${s.clause}" is not in the syllabus line. Copy clauses from it word for word.`);
      else for (let k = i; k < i + c.length; k++) left[k] = ' ';
      checkAt(s.clause, s.at, false);
    }
    const uncovered = words(left.join('')).filter((w) => !STOP.has(w));
    if (uncovered.length) errors.push(`${where}: the syllabus line is not fully mapped; no clause covers: ${[...new Set(uncovered)].join(', ')}.`);

    // 2. Primary sources and 3. the independent expert list.
    if ((cov.sources ?? []).length < 2) errors.push(`${where}: map at least two primary sources' contents.`);
    for (const src of cov.sources ?? []) {
      if (!src.items?.length) errors.push(`${where}: source "${src.source}" has no items.`);
      for (const it of src.items ?? []) checkAt(it.item, it.at, true);
    }
    if (!cov.expert?.by || !cov.expert?.date || (cov.expert.items ?? []).length < 10)
      errors.push(`${where}: needs an independent expert list (by, date, at least 10 items), written without seeing the topic.`);
    for (const it of cov.expert?.items ?? []) checkAt(it.item, it.at, true);

    // 4. The gap hunt, resolved.
    if (!cov.gapReview?.date || !cov.gapReview?.by) errors.push(`${where}: record the adversarial gap review (by, date).`);
    if (cov.gapReview?.open?.length) errors.push(`${where}: the gap review has open items: ${cov.gapReview.open.join('; ')}. Cover them before shipping.`);
  }
  if (errors.length) throw new Error(`Coverage check failed (PROJECT_PLAN.md, Rule #6):\n- ${errors.join('\n- ')}`);
}
