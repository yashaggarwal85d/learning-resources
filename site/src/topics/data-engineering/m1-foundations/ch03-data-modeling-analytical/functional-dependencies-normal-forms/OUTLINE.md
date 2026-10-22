# Outline — Functional dependencies and normal forms

Full topic, about fourteen minutes. Scope (CHAPTER.md / syllabus):
- FDs, attribute closure and candidate keys — formal definitions, with a worked closure computation.
- 1NF→BCNF (and 4NF for multivalued dependencies) — each normal form's exact additional guarantee.
- Lossless and dependency-preserving decomposition — what a decomposition must preserve, and the classic
  trade-off where both can't be had at once.
- Deliberate denormalization for analytics and the update anomalies it brings back.
- Leaves key *design* (natural vs. surrogate vs. hash) to the next topic.

Running example: a shop schema with order_id, customer_id, customer_email and amount — the same relationship
this chapter has used since topic 2, built fresh here since no `customers` table exists on this sandbox.

1. **Hook.** The same six rows of data, two different schemas: one needs one update for a change that should
   only ever be one fact; the other needs several, and is one missed row away from lying about which email a
   customer actually has.
2. **Predict: does normalizing always cost a join later?** Setting up the general trade before the formal
   definitions arrive.
3. **Reveal: what a functional dependency actually is.** X → Y: every X value is associated with precisely one
   Y value. The shop example: order_id → customer_id, customer_id → customer_email.
4. **Reveal: attribute closure, computed.** Starting from {order_id}, which attributes does the closure reach,
   firing each FD in turn, over this topic's own FD set? Settles once no new attribute lights up.
5. **Reveal: candidate keys, from the closure.** A candidate key is a minimal set whose closure is every
   attribute. order_id alone closes to everything here; it is the (only) candidate key.
6. **Predict: is {customer_id} a candidate key too?** Plausible wrong answer: yes, since it determines
   customer_email.
7. **Reveal: why {customer_id} is not a candidate key.** Its closure never reaches amount or order_id; it
   determines customer_email alone, not every attribute.
8. **Reveal: 1NF to 3NF, each one's exact guarantee.** 1NF: atomic values, no repeating groups. 2NF: no
   non-key attribute depends on only part of a composite key. 3NF: no non-key attribute depends on another
   non-key attribute (no transitive dependency).
9. **Reveal: BCNF, the stricter cut.** For every FD X → Y, X must be a superkey (or the FD is trivial) — BCNF
   catches a case 3NF lets through, where the determinant isn't a full candidate key.
10. **Reveal: 4NF, for multivalued dependencies.** A different kind of dependency (one value, many facts, not
    one) that functional dependencies alone can't express or fix.
11. **Reveal: lossless decomposition, and Heath's theorem.** Splitting on a functional dependency's attributes
    guarantees the join back loses nothing — the formal floor every decomposition must clear.
12. **Reveal: dependency preservation is a separate guarantee, and BCNF can cost it.** A decomposition can be
    lossless yet still lose the ability to check an original FD without a join; the classic case where lossless
    and dependency-preserving can't both be had going all the way to BCNF.
13. **Reveal: this topic's own measured anomaly.** The denormalized vs. normalized update counts (5 vs. 1), and
    the missed-row inconsistency, measured directly.
14. **Reveal: denormalization is still a deliberate trade, not a mistake.** OLAP's scan-heavy shape (topic 2)
    makes the anomaly worth risking on purpose, for fewer joins at read time.
15. **Recap.** FD, closure, candidate key; the four-rung ladder and what each rung adds; lossless is mandatory,
    dependency-preserving is a separate, sometimes-sacrificed guarantee; denormalization trades anomaly risk for
    read speed, on purpose.
16. **Prove it.** Given a new FD set, which attribute set is the actual candidate key?

Predicts on steps 2 and 6 (step 2 is within the first four). Takeaways on steps 5, 9 and 14, at minimum.
