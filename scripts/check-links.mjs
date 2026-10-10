// Checks every outside link in the topics (Deep dive, Prerequisites): that it loads, and for <Resource>
// links that the page is what the title says (YouTube titles via oEmbed, other pages via <title>).
//   node scripts/check-links.mjs [file.mdx ...]      (default: every .mdx under site/src/topics)
// Fails (exit 1) only on links that are really gone: 404/410, or a domain that doesn't exist.
// Reported for a human, without failing: 401/403/429 (sites that block bots), 5xx and other errors (often a
// proxy or a temporary outage), and titles that don't match.
// Never sends anything but the URL itself (no personal information in any request).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith('.mdx') ? [join(d, f)] : []));
const files = process.argv.slice(2).length ? process.argv.slice(2) : walk(join(root, 'site/src/topics'));

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, '');
const words = (s) => decode(s).toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
// A title matches if most of its words appear in the page's title (pages add site names, numbering, etc.).
const matches = (want, got) => {
  const w = words(want).filter((x) => x.length > 2);
  const g = new Set(words(got));
  return !w.length || w.filter((x) => g.has(x)).length / w.length >= 0.6;
};

const links = new Map(); // url -> { title?, where }
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const where = relative(root, f);
  for (const m of src.matchAll(/<Resource\b[^>]*>/g)) {
    const href = m[0].match(/href="([^"]+)"/)?.[1];
    const title = m[0].match(/title="([^"]+)"/)?.[1];
    if (href?.startsWith('http')) links.set(href, { title, where });
  }
  for (const m of src.matchAll(/\]\((https?:\/\/[^)\s]+)\)|href="(https?:\/\/[^"]+)"/g)) {
    const url = m[1] ?? m[2];
    if (!links.has(url)) links.set(url, { where });
  }
}

const UA = { 'user-agent': 'Mozilla/5.0 (compatible; learning-resources-link-check)' };
async function get(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(url, { redirect: 'follow', headers: UA, signal: AbortSignal.timeout(25000) });
      const type = r.headers.get('content-type') ?? '';
      const body = type.includes('html') ? (await r.text()).slice(0, 200000) : '';
      return { status: r.status, body };
    } catch (e) {
      if (attempt) return { status: 0, error: e.cause?.code ?? e.message };
    }
  }
}

async function check(url, { title }) {
  const yt = url.match(/youtube\.com\/watch\?v=|youtu\.be\//);
  if (yt) {
    const r = await get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`);
    if (r.status !== 200) return { kind: [400, 404].includes(r.status) ? 'broken' : 'blocked', note: `YouTube oEmbed ${r.status || r.error} (video removed or private?)` };
    let got = '';
    try {
      got = JSON.parse(r.body || (await (await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, { headers: UA })).text())).title;
    } catch {}
    return title && got && !matches(title, got) ? { kind: 'title', note: `video is titled "${got}"` } : { kind: 'ok' };
  }
  const r = await get(url);
  if (!r.status) return r.error === 'ENOTFOUND' ? { kind: 'broken', note: 'the domain does not exist' } : { kind: 'blocked', note: `unreachable (${r.error}); open it by hand` };
  if ([404, 410].includes(r.status)) return { kind: 'broken', note: `HTTP ${r.status}: the page is gone` };
  if (r.status >= 400) return { kind: 'blocked', note: `HTTP ${r.status}: blocked or temporarily failing; open it by hand` };
  const got = r.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (title && got && !matches(title, got)) return { kind: 'title', note: `page is titled "${decode(got).replace(/\s+/g, ' ')}"` };
  return { kind: 'ok' };
}

const results = [];
const queue = [...links];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const [url, meta] = queue.shift();
      results.push({ url, ...meta, ...(await check(url, meta)) });
    }
  }),
);

const by = (k) => results.filter((r) => r.kind === k);
for (const [k, label] of [['broken', 'BROKEN'], ['blocked', 'check by hand'], ['title', 'title mismatch (check by hand)']])
  for (const r of by(k)) console.log(`${label}: ${r.url}\n  in ${r.where}${r.title ? ` as "${r.title}"` : ''}: ${r.note}`);
console.log(`\n${results.length} link(s): ${by('ok').length} ok, ${by('broken').length} broken, ${by('blocked').length} blocked, ${by('title').length} title mismatch.`);
process.exit(by('broken').length ? 1 : 0);
