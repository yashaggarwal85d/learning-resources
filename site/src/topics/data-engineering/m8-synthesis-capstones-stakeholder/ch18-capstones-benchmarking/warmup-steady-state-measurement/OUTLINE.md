# Outline — de.warmup-steady-state-measurement

## Outcomes (from CHAPTER.md)

Run the shop's order-lookup query from a cold Postgres start and show the first requests are
measurably slower than the rest; build and apply a steady-state detector that marks where the run
stops improving; run repeated trials and report a confidence interval, not a single number; report
a cold-cache and a hot-cache result for the same query as two separate, honestly labeled numbers
instead of one blended average.

## 9-step storyboard (full, ~15 min, opens the chapter)

1. **Hook.** Two engineers benchmark the same query on the same database and report numbers twice
   as far apart as the actual difference between a good day and a bad one — one started measuring
   the instant the service started, the other waited five minutes first.
2. **Predict: whose number is closer to a real, long-running deployment, and what changed in those
   five minutes.** (Correct: the one who waited is closer, because an empty buffer pool and an
   empty result cache were still absorbing most of the first engineer's "slow" requests.)
3. **Reveal: why the first minutes lie — the warm-up causes.** Five named causes (JIT/code-gen,
   cold page cache and buffer pool, empty result caches, LSM compaction debt, table-format
   small files), with the two this sandbox's own Postgres actually exhibits named directly. No
   takeaway (reel test's reference step).
4. **Reveal: cold page cache and buffer pool, reproduced.** The shop's order-lookup query run from
   a cold Postgres start, latency measurably higher for the first several requests. Takeaway.
5. **Reveal: detecting steady state.** A sliding-window detector marking the point where the recent
   mean stops moving by more than a stated threshold; the run length needed after that point.
   Takeaway.
6. **Reveal: repeated trials and confidence intervals.** The same steady-state run repeated several
   times, reported as an interval instead of a single number, so a reader can judge whether two
   systems' numbers actually differ. Takeaway.
7. **Reveal: cold-cache and hot-cache as two honest numbers.** The same query's cold-start number
   and its steady-state number, reported side by side instead of averaged into one blended figure.
   Takeaway.
8. **Recap.**
9. **Prove it.** A vendor reports a single benchmark number with no mention of warm-up or trial
   count. What two questions would you ask before trusting it, and what would make you suspicious
   even if the number itself were accurate? (Correct: ask whether the result discarded a warm-up
   period and whether it was repeated with a reported interval; a single run with no warm-up
   discard is very likely still measuring the system's startup transient, not its steady state,
   even if the reported number itself was not fabricated.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (the five warm-up causes, by name, and which two this sandbox's Postgres
exhibits); Lab (the steady-state detector and the repeated-trial harness, run for real against
this sandbox's Postgres); Production (the two-engineers hook, resolved); Frontier (cold-cache vs.
hot-cache reporting as a deliberate choice, not an omission); Where this goes next (summarizing a
steady-state run honestly: percentiles instead of means, and histograms merged instead of
averaged).

## Bridge / handoff

Bridge (quotes Chapter 17's own closing handoff verbatim, per CHAPTER.md's "Assumption about the
previous chapter"): "That closes this chapter's look at where the data stack is heading. Everything
in it, from a point-in-time join to a managed zero-ETL feed, is a claim someone has to be able to
test, not just trust. The next chapter is the method for testing claims like that honestly: how to
benchmark a system so the number you report is the number that's actually true, starting with the
first way a benchmark lies — the warm-up period you forgot to discard."

Handoff: "A warmed-up, steady-state run still has to be summarized into one number someone reads,
and the easiest way to summarize it is also the most dishonest: a mean. The next topic is why that
single number hides exactly the tail that matters, and what to report instead."

## Concept ledger

Introduces: `warmup-causes-taxonomy`, `steady-state-detection`, `repeated-trials-confidence-interval`,
`cold-vs-hot-cache-reporting`.
Uses: none from an already-live chapter (Chapter 17's own concepts are named in prose only, since
Chapter 17 is not live).
Declared: basic familiarity with a database connection pool and a page/buffer cache. Builds on
Chapter 6's table-format small-files material (not yet live) and Chapter 17's own benchmarking-
adjacent numbers (not yet live) in prose only.

## Claims list (for FACT-CHECK.md)

1. PostgreSQL's own documentation: because PostgreSQL also relies on the operating system cache,
   it is unlikely that an allocation of more than 40% of RAM to shared_buffers will work better
   than a smaller amount — i.e., Postgres's own buffer pool and the OS page cache are two distinct,
   stacked caches, both of which start empty on a cold process/OS start.
2. RocksDB's own documentation: compactions are needed for space efficiency, read (query)
   efficiency and timely data deletion; when a memtable is full its contents are written to a file
   in Level-0, and compaction periodically reads and merges files, often into the next LSM level —
   named here only as a warm-up cause (accumulated compaction debt) in a storage engine this
   sandbox does not run.
3. (This course) a steady-state detector: a sliding window of recent latency samples whose mean is
   compared between consecutive windows; the run is in steady state once the change between
   windows stays below a stated threshold for a stated number of consecutive windows.
4. (This course) repeated trials of the same steady-state run, reported as a confidence interval
   around the mean (or median) rather than a single point value.
5. (This course) a cold-cache number (the first N requests after a cold start) and a hot-cache
   number (the steady-state window after the detector fires) reported as two separate, labeled
   results for the same query, never blended into one average.
6. (This course) the five warm-up causes named by the syllabus (JIT/code-gen, cold page cache and
   buffer pool, empty result caches, LSM compaction debt, table-format small files), of which only
   the second (page cache/buffer pool) and third (an empty result-cache analog) are reproduced
   directly on this sandbox's own Postgres; the other three are named from their own sources as the
   same failure in systems the build machine does not run.
