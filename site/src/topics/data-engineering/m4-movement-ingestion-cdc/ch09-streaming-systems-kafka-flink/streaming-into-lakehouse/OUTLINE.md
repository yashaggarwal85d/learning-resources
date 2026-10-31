# Outline — Streaming into the lakehouse (`de.streaming-into-lakehouse`)

12 steps. Predicts at steps 3 and 7 (predicts[0] = step 3, 0-indexed position 2, within ≤3).
Takeaways at steps 5, 9, 11 — none immediately after a predict step (3→4 clear, 7→8 clear).

1. **Hook** — halving a toy writer's commit interval on the same input volume roughly doubles
   the number of small files it produces — freshness and file count move in opposite directions,
   with no setting that improves both at once.
2. **Setup** — recap: the chapter's engines all eventually hand their output to something a
   person or another system can query. This topic is the first of the two places that happens.
3. **Predict** — commit twice as often, on the same volume, over the same stretch of time. What
   happens to the file count?
4. **Reveal: commit cadence sets file count** — the toy model's own numbers: twice the commit
   frequency, exactly twice the files, exactly half the staleness.
5. **Reveal: automated materialisation vs a hand-built sink** — Confluent Tableflow and
   Redpanda's Iceberg topics turn a topic into a table automatically; a Flink or Spark job
   committing to Iceberg, Delta or Paimon is the same destination, built and owned by hand.
   [Takeaway 1]
6. **Reveal: a sink's commit is tied to its checkpoint** — an Iceberg or Delta sink's exactly-once
   guarantee and its commit cadence both ride on the stream processor's own checkpoint interval.
7. **Predict** — if a shorter commit interval always costs more small files, what could absorb
   those small commits without slowing the cadence down?
8. **Reveal: an LSM buffer absorbs them** — the same commit cadence, run through a buffer that
   merges small files on compaction, lands far fewer files.
9. **Reveal: streaming-first storage** — Paimon's LSM layer and Fluss, built to sit directly in
   front of Flink, are two storage-side answers to the same trade-off the writer side can't
   escape. [Takeaway 2]
10. **Reveal: no free setting** — automated materialisation, a hand-built sink, and
    streaming-first storage all place the same three-way trade-off somewhere; none removes it.
11. **ProveIt** — toy model: halving the commit interval doubles the files and halves the
    staleness; the identical cadence, compacted, lands a fraction of the files. [Takeaway 3]
12. **Recap** — commit cadence sets file count and freshness together, with no escape; the
    destination can be automated, hand-built, or absorbed into streaming-first storage, but the
    trade-off itself doesn't move. A lakehouse table is one destination; the next is the other.

Takeaways:
5. An automated pipeline and a hand-built one land in the same place, trade-off waiting on the
   other side. (18 words)
9. A table format built for frequent small writes doesn't remove the trade-off, it just moves
   where the cost gets paid. (20 words)
11. The toy model's own numbers: the same commit cadence, compacted, lands a fraction of the
    files, unchanged in freshness. (19 words)
