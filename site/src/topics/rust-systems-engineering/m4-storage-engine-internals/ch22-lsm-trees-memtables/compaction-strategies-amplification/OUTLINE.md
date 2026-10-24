# Outline: Compaction strategies and amplification (`rust.compaction-strategies-amplification`)

Chapter 22, topic 57 (second of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, minimal leveled compactor and a real, minimal tiered (universal-style) compactor, run against the identical sequence of flushed SSTables.
2. Measure that without any compaction, a lookup's own read amplification and the store's own space amplification genuinely grow without bound as SSTables accumulate.
3. Measure that both real compaction strategies genuinely beat no compaction at all, on both read and space amplification.
4. Measure that leveled and tiered compaction, run against the identical write workload, genuinely produce different write amplification and different read/space amplification from each other.
5. State, from RocksDB's own wiki, why compaction itself has to be budgeted against the very writes it exists to serve.

## Changes from the chapter plan

None. All claims are measured directly against real, deterministic leveled and tiered compactors built from in-memory Rust collections; nothing here needs root access, real file I/O, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Flush memtables to SSTables over and over, with no compaction at all. As more and more flushes pile up, does a lookup's own cost ever stop growing?"** (predict, hook) — `fig`: many flushes, no compaction, ever. Options: yes, it levels off once there's enough data / no, genuinely; every new flush is one more SSTable a lookup might have to check (correct) / it depends only on how many distinct keys exist, not on flush count.
2. **"Measured: the run count genuinely kept growing"** — `fig`: the real, measured run count, growing with each flush. Takeaway: "Without compaction, every flush is one more file a lookup might have to check, forever."
3. **"Run a real leveled compactor and a real tiered compactor against that same pile of flushes instead. Do both of them at least beat doing no compaction at all, on how many files a lookup has to check and how much stale data sits on disk?"** (predict) — `fig`: the same flushes, through two real compactors. Options: only one of the two strategies actually beats no compaction / both genuinely beat no compaction, on both measures (correct) / neither beats no compaction; compacting costs more than it saves.
4. **"Measured: both leveled and tiered compaction genuinely beat no compaction at all, on both read and space amplification"** — `fig`: the real, measured comparison, both strategies ahead. Takeaway: "Real compaction, of either kind, genuinely beats never compacting at all."
5. **"Leveled and tiered compaction get fed the exact same sequence of flushes. Do they cost the same amount of extra, rewritten data to actually run?"** (predict) — `fig`: the same flushes, two different compactors. Options: yes, the total bytes rewritten end up the same either way / no, genuinely; the two strategies cost different amounts of rewritten data (correct) / it depends only on how many distinct keys exist, not on the strategy.
6. **"Measured: leveled and tiered compaction genuinely cost different amounts of rewritten data on the identical workload, with tiered costing less"** — `fig`: the real, measured write cost, side by side. Takeaway: "Tiered compaction merges less often, which genuinely costs less rewritten data than leveled's own repeated merges."
7. **"That same tiered compactor costs less rewritten data. Does it also leave fewer files for a lookup to check, and less stale data sitting on disk, than leveled does?"** (predict) — `fig`: the same two compactors, a different measure. Options: yes, costing less to run also means it leaves less behind / no, genuinely; it leaves more files and more stale data behind than leveled does (correct) / it leaves exactly the same amount either way.
8. **"Measured: the tiered compactor that cost less rewritten data genuinely left more files to check and more stale data on disk than leveled did"** — `fig`: the real, measured read and space cost, side by side. Takeaway: "Costing less to run and costing less to read from aren't the same thing; a real strategy trades one against the other."
9. **"RocksDB's own wiki names directly why compaction itself can't just run flat out: what happens if writes keep coming in faster than flush and compaction can keep up?"** — `fig`: the real system's own words on write stalls, shown directly. NO new predict (continues directly from step seven's own trade-off question, to the real system's own reason compaction has to be budgeted at all). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — without compaction, every flush is one more file a lookup might have to check, forever; real compaction, of either kind, genuinely beats that. But leveled and tiered trade real, different costs: tiered costs less rewritten data to run, at the price of leaving more files and more stale data behind than leveled does. And that rewriting work itself has to be budgeted against the writes it serves, exactly as RocksDB's own documentation names directly.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (about tiered's own read/space cost; step 9 continues from it directly, with no new predict, to RocksDB's own wiki words on budgeting compaction against foreground writes).
- Surprising fact: step 9 (the real system's own documentation naming exactly why this topic's own trade-off has a real limit).
- Takeaways: steps 2, 4, 6, 8 (four — step 9 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| merging L0 files sacrifices write amplification by one but may significantly improve read amplification in L0 | RocksDB Wiki: Leveled Compaction (quoted) |
| universal compaction style targets use cases requiring lower write amplification, trading off read amplification and space amplification | RocksDB Wiki: Universal Compaction (quoted) |
| the tiered strategy is generally regarded as providing far better write amplification with worse read amplification | RocksDB Wiki: Universal Compaction (quoted) |
| RocksDB has an extensive system to slow down writes when flush or compaction can't keep up with the incoming write rate | RocksDB Wiki: Write Stalls (quoted) |
| without compaction, the run count genuinely keeps growing to match every flush, and every stale version genuinely stays physically present | `examples/runtime-demo/src/compaction_strategies_amplification.rs` (executed, measured) |
| both leveled and tiered compaction genuinely beat no compaction at all, on both read and space amplification | `examples/runtime-demo/src/compaction_strategies_amplification.rs` (executed, measured) |
| leveled and tiered compaction, run against the identical workload, genuinely produce different write amplification, with tiered costing less | `examples/runtime-demo/src/compaction_strategies_amplification.rs` (executed, measured) |
| the same tiered compaction that costs less write amplification genuinely leaves more files to check and more stale data on disk than leveled does | `examples/runtime-demo/src/compaction_strategies_amplification.rs` (executed, measured) |

## Concept ledger

- `introduces`: `compaction-strategy-amplification-tradeoff` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `lsm-write-read-amplification-paths` (topic 56)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused: "Flushed SSTables accumulate forever unless something merges them back together; what that background process costs is this chapter's next question."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Compaction cuts down how many SSTables a read eventually has to merge; it says nothing yet about how a read decides which SSTables are even worth opening in the first place."
