# Fact-check — de.consensus-inside-data-systems

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources-tmp/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Consensus involves multiple servers agreeing on values; once they reach a decision, that decision is final. | Confirmed | raft.github.io, quoted verbatim. |
| 2 | Typical consensus algorithms make progress when any majority of their servers is available; if more servers fail, they stop making progress but never return an incorrect result. | Confirmed | raft.github.io, quoted verbatim. |
| 3 | In KRaft mode, specific Kafka servers are selected to be controllers, and they participate in the metadata quorum. | Confirmed | Apache Kafka documentation, quoted verbatim. |
| 4 | A majority of Kafka's controllers must be alive to maintain availability. | Confirmed | Apache Kafka documentation, quoted verbatim. |
| 5 | etcd replicates all data within a single, consistent replication group. | Confirmed | etcd documentation, quoted verbatim. |
| 6 | Since etcd has only a single replication group, a modification only needs to go through the raft protocol once to commit. | Confirmed | etcd documentation, quoted verbatim. |
| 7 | CockroachDB uses a consensus algorithm requiring a quorum of replicas to agree on any changes to a range before those changes are committed. | Confirmed | CockroachDB documentation, quoted verbatim. |
| 8 | CockroachDB's Raft leader coordinates all writes to its own Raft group and heartbeats followers; followers become candidates and hold new elections if heartbeats stop. | Confirmed | CockroachDB documentation, quoted verbatim. |
| 9 | With two of five members unreachable, a majority rule still commits while a unanimity rule refuses. | Confirmed, executed | `examples.py`: `majority_quorum_tolerates_failures_unanimity_does_not`, asserted and run. |
| 10 | With only two of five members reachable (below a majority), a write attempt is refused outright, not attempted or guessed. | Confirmed, executed | `examples.py`: `losing_quorum_refuses_writes_rather_than_guessing`, asserted and run. |
| 11 | A single consensus group covering an entire keyspace losing quorum leaves zero of its keys writable, while the identical quorum loss confined to one of ten independent per-range groups leaves nine of ten ranges fully writable. | Confirmed, executed | `examples.py`: `a_single_global_consensus_group_halts_everything_on_quorum_loss` and `per_range_consensus_groups_isolate_the_blast_radius`, both asserted and run. |
| 12 | A single-consensus-group commit costs one round trip; a transaction spanning two groups, coordinated with a two-phase commit, costs four. | Confirmed, executed | `examples.py`: `a_cross_range_commit_costs_more_round_trips_than_a_single_group_commit`, asserted and run. |

## Currency check

- raft.github.io is the Raft algorithm's own maintained project site; the majority-quorum and
  progress-under-failure properties it states are the algorithm's foundational guarantees and
  have not changed since Raft's original publication; no currency risk.
- Apache Kafka's KRaft documentation (version 4.4 docs) describes the current, actively
  maintained metadata-quorum architecture that replaced ZooKeeper-based coordination; no currency
  risk — KRaft is Kafka's current, default coordination mechanism.
- etcd's own documentation describes its current, maintained replication design (v3.6 docs); the
  single-replication-group architecture is a foundational design choice unchanged since etcd's
  early versions, not a deprecated one.
- CockroachDB's Replication Layer architecture docs are current, maintained documentation; the
  per-range Raft group design is CockroachDB's current, active architecture, not a legacy one.

## Red team

1. **"Does the overlap property this topic's own expert note claims (any two majorities from the
   same group must share a member) actually hold, or is it assumed without justification?"** It
   holds by the pigeonhole principle: in a group of `n` members, a majority has at least
   `floor(n/2) + 1` members; two such majorities drawn from the same `n`-member group must
   together occupy at least `2 * (floor(n/2) + 1)` member-slots, which exceeds `n` for any `n`,
   forcing at least one member to appear in both — this is a standard, well-known property of
   majority quorums, not specific to this topic's own claim.
2. **"Is the per-range blast-radius claim (claim 11) sensitive to which specific range loses
   quorum, or does it generalize?"** It generalizes: each `ConsensusGroup` instance in
   `per_range_consensus_groups_isolate_the_blast_radius` tracks its own independent `unreachable`
   set, with no shared state between groups, so which specific range's set is populated is
   arbitrary — the result (exactly the affected group loses quorum, every other group is
   unaffected) follows from the groups' independence, not from range 3 specifically.
3. **"Does the round-trip cost model (claim 12) oversimplify a real two-phase commit, given it
   doesn't model network latency variance or retries?"** The model is intentionally simplified to
   the round-trip *count*, which is the specific claim the syllabus clause asks for ("what a
   commit costs in round trips") — it counts the minimum round trips a correct two-phase commit
   across two ranges requires (one prepare round trip, one commit round trip, each needing its own
   single-group round trip to reach its own majority), not every possible real-world cost; this is
   stated explicitly in the function's own docstring, not presented as a complete latency model.
4. **"Is attributing etcd's single-group design and CockroachDB's per-range design to 'the same
   underlying quorum mechanism, different partitioning of it' an unjustified unification of two
   different systems?"** No — both systems' own quotes describe the identical mechanism (a
   majority of members in a Raft group must agree before a write commits); the difference the
   topic names is explicitly about how many such groups exist and how the keyspace is divided
   among them, which both systems' own documentation states directly (etcd: "a single consistent
   replication group"; CockroachDB: one group per range) — the topic doesn't claim the algorithms
   themselves differ, only the partitioning of consensus groups across the keyspace.
5. **"Does the 'Prove it' answer (a rack failure removing one node from ten groups doesn't cause a
   cluster-wide outage) actually follow from what's measured, or does it assume a specific,
   favorable failure pattern?"** It follows directly from the majority-quorum arithmetic already
   established in claim 9: a five-member group with one member down still has four reachable,
   which exceeds the majority threshold of three regardless of which specific member went down or
   which specific group it belongs to — the scenario is constructed so exactly one member is lost
   per affected group (never a majority), which is the stated premise, not a cherry-picked
   favorable case.

## Problem Solving

- No sourcing issues arose for this topic. All four sources (the Raft project's own site, Kafka's
  KRaft documentation, etcd's documentation, CockroachDB's replication-layer documentation)
  fetched cleanly on the first attempt, with no TLS failures, footnote-marker artifacts, or
  broken-formatting quotes to work around — a change from the previous three topics in this
  chapter's tail, each of which needed at least one source substitution or quote-matching fix.
- One candidate CockroachDB sentence ("Raft organizes all nodes that contain a [replica] of a
  [range] into a group...") was found to have a dynamically-rendered term dropped from the fetched
  text (likely a tooltip component that didn't render in the static fetch), leaving a garbled
  "a of a" fragment. **Fixed** by choosing a different, complete sentence from the same page (the
  leader/heartbeat/election sentence) instead of attempting to quote the garbled one.
