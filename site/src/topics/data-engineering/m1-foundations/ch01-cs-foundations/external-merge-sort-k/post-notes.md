---
id: de.external-merge-sort-k
title: External merge sort and k-way merge
---

<section data-section="outcomes">

## After this topic you can

- Predict a sort's run count and pass count from the data size, the memory budget and the block size, and choose a fan-in that keeps it to one merge pass.
- Explain why replacement selection makes runs about twice as long as a memory load, and why engines still prefer quicksort for run generation.
- Trace a heap-driven k-way merge, and say why it needs only one buffer per run plus one for the output.
- Recognise the same merge behind an `ORDER BY` spill, a sort-merge join and an LSM compaction.
- Find the key cardinality where sort-based aggregation beats a spilling hash aggregation, and name the cases where sorting wins for free.

</section>

<section data-section="internals">

## Into the internals

External merge sort is what every sort falls back to when the data does not fit in memory. The I/O cost model already counted its price: a sort of N items with M items of memory and B items per block costs **(N/B) · log<sub>M/B</sub>(N/B)** block transfers, and that logarithm is a **pass count**, not a comparison count. This topic opens that formula up. A sort runs in two phases, **run generation** then **merging**, and both are governed by one budget: how much memory you have, split between how long you make each run and how many runs you merge at once.

Keep the running example in view. The nightly job sorts **1 TiB** of `order_events` with **16 GiB** of memory in **1 MiB** blocks. We will see why that is 64 runs, a fan-in of up to 16,383, and exactly two passes, and what has to change before a third pass appears.

### Phase one: run generation

The first pass turns an unsorted file into a handful of sorted **runs** on disk. There are two classic ways to make them, and they differ only in how long each run comes out.

**Load-sort-spill (quicksort).** Read until memory is full, sort that memory-load in place, write it out as one run, repeat. Each run is about **M** items long, so the file becomes about **N/M** runs. For the example, 1 TiB / 16 GiB = **64 runs**. This is what PostgreSQL does today: its sort module absorbs tuples into an array until it exceeds `work_mem`, quicksorts the array, and dumps it as a run (`tuplesort.c`). It is simple, cache-friendly, and trivially parallel: each worker sorts its own morsels, as DuckDB's two-phase sort does with a radix sort over normalized keys.

**Replacement selection (a heap).** Keep a min-heap of M items. Repeatedly pop the smallest and write it to the current run; then read one new item and push it. If the new item is **larger** than the one you just wrote, it can still belong to this run, so push it normally; if it is **smaller**, it is frozen out and held for the *next* run. On random input this "snowplow" keeps picking up items that still fit the current run, and the expected run length is **about 2M**, twice a memory load (Knuth's analysis, TAOCP Vol. 3 §5.4.1). On already-sorted input it produces **a single run** the length of the whole file. Fewer, longer runs mean fewer runs to merge, which can save a pass.

So why did engines abandon it? Because the cost model counts transfers, not comparisons, and on modern hardware the *comparisons* are what hurt. Replacement selection does a heap sift (log<sub>2</sub> M comparisons, scattered through memory) for every single item, where quicksort does a tight, cache-resident partition. PostgreSQL used replacement selection "in the form of a priority tree implemented as a heap" until **version 9.6**, which switched to quicksort for run generation precisely because "the new approach makes better use of the CPU cache"; the current source comment still records the history: "but now we always use quicksort for run generation" (`tuplesort.c`). The longer runs rarely saved a pass, and the heap's random memory access was slower than a cache-friendly quicksort plus one more cheap merge. Larson's 2003 revisiting of run formation makes the same point for cache-sized runs.

| Run generation | Run length (random input) | Runs for 1 TiB / 16 GiB | Per-item work | Used by |
|---|---|---|---|---|
| Load-sort-spill (quicksort) | ≈ M | ≈ 64 | one partition step, cache-local | PostgreSQL ≥ 9.6, DuckDB |
| Replacement selection (heap) | ≈ 2M | ≈ 32 | one heap sift, log<sub>2</sub> M, scattered | PostgreSQL < 9.6; classic tape sorts |

The key point for prediction: with quicksort, **runs ≈ N/M**; with replacement selection, **runs ≈ N/2M**. Either way the merge phase takes over from there.

### Phase two: the k-way merge

Now there are k sorted runs on disk and you want one sorted output. Merging two at a time (a **cascade merge**) would read and write the whole dataset ⌈log<sub>2</sub> k⌉ times. The external sort instead merges **k at once** in a single pass. DuckDB states the rule plainly: a k-way merge "merges K lists into one sorted list in one pass, and is traditionally used for external sorting … because it minimizes I/O", whereas cascade merge is kept for the in-memory case where I/O is not the cost.

The mechanism is a **min-heap** (or a loser tree) holding the current front item of each of the k runs:

1. Read one block from each run into its input buffer; push each run's first item onto the heap, tagged with its run.
2. Pop the smallest item and append it to the output. Advance that run by one item; if its buffer is empty, read its next block; push the new front item.
3. Repeat until the heap is empty.

Each output item costs one pop and one push, so **about log<sub>2</sub> k comparisons per item** — the whole merge is Θ(N log<sub>2</sub> k) comparisons but only **2N/B transfers**, one read and one write of every block. PostgreSQL implements exactly this: "we use a heap containing just the frontmost tuple from each source run; we repeatedly output the smallest tuple and replace it with the next tuple from its source tape" (`tuplesort.c`). A **loser tree** is the cache-friendlier variant Knuth describes, doing one comparison per level instead of two.

The memory cost of the merge is tiny — "only M tuples for an M-way merge" of heap entries — which is why Python's `heapq.merge(*iterables)` can merge any number of sorted iterables in **bounded memory**: it holds one item per iterable and returns an *iterator*, so paired with the `generators` from the Python refresher it streams a merge of files far larger than RAM without ever materialising them. That generator-of-generators is external merge sort's merge phase in three lines.

One refinement saves a whole pass: if the caller only wants to stream the result (no random access), the **final merge runs on the fly** as the consumer pulls tuples, so the last run is never written out and read back (`tuplesort.c`). A sort feeding an operator above it pays for the final merge in CPU, not I/O.

### Fan-in, passes and the memory budget

The fan-in — how many runs you merge at once — is set by memory, because each input run needs its own read buffer and the output needs one too. With B items per block and one block per buffer, **fan-in = M/B − 1**: the held cost model's 16,384 buffers of 1 MiB minus one for output gives **16,383**. The pass count is then

> **passes = 1 + ⌈log<sub>fan-in</sub>(runs)⌉**

one pass to make the runs, then enough merge passes to fold `runs` of them down to one at `fan-in` per pass. This is the lab's prediction formula and the same quantity as topic 14's log<sub>M/B</sub>(N/B).

For the example: run generation writes **64 runs**; the fan-in is **16,383**, far more than 64, so **one merge pass** finishes it. **Two passes total**, 4 TiB of I/O (read and write the terabyte twice). Merging two at a time instead would need ⌈log<sub>2</sub> 64⌉ = 6 merge passes, seven in total.

A third pass only appears when the runs outnumber what a single pass can fold, i.e. when **runs > fan-in**, and a fourth when runs > fan-in². The example has enormous headroom:

| Runs after phase one | Fan-in | Merge passes | Total passes |
|---|---|---|---|
| 64 | 16,383 | 1 | 2 |
| 16,383 | 16,383 | 1 | 2 |
| 16,384 | 16,383 | 2 | 3 |
| up to 16,383² ≈ 2.7×10⁸ | 16,383 | 2 | 3 |

So two passes is remarkably robust: the terabyte would need its memory cut until the fan-in dropped below 64, or its data grown past 16,383 runs (about 256 TiB at this run size), before a third pass arrives.

**The buffer tension.** More fan-in means fewer passes, but splitting a fixed memory budget across more runs makes each read buffer smaller, and small buffers mean the merge seeks all over the temp file instead of streaming. PostgreSQL spends part of `work_mem` **pre-reading** about `work_mem / M` bytes from each tape in turn, so reads stay sequential; without it "a straightforward merge pass … ends up doing a lot of waiting for disk seeks" (`tuplesort.c`). This is **read-ahead with double buffering**: refill a run's buffer while the heap drains the previous one. The device matters here — the gap between sequential and random throughput (`storage-devices`) is exactly what a too-small buffer throws away.

Because of that tension, real engines **cap the fan-in** well below M/B. PostgreSQL uses `MINORDER` = 6 and `MAXORDER` = 500: even with gigabytes of memory it merges at most 500 tapes, because "high order merges are quite slow due to CPU cache effects; it can be faster to pay the I/O cost of a multi-pass merge than to perform a single merge pass across many hundreds of tapes" (`tuplesort.c`). The theoretical fan-in of 16,383 is an upper bound the model counts; a real sort trades it for cache locality and may choose two passes on purpose.

### The same merge, everywhere

Once you can see a k-way merge, it turns up all over a data system:

- **`ORDER BY` and `DISTINCT` spills.** When a PostgreSQL sort exceeds `work_mem` (default **4 MB**) it writes sorted runs to temporary files and merges them; `EXPLAIN ANALYZE` shows `Sort Method: external merge` with the disk volume used. The sort node has not changed algorithm — it has fallen through to exactly this.
- **Sort-merge join.** Sort both inputs on the join key, then merge them with a single synchronized pass: advance whichever side is smaller, emit matches where keys are equal. The merge *is* the join. It is the spill-friendly default for large–large equi-joins because neither side has to fit in memory, unlike a hash join's build side.
- **LSM-tree compaction.** An LSM-tree (`lsm-tree` from the index topic) is a stack of sorted runs. Compaction k-way-merges several runs into one, dropping superseded and deleted keys as it goes — the write-amplifying step that keeps reads fast is a k-way merge of sorted runs.
- **Shuffle merges.** A distributed sort or sort-merge join merges each reducer's sorted spill files the same way. Named here, priced in Chapter 7.

### Sort-based vs hash-based aggregation

The chapter lab closes on a choice. To compute `GROUP BY customer_id`, you can **hash-aggregate** (one hash-table slot per group, O(1) per row while the table fits, spilling by partitioning when it does not — the `hash-aggregation` and `hash-spill` of the previous topic) or **sort-aggregate** (sort the rows by key, then sweep once; equal keys are now adjacent, so a group closes the moment the key changes, in O(1) extra memory).

The crossover turns on the **number of distinct groups** (cardinality), not the number of rows:

- **Low cardinality** — few groups, the hash table fits in memory. Hashing wins: O(N) with no sort, no spill.
- **High cardinality** — millions of distinct keys, the hash table spills. Now hashing pays to partition and recurse, and sort-aggregation becomes competitive, because the sort's pass count grows only as log<sub>M/B</sub>, while a spilling hash must still move every row through partitions. The two meet where the hash table stops fitting; past it, sorting's bounded pass count pulls ahead.
- **Sorting wins for free** when the output must be ordered anyway (`GROUP BY … ORDER BY`), when the input already arrives sorted (a clustered index, or an upstream merge), or when the aggregate needs ordered input (median, `DISTINCT`-within-group). The lab measures exactly where the lines cross for `order_events`.

</section>

<section data-section="lab">

## Build, break, measure

This topic hosts the §1.3 external-merge-sort lab and its closing crossover against the spilling hash aggregation from the hash-tables topic.

### Lab · External merge sort against the prediction

Implement external merge sort over a file **ten times larger than an enforced memory limit** (run it in a container or a cgroup with that limit, so the kernel cannot quietly cache the whole file). The skeleton is small:

1. **Run generation.** Read up to the memory limit, sort in memory, write a sorted run to a temp file. Repeat to the end of input. Count the runs.
2. **Merge.** `heapq.merge()` the run files — opened as generators that yield one record at a time — into the output. If `runs > fan-in`, merge in groups of `fan-in` and recurse, so you can force a multi-pass merge.

Vary the **run size** (the memory limit) and the **fan-in**, and plot measured **passes** and **wall-clock** against the prediction:

```
passes = 1 + ceil(log(runs) / log(fan_in))      # runs = ceil(file_size / run_size)
```

What you should see (shapes, not promised constants — measure in build):

- Passes fall in **steps**, not smoothly: doubling the fan-in does nothing until it crosses the boundary where one fewer pass is possible. The staircase matches `ceil(log_fan_in(runs))`.
- Wall-clock tracks **2 × passes × file_size / sequential_bandwidth** as long as buffers stay large enough to read sequentially. Shrink the per-run buffer (raise the fan-in with a fixed budget) and wall-clock rises *above* the prediction as reads turn random — the buffer tension, made visible.

### Break it

- **Starve the buffers.** Set the fan-in so high that each read buffer is a few kilobytes. The pass count drops by one, but wall-clock gets *worse*: you traded sequential reads for seeks. This is why PostgreSQL caps the merge order at 500.
- **Feed it sorted input** with a replacement-selection run generator and watch it emit a single run — the whole sort collapses to one pass. Feed it reverse-sorted input and watch runs fall back to about M.

### The crossover: sort vs hash aggregation

Run the spilling hash aggregation from the hash-tables topic and this sort-based aggregation over `order_events` across a **sweep of key cardinalities** under the same memory cap. Plot wall-clock against distinct-key count. Find the cardinality where the hash table stops fitting and sort-based aggregation takes the lead; confirm that below it the hash wins and above it the sort does, and that an added `ORDER BY` flips the choice to sort at any cardinality.

</section>

<section data-section="production">

## In production: a review checklist

- **Read the spill from the plan.** In PostgreSQL, `EXPLAIN (ANALYZE, BUFFERS)` prints `Sort Method: external merge  Disk: NN kB` when a sort spilled, or `quicksort  Memory: NN kB` when it fit. A spill is not a bug, but if a sort you expected to fit is spilling, `work_mem` (default 4 MB) is too low for it — raise it for that query, not globally, since every concurrent sort and hash may claim it.
- **Count passes before blaming the disk.** At realistic sizes a sort is **two passes**, occasionally three. If a job seems to re-read its data many times, suspect a fan-in collapse (tiny memory, or a per-run buffer so small the engine fell to the minimum merge order) rather than the sort algorithm.
- **Prefer more buffer over more fan-in.** Fewer, larger read buffers that stream sequentially usually beat a higher fan-in that seeks. Trust the engine's cap (PostgreSQL's 500) before overriding it; the I/O-model fan-in of M/B−1 is an upper bound, not a target.
- **A sort gives order for free; exploit it.** If a query sorts for a join or an aggregation and also needs `ORDER BY`, or if an index already delivers the key order, a sort-merge join or sort aggregation reuses that order and skips a hash build. Reach for sort-based plans when inputs are large, already sorted, or must come out ordered.
- **Replacement selection is a historical default, not a modern one.** If you are implementing a sort, start with quicksort runs plus a k-way merge; only consider replacement selection where longer runs demonstrably save a pass and the heap's random access is not the bottleneck.
- **The merge is everywhere — tune it once.** Spilling `ORDER BY`, sort-merge joins, LSM compaction and shuffle merges all pay the same per-pass I/O. The lever is always the same: enough memory to merge in one pass, with buffers large enough to read each run sequentially.

</section>

<section data-section="next">

## Where this goes next

Sorted, joined, aggregated: a pipeline is many such jobs in order. Next refresher: the graph algorithms that schedule them.

</section>
