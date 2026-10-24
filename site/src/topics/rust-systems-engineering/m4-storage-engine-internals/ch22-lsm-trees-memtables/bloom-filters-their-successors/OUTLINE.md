# Outline: Bloom filters and their successors (`rust.bloom-filters-their-successors`)

Chapter 22, topic 58 (third and last of three, closes Chapter 22). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, minimal Bloom filter: a bit array and a chosen number of independent hash functions.
2. Measure that every key actually inserted is always reported as possibly present — zero false negatives, ever, at any bits-per-key budget.
3. Measure that false positives genuinely exist at a tight bits-per-key budget: a positive result is not a guarantee.
4. Measure that spending more bits per key genuinely lowers the real, measured false-positive rate.
5. State, from RocksDB's own wiki, the real diminishing-returns shape of that bits-per-key trade, and why cutting unneeded disk reads is the whole point.

## Changes from the chapter plan

None. All claims are measured directly against a real, deterministic Bloom filter built from an in-memory bit array; nothing here needs root access, real file I/O, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"A Bloom filter says a key is either 'maybe present' or 'definitely absent.' For a key that was genuinely inserted earlier, could it ever come back 'definitely absent'?"** (predict, hook) — `fig`: one filter, one key, genuinely inserted. Options: yes, sometimes, for a tightly packed filter / no, never, at any budget (correct) / only once the filter holds more keys than it has bits.
2. **"Measured: zero false negatives, at every budget"** — `fig`: the real, measured result, every inserted key found. Takeaway: "A Bloom filter never forgets a key it was actually given; a negative result is always proof of absence."
3. **"Build that same filter with a much tighter bits-per-key budget. Does a key that was never inserted at all ever come back 'maybe present'?"** (predict) — `fig`: a tight budget, a key never inserted. Options: no, only genuinely inserted keys ever come back positive / yes, genuinely; some never-inserted keys come back maybe-present (correct) / only if two different keys happen to collide exactly.
4. **"Measured: a tight bits-per-key budget genuinely produced real false positives against keys that were never inserted at all"** — `fig`: the real, measured false positives, found. Takeaway: "A positive result only grants permission to go look; it's never a guarantee the key is actually there."
5. **"Spend far more bits per key on that same filter instead. Does that genuinely change how often a never-inserted key comes back 'maybe present'?"** (predict) — `fig`: the same filter, a far larger budget. Options: no change; bits per key only affects memory, not accuracy / yes, genuinely lower (correct) / yes, genuinely higher, since more bits means more chances to collide.
6. **"Measured: spending far more bits per key genuinely lowered the measured false-positive rate"** — `fig`: the real, measured rate, dropping. Takeaway: "More bits per key genuinely buys a lower false-positive rate; it's a real budget, not a free setting."
7. **"RocksDB's own wiki states a real bits-per-key table directly. Does a small increase near the low end buy as much improvement as that same size increase further up the table?"** (predict) — `fig`: RocksDB's own bits-per-key table. Options: yes, the same improvement no matter where you start / no, genuinely; the low end buys far more improvement per bit spent (correct) / it's the reverse: the low end buys the least.
8. **"Measured, in RocksDB's own numbers: the low end of the table buys far more improvement per bit spent than the same size increase further up"** — `fig`: RocksDB's own bits-per-key numbers, shown directly. Takeaway: "Spending bits per key has diminishing returns; the first few bits buy far more than the next few."
9. **"RocksDB's own wiki also states, directly, why any of this bits-per-key spending is worth it at all: what does a real filter actually save a lookup from doing?"** — `fig`: RocksDB's own words on cutting disk reads, shown directly. NO new predict (continues directly from step seven's own bits-per-key table question, to the real system's own reason the whole trade-off matters). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — a Bloom filter never forgets a key it was actually given, so a negative result is always proof of absence; a positive result only grants permission to go look, never a guarantee. Spending more bits per key genuinely lowers the real false-positive rate, though with diminishing returns, exactly because the whole point, as RocksDB's own documentation names directly, is cutting the disk reads a lookup would otherwise have to pay for.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (about the bits-per-key table's own shape; step 9 continues from it directly, with no new predict, to RocksDB's own wiki words on why the trade-off is worth it at all).
- Surprising fact: step 9 (the real system's own documentation naming exactly why this topic's own measured trade-off matters).
- Takeaways: steps 2, 4, 6, 8 (four — step 9 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| filters generated at about 10 bits of space per key work well for many workloads, with bits per key continuously configurable from 1 to 20 or more | RocksDB Wiki: RocksDB Bloom Filter (quoted) |
| 9.9 bits per key, for a 1% false positive rate, is 99% as effective as 100 bits per key | RocksDB Wiki: RocksDB Bloom Filter (quoted) |
| the optional FilterPolicy mechanism can be used to reduce the number of disk reads substantially | RocksDB Wiki: Basic Operations (quoted) |
| a Bloom filter can reduce the number of unnecessary disk reads needed for a lookup by a factor of approximately a hundred | RocksDB Wiki: Basic Operations (quoted) |
| every key actually inserted is genuinely reported as possibly present at both a tight and a generous bits-per-key budget, zero false negatives either way | `examples/runtime-demo/src/bloom_filter_false_positive_tradeoff.rs` (executed, measured) |
| a tight bits-per-key budget genuinely produces real false positives against keys never inserted at all | `examples/runtime-demo/src/bloom_filter_false_positive_tradeoff.rs` (executed, measured) |
| spending more bits per key genuinely lowers the measured false-positive rate on the identical filter | `examples/runtime-demo/src/bloom_filter_false_positive_tradeoff.rs` (executed, measured) |

## Concept ledger

- `introduces`: `bloom-filter-false-positive-tradeoff` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `lsm-write-read-amplification-paths` (topic 56)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused: "Compaction cuts down how many SSTables a read eventually has to merge; it says nothing yet about how a read decides which SSTables are even worth opening in the first place."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter measured the real cost an LSM tree defers and the real techniques (compaction, filtering) that make deferring it tolerable; the next chapter turns to how a storage engine gives an in-flight reader a consistent view of data that writers keep changing underneath it."
