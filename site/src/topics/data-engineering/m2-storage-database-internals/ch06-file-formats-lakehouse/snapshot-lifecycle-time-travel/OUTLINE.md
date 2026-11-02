# Outline — de.snapshot-lifecycle-time-travel

1. **Hook.** Last topic's stable identity question (field IDs, column mapping) answered how a
   column survives change. This topic: how far back a table lets you go to see an old snapshot,
   and how it eventually forgets.
2. **Predict: after three more commits, can you still read the table exactly as it looked right
   after the first one?** Yes / No. Correct: yes, as long as that snapshot hasn't been expired.
3. **Reveal: reproduced for real — time travel by snapshot id and by timestamp, and rollback.**
   A real chain of 3 snapshots; time travel by id returns snapshot 1's exact file list; time
   travel by timestamp resolves to snapshot 2; rollback moves the current pointer back to
   snapshot 1.
4. **Reveal: snapshots accumulate real storage until something expires them.** Iceberg's own
   words on why expiry matters; a compaction's superseded files sit on disk, fully referenced by
   old snapshots, until those snapshots are expired.
5. **Reveal: reproduced for real — expiring old snapshots and vacuuming reclaims real storage.**
   Expire two old snapshots, remove the orphaned files they alone kept alive, measure the exact
   bytes reclaimed; time travel to an expired snapshot now fails for real.
6. **Reveal: a hard delete isn't gone until vacuum runs — the real conflict with long time
   travel.** Databricks' and Delta's own words on GDPR/CCPA: a delete commit rewrites the current
   snapshot, but the original file — and the PII in it — stays time-travelable until the old
   snapshot is expired and vacuumed.
7. **Predict: what happens if maintenance expires a snapshot a reader is still mid-read on?**
   Nothing / the read can fail. Correct: the read can fail, or worse.
8. **Reveal: reproduced for real — too-aggressive cleanup corrupts a reader still pinned to an
   expired snapshot.** A retention window shorter than an in-flight read's duration: the reader's
   own file genuinely disappears underneath it. The identical scenario with a long-enough window
   succeeds.
9. **Reveal: the real retention-window trade-off.** Iceberg's and Delta's own danger notes:
   retention must outlast every concurrent reader and writer, which is directly in tension with
   reclaiming storage fast or deleting PII fast.
10. **Recap.** Time travel and rollback both read from the same snapshot chain; expiring old
    snapshots is what reclaims storage and is what finally makes a hard delete real; the retention
    window is the one knob that trades all three against each other.
