---
id: de.functional-dependencies-normal-forms
title: Functional dependencies and normal forms
---

<section data-section="outcomes">

## After this topic you can

- Compute an attribute closure by hand and use it to find a relation's candidate key or keys, rather than
  guessing which column "feels like" the key.
- Place a schema on the normal-form ladder from first through Boyce-Codd form, and state exactly what each rung
  adds over the one before it, not just recite the names in order.
- Explain why lossless decomposition is a non-negotiable requirement while dependency preservation is a separate
  guarantee that pushing all the way to Boyce-Codd form can cost.
- Name the specific anomaly (insertion, update, or deletion) that a particular denormalization choice reintroduces,
  and recognize when accepting that risk is a deliberate trade rather than an oversight.

</section>

<section data-section="internals">

## A little deeper

The closure computation in this topic's reveal is not a shortcut or a teaching simplification — it is the actual
definition of a candidate key, run to completion. Starting from `order_id` and firing every functional dependency
whose left side is already covered, the closure reaches every attribute in exactly two steps here, which is why
`order_id` alone is a candidate key and `customer_id` is not: its own closure stalls at `{customer_id,
customer_email}` and never reaches `order_id` or `amount`. The same mechanical process scales to relations with
far more attributes and dependencies than this chapter's own running example; `examples.py` runs the identical
algorithm in code, not by hand, as a check against a mistaken manual computation.

The update-anomaly measurement in this topic is a real demonstration, not a description: a throwaway schema was
built for this topic specifically, with a denormalized table repeating one customer's email across five orders
and a normalized two-table version holding it once. Changing that email required five row updates in the
denormalized table and one in the normalized table — and updating only four of the five denormalized rows, the
realistic version of the mistake, left two different email addresses on file for the same customer at the same
time. That inconsistency is exactly what Wikipedia's "Database normalization" article names as an update anomaly,
reproduced directly rather than taken on faith.

Dependency-preserving decomposition is worth sitting with longer than the reveal has room for: a decomposition
can be fully lossless — every row recoverable by rejoining — and still make it impossible to check some original
functional dependency without performing that join first. The classic case arises decomposing all the way to
Boyce-Codd normal form, where no decomposition exists that is simultaneously lossless, dependency-preserving, and
fully in BCNF for every possible set of functional dependencies. Third normal form is often chosen specifically
because a synthesis algorithm exists that guarantees both properties at once, at the cost of occasionally leaving
a BCNF violation in place.

</section>
