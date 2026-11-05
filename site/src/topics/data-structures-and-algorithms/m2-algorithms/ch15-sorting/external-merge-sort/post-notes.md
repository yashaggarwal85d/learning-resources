---
id: dsa.external-merge-sort
title: External merge sort
---

<section data-section="outcomes">

## After this topic you can

- Generate runs by sorting blocks and by replacement selection, and say why the latter
  averages 2M on random input and one run on sorted input.
- Compute the number of merge passes and total block transfers from N, M and B, and read
  a threshold in a table of M against passes.
- Say why a loser tree's ⌈lg k⌉ comparisons per item makes a large fan-in cheap in CPU and
  what limits it in I/O.
- Name the places a database or an LSM engine runs this exact mechanism and point to the
  Data Engineering reel for its engine-side detail.

</section>

<section data-section="internals">

## Into the internals

### Why replacement selection never does worse than the simple method

The simple method (sort a block of M, write it, repeat) always produces runs of exactly
M (except the last). Replacement selection's heap can only ever hold back a key for the
*next* run when the current run's own last-written key is already larger than it — on
sorted input that never happens, so the whole file becomes one run; on reverse-sorted
input it happens on every single key, so every run stops at exactly M, the same as the
simple method. Replacement selection's floor is the simple method's own result; its
ceiling, on random input, is twice that.

### Why the pass count is a logarithm, not a line

Each merge pass can reduce the run count by at most a factor of the fan-in, k ≈ M/B.
Reducing N/M runs to 1 run by repeatedly dividing by k takes ⌈log_k(N/M)⌉ steps — an
integer that only increases when N/M crosses a power of k, which is why halving M
(and so roughly halving k) usually changes nothing: the run count has to cross a much
larger threshold before one more pass is needed. This is the same step-function shape
Chapter 1's own I/O-cost arguments produce whenever a ratio, not a difference, drives
the count.

</section>

<section data-section="lab">

## In the lab

`examples.py` computes run counts for the simple method and simulates replacement
selection directly on random, sorted and reverse-sorted input, reproducing
`CHAPTER.md`'s own three planning figures (2.0 M average on random input, one run on
sorted input, 100 runs of 100 on reverse-sorted input). It computes the merge pass
count and block-transfer formula on the chapter's own running example (16 runs, fan-in
16,383, one pass, 1,048,576 transfers against a 262,144-transfer scan), a small
fully-worked instance (16 runs at fan-ins 2, 4 and 16), and a six-row table of M against
passes showing the threshold where the pass count actually changes. The multi-way merge
itself is not reimplemented: it names Chapter 6 topic 31's loser tree and its own
⌈lg k⌉-comparisons-per-item bound directly.

The syllabus's own second-half lab — sorting a real file at least ten times larger than
a memory limit the process enforces on itself, counting passes and bytes moved exactly,
and comparing run generation by block-sort against replacement selection — is a larger,
compiled or scripted exercise over an actual on-disk file, left as an exercise beyond
this topic's own `examples.py`: build it by writing the simple and replacement-selection
run generators over a file opened in fixed-size chunks, merging with a real k-way merge
(a Python `heapq.merge` or your own loser tree) at a fan-in bounded by `M // B - 1`, and
counting every block read and write as you go.

</section>

<section data-section="production">

## In production

DuckDB's own buffer manager spills by unloading blocks from memory to disk and
swizzling/unswizzling pointers to the heap blocks during the merge, as its 2021 post
describes; this topic does not open DuckDB's present-day sort implementation beyond
that post. PostgreSQL's `work_mem` setting is documented as the memory budget a sort
operation gets before writing temporary files to disk — the real-system analogue of
this topic's own M, with PostgreSQL's specific run-generation or merge algorithm left
unopened. The Data Engineering reel `de.external-merge-sort-k` (live on this site) is
the place this mechanism's engine-side detail — buffer sizing, ORDER BY spills,
sort-merge joins, LSM compaction, shuffle merges — is actually covered.

</section>

<section data-section="frontier">

## The frontier

The cache-oblivious and I/O-optimal permuting and sorting lower bounds (Chapter 31) and
the disk-specific buffering strategies named only in passing here — double buffering,
forecasting ahead of the merge's own read pointer — are both left for a later, deeper
pass; this topic's own scope is the single-disk pass-count and block-transfer argument.

</section>

<section data-section="questions">

## More questions

- Replacement selection's run length depends on how "random" the input really is. What
  happens to the average run length if the input is already partially sorted in blocks
  of size much smaller than M, rather than uniformly shuffled?
- The fan-in limit k ≤ M/B − 1 assumes one buffer per run plus one for output, all the
  same fixed size B. If buffers could be unequal sizes, matched to how fast each run is
  consumed, would that change the fan-in limit, the pass count, or neither?

</section>

<section data-section="next">

## Where this goes next

A file ten times the size of memory is sorted at the cost of a handful of passes over
the disk, and the price is worth paying because of what a sorted sequence makes cheap:
finding one key in a million takes about twenty steps if the keys are in order, and a
million if they are not. That search is binary search, one of the shortest algorithms in
the course and one of the easiest to get wrong, and the next chapter starts there.
Binary search invariants and boundaries, next.

</section>
