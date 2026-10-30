# Fact-check — de.row-vs-columnar-vs

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | NSM stores records contiguously on a page, with an offset (slot) table locating each one. | PAX paper §1 (quote in SOURCES.md) | Yes — word-for-word quote, `sources.mjs check` passes. |
| 2 | DSM partitions an n-attribute relation vertically into n sub-relations. | PAX paper §1 (quote) | Yes. |
| 3 | A DSM point lookup across multiple attributes costs a join across sub-relations ("tremendous additional time"). | PAX paper §1 (quote) | Yes — quoted exactly, split into two quotes because a page-break footnote interrupts the sentence in the extracted PDF text; both halves are the paper's own words. |
| 4 | PAX stores the same per-page data as NSM, but groups each attribute's values into a per-page minipage. | PAX paper §1 (quote) | Yes. |
| 5 | PAX only changes layout inside a page; it incurs no storage penalty and does not affect I/O behavior. | PAX paper §1 (quote) | Yes — this is the load-bearing claim behind step 6's "PAX still opens all ten pages" reveal. |
| 6 | NSM point lookup touches 32 bytes in one contiguous read; NSM column scan touches all 32,000 bytes. | `examples.py`, `nsm_point_lookup` / `nsm_column_scan_bytes_touched` | Yes — `python3 examples.py` passes; both are the sandbox's own packed-byte measurement, not the paper's. |
| 7 | DSM point lookup needs 4 separate reads; DSM column scan touches only 8,000 bytes (75% less than NSM). | `examples.py`, `dsm_point_lookup` / `dsm_column_scan_bytes_touched` | Yes. |
| 8 | PAX point lookup touches 1 page (like NSM); PAX column scan still opens all 10 pages (same as NSM) but only 8,000 of the 32,000 page bytes are useful (25%). | `examples.py`, `pax_point_lookup_pages_touched` / `pax_column_scan_pages_and_bytes` | Yes. |
| 9 | Parquet is a column-oriented file format for efficient storage and retrieval. | Parquet docs, Overview (quote) | Yes. |
| 10 | Parquet allows compression/encoding to be specified per column. | Parquet docs, Motivation (quote) | Yes. |

## Currency check

Both Parquet pages were fetched 2026-10-30 (current docs site). The PAX paper is a fixed, dated
VLDB 2001 publication; its own measured percentages (75% stall-time reduction, 17-25% faster
range queries, 11-48% faster TPC-H I/O queries) are reported as the paper's historical results on
its own 2001 hardware, not claimed as current performance — the reel does not put these specific
figures on screen, only the sandbox's own byte-count measurements, to avoid implying a 2001
micro-benchmark describes 2026 hardware.

## Red-team

1. Could "DSM wins every scan" overclaim? No — the claim in step 4 is scoped to "this scan, on
   these bytes," matching what `examples.py` actually measures (8,000 vs 32,000 bytes for one
   column of this specific 1,000-row table), not a general law.
2. Does "PAX does not affect I/O" risk overclaiming for every system, when the quote is one
   paper's design claim? No — SOURCES.md and the reel both attribute it directly to the PAX
   paper's own stated design property, not to Parquet or any production system.
3. Is "Parquet is PAX" itself accurate, or a simplification? Parquet's row-group/column-chunk/page
   structure is PAX-shaped (columnar within a unit that is still read and written as a whole), but
   the reel's step 7 states this as "the layout a PAX-style page buys," not as "Parquet uses PAX
   verbatim" — Parquet's own anatomy is topic 4's subject, not this topic's.
4. Numbers that look round (1,000 rows, 100 rows/page, 8-byte attributes) are the sandbox's own
   chosen parameters, stated as such in `examples.py`'s docstring, not claimed as a real system's
   measured numbers.
5. The footnote-split quote (claim 3) was checked by reading the raw cached PDF text at
   `sources/pax-paper.txt` directly, confirming the footnote intrusion is a PDF-extraction
   artifact (a page-break footnote), not a edit error on this topic's part.

## Problem Solving

None — this is a refresher topic (no `Problem Solving` lab/example required).
