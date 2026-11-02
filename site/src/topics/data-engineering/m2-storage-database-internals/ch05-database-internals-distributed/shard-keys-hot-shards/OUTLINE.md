# Outline — de.shard-keys-hot-shards

**Kind:** full, §5.3. About 15 minutes. No lab of its own.

## Scope (full syllabus line, four clauses)

"choosing a shard key from access patterns (tenant, user, time) and cardinality; celebrity keys
and salting/splitting; secondary indexes across shards (local vs global); online resharding and
range splits (Vitess, CockroachDB, DynamoDB partition splits) and the cost of moving data under
load."

- Clause 1: "choosing a shard key from access patterns (tenant, user, time) and cardinality" —
  stated via the Hook and first Predict/Reveal: cardinality (many distinct values, uniformly
  hashed) is necessary but not sufficient; a real shard key choice also has to account for the
  access pattern (which queries need to land on one shard) and the actual traffic shape, not just
  distinct-value count.
- Clause 2: "celebrity keys and salting/splitting" — the celebrity-key failure measured directly
  (one key dominating a shard despite high overall cardinality) and the salting fix measured
  right after it, both in `examples.py`.
- Clause 3: "secondary indexes across shards (local vs global)" — the real fan-out cost difference
  between a local secondary index (scoped to its own base-table partition) and a global secondary
  index (its own, independent partitioning), measured directly.
- Clause 4: "online resharding and range splits (Vitess, CockroachDB, DynamoDB partition splits)
  and the cost of moving data under load" — the second predict/reveal measures the real cost of
  skipping a write-pause window during a split, then names the identical mechanism as it's
  actually documented in Vitess (resharding), CockroachDB (range splits) and DynamoDB (adaptive
  capacity/partition splits).

## Outcomes

Choose a shard key from real access patterns and cardinality, not just "what's unique"; explain a
celebrity key and the salting/splitting fix; contrast local and global secondary indexes across
shards; explain online resharding and range splits (naming Vitess, CockroachDB, DynamoDB's own
documented mechanisms) and the real cost of moving data under load.

## Concept ledger

- **Introduces:** `shard-key-resharding`.
- **Uses:** `partitioning-schemes` (topic 21) — confirmed `introduces`d at `registry.ts`'s entry
  for `de.partitioning-schemes-range-hash`.
- **Declared:** none beyond topic 21, per `CHAPTER.md`.

## Storyboard (10 steps)

1. **Hook.** Two thousand distinct user accounts, hashed onto ten shards — plenty of
   cardinality. One shard still does almost half the work.
2. **Predict** (within the first four steps): does high cardinality alone guarantee even load?
3. **Reveal: cardinality alone, measured.** The celebrity's own shard carries nearly half of all
   traffic, measured on a real generated workload.
4. **Reveal: salting the celebrity key.** Splitting only that one key into salted sub-keys spreads
   its own load without touching anyone else's. Takeaway.
5. **Reveal: secondary indexes across shards.** Local indexes need the partition key in hand;
   global indexes re-partition independently and avoid the fan-out. Takeaway.
6. **Predict.** What happens to in-flight writes if a shard split skips its write-pause window?
   (satisfies the minimum-2-predict rule)
7. **Reveal: the pause window, measured.** Without a pause, over half of in-flight writes
   misroute; with a brief pause, none do. Takeaway.
8. **Reveal: the same mechanisms, in real systems.** Vitess reshards, CockroachDB splits ranges,
   DynamoDB isolates hot items — naming each system's own documented mechanism.
9. **Recap.** Cardinality isn't load; salting and index scope fix specific failures; moving data
   under load costs a real pause.
10. **Prove it.** A chain customer drives ten times the next-biggest account's traffic under a
    customer-ID shard key with millions of distinct values. Does the cardinality save it?

Engagement arc: hook (step 1); predict (step 2, within the first four steps); mechanism built
through the cardinality-then-salting contrast (steps 3-5); second predict (step 6, satisfying the
minimum-2-predict rule) asking the reader to guess the write-misrouting cost before step 7's
reveal gives the real measured numbers; three takeaways (steps 4, 5, 7, at or after the reel's own
midpoint); recap (step 9); Prove it (step 10).

## Examples to execute

`examples.py`, no live lab (per `CHAPTER.md`): five real simulations.

1. `cardinality_alone_does_not_prevent_a_celebrity_key_from_making_a_hot_shard`: a celebrity user
   driving a large, fixed share of traffic makes its own shard carry far more than its fair share,
   even with two thousand distinct, uniformly-hashed keys.
2. `salting_the_celebrity_key_spreads_its_load_across_shards`: splitting only the celebrity key
   into salted sub-keys brings the hottest shard's share back down close to the fair share.
3. `a_local_secondary_index_still_requires_fanning_out_without_the_partition_key`: a query on a
   non-partition-key attribute against a local secondary index has to ask every shard.
4. `a_global_secondary_index_avoids_the_fan_out_shown_above`: the identical query against a global
   secondary index only has to reach a small, fixed set of the index's own partitions.
5. `resharding_without_a_pause_window_misroutes_in_flight_writes_a_pause_window_does_not`: a real
   fraction of in-flight writes land on the wrong new shard without a pause window; none do with
   one.

All five verified via `python3 examples.py`.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 21's handoff verbatim): "Partitioning's own clean
  theory runs into a real practical failure the moment one key gets far more traffic than the
  rest. This topic is exactly that: choosing a shard key from real access patterns, the
  celebrity-key failure a bad one creates, and what resharding actually costs to fix it."
- **Handoff** (to topic 23, verbatim): "Every mechanism in this section so far assumed replicas
  and shards stay in sync and agree on membership changes without a formal protocol for it. The
  next topic is that protocol: consensus."

## Claims list

1. Reshard is used to create and manage workflows to horizontally shard an existing keyspace. —
   Vitess documentation.
2. While switching write traffic, the source databases are temporarily made read-only while
   waiting for the targets to catch up. — Vitess documentation.
3. Once a range reaches its size limit, CockroachDB splits it into two smaller ranges of
   contiguous key spaces. — CockroachDB documentation.
4. A range split creates a new Raft group containing all of the same members as the range that
   was split. — CockroachDB documentation.
5. Adaptive capacity automatically and instantly increases throughput capacity for partitions that
   receive more traffic. — AWS DynamoDB documentation.
6. Under consistently high traffic to a single item, adaptive capacity can rebalance data so a
   partition contains only that single item. — AWS DynamoDB documentation.
7. A global secondary index is considered "global" because queries on it can span all of the data
   in the base table, across all partitions. — AWS DynamoDB documentation.
8. A local secondary index is "local" because every one of its partitions is scoped to a base
   table partition sharing the same partition key value. — AWS DynamoDB documentation.
9. The `examples.py` simulations, confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

None — all three named sources (Vitess, CockroachDB, DynamoDB) fetched cleanly on the first
attempt, and a fourth DynamoDB page (secondary-index guidelines) was added beyond the chapter
plan's three to source the "local vs global" clause with its own direct quotes rather than
restating AWS's documented distinction from memory.
