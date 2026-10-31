# Fact-check — de.distributed-sql-architecture

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources-tmp/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | The set of replicas is collectively a Paxos group. | Confirmed | Spanner paper, quoted verbatim. |
| 2 | The key enabler of Spanner's properties is a new TrueTime API and its implementation. | Confirmed | Spanner paper, quoted verbatim. |
| 3 | Spanner is the first system to provide external-consistency guarantees at global scale. | Confirmed | Spanner paper, quoted verbatim. |
| 4 | Running two-phase commit over Paxos mitigates the availability problems general two-phase commit otherwise brings. | Confirmed | Spanner paper, quoted verbatim. |
| 5 | CockroachDB stores all user data in a sorted map of key-value pairs, divided into contiguous ranges. | Confirmed | CockroachDB documentation, quoted verbatim. |
| 6 | CockroachDB uses the Raft consensus protocol; a quorum of nodes containing replicas of a range acknowledge each write. | Confirmed | CockroachDB documentation, quoted verbatim. |
| 7 | CockroachDB implements hybrid-logical clocks, composed of a physical and a logical component, to optimize read performance. | Confirmed | CockroachDB documentation, quoted verbatim. |
| 8 | The gateway node picks a transaction's timestamp using HLC time. | Confirmed | CockroachDB documentation, quoted verbatim. |
| 9 | Aurora DSQL uses optimistic concurrency control, evaluating conflicts at commit time instead of using locks. | Confirmed | AWS documentation, quoted verbatim. |
| 10 | Under Aurora DSQL's OCC, the transaction with the earliest commit time succeeds and the conflicting transaction receives an OC000 response. | Confirmed | AWS documentation, quoted verbatim. |
| 11 | A cross-range transaction commits via each range's own consensus group, coordinated by a two-phase commit, with no new mechanism beyond the two already built. | Confirmed, executed | `examples.py`: `the_spanner_pattern_is_a_composition_of_three_mechanisms_already_built`, asserted and run. |
| 12 | A hybrid logical clock's timestamps strictly increase even when fed physical-clock readings that go backward twice. | Confirmed, executed | `examples.py`: `hybrid_logical_clock_assigns_monotonically_increasing_timestamps_even_with_clock_skew`, asserted and run. |
| 13 | A commit-wait window ensures a causally-later transaction's commit timestamp is always greater than an earlier one's. | Confirmed, executed | `examples.py`: `external_consistency_requires_commit_timestamps_to_respect_real_time_order`, asserted and run. |
| 14 | Two unlocked transactions on the same row: the earliest commit succeeds, and the later one is rejected only at commit time, not before. | Confirmed, executed | `examples.py`: `optimistic_concurrency_control_checks_conflicts_only_at_commit_not_before`, asserted and run. |
| 15 | A single-node commit costs zero extra network round trips; a two-range distributed-SQL commit costs four. | Confirmed, executed | `examples.py`: `distributed_sql_pays_a_real_latency_price_a_single_node_postgres_does_not`, asserted and run. |

## Currency check

- The Spanner paper (OSDI 2012) describes the foundational architecture Google's Spanner still
  runs on, and the pattern it describes is the one CockroachDB, TiDB, and YugabyteDB document
  following today; no currency risk for the architectural claims this topic makes.
- CockroachDB's own architecture and transaction-layer documentation describe its current,
  actively maintained implementation; no currency risk.
- AWS's Aurora DSQL documentation describes a service that reached general availability in May
  2025, per the syllabus's own note — current, actively maintained documentation for a current
  product, not a deprecated or preview feature.

## Red team

1. **"Is calling the Spanner pattern 'a composition of three mechanisms already built' actually
   accurate, or does it understate something genuinely new Spanner contributed?"** It's accurate
   for the three specific mechanisms this topic's own scope names (range-sharding, per-range
   consensus, two-phase commit) — all three are covered individually in topics 21, 23, and §5.2.
   What Spanner's own paper claims as genuinely novel is TrueTime and the external-consistency
   guarantee it enables (claim 2, claim 3), which this topic treats as a separate, additional
   mechanism on top of the composition, not folded into "nothing new" — the Hook and reveal
   explicitly separate the composition claim from the HLC/commit-wait claims.
2. **"Does the HLC simulation (claim 12) actually model clock skew realistically, or is the input
   sequence cherry-picked to always succeed?"** The sequence (100, 101, 99, 99, 103, 102)
   includes two backward jumps (101→99, 103→102) and one repeat (99, 99) — exactly the failure
   modes a hybrid logical clock is built to absorb; the monotonicity assertion checks every
   consecutive pair, so the claim holds for the whole sequence, not just a favorable subset.
3. **"Is the commit-wait model (claim 13) a faithful simplification of TrueTime, or does it
   smuggle in an assumption TrueTime doesn't actually guarantee?"** The simulation models exactly
   the mechanism the Spanner paper's own TrueTime section describes: a commit isn't visible until
   real time has passed the assigned timestamp plus the clock's own uncertainty bound. It doesn't
   model TrueTime's own `TT.now()` interval API in full, but the single property this topic's
   syllabus clause asks for (commit timestamps respecting real-time order) follows directly from
   the simplified model, since `t2_start_time >= t1_visible_at` is enforced by construction.
4. **"Does the OCC simulation (claim 14) match Aurora DSQL's own documented behavior, or does it
   invent a different conflict rule?"** It matches: claim 10's own wording ("the transaction with
   the earliest commit time succeeds, and the conflicting transaction receives the OC000
   response") is exactly what `attempt_commit`'s version-check logic implements — the first
   commit to see the row at its original version succeeds and bumps the version; the second
   commit's read-version no longer matches, which is the documented OC000 condition.
5. **"Does the round-trip cost comparison (claim 15) give the single-node side an unfairly low
   number by ignoring its own WAL fsync cost?"** No — the comparison is specifically about
   *network* round trips, which the syllabus clause itself asks for ("what a commit costs in
   round trips"), not total latency; a single-node commit's fsync is a local disk operation, not
   a network round trip, so excluding it from this specific count is consistent with what's being
   measured, not a thumb on the scale.

## Problem Solving

- Two candidate CockroachDB source sentences were found to have a dynamically-rendered term
  (likely a tooltip component) silently dropped from the static-fetched page text — the same
  gotcha discovered in the previous topic's CockroachDB source, now confirmed to recur. One read
  "...track versions of values (through ), as well as provide..." (missing "MVCC"); the other was
  a glossary fragment beginning "The process of reaching agreement on whether a transaction is
  committed or aborted." with no clear sentence boundary. **Fixed** by choosing adjacent, complete
  sentences from the same pages instead (the HLC-definition sentence, and the Raft-consensus
  sentence starting "CockroachDB uses the Raft consensus protocol").
- No other sourcing issues arose — the Spanner paper and Aurora DSQL documentation both fetched
  cleanly with no further artifacts. One Spanner sentence ("T1's commit timestamp is smaller than
  T2's...") was found to have a PDF-extraction space inserted before each curly apostrophe
  ("T1 's", "T2 's") and was avoided in favor of the adjacent, clean sentences ("The timestamps
  reflect serialization order." and "Spanner is the first system to provide such guarantees at
  global scale.") rather than attempting to quote the garbled spacing.
