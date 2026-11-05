# OUTLINE — Hash tables inside hash joins

Chapter 37's first topic: the chapter reads eight textbook structures inside real production
systems. This one is the hash table inside a hash join, read from PostgreSQL's executor and
Spark's optimizer and sketch code.

## Storyboard (13 steps)

1. Hook: the shop's `customers`/`orders` hash join with a budget at one twentieth of the build
   side; predict batches, spilled fraction, bits-per-customer for the Bloom filter.
2. Two-column strip: the Chapter 3 hash table (chained, `NTUP_PER_BUCKET` sizing) on the left,
   the join's version (a memory box M around it) on the right.
3. Bucket and batch from one hash value: the low bits give the bucket, a rotate-right by
   `log2_nbuckets` then a mask gives the batch — two independent views of the same 32 bits.
4. Growth: the executor doubles the batch count when a batch outgrows M; measured on the shop
   instance (32 batches at the hook's budget).
5. Predict: the stop condition — what happens when a single customer is too frequent to split
   by hashing it further?
6. The one-key exception: PostgreSQL disables further doubling once a batch retains all or none
   of its tuples after a split (quoted from the header comment).
7. Spill, measured: the fraction of order rows that must go to a temporary file because their
   customer hashes to a batch other than the always-resident batch 0.
8. Skew table: a small number of the busiest customers get a dedicated, always-resident bucket,
   capped at 2% of the budget; measured fraction of orders it keeps off disk.
9. Spark's probe-side table: `LongToUnsafeRowMap`'s open addressing with quadratic probing and
   triangular numbers, contrasted with PostgreSQL's chaining — different families for different
   constraints, Chapter 3's mechanics not repeated.
10. Bloom-filter pushdown: Spark's runtime filter, application side and creation side named from
    the rule's own header comment.
11. The filter's arithmetic: Spark's default 8,388,608 bits for 1,000,000 expected items is 8.4
    bits per item; the optimal hash count formula gives six; the false-positive-rate formula
    from Chapter 12 predicts the rate a built filter actually measures.
12. Predict/contrast: Trino's dynamic filter, which degrades from exact distinct values to a
    coarser min/max range once the build side is too large — a different, lossier filter.
13. Recap and handoff to the sort path (topic 118).

## Outcomes (from CHAPTER.md, unchanged)

- Trace a hash join's build, probe and spill on a small dataset with a fixed budget M, and count
  the rows written to and read back from temporary files.
- Explain why one hash value is split into bucket bits and batch bits, why the batch count
  doubles, and why PostgreSQL stops doubling when a batch keeps all or none of its tuples.
- Compute a runtime Bloom filter's false-positive rate from Spark's default bits-per-item and
  say what it costs a probe side that is not selective.

## Concept ledger

Introduces: `hash-join-build-probe`, `hash-join-batch-spill`, `bloom-filter-pushdown`,
`join-skew-bucket`.
Uses (all confirmed live in the registry at build time): `hash-function`, `avalanche-property`,
`separate-chaining`, `bucket`, `load-factor`, `collision` (`dsa.hash-functions-design`,
`dsa.separate-chaining`), `open-addressing`, `quadratic-probing` (`dsa.linear-probing-open-addressing`),
`hash-table-resize` (`dsa.resizing-incremental-rehashing`), `cache-miss`, `tlb-reach`
(`dsa.measuring-memory-hierarchy`), `bloom-filter`, `bloom-false-positive-rate`
(`dsa.bloom-filters-false-positive`).
Declared, not yet live: Chapter 31 topic 104 "Partitioned hash joins: Grace and hybrid"
(`partitioned-hash-join`, `hybrid-hash-join`) — confirmed not in the registry at build time
(2026-11-05); named once in the reel as the algorithm this topic's production executor is a
version of, not built here.

## Changes from the chapter plan

1. **Spark version.** CHAPTER.md's planning-time read was Spark 4.2.0 documentation; the live
   `spark.apache.org/docs/latest` page at research time (2026-11-05) serves Spark 4.3.0. The
   three cited defaults (`expectedNumItems` 1,000,000; `numBits` 8,388,608;
   `applicationSideScanSizeThreshold` 10GB) are unchanged between the two, confirmed by reading
   the live page directly rather than assuming continuity.
2. **The shop instance's exact sizes are the builder's own choice**, as CHAPTER.md specifies
   ("Planning values (each builder computes and asserts its own)"): 4,000 customers, 80,000
   skewed orders, a budget of 200 rows (one twentieth of the build side, per the hook). These
   numbers are not from any source; they are chosen so a laptop-scale simulation reproduces the
   real algorithm's behavior (batch doubling, the skew cap) with numbers worth reporting on
   screen.
3. **The Bloom filter is tested at a scaled-down size** (100x smaller, same bits-per-item ratio
   and the same optimal hash count of six) so `examples.py` runs in milliseconds; the measured
   false-positive rate is checked against the formula's prediction at Spark's real, unscaled
   ratio, which is the number stated on screen.
4. **Trino's dynamic filter is named for contrast only**, per the chapter plan's own scope note;
   no claim is made about when Trino chooses one filter type over the other beyond the quoted
   threshold-based switch.
5. **The bridge was replaced with Chapter 36 topic 116's actual handoff, word for word**, as
   CHAPTER.md's "Assumption about Chapter 36" instructs, now that topic 116 is live: "That is
   the whole skill, and it is a habit more than a body of knowledge: read the size, read the
   operations, read the situation as a graph, match it to a shape and check what would break
   the match. ... The next chapter takes each structure you have met and shows what it becomes
   there. Hash tables inside hash joins, next." — unchanged in substance from the plan's
   provisional bridge, confirmed word for word against `registry.ts`.
6. **The skew capacity's four rows** come directly from `SKEW_HASH_MEM_PERCENT = 2` applied to
   the chosen budget of 200 rows (`200 * 2 // 100 = 4`), read literally as the source states it;
   PostgreSQL's real skew sizing also accounts for per-row byte overhead, which this topic's
   row-count model does not model, stated once in post-notes.
