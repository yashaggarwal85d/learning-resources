<section data-section="outcomes">

## Reading spill from the stage table alone

A stage's own `memoryBytesSpilled` and `diskBytesSpilled` totals tell you whether *any* task
in it spilled, but not which one or how evenly. Pull the per-task breakdown and look for the
shape this topic measures directly: in a skewed job, one task carries the entire total while
every other task reports exactly zero on both counters — a clean signature distinguishing
"one task is skewed" from "the whole stage is under-provisioned," which would instead show
many tasks each spilling a smaller, more even amount.

</section>

<section data-section="External merge sort's own mechanics">

## External merge sort's own mechanics

Run generation (including replacement selection), the heap-driven k-way merge, and fan-in as
a function of the memory budget are the actual algorithm underneath "spill sorted runs to
disk and merge" — taught in full in *Data Structures & Algorithms* Chapter 6, and named here
rather than re-derived, per the syllabus clause's own explicit cross-reference. The same idea
reappears, unchanged, behind `ORDER BY` spills, sort-merge joins, LSM compaction, and the
shuffle merges this chapter's own earlier topics already covered.

</section>

<section data-section="production failures">

## When this doesn't save you

Doubling `spark.executor.memory` cluster-wide to chase one job's skewed-task spill pays for
memory every other concurrently-running task never needed, often without meaningfully
shrinking the one spill it was meant to fix — the fix this topic's own measurements point to
is addressing the skew itself (the remedies two chapters back: AQE skew-join splitting,
broadcasting, salting, two-phase aggregation), not simply growing the pool everyone shares.

</section>

<section data-section="frontier">

## Where this goes next

Spill is memory pressure the engine handles automatically, slowly, whether anyone asked for
it or not. The next topic is the opposite: memory pressure chosen on purpose, by caching data
deliberately, and the cases where that choice helps and where it quietly costs more than it
saves.

</section>
