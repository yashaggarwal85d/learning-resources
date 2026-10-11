// Primary sources, read as they are: fetched raw (never through a summarising tool) and every quote checked word for word.
//   node scripts/sources.mjs fetch <url> <out.txt>     download a page or PDF and save its plain text (prints title and size)
//   node scripts/sources.mjs check <topic-folder>      check every quote in <topic-folder>/SOURCES.md against its source's text
//
// SOURCES.md format: one section per source.
//   ## <title of the source>
//   URL: <url>                      (the exact page or PDF the quotes come from)
//   Version: <edition, release or date shown on the source>
//   > a quote, copied exactly (several `>` lines in a row are one quote)
//   Notes in plain lines are allowed between quotes. The source's contents item by item go under "Contents:".
// The text of each source is cached in <topic-folder>/sources/ (not committed; fetched again when missing).
// A quote passes when, after normalising spaces, quotes, dashes and ligatures, it appears in the source's text.
// Fails (exit 1) on any quote that doesn't, or a source that can't be fetched. Sends nothing but the URL.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const UA = 'Mozilla/5.0 (compatible; learning-resources-source-check)';

function htmlToText(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  let s = html
    .replace(/<(script|style|noscript|svg|head)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|td|th|pre|blockquote|section|article|dd|dt|figcaption|caption)>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  const ent = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', hellip: '…', shy: '' };
  s = s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ent[e.toLowerCase()] ?? m));
  return { title, text: s.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim() };
}

export function fetchSource(url, out) {
  const dir = mkdtempSync(join(tmpdir(), 'src-'));
  try {
    const raw = join(dir, 'raw');
    const r = spawnSync('curl', ['-sSL', '--max-time', '90', '--retry', '2', '-A', UA, '-o', raw, '-w', '%{http_code} %{content_type}', url], { encoding: 'utf8' });
    const [code, type = ''] = r.stdout.trim().split(' ');
    if (r.status !== 0 || !/^2/.test(code)) throw new Error(`${url}: HTTP ${code || 'error'} ${r.stderr.trim()}`);
    const head = readFileSync(raw).subarray(0, 5).toString('latin1');
    let title = '', text;
    if (type.includes('pdf') || head === '%PDF-') {
      const p = spawnSync('pdftotext', ['-enc', 'UTF-8', raw, '-'], { encoding: 'utf8', maxBuffer: 1 << 28 });
      if (p.status !== 0) throw new Error(`${url}: pdftotext failed (install poppler-utils): ${p.stderr}`);
      text = p.stdout;
    } else ({ title, text } = htmlToText(readFileSync(raw, 'utf8')));
    writeFileSync(out, `${url}\n${title}\n\n${text}\n`);
    return { title, chars: text.length };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const norm = (s) =>
  s
    .normalize('NFKC')
    .replace(/[­​]/g, '')
    .replace(/[‘’‚‛′]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[‐‑‒–—―−]/g, '-')
    .replace(/-\s*\n\s*/g, '') // a word hyphenated across a line break (PDFs)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?)\]}])/g, '$1') // PDF text puts spaces before punctuation and inside brackets
    .replace(/([(\[{])\s+/g, '$1')
    .trim();

function parse(md) {
  const sources = [];
  let cur = null, quote = null;
  const flush = () => { if (quote && cur) cur.quotes.push(quote.join(' ')); quote = null; };
  for (const line of md.split('\n')) {
    const h = line.match(/^## (.+)$/);
    if (h) { flush(); cur = { title: h[1].trim(), url: null, quotes: [] }; sources.push(cur); continue; }
    if (!cur) continue;
    const u = line.match(/^URL:\s*(\S+)/);
    if (u) { flush(); cur.url = u[1]; continue; }
    const q = line.match(/^>\s?(.*)$/);
    if (q) { (quote ??= []).push(q[1]); continue; }
    flush();
  }
  flush();
  return sources;
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'fetch' && a && b) {
  const r = fetchSource(a, b);
  console.log(`fetched ${a}: "${r.title}", ${r.chars} characters of text → ${b}`);
} else if (cmd === 'check' && a) {
  const file = join(a, 'SOURCES.md');
  if (!existsSync(file)) { console.error(`sources: no ${file}`); process.exit(1); }
  const cache = join(a, 'sources');
  mkdirSync(cache, { recursive: true });
  let bad = 0, ok = 0;
  for (const s of parse(readFileSync(file, 'utf8'))) {
    if (!s.url) { console.error(`- "${s.title}": no URL line`); bad++; continue; }
    if (!s.quotes.length) continue;
    const txt = join(cache, s.url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 120) + '.txt');
    try {
      if (!existsSync(txt)) fetchSource(s.url, txt);
    } catch (e) {
      console.error(`- "${s.title}": can't fetch the source: ${e.message}`);
      bad += s.quotes.length;
      continue;
    }
    const text = norm(readFileSync(txt, 'utf8'));
    for (const q of s.quotes) {
      if (text.includes(norm(q))) ok++;
      else { bad++; console.error(`- "${s.title}": not found word for word: "${q.slice(0, 160)}${q.length > 160 ? '…' : ''}"`); }
    }
  }
  console.log(`sources: ${ok} quote(s) found word for word, ${bad} problem(s).`);
  process.exit(bad ? 1 : 0);
} else {
  console.error('usage: sources.mjs fetch <url> <out.txt> | check <topic-folder>');
  process.exit(2);
}
