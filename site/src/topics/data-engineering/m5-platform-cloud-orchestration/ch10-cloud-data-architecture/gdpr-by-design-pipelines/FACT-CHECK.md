# Fact-check: GDPR by design in pipelines

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | GDPR Article 5(1)(b) requires data collected for specified purposes only, not further processed incompatibly ('purpose limitation') | GDPR, Art. 5 | Confirmed, verbatim quote |
| 2 | Article 5(1)(c) requires data to be adequate, relevant and limited to what is necessary ('data minimisation') | GDPR, Art. 5 | Confirmed, verbatim quote |
| 3 | Article 5(1)(e) requires data to be kept identifiable for no longer than necessary for its purpose ('storage limitation') | GDPR, Art. 5 | Confirmed, verbatim quote |
| 4 | Article 5(2) makes the controller accountable for demonstrating compliance with these principles | GDPR, Art. 5 | Confirmed, verbatim quote |
| 5 | Article 30 requires a written record of processing activities, containing purposes, data categories, and envisaged erasure time limits, available to a supervisory authority on request | GDPR, Art. 30 | Confirmed, verbatim quotes |
| 6 | Article 30's record obligation exempts organisations under 250 employees unless the processing is risky, non-occasional, or involves special-category/criminal data | GDPR, Art. 30 | Confirmed, verbatim quote |
| 7 | Article 33 requires breach notification without undue delay, within 72 hours of awareness where feasible, with reasons required for any later notification | GDPR, Art. 33 | Confirmed, verbatim quotes |
| 8 | Article 33 requires the controller to document the breach's facts, effects and remedial action so a supervisory authority can verify compliance | GDPR, Art. 33 | Confirmed, verbatim quotes (split across two sentences in the source) |
| 9 | Article 35 requires a DPIA before high-risk processing, naming three specific triggering categories: large-scale automated profiling with legal effect, large-scale special-category/criminal data, and large-scale public-area monitoring | GDPR, Art. 35 | Confirmed, verbatim quotes |
| 10 | OpenLineage's object model represents a pipeline as Jobs and Datasets linked by Run events, with facets (`sourceCodeLocation`, `lifecycleStateChange`) that can source an automatically generated record of processing | OpenLineage: Object Model | Confirmed, verbatim quotes |
| 11 | The purpose-tag check, minimisation-at-ingestion rule, retention job, Art. 30 lineage assembly, DPIA trigger check, and breach-notification clock all behave as documented when reproduced against synthetic data | Derived in `examples.py`, run and verified locally | Confirmed by running the code |

## Red-team

- **Does this topic overclaim what Article 30's record must contain?** No — SOURCES.md and `examples.py` reproduce only the fields Article 30 actually lists (purposes, data categories, retention time limits), not an invented superset.
- **Is the DPIA-trigger check a faithful reproduction of Article 35, or an invented simplification?** The three categories reproduced in `dpia_trigger_check` are the three Article 35 names explicitly (large-scale profiling with legal effect, large-scale special-category/criminal data, large-scale public monitoring) — not a generic "do one for everything" stand-in, which the topic explicitly warns against.
- **Does the OpenLineage mapping overstate what a real deployment would need?** No — the topic uses only facets OpenLineage's own object-model page documents (`sourceCodeLocation`, `lifecycleStateChange`) and is explicit in OUTLINE.md that no real OpenLineage-integrated system runs in this sandbox.
- **Is the dropped syllabus clause ("erasure mechanics are §13.2, pseudonymisation law is §13.2") actually covered somewhere?** Yes — mapped in `coverage.json` as two forward-reference clauses to "Right to erasure in immutable lakehouses" and "Pseudonymisation vs anonymisation," both real §13.2 topics in syllabus/data-engineering.md.

## Outcome

26 quotes across 5 sources (GDPR Articles 5, 30, 33, 35 and OpenLineage's Object Model), 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, reproducing a purpose-tag enforcement check, an ingestion-time minimisation rule, a retention-tag-driven deletion job, an Art. 30 record assembled from lineage metadata, a DPIA trigger check against Article 35's own three categories, and a 72-hour breach-notification clock.
