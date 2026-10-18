// The rules a topic's notes files must meet. Pure functions, no Node APIs: the build check (topic-checks.ts) and the
// in-page editor (reels/NotesPanel.tsx) run the same code, so a save that would turn `main` red is refused in the browser.
//   pre-notes.md   what must be known before watching: 4–14 bullets "- **Term**: definition. *Where you meet it:* scenario.",
//                  under 400 words, no links, nothing the reel itself explains (ROUTINE.md section 3).
//   post-notes.md  the Deep dive: sections after the reel, with a heading, no unsafe HTML.
//   references.md     the sources actually used: a list with the date they were last verified.

export type NotesKind = 'pre' | 'post';
export const NOTES_FILE: Record<NotesKind, string> = { pre: 'pre-notes.md', post: 'post-notes.md' };

const wordCount = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

/** HTML that would run code or load something when the notes are shown (they are rendered into the page). Code samples
 * (fenced blocks and `inline code`) are text, so they are not scanned. */
export function unsafeHtml(text: string): string | null {
  const prose = text.replace(/^```[\s\S]*?^```/gm, ' ').replace(/`[^`\n]*`/g, ' ');
  const m = prose.match(/<\s*(script|iframe|object|embed|style|link|meta|form)\b/i) ?? prose.match(/<[a-z][^>]*\son[a-z]+\s*=/i) ?? prose.match(/javascript:/i);
  return m ? m[0].trim() : null;
}

export function preNotesProblems(text: string): string[] {
  const problems: string[] = [];
  const bullets = text.match(/^\s*- \*\*[^*\n]+\*\*/gm)?.length ?? 0;
  if (bullets < 4 || bullets > 14) problems.push(`has ${bullets} term bullet(s) ("- **Term**: …"); it needs 4 to 14.`);
  const words = wordCount(text);
  if (words > 400) problems.push(`is ${words} words; keep it under 400: a primer, not a lesson.`);
  if (/<Resource\b|href=|\]\(|https?:\/\//.test(text)) problems.push('has a link; links belong in Prerequisites and Sources.');
  if (/<section\b/.test(text)) problems.push('should be plain Markdown bullets, without <section> wrappers.');
  const bad = unsafeHtml(text);
  if (bad) problems.push(`contains "${bad}", which is not allowed in notes.`);
  return problems;
}

export function postNotesProblems(text: string): string[] {
  const problems: string[] = [];
  if (!/^#{2,3} .+$/m.test(text)) problems.push('needs at least one ## heading.');
  if (wordCount(text) < 150) problems.push('is too short to be a Deep dive (under 150 words).');
  const bad = unsafeHtml(text);
  if (bad) problems.push(`contains "${bad}", which is not allowed in notes.`);
  return problems;
}

export function sourcesProblems(text: string): string[] {
  const problems: string[] = [];
  if (!/^\s*- .+/m.test(text)) problems.push('needs a list of sources ("- Author, "Title", venue, year. [link](url)").');
  if (!/Last verified[^\n]*\b20\d\d\b/.test(text)) problems.push('needs a dated "Last verified …" line (for example "Last verified: 2026-10-13").');
  const bad = unsafeHtml(text);
  if (bad) problems.push(`contains "${bad}", which is not allowed in notes.`);
  return problems;
}

export const problemsFor = (kind: NotesKind, text: string) => (kind === 'pre' ? preNotesProblems(text) : postNotesProblems(text));

/** A line diff (longest common subsequence): the ops to turn `a` into `b`, for the editor's conflict view. */
export function lineDiff(a: string, b: string): { op: ' ' | '-' | '+'; line: string }[] {
  const x = a.split('\n'), y = b.split('\n');
  const n = x.length, m = y.length;
  const t: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) t[i][j] = x[i] === y[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  const out: { op: ' ' | '-' | '+'; line: string }[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) out.push({ op: ' ', line: x[i++] }), j++;
    else if (t[i + 1][j] >= t[i][j + 1]) out.push({ op: '-', line: x[i++] });
    else out.push({ op: '+', line: y[j++] });
  }
  while (i < n) out.push({ op: '-', line: x[i++] });
  while (j < m) out.push({ op: '+', line: y[j++] });
  return out;
}
