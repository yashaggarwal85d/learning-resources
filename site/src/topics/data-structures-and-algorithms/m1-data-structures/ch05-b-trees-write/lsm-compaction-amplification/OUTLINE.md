# Outline — LSM compaction and amplification (topic 29, dsa.lsm-compaction-amplification)

## Learning outcomes

- Explain leveled, tiered and hybrid compaction and the read/write-amplification trade each one makes.
- Define read, write and space amplification precisely and state the RUM trade-off's own claim.
- Name Monkey's per-level filter-sizing result and Dostoevsky's lazy-leveling result, and what workload assumption each depends on.

## Engagement arc

- **Hook** (step 1): topic 28's own handoff — every flushed run is one more a read must check, and one more copy of a key compaction will have to rewrite. This topic closes the chapter on what that cleanup actually costs.
- **Predict 1** (step 2, "CompactionPredict"): what should a real system do about runs piling up?
- **Predict 2** (step 6, "TradeoffPredict"): can any one compaction policy win on read, write, and space amplification all at once?
- **Surprising number**: the chapter's own `examples.py` measures a real leveled-vs-tiered amplification gap (not assumed from the papers' numbers) on the identical compaction workload.
- **3 takeaways** (steps 4, 7, 9).
- **Recap** (step 10, "ProveIt"): the measured amplification triangle plus the chapter's own closing line on the RUM trade-off.

## 10-step reel storyboard

1. **Opening.** *Title:* "Flushing a full memtable to its own run solves the write problem, but only by deferring it: every run flushed is one more run every read has to check, and one more copy of every key compaction will eventually have to rewrite." *Body:* "This topic is that deferred cost, paid out: what compaction actually does about the runs piling up, and what it costs to do it." *Visual:* the stacked-runs picture topic 28 ended on, now drawn taller — four, five, six sealed runs stacked below the memtable, newest on top.

2. **CompactionPredict.** *Title:* "A read already has to check every one of these runs, oldest to newest. What should a real system do about the runs piling up?" *Predict options:* (a) "Nothing — more runs just means more disk, which is cheap" (b) "Merge every run into one single run on every flush" (c) "Merge some runs together sometimes, trading some I/O now for less I/O per read later" (correct) (d) "Delete the oldest runs once there are too many." *Visual:* the same stack, with a question mark over it.

3. **LeveledReveal.** *Title:* "One answer: leveled compaction. Each level holds one non-overlapping sorted run with its own size target; once a level grows past its target, the run merges down into the next level, rewriting every key it touches." *Body:* "A leveled compaction keeps very few runs at any level — a read checks at most one run per level — but a key that lands in level one can be rewritten again at every level it passes through on the way down." *Visual:* a level-by-level column, a small run merging down into a bigger one, shaded to show it getting rewritten.

4. **TieredReveal.** *Title:* "A different answer: tiered compaction. Several runs of similar size accumulate at a level; only once enough of them pile up are they all merged together into one wider run one level down." *Body:* "A tiered compaction rewrites each key far less often — merges are rarer — but a read now has to check every one of the accumulated runs at a level, not just one." *Visual:* several same-sized runs sitting side by side, then sweeping together into one wider run.
   *Takeaway 1 (step 4):* "Leveled rewrites a key more often to keep a read's run count low. Tiered does the reverse."

5. **AmplificationDefine.** *Title:* "Three numbers measure what either policy actually costs: write amplification, extra bytes written beyond the one logical write; read amplification, extra runs a read checks beyond the one it needs; space amplification, extra on-disk bytes beyond the live data's own size." *Body:* "Every compaction policy is a choice about which of these three to pay down and which to let grow." *Visual:* three bars, unlabeled, waiting to be filled by the two policies being compared.

6. **TradeoffPredict.** *Title:* "Leveled keeps read amplification and space amplification low. Tiered keeps write amplification low. Can one policy win on all three at once?" *Predict options:* (a) "Yes — a well-tuned hybrid wins on all three" (b) "No — minimizing any two forces the third up" (correct) (c) "Yes, but only at small data sizes" (d) "No policy has ever tried." *Visual:* the three bars from step 5, now with sliders that move together.

7. **TradeoffReveal.** *Title:* "Leveled minimizes space amplification at the cost of read and write amplification. Tiered minimizes write amplification at the cost of read and space amplification. A hybrid, tiered at the smaller levels and leveled at the larger ones, lands between both on the axes it mixes — it does not escape the trade, it relocates it." *Body:* "No arrangement of the same mechanism — merge now, or merge later — makes all three numbers small together." *Visual:* the three-bar chart filled in for leveled, tiered, and hybrid side by side.
   *Takeaway 2 (step 7):* "A hybrid compaction policy is a different point on the same trade-off, not an escape from it."

8. **MonkeyReveal.** *Title:* "One piece of this cost is tunable independently of the merge policy itself: the Bloom filter at every level. Most systems give every level's filter the same false-positive rate. Monkey's result: giving a smaller level a tighter filter, and a bigger level a looser one, lowers the total read cost for the same total memory." *Body:* "The insight is that a lookup's worst-case cost is the sum of every level's false-positive rate — so memory is best spent where tightening a filter buys back the most." *Visual:* a flat row of equal-sized filter bars in cinnamon beside a shrinking-then-growing row of filter bars in latte, same total area.

9. **DostoevskyReveal.** *Title:* "Dostoevsky goes further: it treats leveled and tiered as two ends of one spectrum, and picks a point on it per workload, merging only at the largest level by default and merging more only where a workload's own read-cost and update-cost demands justify it." *Body:* "There is still no setting that minimizes read, write, and space amplification together — Dostoevsky just finds the best available point for a given workload, under a budget on how much space it's allowed to waste." *Visual:* the leveled-tiered spectrum from step 7, with a marker sliding to the point a stated workload calls for.
   *Takeaway 3 (step 9):* "Every write-optimized design in this chapter trades read, write and space amplification against each other — the RUM trade-off — and no policy, however tuned, minimizes all three at once."

10. **ProveIt.** *Title:* "Prove it." *Body:* "Measured, not assumed: write, read and space amplification on one real compaction run, leveled against tiered on the identical key set and update pattern, and the chapter's own closing line: every structure in Chapter 5 optimized where data physically sits to make one block of I/O count for as much work as possible." *Visual:* the three-bar amplification chart from step 7, now populated with `examples.py`'s own measured numbers, plus the RUM triangle shape.

## Narrator's line of thought (one bullet per step)

1. We just spent a whole topic building the thing that makes more runs. Now we pay for that.
2. Before I show you what a real system does, guess: what's the actual move here?
3. Leveled's whole bet is keeping a level small and non-overlapping, so a read almost never has to search inside more than one run per level.
4. Tiered's bet is the opposite: let runs sit, don't touch a key more than you have to, and pay for that laziness on the read side instead.
5. These three words, write/read/space amplification, are doing real work: they're the only honest way to compare what leveled and tiered are each buying and selling.
6. Here's the trap: it's tempting to think a clever-enough hybrid escapes the trade. Guess before I show you why it can't.
7. A hybrid is still built from the same two moves, merge-now or merge-later, just applied selectively — it inherits both their costs in proportion, it doesn't cancel either.
8. Monkey isn't a new compaction policy at all — it's a separate knob, filter memory, that the field had been turning the same way at every level for no good reason.
9. Dostoevsky's real contribution isn't a new idea, it's doing the picking automatically, per workload, inside a design space Lazy Leveling first opened up.
10. Here's what's actually measured, not claimed from a paper's own numbers: this chapter's own leveled and tiered runs, on the same inserts and the same updates, tell you what each one really costs.

## Post-notes headings

- **Internals**: the original 1996 LSM-tree paper (already named in topic 28) is the ancestor every compaction policy here builds on; the RUM conjecture's own three-letter overheads (read, update, memory) are the general case this topic's read/write/space amplification numbers instantiate for compaction specifically.
- **Lab**: `examples.py`'s own leveled-vs-tiered measurement on one real compaction workload.
- **Production**: RocksDB's own Level Compaction (tiered+leveled) and Universal Compaction (tiered) as the two production implementations of the policies this topic names.
- **Frontier**: Monkey's per-level filter result and Dostoevsky's Fluid LSM-tree/lazy leveling, both named in the reel itself rather than deferred — the frontier section instead names RocksDB's own further per-level compaction-priority tuning options in passing.
- **Where this goes next**: the chapter's own closing handoff to Chapter 6 (binary heaps).

## Examples-to-execute list

1. Build a small LSM structure (reusing topic 28's WAL/memtable/SSTable shape) that can run either leveled or tiered compaction over a sequence of inserts and updates to the same key range.
2. Drive both policies over the identical workload (same keys, same update pattern, same total data volume) and measure, for each: write amplification (total bytes written to disk by compaction and flushes, divided by the logical bytes written by the application), read amplification (average number of runs a point lookup must open), and space amplification (total on-disk bytes divided by the live, non-obsolete data's own bytes), using the size-amplification-ratio-style formula from the RocksDB Universal Compaction source.
3. Confirm leveled's measured space amplification is lower than tiered's, and tiered's measured write amplification is lower than leveled's, on the identical workload — the real, asserted contrast, not assumed from the papers' own numbers.
4. Simulate Monkey's per-level filter-sizing insight directly: build two sets of Bloom filters over the same multi-level run sizes, one with a uniform false-positive rate and one with Monkey's proportional-to-run-size rates at the same total memory budget, and measure the summed false-positive rate (a proxy for worst-case lookup cost) for each.
5. Assert that no single measured policy (leveled, tiered) has the lowest value on all three of write/read/space amplification simultaneously — the chapter's own closing claim, demonstrated on real numbers, not only quoted from the RUM paper.

## Bridge (topic 28's own handoff, quoted word for word)

"Flushing a full memtable to its own run solves the write problem, but only by deferring it: every run flushed is one more run every read has to check, and one more copy of every key compaction will eventually have to rewrite. Compaction and amplification, next: what it costs to clean this up, and why no policy makes that cost disappear."

## Handoff (this topic's own, quoted word for word from `CHAPTER.md`)

"Every structure in this chapter optimized where data physically sits — on a page, in a run, across a level — to make a block of I/O count for as much work as possible. The next chapter asks a narrower question, answered the same way regardless of where anything sits: of everything not yet processed, which one is smallest, right now. Binary heaps, next."

## Concept ledger

- **Introduces:** `compaction-policy`, `read-write-space-amplification`, `rum-tradeoff`, `per-level-filter-sizing`.
- **Uses:** `sstable`, `bloom-filter-pruning`, `tombstone` (topic 28).
- **Declared:** `sstable` (topic 28, restated here as the unit compaction merges and rewrites).

## Claims list (claim → source)

1. Leveled compaction merges `Ln-1` into `Ln`, each level a non-overlapping sorted run with an exponentially increasing target size → RocksDB Compaction wiki + RocksDB Leveled Compaction wiki.
2. Tiered compaction waits for several similar-sized runs and merges them together once accumulated → RocksDB Compaction wiki + RocksDB Universal Compaction wiki.
3. Leveled minimizes space amplification at the cost of read and write amplification; tiered minimizes write amplification at the cost of read and space amplification; a hybrid lands between both on the axes it mixes → RocksDB Compaction wiki.
4. A size-amplification-ratio formula (sum of non-largest-run sizes over the largest run's size) → RocksDB Universal Compaction wiki.
5. Monkey's own diagnosis: a uniform per-level Bloom-filter false-positive rate is suboptimal because worst-case lookup cost is proportional to the sum of all levels' false-positive rates → Monkey paper (SIGMOD 2017).
6. Monkey's own fix: size each level's filter false-positive rate proportional to that level's run size → Monkey paper.
7. Dostoevsky's Lazy Leveling: merge only at the largest level, leaving smaller levels tiered, improving update cost while holding point-lookup, range-lookup, and space-amplification bounds → Dostoevsky paper (SIGMOD 2018).
8. Dostoevsky navigates the resulting tiered-to-leveled spectrum per workload, under an explicit space-amplification constraint → Dostoevsky paper.
9. The RUM conjecture: an access method that bounds two of read/update/memory overheads sets a hard lower bound on the third → RUM conjecture paper (EDBT 2016).

## Claims not made

- The RUM conjecture paper's own proof/model (the lower-bound derivation across the three overheads) is named and used, not re-derived from first principles on screen.
- Monkey's and Dostoevsky's own closed-form cost models and their full asymptotic analyses (e.g., the exact O(L) factor, the full Fluid LSM-tree parameterization) are named as the papers' own results, not re-derived.
- This topic's own measured amplification numbers are scoped to its own `examples.py` workload (one key set, one update pattern, one data volume) and are not claimed to generalize to every workload or every real system's own tuning.
- RocksDB's own further compaction knobs (per-level compression, compaction priority modes, trivial moves) beyond leveled/tiered/hybrid are out of scope.
