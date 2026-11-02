# Outline — de.partitioning-schemes-range-hash

**Kind:** full, §5.3. About 15 minutes. No lab of its own.

## Scope (full syllabus line, four clauses)

"range partitioning (ordered scans, hot tails) vs hash partitioning (even spread, no range scans);
consistent hashing with virtual nodes and rendezvous hashing to limit data movement on membership
change (algorithm in → *Data Structures & Algorithms* Ch.2); request routing via client, proxy or
coordinator; partitioning vs replication as independent axes."

- Clause 1: "range partitioning (ordered scans, hot tails) vs hash partitioning (even spread, no
  range scans)" — both schemes run against the identical timestamp-ordered workload directly in
  `examples.py`, measuring the real hot tail range partitioning produces and the even spread hash
  partitioning produces on the same keys, plus the real range-scan cost each one pays.
- Clause 2: "consistent hashing with virtual nodes and rendezvous hashing to limit data movement on
  membership change (algorithm in → Data Structures & Algorithms Ch.2)" — naive modulo hashing's
  real remap cost measured against consistent hashing's and rendezvous hashing's own real,
  bounded remap cost, on identical membership changes; the ring/HRW algorithms themselves assumed
  from the DSA track's own `dsa.consistent-hashing-rings`, not re-taught here.
- Clause 3: "request routing via client, proxy or coordinator" — the three real routing shapes
  named and sourced from CockroachDB's own gateway-node routing and Cassandra's own token-ring
  routing, since this sandbox has no multi-node cluster of its own to route against for this topic.
- Clause 4: "partitioning vs replication as independent axes" — stated directly: a partitioning
  scheme decides which node owns a key; a replication scheme decides how many copies that node's
  data has — the two questions compose, and neither answers the other.

## Outcomes

Contrast range partitioning (ordered scans, a real hot-tail problem demonstrated directly) with
hash partitioning (even spread, no range scans); explain consistent hashing with virtual nodes and
rendezvous hashing as two ways to limit data movement on membership change, assuming the algorithm
itself from the Data Structures & Algorithms track; contrast client-side, proxy and coordinator
request routing; state explicitly why partitioning and replication are independent axes, not two
names for the same thing.

## Concept ledger

- **Introduces:** `partitioning-schemes`.
- **Uses:** `cap-pacelc` (topic 20) — confirmed `introduces`d at `registry.ts`'s new entry for
  `de.cap-pacelc-practice`.
- **Declared:** consistent hashing's own algorithm (`consistent-hashing`, `ring-placement`,
  `virtual-node`, `minimal-remapping`), already `introduces`d by the Data Structures & Algorithms
  track's `dsa.consistent-hashing-rings` — confirmed live via `registry.ts` line 2419-2430 — assumed
  rather than re-taught, per `CHAPTER.md`.

## Storyboard (10 steps)

1. **Hook.** The same ten thousand events, split across the same ten nodes, two different ways.
   One way makes a single node do almost all the work. The other doesn't.
2. **Predict** (within the first four steps): events arrive in timestamp order. Under range
   partitioning, where does the *newest* write always land?
3. **Reveal: range partitioning.** Ordered by key, so a scan across a range is one sweep. But
   every new write lands on whichever partition currently owns the tail.
4. **Reveal: the hot tail, measured.** The same ten thousand writes, the most recent five hundred
   of them — every single one on the one partition holding the growing tail. Takeaway.
5. **Reveal: hash partitioning.** No order left at all, but the identical recent writes spread
   across every partition. Takeaway.
6. **Predict.** Add one more node to a ten-node hash-partitioned cluster using plain modulo
   hashing. About what fraction of all keys have to move?
7. **Reveal: consistent hashing and rendezvous hashing.** Naive modulo hashing remaps nearly
   everything. Consistent hashing's ring and rendezvous hashing's independent computation both move
   close to the new node's own fair share, and nothing more. Takeaway.
8. **Reveal: routing, and the independent axis.** A request still has to find its partition's own
   node — client, proxy, or coordinator — and that choice has nothing to do with how many replicas
   that node's data has.
9. **Recap.** Range orders, hash spreads; naive hashing breaks on resize, consistent and rendezvous
   hashing don't; partitioning and replication are two separate questions.
10. **Prove it.** A table is range-partitioned by an auto-incrementing order ID, and traffic has
    one hundred times the usual write rate during a flash sale. What happens, and does adding more
    nodes to the cluster fix it?

Engagement arc: hook (step 1); predict (step 2, within the first four steps); mechanism built
through range-then-hash contrast (steps 3-5); second predict (step 6, satisfying the
minimum-2-predict rule) asking the reader to guess the naive-hashing remap cost before step 7's
reveal gives the real measured numbers; three takeaways (steps 4, 5, 7, at or after the reel's own
midpoint); recap (step 9); Prove it (step 10).

## Examples to execute

`examples.py`, no live lab (per `CHAPTER.md`): six real simulations over real key distributions.

1. `range_partitioning_concentrates_an_ordered_write_workload`: the most recent 500 of 10,000
   timestamp-ordered writes all land on exactly one partition — the tail.
2. `hash_partitioning_spreads_the_identical_workload`: the identical recent 500 writes spread
   across most or all of the 10 partitions.
3. `hash_partitioning_cannot_do_an_efficient_range_scan`: a 100-key ordered range scan under hash
   partitioning touches most of the partitions, not a contiguous few.
4. `naive_modulo_hashing_remaps_almost_everything_on_resize`: adding a node to a 10-node naive
   modulo-hashed cluster remaps over 85% of all keys.
5. `consistent_hashing_moves_only_a_small_fraction_on_resize`: the identical membership change
   under a real virtual-node consistent-hash ring moves under 20% of keys.
6. `rendezvous_hashing_also_moves_only_a_small_fraction_on_resize`: the same membership change
   under real HRW hashing, computed independently per key with no shared ring state, also moves
   under 20%.

All six verified via `python3 examples.py`.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 20's handoff verbatim): "Every replication topic so
  far assumed the same data lived on every node. This topic is the orthogonal axis: splitting the
  data itself across nodes, with range and hash partitioning's own real trade-offs and consistent
  hashing's answer to membership change."
- **Handoff** (to topic 22, verbatim): "Partitioning's own clean theory runs into a real practical
  failure the moment one key gets far more traffic than the rest. The next topic is exactly that:
  shard keys and the hot shards a bad one creates."

## Claims list

1. CockroachDB stores data as a monolithic sorted map divided into contiguous "ranges," so every
   key can always be found in a single range. — CockroachDB documentation.
2. Defining the order of data makes it easy to find data within a particular range during a scan.
   — CockroachDB documentation.
3. Each table's range splits into two once it reaches a size threshold, as the table grows. —
   CockroachDB documentation.
4. Cassandra partitions data via consistent hashing; naive modulo hashing can invalidate almost
   all key-to-node mappings when a single node is added. — Cassandra documentation.
5. Cassandra maps every node to one or more tokens on a continuous hash ring; consistent hashing
   only has to move a small fraction of keys when the node count changes. — Cassandra documentation.
6. Consistent hashing assigns items to buckets so each bin gets roughly the same number; unlike
   standard hashing, a small change in the bucket set doesn't induce a total remapping. — Karger et
   al.
7. Rendezvous (HRW) hashing is simpler than consistent hashing, distributes objects uniformly, and
   needs no precomputed or stored tokens. — Wikipedia, restating Thaler & Ravishankar.
8. The HRW assignment can be computed independently by any client, since it depends only on the
   identifiers for the set of sites. — Wikipedia, restating Thaler & Ravishankar.
9. The `examples.py` simulations, confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

The chapter's own named source example ("a real distributed database's own partitioning
documentation, e.g. CockroachDB's or Cassandra's own range/hash partitioning docs") used both
named examples rather than choosing one, since CockroachDB's own documentation covers range
partitioning cleanly while Cassandra's own documentation covers hash/consistent-hash partitioning
cleanly — using both let every claim stay matched to the database that actually documents that
specific mechanism, rather than stretching one source to cover a mechanism it documents less
directly. The rendezvous-hashing paper itself (Thaler & Ravishankar, hosted at a `cs.rutgers.edu`
course-notes mirror) serves a broken TLS chain in this sandbox; substituted Wikipedia's own
rendezvous-hashing article, which restates the algorithm's definition precisely and traces directly
back to the original paper and its 1998 follow-up — the same substitution pattern already used for
Terry et al.'s paper in `de.replication-lag-session-guarantees`.
