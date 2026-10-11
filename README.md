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
| [LEDGER.md](LEDGER.md) | Two lines per routine run and per audit finding: time, tokens per model, checks passed, what went wrong. The data for improving the pipeline. |
| [AUDIT.md](AUDIT.md) | The daily audit: re-checks every reel shipped since the last audit, fixes what is wrong, and records which part of the pipeline let it through. |
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
scripts/sources.mjs                        fetches sources raw and proves every quote in SOURCES.md word for word
scripts/ledger.mjs                         appends entries to LEDGER.md on main (run-metrics.mjs finish and the audit use it)
scripts/audit-scope.mjs                    the topics and runs since the last audit (AUDIT.md)
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

Each domain has an hourly routine (an automated session; up to four runs of one domain and eight in all work at once, each on its own job) that follows [ROUTINE.md](ROUTINE.md). Chapters go in sequence, the topics of a chapter in parallel. A dispatcher session starts runs every hour, one per free job (`node scripts/claim.mjs open` counts them), because a routine session can't start runs itself.

1. Before a chapter is built, one run plans it: a Fable planner writes the chapter's `CHAPTER.md` (each topic's scope, concepts introduced and used, bridge and handoff), an Opus agent reviews it, and it is pushed to `main`. That plan is the contract every topic of the chapter follows, so they can all be built at once and still follow on from each other. The next chapter is planned once every topic of this one is content-final.
2. Each other run claims the first topic of a planned chapter that no run is working on.
3. It researches the topic from primary sources; a Fable agent plans and storyboards it, an Opus agent fact-checks the plan, and a blind Opus expert list starts the coverage map. (What Fable writes, Opus checks; if Fable's weekly limit is reached, its jobs run on Opus.)
4. A builder agent writes the reel, Deep dive, Prerequisites, narration script and executed examples; Fable reviews the content and Opus the looks; every check except narration must pass.
5. The topic is marked content-final (the next chapter may be planned once all its siblings are too), then narrated, checked once more in full, and shipped to `main`.

A topic goes live only when every topic before it in its domain is live; one finished early is held until then. If a check fails, the routine fixes the cause and never loosens the check.

## Rules that never bend

- No personal information in any web request, ever.
- No cloning of real people's voices, and no voice vendors or APIs.
- Every claim is verified against a primary source; every example and number is executed.
- Nothing is described before it exists.
