# Outline — de.data-skipping-statistics-page

10 steps, `kind: full`. Predict steps: 2 and 6 (first within the first 4). Takeaways: steps 4, 7, 9 (≥3, ≤20 words each).

1. **Hook** — the same 1000-row column, written sorted and shuffled, 10 row groups of 100 rows each; one selective query, two very different amounts of data read.
2. **Predict: a query for 250-270 — how many of the 10 row groups get skipped?** (predict) — every row group carries its own min and max.
3. **Reveal: 9 of 10 row groups skipped, sorted** — only row group 2 (values 200-299) can possibly contain 250-270; the other 9 are provably out of range from their own min/max alone.
4. **Reveal: the same query, shuffled, skips nothing** (takeaway) — a shuffled column's min/max spans the whole range in every row group, so statistics prune zero row groups.
5. **Reveal: the page index goes one level deeper** — inside the one surviving row group, 4 pages of 25 rows each carry their own min/max; only the page covering 250-274 overlaps the query.
6. **Predict: a high-cardinality column — can min/max help at all?** (predict) — a column of unique session IDs has a min and max spanning everything.
7. **Reveal: a real split-block bloom filter** (takeaway) — 1024 blocks, 26,214 real keys inserted, built from the spec's own block/mask algorithm; a present key always checks true, an absent one almost always checks false.
8. **Reveal: the measured false-positive rate matches the spec's own number** — the spec states "around 1.26%" for this exact size; this sandbox's own filter measures 1.25% over 50,000 real checks.
9. **Reveal: a truncated max that silently loses data** (takeaway) — a writer that shortens "Blart Versenwald III" to "B" instead of "C" makes a real matching row invisible to a reader's own statistics.
10. **Recap** — row-group statistics, the page index, and bloom filters all prune by proof, not guesswork; none of it works unless the writer's bounds are sorted, complete, and genuinely true.
