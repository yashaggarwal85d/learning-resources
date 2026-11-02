# REVIEW: de.executor-memory-model

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds on this chapter's own task-hierarchy vocabulary (chapter 7.1), used but not
   re-taught; introduces `spark.unified-memory-manager` and `spark.oom-vs-oomkill`, used by
   nothing earlier. Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines executor, driver, task, cache/persist, and shuffle — all assumed,
   none taught by the reel itself. Severity: none found.
3. **Gap hunt.** The one syllabus clause names several sub-parts: the unified manager's
   borrowing/eviction, `memory.fraction`/`storageFraction`, user memory, reserved memory,
   off-heap, `memoryOverhead`, and the JVM-OOM-vs-container-kill contrast. The borrowing/
   eviction and OOM-vs-kill halves are measured directly; user memory, reserved memory, and
   off-heap are disclosed as sourced-only, not silently assumed covered. Severity: none found.
4. **Expert reader.** User memory's own non-accounting, the 300MB reserved-memory rationale,
   off-heap's separate sizing path, `memoryOverhead`'s two-regime default formula, Python
   workers' separate-process accounting, Netty's own off-heap allocation, which component
   performs a YARN/Kubernetes kill, the fix-for-one-worsens-the-other interaction, spill as the
   next escalation step, and serialized-vs-deserialized cache sizing could all read as
   omissions if left unstated; fixed by naming each directly in `coverage.json`'s expert list
   (10 items). Severity: addressed during drafting.
5. **Engagement.** Hook poses a concrete collision (cached data and a new task's own needs,
   same pool); two predicts (full topic requires ≥2), the first at step index 2 (within the
   first four, required); each predict's wrong answer is a real, tempting intuition ("a
   cache keeps at least some space once established," "either way the app sees a thrown
   error it can catch"), not a strawman; three takeaways plus the recap's own restatement of
   both the pool/floor model and the OOM-vs-kill contrast.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text
   before running any check, paraphrasing each step as the professor's own framing and
   avoiding every raw number and code identifier (e.g. "a single shared pot" for the unified
   pool, "a plain error thrown from inside a running process" for a JVM OOM) to satisfy the
   narration "speakable" check. Grepped `syllabus/data-engineering.md` directly for the exact
   clause wording — including a since-corrected missed "and" before `memoryOverhead` — before
   the first build-check run.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as the chapter's earlier topics, with every `Row` label/value
pair kept to 1–3 words each side from the first draft, after topic 14's own Playwright failures
from longer pairs. `node scripts/check-all.mjs --topic executor-memory-model --only build`
failed once, on two mismatches at the same time: the `coverage.json` clause string was missing
the word "and" that the real syllabus line has before `memoryOverhead` (a since-corrected
typo from copying by hand rather than re-grepping), and two of the `coverage.json` step
pointers used a slightly different dash/wording than the literal `reel.tsx` step titles
("no --" vs. no prefix at all, and a hyphen instead of an em dash). Fixed by re-grepping the
syllabus line directly and by copying each step title verbatim from `reel.tsx`, then
re-running clean.

`PREVIEW_HELD=1 npx astro build` + `astro preview` (reused across topics without a restart,
confirmed serving the rebuilt `dist/` via a plain HTTP 200 check) + `tests/reels.mjs`, logged
straight to a file rather than piped through another command (per the lesson from topic 16's
own background-task time-limit kill): passed clean on the first real attempt — `Reel smoke
test passed: 1 live reel(s) at desktop and phone sizes.` — with no text-overlap or swipe
failures, attributed to planning short `Row` pairs and the step shape into `OUTLINE.md` from
the start rather than discovering either after a failure.
`npm run test:editor`, bundled unconditionally into the same `reels` check category, fails in
this cloud sandbox on a clean, untouched `main` too (confirmed independently by prior topics in
this chapter) — a known environment limitation, not caused by this topic.
