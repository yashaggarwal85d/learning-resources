// Reads the domain syllabi in ../syllabus at build time, so the master page
// always matches them: Domains → Milestones → Chapters → Topics.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type Topic = { title: string; refresher: boolean };
export type Chapter = { number: number; title: string; topics: Topic[]; labs: number };
export type Milestone = { number: number; title: string; chapters: Chapter[]; cases: number };
export type Domain = {
  id: string;
  title: string;
  tagline: string;
  file: string;
  milestones: Milestone[];
  counts: { milestones: number; chapters: number; topics: number; labs: number; cases: number };
};

const DOMAINS = [
  {
    id: 'data-engineering',
    title: 'Data Engineering',
    tagline: 'The systems behind data platforms at the frontier, from storage engines to streaming and the AI data stack.',
  },
  {
    id: 'rust-systems-engineering',
    title: 'Rust Systems Engineering',
    tagline: 'Build the runtimes, storage engines and replicated logs yourself, in Rust, down to the kernel.',
  },
  {
    id: 'data-structures-and-algorithms',
    title: 'Data Structures & Algorithms',
    tagline: 'Engineering-grade structures and algorithms, stepped through live and tied to the systems they power.',
  },
  {
    id: 'german-language',
    title: 'German',
    tagline: 'From the first sound to C2: the system behind German, for adults who want to understand it.',
  },
] as const;

const clean = (s: string) =>
  s
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+—\s*$/, '')
    .trim();

function parse(md: string): Milestone[] {
  const milestones: Milestone[] = [];
  let m: Milestone | null = null;
  let c: Chapter | null = null;
  let inCases = false;
  for (const line of md.split('\n')) {
    if (/^# Appendix/.test(line)) break;
    const mm = line.match(/^# Milestone (\d+) — (.+)$/);
    if (mm) {
      m = { number: +mm[1], title: clean(mm[2]), chapters: [], cases: 0 };
      milestones.push(m);
      c = null;
      inCases = false;
      continue;
    }
    const cm = line.match(/^## Chapter (\d+) — (.+)$/);
    if (cm && m) {
      c = { number: +cm[1], title: clean(cm[2]), topics: [], labs: 0 };
      m.chapters.push(c);
      inCases = false;
      continue;
    }
    if (/^## /.test(line)) {
      // "Systems in Production", "Can-do check", "Assessment": not chapters.
      inCases = /^## Systems in Production/.test(line);
      c = null;
      continue;
    }
    if (/^- \*Lab/.test(line) && c) {
      c.labs++;
      continue;
    }
    const tm = line.match(/^- \*\*(.+?)\*\*(.*)$/);
    if (!tm || !m) continue;
    if (inCases) {
      m.cases++;
      continue;
    }
    if (c) c.topics.push({ title: clean(tm[1]).replace(/[.:]$/, ''), refresher: /\*\(refresher\)\*/.test(line) });
  }
  return milestones;
}

let cache: Domain[] | null = null;

export function loadDomains(): Domain[] {
  if (cache) return cache;
  cache = DOMAINS.map((d) => {
    const file = `${d.id}.md`;
    // Builds run from site/, and the syllabi live next to it in ../syllabus.
    const md = readFileSync(resolve(process.cwd(), '../syllabus', file), 'utf8');
    const milestones = parse(md);
    const chapters = milestones.flatMap((x) => x.chapters);
    return {
      ...d,
      file,
      milestones,
      counts: {
        milestones: milestones.length,
        chapters: chapters.length,
        topics: chapters.reduce((n, ch) => n + ch.topics.length, 0),
        labs: chapters.reduce((n, ch) => n + ch.labs, 0),
        cases: milestones.reduce((n, x) => n + x.cases, 0),
      },
    };
  });
  return cache;
}
