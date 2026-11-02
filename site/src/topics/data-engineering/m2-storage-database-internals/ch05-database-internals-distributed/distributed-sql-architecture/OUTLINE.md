# Outline — de.distributed-sql-architecture

**Kind:** full, §5.3. About 15 minutes. No lab of its own.

## Scope (full syllabus line, three clauses)

"the Spanner pattern made mainstream: range-sharded keyspace, consensus group per range, MVCC
with timestamps (TrueTime, hybrid logical clocks), and 2PC across ranges; CockroachDB, TiDB,
YugabyteDB, and Aurora DSQL's alternative (optimistic concurrency with conflict checks only at
commit, GA May 2025); the latency price and when 'shard a boring Postgres' wins instead" — the
full syllabus line (the "M6 case study" clause is a cross-reference, not content this topic
teaches, per `CHAPTER.md`).

- Clause 1: "the Spanner pattern made mainstream: range-sharded keyspace, consensus group per
  range, MVCC with timestamps (TrueTime, hybrid logical clocks), and 2PC across ranges" — the
  first predict/reveal shows the pattern is a composition of topics 21/23/§5.2's own mechanisms;
  the HLC and commit-wait reveals measure the timestamp machinery directly.
- Clause 2: "CockroachDB, TiDB, YugabyteDB, and Aurora DSQL's alternative (optimistic concurrency
  with conflict checks only at commit, GA May 2025)" — CockroachDB named as the Spanner-pattern
  system throughout; Aurora DSQL's own documented OCC alternative measured directly in the
  second predict/reveal, contrasted against the pessimistic lock-table approach Spanner itself
  uses.
- Clause 3: "the latency price and when 'shard a boring Postgres' wins instead" — the final
  reveal and Prove It measure the real round-trip cost gap between a single-node commit and a
  cross-range distributed-SQL commit directly.

## Outcomes

Describe the Spanner pattern precisely (a range-sharded keyspace, a consensus group per range,
MVCC with timestamps via TrueTime or a hybrid logical clock, 2PC across ranges) as the composition
of topics 21-23's own mechanisms; name CockroachDB, TiDB and YugabyteDB as real systems following
this pattern and Aurora DSQL's documented alternative (optimistic concurrency, conflict checks
only at commit); state the real latency price distributed SQL pays for this and when "shard a
boring Postgres yourself" wins instead.

## Concept ledger

- **Introduces:** `distributed-sql-architecture`.
- **Uses:** `consensus-raft-paxos-in-systems` (topic 23), `mvcc-versioning`, `two-phase-commit`
  (§5.2) — confirmed `introduces`d at each topic's own `registry.ts` entry.
- **Declared:** none beyond topic 23, per `CHAPTER.md`.

## Storyboard (10 steps)

1. **Hook.** Range-sharding, per-range consensus, two-phase commit — three mechanisms already
   built separately. One real system runs all three together.
2. **Predict** (within the first four steps): is the Spanner pattern a genuinely new mechanism,
   or entirely a composition of pieces already covered?
3. **Reveal: the composition, measured.** A two-range transaction: each range's own consensus
   commits its own piece, then a two-phase commit gets both to agree.
4. **Reveal: a clock that never goes backward.** A hybrid logical clock's timestamps stay
   strictly increasing even with real, skewed physical-clock readings. Takeaway.
5. **Reveal: commit wait, measured.** A commit waits out its own clock uncertainty before being
   visible, which is exactly what guarantees external consistency. Takeaway.
6. **Predict.** Does an optimistic concurrency scheme catch a conflict immediately or only at
   commit? (satisfies the minimum-2-predict rule)
7. **Reveal: optimistic concurrency, measured.** Both transactions read an unlocked row; the
   loser only discovers the conflict when its own commit is rejected. Takeaway.
8. **Reveal: the real latency price.** A single-node commit pays zero extra round trips; the
   identical write spread across ranges pays for several.
9. **Recap.** The pattern composes three mechanisms; HLC and commit-wait buy external
   consistency; optimistic concurrency checks late; none of it is free.
10. **Prove it.** A dataset that fits on one machine, choosing between distributed SQL and plain
    Postgres.

Engagement arc: hook (step 1); predict (step 2, within the first four steps); mechanism built
through the composition-then-clock contrast (steps 3-5); second predict (step 6, satisfying the
minimum-2-predict rule) asking the reader to guess when an OCC conflict surfaces before step 7's
reveal gives the real measured result; three takeaways (steps 4, 5, 7, at or after the reel's own
midpoint); recap (step 9); Prove it (step 10).

## Examples to execute

`examples.py`, no live lab (per `CHAPTER.md`): five real simulations.

1. `the_spanner_pattern_is_a_composition_of_three_mechanisms_already_built`: a cross-range
   transaction commits via each range's own consensus group, coordinated by a two-phase commit.
2. `hybrid_logical_clock_assigns_monotonically_increasing_timestamps_even_with_clock_skew`: an
   HLC's timestamps strictly increase even when fed physical-clock readings that go backward.
3. `external_consistency_requires_commit_timestamps_to_respect_real_time_order`: a commit-wait
   window ensures a causally-later transaction always gets a larger timestamp.
4. `optimistic_concurrency_control_checks_conflicts_only_at_commit_not_before`: two unlocked
   transactions on the same row; the earliest commit succeeds, the later one is rejected only at
   commit time.
5. `distributed_sql_pays_a_real_latency_price_a_single_node_postgres_does_not`: a single-node
   commit costs zero extra round trips; a two-range distributed-SQL commit costs four.

All five verified via `python3 examples.py`.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 23's handoff verbatim): "Every mechanism in this
  section — replication, partitioning, consensus — is a building block. This topic closes the
  section by showing a real system built from all of them at once: the Spanner pattern, and the
  alternative systems and trade-offs that followed it."
- **Handoff** (to the next section, verbatim): "Every mechanism in this chapter so far protected
  a write. The next section turns to the read side most of that protection exists for in the
  first place: caching, starting with the patterns and eviction policies every cache is built
  from."

## Claims list

1. The set of replicas is collectively a Paxos group. — Spanner paper (Corbett et al., OSDI
   2012).
2. The key enabler of Spanner's properties is a new TrueTime API and its implementation. —
   Spanner paper.
3. Spanner is the first system to provide external-consistency guarantees at global scale. —
   Spanner paper.
4. Running two-phase commit over Paxos mitigates the availability problems general two-phase
   commit otherwise brings. — Spanner paper.
5. CockroachDB stores all user data in a sorted map of key-value pairs, divided into contiguous
   ranges. — CockroachDB documentation.
6. CockroachDB uses the Raft consensus protocol; a quorum of nodes containing replicas of a range
   acknowledge each write. — CockroachDB documentation.
7. CockroachDB implements hybrid-logical clocks, composed of a physical component and a logical
   component, to optimize read performance. — CockroachDB documentation.
8. In CockroachDB, the gateway node picks a transaction's timestamp using HLC time. —
   CockroachDB documentation.
9. Aurora DSQL uses optimistic concurrency control, evaluating conflicts at commit time instead
   of using locks. — AWS documentation.
10. Under Aurora DSQL's OCC, the transaction with the earliest commit time succeeds and the
    conflicting transaction receives an OC000 response. — AWS documentation.
11. The `examples.py` simulations, confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

None — all three named sources (the Spanner paper, CockroachDB's own architecture documentation,
Aurora DSQL's own documentation) fetched cleanly on the first attempt. Two candidate CockroachDB
sentences were dropped after discovering the same dynamically-rendered-term artifact found in the
previous topic's CockroachDB source (a tooltip term silently missing from the static-fetched
text, e.g. "through ()" instead of "through MVCC"); replaced with adjacent, complete sentences
from the same pages instead of attempting to quote the garbled text.
