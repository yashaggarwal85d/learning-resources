<section data-section="outcomes">

## Outcomes

Explain what each of RocksDB's three real compaction styles actually costs, measured directly:
leveled compaction settles the identical shuffled write pattern to fewer live files than tiered
(RocksDB's own "Universal" style), and FIFO compaction drops the oldest file outright once a
configured size cap is crossed, rather than merging anything. State the RUM conjecture precisely
— read overhead, update overhead and memory overhead are each a defined ratio with a theoretical
minimum of 1.0, and an access method optimal in one cannot be optimal in both of the other two at
once. Explain write stalls as a real, named, measured mechanism: once too many L0 files pile up
past a configured trigger, RocksDB throttles writes on purpose rather than letting space and read
amplification grow without bound. Connect compaction debt back to the previous topic's
tombstones: the same uncollected-merge-work debt, at two different scales. State what the
chapter's own lab measured directly: an identical workload against a real Postgres cluster and a
real RocksDB instance, with Postgres paying more in write and space amplification on this
workload, and RocksDB's own point-read measured faster — with the architectural caveat that
comparison carries.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` runs four real measurements. First, the chapter's own lab: an
identical 2,000-row insert-then-half-updated-then-200-random-reads workload run against this
sandbox's real Postgres cluster and a real RocksDB instance (`rocksdict`), with compression
disabled on both sides so the comparison measures the engines themselves rather than their
compressors. Postgres's own WAL-byte delta (measured right after an explicit `CHECKPOINT`, to
keep an unrelated mid-run checkpoint's own extra writes out of the number) gives roughly 2.61×
write amplification and 1.89× space amplification; RocksDB's own flush-plus-compaction byte count
gives roughly 1.85× and 1.11×. RocksDB's own in-process point-read p99 is measured lower than
Postgres's client-server round trip in every run — a real result, but not a clean
read-amplification comparison, since one read never leaves the process and the other crosses a
socket. Second, the identical shuffled 20,000-key write pattern, run through RocksDB's own level
and universal compaction styles, settles to 3 live files under leveled and 4 under universal, a
real structural difference caused by leveled's own more eager, one-sorted-run-per-level merging.
Third, a FIFO-style store with a 100-kilobyte cap, written in rounds well past that cap, drops
the oldest round's own key entirely while the newest round's own key stays — no merge, just a
drop. Fourth, with `level0_slowdown_writes_trigger` configured to 2, the same write pattern used
for the leveled/tiered comparison leaves RocksDB's own `rocksdb.num-files-at-level0` property at
6, past the configured trigger, measured with background compaction held off so the count can be
read deterministically.

</section>

<section data-section="production">

## Production failures this topic warns about

**Write stalls, and what triggers them.** RocksDB has two real, named triggers: too many L0
files (`level0_slowdown_writes_trigger`, then a harder `level0_stop_writes_trigger`) and too many
pending-compaction bytes (`soft_pending_compaction_bytes_limit`, then
`hard_pending_compaction_bytes_limit`). Once triggered, RocksDB reduces the write rate to a
configured `delayed_write_rate` rather than simply blocking — a deliberate, visible slowdown, not
a crash or a bug, and a direct signal that compaction has fallen behind the write rate.

**Compaction debt as the same failure as tombstone build-up, at a larger scale.** The previous
topic measured a single delete growing disk usage rather than shrinking it, because only a later
compaction discards a tombstone. A write stall is the identical debt, system-wide: writes
arriving faster than compaction can merge them back down, left unchecked, grows both space
amplification (risk of running out of disk) and read amplification (more and more uncompacted
structures for every read to check) without bound.

</section>

<section data-section="frontier">

## Frontier

Cassandra, ScyllaDB and Pebble each default to a different point on the same leveled/tiered
spectrum RocksDB exposes as configuration — named here as real reference points for where
production systems sit, not measured directly in this sandbox. The Dostoevsky paper's own
"Leveled-N" (Fluid LSM) design, named directly in the RocksDB Compaction documentation as a
newer, more tunable middle ground between pure leveled and pure tiered, is left for a reader who
wants to go further. This topic's own lab measured a small, 2,000-row workload; at a much larger
scale, Postgres's fixed per-table and per-WAL-record overhead would matter proportionally less,
and RocksDB's own write amplification is known to grow with deeper LSM trees — a direction this
lab's own scale cannot show.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every mechanism in this section so far lived inside one engine, on one machine. The next section
asks what a transaction even means once two transactions can run at the same time at all —
starting with a precise restatement of ACID itself.

</section>
