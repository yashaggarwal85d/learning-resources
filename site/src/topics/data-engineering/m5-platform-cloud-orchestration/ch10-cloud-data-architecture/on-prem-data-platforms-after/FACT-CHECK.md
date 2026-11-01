# Fact-check: On-prem data platforms after Hadoop

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | MinIO AIStor is an exascale data store natively supporting the S3 API for objects and Iceberg for tables, deployable onto Kubernetes infrastructure through a first-party operator model | MinIO documentation | Confirmed, verbatim quotes |
| 2 | Trino is a distributed SQL query engine designed to query large data sets distributed over one or more heterogeneous data sources | Trino documentation | Confirmed, verbatim quote |
| 3 | Less than a month after Broadcom's acquisition of VMware closed, Broadcom ended perpetual licenses in favor of subscription-based billing and pared the VMware portfolio down to two primary offerings; the decision reverberated across an ecosystem where roughly eighty percent of organizations use VMware infrastructure products | CIO Dive, citing Forrester | Confirmed, verbatim quotes |
| 4 | Industry sources specifically attribute customer anger and re-evaluation of private-cloud platforms to the business-model shift from perpetual to subscription licensing, not to a technology change | CIO Dive | Confirmed, verbatim quote |
| 5 | Data Gravity, coined by Dave McCrory, describes how accumulated data attracts services and applications to itself, implying data is ideally processed where it is stored since moving it carries real cost and latency | Dremio | Confirmed, verbatim quotes |
| 6 | The object-store-and-Iceberg demonstration (a real S3-compatible store, a real Iceberg table with two appends and two snapshots) and the on-prem-reason classifier and cost-comparison model all behave as documented when run | Derived in `examples.py`, run and verified locally | Confirmed by running the code |

## Red-team

- **Is "the builder can actually run this in full" an overstatement, given Kubernetes and Spark/Trino themselves aren't orchestrated or executed?** No — disclosed precisely in OUTLINE.md and in `examples.py`'s own docstring: the storage-and-table-format layer (a real S3-compatible object store, a real Iceberg table with real Parquet/Avro/JSON artifacts and a real snapshot) is genuinely run, which is the syllabus's own emphasis ("S3-compatible object storage... + Iceberg"). Kubernetes orchestration and a JVM-based Spark/Trino process are named and reasoned about, not executed, because they are too heavy for this sandbox — the topic does not claim otherwise.
- **Does citing the VMware/Broadcom licensing shock as "the" pressure overstate a single vendor's relevance?** No — CIO Dive's own reporting, citing Forrester, states roughly eighty percent of organizations use VMware infrastructure products, which is why this specific, dated event is named as evidence of a real, current pressure rather than offered as the only possible driver of private-cloud re-evaluation.
- **Is the cost-comparison model (steady vs. spiky workload) real data or an illustrative model?** It is a disclosed illustrative model with invented but internally consistent numbers, built to demonstrate the mechanism the hook describes (a steady, always-on workload never gets to use elasticity's discount), not a claim about any real organization's actual bill.
- **Can this topic demonstrate a real HDFS/YARN estate for comparison?** No — disclosed in OUTLINE.md: no legacy Hadoop cluster runs in this sandbox. The legacy estate is described from the syllabus's and CHAPTER.md's own framing, not demonstrated; only the modern pattern's storage-and-table-format layer is run for real.

## Outcome

11 quotes across 4 sources (MinIO, Trino, CIO Dive, Dremio), 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean: a real moto-backed S3 endpoint with a real pyiceberg table (two appends, two snapshots, five rows), the on-prem-reason classifier, and the steady-vs-spiky cost-comparison model.
