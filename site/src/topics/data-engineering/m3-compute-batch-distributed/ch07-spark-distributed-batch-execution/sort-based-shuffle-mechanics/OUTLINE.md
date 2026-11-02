# OUTLINE: de.sort-based-shuffle-mechanics

Full topic, chapter 7's third. Syllabus line in full (§7.1): "Sort-based shuffle mechanics — map
side partitions, sorts and spills records into one data file plus an index file per map task; the
MapOutputTracker tells reducers where blocks live; reducers fetch over the network with bounded
in-flight requests; why shuffle (disk + network + serialisation + O(M×R) small blocks) is the
dominant cost of most jobs."

## Learning outcomes
1. State the exact per-map-task shuffle write: one sorted data file, one separate index file.
2. Predict file count from map-task count alone, independent of data volume.
3. Explain how a reducer locates its blocks (the MapOutputTracker), before any network fetch.
4. Derive the M times R logical block count and name the four costs it drives (disk, network, serialisation, small-block count).

## Reel steps (final, matches reel.tsx) — 8 steps, 2 predicts (full topic requires ≥2)
1. Hook — four map tasks, unknown file count.
2. Reveal: four map tasks, four data files, four index files (measured).
3. Predict 1 (index 2, within first 4) — same rows, eight map tasks: more files, or the same four?
4. Reveal: eight map tasks, eight new pairs, identical data (measured).
5. Reveal: how a reducer finds its blocks (MapOutputTracker mechanism).
6. Predict 2 — grow reduce buckets instead of map tasks: does block count grow the same way?
7. Reveal: blocks scale as M times R (measured: 4 x 97 = 388).
8. Recap.

## Engagement arc
- Hook: genuine ambiguity (unknown file count before measuring).
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("same data, so same files").
- Predict 2 (step 6): tempting wrong answer ("blocks only depend on map tasks").
- Surprising numbers: file count tracks task count exactly, not data volume; block count is a
  product (388), not a sum, and grows from either side.
- Takeaways (3 explicit `takeaway` fields): step 4 (file count tracks map-task count), step 5
  (MapOutputTracker is consulted before any fetch), step 7 (block count is the product of both
  counts).
- Recap restates the full mechanism and names all four cost sources.

## Narrator's line of thought (beyond description)
- Step 2: stresses "measured directly," names the exact pair count.
- Step 3: names the hard intuition (same data should mean same files).
- Step 4: states the result before any mechanism explanation.
- Step 5: introduces the MapOutputTracker as the thing consulted first, before any fetch.
- Step 6: names the trap in the second predict (blocks "only" depend on map tasks).
- Step 7: generalizes to the M times R rule explicitly.
- Step 8: states the full mechanism plus the four named costs.

## Post-notes layers
- Outcomes: shuffle grid (M data/index pairs, M times R blocks), four cost sources.
- Internals: bounded in-flight fetch requests (ShuffleBlockFetcherIterator), tying the small-block
  cost named in the syllabus to a concrete scheduling decision on the fetch side.
- Production: "the shuffle is slow" as an undifferentiated cause; reduce-partition growth as a
  multiplication, not a doubling.
- Frontier: push-based shuffle and the external shuffle service named as the mechanism's own
  answer to the O(M×R) small-block cost, not built here.
- Where this goes next: task scheduling, locality and parallelism (next topic).

## Examples to execute (examples.py) and assertions
- 4-partition range, `groupBy(derived key).count().collect()`, `spark.local.dir` pointed at a
  controlled temp dir: 4 shuffle data files, 4 index files found by globbing; total index bytes <
  total data bytes.
- Identical row count, 8-partition range, same groupBy, same session (directory NOT reset — Spark's
  BlockManager already owns subdirectories under it): diff the file sets before/after, assert
  exactly 8 new data files and 8 new index files appear.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log). Deleting and recreating the local shuffle directory mid-session was tried first and
crashed Spark's BlockManager with a FileNotFoundException on a later temp_shuffle file — fixed by
diffing file sets against the same, never-reset directory instead; documented in FACT-CHECK.md.

## Bridge and handoff
- Bridge: "The previous topic named the shuffle as the thing that happens at a stage boundary.
  This topic opens what that actually is on disk and over the wire: one sorted file and one index
  per map task, fetched by every reducer that needs a piece of it."
- Handoff: "Knowing what a shuffle writes says nothing yet about how many tasks run it, or how
  evenly — the next topic's own concern, locality and parallelism."

## Concept ledger
- Introduces: `spark-shuffle-mechanics`, `spark-map-output-tracker`.
- Uses: `spark-stage-boundary` (topic 2).
- Declared: none.

## Claims list (claim → source)
1. Map-side results are buffered, sorted by target partition, then written to a single file →
   RDD Programming Guide, Shuffle operations.
2. Reduce-side tasks read the relevant sorted blocks from those files → same source.
3. Data of shuffle blocks from the same map task are stored in a single consolidated data file →
   `IndexShuffleBlockResolver.scala`, v4.0.0.
4. The offsets of the data blocks in the data file are stored in a separate index file → same
   source.
5. File count tracks map-task count exactly, independent of data volume; logical block count is
   the product of map-task count and reduce-partition count → measured directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 4/30,
de.task-scheduling-locality-parallelism.
