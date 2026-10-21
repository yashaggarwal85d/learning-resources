# CLAUDE.md — orientation for Claude Code in this repo

This is the learning site: every syllabus topic becomes a short animated, narrated reel, made one at a time in Claude Code with `/make-topic` and checked against primary sources. Read this file first; the documents below hold the rules.

| File | What it is |
|---|---|
| `PROJECT_PLAN.md` | The rules. It wins any conflict. |
| `.claude/skills/make-topic/SKILL.md` | How a topic is made, start to finish, in one session (`/make-topic <domain>`). |
| `QUALITY.md` | Every problem found, its fix, its guard; the automatic checks; the before-shipping list. |
| `DESIGN.md` | House style for reels. |
| `LEDGER.md` | Run records (routine runs until 2026-10-20, sessions after). |
| `syllabus/*.md` | The three curricula. Topics marked `*(skipped)*` stay in the curriculum and get no reel (`syllabus/review-notes/*-cuts.md`). |
| `site/` | The Astro site: topics in `src/topics/`, the registry in `src/topics/registry.ts`, narration pipeline in `narration/`, audio in `public/audio/`. |
| `scripts/next-topic.mjs` | The next topic of a domain to make: id, folder, chapter plan, neighbours. |

## Where work happens (owner decision 2026-10-20)

- **No routines.** The cloud routines, the claims branch and the daily audit are retired. The owner opens Claude Code on the PC (Windows 11, Radeon RX 9070 XT, this machine when the working directory is a checkout of this repo on Windows) and asks for topics.
- **Making topics:** `.claude/skills/make-topic` does everything for one topic in one session, without subagents: plan the chapter if needed, research, storyboard, fact-check, coverage map, every file, content and looks reviews, every check, narration on the GPU, ship live.
- **Narration and the voice:** `.claude/skills/narrate` (topics queued in `renarration.json`, the teacher pass) and `.claude/skills/voice-showcase` (once, to pick the voice).
- **Another session may share this checkout** (a narration run commits audio to `main`): check `git status` and running processes first, stage only your own files, and use a worktree for a topic when something else is working here.

## Vocabulary the owner uses

- **"Make the next topic", "create a new topic", "make the next N topics", "plan the next chapter"** → `/make-topic <domain> [count]` (`.claude/skills/make-topic/SKILL.md`).
- **"Narrate", "do the narration", "the parked topics", "release the held topics"** → `/narrate` (`.claude/skills/narrate/SKILL.md`). The work list is `cd site && npm run test:narration`: every warning names a held topic without audio.
- **"The voice showcase", "show me the voices", "audition", "pick the voice"** → `/voice-showcase` (`.claude/skills/voice-showcase/SKILL.md`): render every candidate voice on real script lines into `site/narration/pc/audition/` with an `index.html` to listen from, and wait for the owner to pick. **Production narration never starts until the owner has picked and the voice is frozen** (`site/narration/voice.json` → `version` is no longer `tara-v1`).
- **"The narration just reads the screen", "make it teach", "like an MIT professor"** → the rule and the persona in `PROJECT_PLAN.md` (Narration → Three texts, one rule; The narrator's persona), the writing brief `.claude/skills/narrate/teacher-pass.md`. Three texts per step: the **on-screen text** in the drawing, the **description** (the paragraph under the animation), and the **narration**, which is both the voice and the captions. The narration is an MIT professor explaining the picture; it never reads the description. The build enforces a floor; `site/src/topics/narration-backlog.json` lists the old scripts still to rewrite, which `/narrate` step 1b does before narrating them.
- **"Re-narrate", "the re-narration queue"** → `site/src/topics/renarration.json`: topics whose scripts were rewritten and whose audio the PC must generate; live ones keep their old clips until then. `/narrate` works through it.
- **"Freeze the voice"** → `site/narration/pc/README.md` section 3: a new `voice.json` version and model block, the frozen reference clip committed, every existing clip regenerated.
- **"The briefing look", "the theme", "make it pretty"** → `PROJECT_PLAN.md` (Theme — briefing) and `DESIGN.md` (owner decision 2026-10-20): black and white carry everything, colour is rare and means something (red failure, pale blue second series); Source Serif 4, IBM Plex Sans, JetBrains Mono; every step moves, built from the kit's moves; hook, early prediction, takeaways, recap. The 45 topics live that day keep their scenes (`site/src/topics/briefing-legacy.json`); every new topic is drafted to the new rules, which the build checks.
- **"Parked" / "held"** → a finished topic on `main` with `status: 'held'` in the registry; **"live"** → released, on the site; **"skipped"** → a syllabus topic that gets no reel.
- **"The PC setup"** → `site/narration/pc/README.md` section 1 (Breeze-TTS-2.cpp on Vulkan, Qwen3-TTS on ROCm, the checker, `TTS_PY` and `EVAL_PY`).

## Rules that always apply

- The voice is one signature narrator for the whole site, female, chosen by the owner by listening, frozen in `voice.json`; never mixed, never changed without a version bump and a full regeneration. No cloning of a real, identifiable person: candidates are designed voices.
- Live reels are locked; a change to one carries an `Unlock: <topic-id>` line and the owner's approval. Regenerating narration for a voice change is such a change, approved by the decision to change the voice.
- Never loosen a check to get a clip or a topic through; fix the line or the topic.
- Checks: `node scripts/check-all.mjs --changed` from the repo root (locked, docs, sources, build, narration, reels, links). `main` is never left red.
- The site is a personal, non-commercial project; research-licensed model weights are allowed and the licence is recorded in `voice.json`.
