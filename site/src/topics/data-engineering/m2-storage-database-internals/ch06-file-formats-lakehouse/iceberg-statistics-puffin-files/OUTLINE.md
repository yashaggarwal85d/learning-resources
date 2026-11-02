# OUTLINE — de.iceberg-statistics-puffin-files

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook** — topic 21 already read column metrics (lower/upper bounds, counts) straight off a
   manifest, as if they were exact. They aren't always.

2. **Predict: what happens to a manifest's lower/upper bound when the real column value is
   longer than Iceberg is willing to store?** Options: it's stored in full, however long / it
   gets truncated, and the bounds are no longer exact.

3. **Reveal: truncated, for real** — a real pyiceberg-written manifest's `lower_bound` and
   `upper_bound` for a 200-byte and a 43-byte string value, both truncated to 16 bytes, the upper
   bound's final byte incremented so it still sorts above the real value. Read straight off
   `table.inspect.data_files()`.

4. **Reveal: that's exactly what the spec says** — "bounds for string and binary are never tight
   ... because they may be truncated when written." Takeaway: a manifest's string/binary bounds
   are a safe range, not the real minimum and maximum.

5. **Predict: if per-file stats are this limited, how does a query planner get a real distinct-
   count estimate for a whole table?** Options: it reads every file's values and counts them
   exactly / a separate sidecar file holds a pre-built sketch.

6. **Reveal: a real Puffin file, built byte-exact to spec, holding a real Theta sketch** — this
   script's own Theta/KMV sketch, serialized into a Magic/Blob/Footer Puffin file, registered on
   the table through pyiceberg's own `update_statistics()`. Takeaway: table-level statistics live
   in their own sidecar file, not spread across every manifest.

7. **Reveal: read back independently, and checked against the truth** — the raw Puffin bytes
   parsed by hand (pyiceberg has no public Puffin blob reader), the sketch's distinct-count
   estimate compared against the table's real distinct count: close, not exact.

8. **Reveal: partition statistics files are the same idea, one level down** — named from the
   spec, not built: the partition-level equivalent of a table statistics file, equally optional.

9. **Reveal: a cost-based optimizer leans on exactly this** — Trino's join enumeration uses
   connector-supplied table statistics to pick a join order; missing or stale statistics fall back
   to a weaker strategy, or risk a plan that misestimates a join's size outright. Takeaway: a
   stale sketch doesn't just mislead a human reading it — it can pick the wrong join plan.

10. **Recap** — per-file column metrics are already in every manifest, but truncated for
    string/binary; a real Puffin sidecar file carries whole-table statistics instead, built and
    read back for real in this sandbox; partition statistics are the same idea per partition;
    and a cost-based optimizer's join plan depends on these statistics being present and current.
