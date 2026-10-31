# Fact-check: Residency, transfers and extraterritorial access

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | The CLOUD Act's SCA amendment requires disclosure of data in a provider's possession, custody or control "regardless of whether" it's located inside or outside the US | US DOJ CLOUD Act white paper | Confirmed, verbatim quote |
| 2 | The CLOUD Act "simply clarified existing U.S. law" rather than creating new extraterritorial authority | US DOJ CLOUD Act white paper | Confirmed, verbatim quote |
| 3 | The EU-US Data Privacy Framework adequacy decision was adopted 10 July 2023, following a US Executive Order and AG regulation addressing Schrems II (July 2020) | European Commission: EU-US data transfers | Confirmed, verbatim quote |
| 4 | Modernised SCCs were issued by the European Commission on 4 June 2021 as pre-approved GDPR Article 46 transfer safeguards | European Commission: SCC page | Confirmed, verbatim quotes |
| 5 | An SCC transfer-impact assessment (EDPB Step 3) requires assessing the third country's law and practice, including public-authority access powers, before relying on the transfer tool | EDPB Recommendations 01/2020 | Confirmed, verbatim quote |
| 6 | Encryption is only an effective supplementary measure when the decryption key stays outside the importer's custody in an adequately protected jurisdiction | EDPB Recommendations 01/2020 | Confirmed, verbatim quote |
| 7 | Where a processor needs access to data in the clear, the EDPB states it is "incapable of envisioning an effective technical measure" to prevent third-country access — encryption's real limit | EDPB Recommendations 01/2020 | Confirmed, verbatim quote |
| 8 | The EDPB analyses remote access by a third-country importer under the same no-effective-measure framework as a direct transfer, when the importer processes the data in the clear | EDPB Recommendations 01/2020 | Confirmed, verbatim quote (footnote marker removed from mid-quote) |
| 9 | The General Court dismissed Latombe's challenge to the DPF adequacy decision on 3 September 2025 (Case T-553/23); Latombe appealed to the CJEU on 31 October 2025 (Case C-703/25 P) | Digital Policy Alert (citing curia.europa.eu); WilmerHale | Confirmed, verbatim quotes from two independent secondary sources agreeing on dates and case numbers |
| 10 | The CJEU previously invalidated Safe Harbor (Schrems I, 2015) and Privacy Shield (Schrems II, 2020) on US-surveillance-law grounds, the reason the DPF's validity is treated as contingent | WilmerHale | Confirmed, verbatim quote |
| 11 | The residency/sovereignty/localisation classification, the CLOUD Act's possession-custody-control test, the encryption-effectiveness check, the Art. 30-from-lineage reuse, and the residency CI policy gate all behave as documented when reproduced against synthetic data | Derived in `examples.py`, run and verified locally | Confirmed by running the code |

## Red-team

- **Can CURIA's own judgment or press release be fetched directly in this sandbox?** No — `curia.europa.eu` returned HTTP 403/empty content on every attempt (the document viewer and the PDF press release both failed). The Latombe ruling and appeal dates/case numbers are instead sourced from two independent, mutually-corroborating secondary sources (Digital Policy Alert, which itself cites curia.europa as its primary source, and WilmerHale's law-firm analysis), disclosed here rather than presented as a direct primary-source quote.
- **Does this topic overstate what customer-held keys protect against?** No — SOURCES.md's own EDPB quotes state the real limit explicitly: encryption only works when the importer never needs cleartext access, and the EDPB names cloud processing requiring cleartext as a case where no technical measure exists at all.
- **Is "remote support access as a transfer" an invented framing, or the EDPB's own?** It's the EDPB's own Use Case 7 analysis (remote access by a third-country importer processing data in the clear), reproduced here rather than asserted without a source.
- **Does the CI policy gate in `examples.py` overclaim what a real deployment pipeline would check?** No — it's explicitly a minimal, disclosed simulation of the rule (block an EU-to-non-EU write or grant), not a reproduction of any specific vendor's real IaC policy engine.

## Outcome

19 quotes across 6 sources (US DOJ, European Commission ×2, EDPB, Digital Policy Alert, WilmerHale), 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, reproducing the three-way legal classification, the CLOUD Act's location-irrelevant disclosure test, the EDPB's encryption-effectiveness check with its real limit, an Art. 30 record reused from topic 17's mechanism, and the chapter's 10.5 lab's residency CI policy gate.
