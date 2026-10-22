# Fact-check, currency and red team, 2026-10-22

Re-derived each claim from the fetched PostgreSQL 18 and Snowflake docs and this topic's own three local measurements. Red-teamed the predict questions for edge cases.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A BRIN index stores a min/max summary per block range, not a per-row entry | Confirmed | Quoted verbatim from PostgreSQL 18 docs §65.5 and §11.2.6; measured directly: a BRIN index on a two-million-row table's `order_date` column is 24,576 bytes, versus 14,655,488 bytes for a B-tree on the identical column — about 596 times smaller |
| 2 | BRIN is most effective for columns well-correlated with physical row order | Confirmed | Quoted verbatim from §11.2.6 and §65.5; measured directly: an equality filter on the correlated `order_date` column, BRIN-only, reports 15 buffers and 0.140 ms, versus 10,811 buffers and 116.638 ms with no index at all — about 720 times fewer buffers, about 833 times faster |
| 3 | BRIN indexes are lossy — the executor rechecks and discards non-matching tuples from a matching range | Confirmed | Quoted verbatim from §65.5; measured directly: the identical kind of equality filter on an uncorrelated column (`random_id`, uniformly random, same rows) reports `Heap Blocks: lossy=10811` — essentially the entire table gets rechecked, with buffers (10,826) and time (200.129 ms) no better than, and slightly worse than, a plain sequential scan (10,811 buffers, 100.469 ms) |
| 4 | The pages_per_range storage parameter trades index size for summary precision | Confirmed, not independently measured | Quoted verbatim from §65.5. This topic's own measurements use the default value throughout; varying it and re-measuring would be a natural follow-up, not attempted here |
| 5 | Snowflake micro-partitions store the range of values per column per micro-partition, pruning on that basis | Confirmed, not independently measured | Quoted verbatim from Snowflake's own documentation. No Snowflake account available to this sandbox — the same honest-gap reasoning as prior cross-engine topics in this chapter: a real cloud warehouse feature can't be shown by a tool that isn't installed or accessible, so this claim is sourced and disclosed rather than measured |

## Red team: predict questions
- **Step 2** ("could an index with nothing per-row still work?"): the tempting wrong answer is "no, every index needs a per-row entry to find anything" — ruled out directly by the measured size contrast: the BRIN index has no per-row entries at all and still answers the query correctly, just more coarsely.
- **Step 5** ("does this trick work for any column?"): the tempting wrong answer is "yes, a summary always helps, regardless of the data" — ruled out directly by this topic's own uncorrelated-column measurement, where the identical kind of index provides no benefit at all.
- **Step 8** ("does it still help on a scattered column?"): confirmed no, via the measured buffer count (10,826, essentially the whole table) and the measured time, which is actually slightly worse than no index.
- **Step 10** ("what does BRIN have to do before trusting a range's rows?"): the tempting wrong answer is "nothing — if the summary matches, the rows match" — ruled out by the documented and measured lossy behavior: a block range's min/max can be consistent with a filter without every row in that range actually matching it, so the executor must recheck.

## Currency check
PostgreSQL 16.15, measured directly on this sandbox (the existing instance from topics 23-30), is current as of 2026-10-22, and BRIN's block-range summarization and lossiness are unchanged from PostgreSQL 16 through 18 (not a version-gated feature). The fetched PostgreSQL 18 and Snowflake documentation pages are the current pages as of this date.

No corrections to OUTLINE.md were needed; all claims passed as planned.
