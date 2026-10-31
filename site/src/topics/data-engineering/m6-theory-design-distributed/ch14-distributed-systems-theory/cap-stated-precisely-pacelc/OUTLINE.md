# Outline: CAP, stated precisely, and PACELC (`de.cap-stated-precisely-pacelc`)

Section 14.4. ~15 min. Per CHAPTER.md §8.

## Scope (syllabus clause by clause)

1. **Gilbert-Lynch's formal statement** — "In a network subject to communication failures, it is
   impossible for any web service to implement an atomic read/write shared memory that guarantees
   a response to every request." Atomic = linearizability (topic 5); available = "every request
   received by a non-failing node in the system must result in a response" (2002), restated as the
   liveness property "eventually, every request receives a response" (2012); partition tolerance
   = arbitrary message loss, over "fair executions."
2. **Proof sketch** — split replicas into two groups with all messages between them lost; the
   minority group cannot tell "a write happened on the other side" from "nothing happened", so it
   must refuse (lose availability) or answer and risk atomicity.
3. **The common misreadings** — "pick two" is wrong because a partition isn't chosen; Brewer's own
   words: the "2 of 3" formulation "was always misleading because it tended to oversimplify the
   tensions among properties." CP/AP is a per-operation choice, not a system label. The theorem
   says nothing about latency.
4. **PACELC's else-branch** — Abadi's own framing, quoted from his original blog post and his
   paper's own abstract: if a partition (P), choose A or C; else (E), even with no partition,
   choose latency (L) or consistency (C). Four quadrants, each placed from Abadi's own worked
   examples (Dynamo-family PA/EL, ACID systems PC/EC, PNUTS PC/EL).
5. **Why Spanner is "effectively CA"** — Brewer's own blog post: "no" technically (it is a CP
   system), "yes" in effect, because partitions are rare on Google's private network. "Effectively"
   is a statement about probability, not an exception to the theorem.

## Leaves out

The PA/EL-PC/EC classification of named systems and failure domains (Chapter 5 topic 20, built on,
not repeated); linearizability and the other models (topics 5-7, used, not re-taught); the
mechanisms that buy availability or consistency (topics 9-13); FLP (skipped syllabus topic, named
in topic 9's Deep dive); CRDTs/CALM (skipped syllabus topics, named in topic 13's Deep dive).

## Concept ledger

Introduces: `cap-theorem-formal-statement`, `cap-misreadings-and-per-operation-choice`,
`pacelc-else-branch`, `effectively-ca-meaning`.
Uses, per CHAPTER.md: `linearizability-definition`, `causal-ceiling-always-available`,
`consistency-model-map`, `timing-models-sync-partial-async`, `link-models-fair-loss-reliable`,
`cap-pacelc` (Chapter 5), `replication-ack-modes`, `distributed-sql-architecture` (Chapter 5),
`partitioning-schemes`. Grepping `registry.ts` confirms `linearizability-definition` (topic 5),
`causal-ceiling-always-available` (topic 6) and `consistency-model-map` (topic 7) are genuinely
introduced already; none of the remaining six (`timing-models-sync-partial-async`,
`link-models-fair-loss-reliable`, `cap-pacelc`, `replication-ack-modes`,
`distributed-sql-architecture`, `partitioning-schemes`) is `introduces`d by any built topic yet,
so they move to `declared`, per the same ledger-correction rule used in topics 5 and 7.
Declared: `timing-models-sync-partial-async`, `link-models-fair-loss-reliable`, `cap-pacelc`,
`replication-ack-modes`, `distributed-sql-architecture`, `partitioning-schemes`.

## Reel shape (9 steps)

1. Hook — "we chose AP, so we never go down"; a partition, two customers, the same last unit sold
   twice.
2. Predict — which of CAP's three words did the system keep, which give up, and what else could it
   have chosen instead of overselling?
3. Reveal — the theorem's three exact conditions, stated from Gilbert-Lynch's own words.
4. Reveal — the proof sketch on the chapter's own stock register: the minority side cannot tell
   the two histories apart.
5. Reveal — "pick two" is wrong, and why; CP/AP is per-operation, not a system label. Takeaway.
6. Reveal — PACELC's else-branch, Abadi's own four quadrants.
7. Reveal — Spanner is "effectively CA", not literally — a statement about probability. Takeaway.
8. Recap. Takeaway.
9. Prove it — a system that has never yet experienced a partition: does CAP apply to it?
