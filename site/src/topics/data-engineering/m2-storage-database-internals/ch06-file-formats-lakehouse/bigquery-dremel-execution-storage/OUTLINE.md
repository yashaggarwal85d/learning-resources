# Outline — de.bigquery-dremel-execution-storage

10 steps, entirely sourced-only (no BigQuery/GCP account in this sandbox). Predicts at 2 and 6.
Takeaways at 4, 7, 9.

1. **Hook.** Answers topic 37's handoff: Snowflake's immutability was one proprietary storage
   design on infrastructure this sandbox can only read about. This topic turns to a second one,
   built on genuinely different infrastructure: the system behind topic 6's own Dremel paper.
2. **Predict.** Topic 6 described Dremel's nested-columnar model running on one engine. Does that
   same engine still both store the data and run the query today, or did those two jobs split?
3. **Reveal.** They split: Capacitor columnar storage on Colossus, compute as a separate
   multi-tenant Dremel cluster orchestrated by Borg, the two joined by the Jupiter network plus
   an in-memory shuffle tier.
4. **Reveal + takeaway.** Partitioning narrows a scan to matching segments; clustering sorts rows
   inside a table into blocks a filter can skip entirely -- two layers of the same pruning idea
   topic 37 already showed happening inside a micro-partition.
5. **Reveal.** A materialized view is precomputed once and kept current automatically in the
   background as its base table changes, with no person refreshing it by hand.
6. **Predict.** Pruning and precomputed views both speed up a query that still has to run. Is
   there anything that skips running a repeated query at all?
7. **Reveal + takeaway.** An in-memory caching service sits in front of the query engine and
   accelerates the exact queries a project runs most often, without that project changing a thing.
8. **Reveal.** Loading has two very different shapes: a single batch job from cloud storage that
   fills a table once, or a streaming API that keeps writing rows into it continuously.
9. **Reveal + takeaway.** The streaming API's modern path guarantees exactly-once delivery using
   stream offsets, replacing an older legacy method that only promised best-effort delivery.
10. **Recap.** Capacitor on Colossus, compute on Borg over Jupiter, pruning at two levels, caching
    and precomputation, two very different load paths -- all disaggregated, unlike topic 37's
    single immutable storage layer. Handoff to topic 39: Redshift's classic shared-nothing MPP.
