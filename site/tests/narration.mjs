// Narration check, run in CI: every live reel has narration that matches its
// current script (a stale clip fails), with audio files present and every
// line word-perfect, loudness, peak and pace within the audio standard.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const site = fileURLToPath(new URL('..', import.meta.url));
const voice = JSON.parse(readFileSync(`${site}narration/voice.json`, 'utf8'));
const registry = readFileSync(`${site}src/topics/registry.ts`, 'utf8');
const topics = [...registry.matchAll(/id: '([^']+)',[\s\S]*?slug: '([^']+)',[\s\S]*?status: '(live|held)'/g)].map((m) => ({ id: m[1], slug: m[2], status: m[3] }));
const live = topics.filter((t) => t.status === 'live');
// A live topic's problem fails the check. A held topic's is a warning: the release run that makes it live must run
// narrate.sh on it first (ROUTINE.md section 1, `release`), and that run re-picks takes and re-masters from the cache.
// A topic queued for re-narration (src/topics/renarration.json: its script was rewritten so the narrator teaches, the
// PC generates the new audio in bulk) is a warning too, live or not: it keeps playing its old clips until then.
const renarration = new Set(JSON.parse(readFileSync(`${site}src/topics/renarration.json`, 'utf8')).pending);
const liveFailures = [];
const warnings = [];
// Must match narration/common.py clip_hash: lines joined by newlines, beats as [beat s], plus the voice version.
const hash = (items) =>
  createHash('sha256')
    .update(items.map((x) => (typeof x === 'string' ? x : `[beat ${x.beat}]`)).join('\n') + '\n#voice:' + voice.version, 'utf8')
    .digest('hex')
    .slice(0, 16);

for (const t of topics) {
  const failures = t.status === 'live' && !renarration.has(t.id) ? liveFailures : warnings;
  const scriptPath = `${site}src/topics/${t.slug}/narration.json`;
  if (!existsSync(scriptPath)) {
    failures.push(`${t.id}: no narration.json`);
    continue;
  }
  const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
  const dir = `${site}public/audio/${t.id}`;
  if (!existsSync(`${dir}/manifest.json`)) {
    failures.push(`${t.id}: narration not generated (run narration/narrate.sh)`);
    continue;
  }
  const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, 'utf8'));
  if (manifest.voice !== voice.version) failures.push(`${t.id}: narrated with voice ${manifest.voice}, current is ${voice.version}`);
  const clips = script.steps.flatMap((s, i) => {
    const id = String(i + 1).padStart(2, '0');
    return [[id, s.lines], ...(s.answer ? [[`${id}a`, s.answer]] : [])];
  });
  for (const [id, items] of clips) {
    const c = manifest.clips[id];
    if (!c) { failures.push(`${t.id} ${id}: no clip`); continue; }
    if (c.hash !== hash(items)) failures.push(`${t.id} ${id}: clip is stale (script changed); regenerate`);
    for (const ext of ['mp3', 'webm']) if (!existsSync(`${dir}/${id}.${ext}`)) failures.push(`${t.id} ${id}: missing ${id}.${ext}`);
    // A take passes when every difference between its transcript and the line is a mishearing a listener would not
    // notice (narration/match.py); the manifest lists each one, so a reviewer can listen to exactly those clips.
    if (c.wer !== 0 && !Array.isArray(c.tolerated)) failures.push(`${t.id} ${id}: a line was not spoken word-perfectly (WER ${c.wer})`);
    if (Array.isArray(c.tolerated) && c.tolerated.length > voice.asr.max_tolerated_per_clip) failures.push(`${t.id} ${id}: ${c.tolerated.length} tolerated mishearings in one clip (limit ${voice.asr.max_tolerated_per_clip}); regenerate or rewrite`);
    if (Math.abs(c.lufs - voice.audio.loudness_lufs) > 1.5) failures.push(`${t.id} ${id}: loudness ${c.lufs} LUFS`);
    if (c.true_peak > voice.audio.true_peak_dbtp + 0.3) failures.push(`${t.id} ${id}: peak ${c.true_peak} dBTP`);
    if (c.wpm < voice.pace.clip_wpm[0] || c.wpm > voice.pace.clip_wpm[1]) failures.push(`${t.id} ${id}: pace ${c.wpm} wpm`);
  }
  if (Object.keys(manifest.clips).length !== clips.length) failures.push(`${t.id}: manifest has ${Object.keys(manifest.clips).length} clips, script has ${clips.length}`);
}
if (warnings.length) console.warn(`Reels whose narration the PC must generate (held, or queued in src/topics/renarration.json; narration/narrate.sh):\n- ${warnings.join('\n- ')}`);
if (liveFailures.length) {
  console.error(`Narration check failed:\n- ${liveFailures.join('\n- ')}`);
  process.exit(1);
}
console.log(`Narration check passed: ${live.length} live reel(s), ${topics.length - live.length} held, ${[...renarration].filter((id) => topics.some((t) => t.id === id)).length} queued for re-narration.`);
