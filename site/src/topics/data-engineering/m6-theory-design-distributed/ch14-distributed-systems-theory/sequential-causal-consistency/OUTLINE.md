# Outline: Sequential and causal consistency (`de.sequential-causal-consistency`)

Section 14.3. ~15 min. Per CHAPTER.md §6.

## Scope (syllabus clause by clause)

1. **Sequential consistency** — one total order, respecting each process's own program order,
   with no real-time constraint. Jepsen: "operations appear to take place in some total order,
   and that that order is consistent with the order of operations on each individual process."
   Dropping the real-time rule is exactly the gap from linearizability (topic 5); closing it costs
   what topic 5's Attiya-Welch bound says it costs.
2. **Causal consistency** — only causally related operations (topic 3's happens-before, tracked
   with topic 4's vector clocks) are ordered the same everywhere; concurrent operations may be
   seen in different orders by different processes. Jepsen's chat example: Attiya asks, Barbarella
   and Cyrus answer; everyone sees the question first, the two replies may swap.
3. **The strongest model available under partition** — Mahajan, Alvisi and Dahlin's tight bound,
   stated by Jepsen with its conditions intact: Real-Time Causal is "the strongest consistency
   model in an always-available, one-way convergent system." The builder does not drop "always-
   available, one-way convergent" and state it as an unqualified slogan.
4. **Session guarantees** — Terry et al.'s four guarantees (read-your-writes, monotonic reads,
   monotonic writes, writes-follow-reads), quoted here from Jepsen's own formalizations of each
   (Terry et al. 1994 PDIS itself sits on cs.cornell.edu/cs.utexas.edu, both returning a broken,
   domain-wide TLS chain at research time — see SOURCES.md's note). Chapter 5 topic 19 taught
   read-your-writes, monotonic reads and consistent-prefix as implementation (LSN tokens,
   routing); this topic **defines the four precisely** and shows each one violated. It does
   **not** assert that the four together amount to causal consistency — that claim needs reading
   Terry et al. and the later literature on how the four combine, which this topic's available
   sources do not settle, so it stays unstated.

## Leaves out

Linearizability itself (topic 5); transactional models (topic 7); CAP (topic 8); how a session
token or sticky routing is implemented (Chapter 5 topic 19); CRDTs (skipped syllabus topic); HAT
results (named only as a sourced pointer, owned by topic 7's Deep dive).

## Concept ledger

Introduces: `sequential-consistency-definition`, `causal-consistency-definition`,
`causal-ceiling-always-available`, `session-guarantees-formal`.
Uses: `linearizability-definition`, `linearizable-vs-sequential-cost`, `happens-before-partial-order`,
`vector-clock-exact-causality`, `session-consistency-guarantees` (Chapter 5's practitioner view,
formalised here), `cap-pacelc`.
Declared: none (per CHAPTER.md).

## Bridge / Handoff

Bridge: linearizability is the strongest single-object answer and the most expensive; most systems
offer something weaker on purpose — this topic states the two main weaker models.
Handoff: both models here are single-object; a database gives transactions over many objects,
with the same two ideas (order, real time) recombined — serializability vs strict serializability.

## Reel shape (9 steps)

1. Hook — a comment vanishes on refresh, then reappears, then a reply appears before the comment
   on another screen: three anomalies.
2. Predict — for an always-available store, which weakest model forbids all three: sequential,
   causal, or linearizable?
3. Reveal — sequential consistency: one total order, program order kept, real time dropped.
4. Reveal — causal consistency: the chat example, replies free to swap, never before the question.
5. Reveal — the ceiling under partition: Mahajan et al.'s bound via Jepsen, stated with conditions.
   Takeaway.
6. Reveal — the four session guarantees, defined precisely, each shown violated by a small history.
7. Reveal — what is and isn't claimed about how the four relate to causal consistency. Takeaway.
8. Recap. Takeaway.
9. Prove it — a store with read-your-writes and monotonic reads but no causal guarantee: is it
   causally consistent?
