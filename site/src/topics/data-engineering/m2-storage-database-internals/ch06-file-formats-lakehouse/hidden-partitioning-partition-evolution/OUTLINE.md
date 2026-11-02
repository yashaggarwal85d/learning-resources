# Outline — de.hidden-partitioning-partition-evolution

1. **Hook.** The metadata tree already prunes by partition tuple — but only if the table never
   makes the query name the partition column itself. That's hidden partitioning.
2. **Predict.** A table is partitioned by `day(event_time)`. A query filters on `event_time`
   directly, never mentioning the partition. Does it still get pruned, or does it have to scan
   everything?
3. **Reveal — reproduced for real.** Iceberg derives the partition value from a real column by a
   transform it tracks itself — `identity`, `bucket[N]`, `truncate[W]`, `year`/`month`/`day`/
   `hour` — so the query never has to name the derived column at all.
4. **Reveal — reproduced for real.** A real table, evolved mid-life: its partition spec changes
   from `day(ts)` to `hour(ts)` plus `bucket(4, id)` — without rewriting a single existing file.
5. **Reveal — reproduced for real.** The old era's files are still on disk, still tagged with the
   old spec id — evolving the spec touched zero existing data. Takeaway.
6. **Predict.** A query asks for one row by `id`, never naming any partition transform. The
   matching row happens to live in the old era, written under the old spec. Does it still prune?
7. **Reveal — reproduced for real.** Measured: a source-column query prunes to exactly one file
   whether the matching row is in the old era or the new one — each manifest is planned under
   the spec it was actually written with, not the table's current default. Takeaway.
8. **Reveal.** v3 extends this with multi-argument transforms — more than one source column
   feeding a single partition field — named here as the current extension, not built.
9. **Reveal — reproduced for real.** A full scan across both eras reads every row correctly: the
   tree doesn't care that half its manifests were written under a spec that no longer exists as
   the table's default. Takeaway.
10. **Recap.**

Ten steps, two predicts (steps 2 and 6), three takeaways (steps 5, 7, 9 — none on step 3, the
reel test's "from" step).
