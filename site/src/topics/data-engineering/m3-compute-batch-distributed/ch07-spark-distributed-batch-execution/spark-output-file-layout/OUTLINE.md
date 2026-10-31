# Outline: de.spark-output-file-layout

## Syllabus line (verbatim, `syllabus/data-engineering.md:428`)

> **Controlling Spark output file layout** — output file count = writing tasks × partitions touched; `maxRecordsPerFile`, `REBALANCE` hints with AQE, and table-format write-distribution modes as the Spark-side answer to the small-file problem (general treatment in §6.1/§6.3).

## Learning outcomes

- Predict a write's output file count from its task count and partition columns alone.
- Choose between `maxRecordsPerFile` and a `REBALANCE` hint for a given small-files symptom.

## Reel steps (10, kind: full)

1. Hook — the same 1,000,000-row write, the same partition column, nothing else changed except
   how many tasks did the writing. How many files land on disk?
2. Reveal: the baseline — 2, 4, 8 tasks produce 8, 16, 32 files, always exactly tasks times the 4
   partition values touched. (No takeaway — reel test's own "from" step, per
   [[learning-resources-takeaway-position-gotcha]].)
3. Predict (index 2, within first 4) — is there a way to cap each individual file's size
   directly, without touching the task count at all?
4. Reveal: yes — `maxRecordsPerFile` caps rows per file; the same 2 tasks now write 24 files
   instead of 8, each at or under the cap. (No takeaway — immediately after a predict.)
5. Elaborate: the cap changes nothing about how many tasks ran — it only splits what a single
   task writes into its own partition, after the fact. **Takeaway 1.**
6. Predict (index 5) — going the other way, can a plain hint collapse a 32-task write's file
   count without touching AQE at all?
7. Reveal: no — `REBALANCE` with AQE off leaves the write exactly as it was (128 files either
   way); the hint does nothing without AQE enabled. (No takeaway — immediately after a predict.)
8. Elaborate: with AQE on, the same hint coalesces the shuffle before the write, and its
   column-aware form lands on exactly one file per partition value. **Takeaway 2.**
9. Reveal: the same write, same data, three file counts side by side — 128, 16, 4 — by changing
   only a hint and whether AQE is on.
10. Recap. **Takeaway 3.**

Engagement arc: two predicts (≥2 required), the first at index 2 (≤4 required); three takeaways,
each on a step that is neither the reel test's "from" step (here step 2) nor immediately after a
predict (here steps 4 and 7) — same pattern as topics 13 and 15.

## Narrator's line of thought per step

1. Pose the concrete puzzle: identical data, identical partition column, only the task count
   changes — and so does the file count on disk.
2. Name the exact rule the numbers obey: tasks times partitions touched, every time.
3. Invite a guess: maybe the fix is a config that caps a file's own size, leaving tasks alone.
4. Confirm it, with the exact file-count jump that config produces.
5. State the mechanism precisely: nothing about the job's parallelism changed — only how a
   task's own output gets split once it's already past the row cap.
6. A second guess, the opposite direction: can a hint alone shrink the file count, with no other
   change to the job.
7. No — name the hint's own stated condition: it is ignored outright without AQE.
8. Where AQE changes the answer: the hint coalesces the shuffle itself before the write, and its
   column-aware form rebalances by the partition column specifically.
9. Put all three numbers next to each other, from the same write.
10. Pull the thread: file count obeys a rule, and two separate levers — one per-file, one
    per-job — both exist to break it on purpose.

## Post-notes layers

- `outcomes`: reading a job's own task count and partition columns to predict its file count
  before running it.
- `the sourced-only half, table-format write-distribution modes`: Iceberg/Delta's own
  write-distribution-mode options as a table-format-side answer to the same problem, named but
  not independently measured here (general treatment lives in §6.1/§6.3, per the syllabus
  clause's own scoping).
- `production failures`: a high-task-count write into a high-cardinality partition column,
  producing a small-files flood neither lever was ever applied to.
- `frontier`: the chapter's own close — from what gets read, shuffled, and written, to what
  happens when the machine running it runs out of room.

## `examples.py` claims (all measured against real PySpark 4.0.1, local[4])

1. Writing the same 1,000,000-row DataFrame (partitioned by a 4-valued column) at 2, 4, and 8
   tasks (via `.repartition(n)`, AQE off) produces exactly 8, 16, and 32 files — tasks times
   partitions touched, every time.
2. The same 2-task write with `maxRecordsPerFile=50000` set produces 24 files instead of 8, and
   every file's own row count, read back directly, is at or under 50,000 (observed max exactly
   50,000 across all 24 files).
3. A 32-task shuffle written with AQE off produces 128 files whether or not a plain `REBALANCE`
   hint is present (the hint is silently ignored without AQE). With AQE on and
   `coalescePartitions` enabled, the same `REBALANCE` hint cuts the write to 16 files, and
   `REBALANCE(k)` (rebalancing by the partition column itself) cuts it to exactly 4 — one file
   per partition value.

## Bridge / handoff (copied exactly from CHAPTER.md)

- Bridge: "Every topic so far in this section changed what gets read or shuffled on the way in.
  This one closes the section on the opposite end: what Spark actually writes, and why the same
  small-files problem that haunts a lakehouse read (§6.1/§6.3) usually starts right here, at
  write time."
- Handoff: "Section 7.2 is done: the shuffle, the joins and the files are all explained. The next
  section turns from 'how much work and where' to 'what happens when the machine running it runs
  out of room' — Spark's own memory model."

## Concept ledger

- Introduces: `spark.output-file-layout`.
- Uses: `spark.partition-sizing`, `spark.aqe`.
- Declared: none.

## Claims list

| Claim | Source |
|---|---|
| `RebalancePartitions` rebalances by partition expressions and splits skewed partitions to avoid small/big files, only when AQE is enabled | `basicLogicalOperators.scala` (`RebalancePartitions`) |
| The `REBALANCE` hint can take column names and is ignored outright if AQE is not enabled | Spark SQL "Hints" docs |
| `spark.sql.files.maxRecordsPerFile` caps rows per written file; `0` (the default) means no limit | Spark configuration docs |

## Progress

Next topic: 17. `de.executor-memory-model` (section 7.3 begins).
