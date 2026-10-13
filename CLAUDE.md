# CLAUDE.md — orientation for Claude Code in this repo

This is the learning site: every syllabus topic becomes a short animated, narrated reel, built by automated routines and checked against primary sources. Read this file first; the documents below hold the rules.

| File | What it is |
|---|---|
| `PROJECT_PLAN.md` | The rules. It wins any conflict. |
| `ROUTINE.md` | The procedure a cloud routine run follows to make one topic. |
| `QUALITY.md` | Every problem found, its fix, its guard; the automatic checks; the before-shipping list. |
| `DESIGN.md` | House style for reels. |
| `LEDGER.md`, `AUDIT.md` | Run records and the daily audit. |
| `syllabus/*.md` | The three curricula. Topics marked `*(skipped)*` stay in the curriculum and get no reel (`syllabus/review-notes/*-cuts.md`). |
| `site/` | The Astro site: topics in `src/topics/`, the registry in `src/topics/registry.ts`, narration pipeline in `narration/`, audio in `public/audio/`. |
| `scripts/claim.mjs` | Hands out jobs (plan, make, resume, release) and the switches in `scripts/claim-settings.json`. |

## Where work happens (owner decision 2026-10-13)

- **The cloud** (Claude routines, one per domain, currently paused): builds a topic end to end **except narration** and ships it to `main` as **held**, without audio. That is a **parked** topic: finished content, no page on the site yet, waiting for its voice. Skill: `.claude/skills/make-topic`.
- **The owner's PC** (Windows 11, Radeon RX 9070 XT, this machine when the working directory is a checkout of this repo on Windows): narrates the parked topics in bulk on the GPU and **releases** them, in syllabus order, as live reels. Skills: `.claude/skills/voice-showcase` (once, to pick the voice) and `.claude/skills/narrate` (every time).

`scripts/claim-settings.json` → `"narration": "pc"` is the switch that keeps release jobs away from the cloud; the PC takes them with `CLAIM_RELEASE=1`.

## Vocabulary the owner uses

- **"Narrate", "do the narration", "the parked topics", "release the held topics"** → `/narrate` (`.claude/skills/narrate/SKILL.md`). The work list is `cd site && npm run test:narration`: every warning names a held topic without audio.
- **"The voice showcase", "show me the voices", "audition", "pick the voice"** → `/voice-showcase` (`.claude/skills/voice-showcase/SKILL.md`): render every candidate voice on real script lines into `site/narration/pc/audition/` with an `index.html` to listen from, and wait for the owner to pick. **Production narration never starts until the owner has picked and the voice is frozen** (`site/narration/voice.json` → `version` is no longer `tara-v1`).
- **"The narration just reads the screen", "make it teach"** → the rule in `PROJECT_PLAN.md` (Narration → The narrator teaches): the caption is the written anchor, the narration explains. The build enforces a floor; `site/src/topics/narration-backlog.json` lists the old scripts still to rewrite, which `/narrate` step 1b does before narrating them.
- **"Re-narrate", "the re-narration queue"** → `site/src/topics/renarration.json`: topics whose scripts were rewritten and whose audio the PC must generate; live ones keep their old clips until then. `/narrate` works through it.
- **"Freeze the voice"** → `site/narration/pc/README.md` section 3: a new `voice.json` version and model block, the frozen reference clip committed, every existing clip regenerated.
- **"Parked" / "held"** → a finished topic on `main` with `status: 'held'` in the registry; **"live"** → released, on the site; **"skipped"** → a syllabus topic that gets no reel.
- **"The PC setup"** → `site/narration/pc/README.md` section 1 (Breeze-TTS-2.cpp on Vulkan, Qwen3-TTS on ROCm, the checker, `TTS_PY` and `EVAL_PY`).

## Rules that always apply

- The voice is one signature narrator for the whole site, female, chosen by the owner by listening, frozen in `voice.json`; never mixed, never changed without a version bump and a full regeneration. No cloning of a real, identifiable person: candidates are designed voices.
- Live reels are locked; a change to one carries an `Unlock: <topic-id>` line and the owner's approval. Regenerating narration for a voice change is such a change, approved by the decision to change the voice.
- Never loosen a check to get a clip or a topic through; fix the line or the topic.
- Checks: `node scripts/check-all.mjs --changed` from the repo root (docs, examples, sources, build, narration, reels, links). `main` is never left red.
- The site is a personal, non-commercial project; research-licensed model weights are allowed and the licence is recorded in `voice.json`.
