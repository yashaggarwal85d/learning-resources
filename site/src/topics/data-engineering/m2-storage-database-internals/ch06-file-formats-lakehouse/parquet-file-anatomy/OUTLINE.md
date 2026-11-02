# Outline — de.parquet-file-anatomy

10 steps, `kind: full`. Predict steps: 2 and 5 (first within the first 4). Takeaways: steps 3, 7, 9 (≥3, ≤20 words each).

1. **Hook** — a 941-byte real Parquet file, written by hand, byte by byte: `PAR1` ... data ... `PAR1`.
2. **Predict: does the footer come first or last?** (predict) — a reader has to find the schema before it can make sense of any row. Where did this file put it?
3. **Reveal: the footer is written last** (takeaway) — "File Metadata is written after the data to allow for single pass writing." A write-once object store can only append; it can never seek back to patch a header.
4. **Reveal: row group → column chunk → page** — the real file's hierarchy, read directly from its own footer: 2 row groups, 5 columns each, one data page per column chunk (plus a dictionary page on one).
5. **Predict: a repeated string, twice — same bytes twice, or something smaller?** (predict) — `status` only ever holds "created" or "shipped", four times over.
6. **Reveal: dictionary page vs. data page** — row group 0's `status` column: a dictionary page of 2 unique strings, then a data page of 1-bit indexes into it — not the strings written out four times.
7. **Reveal: the same column, v1 vs v2** (takeaway) — row group 1's `status` column uses `DATA_PAGE_V2` instead of a dictionary: the header's own `type` field, read from the real bytes, is 0 in row group 0 and 3 in row group 1.
8. **Reveal: the INT96 timestamp pitfall** — the same 12 written bytes, decoded as a UTC instant (correct) vs. decoded as an America/Los_Angeles wall clock (wrong): a 7-hour drift, because INT96 carries no timezone flag at all.
9. **Reveal: isAdjustedToUTC closes the gap** (takeaway) — the modern `TIMESTAMP` logical type makes the UTC-vs-local choice an explicit, required flag instead of a silent assumption.
10. **Recap** — file → row groups → column chunks → pages; a physical type and its logical type ride together in the footer; the footer's placement is a direct consequence of write-once storage.
