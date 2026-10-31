# Outline: Residency, transfers and extraterritorial access

**Syllabus line (syllabus/data-engineering.md):** "residency (where bytes rest) vs sovereignty (who can compel access, e.g. the US CLOUD Act) vs localisation; Schrems II, SCCs with transfer-impact assessments, the EU–US Data Privacy Framework (upheld by the General Court in *Latombe*, Sept 2025; appeal C-703/25 P pending at the CJEU), remote support access as a transfer; region-pinned storage and compute routing, EU-only operations, customer-held keys as a supplementary measure."

## Claims to fact-check

1. The CLOUD Act's amendment to the Stored Communications Act requires a provider subject to US jurisdiction to disclose data within its "possession, custody, or control," regardless of whether that data is located within or outside the United States (US DOJ, CLOUD Act white paper).
2. The CLOUD Act "simply clarified existing U.S. law" rather than expanding it — the principle that a company subject to US jurisdiction can be compelled to produce data it controls, wherever it is stored, predates the Act itself (US DOJ, CLOUD Act white paper).
3. The European Commission adopted its adequacy decision for the EU-US Data Privacy Framework on 10 July 2023, following a US Executive Order and Attorney General regulation introduced to address the concerns raised by the CJEU's Schrems II decision of July 2020 (European Commission: EU-US data transfers).
4. The modernised Standard Contractual Clauses, issued by the European Commission on 4 June 2021, are pre-approved model contract clauses usable as a GDPR Article 46 transfer safeguard (European Commission: Standard Contractual Clauses).
5. An SCC transfer-impact assessment (EDPB's Step 3) requires the exporter to assess whether anything in the law or practice of the importer's third country impinges on the effectiveness of the transfer tool's safeguards, including the third country's public-authority access powers (EDPB Recommendations 01/2020).
6. The EDPB's own encryption-based supplementary measure (Use Case 1) requires, among other conditions, that the decryption key remain in the sole custody of the data importer, the exporter, or another EEA-protected trusted entity (EDPB Recommendations 01/2020).
7. The EDPB explicitly states that where a cloud service provider or other processor needs access to data in the clear to perform its task, and the third country's public-authority access powers go beyond what is necessary and proportionate, it is "incapable of envisioning an effective technical measure" to prevent that access — the real limit of encryption as a supplementary measure (EDPB Recommendations 01/2020).
8. The EDPB treats remote access by a data importer in a third country, where the importer processes data in the clear, under the same "no effective technical measure" analysis as a direct transfer — remote access is itself a transfer (EDPB Recommendations 01/2020).
9. On 3 September 2025, the General Court of the European Union dismissed Philippe Latombe's challenge to the EU-US Data Privacy Framework's adequacy decision; Latombe filed an appeal, Case C-703/25 P, on 31 October 2025, against the General Court's judgment in Case T-553/23 (Digital Policy Alert, citing curia.europa.eu; WilmerHale).
10. The CJEU has already invalidated two prior EU-US transfer frameworks on surveillance-law grounds — Safe Harbor in Schrems I (2015) and Privacy Shield in Schrems II (2020) — the reason the Data Privacy Framework's current validity is treated as contingent rather than settled (WilmerHale).

## Changes from the chapter plan

None found: CHAPTER.md's own scope quote matches the real syllabus line in full, including the *Latombe* date and the pending appeal's case number.

This topic cannot query a real cloud provider's region-pinning controls, a real customer-managed-key deployment, or the CJEU's pending appeal outcome (which has not yet been decided as of this writing) in this sandbox. The region-pinning, EU-only-operations and customer-held-key mitigations are described from the EDPB's own documented use cases and their real, stated limits rather than demonstrated against a live cloud account; `examples.py` reproduces the residency/sovereignty/localisation classification logic and the encryption-supplementary-measure effectiveness check structurally.

## Engagement arc

Hook: a company pins its storage to an EU region and calls the residency question closed, only to discover its own support contract lets engineers outside the EU remotely view the same data during troubleshooting — which is itself a transfer under this framework, regardless of where the bytes ever physically sit. Teaching: residency, sovereignty and localisation defined and kept rigorously separate, with the US CLOUD Act as the canonical sovereignty example; Schrems II and why Privacy Shield fell; SCCs and the transfer-impact assessment they now require; the EU-US Data Privacy Framework's current, actively-litigated legal status; remote support access as a transfer; the three architectural mitigations (region-pinned routing, EU-only operations, customer-held keys) each with its real, honestly-stated limit. Recap + takeaways. Predict step: given a described legal requirement, which of the three — residency, sovereignty, localisation — it actually names.

## Concept ledger

**Introduces:** `residency-sovereignty-localisation`, `transfer-mechanism-impact-assessment`.
**Uses:** `purpose-limitation-tagging` (topic 17), `art30-record-from-lineage` (topic 17), `cross-cloud-service-rosetta` (topic 11).
**Declared:** none beyond topic 17.

## Bridge / handoff

**Bridge:** "GDPR by design governs what a pipeline may do with data it holds. This topic is the harder question underneath it: where the bytes are even allowed to sit, and who outside that jurisdiction might be legally entitled to demand them regardless — residency, sovereignty and localisation, kept as three separate questions instead of one blurred worry."

**Handoff:** "Everything in Chapters 1-10 so far has mostly assumed modern, cloud-native systems and modern regulation. A huge amount of the world's actual operational data instead lives behind a decades-old enterprise system with its own extraction rules, and a factory floor with its own physics — which the next section is about."
