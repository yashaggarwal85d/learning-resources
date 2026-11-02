# Content and looks review — `de.jobs-cronjobs-batch-pipelines`

## Content review

- Two sources originally fetched for this topic turned out to be from the same Jobs concept page as several already-planned quotes: the three "first rule of the Pod failure policy..." sentences were drafted under a separate "Handling retriable and non-retriable pod failures" task-page heading in SOURCES.md by mistake (they're actually from the Jobs page's own worked example, not that task page). Caught by `node scripts/sources.mjs check` reporting them "not found word for word" under the wrong heading; moved to the correct source heading and reverified — all 30 quotes now pass.
- Two coverage.json clauses initially paraphrased CHAPTER.md's own elaboration instead of copying the syllabus line verbatim (e.g. "Indexed Jobs: a Job with a fixed completion count in which each pod receives an index" instead of the syllabus's bare "Indexed Jobs"). The build's coverage check requires every `clause` to be a literal substring of the syllabus bullet in `syllabus/data-engineering.md`; rewrote all 7 clauses as exact substrings (backticks around `concurrencyPolicy`/`startingDeadlineSeconds` are stripped by the syllabus parser before matching, so the clause text omits them too) and re-mapped the richer explanatory detail into FACT-CHECK.md and post-notes.md's Deep dive instead.
- The outline keeps `backoffLimitPerIndex` (retries within one index) and `maxFailedIndexes` (how many indexes may fail before the whole Job is cut short) as two separate steps on purpose — they're easy to conflate, and FACT-CHECK.md's red-team notes call this out explicitly.
- Step 8's predict deliberately does not claim Kubernetes exempts disruption-caused failures automatically: only a pod failure policy that explicitly names `DisruptionTarget` with action `Ignore` does that; the reel and narration both state the condition rather than a blanket exemption.
- All apostrophe-bearing titles/takeaways use double quotes, never an escaped single-quoted string, per the recurring gotcha from earlier topics in this chapter. Step 3 ("No external queue") is deliberately takeaway-free — it's the test's "from" step.
- `prerequisites.mdx` initially linked `de.linux-shell-process-toolkit` by its registry `title` ("Linux shell and processes") rather than its `syllabusTitle` ("Linux shell and process toolkit"); the `Resource` component resolves a reel link by syllabus title and throws at build time if they don't match exactly — fixed.

## Looks review (Playwright reel test)

- Step 11 (`ConcurrencyPolicies`): the original layout put three 140-wide boxes side by side at a fixed horizontal offset, the same class of bug fixed in topics 2–4's side-by-side scenes. "runs alongside the old one" ran into "skips the new run" on phone. Rewritten as three full-width (400px) stacked rows plus a taller canvas (340 → 380).
- Step 14 (`Recap`): a single long caption line ("Jobs that end; a CronJob that starts them; Chapter 11 for everything past that") ran outside the drawing on phone. Split into two shorter stacked lines and gave the canvas more height (300 → 320).

Verified via `node scripts/check-all.mjs --only reels,docs,sources --topic jobs-cronjobs-batch-pipelines`: reel smoke test passes at desktop and phone; docs and sources pass. The same run's `test:editor` failure ("a save did not open a new GitHub issue") is the same pre-existing, unrelated failure documented for topics 1-4 (hardcoded against `de.b-trees-vs-lsm`, independent of any file in this topic).

## Build

`npm run build` passes with this topic held. One digit-check failure along the way: the file-header comment in `reel.tsx` spelled out "1.33" as a literal version number, which the build's number check reads the same as a number shown on screen — fixed by rewording the comment to point at SOURCES.md instead of restating the version number.

## Sandbox disclosure

No local Kubernetes cluster exists on this build machine (no `kubectl`, no `kind`/`k3s`), so the Job and CronJob controllers' live behaviour — per-index backoff, pod failure policy, success policy, concurrency policy, and the missed-schedule rule — is sourced from Kubernetes' own documentation, never demonstrated against a running API server. What is run for real in `examples.py`: a per-index backoff/failure model (reproducing the hook's own poison-partition scenario), the pod-failure-policy rule evaluator, the success-policy evaluator, the CronJob concurrency-policy resolver, and the missed-schedule counter — including both of the CronJob doc's own worked examples (a controller outage with no deadline, and the same outage with a 200-second deadline). This topic hosts no lab of its own, per CHAPTER.md's lab table.
