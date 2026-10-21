---
name: narrate
description: On the owner's PC (GPU): narrate every topic whose audio is missing or stale (the re-narration queue, held topics) in bulk, fit the clips to each topic, run the full checks and push. Use for "/narrate", "narrate the parked topics", "do the narration", "release the held topics". Never run on the cloud.
---

# /narrate

Narration in bulk on the owner's PC. New topics are narrated by `/make-topic` as it finishes them (`.claude/skills/make-topic`, section 10); this skill handles everything else: topics that went live before they were narrated (`site/src/topics/renarration.json`), scripts rewritten by the teacher pass, and any topic still held. Do every step yourself, in this session, without subagents (owner rule).

## 0. Preconditions

- **The voice has been chosen.** `site/narration/voice.json` → `version` must no longer be `tara-v1` (the old CPU voice). If it still is, stop here and run `/voice-showcase` (`.claude/skills/voice-showcase/SKILL.md`): the owner listens to every candidate and picks one, the pick is frozen, and only then does narration start. Never narrate a parked topic with an unchosen voice.

- A clean checkout of `main`: `git fetch origin && git checkout main && git reset --hard origin/main`, then `cd site && npm ci`.
- The narration toolchain for this machine: `site/narration/pc/README.md` (Windows 11, Radeon RX 9070 XT: AMD's ROCm PyTorch wheels for `gfx1201`, `qwen-tts`, the checker, ffmpeg, `TTS_PY` and `EVAL_PY` in the shell). The pipeline's contract is unchanged: a generator writes one WAV per take at `take_path(line, take)` (`gen_takes_breeze.py` or `gen_takes_qwen.py` on the GPU, chosen by `voice.json` → `model.engine`), `assemble.py` checks, picks, assembles and masters. The site is personal and non-commercial, so research-licensed weights such as Breeze TTS 2 qualify (PROJECT_PLAN.md, Narration → Model).
- **The voice is frozen.** Every clip on the site must be the same narrator (PROJECT_PLAN.md, Narration: one signature voice). The first PC session picks the GPU voice by ear (`pc/README.md` section 2, `narration/audition.py`) and freezes it (section 3: a new `voice.json` version and model block). After that, changing the model, voice or settings is a deliberate decision: bump `version`, and then **every** topic's clips are stale (`test:narration` fails them) and must be regenerated, live ones included; that is a locked-reel change, so it carries an `Unlock:` line per live topic in the commit and the owner's explicit approval in the session. Do not mix voices across topics.

## 1. The work list

```sh
cd site && npm run test:narration
```

Every warning line names a topic whose narration is missing, stale (script changed) or out of standard: held topics, and the topics queued in `site/src/topics/renarration.json` (their scripts were rewritten so the narrator teaches; live ones keep playing their old clips until now). That list, plus any live topic the check fails, is the job. Nothing else is narrated. When a queued topic's clips match its current script again, remove its id from `renarration.json` in the same commit as its audio.

## 1b. The teacher pass: rewrite scripts that read the screen (before narrating them)

`site/src/topics/narration-backlog.json` lists the topics whose `narration.json` was written before the rule that the narrator teaches instead of reading the caption (PROJECT_PLAN.md, Narration → The narrator teaches; QUALITY.md #54). Every listed topic gets its script rewritten **before** its narration is generated, so no audio is ever made twice:

1. For each listed topic, follow the brief `.claude/skills/narrate/teacher-pass.md` (the MIT-professor persona, the constraints, the procedure and the examples) and rewrite its `narration.json` in place; validate with `node scripts/narration-teaches.mjs <folder>`.
2. Then review it cold, as the professor's peer: re-read the script against the reel and the Deep dive, step by step (would she say this; reasons before rules; wrong intuition corrected; no restating of the description; facts match the reel and the Deep dive), and redo every step that fails. Remove the topic's id from `narration-backlog.json`, run `npm run build` (check 5 must pass for it now, and the build refuses a listed topic that passes), and read the new script once more as the listener: does it teach?
3. Commit `Narration script: <topic-id> teaches` with the two files. For a **live** topic the script is part of a locked reel: the commit also carries `Unlock: <topic-id>`, which the owner's decision of 2026-10-13 authorises for this change and the regeneration that follows.

Then narrate it (section 2).

## 2. Narrate in bulk

For each topic in the list, from `site/`:

```sh
narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

Run them back to back (one process at a time: the generator owns the GPU). `narrate.sh` restores the take cache from the `narration-cache` branch first and saves it when it stops, so nothing is generated twice. The script's lint runs before any take (a line over 50 words or with hyphen-joined letters is refused: fix the line first). The transcript check tolerates a mishearing a listener would not notice and lists each one in the build output and the manifest; a line no take can pass is listed at the end, together with every other such line: rewrite every one (plainer words, names and numbers as they are said), add the change under `OUTLINE.md` → "Changes after final" if it changes what is taught, and run that topic again (only the new takes are generated).

**Fit to the topic** is what `assemble.py build` does at the end: it chooses takes per clip so the clip meets the pace limit, masters to the audio standard, writes `public/audio/<topic-id>/NN.webm`, `NN.mp3` and `manifest.json` (script hash, per-line timings the captions use, loudness, peak, pace, the takes behind each clip, tolerated mishearings). Nothing else fits clips to a topic; do not edit the manifest by hand.

Listen to each topic end to end, the clips with tolerated mishearings first ("listen: 'reel' heard 'real'" in the output). A clip that sounds wrong is a take to reject: add the heard word to `voice.json` → `asr.homophones` only if the voice really said the line; otherwise rewrite the line.

Commit the audio per topic: `Narration: <topic-id>` with `public/audio/<topic-id>/`, any `narration.json` or `OUTLINE.md` change, and the topic's id removed from `renarration.json`. A live topic's audio is part of a locked reel, so the commit carries `Unlock: <topic-id>`, which the owner's decision of 2026-10-17 (topics may go live before they are narrated) authorises for this change. Stage only those paths (other sessions may share the checkout), run `npm run test:narration` (the topic must have left the warning list) and push to `main`.

## 3. Held topics

Topics are made in order and ship live (`/make-topic`), so normally nothing is held. If the registry still has a `status: 'held'` topic whose earlier topics are all live and whose narration passes, make it live: set `status: 'live'`, check its seam (its bridge, Prerequisites and `uses` against the previous topic as it really is), run `node scripts/check-all.mjs --changed` until green, push, and watch CI and Deploy.

## 4. Report

Topics narrated (and the lines rewritten), topics made live with their links, what is still queued and why, and optionally the ledger line (`node scripts/run-metrics.mjs finish`).

## Never

- Run this on the cloud.
- Change the voice without a `version` bump, the owner's approval and a full regeneration.
- Release a topic whose narration check still warns, or out of syllabus order.
- Loosen a check to get a clip through; rewrite the line instead.
