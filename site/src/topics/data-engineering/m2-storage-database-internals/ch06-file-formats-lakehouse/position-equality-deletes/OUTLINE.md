# Outline — de.position-equality-deletes

1. **Hook.** Hidden partitioning prunes whole files. A single file's own rows still need to be
   deleted without rewriting it — that's what v2's row-level deletes are for.
2. **Predict.** A streaming upsert writer, like Flink, deletes one row before re-inserting it. It
   never rewrote the data file, so it doesn't know the row's position inside it. What can it write
   instead of a file+position delete?
3. **Reveal — reproduced for real.** Equality deletes: a delete file naming column values instead
   of a position — `id = 4`, `id = 8` — built and committed for real, against the same table.
4. **Reveal — reproduced for real.** A position delete is built and committed too: a real
   file-path-and-row-ordinal delete, read back correctly through pyiceberg's own `table.scan()`.
   Takeaway.
5. **Predict.** Reading a position delete back is a direct offset lookup. What does reading an
   equality delete back actually cost, at read time, compared to that?
6. **Reveal — reproduced for real.** Measured: every one of the data file's column values has to
   be read and compared against the delete set — a real join against a predicate, not a lookup.
   Takeaway.
7. **Reveal.** pyiceberg's own `table.scan()` refuses outright to read a table carrying an
   equality-delete file — a genuine, open limitation in this library, not a construction mistake;
   the merge above was done by hand, the way a conformant v2 reader performs it.
8. **Reveal.** v3 deprecates position delete files outright, replacing them with the deletion
   vectors this chapter already built (topic 15) — a bitmap, cheaper than either delete-file kind
   to apply.
9. **Reveal.** v4 drafts go further and forbid adding any new equality delete file at all — the
   read-side join cost measured here is exactly why. Takeaway.
10. **Recap.**

Ten steps, two predicts (steps 2 and 5), three takeaways (steps 4, 6, 9 — none on step 3, the reel
test's "from" step).
