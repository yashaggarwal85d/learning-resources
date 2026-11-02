# Outline — de.delta-dml-execution-merge

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook.** Topic 28 ended on: a commit protocol only matters because of what produces commits.
   This topic is exactly that: Delta's own DML, starting with MERGE.
2. **Predict.** A MERGE matches 11 rows out of 1000 in one file. With deletion vectors disabled,
   how much of that file does MERGE actually rewrite — just the 11 rows, or the whole file?
3. **Reveal.** The whole file, for real: ~17.8 KB written to rewrite 1000 rows to change 11 of
   them. MERGE finds the file by its row range, not its contents, then rewrites it whole.
4. **Reveal + takeaway.** With deletion vectors enabled, the same MERGE writes a real bitmap plus
   a small new-rows file — about 70x less. Takeaway: deletion vectors turn "rewrite everything
   that file holds" into "mark what changed, write only what's new."
5. **Predict.** A MERGE reads the table, plans to touch file 1. A concurrent compaction commits
   first and removes file 1. Does the MERGE's commit succeed, fail outright, or get a chance to
   retry?
6. **Reveal + takeaway.** It's a real conflict — the exact pair Delta's own docs name as "can
   conflict." The MERGE detects it, re-reads the new tip, and retries successfully. Takeaway: a
   conflict isn't a dead end; it's a signal to re-plan against what's actually there now.
7. **Reveal.** Row Tracking: the same row, rewritten into a new file at a new position, keeps its
   materialized (stable) Row ID exactly — but its default generated (fresh) Row ID, computed only
   from file + position, comes out completely different.
8. **Reveal.** Why that split exists: self-joins and other within-version matching need a fresh ID
   that's cheap and needs no extra storage; tracking the same row across a rewrite needs a stable
   one that costs a materialized column. Delta gives you both, separately.
9. **Reveal + takeaway.** Named, not rebuilt here: low-shuffle merge (a real query engine's own
   shuffle planner optimizing this exact full-rewrite cost, inside Spark) and Change Data Feed
   (already built for real, back in topic 20). Takeaway: MERGE's physical cost and its CDC output
   are two different concerns Delta pulls apart.
10. **Recap.** MERGE finds touched files, then rewrites them whole or just the parts that changed.
    A conflict with a concurrent compaction is detected and retried, not silently lost. Row
    Tracking keeps a row's identity stable even when its physical location isn't.
