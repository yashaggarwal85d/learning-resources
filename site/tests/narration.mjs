// Narration check, run in CI: every live reel has narration that matches its
// current script (a stale clip fails), with audio files present and every
// line word-perfect, loudness, peak and pace within the audio standard.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const site = new URL('..', import.meta.url).pathname;
const voice = JSON.parse(readFileSync(`${site}narration/voice.json`, 'utf8'));
const registry = readFileSync(`${site}src/topics/registry.ts`, 'utf8');
const live = [...registry.matchAll(/id: '([^']+)',[\s\S]*?slug: '([^']+)',[\s\S]*?status: '(live|held)'/g)].filter((m) => m[3] === 'live').map((m) => ({ id: m[1], slug: m[2] }));
const failures = [];
// Must match narration/common.py clip_hash: lines joined by newlines, beats as [beat s], plus the voice version.
const hash = (items) =>
  createHash('sha256')
    .update(items.map((x) => (typeof x === 'string' ? x : `[beat ${x.beat}]`)).join('\n') + '\n#voice:' + voice.version, 'utf8')
    .digest('hex')
    .slice(0, 16);

for (const t of live) {
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
    if (c.wer !== 0) failures.push(`${t.id} ${id}: a line was not spoken word-perfectly (WER ${c.wer})`);
    if (Math.abs(c.lufs - voice.audio.loudness_lufs) > 1.5) failures.push(`${t.id} ${id}: loudness ${c.lufs} LUFS`);
    if (c.true_peak > voice.audio.true_peak_dbtp + 0.3) failures.push(`${t.id} ${id}: peak ${c.true_peak} dBTP`);
    if (c.wpm < 100 || c.wpm > 170) failures.push(`${t.id} ${id}: pace ${c.wpm} wpm`);
  }
  if (Object.keys(manifest.clips).length !== clips.length) failures.push(`${t.id}: manifest has ${Object.keys(manifest.clips).length} clips, script has ${clips.length}`);
}
if (failures.length) {
  console.error(`Narration check failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`Narration check passed: ${live.length} live reel(s).`);
