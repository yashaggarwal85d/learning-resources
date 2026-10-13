---
name: make-topic
description: Build the next topic of one domain on the cloud and park it for narration. Use for "/make-topic <domain>", "build the next <domain> topic", or as the body of a domain's routine. Does everything in ROUTINE.md except narration: the topic ships held without audio, and the PC narrates and releases it later (/narrate).
---

# /make-topic <domain>

The cloud half of making a topic. It is ROUTINE.md, followed exactly, with narration parked (owner decision 2026-10-13).

## Steps

1. `node scripts/claim.mjs next "<domain>"` first, before reading anything. `wait` → stop with the reason. `plan` → ROUTINE.md section 1A. `make` or `resume` → sections 1 to 6, then 8 and 9. A routine run never gets `release` while `scripts/claim-settings.json` has `"narration": "pc"`.
2. Never start `site/narration/setup.sh` or `narrate.sh`, never generate or commit audio. The topic's `narration.json` is still written in full (section 3) and checked by the build (one entry per step, speakable lines, at most 50 words a line): it is the script the PC will voice.
3. Ship with `status: 'held'`, always (section 8). `node scripts/check-all.mjs --changed` must be green; the narration check's warning for this held topic is expected.
4. Report (section 9): the topic shipped **held, parked for narration on the PC**.

## What "parked" means

- Finished content on `main`, no page on the site yet (held topics get no page), no audio.
- `npm run test:narration` lists it as a warning ("narration not generated"). That list is the PC's work list.
- Release happens only from the PC, after narration, in syllabus order (`/narrate`).

## Rules that still apply in full

ROUTINE.md section 0 (one job per run, locked live reels, never end the turn while a job runs, models: Sonnet, Opus for the five judgment jobs), QUALITY.md, DESIGN.md, the chapter plan as the contract, the flow rule (a held topic is released only once every topic before it is live).
