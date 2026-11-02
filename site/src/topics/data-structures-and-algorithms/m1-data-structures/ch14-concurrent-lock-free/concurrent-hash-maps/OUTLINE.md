# OUTLINE: Concurrent hash maps

About 16 minutes. Closes Chapter 14 and Milestone 1. No compiled benchmark needed
(see "Why no compiled benchmark" below) — every number this topic puts on screen
is a mechanism traced in `examples.py`, not a throughput curve.

## Storyboard

1. **Hook.** A service keeps a map from request id to a running count; sixteen
   threads update it. One mutex around the whole map is correct, and at sixteen
   threads the map is the bottleneck.
2. **Predict.** Sixteen locks, one per stripe, are better — until the map has to
   grow. During a resize, does a reader wait for it, look in both tables, or
   find a note telling it where to go?
3. **Lock striping.** The baseline (one lock, everyone serialized) against S
   independently locked stripes: threads on different stripes never meet.
   What it buys (S-fold less contention under a uniform hash) and what it
   costs (an operation needing the whole table — size, resize — takes every
   lock; the stripe count is fixed at construction). Java's pre-Java-8
   `ConcurrentHashMap` was built from segments; the JDK 21 source still
   carries `DEFAULT_CONCURRENCY_LEVEL = 16` and an unused `Segment` class,
   kept only for compatibility.
4. **Insert into an empty bin.** One compare and swap lands the first node;
   no lock taken. Traced in `examples.py` (`insert`, `"cas-empty-bin"`).
5. **Insert into an occupied bin.** The first node of the bin's own chain is
   used as the lock (no separate lock object per bin); other threads on other
   bins stay free. Traced in `examples.py` (`"lock-first-node"`), with two
   keys (11 and 19) landing in the same bin as a worked example.
   *Takeaway (placed here, not step 3, to avoid squeezing the phone-width
   caption on the first non-predict step after hook+predict — the lesson
   learned shipping topics 45 and 46):* "No lock object per bin — the bin's
   own first node is the lock, so an empty bin costs nothing to guard."
6. **Reads never lock.** A lookup is a plain traversal; it can run while an
   update is in flight on the same bin. Traced with `read()` in `examples.py`.
7. **Predict.** A bin's chain grows past a handful of nodes under a uniform
   random hash — plausible, or (as the Poisson table says) astronomically
   rare?
8. **The Poisson bars.** The source's own bin-length table (parameter about
   0.5 at the 0.75 load-factor threshold) computed and checked against the
   quoted figures in `examples.py`. A chain of eight by pure chance is a
   one-in-sixteen-million event — which is why a chain that long is read as
   a hostile or colliding key distribution, Chapter 3's HashDoS, showing up
   inside this structure.
9. **Treeified bins.** At `TREEIFY_THRESHOLD` (8) nodes, and only if the table
   has at least `MIN_TREEIFY_CAPACITY` (64) bins, the bin becomes a balanced
   red-black tree bounding search to O(log N); below that capacity the table
   resizes instead. A reader never blocks on the tree's own lock — it falls
   back to the slow pointer traversal while the root lock is held. Traced
   in `examples.py` (`insert_and_check_treeify`, `resize_split_untreeifies`).
10. **The cooperative resize.** A migrated bin's head becomes a forwarding
    marker; a thread that finds one follows it to the new table, and other
    threads can join the migration of the next range of bins — every thread
    pays a share, in contrast with Chapter 3's one thread amortizing the
    move. Traced in `examples.py` (`ResizingTable`): a reader for a migrated
    key follows the marker; a reader for an unmigrated key reads the old
    table directly.
11. **Split-ordered lists.** The lock-free alternative: one list, sorted by
    the bit-reversal of the hash key, with dummy nodes marking bucket starts.
    Doubling the bucket array (4 buckets to 8, the keys 0 through 15) adds
    four new dummy nodes and moves zero real items — checked directly in
    `examples.py` by comparing every real key's sort key and relative order
    across both table sizes.
12. **Shards, and recap.** `dashmap`'s array of cache-padded read-write-locked
    shards, the shard count `(available_parallelism * 4).next_power_of_two()`
    computed for several core counts and for this machine's own core count.
    Recap: the three structures of the chapter side by side with their
    progress rung (blocking lock striping, lock-free-on-the-fast-path CAS
    bins, fully lock-free split-ordered lists), closing the milestone.

## Why no compiled benchmark

Unlike the previous topic, this topic's outcomes (per `CHAPTER.md`) are about
tracing and explaining mechanisms — an insert into an empty bin, an insert
into an occupied bin, a read during a resize, why a bin treeifies, why
doubling a split-ordered table moves nothing — not about measuring a
throughput or scaling curve. Every one of those mechanisms is deterministic
given the inputs, so a pure Python model checked with asserts is the honest
tool, per `CHAPTER.md`'s own rule that a Python thread benchmark would be
dominated by the interpreter's global lock. No `examples.c` or `examples.sh`
is needed for this topic.

## Machine, compiler, flags

Not applicable — no compiled benchmark this topic. `examples.py` run with
Python 3 in this sandbox (4 vCPUs, Intel Xeon @ 2.80GHz) only to print its own
asserted results; no timing is taken or quoted.

## Changes from the chapter plan

None. The chapter plan's "to verify" items were resolved during research
(recorded in `SOURCES.md`'s Red team section and `FACT-CHECK.md`): the
`jdk-21-ga` tag was not independently re-checked out (the `master` branch of
`jdk21u` was read instead, and the quoted comments/constants are long-stable
design text); the pre-Java-8 segment design is stated only from the current
source's own backward-reference comment, per the plan's own instruction not
to describe it without a JDK 7 source; dashmap's released shard formula was
not independently confirmed, only `master`'s pre-release formula, labeled as
such throughout.
