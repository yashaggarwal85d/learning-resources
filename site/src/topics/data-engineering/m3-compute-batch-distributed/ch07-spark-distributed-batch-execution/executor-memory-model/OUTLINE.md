# Outline: de.executor-memory-model

## Syllabus line (verbatim, `syllabus/data-engineering.md:432`)

> **Executor memory model** — unified memory manager: execution vs storage regions with borrowing and eviction (`spark.memory.fraction`, `storageFraction`), user memory, reserved memory, off-heap, `memoryOverhead` for netty buffers, Python workers and native libraries; JVM `OutOfMemoryError` vs container OOM-kill (YARN/Kubernetes) and why they need different fixes.

## Learning outcomes

- Draw an executor's memory bar for a given config and explain which region borrows from
  which under pressure.
- Distinguish a JVM OOM from a container OOM-kill from their symptoms alone.

## Reel steps (10, kind: full)

1. Hook — an executor holds cached data; a later task needs real working room. Both want the
   same pool. What happens when they collide?
2. Reveal: the pool's own split — the unified region's size and how `memory.fraction` and
   `storageFraction` carve it up. (No takeaway — reel test's own "from" step, per
   [[learning-resources-takeaway-position-gotcha]].)
3. Predict (index 2, within first 4) — a cache that's grown well past the protected minimum,
   under real pressure from a later task: does it survive?
4. Reveal: no — it's evicted entirely, and the task still has to spill besides. (No takeaway —
   immediately after a predict.)
5. Elaborate: a cache sized under that same protected minimum survives the identical pressure
   completely untouched — the guarantee only ever applies above that floor. **Takeaway 1.**
6. Predict (index 5) — a JVM heap error and a container-level kill: do they look the same from
   the application's own point of view?
7. Reveal: no — the heap error is a real, catchable exception with a full stack trace; the
   container kill leaves no exception at all, anywhere. (No takeaway — immediately after a
   predict.)
8. Elaborate: why — the JVM only ever watches its own heap; a container's limit covers ground
   the JVM can't see at all, so raising heap alone can't fix a kill the JVM never noticed
   coming. **Takeaway 2.**
9. Reveal: both failure signatures, side by side, from the same kind of memory pressure.
10. Recap. **Takeaway 3.**

Engagement arc: two predicts (≥2 required), the first at index 2 (≤4 required); three
takeaways, each on a step that is neither the reel test's "from" step (here step 2) nor
immediately after a predict (here steps 4 and 7) — same pattern as topics 13, 15, and 16.

## Narrator's line of thought per step

1. Pose the concrete collision: cached data sitting in memory, and a new task that genuinely
   needs room of its own. Something has to give.
2. Name the shape of the pool itself: one region, split by two settings, not two separate pots.
3. Invite a guess: does a growing cache simply hold its ground once it's past some floor.
4. No — name exactly what happened: full eviction, and the task spilled anyway.
5. The floor itself, stated precisely: below it, nothing gets touched, no matter how much
   pressure the other side is under.
6. A second guess, about two very different kinds of failure that sound alike by name.
7. They are not alike at all: one leaves a trail: the other leaves nothing.
8. Why: one watcher only ever sees its own house; the other's walls are invisible to it.
9. Put both failures side by side, from the same root cause.
10. Pull the thread: one pool, one floor, and two different kinds of running out of room.

## Post-notes layers

- `outcomes`: reading an executor's own memory metrics (storage used, max memory) to tell
  which side of the floor a cache sits on, before it ever gets evicted.
- `the sourced-only half: user memory, reserved memory, and off-heap`: the parts of the
  executor's heap the unified pool doesn't cover at all — named and sourced, not
  independently measured here, since this topic's own worked examples operate entirely
  inside the unified pool itself.
- `production failures`: raising `spark.executor.memory` without raising
  `memoryOverhead`, or raising it without raising the container's own limit to match.
- `frontier`: spill, the first thing that happens the instant execution memory alone (not a
  whole evicted cache) runs out.

## `examples.py` claims (all measured against real PySpark 4.0.1, local mode)

1. A cache using well over half of a ~294MB unified pool (observed 65-82% across runs, always
   past the 30% protected minimum) is evicted entirely — 0 bytes, 0 partitions left in
   `/storage/rdd` — once a single-partition sort needs real execution memory; the sort still
   spills to both memory and disk even after the eviction.
2. The identical execution pressure against a cache sized under the protected minimum (here,
   under 30% of the pool) leaves it completely untouched: the exact same byte count, the exact
   same partition count, before and after.
3. A driver heap deliberately too small for a `collect()` produces a genuine, catchable Java
   exception containing the literal text `OutOfMemoryError: Java heap space`, with a full
   stack trace — run and captured as its own subprocess, since the JVM writes this text
   straight to its own process output rather than into the wrapping Python exception's
   message.
4. (Disclosed in FACT-CHECK.md, not re-run in `examples.py`.) A real Linux cgroup memory limit
   around the same driver process, triggered the same way (a `collect()` that outgrows the
   container, not the heap), produces a genuine kernel-level `cgroup out of memory: Killed
   process (java)` entry in `dmesg`, with zero Java exception on either side of the
   connection — measured once in this session.

## Bridge / handoff (copied exactly from CHAPTER.md)

- Bridge: "Section 7.2 was entirely about the shuffle and the files around it. This section
  turns to the resource every one of those operations actually spends: the executor's own
  memory, and the single model — storage and execution borrowing from each other — that
  governs all of it."
- Handoff: "The model says where memory lives. The next topic is the first thing that happens
  when it runs out: spill, the direct and usually first symptom of memory pressure."

## Concept ledger

- Introduces: `spark.unified-memory-manager`, `spark.oom-vs-oomkill`.
- Uses: `spark.task-hierarchy`.
- Declared: none.

## Claims list

| Claim | Source |
|---|---|
| A soft boundary lets either side borrow from the other; storage's borrowed memory can be evicted, execution's never is | `UnifiedMemoryManager.scala` |
| The unified pool's size formula: `(heap - 300MB reserved) * memory.fraction`, split further by `storageFraction` | `UnifiedMemoryManager.scala` |
| `memoryOverhead` covers VM overhead, interned strings, off-heap memory, and co-located processes the JVM heap never tracks; a container's real ceiling is `memory + memoryOverhead` | Spark configuration docs |

## Progress

Next topic: 18. `de.spill-shuffle-memory-pressure`.
