# Routine — produce the next topic

This is the procedure an automated session follows when a domain's daily routine fires. There is **one routine per domain** (Data Engineering, Data Structures & Algorithms, German; Rust is paused), each firing once a day and told its domain in its prompt. A run makes **one topic** of its domain (the next in syllabus order), finished and shipped, to the same standard as a hand-made topic. The rules live in [PROJECT_PLAN.md](PROJECT_PLAN.md) and [QUALITY.md](QUALITY.md); this file is the order of work. If anything here conflicts with the plan, the plan wins.

## 0. Ground rules

- **One domain per run:** only the domain named in the prompt. Never touch another domain's topics.
- **One topic at a time.** Finish and ship a topic (all of sections 2–8) before starting the next. Never write several topics in parallel or mass-produce.
- **Scope of a run: one topic.** Resume this domain's unfinished topic branch if there is one; otherwise make (or release) the next topic. Ship it, report, and stop: don't start a second topic in the same run, even with time left (it keeps usage within the plan's limits). A topic takes about 4–6 hours for a refresher and 8–12 hours for a full topic, including narration. If the run can't finish (time or usage limit), push the branch; the next run resumes it.
- **Never publish anything half-done.** All work happens on a branch `topic/<topic-id>`. `main` (which deploys the live site) only receives a topic after every check below passes. If the run can't finish, push the branch, write down where it stopped (section 9), and stop. The next run resumes that branch before doing anything else.
- **Measure the run.** At the start of each numbered section below run `node scripts/run-metrics.mjs mark <section name>` (it snapshots tokens and time from the session transcript), and at the very end, after the report is drafted, `node scripts/run-metrics.mjs finish <domain> <topic-id> <shipped|resumed|released|stopped>`, then commit `metrics/runs.jsonl` with the topic (or on the branch if the run stopped). If it says no transcript was found, carry on: never invent numbers. This is how future optimisation gets a real baseline.
- **Models: Opus judges, Sonnet builds, Haiku reads.** The run itself is Sonnet (the routine pins it). Each job goes to the cheapest model that does it at full quality: judgment on what to teach, how it should look and whether it is right goes to Opus; building against an Opus plan, where the checks catch mistakes, stays with the run; reading pages and copying out exact quotes goes to Haiku, whose output Opus re-checks against the sources. Launch agents with the Agent tool's `model` (and `effort` where given; if a model or option isn't available, use the nearest and say so in the report):

  | Job | Who | Why |
  |---|---|---|
  | Pick or resume the topic, state-of-the-art search (which sources) | the run | mechanical; sources are judged in the plan |
  | Read each primary source: verbatim quotes and its contents item by item (2.1) | Haiku agents, one per source | reading is most of the tokens; quotes are checkable and the fact-check re-reads the sources |
  | **Content plan and storyboard** (2.2) | Opus, effort `high` | decides what is taught and how every step looks: the biggest lever on quality |
  | **Fact-check, currency and red team** (2.3) | Opus, effort `high` | correctness the scripts can't check (QUALITY.md #7–9) |
  | **Blind expert list** (2.4) | Opus | what an expert must know; short, no repo reading |
  | Examples, coverage map assembly, writing every file (2.5, 3) | the run | follows `OUTLINE.md`; the build, examples and coverage checks catch slips |
  | **Content review: flow, gaps, expert reader** (4) | Opus, effort `high` | one agent reads the finished topic once for all three |
  | Narration, checks and fixes, merging, shipping, report (5, 6, 8, 9) | the run | scripted, and checked by scripts |
  | **Looks and learning review** of the screenshots (6) | Opus | judges beauty, clarity and pacing at both sizes (Rule #4) |

  Each Opus agent runs **once** per topic. Run it again only for a finding marked *major* that needed a new or redesigned step or section, and then give it only its earlier findings and the changed files. The run checks smaller fixes itself.
- **Keep tokens down.** Brief every agent with file paths, not pasted contents. Agents write long results to a file in the topic folder and return a short summary (findings as a numbered list: where, what, evidence, fix, severity). Read the parts of files you need, never a file you just wrote, and only the tail or failures of long logs. Run long jobs (`setup.sh`, `npm ci`, `narrate.sh`, `check-all.mjs`) in the background and wait for them to finish instead of polling their logs. Look only at the screenshots of steps you changed; the looks review sees the rest.
- **Privacy.** Never put personal information (names, email addresses, account details) in any web request, header or query, yourself or in any agent you launch.
- **No vendors for the voice.** Narration is generated locally with the frozen voices in `site/narration/voice.json` (English narrator and German voice). Never change the voices, their settings or the pipeline.
- **Everything needed is in the repo.** A fresh session has nothing installed: `site/narration/setup.sh` builds the narration tools, `npm ci` the site. If a tool, script or step you need isn't in the repo, that is a bug to fix in the repo (and record in `QUALITY.md`), not something to work around locally.
- **No pull requests.** Merge finished topics into `main` yourself and push.
- **A failing check is this run's job.** If the build or any check fails, find the cause and fix it in this run: missing content gets written, a wrong claim corrected, a broken page repaired. Never skip, loosen or delete a check, never hold a topic back or drop content just to get green, and never merge into `main` while anything is red. If the failure is in `main` itself, caused by another domain's work, fix that minimal cause too (`main` must never stay red) and say so in the report. Only if the fix can't be finished inside the run's budget: push the branch, don't merge, and report exactly what fails and why.
- **Don't guess.** Any claim about how a real system behaves is verified by running it, or against the current primary source. If something can't be verified, leave it out.

## 1. Resume or pick the topic

1. `git fetch origin`. If a `topic/<id>` branch **of this domain** exists that isn't merged into `main`, **resume it** first (start at its first unfinished step). A branch started before `OUTLINE.md` existed has none: have the content-plan agent (2.2) write it from the branch's files and sources first, then carry on from it. Leave other domains' branches alone. (The `narration` branch belongs to whoever is working on it; don't touch it.)
2. Then pick the next topic of this domain.
   - Walk the domain's syllabus (`syllabus/<domain>.md`) in order, refreshers included.
   - The first topic that has no entry in `site/src/topics/registry.ts` is the topic to make.
   - **Held topics:** if a topic already in the registry with `status: 'held'` now has every topic before it live, this run's job is to **release** it instead: check it still passes every step below (refresh facts against current sources, coverage map and gap review, narration, checks), set `status: 'live'`, and ship it. A held topic's narration may never have been generated, or may be stale because its script changed: generate it with `narrate.sh` (section 5) before shipping; `npm run test:narration` must pass once it is live. Make nothing new in that run.
3. Read before writing anything (read the parts, not whole files you won't use: the plan's named sections by heading, not all of `PROJECT_PLAN.md`; the previous topic's reel, registry entry and Deep dive headings rather than every file in full): the plan's Core Rules (#1–#6), Learning design, Narration and Definition of Done; all of `QUALITY.md`; the previous topic's files (reel, narration, Deep dive, Prerequisites, registry entry) and the next topic's syllabus line, so the bridge and handoff are real.

## 2. Research and verify

1. Run the state-of-the-art scan and pick the primary sources (official docs, papers, source code, specs; the current version of each). Launch one Haiku agent per source (in parallel) to read it and return, with the URL and version: every passage the topic could rely on as **verbatim quotes**, and the source's contents item by item (for the coverage map). Save them together as `SOURCES.md` in the topic folder.
2. **Content plan (Opus agent, effort high).** Launch an Opus agent to plan the topic before anything is written. Give it the syllabus line, `SOURCES.md`, the plan's Core Rules, Learning design, Animation principles, Theme and Narration sections, `QUALITY.md`, the previous topic's reel, Deep dive headings and registry entry, the shared components in `site/src/reels/`, and the next topic's syllabus line. It may read a source itself where `SOURCES.md` is thin. It writes `OUTLINE.md` in the topic folder: the learning outcomes; the reel's steps in order, each with a **storyboard** (title; the visual idea for this concept and why it makes it click; what is on screen, where it sits on the 600-unit canvas in landscape and portrait, and what moves on which beat; the real values shown; the caption's point; every predict question with its answer and wrong options); the Deep dive headings with what each covers; the examples to execute and what each must assert; the bridge and handoff; the concept ledger (`introduces` / `uses`); and **the claims list**, every factual claim the topic will make with its source. Writing in section 3 follows `OUTLINE.md`; a change of plan during writing is made in `OUTLINE.md` first, with the reason.
3. Launch an adversarial fact-check agent (Opus, effort high) on `OUTLINE.md` against the primary sources themselves, not only `SOURCES.md` (as in `site/src/topics/.../io-cost-model/FACT-CHECK.md`). It re-derives every claim from its source, checks the quotes in `SOURCES.md` are exact, flags anything outdated, renamed or superseded (current version, quoted), and as red team tries to break each explanation and predict question with edge cases and counter-examples. Apply every correction, to `OUTLINE.md` too. It saves its result as the topic's `FACT-CHECK.md`.
4. **Coverage map** (plan, Rule #6), in the topic folder as `coverage.json` (follow the existing topics' maps; the format is described at the top of `site/src/lib/coverage.ts`):
   - `syllabus`: the topic's syllabus line split into clauses, copied word for word, together covering the whole line.
   - `sources`: the contents of at least two primary sources, item by item (from `SOURCES.md`).
   - `expert`: launch an independent Opus agent (in parallel with the content plan; it needs nothing from it) that has **not** seen your draft (forbid it from reading `site/`) to write a "what an expert must know" list for the syllabus line, each item with a primary source and a placement (here / a named later syllabus topic / out of scope). Copy its items in.
   - Map every item to a reel step title, a Deep dive heading, or another syllabus topic with a quote from its line that shows it covers it. Source and expert items may be marked `out` only with a reason. Anything that belongs here and isn't taught yet is content you must write: add it to `OUTLINE.md`.
5. Anything about real software behaviour is **executed**: code, commands and queries go into the topic's `examples.py` or `examples.sh`, with asserts for every output the reel shows. Run it.

## 3. Write the topic

**Checkpoint:** commit and push `topic/<id>` at the end of sections 2, 3, 4 and 5 (a message like "WIP <id>: research done"). A run that hits its usage limit then loses nothing and the next run resumes from the last checkpoint. Nothing reaches `main` until section 8.

In `site/src/topics/<domain>/<milestone>/<chapter>/<topic>/`, following `OUTLINE.md` for what to teach and the existing topics as the pattern for how. Folder names: `m<N>-<short-name>/ch<NN>-<short-name>/<topic-slug>` (as in `data-engineering/m1-foundations/ch01-cs-foundations/io-cost-model`). Topic ids are permanent and prefixed by domain: `de.` Data Engineering, `dsa.` Data Structures & Algorithms, `ger.` German, `rust.` Rust.

- `reel.tsx` + `scenes.tsx`: the steps and their animations, every animation a pure function of time, built on the shared components (`site/src/reels/`). Refreshers: about 5 minutes, fast recap, at least one predict question, a recap step. Full topics: the plan's learning-design layers 1–4 and "Prove it" in the reel.
- `index.mdx`: the Deep dive (outcomes, internals, lab, production, frontier, sources with "last verified" and "Expert sign-off: pending").
- `prerequisites.mdx`: what the learner must already know, each item explained briefly with a self-check, plus resources. On-site reels use `<Resource kind="reel" host={props.host} …>`. Every outside link and its title, author and length is verified (YouTube via oEmbed, pages for a 200 and a matching title); unverified metadata is left out.
- `narration.json`: the spoken script, one line per sentence or phrase, written to be heard (see the plan's Narration section); an `answer` clip for every predict step; code and names spelled the way they are said.
- The registry entry in `site/src/topics/registry.ts`: `kind`, `introduces` / `uses` / `declared` (the concept ledger), a real `bridge` from the previous topic and `handoff` to the next, `status: 'live'` (or `'held'` if an earlier topic isn't live yet, which should not happen when following step 1).

## 4. Flow review

Launch one **content review** agent (Opus, effort high) that has not written anything in this topic. Give it the previous topic, this topic's files (reel and scenes, narration, Deep dive, Prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`) and the next syllabus topic's line. It reads them in sequence once and reports, in three parts:

- **Flow:** anything abrupt, anything used before it is taught, any prerequisite that sits later in the syllabus.
- **Gap hunt:** everything missing, too thin, or wrongly marked as covered elsewhere, against the syllabus line, the sources and the expert list.
- **Expert reader:** anything imprecise, hand-wavy, or not at the depth the plan's Learning design asks for, as a sceptical senior engineer (or, for German, a sceptical teacher and native speaker) would judge it.

Fix everything it finds. A prerequisite later in the syllabus is a syllabus bug: reorder and log it in `syllabus/review-notes/`. Fill every real gap (or record why an item is out of scope), then record the review in `coverage.json` → `gapReview` (date, who, `open: []`). The build's flow and coverage checks must pass.

## 5. Narration

**First, on a fresh session:** run `site/narration/setup.sh` once (it builds everything narration needs outside the repo: the English narrator, the checker and the German voice; re-running it skips what's done). Then from `site/`:

```sh
narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

**German domain:** the explanation is narrated in English by the narrator; every German word or sentence is a `{"de": "…"}` line in `narration.json`, spoken by the frozen German voice (`voice.json` → `german`). Write German lines exactly as they should be heard (no abbreviations; numbers as words where the lesson is about the words). Never change the German voice, its reference clip or its settings.

`narrate.sh` restores the take cache from the `narration-cache` branch when it starts and saves it when it stops, so takes survive a fresh session or an interrupted run; nothing to do by hand.

Expect about 40–70 seconds per take on 4 CPU cores (a refresher is about 2 hours). If a line never passes the transcript check, rewrite the line (simpler words, spelled-out names), not the check.

## 6. Checks (all must pass)

From the repo root, one command runs everything below (cheapest first, a timing summary at the end, starts and stops `astro preview` itself):

```sh
node scripts/check-all.mjs                 # docs, examples, build, narration, reels, links
node scripts/check-all.mjs --only reels    # re-run just what a fix could affect (docs, examples, build, narration, reels, links)
```

It runs the same commands as CI, so nothing is weaker: `npm run build` (includes the flow, coverage, syllabus and topic-file checks), `npm run test:examples`, `npm run test:narration`, `npm run test:reels`, `npm run check:links`, `node scripts/check-docs.mjs`. While fixing, re-run only the affected checks (`--only`); the full run, all green, is required once before shipping and again after any later change. The reel test takes about two minutes per live reel, so don't run it after every small edit.

Then the **looks and learning review**: once the reels test is green, launch an Opus agent on this topic's screenshots in `site/test-results/` (every step, desktop and phone), with `OUTLINE.md`, `narration.json`, the plan's Rule #4, Animation principles and Theme sections, and `QUALITY.md` rows 16–21 and 36. It judges each step as a demanding designer and teacher would: nothing clipped, overlapping, too small or hidden behind the controls; the visual idea clear at a glance and matching its storyboard; hierarchy, spacing, colour and contrast; captions and narration that say what the picture shows, at a good pace. Fix every finding, then look at the changed steps' new screenshots yourself.

**If anything fails, fix it and re-run everything, until all of it is clean** (see "A failing check is this run's job" in section 0). A coverage failure means content is missing: write it (a new reel step means new narration for that step too), or point to the topic whose syllabus line truly covers it. Never weaken the map to make it pass.

## 7. Quality record

Go through `QUALITY.md` → "Before shipping any topic". If this run hit any new kind of problem, add a row with its fix and a guard (an automatic check where possible).

## 8. Ship (then report and stop)

1. Commit on `topic/<topic-id>` with a clear message and the trailers used in this repo's history.
2. Other domains' routines run at the same time and also merge into `main`. So: `git fetch origin && git merge origin/main` into the topic branch, resolve conflicts (in `site/src/topics/registry.ts` keep **both** sides' entries), and re-run section 6 if anything changed.
3. Merge into `main`, push, and confirm both GitHub Actions runs (CI and Deploy) succeed. If the push is rejected because `main` moved, repeat step 2. If a run fails, fix it on the branch and push again; never leave `main` red.
4. Delete the topic branch.

## 9. Report

End the run with a short report for the owner:

- the domain and chapter, and the topic shipped (or resumed, or released) this run, with its live link; how much of the chapter remains;
- what was verified and how (fact-check corrections, executed examples, measured results);
- the run's measured totals from `metrics/runs.jsonl` (tokens, calls, subagents, elapsed time; tokens per model), and the stage that used the most;
- anything that needs a human: the narration to listen to (name two or three clips), and the expert sign-off still pending;
- if the run stopped early: the branch, the step it stopped at, and what remains.
