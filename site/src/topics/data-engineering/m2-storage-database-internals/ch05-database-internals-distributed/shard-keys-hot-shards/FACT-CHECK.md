# Fact-check — de.shard-keys-hot-shards

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources-tmp/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Reshard is used to create and manage workflows to horizontally shard an existing keyspace. | Confirmed | Vitess documentation, quoted verbatim. |
| 2 | While switching write traffic, the source databases are temporarily made read-only while waiting for the targets to catch up. | Confirmed | Vitess documentation, quoted verbatim. |
| 3 | Once a range reaches its size limit, CockroachDB splits it into two smaller ranges of contiguous key spaces. | Confirmed | CockroachDB documentation, quoted verbatim. |
| 4 | A range split creates a new Raft group containing all of the same members as the range that was split. | Confirmed | CockroachDB documentation, quoted verbatim. |
| 5 | Adaptive capacity automatically and instantly increases throughput capacity for partitions that receive more traffic. | Confirmed | AWS DynamoDB documentation, quoted verbatim. |
| 6 | Under consistently high traffic to a single item, adaptive capacity can rebalance data so a partition contains only that single item. | Confirmed | AWS DynamoDB documentation, quoted verbatim. |
| 7 | A global secondary index is considered "global" because queries on it can span all of the data in the base table, across all partitions. | Confirmed | AWS DynamoDB documentation, quoted verbatim. |
| 8 | A local secondary index is "local" because every one of its partitions is scoped to a base table partition sharing the same partition key value. | Confirmed | AWS DynamoDB documentation, quoted verbatim. |
| 9 | A celebrity key still makes one shard hot even with two thousand distinct, uniformly-hashed users; salting that one key brings the hottest shard back down near the fair share. | Confirmed, executed | `examples.py`: `cardinality_alone_does_not_prevent_a_celebrity_key_from_making_a_hot_shard` and `salting_the_celebrity_key_spreads_its_load_across_shards`, both asserted and run. |
| 10 | A query without the partition key against a local secondary index must ask every shard; the identical query against a global secondary index touches far fewer partitions. | Confirmed, executed | `examples.py`: `a_local_secondary_index_still_requires_fanning_out_without_the_partition_key` and `a_global_secondary_index_avoids_the_fan_out_shown_above`, both asserted and run. |
| 11 | Without a write-pause window, over half of in-flight writes during a shard split get routed by the stale boundary; with a pause window, none do. | Confirmed, executed | `examples.py`: `resharding_without_a_pause_window_misroutes_in_flight_writes_a_pause_window_does_not`, measured 50.4% without a pause and zero with one, asserted and run. |

## Currency check

- Vitess's own "Reshard" reference page is current, maintained documentation for a project still
  actively developed (Vitess v24 docs at the time of fetch); no currency risk — the read-only
  cutover window during traffic switching is current, documented behavior.
- CockroachDB's Distribution Layer architecture docs are current, maintained documentation; range
  splitting on a size threshold, with a new Raft group spun up for the new range, is current
  behavior, not a deprecated design.
- AWS's own DynamoDB developer guide pages (adaptive capacity, secondary-index guidelines) are
  the current, maintained documentation for a managed service AWS updates continuously; the
  documented behaviors (automatic adaptive capacity, GSI/LSI partition scoping) are current,
  active features, not legacy ones.

## Red team

1. **"Does the celebrity-key simulation (claim 9) actually isolate the celebrity's effect, or
   could a second heavy-traffic user confound the result?"** The traffic model gives exactly one
   user (`user-0`) a fixed, large share (40%) of total traffic and splits the remainder evenly
   among every other user — deliberately not a smooth Zipf curve, specifically so no second-
   ranked user is heavy enough to independently dominate a shard; an earlier draft used a Zipf
   distribution for all users and failed this exact concern (the second-ranked user alone carried
   over 11% of traffic, enough to break the salting fix's clean measurement), which is why the
   isolated-weight model replaced it.
2. **"Is comparing a local and global secondary index's fan-out cost (claim 10) a fair comparison,
   given the global index is modeled with fewer partitions than the base table?"** Yes — that
   difference in partition count is exactly the real-world mechanism DynamoDB's own documentation
   describes (claim 7's own wording: a GSI has its own, independent partitioning from the base
   table), not an artifact of the simulation; the measured gap (one partition touched vs. all ten)
   is a direct consequence of the GSI re-partitioning by its own key rather than inheriting the
   base table's shard count.
3. **"Does the resharding-misroute claim (claim 11) depend on which specific keys are 'in flight,'
   or does it generalize?"** It generalizes: the function draws a fresh, randomly-sampled batch of
   keys from the full key range and classifies each one by whether the split's new boundary
   reassigns it to the shard that isn't the old shard's direct successor — since the split point is
   the median of the key range, roughly half of any sufficiently large random sample of keys falls
   on each side, so the ~50% misroute figure is a property of the split geometry, not this run's
   particular random seed.
4. **"Is treating Vitess's cutover window and CockroachDB's new-Raft-group mechanism as 'the same
   problem, different mechanisms' (as the topic's own expert note claims) actually supported by
   the two quotes, or is that an unjustified generalization?"** It's supported directly: Vitess's
   own quote (claim 2) describes pausing writes until the target catches up before switching;
   CockroachDB's own quote (claim 4) describes spinning up a new Raft group with the same members
   as the split range — both are mechanisms for ensuring every write is attributed to a shard
   every participant agrees is currently authoritative, which is exactly the correctness property
   this topic's own `examples.py` demonstrates the cost of skipping.
5. **"Does the 'Prove it' answer (a celebrity key still makes its own shard hot regardless of
   cardinality) actually follow from what's measured, or is it an unjustified extrapolation to a
   different scenario (a chain customer vs. a celebrity user)?"** It follows directly: the
   mechanism measured in claim 9 — a key's hash placement is independent of the traffic volume
   that key drives — doesn't depend on what the key represents (a user, a customer, a tenant);
   millions of distinct customer IDs changes the denominator of "fair share" but not the fact that
   one key's disproportionate traffic lands entirely on whichever single shard that key hashes to.

## Problem Solving

- The first implementation of `cardinality_alone_does_not_prevent_a_celebrity_key_from_making_a_hot_shard`
  used a Zipf-distributed traffic weight across all 2,000 users (matching the pattern used for
  topic 21's hash-vs-range comparison). This produced a second-ranked user with over 11% of total
  traffic on its own — enough that salting only the top-ranked "celebrity" key still left the
  hottest shard's share well above 1.5x the fair share, since that second-heavy user could land on
  the same shard by chance. **Root cause:** a smooth power-law traffic curve has more than one
  "hot" key, which confounds a simulation meant to isolate and test the fix for exactly one.
  **Fixed** by redesigning the traffic model to give the celebrity a fixed, large, isolated share
  (40%) and split the remainder evenly among every other user, which cleanly isolates the effect
  the salting fix is meant to demonstrate.
- No sourcing issues arose for this topic — all three named chapter-plan sources (Vitess,
  CockroachDB, DynamoDB adaptive capacity) and the one added source (DynamoDB secondary-index
  guidelines) fetched cleanly on the first attempt, with no TLS failures, footnote-marker
  artifacts, or line-wrap hyphen drops to work around.
