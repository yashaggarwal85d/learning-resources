# Review: de.task-retry-fetch-failure-speculation

## Content review

`--only build` passed clean on the first run: `coverage.json`'s 10 expert items, `clause`,
and every `deep`/`step` string were copied verbatim from `post-notes.md` headings and
`reel.tsx` step titles before the first run, consistent with the practice established on
topics 19-20.

Two claims are genuinely measured against a real local PySpark 4.0.1 session. The first —
task retry up to a configured failure limit — required discovering that `spark.task.maxFailures`
as an ordinary config has no effect in local mode; local mode reads the identical scheduler
value through the master URL's own `local[K,F]` syntax instead. This was caught by a probe
that set the config alone and still failed at the default limit, then confirmed by switching
to `local[2,4]` (succeeds) vs. `local[2,2]` (aborts with the literal "failed 2 times" message
from `TaskSetManager.scala`). The second — a fetch failure resubmitting the parent shuffle-map
stage — used a background watcher thread that deletes a real shuffle data file exactly once
after a `groupByKey` job starts, confirmed through the Spark UI's own REST API: the map stage
shows two distinct `attemptId` values and the reduce stage fails then completes on a later
attempt. Neither claim is simulated or inferred; both are read back from the scheduler's own
bookkeeping.

The third mechanism in the syllabus clause, speculative execution, could not be triggered live
in this sandbox despite roughly 6-8 genuinely varied attempts (core counts, partition counts,
every speculation-related config down to aggressive quantile/multiplier values). Rather than
fabricate a result or silently drop the claim, it's documented as sourced-only with an exact,
verified quote for the mechanism (`spark.speculation`'s own definition), following the same
pattern this chapter already used for topics 17 and 20's own cluster-scale-only behaviors.
`FACT-CHECK.md`'s Abandoned approaches section gives the full account, including the most
likely explanation (`spark.speculation.task.duration.threshold`'s small-stage special case)
left unconfirmed rather than chased indefinitely.

Executor loss and graceful decommissioning (the other sourced half of the syllabus clause) are
named and quoted but not measured, since local mode has no separate executor process to kill —
consistent with how this chapter has treated every cluster-only behavior so far.

All three sources checked out word for word via `sources.mjs check` (18 quotes, 0 problems).
The one source-naming mismatch (CHAPTER.md's "Tuning Spark docs" for speculation config, which
actually lives on the Configuration page) is substituted and noted explicitly in `SOURCES.md`,
matching the established convention from topics 16-18.

## Looks review

`reel.tsx` has 10 steps with predicts at indices 2 and 5 (both ≤ an early-enough index, neither
on the reel test's "from" step nor immediately after a predict) and 3 takeaways, all trimmed to
≤20 words after multiple rounds — all three takeaways ran long on the first draft (24, 22, and
21 words) and needed trimming, more than any prior topic in this chapter. `scenes.tsx` follows
the same `Row` kit pattern as every other topic in this chapter, with 1-3 word label/value pairs
throughout. The Playwright reel smoke test passed at both desktop and phone sizes.
