// Checks every relative link and #anchor in the repo's Markdown files.
// External (http) links are skipped on purpose: they make CI flaky.
// Anchors follow GitHub's heading slugs (lowercase, punctuation dropped,
// spaces to hyphens, -1/-2 for repeats). No dependencies: `node scripts/check-docs.mjs`.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules', 'dist']);

function mdFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return mdFiles(p);
    return name.endsWith('.md') ? [p] : [];
  });
}

/** Markdown with fenced code blocks and inline code removed. */
const prose = (text) => text.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').replace(/`[^`\n]*`/g, '');

const slug = (heading) =>
  heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) -> text
    .replace(/[`*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, '')
    .replace(/ /g, '-');

const anchorCache = new Map();
function anchors(file) {
  if (anchorCache.has(file)) return anchorCache.get(file);
  const seen = new Map();
  const set = new Set();
  for (const line of readFileSync(file, 'utf8').replace(/^(```|~~~)[\s\S]*?^\1/gm, '').split('\n')) {
    const m = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const base = slug(m[1]);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    set.add(n ? `${base}-${n}` : base);
  }
  anchorCache.set(file, set);
  return set;
}

const problems = [];
const files = mdFiles(ROOT);
for (const file of files) {
  const text = prose(readFileSync(file, 'utf8'));
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // http:, mailto:, …
    const [path, hash] = target.split('#');
    const dest = path ? resolve(dirname(file), decodeURIComponent(path)) : file;
    const where = relative(ROOT, file);
    if (!existsSync(dest)) {
      problems.push(`${where}: missing file ${target}`);
      continue;
    }
    if (hash && dest.endsWith('.md') && !anchors(dest).has(decodeURIComponent(hash).toLowerCase())) {
      problems.push(`${where}: no heading for #${hash} in ${relative(ROOT, dest)}`);
    }
  }
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  console.error(`\n${problems.length} broken link(s) in ${files.length} Markdown file(s).`);
  process.exit(1);
}
console.log(`✓ all relative links and anchors resolve (${files.length} Markdown files)`);
