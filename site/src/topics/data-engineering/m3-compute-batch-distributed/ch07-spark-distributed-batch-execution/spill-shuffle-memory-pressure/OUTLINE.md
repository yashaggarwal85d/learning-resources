# Outline: de.spill-shuffle-memory-pressure

## Syllabus line (verbatim, `syllabus/data-engineering.md:433`)

> **Spill and shuffle memory pressure** — when sorts and hash aggregations exceed execution memory they spill sorted runs to disk and merge (external merge sort, §1.3; → *Data Structures & Algorithms* Ch.6); reading spill (memory) vs spill (disk) metrics; why adding executor memory often fails to fix a skewed or over-wide task.

## Learning outcomes

- Read the Spark UI's spill (memory)/spill (disk) metrics and say whether a task actually
  spilled.
- Explain why a skewed task's spill doesn't shrink when total executor memory grows.

## Reel steps (10, kind: full)

1. Hook — four tasks sort the same kind of data, one of them holding far more of it than the
   rest. Which one runs out of room first?
2. Reveal: the baseline — a genuine spill, with two different numbers reported for it. (No
   takeaway — reel test's own "from" step, per [[learning-resources-takeaway-position-gotcha]].)
3. Predict (index 2, within first 4) — of four tasks sorting the same skewed data, how many of
   them actually spill?
4. Reveal: exactly one — the other three never touch disk at all. (No takeaway — immediately
   after a predict.)
5. Elaborate: the memory figure for that one spill is bigger than the disk figure, for the
   exact same event — rounding and bookkeeping that a disk write never has to carry.
   **Takeaway 1.**
6. Predict (index 5) — give the whole job four times the memory. Does the skewed task's own
   spill shrink by anywhere close to that much?
7. Reveal: no — it barely moves, while the three tasks that never needed help stay exactly
   where they were. (No takeaway — immediately after a predict.)
8. Elaborate: the extra memory went to every task equally, but only one of them needed it, and
   even its own fair share grew by nowhere near what the one task would need to stop spilling
   entirely. **Takeaway 2.**
9. Reveal: both runs, memory small and memory quadrupled, side by side.
10. Recap. **Takeaway 3.**

Engagement arc: two predicts (≥2 required), the first at index 2 (≤4 required); three
takeaways, each on a step that is neither the reel test's "from" step (here step 2) nor
immediately after a predict (here steps 4 and 7) — same pattern as topics 13, 15, 16, and 17.

## Narrator's line of thought per step

1. Pose the concrete setup: several workers sorting pieces of the same kind of data, one piece
   much bigger than the rest. Who runs out of room first.
2. Name what a real spill looks like once it happens: not one number, but two, for the same
   event.
3. Invite a guess: out of several workers handling unevenly sized pieces, how many actually
   spill.
4. Only one. The rest never come close to needing it.
5. Explain the gap between the two numbers: one of them counts bookkeeping overhead the other
   simply never has to.
6. A second guess: quadruple the whole job's own memory. Does the one spilling worker catch up.
7. It barely moves at all, while the workers that were already fine stay exactly fine.
8. Why: the extra memory was handed out evenly, but only one worker needed any of it, and its
   own piece was still far too large for even a much bigger share to hold.
9. Put the small-memory run and the much-bigger-memory run side by side.
10. Pull the thread: one metric means two numbers worth comparing, and more memory, spread
    evenly, is a weak answer to one worker holding far more than its share.

## Post-notes layers

- `outcomes`: reading a stage's own memory/disk spill numbers and reasoning backward to which
  task actually spilled, without opening a single task's own detail page.
- `the sourced-only half: external merge sort's own mechanics`: run generation, replacement
  selection, and heap-driven k-way merge — the actual algorithm behind the "spill and merge"
  step, taught in full in *Data Structures & Algorithms* Chapter 6, named and sourced here
  rather than re-taught.
- `production failures`: doubling `spark.executor.memory` cluster-wide to chase one job's
  spill, paying for memory every other job's tasks never needed.
- `frontier`: this chapter's model of memory applies to a deliberate choice next — caching —
  rather than memory pressure the engine handles for you automatically.

## `examples.py` claims (all measured against real PySpark 4.0.1, local[2])

1. A skewed sort (one partition holding the overwhelming majority of rows) genuinely spills:
   the memory figure for the spill is larger than the disk figure for the identical event.
2. Of the four tasks doing the sort, exactly one carries the entire spill; the other three
   report zero spill, at either memory setting tested.
3. Quadrupling the available memory (512MB driver heap to 2GB) leaves the skewed task's own
   spill essentially where it started (observed anywhere from no visible change up to a modest
   reduction across runs) — nowhere near proportional to the 4x memory increase — while the
   three already-fine tasks remain at zero regardless.

## Bridge / handoff (copied exactly from CHAPTER.md)

- Bridge: "The memory model names the regions. Spill is what execution memory does the
  instant it's exceeded: the same external-merge-sort idea Algorithms Chapter 6 already
  taught, now triggered by a Spark task instead of a single process."
- Handoff: "Spill is memory pressure the engine handles automatically, if slowly. The next
  topic is memory pressure deliberately chosen on purpose — caching — and when that choice
  helps or hurts."

## Concept ledger

- Introduces: `spark.spill-mechanics`.
- Uses: `spark.unified-memory-manager`, `dsa.external-merge-sort` (declared — not yet live),
  `spark.skew-diagnosis`.
- Declared: `dsa.external-merge-sort`.

## Claims list

| Claim | Source |
|---|---|
| Sort-and-spill happens specifically "in response to memory pressure" | `UnsafeExternalSorter.java` |
| The memory-spilled figure includes page-rounding and pointer-array overhead never written to disk, unlike the disk-spilled figure | `UnsafeExternalSorter.java` |
| Execution memory is used for computation in shuffles, joins, sorts and aggregations; without caching, a job can use the entire pool for execution, avoiding unnecessary spills | Spark "Tuning Spark" docs |

## Progress

Next topic: 19. `de.caching-strategy-tiers` (or CHAPTER.md's named next topic — re-verify title when reached).
