# Outline — de.incremental-reads-change-feeds

1. **Hook.** A well-laid-out table of snapshots is still just a sequence of point-in-time
   states. This topic reads that sequence itself as data: what actually changed between two
   of them.
2. **Predict.** A table gets a copy-on-write compaction that merges two files into one,
   touching no row's value. Does a changelog scan report that commit as having zero changes,
   or as a pile of deletes and inserts?
3. **Reveal — reproduced for real.** The real mechanism: every row gets a stable `_row_id`
   assigned once, and a `_last_updated_sequence_number` that only moves when the row's value
   actually changes (Iceberg v3 row lineage).
4. **Reveal — reproduced for real.** A naive changelog scan with no row identity, run on a
   real copy-on-write update: it reports 10 deletes and 10 inserts for a ten-row file where
   only one row's value changed.
5. **Reveal — reproduced for real.** The same update, scanned by matching `_row_id` instead of
   by file: exactly one real change — the row whose sequence number actually moved. Takeaway.
6. **Predict.** Now scale it up: the same naive, file-diffing scan on a real compaction that
   merges two ten-row files into one, changing nothing.
7. **Reveal — reproduced for real.** Measured: the naive scan reports 40 changes for a commit
   that changed zero values. The row-lineage scan reports 0 — it recognizes every row as a
   carry-over, the same filtering Iceberg's own `create_changelog_view` does by default.
   Takeaway.
8. **Reveal.** Delta's Change Data Feed and Hudi's incremental queries name the same idea in
   their own vocabulary: Delta tags rows `insert` / `update_preimage` / `update_postimage` /
   `delete` in dedicated change files, forward-looking only from the moment it's enabled; Hudi's
   `hudi_table_changes` function offers a `'cdc'` mode (every step, with before/after images)
   and a cheaper `'latest_state'` mode that already amortizes the cost of compactions. Takeaway.
9. **Reveal — reproduced for real.** Iceberg's own plain incremental scan, measured: it reads
   only the rows appended between two snapshot ids (start exclusive, end inclusive) — and
   raises outright the moment a compaction or any non-append snapshot falls in that range.
10. **Recap.**

Ten steps, two predicts (steps 2 and 6), three takeaways (steps 5, 7, 8 — none on step 3, the
reel test's "from" step).
