# Outline: GDPR by design in pipelines

**Syllabus line (syllabus/data-engineering.md):** "purpose limitation as machine-readable purpose tags, minimisation at ingestion, storage limitation enforced by retention jobs, Art. 30 records of processing generated from lineage, DPIA triggers, 72-hour breach notification and the logs it requires; erasure mechanics are §13.2, pseudonymisation law is §13.2."

## Claims to fact-check

1. Article 5(1)(b) requires personal data to be "collected for specified, explicit and legitimate purposes and not further processed in a manner that is incompatible with those purposes" — the legal basis for a machine-readable purpose tag (GDPR Art. 5).
2. Article 5(1)(c)'s data-minimisation principle requires data to be "adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed" (GDPR Art. 5).
3. Article 5(1)(e)'s storage-limitation principle requires data to be "kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed" (GDPR Art. 5).
4. Article 5(2) makes the controller responsible for, and able to demonstrate, compliance with the above principles ("accountability") (GDPR Art. 5).
5. Article 30 requires each controller to "maintain a record of processing activities," containing the purposes of processing, categories of data subjects and data, and, where possible, the envisaged time limits for erasure; the record must be in writing and made available to a supervisory authority on request (GDPR Art. 30).
6. Article 30's record-keeping obligation does not apply to an organisation with fewer than 250 employees, unless the processing is likely to result in a risk to data subjects' rights, is not occasional, or involves special-category or criminal-conviction data (GDPR Art. 30).
7. Article 33 requires a controller to notify a personal data breach to the supervisory authority "without undue delay and, where feasible, not later than 72 hours after having become aware of it," unless the breach is unlikely to result in a risk to natural persons' rights and freedoms; a late notification must be accompanied by reasons for the delay (GDPR Art. 33).
8. Article 33 requires the controller to document any personal data breach — its facts, effects, and remedial action — so the supervisory authority can verify compliance (GDPR Art. 33).
9. Article 35 requires a DPIA before processing "likely to result in a high risk to the rights and freedoms of natural persons," explicitly naming three triggering categories: large-scale systematic profiling with legal or similarly significant effects, large-scale processing of special-category or criminal-conviction data, and large-scale systematic monitoring of a publicly accessible area (GDPR Art. 35).
10. OpenLineage's object model represents a pipeline as Jobs and Datasets connected by Run events, with facets including `sourceCodeLocation` (the job's source location and version) and `lifecycleStateChange` (a dataset's create/alter/drop/overwrite history) — the structural basis for generating an Art. 30 record from lineage metadata rather than a hand-maintained document (OpenLineage: Object Model).

## Changes from the chapter plan

CHAPTER.md's own scope quote stops after "...and the logs it requires", but the real syllabus line continues with a trailing clause this topic does not re-teach: "erasure mechanics are §13.2, pseudonymisation law is §13.2." This topic's `coverage.json` maps that trailing clause as two forward-reference clauses, to "Right to erasure in immutable lakehouses" and "Pseudonymisation vs anonymisation" (both §13.2 topics named in syllabus/data-engineering.md), rather than re-teaching either mechanism here.

This topic cannot query a real regulator, a real production pipeline's audit trail, or a real OpenLineage-integrated system in this sandbox. The retention job, the purpose-tag enforcement, and the Art. 30-from-lineage generator are reproduced structurally in `examples.py` against a small synthetic in-memory dataset and event log, directly implementing the documented mechanism (GDPR's own Article text; OpenLineage's own object model) rather than a live compliance platform.

## Engagement arc

Hook: a regulator asks a company to produce its Article 30 record of processing for one specific data flow with five business days' notice, and the only existing copy is a two-year-old onboarding slide deck — replayed against a record generated fresh, on demand, from the pipeline's own current lineage and purpose tags. Teaching: purpose limitation as a machine-readable tag stamped at ingestion and checked before a later query runs; minimisation as an ingestion-time drop/hash decision rather than a retrofit; storage limitation as an actual scheduled job that deletes data once its tagged retention period expires, reproduced for real; the Art. 30 record assembled automatically from lineage and purpose-tag metadata already on the pipeline, not maintained by hand; DPIA triggers stated precisely from Article 35's own three named categories; the 72-hour breach-notification clock and what log data (access logs, the Art. 30 record itself) a team needs already in place to meet it. Recap + takeaways. Predict step: given a described processing scenario, which GDPR principle or trigger it actually names.

## Concept ledger

**Introduces:** `purpose-limitation-tagging`, `retention-enforced-deletion`, `art30-record-from-lineage`.
**Uses:** `managed-table-maintenance-service` (topic 12), `lifecycle-snapshot-corruption` (topic 12).
**Declared:** a general, non-legal awareness that GDPR exists and concerns personal data.

## Bridge / handoff

**Bridge:** "Everything in this chapter so far assumed a pipeline was free to run anywhere and process anything the architecture allowed. For data about a person who lives in the EU, that assumption is false by law before it is false by architecture — and this topic is where the law becomes a pipeline design: purpose tags, enforced retention, and a record of processing a regulator can actually be shown."

**Handoff:** "GDPR by design governs what a pipeline may do with data it holds. It says nothing yet about where that data is allowed to physically sit, or who outside the EU might be legally entitled to demand it — which is a harder, more architectural question, and the one this section ends on."
