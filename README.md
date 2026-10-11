# Learning Resources

An expert-level learning site where every topic is a short animated, narrated **reel**, backed by a Deep dive and checked against primary sources.

**Live:** https://yashaggarwal85d.github.io/learning-resources/ (the Reels tab plays every finished topic in course order).

Four tracks, each with a full syllabus:

| Track | Syllabus | Status |
|---|---|---|
| Data Engineering | [syllabus/data-engineering.md](syllabus/data-engineering.md) | in production (hourly routine) |
| Data Structures & Algorithms | [syllabus/data-structures-and-algorithms.md](syllabus/data-structures-and-algorithms.md) | in production (hourly routine) |
| German, A1 to C2 | [syllabus/german-language.md](syllabus/german-language.md) | in production (hourly routine) |
| Rust Systems Engineering | [syllabus/rust-systems-engineering.md](syllabus/rust-systems-engineering.md) | in production (hourly routine) |

## The documents that run the project

| File | What it is |
|---|---|
| [PROJECT_PLAN.md](PROJECT_PLAN.md) | The rules (animate first; one topic at a time; verified, state-of-the-art content; beautiful and memorable; a natural flow; complete coverage, proven), what every topic contains, the Definition of Done, the narration standard and the tech stack. **The plan wins any conflict.** |
| [ROUTINE.md](ROUTINE.md) | The step-by-step procedure the hourly per-domain routines follow to make, check and ship the next topic. |
| [DESIGN.md](DESIGN.md) | The house style for reel steps: canvas, text sizes, colour, motion, and what the looks review checks. |
| [QUALITY.md](QUALITY.md) | Every problem ever found, its fix and the guard that stops it recurring, plus the automatic checks and the "before shipping" list. |
| `syllabus/` | The course order, topic by topic; `syllabus/review-notes/` records syllabus changes and why. |

## Repository layout

```
PROJECT_PLAN.md  ROUTINE.md  QUALITY.md   rules, procedure, quality record
syllabus/                                  the four syllabi (the build reads them)
scripts/check-docs.mjs                     checks links and anchors in the docs
site/src/reels/kit.tsx                     the drawing kit every topic's scenes are built from (colours, canvas, text)
scripts/check-all.mjs                      runs every pre-ship check with a timing summary (ROUTINE.md sections 5 and 8)
scripts/check-links.mjs                    checks every topic's outside links (status and title)
scripts/claim.mjs                          hands each routine run its topic (claims on the `claims` branch, heartbeats)
scripts/affected.mjs                       which reels and links a change can affect (CI and check-all --changed test those)
scripts/run-metrics.mjs                    records a run's tokens (per model), calls and time, per stage
site/                                      the website (Astro + React islands + Tailwind)
  src/topics/registry.ts                   every finished topic: live or held, concept ledger, bridge and handoff
  src/topics/<domain>/m<N>-…/ch<NN>-…/<topic>/
    reel.tsx, scenes.tsx                   the reel: steps and animations (each a pure function of time)
    index.mdx                              the Deep dive
    prerequisites.mdx                      what to know first, with resources
    narration.json                         the spoken script (English lines, {"de": …} German lines, beats)
    coverage.json                          the coverage map (syllabus, sources, blind expert list, gap review)
    examples.py                            every example and number, executed with asserts
    FACT-CHECK.md                          claims checked against primary sources
  src/lib/live.ts, coverage.ts,            build-time checks: flow (Rule #5), coverage (Rule #6),
    topic-checks.ts                        narration alignment, speakable lines, numbers backed by examples.py
  src/reels/                               the reel player, feed, captions, narration hook
  narration/                               voice-over pipeline: voices, setup, generation, checks
  public/audio/<topic id>/                 generated narration clips and their manifest
  tests/                                   reel smoke test (Playwright) and narration check
.github/workflows/                         CI and deploy (GitHub Pages)
```

## Working on it

Requirements: Node 22, Python 3.12+ and, for the smoke test, Chromium (Playwright).

```sh
cd site
npm ci
npm run dev                  # local site at http://localhost:4321/learning-resources/
npm run build                # also runs the flow, coverage, syllabus and topic-file checks
npm run test:examples        # runs every topic's examples.py
npm run test:narration       # narration matches the scripts and the audio standard
npx astro preview --host 127.0.0.1 --port 4321 &
npm run test:reels -- http://127.0.0.1:4321/learning-resources/   # every live reel at desktop and phone size
node ../scripts/check-docs.mjs
npm run check:links          # outside links load and match their titles (also weekly in CI)
```

Every push runs all of these in CI; the deploy to GitHub Pages runs them again and publishes only if they pass.

### Narration

Narration is generated locally with open-source models (no voice vendors, no APIs) and committed as audio; CI only checks it.

```sh
cd site
narration/setup.sh           # once per machine or session: builds every tool outside the repo
narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

- **English narrator:** Orpheus 3B, voice "tara".
- **German voice:** for German lessons, a voice designed from a text description and frozen as `site/narration/voices/german-reference.wav`, cloned for every line with Qwen3-TTS.

Both are frozen in `site/narration/voice.json`. Details are in [site/narration/README.md](site/narration/README.md).

## How a topic is made

Each domain has an hourly routine (an automated session; several runs of one domain can work at once, each on its own topic) that follows [ROUTINE.md](ROUTINE.md).

1. It claims the first topic in syllabus order that no other run is working on, once the topic before it is content-final, so it follows on from what the learner will see.
2. It researches the topic from primary sources; an Opus agent plans and storyboards it, another fact-checks the plan, and a blind expert list starts the coverage map.
3. A builder agent writes the reel, Deep dive, Prerequisites, narration script and executed examples; Opus agents review the content and the looks; every check except narration must pass.
4. The topic is marked content-final (the next topic may start), then narrated, checked once more in full, and shipped to `main`.

A topic goes live only when every topic before it in its domain is live; one finished early is held until then. If a check fails, the routine fixes the cause and never loosens the check.

## Rules that never bend

- No personal information in any web request, ever.
- No cloning of real people's voices, and no voice vendors or APIs.
- Every claim is verified against a primary source; every example and number is executed.
- Nothing is described before it exists.
