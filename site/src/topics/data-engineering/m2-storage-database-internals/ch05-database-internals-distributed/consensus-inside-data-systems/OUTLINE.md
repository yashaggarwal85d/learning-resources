# Outline — de.consensus-inside-data-systems

**Kind:** full, §5.3. About 15 minutes. No lab of its own.

## Scope (full syllabus line, three clauses)

"where Raft and Paxos actually run in a data stack (Kafka KRaft, etcd for Kubernetes, per-range
Raft in CockroachDB/TiKV, Multi-Paxos per DynamoDB partition), what a commit costs in round trips,
and what losing quorum looks like operationally" — the full syllabus line (the "theory in Ch.14"
and build-depth clauses are cross-references, not content this topic teaches, per `CHAPTER.md`).

- Clause 1: "where Raft and Paxos actually run in a data stack (Kafka KRaft, etcd for Kubernetes,
  per-range Raft in CockroachDB/TiKV, Multi-Paxos per DynamoDB partition)" — named directly from
  each system's own documentation in "Reveal: where this actually runs," and demonstrated as the
  global-vs-per-range contrast across the reel's middle steps.
- Clause 2: "what a commit costs in round trips" — the second predict/reveal measures the real
  round-trip difference between a single-consensus-group commit and a cross-range (two-phase
  commit) transaction directly in `examples.py`.
- Clause 3: "what losing quorum looks like operationally" — the first predict/reveal and "Reveal:
  losing quorum, operationally" measure a real quorum-loss refusal directly, and the per-range
  contrast shows the blast radius that loss actually has.

## Outcomes

Name where Raft or Paxos actually runs inside a real data stack (Kafka's KRaft, etcd, per-range
Raft in CockroachDB/TiKV, Multi-Paxos per DynamoDB partition), from each system's own
documentation; state what a commit under consensus costs in round trips; explain, operationally
rather than theoretically, what losing quorum looks like and why a data system stops accepting
writes rather than risk a split-brain.

## Concept ledger

- **Introduces:** `consensus-raft-paxos-in-systems`.
- **Uses:** `two-phase-commit`, `cap-pacelc` — `two-phase-commit` for the cross-range commit cost
  contrast; `cap-pacelc` (topic 20) for the failure-domain vocabulary a quorum loss happens within.
- **Declared:** Raft/Paxos's own algorithmic content, assumed as background theory from
  Chapter 14, per `CHAPTER.md` — this topic names where consensus runs and what it costs
  operationally, without re-deriving leader election or log replication itself.

## Storyboard (10 steps)

1. **Hook.** Five nodes, two go dark at once. The other three keep accepting writes correctly,
   not by guessing.
2. **Predict** (within the first four steps): does a write need every node to agree, or just a
   majority?
3. **Reveal: majority, measured against unanimity.** Three of five reachable is already a
   majority; unanimity would have refused at the first failure.
4. **Reveal: losing quorum, operationally.** Below a majority, the group refuses the write
   outright. Takeaway.
5. **Reveal: one global group vs. many per-range groups.** One group's quorum loss halts every
   key; many groups' identical loss halts only one range. Takeaway.
6. **Predict.** Does a transaction spanning two consensus groups cost the same as a normal write?
   (satisfies the minimum-2-predict rule)
7. **Reveal: the round-trip cost, measured.** A single-group commit costs one round trip; a
   cross-range commit costs several times that. Takeaway.
8. **Reveal: where this actually runs.** Kafka's controller quorum, etcd's one global group,
   CockroachDB/TiKV's per-range groups — named from each system's own documentation.
9. **Recap.** Majority commits; losing quorum refuses; one group makes loss global, many groups
   make it local; crossing group boundaries costs real round trips.
10. **Prove it.** A rack failure touches one node in ten of a hundred per-range consensus groups.
    Does the whole cluster stop?

Engagement arc: hook (step 1); predict (step 2, within the first four steps); mechanism built
through the majority-vs-unanimity and global-vs-per-range contrasts (steps 3-5); second predict
(step 6, satisfying the minimum-2-predict rule) asking the reader to guess the cross-range commit
cost before step 7's reveal gives the real measured round trips; three takeaways (steps 4, 5, 7,
at or after the reel's own midpoint); recap (step 9); Prove it (step 10).

## Examples to execute

`examples.py`, no live lab (per `CHAPTER.md`): five real simulations.

1. `majority_quorum_tolerates_failures_unanimity_does_not`: with two of five members unreachable,
   a majority rule still commits while a unanimity rule refuses.
2. `losing_quorum_refuses_writes_rather_than_guessing`: with only two of five members reachable
   (below a majority), a write attempt is refused outright, not attempted or guessed.
3. `a_single_global_consensus_group_halts_everything_on_quorum_loss`: a single group covering an
   entire keyspace loses quorum, and zero of a thousand keys remain writable.
4. `per_range_consensus_groups_isolate_the_blast_radius`: with the identical quorum loss confined
   to one of ten independent per-range groups, nine of ten ranges stay fully writable.
5. `a_cross_range_commit_costs_more_round_trips_than_a_single_group_commit`: a single-group commit
   costs one round trip; a two-range, two-phase-committed transaction costs four.

All five verified via `python3 examples.py`.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 22's handoff verbatim): "Every mechanism in this
  section so far assumed replicas and shards stay in sync and agree on membership changes without
  a formal protocol for it. This topic is that protocol: where Raft and Paxos actually run inside
  a real data stack, what a commit costs in round trips, and what losing quorum looks like
  operationally."
- **Handoff** (to topic 24, verbatim): "Every mechanism in this section — replication,
  partitioning, consensus — is a building block. The next topic closes the section by showing a
  real system (Spanner's pattern) built from all of them at once."

## Claims list

1. Consensus involves multiple servers agreeing on values; once they reach a decision, that
   decision is final. — raft.github.io.
2. Typical consensus algorithms make progress when any majority of their servers is available;
   if more servers fail, they stop making progress but never return an incorrect result. —
   raft.github.io.
3. In KRaft mode, specific Kafka servers are selected to be controllers, and they participate in
   the metadata quorum. — Apache Kafka documentation.
4. A majority of Kafka's controllers must be alive to maintain availability. — Apache Kafka
   documentation.
5. etcd replicates all data within a single, consistent replication group. — etcd documentation.
6. Since etcd has only a single replication group, a modification only needs to go through the
   raft protocol once to commit. — etcd documentation.
7. CockroachDB uses a consensus algorithm requiring a quorum of replicas to agree on any changes
   to a range before those changes are committed. — CockroachDB documentation.
8. CockroachDB's Raft leader coordinates all writes to its Raft group and heartbeats followers;
   followers become candidates and hold new elections if heartbeats stop. — CockroachDB
   documentation.
9. The `examples.py` simulations, confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

None — all four named/implied sources (the Raft project's own site, Kafka's KRaft documentation,
etcd's documentation, CockroachDB's replication-layer documentation) fetched cleanly on the first
attempt, with no TLS failures or footnote-marker artifacts to work around. TiKV's own per-range
Raft documentation (named alongside CockroachDB in the chapter plan) is referenced by name in the
reel's "Reveal: where this actually runs" step without a separate quoted source, since CockroachDB's
own documentation already covers the identical per-range Raft mechanism with a direct, quotable
source, and TiKV documents the same architecture rather than a materially different one.
