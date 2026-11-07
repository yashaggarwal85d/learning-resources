# FACT-CHECK — Consistent hashing inside sharded stores

| # | Claim | Checked against |
|---|---|---|
| 1 | Cassandra names its ring "Consistent Hashing using a Token Ring" | Cassandra architecture docs ("Dynamo"), quoted word for word |
| 2 | Virtual nodes (several tokens per physical node) fix small-cluster imbalance | Cassandra architecture docs, "Multiple Tokens per Physical Node (vnodes)", quoted |
| 3 | Redis Cluster's key space is 16,384 fixed slots | Redis Cluster specification, quoted word for word |
| 4 | A key's slot is `HASH_SLOT = CRC16(key) mod 16384` | Redis Cluster specification, quoted word for word |
| 5 | Data moves between Redis Cluster nodes only during an explicit resharding | Redis Cluster specification, "data is never moved between nodes except when resharding", quoted |
| 6 | A slot migration uses `CLUSTER SETSLOT slot MIGRATING node` | Redis Cluster specification, quoted word for word |
| 7 | Kafka's keyed partitioner computes `murmur2(key) % numPartitions` | Kafka `BuiltInPartitioner.java`, `partitionForKey`, read and quoted directly |
| 8 | HAProxy's `hash-balance-factor` is a percentage of the average concurrent-request count | HAProxy configuration manual (2.9.15), quoted word for word |
| 9 | A disqualified first-choice server causes the algorithm to choose another server by the same hash, until one with capacity is found | HAProxy configuration manual, quoted word for word |
| 10 | `hash-balance-factor` is 0 (disabled) by default | HAProxy configuration manual, "Setting <factor> to 0 (the default) disables the feature", quoted |
| 11 | On a ten-to-eleven-node growth, the ring and the fixed-slot table each move roughly a tenth of keys; modulo hashing moves over ninety percent | `examples.py`, measured directly, not estimated |
| 12 | A thousand ring points per node gives no systematic improvement to a hot key's own overload ratio versus one point per node | `examples.py`, `vnode_ratio > plain_ratio * 0.7`, measured directly |
| 13 | Bounded-load placement at HAProxy's own example factor (1.5) caps the busiest node's share near that factor | `examples.py`, `bounded_ratio < plain_ratio` and `bounded_ratio < BALANCE_FACTOR + 0.5`, measured directly |

## Red-team pass

- **Does the fixed-slot table's rebalance-on-join model (`rebalance_slots_for_join`) reproduce
  what a real `redis-cli --cluster reshard` actually moves?** No, and OUTLINE.md says so
  explicitly: the model moves an evenly-spread, bounded number of slots from each existing node
  to the new one, built directly from the spec's own stated mechanics (whole slots move, chosen
  by an operator or a tool), not from running the real tool, which this topic's sandbox cannot
  do. The claim this topic actually makes is narrower and still true of the model: the number of
  slots moved is bounded and operator-controlled, in contrast to modulo hashing's unbounded
  remapping — not a claim about the exact slots Redis's own tool would choose.
- **Does the "a thousand points per node doesn't help the hot key" result depend on the specific
  hash used, or on which hot key string is chosen?** Checked directly by re-running the
  comparison with a second, unrelated hot key string: the first key goes from 2.93x average to
  2.93x-equivalent-class (no material change); the second key goes from 4.18x to 4.18x-or-worse
  (virtual nodes made it slightly *worse*, not better, for that key). Both runs satisfy the same
  honest claim — no systematic improvement — and the assertion in `examples.py`
  (`vnode_ratio > plain_ratio * 0.7`) was deliberately loosened from an earlier, too-strong
  "barely changes" claim once the second key showed real run-to-run variance in *which*
  direction the ratio moves. The underlying reasoning (one fixed key always hashes to one fixed
  point; more points move the boundaries, not the key) does not depend on either the hash
  function or the specific key, but the *size* and *direction* of the small change the boundary
  shift causes does vary, and the topic's claim is scoped to match exactly what was measured,
  not overstated.
- **Was Python's built-in `hash()` ever used for a number actually claimed on screen?** No —
  caught before any number was written into OUTLINE.md: an early draft of `examples.py` used
  `hash()` directly, produced a different ring-moved fraction on a second run in the same
  session, and was replaced with a fixed MD5-based digest before any claim was finalized. See
  OUTLINE.md "Changes from the chapter plan" item 2.
- **Is the claim that Redis Cluster and Kafka "are not consistent-hashing rings" actually
  supported, or just asserted?** Supported directly: Redis Cluster's own spec never calls its
  mechanism a ring and describes a fixed table of slots with a flat modulo-based assignment
  (claim 4); Kafka's own partitioner source is a one-line modulo with no ring, no tokens, no
  virtual nodes anywhere in the file. Neither source needed to be asked whether it was a ring;
  neither one's own mechanism resembles one when read directly.
- **Does the topic claim HAProxy's bounded-load algorithm is identical to Chapter 3's own
  textbook bounded-load algorithm?** The topic treats them as the same underlying idea (skip an
  overloaded first choice for the next candidate the hash would choose) because HAProxy's own
  documentation describes exactly that mechanism; it does not claim HAProxy's implementation is
  byte-for-byte Chapter 3's pseudocode, and post-notes.md does not assert that either.

## Corrections applied

None to the quoted claims (1-10 passed verbatim against the fetched source text via
`node scripts/sources.mjs check`). Claim 11's exact numbers were recomputed after the
`hash()` → `hashlib.md5` fix (see red-team pass above) before being written anywhere; the
numbers in OUTLINE.md, reel.tsx and coverage.json all reflect the fixed, reproducible run.
