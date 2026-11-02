# Outline — Real-time OLAP ingestion (`de.real-time-olap-ingestion`)

12 steps. Predicts at steps 3 and 7 (predicts[0] = step 3, 0-indexed position 2, within ≤3).
Takeaways at steps 5, 9, 11 — none immediately after a predict step (3→4 clear, 7→8 clear).

1. **Hook** — a Pinot upsert query answers with an order's latest status even though the
   segment physically holding that order's original row was sealed minutes earlier and never
   rewritten.
2. **Setup** — recap: a lakehouse table is one destination, read by a batch-style query engine.
   This topic is the other: a store that answers a query in milliseconds against data that
   arrived seconds ago.
3. **Predict** — a Kafka partition feeds this store directly. What builds its basic queryable
   unit, and who owns that assignment?
4. **Reveal: a consuming task per partition builds a segment** — the same per-partition-consumer
   vocabulary this chapter opened with, now built by the OLAP store itself.
5. **Reveal: an atomic offset-and-segment commit** — a segment only counts as final once its
   consumed offsets are durably recorded alongside it, in the same action. [Takeaway 1]
6. **Reveal: a naive, non-atomic commit falls out of step** — committing the offset before the
   segment lands leaves them mismatched the moment a crash lands between the two steps.
7. **Predict** — does answering a query with a key's newest value require rewriting the sealed
   segment holding its original row?
8. **Reveal: an upsert overlay answers it instead** — the sealed segment stays untouched; a
   separate overlay, checked first at query time, carries the newer value.
9. **Reveal: ClickHouse's Kafka engine or ClickPipes** — running the consumer in-process or
   paying a managed service to run it is the same build-versus-buy choice from earlier in this
   syllabus. [Takeaway 2]
10. **Reveal: the same shape, three stores** — Druid, Pinot, and ClickHouse each build segments
    per partition and commit them exactly once; only the upsert and operational details differ.
11. **ProveIt** — toy model: independent per-partition segments, an atomic commit that never
    falls out of step, an overlay answering a query without any rewrite. [Takeaway 3]
12. **Recap** — segments reused from this chapter's first topic, an exactly-once commit reused
    from its middle, upsert echoing compaction and changelog modes, build-versus-buy from
    Chapter 8. This chapter's own question is answered; the next milestone asks a bigger one.

Takeaways:
5. An atomic offset-and-segment commit can only ever redo identical work on failure, never
   advance one without the other. (18 words)
9. Running the Kafka engine yourself or paying ClickPipes to run it is the same build-versus-buy
   choice this syllabus already taught. (20 words)
11. The toy model's own numbers: independent segments, a commit that stays in step, and an
    overlay answering without a rewrite. (20 words)
