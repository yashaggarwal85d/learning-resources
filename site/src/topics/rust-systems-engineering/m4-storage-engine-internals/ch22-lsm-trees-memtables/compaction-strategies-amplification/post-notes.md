---
title: "Compaction strategies and amplification"
---

## Outcomes

- Build a real, minimal leveled compactor and a real, minimal tiered (universal-style) compactor, run against the identical sequence of flushed SSTables.
- Measure that without any compaction, read amplification and space amplification genuinely grow without bound as SSTables accumulate.
- Measure that both real compaction strategies genuinely beat no compaction at all, on both read and space amplification.
- Measure that leveled and tiered compaction, run against the identical write workload, genuinely produce different write amplification and different read/space amplification from each other.
- State, from RocksDB's own wiki, why compaction itself has to be budgeted against the very writes it exists to serve.

## Internals

The no-compaction baseline and both real compactors are fed the identical sequence of batches, so every comparison is a genuine apples-to-apples measurement. The write-amplification claim counts every input entry actually processed by every merge, including a level's or tier's own pre-existing run being re-merged, so the measured cost reflects real re-rewriting, not just newly flushed entries. This topic's own leveled compactor is a simplified two-level cascade, and its own tiered compactor merges every current run at once — both are real, working, measurably different policies built for this topic's own claims, not a claim to replicate RocksDB's exact algorithms.

## In production

RocksDB's own wiki states leveled compaction's own trade directly: merging L0 files sacrifices write amplification by one but may significantly improve read amplification. Its own Universal Compaction page names the opposite trade: targeting lower write amplification, trading off read amplification and space amplification, generally regarded as giving far better write amplification with worse read amplification. And its own Write Stalls page states the limit on all of this: an extensive system slows writes down whenever flush or compaction can't keep up with the incoming write rate.

## The frontier

The syllabus names the RUM conjecture directly — read, update, and memory overhead can't all be minimized at once — and this topic's own measured write-versus-read/space trade-off between tiered and leveled compaction is a concrete instance of exactly that. All of this topic's own measured claims run entirely on in-memory Rust collections, with no file, network, or root access needed.

## Where this goes next

Compaction cuts down how many SSTables a read eventually has to merge; it says nothing yet about how a read decides which SSTables are even worth opening in the first place.
