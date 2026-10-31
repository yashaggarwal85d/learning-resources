"""
Builds ORC's stripe/stream/row-index layout and Parquet's row-group/page-index layout by hand,
to the two specs' own numbers (ORC's ROW_INDEX entry every 10,000 rows by default, from ORCv1.md;
Parquet's row-group and page index from topics 4 and 7's own PageIndex.md modeling), on the same
100,000-row dataset. Measures how many rows a selective query actually has to read under each
format's default pruning granularity, and the real metadata-size cost of ORC's always-on row
index versus Parquet's opt-in page index.

No pyarrow/duckdb installed in this sandbox: every structure is hand-rolled from each spec's text,
consistent with every other topic's measurement approach in this chapter.
"""

# ---------------------------------------------------------------------------
# Dataset: 100,000 sorted integer ids, one stripe's worth (ORC stripes are typically ~200MB and
# often hold far more rows than this; this is the toy size this sandbox can measure byte-exactly).
# ---------------------------------------------------------------------------

ROW_COUNT = 100_000
user_ids = list(range(ROW_COUNT))  # 0..99,999, sorted

QUERY_LO, QUERY_HI = 52_000, 52_010

STAT_ENTRY_BYTES = 20  # min (8 bytes) + max (8 bytes) + null_count (4 bytes), same accounting topic 7 used


def entry_stats(values: list, size: int) -> list:
    """Splits `values` into fixed-size groups and returns a min/max stat entry per group."""
    entries = []
    for start in range(0, len(values), size):
        chunk = values[start:start + size]
        entries.append({'start': start, 'min': min(chunk), 'max': max(chunk)})
    return entries


def overlapping(entries: list, lo: int, hi: int) -> list:
    return [e for e in entries if not (e['max'] < lo or e['min'] > hi)]


def rows_covered(hits: list, size: int) -> int:
    return len(hits) * size


# ---------------------------------------------------------------------------
# ORC: a single stripe, one ROW_INDEX entry every 10,000 rows (ORCv1.md's own default) — present
# unconditionally in the stripe layout, not an opt-in structure a writer has to turn on.
# ---------------------------------------------------------------------------

ORC_ROW_GROUP_SIZE = 10_000
orc_entries = entry_stats(user_ids, ORC_ROW_GROUP_SIZE)
assert len(orc_entries) == 10

orc_hits = overlapping(orc_entries, QUERY_LO, QUERY_HI)
assert orc_hits == [{'start': 50_000, 'min': 50_000, 'max': 59_999}]

orc_rows_read = rows_covered(orc_hits, ORC_ROW_GROUP_SIZE)
assert orc_rows_read == 10_000

orc_index_bytes = len(orc_entries) * STAT_ENTRY_BYTES
assert orc_index_bytes == 200


# ---------------------------------------------------------------------------
# Parquet, row-group statistics only: a coarser default granularity than ORC's fixed 10,000 —
# row group size is configurable and commonly set larger (ColumnMetaData.Statistics, always
# present, same as topic 7's row-group stats).
# ---------------------------------------------------------------------------

PARQUET_ROW_GROUP_SIZE = 25_000
pq_rg_entries = entry_stats(user_ids, PARQUET_ROW_GROUP_SIZE)
assert len(pq_rg_entries) == 4

pq_rg_hits = overlapping(pq_rg_entries, QUERY_LO, QUERY_HI)
assert pq_rg_hits == [{'start': 50_000, 'min': 50_000, 'max': 74_999}]

pq_rg_rows_read = rows_covered(pq_rg_hits, PARQUET_ROW_GROUP_SIZE)
assert pq_rg_rows_read == 25_000  # coarser than ORC's 10,000 at this row-group size

pq_rg_index_bytes = len(pq_rg_entries) * STAT_ENTRY_BYTES
assert pq_rg_index_bytes == 80  # cheaper metadata than ORC's, but 2.5x the rows read


# ---------------------------------------------------------------------------
# Parquet, page index enabled: finer than ORC's fixed default, but it is opt-in — a writer that
# does not turn it on gets only the row-group-level pruning measured above.
# ---------------------------------------------------------------------------

PARQUET_PAGE_SIZE = 2_500
pq_page_entries = entry_stats(user_ids, PARQUET_PAGE_SIZE)
assert len(pq_page_entries) == 40

# Pages inside the one surviving row group (50,000-74,999) are the only ones a reader with
# row-group pruning already applied needs to check.
surviving_rg_start, surviving_rg_end = 50_000, 74_999
pages_in_surviving_rg = [e for e in pq_page_entries if surviving_rg_start <= e['start'] <= surviving_rg_end]
assert len(pages_in_surviving_rg) == 10

pq_page_hits = overlapping(pages_in_surviving_rg, QUERY_LO, QUERY_HI)
assert pq_page_hits == [{'start': 52_500 - PARQUET_PAGE_SIZE, 'min': 50_000, 'max': 52_499}]

pq_page_rows_read = rows_covered(pq_page_hits, PARQUET_PAGE_SIZE)
assert pq_page_rows_read == 2_500  # finer than ORC's fixed 10,000-row granularity

pq_page_index_bytes = len(pq_page_entries) * STAT_ENTRY_BYTES
assert pq_page_index_bytes == 800  # 4x ORC's row-index cost, for 4x the pruning precision


# ---------------------------------------------------------------------------
# Synthesis: ORC's fixed, always-on 10,000-row index beats Parquet's bare row-group pruning at
# this row-group size, for less metadata than Parquet pays once its own page index is turned on —
# but Parquet's opt-in page index, once enabled, prunes finer than ORC's fixed default.
# ---------------------------------------------------------------------------

assert orc_rows_read < pq_rg_rows_read          # ORC's default beats Parquet's bare row-group default
assert pq_page_rows_read < orc_rows_read        # Parquet's opt-in page index beats ORC's fixed default
assert orc_index_bytes < pq_page_index_bytes    # ORC's index is cheaper than Parquet's finer one


if __name__ == "__main__":
    print(f"ORC: {len(orc_entries)} row-index entries (fixed, 10,000 rows each), "
          f"{orc_rows_read} rows read for the query, {orc_index_bytes} index bytes")
    print(f"Parquet (row-group stats only): {len(pq_rg_entries)} entries (25,000 rows each), "
          f"{pq_rg_rows_read} rows read, {pq_rg_index_bytes} index bytes")
    print(f"Parquet (page index on): {len(pq_page_entries)} page entries (2,500 rows each), "
          f"{pq_page_rows_read} rows read, {pq_page_index_bytes} index bytes")
    print("All assertions passed.")
