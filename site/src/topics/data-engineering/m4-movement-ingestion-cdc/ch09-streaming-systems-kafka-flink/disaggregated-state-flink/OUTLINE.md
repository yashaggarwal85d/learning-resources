# Outline — Disaggregated state in Flink (`de.disaggregated-state-flink`)

12 steps. Predicts at steps 3 and 7 (both within the first four... step 7 is the
second predict, not the first — predicts[0] = step 3, 0-indexed position 2, well
within the required ≤3). Takeaways at steps 5, 9, 11 — none immediately after a
predict step (3→4 is clear, 7→8 is clear).

1. **Hook** — every state backend so far kept its authoritative copy next to the
   machine doing the processing. What if it didn't?
2. **Setup** — recap: heap and RocksDB backends both keep their primary copy on
   the TaskManager's own local disk (from topic 22).
3. **Predict** — if the primary copy moves to remote object storage, what
   happens to a checkpoint?
4. **Reveal: ForSt** — ForSt is an LSM-tree store (RocksDB's own structure) whose
   sst files live on remote storage (HDFS/S3); local disk becomes a cache, not
   the source of truth.
5. **Reveal: checkpoints near-free** — because the authoritative copy is already
   durable where a checkpoint would copy it to, a checkpoint becomes close to a
   metadata-only update. [Takeaway 1]
6. **Reveal: recovery/rescaling speedups** — the paper's own measured multiples:
   faster recovery, faster scale-in, faster scale-out, all following from the
   same near-metadata checkpoint.
7. **Predict** — if every state access might now cross the network, what has to
   change about how a record gets processed?
8. **Reveal: async state API** — synchronous vs asynchronous state access;
   `StateFuture`, non-blocking; different keys' round trips overlap.
9. **Reveal: per-key order preserved** — the guarantee that makes this safe: same
   key, strict order; different keys, free to interleave. [Takeaway 2]
10. **Reveal: the cache tradeoff** — without a local cache, heavy-I/O throughput
    drops noticeably; even a modest cache recovers and beats the old local-primary
    setup.
11. **ProveIt** — toy model: checkpoint cost flat vs growing, async throughput
    multiple, warm-vs-cold cache latency gap. [Takeaway 3]
12. **Recap** — inversion: primary copy moved off the machine; checkpoints paid
    for that move back in near-metadata cost; async hides the latency without
    breaking order; a cold cache is the real price.

Takeaways:
5. Checkpointing near-free once the primary copy is already durable off-machine.
9. Async state access preserves per-key order while letting different keys overlap.
11. The toy model's own numbers: flat checkpoint cost, large throughput multiple,
    and a real latency gap between a warm and cold cache.
