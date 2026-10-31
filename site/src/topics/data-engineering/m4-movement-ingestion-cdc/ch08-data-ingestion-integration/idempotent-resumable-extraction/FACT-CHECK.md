# Fact-check — de.idempotent-resumable-extraction

## Claims against sources

1. **"`foreachBatch` gives only at-least-once write guarantees by default, but `batchId` can
   deduplicate the output into an exactly-once guarantee."**
   Source: Apache Spark Structured Streaming Programming Guide, `foreachBatch` section
   (SOURCES.md quote 1). Direct match — the quote states exactly this. This topic's own recipe
   (deterministic batch id + idempotent write) is the general-purpose version of the same idea,
   not specific to Spark; the reel names Spark/`batchId` only in post-notes as the framework-level
   instance, never claims Spark internals it does not quote.

2. **"PostgreSQL's `ON CONFLICT` specifies an alternative action instead of raising a unique
   constraint violation."**
   Source: PostgreSQL `INSERT` documentation (SOURCES.md quote 2). Direct match. Used only to
   name the real mechanism `examples.py`'s own keyed, idempotent write (`overwrite_store` keyed
   by partition id) stands in for — the lab does not require a live PostgreSQL instance, since
   topic 2 already demonstrated the real database and this topic's lesson is about ordering and
   batch identity, not the SQL syntax.

3. **"Advancing a checkpoint before writing the output loses data on a crash between them;
   writing the output before advancing the checkpoint duplicates it instead."**
   Measured directly: `checkpoint_before_output_crash` (checkpoint advanced, crash before output
   write, `data_lost: True`) and `output_before_checkpoint_crash` (output written, crash before
   checkpoint advance, restart reprocesses the batch — `append_log_entries_for_batch: 2`). Not an
   external claim; the measurement is the proof.

4. **"Committing the output and the checkpoint atomically leaves no window where a crash produces
   an inconsistent state."**
   Measured directly: `atomic_commit_closes_window` checks, for both crash-before and
   crash-after orderings around a single atomic commit, that `output_written == checkpoint_advanced`
   holds in every case — there is no ordering left where one advances without the other.

5. **"A batch id derived from the input range overwrites the same partition on a re-run; a batch
   id derived from a counter or the clock appends a new partition instead."**
   Measured directly: `deterministic_batch_id_overwrites_on_rerun`
   (`partitions_in_warehouse: 1, rows_in_that_partition: 5` after two runs) vs.
   `non_deterministic_id_appends_on_rerun` (`partitions_in_warehouse: 2,
   total_rows_across_partitions: 10` after the same two runs on the same input).

6. **"Two full runs of a crash-injected batch land byte-identical to a clean run via a keyed,
   idempotent write."**
   Measured directly: `idempotent_merge_survives_a_crash_mid_batch`
   (`rows_after_first_crashed_attempt: 7` of 12, then a second clean re-run completes it;
   `matches_total_exactly_once: True`, `byte_identical_to_a_second_clean_run: True`).

## Predict questions red-teamed

- **Step 2** ("which ordering loses data vs. duplicates"): the wrong option claims writing output
  first loses data because the checkpoint never catches up. Checked against the measurement:
  output-first-then-crash always leaves the output in place, and a restart that hasn't seen the
  checkpoint advance simply redoes the write — this can only duplicate (if the write is not
  keyed) or be harmless (if it is), never lose data, since the rows were durably written before
  the crash. The correct answer (checkpoint-first loses data) matches
  `checkpoint_before_output_crash` exactly: the batch is marked done, then nothing is ever
  written, and nothing downstream will retry a batch the checkpoint already calls finished.

- **Step 10** ("does redelivery violate exactly-once delivery, effect, both, or neither"): the
  wrong option claims it violates both, reasoning only from "delivered more than once." Checked
  against the Spark quote and this topic's own recipe: exactly-once *effect* is defined purely by
  the state after every redelivery has been applied, which is unchanged by an idempotent write no
  matter how many times it's invoked (`idempotent_merge_survives_a_crash_mid_batch`'s own
  byte-identical result is the proof). The correct answer — it violates delivery but not effect,
  given an idempotent consumer write — is the only one consistent with both the quoted recipe and
  the measured byte-diff.

## Scope check against CHAPTER.md / syllabus

Topic 6 closes the 8.1 lab (checkpoint/commit ordering, deterministic batch ids, the
exactly-once-effect recipe) per `CHAPTER.md`'s lab-hosting table. No claim here depends on Kafka
Connect internals or KIP-618 — both are named in post-notes as the framework-level instance of the
same recipe and explicitly left to Chapter 9, never taught as this topic's own content.
