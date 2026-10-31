# Fact-check: SAP extraction paths and their limits

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Note 3255746 restricts third-party use of ODP-RFC specifically; RFC as a protocol and other mechanisms (table/CDS extraction, DeltaQ, BAPIs) remain usable | Matillion tech note; Theobald Software | Confirmed, verbatim quotes |
| 2 | SAP first published the note in 2022 (unsupported, internal-use framing); on 2 February 2024 (version 4) it became an outright prohibition on third-party ODP API use | Matillion tech note | Confirmed, verbatim quote |
| 3 | On 7 July 2024 SAP updated the note again, directing customers toward SAP Datasphere for SAP-to-third-party replication | Matillion tech note | Confirmed, verbatim quote |
| 4 | CDS views are written in a SQL-like language enriched with annotations and relationships, add semantic meaning, and can be exposed as OData services | DEV Community: CDS and SAP Datasphere | Confirmed, verbatim quotes |
| 5 | SAP's broader rules also name SLT Replication Server, an ABAP adapter, HANA log-based replication and SAP Database Trigger as mechanisms that must not move data out of SAP | Matillion tech note | Confirmed, verbatim quote |
| 6 | On 13 February 2025 Databricks announced SAP Databricks, natively integrated into SAP Business Data Cloud, with bi-directional Delta Sharing and Unity Catalog governance, sold by SAP | Databricks press release | Confirmed, verbatim quotes |
| 7 | SuccessFactors' Employee Central OData API uses asOfDate/fromDate/toDate to control which version of an effective-dated record a query returns | SAP KBA 2853045 | Confirmed, documented behavior from SAP's own knowledge base |
| 8 | A record outside its effective start/end date relative to the query's as-of date is filtered out entirely, not merely returned stale | SAP KBA 3774633 | Confirmed, verbatim quote |
| 9 | The mechanism delta-capability comparison, the ODP-RFC licensing check, and the effective-dated query logic all behave as documented when reproduced against synthetic data | Derived in `examples.py`, run and verified locally | Confirmed by running the code |

## Red-team

- **Does this topic overstate what Note 3255746 restricts?** No — it's explicit, per both Matillion and Theobald, that the restriction is scoped to the ODP Data Replication API used via RFC in SAP-to-non-SAP scenarios, not to RFC generally or to table/CDS extraction, DeltaQ or BAPIs. The topic states this scoping precisely rather than implying a blanket RFC ban.
- **Does naming SLT and log-based replication as also restricted (claim 5) contradict teaching them as legitimate mechanisms (per the syllabus)?** No contradiction — the syllabus's own framing of Note 3255746 is scoped to ODP-RFC specifically, and that remains this topic's primary teaching claim. Claim 5 is disclosed as an important, dated caveat about SAP's broader direction (the 2026 note family), not substituted for the syllabus's own, narrower historical claim about the 2024 note.
- **Is the effective-dated-record mechanism invented, or SAP's own documented behavior?** It's SAP's own knowledge base describing the asOfDate/fromDate/toDate parameters and the exact filtering behavior when a query's date falls outside a record's effective range — reproduced structurally in `examples.py`, not invented.
- **Can this topic demonstrate any of this against a real SAP tenant?** No — disclosed in OUTLINE.md: no real S/4HANA, ECC or SuccessFactors tenant is reachable in this sandbox. Every mechanism is reproduced as a disclosed structural simulation against synthetic data shaped like the documented behavior.

## Outcome

18 quotes across 6 sources (Matillion, Theobald Software, DEV Community, Databricks, two SAP KBAs), 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, reproducing the four-mechanism delta-capability comparison, the ODP-RFC licensing check, and SuccessFactors' effective-dated-record query filtering.
