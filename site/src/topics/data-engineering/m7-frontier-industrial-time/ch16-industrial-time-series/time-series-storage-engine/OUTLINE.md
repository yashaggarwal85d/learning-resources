# Outline

## Scope mapped to steps

1. Hook: a 14-minute restart replaying 6 GB of WAL, and a second server's file-copy backup that is missing three hours.
2. Reveal: Prometheus's head block, WAL and two-hour blocks, with the capacity formula computed for the plant.
3. Reveal: compaction merges blocks, and chunk metadata lets a query skip the ones it doesn't need.
4. Predict: does raising the out-of-order window change what gets rejected, or only how much?
5. Reveal: the out-of-order window shifts the accept/reject line; it doesn't remove it.
6. Reveal: TimescaleDB's chunk exclusion — the same pruning idea, on a different structure.
7. Reveal: InfluxDB 3's staged write-buffer, WAL, and Parquet pipeline, at its own documented timings.
8. Reveal: Thanos, Mimir and VictoriaMetrics share one pattern — the block format, pushed to object storage, behind a stateless query layer.
9. Recap.
10. ProveIt.

## Why the simulations were built, not just described

CHAPTER.md's own outcomes ask this topic to "describe a sample's path through Prometheus's head, WAL, a two-hour block and compaction, with the real constants" and to "compute the disk need from the documented formula for the plant." `examples.py` builds a real, minimal head-block/WAL/block/compaction structure that rolls at Prometheus's own documented two-hour boundary, runs the documented capacity formula against the plant's own actual series count (1297, from topic 12), checks the documented out-of-order accept/reject rule directly, builds a TimescaleDB-style chunk structure and checks its own documented chunk-exclusion behavior, and runs a staged pipeline at InfluxDB 3's own documented second/fifteen-minute/ten-minute/five-minute timings. Prometheus itself is not installed in this environment (checked: no binary available, and the GitHub releases host is not reachable from this sandbox), so every number this topic checks comes from the documented constants, run through a structure built to match them, not from a live Prometheus instance.

## Sourced-only engines (Thanos, TimescaleDB's own instance, Grafana Mimir, VictoriaMetrics)

Consistent with topic 10's identical handling of Thanos, these four are named and quoted from their own documentation but not run — no Thanos/object-storage, TimescaleDB, Mimir or VictoriaMetrics instance exists in this environment. The common pattern CHAPTER.md asks this topic to state (the Prometheus block format, pushed to object storage, behind a stateless query layer) is itself checkable by comparing the four sources' own stated architectures side by side, which is what `SOURCES.md` and this file do, rather than by running any of them.

## What this topic leaves out (per CHAPTER.md)

Series cardinality and the index (topic 12); compression codecs (topic 11); rollups and retention policy (topic 10); the choice among engine families (topic 14); object-storage and lakehouse table formats in general (Chapter 6); Kafka-like logs (Chapter 9).
