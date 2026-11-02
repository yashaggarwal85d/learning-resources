# Outline — de.duckdb-single-node-analytics

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook.** Answers topic 35's handoff: a dedicated server process, however fast, is still a
   second system to run. DuckDB is the opposite extreme -- no server process at all, running
   this chapter's own real Iceberg and Delta tables directly in-process.
2. **Predict.** A Pandas DataFrame already sits in the same Python process as DuckDB. To query
   it with SQL, does DuckDB need an export/import step first, or can it query the DataFrame
   object directly?
3. **Reveal.** Directly, for real -- a real `SELECT sum(x) FROM pandas_df` and
   `SELECT sum(y) FROM polars_df`, both correct, no export step. DuckDB's own docs: a
   replacement scan swaps in a table function that reads the DataFrame itself.
4. **Reveal + takeaway.** Vectorized, columnar execution processes a whole batch of values per
   operation, not row by row. Morsel-driven parallelism splits a real aggregation across
   worker threads: a real measured wall-clock speedup running 4 threads against 1 on the
   identical query.
5. **Predict.** A sort over more rows than a configured 200MB memory limit allows. Does the
   query fail, or does something else happen?
6. **Reveal + takeaway.** It finishes, for real, by spilling to disk -- a configured temp
   directory fills with real spill files during the sort, and the full row count comes back
   correct once it completes.
7. **Reveal.** A real local Iceberg table, built in this sandbox with no server, queried
   directly by DuckDB's iceberg extension -- a real `EXPLAIN ANALYZE` trace shows the filter
   pushed into the Parquet scan itself, reading a small fraction of the table's real bytes.
8. **Reveal.** The identical shape against a real local Delta table, built with no Spark
   anywhere -- the same direct, in-process query, the same correct filtered count.
9. **Reveal + takeaway.** DuckLake: a lakehouse catalog stored as ordinary SQL tables, not a
   REST protocol. Two real writes become two real, independently queryable versioned
   snapshots.
10. **Recap.** In-process, vectorized, morsel-parallel, spills to disk when it must, reads this
    chapter's own Iceberg, Delta and DuckLake tables directly. Handoff to topic 37: the first
    engine this sandbox can't run directly at all -- Snowflake.
