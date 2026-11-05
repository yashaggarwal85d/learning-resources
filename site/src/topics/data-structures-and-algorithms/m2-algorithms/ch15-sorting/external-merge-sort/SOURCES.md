## Vitter — *Algorithms and Data Structures for External Memory* (Foundations and Trends in Theoretical Computer Science 2(4), 2008)

URL: https://www.ittc.ku.edu/~jsv/Papers/Vit.IO_book.pdf
Version: fetched 2026-11-05, the author's own posted PDF copy

> In actual implementations, we can use
> the "replacement selection" technique to get runs of 2M data items,
> on the average

> After the initial runs are formed, the merging phase begins, as shown
> in Figure 5.3 for the case D = 1. In each pass of the merging phase,
> we merge groups of R runs.

> At most R = Θ(m) runs can be merged at a time, and the resulting
> number of passes is O(logm n).

### Contents (item by item, this topic's scope)

- The replacement-selection claim this topic reproduces by simulation: expected run length about 2M on random input, read directly from the author's own book, not from Knuth (not opened this session — see Red team).
- The merge-pass-count formula (R runs merged per pass, R on the order of m = M/B, giving O(log_m n) = O(log_{M/B}(N/B)) passes), which this topic's own `examples.py` computes exactly for the chapter's running example and a small table of M against passes.
- This topic does not quote the book's own fully general multi-disk analysis (D > 1, the Gilbreath-principle striping); that machinery is named only, since the topic's own scope is the single-disk pass-count and I/O-cost argument.

## Kuiper — "Fastest Table Sort in the West – Redesigning DuckDB's Sort" (duckdb.org, 27 August 2021)

URL: https://duckdb.org/2021/08/27/external-sorting.html
Version: fetched 2026-11-05, the post as currently published

> K-way merge merges K lists into one sorted list in one pass, and is traditionally used for external sorting (sorting more data than fits in memory) because it minimizes I/O.

> Cascade merge merges two lists of sorted data at a time until only one sorted list remains, and is used for in-memory sorting because it is more efficient than K-way merge.

> The buffer manager can unload blocks from memory to disk.

> This technique is called "pointer swizzling".

> Besides having the buffer manager load/unload blocks, the only difference between in-memory and external sorting is that we swizzle/unswizzle pointers to the heap blocks, and copy data from the heap blocks during merge sort.

> A simple trick to reduce I/O is zig-zagging through the pairs of blocks to merge in the cascaded merge sort.

### Contents (item by item, this topic's scope)

- The post's own stated reason K-way merge is the external-sorting choice (it minimizes I/O) while cascade merge is the in-memory choice — the contrast this topic uses to name what DuckDB does differently from the fan-in-limited external merge this topic builds.
- DuckDB's own description of its buffer manager's unload-to-disk behavior and pointer swizzling (named only, as an example of a system that spills without a dedicated external-sort code path, not reimplemented).
- The zig-zagging optimization is named only, as DuckDB's own in-memory cascade-merge-specific trick, not part of this topic's own external k-way merge.

## PostgreSQL 18 Documentation — §19.4 "Resource Consumption"

URL: https://www.postgresql.org/docs/current/runtime-config-resource.html
Version: fetched 2026-11-05, the current (18) documentation

> Sets the base maximum amount of memory to be used by a query operation (such as a sort or hash table) before writing to temporary disk files.

> Sort operations are used for ORDER BY, DISTINCT, and merge joins.

### Contents (item by item, this topic's scope)

- The `work_mem` setting's own documented role: the memory budget a sort operation (this chapter's own M) gets before PostgreSQL starts writing runs to disk, named as the real-system analogue of the chapter's own M parameter, not as a claim about PostgreSQL's specific run-generation or merge algorithm, which this topic does not open further than this one setting's documentation.

### Reused from Chapter 6 topic 31's own SOURCES.md (`tournament-loser-trees`)

Topic 31's own `SOURCES.md` quotes Wikipedia's "K-way merge algorithm" page — *"k-way merges are used in external sorting procedures. External sorting algorithms are a class of sorting algorithms that can handle massive amounts of data."* and *"A multiway merge allows for the files outside of memory to be merged in fewer passes than in a binary merge. If there are 6 runs that need be merged then a binary merge would need to take 3 merge passes, as opposed to a 6-way merge's single merge pass."* Both quotes are copied here only as a pointer (not re-fetched or re-verified against the live page this session, per `CHAPTER.md`'s "reuse its quotes only if cited" instruction), since the loser tree's own Theta(log k) comparisons per output item and its own real-world destination (external sorting's merge phase) are topic 31's own facts, built there; this topic only points to them (`uses: loser-tree, k-way-merge-bound`) and does not rebuild the structure, using it as the kernel of this topic's own merge phase.

### Red team

1. **Vitter's own book PDF drops the "much greater than" symbol (M ≫ B) entirely during text extraction**, leaving "when M\nB [136, 220]" with nothing between them. Worked around by quoting only up to "on the average," before the dropped symbol, and stating the condition (M much greater than B) in this topic's own prose rather than inside the quote.
2. **Knuth, TAOCP vol. 3 section 5.4.1 (the "snowplow" name for replacement selection, and its own derivation of the 2M expected run length) is not opened this session**, per `CHAPTER.md`'s own "not opened" framing. This topic cites Vitter's own book for the 2M claim instead (an independently fetchable, open-access primary source making the identical claim), and names "snowplow" only as the common nickname, without attributing its own derivation to a source this topic opened.
3. **Aggarwal & Vitter's original 1988 CACM paper is not independently opened this session.** Its own sorting bound is cited only by reference to Chapter 1 topic 8's own treatment of the same bound (`io-sort-bound`), per `CHAPTER.md`'s own instruction to reuse rather than re-derive; Chapter 1 topic 8 itself names the paper in its own `references.md` but does not carry quote blocks to copy, so this topic's own citation of the bound is to the paper's bibliographic details only, not a verbatim quote.
4. **Graefe, "Implementing sorting in database systems" (2006), is named only**, per `CHAPTER.md`'s own instruction; no claim in this topic rests on it.
5. **This topic does not independently verify what any specific named engine (Spark, an LSM compactor) does with multi-way merges beyond the one-sentence pointers `CHAPTER.md` itself allows**, and defers the engine-side detail entirely to the Data Engineering reel `de.external-merge-sort-k`, which is live on this site and cited by name, not re-opened or re-quoted here.
6. **Sedgewick & Wayne's *Algorithms* §2.2 and the CLRS external-sorting problem are not opened this session**, per `CHAPTER.md`'s own "to verify" framing; no claim in this topic rests on either.
