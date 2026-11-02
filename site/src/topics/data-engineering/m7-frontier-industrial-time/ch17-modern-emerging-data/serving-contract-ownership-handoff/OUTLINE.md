# Outline — de.serving-contract-ownership-handoff

## Outcomes (from CHAPTER.md)

State exactly what data engineering hands off at this boundary (a conformed mart, a compiled
metric layer, a documented grain, a freshness SLA) and what it does not (BI tooling, dashboard
design, ad hoc analysis); diagnose a double-counted dashboard as an undocumented-grain failure;
explain why metric ownership typically moves to analytics engineers past this point and what
negotiation keeps a metric from being computed two ways; summarize Minerva's architecture and its
single-definition claim from a detailed secondary account of Airbnb's own posts.

## 10-step storyboard

1. **Hook.** Two dashboards built from the same mart report different totals for "active users
   this month," and both engineers insist their own query is correct.
2. **Predict: what was never written down, and whose job was it.** (Correct: the mart's grain was
   never documented, so one dashboard silently counted at a finer grain than the other; it should
   have been data engineering's job to document it and analytics engineering's to own the metric
   built on it.)
3. **Reveal: what gets handed off.** A conformed mart behind a semantic/metrics layer that
   compiles one metric definition to SQL for every consuming tool — not a raw table, not a
   dashboard. No takeaway (reel test's reference step).
4. **Reveal: grain and freshness, documented in writing.** The mart's grain (one row equals what)
   and its freshness SLA are facts a BI consumer must be told explicitly, or an undocumented grain
   double-counts the moment someone joins it to something else. Takeaway.
5. **Reveal: ownership moves to analytics engineers.** Past this handoff, the people who maintain
   the semantic layer's metric definitions are typically analytics engineers, a different skill
   from moving and modeling data at scale. Takeaway.
6. **Reveal: the negotiation that keeps a metric from being computed two ways.** Who may change a
   shared metric's definition, and how a conflicting request gets resolved, is the actual
   mechanism — not a one-time document, an ongoing process. Takeaway.
7. **Reveal: Minerva, the production-scale example.** Airbnb's own metric platform, built to
   standardize how metrics are created, computed, served and consumed, each metric defined in
   exactly one place, running on Airflow, Hive/Spark and a Presto/Druid serving layer. Takeaway.
8. **Reveal: what this topic leaves out.** The semantic layer's compilation mechanism itself
   (already taught in Chapter 3), which specific BI tool consumes the mart, the performance engine
   serving many tools at once, the full organizational negotiation process — each named forward to
   where it is actually taught. Takeaway.
9. **Recap.**
10. **Prove it.** A third dashboard, built against the same mart, reports yet another number for
    the same metric, and the analyst who built it says they just wrote the SQL themselves instead
    of using the semantic layer. What actually broke, and at which boundary? (Correct: nothing
    about the mart or the metric layer failed — the analyst bypassed the compiled metric layer
    entirely and recomputed the definition by hand, which is exactly the "computed two ways"
    failure the negotiation and single-definition layer exist to prevent.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7, 8 (five takeaways).

## Post-notes headings

Outcomes; Internals (Minerva's own architecture and lifecycle, from the secondary account);
Lab (none — a conceptual, organizational topic); Production failures this topic warns about;
Frontier (the negotiation process, named forward to Chapter 19); Where this goes next (the BI
layer itself).

## Bridge / handoff

Bridge (answers topic 7's handoff, written to carry the chapter's gap honestly): "This chapter
leaves the model's side of the platform here — the syllabus's own next three subsections are not
taught in this course. What does continue is the warehouse underneath all of it, and the question
of who it actually serves: the analysts and dashboards this course has built toward since Chapter
3, and the contract that decides where data engineering's job ends and theirs begins. This topic
is that contract: what gets handed off, documented, and who owns it on the other side."

Handoff (leads into topic 9): "A contract names what the mart promises. It says nothing about
which actual tool an analyst opens to use it. The next topic, a refresher, is that tool: the BI
layer itself."

## Concept ledger

Introduces: `de-to-bi-handoff-contract`, `grain-and-freshness-documentation`,
`analytics-engineer-metric-ownership`.
Uses: `semantic-layer-metric-compilation`, `fact-grain`, `conformed-dimension`,
`data-contract-specification` (Chapter 3, §3.4; all live).
Declared: none. Builds on Chapter 19's stakeholder-negotiation material (§19.1, not yet live) in
prose only.

## Claims list (for FACT-CHECK.md)

1. Minerva took fact and dimension tables as inputs, performed data denormalization, and served
   the aggregated data to downstream applications (a secondary write-up quoting/summarizing
   Airbnb's own posts, since medium.com — where Airbnb's own posts are hosted — is unreachable in
   this sandbox).
2. At the time of Airbnb's sharing, Minerva contained more than 12,000 metrics and 4,000
   dimensions, with 200+ data producers (attributed to the secondary source, not stated as this
   course's own measurement or as Airbnb's own primary-post number, per CHAPTER.md's own
   instruction).
3. Minerva ran on Airflow for workflow orchestration, Apache Hive and Spark for compute, and
   Presto and Apache Druid for serving (corroborated independently by two separate secondary
   sources).
4. Minerva's own design goal, per one secondary source: "define metrics once, use them
   everywhere," with data defined in a single place as a single entry point for anyone searching
   for a definition.
5. (This course) a double-counted dashboard diagnosed as an undocumented-grain failure, and a
   third dashboard's divergent number diagnosed as a bypassed-metric-layer failure, not a mart or
   metric-layer defect.
