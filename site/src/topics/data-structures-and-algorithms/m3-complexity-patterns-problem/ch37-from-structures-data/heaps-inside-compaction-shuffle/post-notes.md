<section data-section="outcomes">

## What this topic leaves you able to do

Point at the heap or tree of losers inside a compaction, a sort spill and a shuffle read, and say
what its comparator orders by and what it does on ties; explain why a bounded heap keeps the
worst kept element at its root, and compute the comparisons of top-N against a full sort for a
given n and N; state the comparisons per output of a heap-based merge and of a tree of losers for
the same fan-in, and say why an engine might still choose the heap.

</section>

<section data-section="internals">

## Into the internals

### One heap, two comparators

A merging iterator's correctness never depends on whether it is called with a plain key
comparator or an internal-key comparator that also breaks ties by sequence number. The heap
itself (push, pop, sift) does not change at all; only what counts as "smaller" changes. That is
why RocksDB and Pebble, built independently, converge on the identical shape: the merge logic is
generic over the comparator, and the database-specific behavior (newest version wins) lives
entirely inside the comparator, not inside the heap.

### Why a drained source is dangerous, and two different fixes

A k-way merge's heap holds exactly one entry per still-live source. The moment a source is
drained, the merge must stop asking it for more without ever pushing a sentinel or an empty
record onto the heap — `UnsafeSorterSpillMerger`'s own comment names the bug directly: pushing an
empty reader produces an extra empty record in the output. Pebble and RocksDB handle it by
removing the exhausted iterator from the heap on the next pop; Spark's comment documents the same
discipline at construction time, only adding a reader once it is confirmed non-empty.

### A bounded heap is a min-heap wearing a different question

Nothing about `heapq`'s machinery changes between "give me the smallest" and "tell me if this
beats my current worst." The second question is answered by comparing against the root and
discarding on a loss, which costs one comparison; a win costs the ordinary `heapreplace`, O(log N).
PostgreSQL's own comment calls this out explicitly: the sort direction is reversed purely so the
value the heap would ordinarily keep is the one it is cheapest to throw away.

</section>

<section data-section="lab">

## The lab

`examples.py`'s merging iterator reproduces the LSM comparator exactly (user key ascending, then
sequence number descending) over four small "sstables," one carrying a tombstone that is newer
than the live version of the same key in a different file; the compacted result drops that key
entirely, as `CompactionIterator` does. The bounded-heap section measures, not asserts, that a
full sort costs on the order of three times more comparisons than a bounded heap of ten at ten
thousand rows, and that the expected number of heap replacements for a random arrival order,
k·(Hₙ − H_k), matches a four-hundred-trial Monte Carlo average at n=2000, k=10 to within the
simulation's own noise, before it is trusted at n=400,000,000.

</section>

<section data-section="production">

## In production

Real engines complicate every piece of this further: RocksDB's compaction also merges range
tombstones as separate start/end keys inside the same heap (not built here, since it changes the
heap's entries, not its kernel); Spark picks between `UnsafeSorterSpillMerger`'s record-level
merge and `ExternalSorter`'s key-level merge depending on which code path produced the spill files
in the first place; and PostgreSQL's real switch into a bounded heapsort also accounts for actual
memory used, not only tuple count, which this topic's row-count model leaves to the source.

</section>

<section data-section="frontier">

## At the frontier

Chapter 6's own lab already answered "why not always use the loser tree, since it compares less":
measured at a fan-in of eight, a loser tree costs exactly `log2(8)` comparisons per output,
`3.00`, where a binary heap costs `4.35`, a `1.45×` difference. Three of the four engines read in
this topic (Pebble, RocksDB, both of Spark's merges) still choose a heap. The heap's real
advantage the comparison count does not show: it adapts without a rebuild when a source is added
or removed mid-merge, where a loser tree's fixed leaf layout (this topic's own twelve-stream
example) is built once for a known stream count.

</section>

<section data-section="questions">

## Questions worth sitting with

The replacement-count formula, k·(Hₙ − H_k), assumed the rows arrive in a uniformly random order.
A real top-N query's rows rarely do — a time-ordered log, for instance, often trends upward. What
would you expect the replacement count to do if the stream were instead sorted in increasing
order before it reached the heap, and why?

</section>

<section data-section="next">

## Next

A heap picks the next ready element among streams. Turn the streams into tasks and the sorted
order into a dependency order, and the same structure becomes a scheduler: a ready queue ordered
by priority, fed by a topological order. Topological sort inside schedulers, next.

</section>
