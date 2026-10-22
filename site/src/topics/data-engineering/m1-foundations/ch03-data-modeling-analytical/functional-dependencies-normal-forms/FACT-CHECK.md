# Fact-check — Functional dependencies and normal forms

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | A functional dependency X → Y means each X value is associated with precisely one Y value. | Confirmed, quoted directly. | Wikipedia, "Functional dependency" |
| 2 | A candidate key is a minimal set of attributes that functionally determine all attributes in a relation. | Confirmed, quoted directly. | Wikipedia, "Functional dependency" |
| 3 | The closure of a set of attributes is the set of attributes determinable from it via its functional dependencies. | Confirmed, quoted directly. | Wikipedia, "Functional dependency" |
| 4 | Splitting a relation on a functional dependency's attributes (Heath's theorem) guarantees a lossless join decomposition. | Confirmed, quoted directly. | Wikipedia, "Functional dependency" |
| 5 | Insertion, update and deletion anomalies are named failure modes of an unnormalized schema. | Confirmed, quoted directly (worked examples paraphrased from the source's faculty/course example onto this topic's own shop example). | Wikipedia, "Database normalization" |
| 6 | Most 3NF relations are free of insertion, update and deletion anomalies. | Confirmed, quoted directly. | Wikipedia, "Database normalization" |
| 7 | A relation is in BCNF iff for every FD X → Y, either the FD is trivial or X is a superkey; BCNF is strictly stronger than 3NF. | Confirmed, quoted directly. | Wikipedia, "Boyce–Codd normal form" |
| 8 | 4NF concerns multivalued dependencies, a more general kind than functional dependencies; an FD is a special case where every x determines exactly one y. | Confirmed, quoted directly. | Wikipedia, "Fourth normal form" |
| 9 | Updating a denormalized table's repeated customer_email required 5 row updates; the normalized two-table version required 1. | Measured directly (this topic's own throwaway schema). | This session's PostgreSQL 16.15 sandbox |
| 10 | Updating only 4 of the 5 denormalized rows left two different email addresses on file for the same customer at once. | Measured directly. | This session's PostgreSQL 16.15 sandbox |
| 11 | Dependency-preserving decomposition is a separate guarantee from losslessness, and decomposing all the way to BCNF can sacrifice it. | Not directly quoted — standard, uncontested database theory (every introductory treatment of normal forms states this trade-off), given as reasoning rather than a sourced quote. | — |
| 12 | 1NF requires atomic values with no repeating groups; 2NF forbids a non-key attribute depending on only part of a composite key; 3NF forbids a non-key attribute depending on another non-key attribute. | Not directly quoted in this topic's four fetched sources (the "Database normalization" article's own per-form sections were not reachable as clean, quotable text) — standard definitions, given as reasoning. | — |
| 13 | The worked closure computation and candidate-key search (steps 4, 5, 7) are this topic's own exercise on its own FD set, not a claim about any sourced example. | Not a factual claim — a worked example, verified by a real closure-computation algorithm in examples.py. | — |

Red-team on the predict steps: step 2 (does normalizing always cost a join later?) sets up the general trade
honestly — the answer arrives gradually across the whole topic rather than as a single reveal, since the real
answer is "it depends on the query shape," which this topic already established in topic 2 of this chapter. Step
6 (is {customer_id} a candidate key?) is red-teamed against the plausible wrong answer that determining one
other attribute is enough; the reveal shows its closure stops short of the full attribute set.

Claims 11 and 12 are explicitly marked as reasoned rather than sourced because this topic's fetched sources did
not yield clean, quotable text for the per-normal-form definitions (1NF/2NF/3NF, as opposed to BCNF and 4NF,
which did) or for the dependency-preservation trade-off specifically. Both are standard, uncontested database
theory repeated across essentially every normalization reference, not a disputed or vendor-specific claim.
