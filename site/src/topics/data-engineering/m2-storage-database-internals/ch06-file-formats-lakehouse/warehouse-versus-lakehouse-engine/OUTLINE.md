# Outline — de.warehouse-versus-lakehouse-engine

Chapter 6's capstone: the comparison topic 39's handoff promised, closing §6.5 and the chapter.

1. **Hook.** Answers topic 39's handoff verbatim: three proprietary engines and the open engines
   before them have all been taught on their own terms; one question is left.
2. **Predict.** A real local Iceberg table sits in this sandbox. Which gives a usable number
   today: querying it for real in DuckDB, or reading each warehouse's published price? (first
   predict, step 2, within the required first-four window.)
3. **Reveal.** The six engines this chapter built or sourced, grouped: three open (Trino,
   ClickHouse, DuckDB) and three proprietary (Snowflake, BigQuery, Redshift) — the comparison's
   two sides.
4. **Reveal + takeaway.** Workload isolation and concurrency across all six: single-node/cluster
   scaling (open engines) vs. multi-cluster/slot-pool scaling (warehouses).
5. **Reveal.** Cost-based tuning, split the same way: query-plan-only optimization (open engines)
   vs. automatic storage-layout tuning — clustering, sort keys (warehouses).
6. **Predict.** For the identical bytes scanned, which warehouse's own published per-byte rate
   prices it higher: BigQuery on-demand or Redshift Spectrum?
7. **Reveal + takeaway.** The lab's own real number: `examples.py`'s real DuckDB-over-Iceberg
   `EXPLAIN ANALYZE` bytes-scanned figure, priced at each warehouse's sourced rate — one real
   measurement, two sourced estimates on top of it, Snowflake's structurally different billing
   model named explicitly.
8. **Reveal.** Data gravity/egress and governance/lock-in across all six: open engines query data
   where it sits with no catalog lock-in; warehouses add egress costs across regions and
   governance features (row/column security, Glue, Horizon Catalog) tied to their own compute.
9. **Reveal + takeaway.** Synthesis: a managed warehouse wins when its governance and concurrency
   pooling are worth paying for by the byte or by the hour; an open lakehouse engine wins when the
   workload just needs compute you already pay for, on data you already own.
10. **Recap.** Closes the chapter; hands off to Chapter 7 (Apache Spark, distributed batch
    execution) per CHAPTER.md's verbatim handoff.
