---
name: narrate
description: On the owner's PC (GPU): narrate every parked topic in bulk, fit the clips to each topic, run the full checks, and release the complete chains in order. Use for "/narrate", "narrate the parked topics", "release the held topics". Never run on the cloud.
---

# /narrate

The PC half of making a topic (owner decision 2026-10-13). Routine runs on the cloud build topics and ship them **held without audio** (ROUTINE.md section 7). This skill, run on the owner's PC with the GPU, turns the parked topics into live ones.

## 0. Preconditions

- **The voice has been chosen.** `site/narration/voice.json` → `version` must no longer be `tara-v1` (the old CPU voice). If it still is, stop here and run `/voice-showcase` (`.claude/skills/voice-showcase/SKILL.md`): the owner listens to every candidate and picks one, the pick is frozen, and only then does narration start. Never narrate a parked topic with an unchosen voice.

- A clean checkout of `main`: `git fetch origin && git checkout main && git reset --hard origin/main`, then `cd site && npm ci`.
- The narration toolchain for this machine: `site/narration/pc/README.md` (Windows 11, Radeon RX 9070 XT: AMD's ROCm PyTorch wheels for `gfx1201`, `qwen-tts`, the checker, ffmpeg, `TTS_PY` and `EVAL_PY` in the shell). The pipeline's contract is unchanged: a generator writes one WAV per take at `take_path(line, take)` (`gen_takes_breeze.py` or `gen_takes_qwen.py` on the GPU, chosen by `voice.json` → `model.engine`), `assemble.py` checks, picks, assembles and masters. The site is personal and non-commercial, so research-licensed weights such as Breeze TTS 2 qualify (PROJECT_PLAN.md, Narration → Model).
- **The voice is frozen.** Every clip on the site must be the same narrator (PROJECT_PLAN.md, Narration: one signature voice). The first PC session picks the GPU voice by ear (`pc/README.md` section 2, `narration/audition.py`) and freezes it (section 3: a new `voice.json` version and model block). After that, changing the model, voice or settings is a deliberate decision: bump `version`, and then **every** topic's clips are stale (`test:narration` fails them) and must be regenerated, live ones included; that is a locked-reel change, so it carries an `Unlock:` line per live topic in the commit and the owner's explicit approval in the session. Do not mix voices across topics.

## 1. The work list

```sh
cd site && npm run test:narration
```

Every warning line names a held topic whose narration is missing, stale (script changed) or out of standard. That list, plus any live topic the check fails, is the job. Nothing else is narrated.

## 1b. The teacher pass: rewrite scripts that read the screen (before narrating them)

`site/src/topics/narration-backlog.json` lists the topics whose `narration.json` was written before the rule that the narrator teaches instead of reading the caption (PROJECT_PLAN.md, Narration → The narrator teaches; QUALITY.md #54). Every listed topic gets its script rewritten **before** its narration is generated, so no audio is ever made twice:

1. For each listed topic, launch a fresh **Opus** agent (effort high) with the topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `OUTLINE.md` and the plan's Narration section. It rewrites `narration.json` step by step as a teacher's explanation of what is on screen: why the picture looks like that, what to watch as it moves, what goes wrong otherwise, the intuition or analogy, the question before a reveal; a number only when the number is the point; never a caption sentence. It keeps the step count, the `answer` clips, the beats, the speakable-line rules (no digits, symbols or code names; at most 50 words a line) and the voice (short sentences, second person, no filler).
2. Remove the topic's id from `narration-backlog.json`, run `npm run build` (check 5 must pass for it now, and the build refuses a listed topic that passes), and read the new script yourself once as the listener: does it teach?
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

Commit the audio per topic: `Narration: <topic-id>` with `public/audio/<topic-id>/` and any `narration.json` or `OUTLINE.md` change, and push to `main` (narration of a held topic is not a locked-reel change). Then `npm run test:narration` again: the topic must have left the warning list.

## 3. Release the complete chains

Narrated topics go live in syllabus order, as chains, through the release job, which only the PC may take:

```sh
CLAIM_RELEASE=1 node scripts/claim.mjs next "<domain>"
```

It returns `release` with the chain of held topics whose earlier topics are all live, or `wait` when none is complete yet (then stop: a later `/narrate` releases it). Follow ROUTINE.md section 1, `release`, exactly: a branch `release/<first-topic-id>` from `origin/main`, each topic's `status: 'live'`, the seam check (content review of each topic's previous topic against its bridge, Prerequisites and `uses`), the full release check for a topic held longer than 14 days, the Basics section for topics still in `site/src/topics/basics-backlog.json`; then section 8 (merge `main`, `node scripts/check-all.mjs --changed` all green, `node scripts/claim.mjs mine`, merge, push, CI and Deploy green) and `node scripts/claim.mjs done`. Repeat per domain until every answer is `wait`.

## 4. Report

Per domain: topics narrated (and the lines rewritten), topics released with their live links, topics still parked and what they wait for, and the ledger line (`node scripts/run-metrics.mjs finish`).

## Never

- Run this on the cloud, or let a routine run narrate (ROUTINE.md section 7).
- Change the voice without a `version` bump, the owner's approval and a full regeneration.
- Release a topic whose narration check still warns, or out of syllabus order.
- Loosen a check to get a clip through; rewrite the line instead.
