# Outline: SAP extraction paths and their limits

**Syllabus line (syllabus/data-engineering.md):** "S/4HANA/ECC data reality (FI/CO, MM, PP, QM tables; CDS views as the semantic extraction layer), mechanisms: ODP delta queues, SLT trigger-based replication, OData, database-level CDC; SAP Note 3255746 (Feb 2024: third-party use of ODP RFC APIs not permitted) and SAP's push to Datasphere / Business Data Cloud (Feb 2025, incl. SAP Databricks) — connector, legal and delta-capability trade-offs; SuccessFactors HR via OData with effective-dated records (inherently SCD) and special-category data (works-council scope)."

## Claims to fact-check

1. SAP Note 3255746 restricts third-party use of the RFC modules in the SAP Operational Data Provisioning (ODP) framework; RFC itself as a protocol remains usable, only the ODP Data Replication API over RFC in SAP-to-non-SAP scenarios is restricted (Matillion tech note; Theobald Software).
2. SAP first published Note 3255746 in 2022 describing third-party ODP API use as unsupported; on 2 February 2024 SAP updated the note (version 4) to state customers and third parties are no longer permitted to use ODP APIs to access SAP ABAP sources at all (Matillion tech note).
3. On 7 July 2024, SAP updated the note again to advise customers to use SAP Datasphere for data replication scenarios moving data from SAP sources to third-party tools (Matillion tech note).
4. CDS (Core Data Services) views are written in a SQL-like language enriched with annotations and relationships, adding semantic meaning through annotations, hierarchies and associations, and can be published as OData services (DEV Community: CDS and SAP Datasphere).
5. SAP's own rules also name SLT Replication Server, an ABAP adapter, SAP HANA log-based replication and SAP Database Trigger as technologies that must not be used to move data out of SAP under the same note family — a broader restriction than ODP-RFC alone, disclosed here even though the syllabus's own framing scopes Note 3255746 to ODP specifically (Matillion tech note).
6. On 13 February 2025, Databricks announced the launch of SAP Databricks, a product natively integrated into the newly launched SAP Business Data Cloud, with bi-directional Delta Sharing between SAP Databricks and a customer's native Databricks environment, governed by Unity Catalog, sold by SAP as part of SAP Business Data Cloud (Databricks press release).
7. SuccessFactors' Employee Central OData API uses `asOfDate`, `fromDate` and `toDate` query parameters to control which version of an effective-dated record a query returns (SAP KBA 2853045).
8. If an OData request's effective date falls outside a record's effective start and end date, that record is filtered out by effective dating and not returned at all — a documented, concrete failure mode of querying effective-dated SuccessFactors data without the right `asOfDate` (SAP KBA 3774633).

## Changes from the chapter plan

CHAPTER.md's own scope quote drops three parentheticals the real syllabus line carries: "(Feb 2025, incl. SAP Databricks)" after "Datasphere / Business Data Cloud"; "(inherently SCD)" after "effective-dated records"; and "(works-council scope)" after "special-category data." All three are taught inline rather than left as bare forward-references, since each maps naturally onto this topic's own content: the Feb 2025 date and SAP Databricks are taught directly (claim 6 above); "(inherently SCD)" is mapped in `coverage.json` as a forward-reference to "SCD Type 2 implementation" (an earlier, real syllabus topic); "(works-council scope)" is mapped as a forward-reference to "DPO, DPIA and works-council co-determination" (a *(skipped)* Ch.13 topic, named not re-taught, consistent with topic 18's handling of other Ch.13 forward-references).

This topic cannot connect to a real SAP S/4HANA, ECC or SuccessFactors tenant in this sandbox. `examples.py` reproduces the delta-capability comparison between the four mechanisms and the effective-dated-record query logic structurally, against synthetic data shaped like the documented behavior, rather than against a live SAP system.

## Engagement arc

Hook: a long-running extraction pipeline built two years ago against an undocumented ODP RFC endpoint worked perfectly and cheaply the whole time, then becomes a compliance finding the moment someone reads SAP Note 3255746 during an audit — not because it broke, but because it was never licensed to exist. Teaching: SAP's own module structure (FI/CO, MM, PP, QM) as raw tables, with CDS views as the semantic layer an extraction tool should prefer; the four extraction mechanisms (ODP delta queues, SLT trigger-based replication, OData, database-level CDC) and what each can and cannot see; SAP Note 3255746 stated precisely, with its real, dated history; SAP's push to Datasphere/Business Data Cloud and the Databricks partnership as the vendor-preferred alternative; SuccessFactors via OData, effective-dated records as a genuinely different cursor problem from `updated_at`, and the special-category stakes of HR data. Recap + takeaways. Predict step: given a described extraction scenario, which mechanism or constraint it actually implicates.

## Concept ledger

**Introduces:** `sap-extraction-mechanism-choice`, `sap-note-licensing-constraint`, `effective-dated-record-extraction`.
**Uses:** `purpose-limitation-tagging` (topic 17).
**Declared:** none beyond topic 18.

## Bridge / handoff

**Bridge:** "A huge amount of the world's actual operational data lives behind a decades-old enterprise system with its own rules, not a modern cloud-native API — and nowhere is that more true than SAP. This topic is what can actually be extracted from it, by which of four mechanisms, and the one dated support note that turned a previously-common extraction path into a licensing problem overnight."

**Handoff:** "SAP extraction is still, in the end, reading from a database or an API. A factory floor's PLCs and historians are not databases at all, and the one rule that matters most there has no SAP equivalent: a slow analytics consumer must never be able to push back on a production line."
