# Routine — produce the next topic

This is the procedure an automated session follows when a domain's routine fires. There is **one routine per domain**, each told its domain in its prompt and firing **every hour**, the domains at different minutes. A topic takes longer than an hour, so several runs of one domain work at the same time, each on its own topic: a run claims the first topic nobody is working on (section 1), and a topic only starts once the topic before it has a pushed plan, so it can follow on from it. A run makes **one topic**, finished and shipped, to the same standard as a hand-made topic. The rules live in [PROJECT_PLAN.md](PROJECT_PLAN.md) and [QUALITY.md](QUALITY.md); this file is the order of work. If anything here conflicts with the plan, the plan wins.

## 0. Ground rules

- **One domain per run:** only the domain named in the prompt. Never touch another domain's topics.
- **Scope of a run: one topic, the one it claimed.** `scripts/claim.mjs` hands each run its job (section 1): make the next topic, resume one whose run stopped, or release a finished one. Ship it, report, and stop: don't start a second topic in the same run, even with time left (it keeps usage within the plan's limits). Never touch a topic another run has claimed, its branch or its folder. A topic takes about 4–6 hours for a refresher and 8–12 hours for a full topic, including narration.
- **Parallel runs, one at most per topic.** At most five runs of a domain work at once (`CLAIM_MAX_PARALLEL`); a run that finds no free topic stops at once. Keep the claim alive: start `node scripts/claim.mjs keepalive` in the background right after claiming (a heartbeat every 15 minutes while the run works). Before every push, run `node scripts/claim.mjs mine`; if it fails, another run has taken the topic over after this one went quiet: stop at once, push nothing, and say so in the report. A claim without a heartbeat for 90 minutes is free for the next run to resume.
- **Never publish anything half-done.** All work happens on a branch `topic/<topic-id>`. `main` (which deploys the live site) only receives a topic after every check below passes. If the run can't finish (time or usage limit), push the branch, write down where it stopped in `OUTLINE.md` → "Progress" (section 9), and stop; a later run resumes it from there.
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

## 1. Claim the topic

1. **First thing in the run, before reading anything else:** `node scripts/claim.mjs next "<domain>"` (it needs nothing installed and reads the syllabus and registry the way the build does). It walks the syllabus in order, skips live topics and topics another run is working on, and prints the job as JSON:
   - `wait`: nothing to do now (two runs already on this domain, or the topic before the next one has no plan yet). **Stop at once** with a one-line report of the reason. Don't read the plan or the repo.
   - `make`: a new topic. Choose its id (prefixed by domain) and folder (section 3), then `node scripts/claim.mjs set <topic-id> <folder>` and create `topic/<topic-id>` from `origin/main`.
   - `resume`: a topic whose run stopped. Check out its branch (`topic.branch`; if it has none, start the topic as `make`) and start at its first unfinished step: `OUTLINE.md` → "Progress" says where it stopped. A branch without `OUTLINE.md` gets one first, written by the content-plan agent (2.2) from the branch's files and sources.
   - `release`: a held topic whose earlier topics are all live now. Merge `origin/main` into a branch `topic/<topic-id>`, set `status: 'live'`, and check the seam: launch the content review (section 4) on the previous topic's final reel, Deep dive and registry entry against this topic's bridge, Prerequisites and `uses`, and fix what it finds. A topic held longer than 14 days also gets the full release check: refresh facts against current sources, coverage map and gap review. Generate narration if it is missing or stale (section 5), run section 6, and ship. Make nothing new in that run.

   Then start the heartbeat in the background: `node scripts/claim.mjs keepalive`.
2. The JSON also describes the **previous** and **next** topics: their status (`live`, `held`, `in progress`), id, branch and folder. When the previous topic is still in progress or held, its plan on its branch is this topic's starting point: read `OUTLINE.md` there (`git show origin/<branch>:<folder>/OUTLINE.md`), especially its outcomes, concept ledger and handoff. (The `narration` branch belongs to whoever is working on it; don't touch it.)
3. Read before writing anything (read the parts, not whole files you won't use: the plan's named sections by heading, not all of `PROJECT_PLAN.md`; the previous topic's reel, registry entry and Deep dive headings rather than every file in full): the plan's Core Rules (#1–#6), Learning design, Narration and Definition of Done; all of `QUALITY.md`; the previous topic's files (reel, narration, Deep dive, Prerequisites, registry entry; or its `OUTLINE.md` if it isn't on `main` yet) and the next topic's syllabus line, so the bridge and handoff are real.

## 2. Research and verify

1. Run the state-of-the-art scan and pick the primary sources (official docs, papers, source code, specs; the current version of each). Launch one Haiku agent per source (in parallel) to read it and return, with the URL and version: every passage the topic could rely on as **verbatim quotes**, and the source's contents item by item (for the coverage map). Save them together as `SOURCES.md` in the topic folder.
2. **Content plan (Opus agent, effort high).** Launch an Opus agent to plan the topic before anything is written. Give it the syllabus line, `SOURCES.md`, the plan's Core Rules, Learning design, Animation principles, Theme and Narration sections, `QUALITY.md`, the previous topic's reel, Deep dive headings and registry entry (or, if it isn't on `main` yet, its `OUTLINE.md`: this topic must pick up exactly where that plan's handoff leaves off, and use only concepts its ledger introduces or earlier topics did), the shared components in `site/src/reels/`, and the next topic's syllabus line. It may read a source itself where `SOURCES.md` is thin. It writes `OUTLINE.md` in the topic folder: the learning outcomes; the reel's steps in order, each with a **storyboard** (title; the visual idea for this concept and why it makes it click; what is on screen, where it sits on the 600-unit canvas in landscape and portrait, and what moves on which beat; the real values shown; the caption's point; every predict question with its answer and wrong options); the Deep dive headings with what each covers; the examples to execute and what each must assert; the bridge and handoff; the concept ledger (`introduces` / `uses`); and **the claims list**, every factual claim the topic will make with its source. Writing in section 3 follows `OUTLINE.md`; a change of plan during writing is made in `OUTLINE.md` first, with the reason.
3. Launch an adversarial fact-check agent (Opus, effort high) on `OUTLINE.md` against the primary sources themselves, not only `SOURCES.md` (as in `site/src/topics/.../io-cost-model/FACT-CHECK.md`). It re-derives every claim from its source, checks the quotes in `SOURCES.md` are exact, flags anything outdated, renamed or superseded (current version, quoted), and as red team tries to break each explanation and predict question with edge cases and counter-examples. Apply every correction, to `OUTLINE.md` too. It saves its result as the topic's `FACT-CHECK.md`.

   Then commit and push `OUTLINE.md`, `SOURCES.md` and `FACT-CHECK.md` to `topic/<id>`, and run `node scripts/claim.mjs outlined`: from now the next topic may start, built on this plan. **The plan is now a contract with the next topic:** change its outcomes, concept ledger or handoff only when the topic is wrong without the change, and then add a line under `OUTLINE.md` → "Changes after outlined" (what changed and why) and push it, so the next topic's run can follow.
4. **Coverage map** (plan, Rule #6), in the topic folder as `coverage.json` (follow the existing topics' maps; the format is described at the top of `site/src/lib/coverage.ts`):
   - `syllabus`: the topic's syllabus line split into clauses, copied word for word, together covering the whole line.
   - `sources`: the contents of at least two primary sources, item by item (from `SOURCES.md`).
   - `expert`: launch an independent Opus agent (in parallel with the content plan; it needs nothing from it) that has **not** seen your draft (forbid it from reading `site/`) to write a "what an expert must know" list for the syllabus line, each item with a primary source and a placement (here / a named later syllabus topic / out of scope). Copy its items in.
   - Map every item to a reel step title, a Deep dive heading, or another syllabus topic with a quote from its line that shows it covers it. Source and expert items may be marked `out` only with a reason. Anything that belongs here and isn't taught yet is content you must write: add it to `OUTLINE.md`.
5. Anything about real software behaviour is **executed**: code, commands and queries go into the topic's `examples.py` or `examples.sh`, with asserts for every output the reel shows. Run it.

## 3. Write the topic

**Checkpoint:** commit and push `topic/<id>` at the end of sections 2, 3, 4 and 5 (a message like "WIP <id>: research done"), with `OUTLINE.md` → "Progress" saying what is done and what comes next. A run that hits its usage limit then loses nothing and the run that takes over resumes from the last checkpoint. Nothing reaches `main` until section 8.

In `site/src/topics/<domain>/<milestone>/<chapter>/<topic>/`, following `OUTLINE.md` for what to teach and the existing topics as the pattern for how. Folder names: `m<N>-<short-name>/ch<NN>-<short-name>/<topic-slug>` (as in `data-engineering/m1-foundations/ch01-cs-foundations/io-cost-model`). Topic ids are permanent and prefixed by domain: `de.` Data Engineering, `dsa.` Data Structures & Algorithms, `ger.` German, `rust.` Rust.

- `reel.tsx` + `scenes.tsx`: the steps and their animations, every animation a pure function of time, built on the shared components (`site/src/reels/`). Refreshers: about 5 minutes, fast recap, at least one predict question, a recap step. Full topics: the plan's learning-design layers 1–4 and "Prove it" in the reel.
- `index.mdx`: the Deep dive (outcomes, internals, lab, production, frontier, sources with "last verified" and "Expert sign-off: pending").
- `prerequisites.mdx`: what the learner must already know, each item explained briefly with a self-check, plus resources. On-site reels use `<Resource kind="reel" host={props.host} …>`. Every outside link and its title, author and length is verified (YouTube via oEmbed, pages for a 200 and a matching title); unverified metadata is left out.
- `narration.json`: the spoken script, one line per sentence or phrase, written to be heard (see the plan's Narration section); an `answer` clip for every predict step; code and names spelled the way they are said.
- The registry entry in `site/src/topics/registry.ts`: `kind`, `introduces` / `uses` / `declared` (the concept ledger), a real `bridge` from the previous topic and `handoff` to the next, `status: 'live'`, or `'held'` if an earlier topic isn't live yet (normal when the topic before it is still being made by another run; a later run releases it).

## 4. Flow review

Launch one **content review** agent (Opus, effort high) that has not written anything in this topic. Give it the previous topic (its files on `main`, or its branch's latest `OUTLINE.md` and files if it isn't on `main` yet), this topic's files (reel and scenes, narration, Deep dive, Prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`) and the next syllabus topic's line. It reads them in sequence once and reports, in three parts:

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
2. Other runs (this domain's and others') merge into `main` at the same time. So: `git fetch origin && git merge origin/main` into the topic branch, resolve conflicts (in `site/src/topics/registry.ts` keep **both** sides' entries), and re-run section 6 if anything changed.
3. **Continuity with the topic before.** If it is still in progress or held, re-read its branch's `OUTLINE.md` → "Changes after outlined" (or its final files, if it shipped meanwhile) and bring this topic's bridge, Prerequisites and `uses` in line with it. Set `status: 'live'` only if every earlier topic is live on `main`; otherwise `'held'` (the build's flow check enforces this). A held topic is released by a later run, which checks the seam again against the final previous topic.
4. Run `node scripts/claim.mjs mine`, then merge into `main`, push, and confirm both GitHub Actions runs (CI and Deploy) succeed. If the push is rejected because `main` moved, repeat step 2. If a run fails, fix it on the branch and push again; never leave `main` red.
5. Delete the topic branch and run `node scripts/claim.mjs done`.

## 9. Report

End the run with a short report for the owner:

- the domain and chapter, and the topic shipped (or resumed, or released) this run, with its live link, or, if it shipped held, which topic it waits for; how much of the chapter remains;
- what was verified and how (fact-check corrections, executed examples, measured results);
- the run's measured totals from `metrics/runs.jsonl` (tokens, calls, subagents, elapsed time; tokens per model), and the stage that used the most;
- anything that needs a human: the narration to listen to (name two or three clips), and the expert sign-off still pending;
- if the run stopped early: the branch, the step it stopped at, and what remains.
