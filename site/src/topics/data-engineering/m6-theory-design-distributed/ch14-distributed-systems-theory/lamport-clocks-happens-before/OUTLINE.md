# OUTLINE: Lamport clocks and happens-before (`de.lamport-clocks-happens-before`)

## Learning outcomes
1. Draw the happens-before relation on a space-time diagram and mark each concurrent pair.
2. Run the scalar-clock update rule (IR1/IR2) by hand and check the Clock Condition holds.
3. Produce the tie-broken total order from scalar timestamps and show it respects causality.
4. Give a concurrent pair whose scalar timestamps nonetheless look ordered, and say what a system reading that order as causality would wrongly conclude.

## Reel steps (storyboard)
1. **Hook** — three services (order, payment, shipment), clocks that disagree; must produce one global log that never shows shipment before the payment that caused it, without using the clocks. `fig`: what do you use, and does the log's order between two independent orders mean anything?
2. **Predict** (within first four) — does the log's order between two unrelated customers' orders mean one happened first? Correct: no — a number can still separate them even though neither caused the other.
3. **Reveal: happens-before, three conditions** — Lamport's own definition (program order, message send/receipt, transitivity); concurrent = neither chain exists.
4. **Reveal: the scalar clock and its two rules** — IR1 (increment between events), IR2 (stamp sends, advance past received timestamps); the Clock Condition (`a → b ⇒ C(a) < C(b)`) follows. `takeaway`.
5. **Reveal: ticking through skew, same guarantee** — the clock condition holds on the causal chain no matter how the underlying physical clocks (topic 2) disagree, because the scalar clock never reads one.
6. **Reveal: the tie-broken total order** — break ties by an arbitrary total order of process identifiers; the result never contradicts happens-before, and is what the resource-scheduling (mutual exclusion) algorithm is built on. `takeaway`.
7. **Reveal: the total order's blind spot** — the converse fails: `C(a) < C(b)` does not imply `a → b`; two concurrent events get an arbitrary order from the numbers, with nothing marking them as independent. Lamport's own anomalous-behavior example (the phone call outside the system).
8. **Recap** — happens-before is a partial order built from three conditions; a scalar clock respects it via two local rules, under any clock skew; the tie-broken total order never contradicts causality, which is what makes it usable; but the total order cannot tell you which pairs were actually concurrent. `takeaway`.
9. **Prove it** (second predict) — a system reads two requests' scalar timestamps as "request B came after request A, so B depends on A." Is that conclusion always safe?

## Engagement arc
- Hook: step 1.
- Predicts: steps 2 and 9.
- Takeaways: steps 4, 6, 8 (three).
- Recap: step 8.

## Narrator's line of thought
- Step 1: she names the trap directly — a clock reading agreement is not the same question as who-caused-what, and this topic answers the second question without touching a clock at all.
- Step 3: she is precise about what "chain" means — program order on one process, or a send linked to its matching receipt, or a chain of those; anything outside that chain is, by definition, concurrent, not "unknown."
- Step 4: she treats IR1/IR2 as mechanical and almost boring on purpose — the power is in how little the rule needs to know to guarantee the Clock Condition.
- Step 5: she makes the point sharp — nothing about the scalar clock's guarantee depended on any physical clock behaving well, because it never consulted one.
- Step 6: she's careful about what the total order buys you — a resource scheduler can use it to grant requests in a definite order that's at least never backwards from causality.
- Step 7: she treats the converse's failure as the chapter's central warning, not a footnote — a system that reads "smaller number, so earlier cause" where none exists will act on a dependency that was never there.
- Step 9: she answers precisely — no, not always; it's only safe when the "depends on" conclusion is also independently true by happens-before, which the numbers alone cannot confirm or deny.

## Post-notes headings (Deep dive)
- **Internals: the three conditions and the clock condition's proof sketch** — IR1/C1 and IR2/C2 worked through, the pictorial "tick line" argument, the Strong Clock Condition and the anomalous-behavior example in the paper's own vocabulary.
- **Lab: a scalar clock under injected physical skew** — the simulator's Clock Condition check surviving arbitrary clock disagreement.
- **Production: the request that looked causal and wasn't** — a generic version of Lamport's phone-call anomaly, named for a modern distributed-queue or event-log system.
- **Frontier: from one number to detecting concurrency** — why a strictly stronger structure is needed to tell "ordered" apart from "concurrent but numbered," without yet building it (topic 4's job).
- **Where this goes next** — if a system needs to detect two writes that genuinely conflict, a single number isn't enough; it needs one counter per process, watching all of them: a vector clock.

## Examples to execute and what they assert
- The happens-before graph built from the hook's three-lane example is acyclic, and the (shipment, other_customer) pair comes back concurrent.
- The scalar-clock update rule (IR1/IR2) produces strictly increasing stamps along the causal chain order → payment → shipment.
- The same chain's Clock Condition holds regardless of injected physical-clock skew, because the scalar clock never reads a physical clock.
- A constructed tie case (two processes' scalar clocks land on the same value with no message between them) is resolved into a definite total order by an arbitrary process-id tie-break.
- The independent customer's order gets a scalar stamp that differs from shipment's, despite being concurrent with it — the converse-failure case made concrete.

## Bridge and handoff
- Bridge: answers topic 2's handoff (if a timestamp can't be trusted, what can — not a time, but who could have known what).
- Handoff: a Lamport clock orders everything but cannot say which pairs were independent; a store that needs to detect conflicting concurrent writes needs a vector clock (topic 4).

## Concept ledger
- **Introduces:** `happens-before-partial-order`, `lamport-scalar-clock`, `clock-condition-total-order`.
- **Uses:** `timing-models-sync-partial-async` (topic 1), `clock-drift-ntp-error`, `last-write-wins-clock-hazard` (topic 2), `dag`, `graph-traversal` (Chapter 1, verified present in `registry.ts`).
- **Declared:** none.

## Changes from the chapter plan
None.

## Claims list
1. The happens-before relation's formal three-condition definition, and concurrency as its negation both ways → Lamport 1978 (quoted).
2. "Happened before" is only a partial ordering → Lamport 1978 (quoted).
3. The Clock Condition (`a → b ⇒ C(a) < C(b)`) and the two implementation rules IR1/IR2 that guarantee it → Lamport 1978 (quoted).
4. The tie-broken total order construction using an arbitrary total order of process identifiers, and that it extends happens-before → Lamport 1978 (quoted).
5. The total ordering is "somewhat arbitrary" and can produce anomalous behavior when it disagrees with external, out-of-band precedence → Lamport 1978 (quoted).
6. The phone-call anomaly: an external precedence relation the system cannot observe can make the algorithm order two requests the "wrong" way relative to it → Lamport 1978 (quoted).
7. The lab's results (happens-before acyclicity, the Clock Condition holding under skew, the converse failing for a genuinely concurrent pair) → `examples.py`, executed, asserted.
