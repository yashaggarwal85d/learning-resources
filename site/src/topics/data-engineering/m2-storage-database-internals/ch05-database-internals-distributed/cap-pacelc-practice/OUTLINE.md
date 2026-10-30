# Outline — de.cap-pacelc-practice

**Kind:** full, §5.3. About 15 minutes. No lab of its own.

## Scope (full syllabus line, three clauses)

"CAP as a statement about behaviour during a partition (PA vs PC); PACELC adding the normal-case
latency-vs-consistency trade (EL vs EC), with systems classified (Dynamo/Cassandra PA/EL, Spanner
PC/EC); failure domains (process, host, rack, AZ, region) as what 'partition' means physically."

- Clause 1: "CAP as a statement about behaviour during a partition (PA vs PC)" — CAP stated
  precisely from Brewer's own retrospective: a choice that only applies while a partition is
  actually happening, not a claim about normal operation.
- Clause 2: "PACELC adding the normal-case latency-vs-consistency trade (EL vs EC), with systems
  classified (Dynamo/Cassandra PA/EL, Spanner PC/EC)" — Abadi's own PACELC, and two real systems
  placed on its grid from their own documented designs, quoted directly.
- Clause 3: "failure domains (process, host, rack, AZ, region) as what 'partition' means
  physically" — the real containment hierarchy a "partition" refers to physically, built and
  checked as a real nested structure in `examples.py`.

## Outcomes

State CAP precisely as a statement about behaviour *during* a partition (PA vs. PC), not a claim
about normal operation; explain what PACELC adds (the normal-case latency-vs-consistency trade, EL
vs. EC); classify real systems (Dynamo/Cassandra as PA/EL, Spanner as PC/EC) and justify the
classification from their own documented designs; name the real failure domains (process, host,
rack, AZ, region) that "a partition" means physically.

## Concept ledger

- **Introduces:** `cap-pacelc`. (Already `declared` once, by `de.cap-stated-precisely-pacelc`,
  Chapter 14 §14.4, built before this topic in build order even though it comes later in the
  syllabus — confirmed via `registry.ts`, that entry's own `declared` array.)
- **Uses:** `replication-ack-modes` (topic 17) — confirmed `introduces`d at `registry.ts` line 4521.
- **Declared:** none beyond topic 19, per `CHAPTER.md`.

## Storyboard (10 steps)

1. **Hook.** Two systems both claim to handle network partitions. One keeps answering every
   request through the partition; the other stops answering on one side entirely. Both are telling
   the truth.
2. **Predict** (within the first four steps): if a system claims "CA" — consistent and
   available — what happens the moment a real partition hits it?
3. **Reveal: CAP, stated precisely.** Not a permanent choice — a choice that only exists *during*
   a partition. Outside one, nothing forces the trade.
4. **Reveal: PA vs PC, the actual choice.** One side of a partition either answers (and risks being
   wrong) or refuses (and stays correct). That is the whole theorem.
5. **Reveal: PACELC's addition.** Even with no partition at all, there's still a trade: latency
   against consistency, every single request.
6. **Predict.** Dynamo gives up consistency during a partition, for availability. Does it also
   behave that way with no partition at all?
7. **Reveal: Dynamo and Spanner, classified.** Dynamo: PA/EL, by its own documented design.
   Spanner: PC/EC, by its own documented design — the opposite choice on both axes. Takeaway.
8. **Reveal: failure domains, physically.** A process, inside a host, inside a rack, inside an
   availability zone, inside a region — each one a real way "a partition" can actually happen.
   Takeaway.
9. **Recap.** A partition forces PA or PC; PACELC adds the trade that exists even without one;
   both are choices made by real, nameable physical failures.
10. **Prove it.** A single host crashes in one availability zone. Which failure domains in the
    hierarchy does that actually partition, and which ones does it leave completely untouched?

Engagement arc: hook (step 1); predict (step 2, within the first four steps); mechanism built
through CAP then PACELC (steps 3-5); second predict (step 6, satisfying the minimum-2-predict
rule) asking the reader to guess whether Dynamo's partition-time choice also holds with no
partition, before step 7's reveal confirms it does; two takeaways (steps 7, 8, at or after the
reel's own midpoint); recap (step 9); Prove it (step 10).

## Examples to execute

`examples.py`, no live lab (per `CHAPTER.md`): two checked, executable pieces of the topic's own
classification work.

1. `each_domain_contains_the_one_below_it` / `losing_a_process_does_not_imply_losing_its_host` /
   `losing_a_region_implies_losing_everything_it_contains`: the failure-domain hierarchy built as a
   real nested-containment structure (process → host → rack → AZ → region) and checked the way a
   real deployment topology actually nests — losing an inner domain says nothing about the domains
   that contain it; losing an outer domain takes everything inside it.
2. `every_classification_is_backed_by_a_quote_not_an_assumption` /
   `dynamo_and_spanner_sit_on_opposite_quadrants`: each system's PACELC quadrant checked against
   its own quoted words from `SOURCES.md`, not assumed, confirming Dynamo and Spanner sit on
   opposite quadrants on both axes.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 19's handoff verbatim): "Lag is what a network
  partition costs you in the normal case. This topic names precisely what it costs you in the
  worst case: CAP's own PA-vs-PC choice, and PACELC's addition of the normal-case trade lag already
  demonstrated."
- **Handoff** (to topic 21, verbatim): "Every replication topic so far assumed the same data lived
  on every node. The next topic is the orthogonal axis: splitting the data itself across nodes,
  starting with the real schemes for doing it."

## Claims list

1. The CAP theorem states that any networked shared-data system can have at most two of three
   desirable properties: consistency, availability, and tolerance to network partitions. — Brewer.
2. Allowing at least one node to update state during a partition causes inconsistency; preserving
   consistency means one side must act as if unavailable. — Brewer.
3. Because partitions are rare, there is little reason to forfeit consistency or availability when
   the system is not partitioned. — Brewer.
4. Partition handling should: detect partitions, enter an explicit partition mode, and initiate a
   recovery process. — Brewer.
5. In Google, the primary partition usually resides within one datacenter; Paxos is used on the
   wide area for global consensus, as in Chubby. — Brewer.
6. PACELC: if there is a partition, trade availability against consistency; else, trade latency
   against consistency. — Abadi.
7. Dynamo-family systems (Cassandra, SimpleDB) are PA/EL: they give up consistency for availability
   under partition, and for lower latency under normal operation. — Abadi.
8. Fully ACID systems are PC/EC: they pay the availability and latency costs to keep consistency.
   — Abadi.
9. PNUTS is PC/EL: normal operation trades consistency for latency; under partition it gives up
   availability instead of further consistency. — Abadi.
10. Dynamo sacrifices consistency under certain failure scenarios to achieve high availability, and
    provides eventual consistency with asynchronous replica propagation. — Dynamo paper.
11. Spanner is a globally-distributed, synchronously-replicated database and the first system to
    support externally-consistent distributed transactions at global scale, via TrueTime. — Spanner
    paper.
12. The `examples.py` classification and failure-domain checks, confirmed and executed (see
    `FACT-CHECK.md`).

## Changes from the chapter plan

None. The chapter's own "no lab of its own" stands; the visual idea (failure domain hierarchy as
nested boxes, Dynamo/Cassandra and Spanner placed on the PA/PC-by-EL/EC grid) is built exactly as
specified.
