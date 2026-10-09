# de-m8 — change log (original.md lines 901–1182: Milestone 8, Ch.18–24, Systems in Production M8)

Counting rule: "topics" = reel bullets. Before: the top-level bullets of Ch.18 (7) and Ch.19 (21). Ch.20 held questions, Ch.21–24 held tables and guidance, and the old M8 Systems-in-Production section had no system entries, so none of them count. After: reel bullets in Ch.18–19. Capstones are now projects (`*Capstone:*`) and are not counted. The 3 Systems-in-Production reels are listed separately.

## Corrections
- SiP "cross-company pattern": "Bigtable's data model outlived Google's C++ implementation" was wrong, because Bigtable still runs (Cloud Bigtable). It now says the model *spread* to HBase and Cassandra. "Kafka's log abstraction outlived its original Scala codebase's internals" was also misleading, because Kafka still runs on that codebase. It now names independent Kafka-protocol reimplementations (Redpanda, WarpStream). "Latency over flexibility (Hive)" became "SQL accessibility over latency", which matches the M3 Hive case study.
- Assessment: "What is a slowly-changing fact…" is not standard Kimball terminology. It is now a question about facts whose measures change after load: accumulating snapshot vs a transaction fact with adjustment rows.
- Assessment: "Snappy vs Zstd vs Gzip … splittability … for a Spark read" was wrong. Inside Parquet the row group is the split unit, so the codec does not affect splittability. The question now separates compressed CSV/JSON files from codecs used inside Parquet.
- Assessment: "What *is* the latency SLO for a production RAG system" implied a single correct number. It now asks how to set and budget one (retrieval, rerank, TTFT, generation, network).
- Assessment (Rust list): "an owning pipeline naturally produces backpressure while a clone-heavy pipeline does not" was a loaded premise. Bounded stages create the backpressure, not ownership on its own. Reworded.
- Assessment (Rust list): the Raft stale-read question now also covers deposed leaders and the fixes (ReadIndex, lease reads), per the Raft dissertation §6.4 and implementations: https://tikv.org/blog/lease-read/
- Assessment: "Glue vs Spark job vs Lambda" was ambiguous, because Glue is itself Spark. Changed to Glue vs EMR (or EMR Serverless) Spark vs Lambda.
- Ch.21 tracks: "Ch.18 streaming capstones" did not exist. Now "the streaming path of the Ch.18 primary capstone". "Ch.6.4" for the streaming track pointed at query engines. It now points at the streaming table formats in §6.3, plus §8.2, §7.4 and Ch.14.
- Ch.19.3: "at Amazon, often half the loop" was unsourced and dropped. Amazon's principle list was checked: there are 16, and the official name is "Have Backbone; Disagree and Commit". Source: https://www.aboutamazon.com/working-at-amazon/our-leadership-principles

## Currency updates (with source URLs)
- Python GIL question: added the free-threaded CPython build (PEP 703), which is officially supported but optional from 3.14 (PEP 779). https://discuss.python.org/t/pep-779-criteria-for-supported-status-for-free-threaded-python/84319 and https://pydevtools.com/handbook/explanation/what-is-pep-779/
- TPC-DI is now listed by the TPC under "Obsolete Workloads" (v1.1.0). Active versions: TPC-H 3.0.1, TPC-DS 4.0.0. https://www.tpc.org/tpc_documents_current_versions/current_specifications5.asp
- Primary capstone orchestration is now "Airflow 3 or Dagster". Airflow 3.0 shipped in April 2025. https://airflow.apache.org/blog/airflow-three-point-oh-is-here/
- Primary capstone stack updated to a lakehouse behind an Iceberg REST catalog, OpenLineage lineage, OpenTelemetry traces, write-audit-publish CI gates and Terraform on AWS/Azure/GCP. All of these are taught in the restructured §6.3, §11.4, Ch.13 and §10.4 of the same source; GCP was added because Ch.10 covers it.
- AI capstone: added permission-aware retrieval (source ACLs as query-time filters, i.e. security trimming). https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search and https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview. Also added embedding-model migration, LLM-as-judge calibration, a TTFT budget, indirect prompt injection via ingested documents as a failure scenario, and an optional MCP server (MCP is already in §17.1.1).
- DeWitt clause: added. Databricks removed it from its terms in 2021. https://www.databricks.com/blog/2021/11/08/eliminating-the-dewitt-clause-for-database-benchmarking.html

## Added topics
- §18.1 (the old single "benchmarking methodology" bullet split into reels, with new material): **Latency percentiles and histogram aggregation** (adds non-averageable percentiles, histogram/sketch merging, fan-out tail amplification: 1 − 0.99^100 ≈ 63%). **Representative data and workload skew** (adds Zipfian/YCSB and correlation effects). **Reproducible benchmark harnesses** (adds CI regression tracking with noise thresholds, price-performance). **System benchmark suites**: new. YCSB, Cooper et al., SoCC 2010, https://courses.cs.duke.edu/fall13/cps296.4/838-CloudPapers/ycsb.pdf; OpenMessaging Benchmark, https://openmessaging.cloud/docs/benchmarks/. **Analytical benchmark suites** adds the Join Order Benchmark (Leis et al., PVLDB 9(3), 2015), https://courses.cs.washington.edu/courses/cse544/20wi/papers/how-good-vldb-2015.pdf; ClickBench (July 2022, 43 queries, single table), https://github.com/ClickHouse/ClickBench/
- §18.1 *Lab* (new): closed-loop vs constant-rate load generation with an injected stall.
- §19.5 new reels: **Stakeholder mapping and decision rights**, **Team topology for data products** (split out and expanded from "working across the org"), **Breaking changes and deprecation campaigns**, **Proving data-platform value**, **Blameless post-mortems and incident communication**. The ADR reel uses Nygard's 2011 format: https://www.martinfowler.com/bliki/ArchitectureDecisionRecord.html and https://faq.arc42.org/questions/C-9-3/
- §19.5 *Lab* (new): requirements doc + freshness/cost tiers + exec summary + ADR + deprecation plan + post-mortem.
- Systems in Production M8 (new entries): **FoundationDB** (SIGMOD 2021, Zhou et al.; deterministic single-process simulation). https://cacm.acm.org/?p=227399 and https://apple.github.io/foundationdb/testing.html. **Jepsen and Elle** (Kingsbury & Alvaro, PVLDB 14(3), VLDB 2021). https://www.vldb.org/pvldb/volumes/14/paper/Elle%3A%20Inferring%20Isolation%20Anomalies%20from%20Experimental%20Observations and https://arxiv.org/abs/2003.10554
- Rubric: point 3 now requires seeded, reproducible fault schedules. Point 4 requires the §18.1 method. Point 5 adds traces. Point 1 adds goals/non-goals.
- Primary capstone: new failure scenarios (a stalled CDC consumer retaining WAL, from §8.2; a concurrent table-format commit conflict, from §6.3). New reports (data contracts with SLOs; the GDPR erasure path).
- Appendix A: 13 new questions covering chapters the bank never tested: Ch.1 float SUM; Ch.12 OOMKilled executor; Ch.14 quorum intersection and FLP; Ch.16 Gorilla-style compression and as-of alignment; Ch.18 (4); Ch.19 (3).
- Appendix B.4: new gate rows for Distributed theory (Ch.14), Benchmarking (§18.1) and Stakeholders (Ch.19); a "Where taught" column added.

## Removed or merged (with reason)
- Ch.19.1–19.4 (specializations, proof of mastery, interviews/negotiation, earnings beyond employment) were moved out of the topic tree into Appendix B.3, B.5 and B.6 per the decision. They are guidance, not reel material. Dropped: "currently the hottest and best-paid niche" (19.1 and 21.2), the "turning mastery into millions" title, "at Amazon, often half the loop". These are unsourced compensation and interview claims.
- Ch.19.3 system-design interview item → cross-reference to Ch.15 (in the Ch.19 purpose line and B.6).
- Ch.20 → Appendix A. All 94 questions kept: none dropped, a few fixed (see Corrections), all tagged by chapter.
- Ch.21 → Appendix B.2/B.3, Ch.22 → B.4, Ch.23 → B.7, Ch.24 → B.1, all condensed.
- Old M8 SiP preamble ("read each primary source… know the forcing problem…") merged into the cross-company-pattern reel and the exercise. The exercise's interview-marketing sentence was trimmed.
- Ch.18 Systems capstones A–D (four bullets) merged into one cross-reference in §18.5 (→ *Rust Systems Engineering* M7 Ch.34–36 and Ch.43).
- Ch.18 primary and AI capstones are no longer topics. They are `*Capstone:*` project entries, per the decision.
- §19.5 "Writing for different audiences" split: ADR/RFC part → **Design docs, RFCs and ADRs**; post-mortem part → **Blameless post-mortems…**; executive-summary part merged into **Communicating trade-offs to decision-makers**.

## Split topics
- "Benchmarking methodology" (one bullet) → 7 reels: Warm-up and steady-state measurement; Latency percentiles and histogram aggregation; Coordinated omission; Representative data and workload skew; Reproducible benchmark harnesses; Analytical benchmark suites; System benchmark suites. Coordinated omission was checked against the HdrHistogram/wrk2 material: https://groups.google.com/g/mechanical-sympathy/c/icNZJejUHfE/m/BfDekfBEs_sJ and https://awesome.ecosyste.ms/projects/github.com%2Fgiltene%2Fwrk2
- "Working across the org" → Stakeholder mapping and decision rights + Team topology for data products.
- "Negotiating and owning data contracts" → Negotiating data contracts and SLOs + Breaking changes and deprecation campaigns.
- "Writing for different audiences" → see Removed or merged.

## Moved
- Ch.18 reorganised into numbered sections: §18.1 Benchmarking (moved first because it is a prerequisite), §18.2 Rubric (moved before the projects so the pass bar is known before building), §18.3 Primary capstone, §18.4 AI capstone, §18.5 Systems capstones (cross-domain).
- Ch.19 retitled "Stakeholder Engineering: Requirements, Contracts and Communication". Its only section keeps the number **§19.5** so existing references stay stable. §19.1–19.4 are retired.
- Ch.20–24 left the chapter numbering. **Inbound references other slices must redirect:** line 29 (intro, Ch.24) → Appendix B.1; line 30 (Ch.21) → Appendix B.3; line 32 (Ch.20) → Appendix A; line 527 (§10.3, "cross-ref Ch.23") → Appendix B.7; line 603 (§11.4, "Ch.23") → Appendix B.7; line 667 (SiP M5, "Ch.18/Ch.22 rubrics") → §18.2 / Appendix B.4; line 1185 (Rust intro, "specializations in Ch.21") → DE Appendix B.3; line 1259 (DSA intro, "Ch.20's applied warm-ups") → DE Appendix A (Python group). Line 600 (§11.4, "Ch.18 rubric") → §18.2.
- Appendix A "Systems/Rust" group (4 questions) moved to the end list "For the Rust Systems Engineering domain", tagged with Rust chapter numbers, for transfer to that domain.
- Appendix A "Europe/Industrial" merged with the new Ch.16 questions as "Industrial, time-series and Europe". Groups were reordered to roughly follow chapter order.

## Refresher-tagged
- None in this slice. B.7 points de-emphasized basics at the Ch.1 baseline and §2.1. Tagging them is for those slices.

## Unverified
- FoundationDB's in-code `BUGGIFY` fault-injection macro was removed from the reel because I could not confirm it from a primary page within the search budget. The reel only states the fault types listed on https://apple.github.io/foundationdb/testing.html.
- The FoundationDB paper's reported SIGMOD 2021 best-industry-paper award was not confirmed and is not mentioned.
- "The approach has since spread to … commercial deterministic-testing tools" (FoundationDB reel) is deliberately generic. Specific successors (Antithesis, TigerBeetle's simulator) were not verified and are not named.
- B.3 durations (six-month core, four to eight months per track) are kept from the original as rough planning figures, marked as such. They are not sourced.
- Fan-out tail figure (63%) is arithmetic (1 − 0.99^100), not a sourced measurement.

Also: 3 Systems-in-Production reels (up from 0 system entries); 2 guided capstone projects and 1 cross-domain capstone reference; assessment questions 94 → 107.

Topics: before 28 → after 16
