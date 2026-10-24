---
id: dsa.lsm-compaction-amplification
title: LSM compaction and amplification
---

<section data-section="outcomes">

## After this topic you can

- Explain leveled, tiered and hybrid compaction and the read/write-amplification trade each one makes.
- Define read, write and space amplification precisely and state the RUM trade-off's own claim.
- Name Monkey's per-level filter-sizing result and Dostoevsky's lazy-leveling result, and what workload assumption each depends on.

</section>

<section data-section="internals">

## Into the internals

### The RUM conjecture is the general case; this topic's three numbers are one instance of it

The RUM conjecture names three overheads of any access method — read, update, and memory/storage — and claims that bounding two forces a hard lower bound on the third. This topic's own write, read, and space amplification numbers are a compaction-specific instance of exactly that shape, not a restatement of the paper's own vocabulary: the RUM paper itself never uses the terms "write amplification" or "space amplification."

### Why Monkey and Dostoevsky don't contradict the trade-off

Monkey tunes Bloom-filter memory allocation inside an existing merge policy — it is not a fourth compaction family, and it does not touch write or space amplification at all. Dostoevsky's Lazy Leveling holds point-lookup cost, range-lookup cost, and space amplification to the same bounds while improving updates, and Dostoevsky itself operates under an explicit user-supplied space-amplification budget — it finds a better point on the existing trade-off, not an exit from it.

</section>

<section data-section="lab">

## In the lab

`examples.py` reuses topic 28's WAL/memtable/SSTable shape to drive leveled and tiered compaction over the identical sequence of inserts and updates, confirming both end with the exact same live key set a straight replay of every write would produce, before measuring write, read, and space amplification for each. It also builds real, hash-based Bloom filters at two different per-level memory splits — uniform and Monkey's proportional-to-run-size — at the identical total memory budget, and measures the summed false-positive rate each one actually produces.

</section>

<section data-section="production">

## In production

RocksDB implements exactly these three compaction families: Level Compaction (the tiered+leveled hybrid), Universal Compaction (tiered), and FIFO (not covered here). Its own documentation states the leveled/tiered/hybrid trade-off in the same terms this topic uses, and its Universal Compaction's own size-amplification-ratio formula is the one this topic's `examples.py` adapts for its own space-amplification measurement.

</section>

<section data-section="frontier">

## The frontier

RocksDB exposes further per-level compaction-priority tuning (which files within a level get picked for compaction first) beyond the three families this topic covers — named here only in passing, not taught as its own mechanism.

</section>

<section data-section="questions">

## More questions

- If a workload is almost entirely point lookups with very few updates, which end of the leveled-tiered spectrum should it sit closest to, and why?
- Monkey's result assumes a fixed number of levels. What would happen to its memory-allocation advantage if the number of levels itself could also change?

</section>

<section data-section="next">

## Where this goes next

Every structure in this chapter optimized where data physically sits — on a page, in a run, across a level — to make a block of I/O count for as much work as possible. The next chapter asks a narrower question, answered the same way regardless of where anything sits: of everything not yet processed, which one is smallest, right now. Binary heaps, next.

</section>
