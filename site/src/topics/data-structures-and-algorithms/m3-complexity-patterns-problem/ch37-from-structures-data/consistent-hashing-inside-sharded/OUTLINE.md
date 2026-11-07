# OUTLINE — Consistent hashing inside sharded stores

Chapter 37's seventh topic: Chapter 3's ring read against three real partition-assignment
choices -- Cassandra's token ring, Redis Cluster's fixed slot table, and Kafka's plain modulo
hashing -- and what each does, or does not do, about a hot key. One shared object (ten nodes
growing to eleven, 16,384 slots, one hot key, per CHAPTER.md's running-example table).

## Storyboard (14 steps)

1. **Hook, predict.** A cluster of ten nodes becomes eleven. Plain modulo hashing moves almost
   every key; a ring moves about one key in eleven; a fixed-slot table moves exactly the slots
   an operator chooses to move. But one key is hot, and none of those three placement schemes
   notices by itself. Predict: when one key carries a quarter of all traffic, does giving every
   node a thousand points on the ring instead of one actually help that key?
2. Three real choices, named together: Cassandra's token ring, Redis Cluster's fixed slot
   table, Kafka's plain modulo hashing -- the same placement question, three different answers.
3. Cassandra: a ring, by name, in its own documentation (quoted); virtual nodes (several
   tokens per physical node) as the fix for a small cluster's imbalance under one token each.
4. Redis Cluster: not a ring at all. A fixed table of slots; a key's slot is a hash of the key
   modulo the slot count (quoted); a master owns a subset of the slots, not a subset of a
   numeric range.
5. Kafka: a keyed record's partition is a hash of the key modulo the partition count (quoted)
   -- plain modulo hashing, with no stability property at all when the count changes.
6. **Predict, then measured.** Growing ten nodes to eleven: how much of the key space does
   each of the three schemes actually move?
7. Measured: the ring moves about one key in nine; the slot table moves a comparably small,
   operator-controlled share; modulo hashing moves nearly every key.
8. Rebalancing, two different mechanics for a similar-sized move: a ring's new node claims a
   token range from its neighbors automatically; a slot table's operator moves whole slots one
   at a time, each with a migrating/importing handshake (quoted) -- "data is never moved
   between nodes except when resharding" (quoted).
9. The shared blind spot: consistent hashing balances *keys*, never *load*. One hot key still
   lands on exactly one node under every placement scheme above.
10. **Measured:** the same hot key, now under a ring with a thousand points per node instead of
    one. Which node owns it can change; how overloaded that node becomes shows no systematic
    improvement -- the key still hashes to exactly one point.
11. HAProxy's real knob: `hash-balance-factor` (quoted) -- a server already over its share of
    the average load is skipped for the next candidate the same hash would choose, repeated
    until one with room is found; the feature is off by default.
12. Measured: the same hot key, now under bounded-load placement at HAProxy's own example
    factor. The busiest node's share drops from several times the average to close to the
    factor itself.
13. Recap: three real placement schemes, one shared vulnerability, one real fix that is not
    placement at all -- a rule about how much load any one placement is allowed to carry.
14. Handoff: once a key's node is settled, the aggregate question starts -- how to combine
    each node's own partial answer into one, without ever seeing the raw rows. Sketches inside
    approximate aggregation, next.

## Outcomes (from CHAPTER.md, unchanged)

- Compare, on the same simulation, how many keys move when a node joins under a token ring, a
  fixed-slot table and modulo hashing.
- Explain why Redis Cluster and Kafka are not consistent-hashing rings, and what stable
  mapping each provides instead.
- Show a hot key's effect on a ring and what bounded loads does to the maximum load, with
  HAProxy's factor as the real knob.

## Takeaways (>= 3, <= 20 words each)

- A ring and a fixed-slot table both move a small, controlled share of keys; modulo hashing moves almost everything.
- Consistent hashing balances keys, never load, so one hot key defeats every placement scheme equally.
- Bounded load caps the busiest node's share by skipping it for the next candidate on the ring.

## Predict steps and answers

1. **Step 1 (hook).** Does a thousand points per node help a single hot key? *Answer:* no --
   revealed in full at step 10's measurement; a tempting wrong answer is "yes, since virtual
   nodes are exactly what smooths out imbalance," true for an ordinary key distribution but not
   for one key that always hashes to the same single position regardless of how many points
   exist.
2. **Step 6.** Which of the three schemes moves the most keys when a node joins? *Answer:*
   modulo hashing, by a wide margin; a tempting wrong answer is "they should all move about the
   same, since they're all just hashing," which ignores that only two of the three were
   designed for stability under a changing node count at all.
3. **Step 10.** Confirmed directly: raising the virtual-node count from one to a thousand
   shows no systematic improvement in the hot key's own overload, because the key's hash
   position never moves -- only where the *boundaries* between nodes sit, which node ends up
   owning the key, and how much other traffic happens to share that node, all of which vary by
   key rather than reliably improving.

## Concept ledger

Introduces: `token-ring-partitioning`, `fixed-slot-table`, `partition-count-remap`,
`hot-key-bounded-load`.
Uses (confirmed live in the registry at build time, 2026-11-07): `consistent-hashing`,
`ring-placement`, `virtual-node`, `minimal-remapping`, `bounded-load-hashing` (Chapter 3's
`dsa.consistent-hashing-rings`), `hash-function` (Chapter 3's hash-function topic). `merkle-tree`,
`anti-entropy-repair` are named once in prose (step 8, the ring's own repair mechanism,
contrasted with a slot table's explicit migration) without claiming a registry id, since
Chapter 3's anti-entropy topic is referenced by name only, per CHAPTER.md's own scope note.
Declared: none new beyond the topic's own four.

## Bridge and handoff

Bridge (CHAPTER.md, word for word -- topic 122's own handoff, this topic's actual predecessor,
confirmed live in the registry at build time): "A storage engine's index is a search tree that
someone adapted: a tiebreaker added, a sequence number added, a filter cut into pages. Every
one of those adaptations assumed the data lives on one machine. Once it spans several, a
different question comes first: which machine holds this key at all, and how little has to
move when a machine joins. Consistent hashing inside sharded stores, next."

Handoff (CHAPTER.md, unchanged): "Placement decides which machine owns a key, and each machine
then answers aggregate questions about its own part: how many distinct users, what is the
median latency. The system must combine those partial answers into one without ever seeing the
raw rows. Whether it can depends on one property of the structure holding the summary: whether
two of them can be merged. Sketches inside approximate aggregation, next."

## Post-notes headings (layers 5-8)

- **Internals:** Redis Cluster's `CRC16` choice and hash tags (forcing related keys into one
  slot for multi-key operations); Cassandra's actual current default `num_tokens` (left as an
  open question, see Frontier); the exact migrating/importing state machine for one slot.
- **Lab:** the three-way growth simulation and the bounded-load simulation in `examples.py`,
  with the reader invited to change the hot key's share or the balance factor and recompute.
- **Production failures:** a slot migration left half-finished (a node crashes mid-migration)
  and what `MIGRATING`/`IMPORTING` state is left behind, named once without building it;
  Kafka's sticky partitioner as a separate mitigation for *unkeyed* records, out of this
  topic's scope (named, not built).
- **Frontier:** Cassandra's current default `num_tokens` for new clusters, left **unresolved**
  per CHAPTER.md's own "not read yet" flag -- the production guide's example sets 16 but does
  not itself state that as the shipped default; a reader who wants the exact current default
  should read Cassandra's own shipped configuration file.
- **Where this goes next:** Data Engineering's live "Partitioning schemes: range, hash,
  consistent hashing" and "Shard keys, hot shards and resharding".

## Examples to execute

`examples.py`: a reusable `Ring` class (one or many points per node); a fixed-slot table
(16,384 slots) with an explicit, bounded rebalance-on-join; plain modulo hashing; the
ten-to-eleven-node growth comparison for all three (asserted: ring and slot table each move a
small, comparable fraction; modulo moves the large majority); a hot-key traffic stream (a
quarter of all requests to one key) measured under plain placement, under a thousand-point-per-
node ring (asserted: materially unchanged), and under HAProxy-style bounded-load placement
(asserted: capped near the stated factor). Uses `hashlib.md5` for a fixed, reproducible digest
hash rather than Python's own randomly-seeded `hash()` (`PYTHONHASHSEED`), so every number is
the same on every run. Run: `python3 -I examples.py` -- all assertions pass.

## Claims list (claim -> source)

1. Cassandra names its ring "Consistent Hashing using a Token Ring" and gives virtual nodes as
   the fix for small-cluster imbalance -> Cassandra architecture docs ("Dynamo").
2. Redis Cluster's key space is 16,384 fixed slots; a key's slot is CRC16(key) mod 16384 ->
   Redis Cluster specification.
3. Data moves between Redis Cluster nodes only during an explicit resharding, via
   `CLUSTER SETSLOT ... MIGRATING`/`IMPORTING` -> Redis Cluster specification.
4. Kafka's keyed partitioner computes `murmur2(key) % numPartitions` -> Kafka
   `BuiltInPartitioner.java`.
5. HAProxy's `hash-balance-factor` skips an overloaded first-choice server for the next
   candidate the same hash would pick, until one has room; off by default -> HAProxy
   configuration manual.
6. The three-way growth comparison's exact moved fractions, and the hot-key overload ratios
   under plain, many-virtual-node, and bounded placement -> `examples.py`, this topic's own
   simulation, built directly from claims 1-5's stated mechanics.

## Changes from the chapter plan

1. **The exact shop sizing (ten nodes, twenty thousand keys, a quarter of traffic on one hot
   key, a balance factor of one and a half) is the builder's own choice**, as CHAPTER.md
   specifies for the chapter's shared running example; the thousand-point virtual-node count
   and the one-and-a-half balance factor are both taken directly from HAProxy's own documented
   example values, not invented.
2. **Python's built-in `hash()` was replaced with a fixed MD5-based digest hash** in
   `examples.py` after an early run produced a different ring-moved fraction on a second
   invocation: CPython randomly seeds `str` hashing per process (`PYTHONHASHSEED`) unless told
   otherwise, which would have made every number in this topic non-reproducible run to run (the
   same class of bug this site's own `de.software-delivery-workflow` topic documents). Fixed
   immediately upon discovery, before any number was written into OUTLINE.md or the reel.
3. **Cassandra's current default `num_tokens` is left unresolved**, as CHAPTER.md's own "not
   read yet" flagged it; the production guide gives example values and guidance but this topic
   does not assert a single current default without a version-pinned primary source stating it
   plainly.
4. **The ring's rebalance-on-join (claim 6 above) uses a direct `Ring` simulation (new node
   added, keys re-owned), while the fixed-slot table's rebalance is modeled as an explicit,
   bounded, evenly-spread slot reassignment** rather than simulating Redis's actual
   `redis-cli --cluster reshard` tool, which this topic's sandbox cannot run; the model is
   built directly from the spec's own stated mechanics (whole slots move, chosen by an
   operator or a tool) and flagged in FACT-CHECK.md as a synthesis, not a measured number from
   a real Redis Cluster.
