<section data-section="outcomes">

## What this topic leaves you able to do

Trace a spilling sort through run generation and a balanced merge, and say what each of four
real departures from Knuth's textbook algorithm buys; explain why a hash aggregation can spill
by hash partitioning or by turning into a sort; and name the structure behind a sort-merge
join's own spill and a shuffle read's own sort.

</section>

<section data-section="internals">

## Into the internals

### Why a balanced merge replaced polyphase

Polyphase merging earns its complexity when tape drives are the scarce, expensive resource:
keeping a handful of physical drives constantly busy is worth a cleverer merge schedule. Once a
"tape" costs a few kilobytes of buffer memory rather than a physical drive, an engine can afford
as many of them as there are runs, and a straightforward balanced merge — read from every run at
once, write the result, done in one pass when there are few enough runs — needs no scheduling
cleverness at all. The algorithm did not get smarter; the resource it was economizing on
stopped being scarce.

### Two spills, one row set, different costs

PostgreSQL's hash-partitioned spill never sorts anything: an overflow row is hashed to one of a
few hundred to a thousand logical tapes and written as-is, exactly as a hash join batches its
own overflow (topic 117). Spark's fallback instead sorts the entire overflow buffer once before
merging it back with the resident groups. Both designs see the identical overflow rows in this
topic's own measurement; the difference is a comparison-based sort Spark's design pays for and
PostgreSQL's does not, traded for whatever a sort buys Spark elsewhere in its execution model
(a uniform, reusable spill-and-merge code path shared with sort-merge joins and shuffle reads).

</section>

<section data-section="lab">

## The lab

`examples.py`'s small instance (2,000 rows, a budget of 50) is simulated in full: quicksort run
generation produces 40 runs, and a balanced merge at order 4 brings them to one sorted sequence
in 3 passes, matching the closed-form pass count exactly. The same formula, applied to the
hook's own numbers (20 million rows, a 200,000-row budget), gives 100 runs: one pass if every
run's buffer can be held open at once, three passes at a realistic merge order of 7. The
aggregation side measures 60,000 skewed rows against a 400-group budget: both spill designs
see the identical 25,667 overflow rows (43% of the stream) and partition them differently
only afterward.

</section>

<section data-section="production">

## In production

PostgreSQL chooses its merge order from the memory actually available for tape buffers
(`tuplesort_merge_order`, read but not simulated here, since it depends on byte-level constants
internal to the implementation); the exact bytes this topic treats as "a budget of rows" are,
in a real executor, a budget in bytes with per-tuple overhead this topic's row-count model
leaves out. PostgreSQL's own partition count is capped between 4 and 1024 regardless of how
badly the table overflows; this topic's simulation hits that 1024 cap directly on its own
aggregation example, a real behavior, not a contrived one.

</section>

<section data-section="frontier">

## At the frontier

Chapter 15's own "External merge sort" topic (replacement selection, the classic pass-count
bound) is the textbook treatment this topic's production systems are a version of; it was
confirmed not live in the registry at build time, so this topic's run generation and merge are
its own code, written directly from PostgreSQL's source rather than linked to that topic.

</section>

<section data-section="questions">

## Questions worth sitting with

If PostgreSQL's hash-partitioned spill never sorts anything, and Spark's sort-based fallback
does, why would Spark choose the sort at all? What does a sort buy an engine that is willing to
pay for it, beyond correctness that hash partitioning already provides for free?

</section>

<section data-section="next">

## Next

A sort's spill path and a hash aggregation's sort fallback both end in the same step: merge
several sorted runs, one element at a time, with the next-smallest picked by a heap or a tree
of losers. That merge is not confined to operators. It runs inside LSM compaction and shuffle
reads, and a bounded copy of the same heap answers ORDER BY with a LIMIT. Heaps inside
compaction, shuffle and top-N, next.

</section>
