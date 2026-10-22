# Fact-check, currency and red team, 2026-10-22

Re-derived each claim from the fetched PostgreSQL 18 docs and this topic's own four local measurements. Red-teamed the predict questions for edge cases.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Equality constraints on leading columns (plus one inequality on the first non-equality column) limit the scanned portion of a B-tree index | Confirmed | Quoted verbatim from PostgreSQL 18 docs §11.3; directly reproduced on a 2,000,000-row table: the identical query against an `(a, b)` index reads 6 buffers in 0.264 ms, against a `(b, a)` index reads 2,184 buffers in 30.579 ms — same data, same query, only the column order differs |
| 2 | A B-tree index can satisfy ORDER BY directly, skipping an explicit sort, which matters most with LIMIT | Confirmed | Quoted verbatim from §11.4; measured directly: `ORDER BY a, b LIMIT 10` against an `(a, b)` index runs in 0.095 ms with no sort node; `ORDER BY b, a LIMIT 10` against the same index forces a parallel sequential scan plus a `Sort` node, 177.6 ms — roughly 1,869x slower for changing only the requested order, not the index |
| 3 | PostgreSQL 18 added B-tree skip scan, letting a multicolumn index help even without a predicate on the leading column, by generating a dynamic equality constraint and re-searching per distinct leading value | Confirmed | Quoted verbatim from the PostgreSQL 18 release notes and §11.3; directly reproduced by building the identical table and index on PostgreSQL 16.15 and 18.6 on this sandbox: PG16 scans the whole index (5,468 buffers, 40.896 ms); PG18 reports `Index Searches: 12` and finishes in 0.198 ms, roughly 206x faster, for the identical query and data |
| 4 | Every index adds real overhead to writes, kept synchronized with the table on each modification | Confirmed | Quoted verbatim from §11.1; measured directly: loading 500,000 identical rows into a table with no indexes takes 1,084 ms; loading the same rows into an otherwise-identical table with three single-column indexes takes 5,190 ms (about 4.8x slower), and the three indexes add 13 MB on disk beyond the table's own 37 MB |
| 5 | Multicolumn indexes should be used sparingly; indexes with more than three columns are unlikely to help | Confirmed, not independently measured | Quoted verbatim from §11.3 — a general design guideline from the documentation itself, not something this topic's own narrow measurements could directly confirm or refute at scale; stated as PostgreSQL's own stated guidance, not as a locally-observed number |

## Red team: predict questions
- **Step 2** ("why would the same two columns cost so differently?"): tried the counter "maybe the planner just picked a worse plan for one of them" — ruled out by forcing `enable_seqscan = off` in both runs, so the comparison is genuinely index-vs-index on the identical query and data, not index-vs-seqscan.
- **Step 5** ("does ORDER BY a, b and ORDER BY b, a cost the same against the same index?"): the tempting wrong answer is "yes, since it's still just one index" — ruled out directly: the measured mismatched-order query doesn't even use the index for retrieval (it falls back to a sequential scan), since the index's own stored order can't produce that result order at all.
- **Step 8** ("can the index help at all, before PostgreSQL 18, with nothing on the leading column?"): the tempting wrong answer is "no, never" — this topic's own measured PG16 run shows the index *was* still used (`Index Only Scan`, not a sequential scan), just inefficiently — the real pre-18 cost is scanning the whole index, not an inability to use it at all.

## Currency check
PostgreSQL 18.6 (measured) and 16.15 (measured, the existing instance from topics 23–27) are both current as of 2026-10-22, matching the version named in the syllabus line itself. The PostgreSQL 18 documentation pages fetched are the current `/docs/18/` pages as of this date.

No corrections to OUTLINE.md were needed; all claims passed as planned.
