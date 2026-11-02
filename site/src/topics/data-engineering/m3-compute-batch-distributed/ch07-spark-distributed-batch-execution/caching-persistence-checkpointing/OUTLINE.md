# Outline: de.caching-persistence-checkpointing

## Syllabus line (verbatim, `syllabus/data-engineering.md:434`)

> **Caching, persistence and checkpointing** — storage levels (memory/disk, serialised, replicated), LRU eviction and recomputation; `cache` keeps lineage while `checkpoint` (reliable) and `localCheckpoint` truncate it; when caching hurts (memory stolen from execution, cache of a non-deterministic plan).

## Learning outcomes

- Choose a storage level for a given reuse pattern and memory budget.
- Explain why caching a plan with a non-deterministic UDF can silently produce different
  cached rows.

## Reel steps (10, kind: full)

1. Hook — a reused computation runs twice. Does Spark remember the first answer, or redo the
   whole thing?
2. Reveal: the baseline — uncached, both runs genuinely redo the whole computation. (No
   takeaway — reel test's own "from" step.)
3. Predict (index 2, within first 4) — cache the same computation. Does the second run reuse
   the first answer, or still redo it?
4. Reveal: cached — the first run pays the cost once; the second reuses it immediately. (No
   takeaway — immediately after a predict.)
5. Elaborate — why: the cached data sits ready; the computation behind it goes unused on
   reuse. **Takeaway 1.**
6. Predict (index 5) — now put that cache under real memory pressure, forced to give up room.
   Does a plain memory-only cache survive, or does Spark just quietly redo the work later?
7. Reveal: a memory-only cache that's evicted gets fully recomputed the next time it's
   touched; a cache allowed to spill to disk instead is read back, no recomputation. (No
   takeaway — immediately after a predict.)
8. Elaborate — why: the chosen storage level decides whether eviction means "pay the cost
   again later" or "write it once, read it back." **Takeaway 2.**
9. Reveal: a computation whose own answer changes every time it runs — uncached, two runs
   disagree on every row; cached, every later run agrees with the first, exactly.
10. Recap. **Takeaway 3.**

Engagement arc: two predicts (≥2 required), the first at index 2 (≤4 required); three
takeaways, each on a step that is neither the reel test's "from" step (here step 2) nor
immediately after a predict (here steps 4 and 7) — same pattern as topics 16, 17, and 18.

## Narrator's line of thought per step

1. Pose the concrete setup: the same piece of work, run twice. Does the second run get a
   shortcut, or pay the same price again.
2. Name the baseline: without asking Spark to remember anything, both runs genuinely redo the
   entire thing from scratch.
3. Invite a guess: ask Spark to remember the result this time. Does the second run still redo
   the work, or does it get to skip straight to the answer.
4. It skips straight to the answer. The first run pays once; the second doesn't pay at all.
5. Why: the remembered result just sits there, ready to hand back. The computation that
   produced it never runs again on reuse.
6. A second guess: that remembered result is now competing for room with something else and
   some of it gets pushed out. Does Spark simply redo the lost part later, quietly, or does it
   have another option.
7. It depends entirely on what you told it to do when it runs out of room: one choice means
   redoing the lost part in full; the other means reading it back from disk instead.
8. Why: the choice of where to keep an evicted piece — simply forgotten, versus written to
   disk — is exactly what decides whether losing it later costs you the computation again or
   just a disk read.
9. One more case: a computation whose own answer is allowed to change every single time it
   runs. Without remembering it, two runs disagree on every row. Remember it once, and every
   later run agrees with that first answer, exactly, every time.
10. Pull the thread: remembering a result only pays off if the thing you told it to do when
    room runs short actually fits what you need, and remembering locks in one answer from a
    computation that was never promised to give the same one twice.

## Post-notes layers

- `outcomes`: choosing a storage level for a concrete reuse pattern and memory budget —
  reading whether a job's own numbers favor an eviction that recomputes (cheap, deterministic,
  reused rarely) or one that spills instead (expensive to redo, reused often, memory tight).
- `checkpoint truncates lineage`: `checkpoint()` (reliable) and `localCheckpoint()` cut the RDD's
  own dependency chain back to the original computation, replacing it with a read from either
  reliable storage or executor-local storage — distinct from `cache`, which keeps the full
  lineage intact underneath the cached data, sourced and named here rather than re-measured.
- `production failures`: caching a DataFrame that's only ever read once, stealing execution
  memory from the rest of the job for a cache nothing reuses — the opposite failure of not
  caching something genuinely reused many times.
- `frontier`: this chapter's own deliberate-memory-pressure topic hands off to a different
  layer of the same machine entirely — the JVM's own garbage collector, underneath Spark's own
  memory accounting.

## `examples.py` claims (all measured against real PySpark 4.0.1, local[2])

1. Caching a reused computation avoids redoing it: uncached, two actions over the same
   heavy-UDF DataFrame each run the UDF on every row (confirmed via an accumulator counting
   real invocations); cached, the UDF runs once on the first action and the second action
   reuses the cached result exactly.
2. Storage levels differ in what eviction does under real memory pressure: a `MEMORY_ONLY`
   cache that's evicted is fully recomputed the next time it's touched (the accumulator count
   doubles); a `MEMORY_AND_DISK` cache spills the evicted data to disk instead and is read back
   without recomputation (the accumulator count stays the same) — confirmed against measured
   cached-data growth (>10x) once a same-sized filler forces real eviction.
3. Caching a non-deterministic computation freezes its output: uncached, two actions over the
   same non-deterministic UDF disagree on every one of 40 rows; cached, every later action
   agrees with the first, on all 40 rows, every time.

## Bridge / handoff (copied exactly from CHAPTER.md)

- Bridge: "Spill was memory pressure forced on the engine by too little room. Caching is the
  opposite: memory pressure the developer chooses on purpose, by asking Spark to keep
  something around — and it can steal exactly the execution memory the previous topic
  described."
- Handoff: "Caching and checkpointing are both about surviving across jobs. The next topic is
  about surviving within one: the JVM's own garbage collector, and the pauses it causes under
  the same memory pressure."

## Concept ledger

- Introduces: `spark.cache-vs-checkpoint`, `spark.storage-levels`.
- Uses: `spark.unified-memory-manager`.

## Claims list

| Claim | Source |
|---|---|
| Without persist/cache, an action may recompute an RDD from scratch; cache/persist keep it around for faster reuse | Spark "RDD Programming Guide" |
| `cache()` defaults to `MEMORY_ONLY`; `MEMORY_ONLY` recomputes evicted partitions on the fly; `MEMORY_AND_DISK` spills them to disk and reads them back instead | Spark "RDD Programming Guide" |
| A storage level is a bundle of independent flags (memory, disk, deserialized, replication) | `StorageLevel.scala` |
| A reliable checkpoint's RDD reads purely from checkpoint files, with no reference to the RDD it was checkpointed from | `ReliableCheckpointRDD.scala` |

## Progress

Next topic: 20. `de.jvm-garbage-collection-symptoms` (re-verify exact scope when reached).
