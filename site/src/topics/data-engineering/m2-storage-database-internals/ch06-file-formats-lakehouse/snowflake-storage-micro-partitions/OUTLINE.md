# Outline — de.snowflake-storage-micro-partitions

10 steps, entirely sourced-only (no Snowflake account in this sandbox). Predicts at 2 and 6.
Takeaways at 4, 7, 9.

1. **Hook.** Answers topic 36's handoff: every engine so far reads a table this chapter built
   and owns. This topic turns to the first engine this sandbox can't run at all: Snowflake's
   own proprietary storage.
2. **Predict.** A table's rows have to be grouped into storage units somehow. Does a person
   define those units, or does Snowflake do it automatically?
3. **Reveal.** Immutable micro-partitions, fifty to five hundred megabytes of uncompressed data
   each, derived automatically -- never explicitly defined or maintained by a user.
4. **Reveal + takeaway.** Per-column metadata on every micro-partition lets a filter skip whole
   micro-partitions outright -- precise pruning, not an early-stopping scan.
5. **Reveal.** Clustering depth measures overlap; Automatic Clustering reclusters a table in the
   background on its own, suspendable/resumable per table.
6. **Predict.** A point lookup on a high-cardinality column -- does pruning and clustering alone
   make that fast, or does a separate mechanism take over?
7. **Reveal + takeaway.** The search optimization service: a separate, purpose-built mechanism
   for point-lookup and substring queries, distinct from range-scan pruning.
8. **Reveal.** Because a micro-partition is never overwritten in place, the old version simply
   survives: Time Travel holds it for a defined retention window, then Fail-safe is a
   last-resort week recoverable only by Snowflake itself.
9. **Reveal + takeaway.** Zero-copy cloning and secure data sharing both follow from the same
   immutability: a clone shares the source's storage, a share moves no data at all.
10. **Recap.** One immutable design underlies pruning, clustering, time travel, cloning and
    sharing. Handoff to topic 38: a second proprietary storage design, BigQuery's Dremel
    execution over Colossus.
