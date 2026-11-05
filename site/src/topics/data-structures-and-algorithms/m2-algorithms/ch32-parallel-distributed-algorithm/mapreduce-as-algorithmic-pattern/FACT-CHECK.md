# Fact-check — dsa.mapreduce-as-algorithmic-pattern

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | The word count example: map emits each word plus a count of one; reduce sums every count for a word | Confirmed | SOURCES.md §1 |
| 2 | The default partitioning function uses hashing, e.g. "hash(key) mod R" | Confirmed | SOURCES.md §1 |
| 3 | A combiner is justified when there is significant repetition in the intermediate keys and the reduce function is commutative and associative; word frequencies follow a Zipf distribution | Confirmed | SOURCES.md §1 |
| 4 | The only difference between a reduce function and a combiner function is how the library handles the output (final file vs. intermediate file sent to a reduce task) | Confirmed | SOURCES.md §1 |
| 5 | A "straggler" is a machine that takes an unusually long time on one of the last few tasks | Confirmed | SOURCES.md §1 |
| 6 | Backup tasks: the master schedules backup executions of remaining in-progress tasks near completion; a task is done when either the primary or backup finishes | Confirmed | SOURCES.md §1 |
| 7 | The backup-task mechanism typically increases computational resources used by no more than a few percent | Confirmed | SOURCES.md §1 |
| 8 | The MPC model: p servers, each receiving only O(n/p^(1−ε)) bits of data per step, rounds, ε ∈ [0,1] controlling replication | Confirmed | SOURCES.md §2 |
| 9 | A one-round lower bound: any algorithm requires ε ≥ 1 − 1/τ*, where τ* is the fractional vertex cover of the query's hypergraph | Confirmed | SOURCES.md §2 |
| 10 | Transitive closure cannot be computed in O(1) rounds of communication in this model | Confirmed | SOURCES.md §2 |
| 11 | Goodrich, Sitchinava and Zhang: constant-round sorting, multi-searching and BSP/CRCW-PRAM simulation when each machine has memory M = Θ(N^ε) | Confirmed | SOURCES.md §3 |
| 12 | Spark's `reduceByKey`: "merge the values for each key using an associative and commutative reduce function," performing local (map-side) merging first, "similarly to a 'combiner' in MapReduce" | Confirmed | SOURCES.md §4 |
| 13 | Spark's `groupByKey` deliberately does not use map-side combine | Confirmed | SOURCES.md §4 |
| 14 | Hadoop's Partitioner: derives the partition from the key (or a subset) typically by a hash function; HashPartitioner is the default | Confirmed | SOURCES.md §5 |
| 15 | Hadoop: a combiner performs local aggregation of intermediate outputs to cut down data transferred from Mapper to Reducer | Confirmed | SOURCES.md §5 |
| 16 | Karloff, Suri and Vassilvitskii's MRC model (named only; its own homepage unreachable at research time) | Not independently verified beyond the Beame-Koutris-Suciu paper's own summary of it | Not opened; see SOURCES.md's "Named, not read" note |
| 17 | Pregel (vertex-centric graph processing) and the COST argument, named only in post-notes | Named only, per the chapter plan; no claim read from either source | CHAPTER.md §106 scope |
| 18 | Every numeric claim on screen (the word count's shuffle record counts with/without a combiner, the broken-mean counter-example, the simulated chain-join and triangle-query round/replication figures, the doubling-rounds table for transitive closure) | Confirmed by direct computation | `examples.py`, run and asserted |

## Red team

- **Does the combiner actually preserve the answer in the worked example, or is that only
  claimed, not checked?** `examples.py` runs the identical word count through both a
  no-combiner and a with-combiner shuffle and asserts the two final reduce outputs are equal —
  the claim "a combiner changes how much moves, never what the answer is" is checked against
  the actual computed dictionaries, not merely asserted in prose.

- **Is the broken-mean counter-example a cherry-picked pathological case, or does it show the
  general problem?** The three groups chosen (sizes two, one and four, with very different
  values) are deliberately unequal in size specifically because the mean-of-means equals the
  true mean whenever every group happens to be the same size — the counter-example is
  constructed to exhibit the general failure mode (unequal group sizes), not a coincidence of
  one specific input; `examples.py` asserts the gap exceeds a full unit, ruling out a
  rounding-error reading.

- **Is the MPC-model round/replication simulation a faithful instance of Beame, Koutris and
  Suciu's own result, or an invented simplification?** It is explicitly a simplification,
  documented as such in `examples.py`'s own comments: the triangle query's replication factor
  is approximated as p^(1/3) to illustrate the paper's own stated space exponent of 1/3 for the
  triangle query, not a full implementation of their one-round algorithm. The topic states the
  real paper's own number (space exponent 1/3) as the authoritative claim, quoted in
  `SOURCES.md`, and uses the simulation only to illustrate why a chain join (exponent 0) and a
  triangle query (exponent 1/3) differ in replication need.

- **Is "transitive closure needs more than one round" actually demonstrated, or merely
  asserted from the paper's abstract?** The abstract's claim (quoted) is the authoritative
  source; `examples.py`'s doubling-rounds table is a separate, clearly-labeled illustration of
  *why* a growing chain structurally resists a constant round count under one natural scheme
  (doubling the reachable prefix each round) — it does not claim to reproduce BKS's own proof,
  and the topic's own text does not conflate the two.

- **Predict-distractor plausibility.** Step 2's distractors ("still right," "too high/low,
  always") each describe a specific, plausible but wrong mental model (that the combiner trick
  is purely mechanical and safe, or that it fails in one fixed, discoverable direction); the
  correct answer — wrong, unpredictably — is exactly what the broken-mean example later proves.
  Step 9's distractors ("always the same," "different by a small fixed amount," "same only when
  groups are equal size") each test a different false belief about when averaging commutes with
  grouping; the last distractor is the closest real exception (equal-sized groups do make
  mean-of-means correct) and is deliberately included as the most tempting wrong answer.
