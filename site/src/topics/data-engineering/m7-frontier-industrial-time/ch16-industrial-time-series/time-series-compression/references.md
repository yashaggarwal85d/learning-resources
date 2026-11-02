# References

Last verified: 2026-10-31
Expert sign-off: pending

- Gorilla: A Fast, Scalable, In-Memory Time Series Database — https://vldb.org/pvldb/vol8/p1816-teller.pdf (Pelkonen et al., VLDB 2015, PVLDB Volume 8, No. 12; fetched and quoted, delta-of-delta and XOR rules run directly in `examples.py`)
- Chimp: Efficient Lossless Floating Point Compression for Time Series Databases — https://vldb.org/pvldb/vol15/p3058-liakos.pdf (Liakos et al., PVLDB 15(11): 3058-3070, 2022; fetched and quoted, trailing-zero threshold and wider-window idea run in a disclosed simplified form in `examples.py`)
- ALP: Adaptive Lossless floating-Point Compression — https://ir.cwi.nl/pub/33334/33334.pdf (Afroozeh, Kuffo and Boncz, SIGMOD 2024; fetched and quoted, not run directly — no ALP library installed; DuckDB's own default float codec is measured instead)
- DuckDB: ALP library page — https://duckdb.org/library/alp/ (DuckDB documentation, retrieved 2026-10-31; quoted for the default-codec claim, exercised for real by writing to Parquet and measuring file size in `examples.py`)
