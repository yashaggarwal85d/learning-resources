# Routine — produce the next topic

This is the procedure an automated session follows every time the "next topic" routine fires (every 12 hours). It produces **exactly one topic**, start to finish, to the same standard as a hand-made one. The rules live in [PROJECT_PLAN.md](PROJECT_PLAN.md) and [QUALITY.md](QUALITY.md); this file is the order of work. If anything here conflicts with the plan, the plan wins.

## 0. Ground rules

- **One topic per run.** Never start a second topic in the same run. Never mass-produce.
- **Never publish anything half-done.** All work happens on a branch `topic/<topic-id>`. `main` (which deploys the live site) only receives a topic after every check below passes. If the run can't finish, push the branch, write down where it stopped (section 9), and stop. The next run resumes that branch before doing anything else.
- **Privacy.** Never put personal information (names, email addresses, account details) in any web request, header or query, yourself or in any agent you launch.
- **No vendors for the voice.** Narration is generated locally with the frozen voice in `site/narration/voice.json`. Never change the voice, its settings or the pipeline.
- **No pull requests.** Merge finished topics into `main` yourself and push.
- **Don't guess.** Any claim about how a real system behaves is verified by running it, or against the current primary source. If something can't be verified, leave it out.

## 1. Resume or pick the topic

1. `git fetch origin`. If a `topic/*` or `narration` branch exists that isn't merged into `main`, **resume it** (start at the first unfinished step below) and do not pick a new topic.
2. Otherwise pick the topic. Domain order: **Data Engineering** (until the owner says to start another domain).
   - Walk the domain's syllabus (`syllabus/data-engineering.md`) in order, refreshers included.
   - The first topic that has no entry in `site/src/topics/registry.ts` is the topic to make.
   - **Held topics:** if a topic already in the registry with `status: 'held'` now has every topic before it live, this run's job is to **release** it instead: check it still passes every step below (refresh facts, narration, checks), set `status: 'live'`, and ship it. Make nothing new in that run.
3. Read before writing anything: the plan's Core Rules (#1–#5), Learning design, Narration and Definition of Done; all of `QUALITY.md`; the previous topic's files (reel, narration, Deep dive, Prerequisites, registry entry) and the next topic's syllabus line, so the bridge and handoff are real.

## 2. Research and verify

1. Run the state-of-the-art scan and gather from primary sources (official docs, papers, source code, specs). Write every claim the topic will make into a claims list.
2. Launch an adversarial fact-check agent on that list against primary sources (as in `site/src/topics/.../io-cost-model/FACT-CHECK.md`). Apply every correction. Save the result as the topic's `FACT-CHECK.md`.
3. Anything about real software behaviour is **executed**: code, commands and queries go into the topic's `examples.py` or `examples.sh`, with asserts for every output the reel shows. Run it.

## 3. Write the topic

In `site/src/topics/<domain>/<milestone>/<chapter>/<topic>/`, following the existing topics as the pattern:

- `reel.tsx` + `scenes.tsx`: the steps and their animations, every animation a pure function of time, built on the shared components (`site/src/reels/`). Refreshers: about 5 minutes, fast recap, at least one predict question, a recap step. Full topics: the plan's learning-design layers 1–4 and "Prove it" in the reel.
- `index.mdx`: the Deep dive (outcomes, internals, lab, production, frontier, sources with "last verified" and "Expert sign-off: pending").
- `prerequisites.mdx`: what the learner must already know, each item explained briefly with a self-check, plus resources. On-site reels use `<Resource kind="reel" host={props.host} …>`. Every outside link and its title, author and length is verified (YouTube via oEmbed, pages for a 200 and a matching title); unverified metadata is left out.
- `narration.json`: the spoken script, one line per sentence or phrase, written to be heard (see the plan's Narration section); an `answer` clip for every predict step; code and names spelled the way they are said.
- The registry entry in `site/src/topics/registry.ts`: `kind`, `introduces` / `uses` / `declared` (the concept ledger), a real `bridge` from the previous topic and `handoff` to the next, `status: 'live'` (or `'held'` if an earlier topic isn't live yet, which should not happen when following step 1).

## 4. Flow review

Read the previous topic, this one and the next syllabus topic in sequence. Fix anything abrupt, anything used before it is taught, or any prerequisite that sits later in the syllabus (that is a syllabus bug: reorder and log it in `syllabus/review-notes/`). The build's flow check must pass.

## 5. Narration

Set up the two environments if missing (see `site/narration/README.md`), then from `site/`:

```sh
narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

Expect about 40–70 seconds per take on 4 CPU cores (a refresher is about 2 hours). If a line never passes the transcript check, rewrite the line (simpler words, spelled-out names), not the check.

## 6. Checks (all must pass)

From `site/`:

```sh
npm run build              # includes the flow check and syllabus checks
npm run test:examples
npm run test:narration
npm run test:reels -- http://127.0.0.1:4321/learning-resources/   # with `npx astro preview` running
node ../scripts/check-docs.mjs
```

Then look at the screenshots in `site/test-results/` for every step at desktop and phone size: nothing clipped, overlapping, too small, or hidden behind the controls. Fix and re-run until clean.

## 7. Quality record

Go through `QUALITY.md` → "Before shipping any topic". If this run hit any new kind of problem, add a row with its fix and a guard (an automatic check where possible).

## 8. Ship

1. Commit on `topic/<topic-id>` with a clear message and the trailers used in this repo's history.
2. Merge into `main` (fast-forward or a merge commit), push, and confirm both GitHub Actions runs (CI and Deploy) succeed. If one fails, fix it on the branch and push again; never leave `main` red.
3. Delete the topic branch.

## 9. Report

End the run with a short report for the owner:

- the topic shipped (or resumed, or released), with its live link;
- what was verified and how (fact-check corrections, executed examples, measured results);
- anything that needs a human: the narration to listen to (name two or three clips), and the expert sign-off still pending;
- if the run stopped early: the branch, the step it stopped at, and what remains.
