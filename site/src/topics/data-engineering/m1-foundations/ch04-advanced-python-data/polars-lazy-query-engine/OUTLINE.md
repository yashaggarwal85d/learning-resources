# Outline — de.polars-lazy-query-engine

## Learning outcomes

1. Write the same transformation eager and lazy, and show that a LazyFrame genuinely defers
   execution until `.collect()`.
2. Read predicate pushdown and common-subexpression elimination directly out of a real
   LazyFrame's `explain()` output, non-optimized vs. optimized.
3. State the streaming engine's no-implicit-row-order rule, demonstrate it by actually
   repeating the same join many times, and name `maintain_order` as the opt-in fix.
4. Describe out-of-core execution and the cuDF-backed GPU engine, the latter honestly as
   sourced-only (no GPU on this sandbox), and state exactly where the team's own words draw the
   line between what already works and what's still in flight.

## Reel steps (storyboard)

1. **Hook: does writing it lazily actually change what runs?**
   - `fig`: "pandas adopted the buffers — does Polars' own 'lazy' label change what actually
     runs, or just how the code is spelled?"
   - Visual: two rows, "spelled lazily" / "claimed" vs. "runs differently?" / "not yet checked",
     opacity-staged, echoing topic 31's hook structure exactly (same move, same skepticism).
   - Narrator's line: names the real open question rather than restating body text — "a label
     is cheap; does the engine underneath actually behave differently because of it?"

2. **Reveal: the same transformation, eager and lazy**
   - `fig`: "the same filter and select, written eager and lazy — identical result, one of them
     deferred"
   - Visual: two rows — "eager call chain" / "runs each step now", "lazy scan + collect" /
     "runs once, at the end" — with a third row confirming "same rows out" once both are run.
   - Takeaway candidate: not yet (held for step 3).
   - Narrator's line: a LazyFrame isn't a different answer, it's the same answer on a
     different schedule — and that schedule is what lets everything after this step happen.

3. **Reveal: predicate and projection pushdown, read from a real query plan**
   - `fig`: "the plan as written vs. the plan Polars actually runs — read directly from
     explain()"
   - Visual: two stacked boxes, "as written: scan all, then filter" vs. "as run: filter folded
     into the scan, fewer columns read" with `C.focus` on "folded into the scan".
   - Takeaway: "A lazy plan isn't optimized because Polars promises it is — it's optimized
     because explain() shows the filter and the column list moved into the scan itself."
   - Narrator's line: don't take the optimizer's word for it — read its own plan before and
     after and show the filter actually moved.

4. **Reveal: common subexpression elimination**
   - `fig`: "the same expression, used twice — computed once or twice?"
   - Visual: "written twice" / "once in each output column" vs. "run" / "once, then reused" —
     `C.focus` on "once, then reused".
   - Narrator's line: a second use of the identical expression doesn't cost a second
     computation — the optimizer notices the repeat and caches it, visible in the plan as one
     shared node two later steps both point back to.

5. **Predict: does `collect()` with no arguments preserve the original row order?** (within
   first four steps ✓)
   - `fig`: "no engine named, no ordering asked for — does the row order survive anyway?"
   - Options: "Yes — nothing asked Polars to reorder anything, so it keeps the order it got" /
     "No — the engine that runs by default doesn't promise to keep it" (correct).
   - Explain: the default engine as of Polars 2.0 is the streaming engine, and the streaming
     engine's own contract explicitly doesn't guarantee row order for certain operations.

6. **Reveal: no implicit row order, measured across repeated runs**
   - `fig`: "the exact same join, run thirty times — how many different row orders come back?"
   - Visual: "default engine, repeated" / "several different orders" (`C.focus`) vs.
     "maintain_order=left, repeated" / "always the same order".
   - Takeaway: "collect() with no arguments isn't unordered by accident — it's unordered because
     nothing asked it to stay ordered, and asking costs one keyword argument."
   - Narrator's line: this isn't a one-off flaky result — the exact same code, run again and
     again, keeps landing on a different answer, which is exactly what "no guarantee" means in
     practice, not just in a changelog's wording.

7. **Reveal: the streaming engine lowers peak memory, short of full out-of-core**
   - `fig`: "the same projection, read whole and read in batches — measured peak memory, not
     claimed"
   - Visual: "full eager read" / "higher peak memory" vs. "streaming scan, same columns" /
     "lower peak memory" (`C.focus`), then a third row: "every operation spilling to disk?" /
     "not yet, by the team's own account".
   - Takeaway: "The streaming engine already uses less memory for a real workload today — but
     the team that builds it says full out-of-core support is still being built, not finished."
   - Narrator's line: this is the honest-gap step — measure what's real today (a genuinely
     lower peak), then say plainly what the people who ship this engine themselves say isn't
     done yet, so "out-of-core" isn't oversold past what even its own maintainers claim.

8. **Reveal: the cuDF-backed GPU engine** (sourced-only; no GPU on this sandbox)
   - `fig`: "the same query plan, dispatched to an NVIDIA GPU instead — sourced, not run here"
   - Visual: "no GPU on this sandbox" / "can't run this directly" vs. "documented claim" /
     "falls back to CPU, never fails" — `C.focus` on "falls back... never fails".
   - Narrator's line: everything in this step is a direct quote from Polars' own documentation,
     named as such — this reel runs nothing on a GPU, because there isn't one here.

9. **Recap**
   - Pulls all reveals into one line each: deferred execution, pushdown, subexpression
     elimination, no implicit row order, measured lower streaming memory short of full
     out-of-core, the cuDF GPU engine as sourced-only.

10. **Prove it**
    - A production scenario: a team's nightly job joins two Polars LazyFrames and writes the
      result to a report that's read by row position, with no `maintain_order`. What breaks,
      and what's the one-line fix?
    - Correct option: the report's row-to-meaning mapping silently drifts between runs since
      row order was never guaranteed; fix by adding `maintain_order` to the join (or sorting the
      result explicitly before writing it).

## Engagement arc

- Hook (step 1): a real open question left by topic 31 (pandas adopted the buffers; does this
  library's "lazy" claim actually change behavior).
- Predict within first four steps: step 5.
- Surprising number: step 6's "six different row orders across thirty runs of the exact same
  code" and step 7's measured peak-memory gap.
- Takeaways: steps 3, 6, 7 (three, minimum met).
- Recap: step 9. Prove it: step 10, a genuine synthesis task (identify the silent production
  failure, not a restatement of any single reveal).

## Post-notes headings (Deep dive)

- **Outcomes** — restated from above.
- **Internals** — how pushdown and CSE are actually implemented (an IR the optimizer rewrites
  before any physical execution plan is built), and what "fixed point" means for expression
  simplification/type coercion.
- **Lab** — none of this topic's own (per `CHAPTER.md`); points to the §4.2 lab that topics 8–11
  assemble.
- **Production failures** — the row-order break named directly (a report, a join key assumed
  stable across runs, a `group_by` feeding a positional index); the out-of-core honest gap
  (assuming every join/sort can spill, when the team's own words say that's still in flight).
- **Frontier** — the pre-release post's own list of what's still coming (cost-based planner,
  join reordering, fully async IO, a new S3 reader), named as roadmap, not shipped.
- **Where this goes next** — hands off to connection pooling (topic 8): Arrow, pandas and Polars
  have all stayed in-process; next the pipeline actually leaves the process.

## Examples to execute (examples.py)

- `generate_feed_csv` — the chapter's own shared feed, honestly scaled.
- `eager_vs_lazy_same_result` — asserts identical rows, confirms `isinstance(..., pl.LazyFrame)`
  before `.collect()`.
- `predicate_and_projection_pushdown` — asserts the non-optimized plan has a separate FILTER
  step and the optimized plan folds it into the scan with a narrowed column count.
- `common_subexpression_elimination` — asserts a cached `CSER` node appears in the optimized
  plan and the two output columns are still numerically correct.
- `no_implicit_row_order` — asserts ≥2 distinct row orders across 30 runs of the default engine,
  and exactly 1 (the original) across 30 runs with `maintain_order="left"`.
- `streaming_lowers_peak_memory` — asserts the streaming scan's peak RSS (measured in an
  isolated subprocess) is lower than the eager read's.
- `gpu_engine_sourced_claims` — asserts the GPU engine cannot actually run here, and reports the
  sourced claims as data, never as a local measurement.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, verbatim): "pandas 3.0 adopted Arrow-backed dtypes onto an
  eager, NumPy-born API. This topic is the dataframe library built around Arrow and lazy
  evaluation from the ground up: Polars, whose query engine looks a great deal like the SQL
  optimizer Chapter 2 already covered — pushdown, subexpression elimination — just compiled from
  a different front end."
- **Handoff** (verbatim): "Arrow, pandas and Polars have all been in-process so far. The next
  section turns outward, to the database connection every one of this chapter's pipelines
  eventually has to open for real — starting with how to pool that connection correctly."

## Concept ledger

- **Introduces:** `polars-lazy-expressions`.
- **Uses:** `arrow-columnar-format` (topic 30's buffers, cashed in at step 3's pushdown
  discussion and step 7's memory measurement).
- **Declared:** none beyond topic 5 (Arrow), per `CHAPTER.md`.

## Claims list (claim → source)

1. The lazy API defers execution until `.collect()` → Usage (Lazy API).
2. The lazy API's three benefits (optimization, streaming, early schema errors) → Usage (Lazy
   API).
3. `explain(optimized=False)`/`explain()` show the real before/after plan → Query plan.
4. Predicate pushdown folds a filter into the scan → Query plan.
5. Projection pushdown narrows the scan's column list → Optimizations.
6. Common subplan elimination caches a repeated subtree, run once → Optimizations.
7. `collect()` defaults to the streaming engine since 2.0 (`engine="auto"` → streaming) →
   Pre-release of Polars 2.0.
8. The streaming engine doesn't guarantee row order for join/group_by/unpivot by default;
   `maintain_order` opts back in → Pre-release of Polars 2.0.
9. The streaming engine runs in batches, enabling larger-than-memory processing; unimplemented
   operations fall back to the in-memory engine → Streaming.
10. "Proper out-of-core support for the streaming engine" is still in flight per the team's own
    words → Pre-release of Polars 2.0 (the honest-gap boundary).
11. `engine="gpu"` dispatches to RAPIDS cuDF on NVIDIA GPUs, falling back transparently to CPU on
    unsupported operations → GPU Support [Open Beta].
12. CPU and GPU engines share the Arrow format, so results/files move between them without
    conversion → GPU Support [Open Beta].
13. GPU speedups are most likely for grouped aggregations and joins; I/O-bound queries see
    little benefit → GPU Support [Open Beta].
14. The measured peak-RSS gap between an eager full read and a streaming projection-only scan on
    this sandbox's own feed → direct sandbox measurement (`examples.py`), never attributed to a
    source.
15. The measured non-determinism of row order across 30 repeated runs of the identical join,
    and the stability of `maintain_order` → direct sandbox measurement (`examples.py`).

## Changes from the chapter plan

None. The topic keeps exactly to its `CHAPTER.md` entry's scope, bridge and handoff.

## Progress

- [x] Research done, sources fetched and checked (21/21 quotes).
- [x] Expert list written (`coverage.json` → `expert`, 13 items).
- [x] `examples.py` written and passing.
- [x] This outline.
- [ ] Fact-check / red team.
- [ ] Coverage map completed (syllabus/sources placements finalized against final step titles).
- [ ] `reel.tsx` / `scenes.tsx` / `narration.json` / notes / prerequisites / registry entry.
- [ ] Content review, looks review, checks, ship.
