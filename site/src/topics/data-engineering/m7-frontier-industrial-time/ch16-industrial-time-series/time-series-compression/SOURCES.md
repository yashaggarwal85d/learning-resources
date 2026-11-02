# Sources

## Gorilla: A Fast, Scalable, In-Memory Time Series Database (Pelkonen et al., VLDB 2015)

URL: https://vldb.org/pvldb/vol8/p1816-teller.pdf
Version: PVLDB Volume 8, No. 12, pages 1816-1827 (VLDB 2015)

> series to an average of 1.37 bytes per point, a 12x reduction

> Reads succeed in under one millisecond.

> As shown in Figure 2.b the time stamp delta of delta is −2. This is stored with a two bit header ('10'), and the value is stored in seven bits, for a total size of just 9 bits.

> By XORing the floating point value with the previous value, we find that there is only a single meaningful bit in the XOR. This is then encoded with a two bit header ('11'), encoding that there are eleven leading zeros, a single meaningful bit, and the actual value ('1'). This is stored in fourteen total bits.

> If the delta between time stamps for subsequent data points in a time series are 60, 60, 59 and 61 respectively, the delta of deltas is computed by subtracting the current time stamp value from the previous one which gives us 0, -1 and 2.

> We have found that about 96% of all time stamps can be compressed to a single bit.

> Roughly 51% of all values are compressed to a single bit since the current and previous values are identical.

Contents: the full delta-of-delta variable-length encoding rule (4 bit-width tiers keyed to the ranges [-63,64], [-255,256], [-2047,2048], else-32-bit) and the full XOR value encoding rule (control bit 0 reuses the previous block's leading/trailing-zero window, control bit 1 stores a fresh 5-bit leading-zero count and 6-bit meaningful-length) — both run directly in `examples.py`, reproducing the two worked 9-bit and 14-bit examples exactly.

## Chimp: Efficient Lossless Floating Point Compression for Time Series Databases (Liakos et al., PVLDB 2022)

URL: https://vldb.org/pvldb/vol15/p3058-liakos.pdf
Version: PVLDB 15(11): 3058-3070 (2022)

> Moreover, our algorithm outperforms all earlier techniques with regards to both compression and access time, offering a significantly improved trade-off between space and speed.

> We set this threshold to 6, i.e., the bit length necessary to specify the maximum number of meaningful bits in any XORed value. Therefore, when the number of trailing zeros is less than or equal to this threshold, we write the entire XORed value, except its leading zero bits.

Contents: Chimp128's comparison against the best of the previous 128 values rather than only the immediately preceding one (named and used in `examples.py`'s Chimp-style encoder; the paper's own benchmark figures are quoted, not reproduced, since this topic measures its own synthetic regimes instead).

## ALP: Adaptive Lossless floating-Point Compression (Afroozeh, Kuffo and Boncz, SIGMOD 2024)

URL: https://ir.cwi.nl/pub/33334/33334.pdf
Version: CWI technical report copy of the SIGMOD 2024 paper

> but recently new schemes were proposed: Gorilla, Chimp128, PseudoDecimals (PDE), Elf and Patas. However, their compression ratios are not better than those of general-purpose compressors such as Zstd; while [de]compression is much slower than Delta and FOR.

> losslessly encode doubles as integers if they originated as decimals, and otherwise uses vectorized compression of the doubles' front bits

Contents (not run as the paper's own C++ implementation — no ALP library installed in this environment; this topic's `examples.py` instead benchmarks DuckDB's own built-in ALP codec, which is the production implementation of the same idea, per **sourced-only where not run**): the vectorized, 1,024-value front-bit compression approach for values that didn't originate as decimals.

## DuckDB: ALP library page

URL: https://duckdb.org/library/alp/
Version: DuckDB documentation, retrieved 2026-10-31

> The ALP algorithm is the default compression method for floating-point numbers in DuckDB.

Run in this environment: `examples.py` writes the three synthetic regimes to Parquet via DuckDB and measures the resulting file size, exercising DuckDB's actual default float codec (ALP) rather than quoting its ratio.

## Chapter 1 and Chapter 2's numeric-representation and compression material (in-course, used)

URL: (none — prior topics in this same site, not an external fetch)
Version: n/a

Named, not quoted. `ieee-754`, `float-non-associativity`, `decimal-precision-scale`, `latency-numbers`, `memory-hierarchy` (Chapter 1) and `event-stream-compression` (Chapter 2, a different sense of "compression," named only to avoid confusion per CHAPTER.md) are used by this topic's `uses` list.

## Chapter 15's manufacturing-platform topic (named only — not yet built, see OUTLINE.md)

URL: (none)
Version: n/a

CHAPTER.md's `uses` line names Chapter 15 topic 24's `edge-buffer-sizing-from-outage` and `manufacturing-telemetry-platform-design` ids ("the 1.37 bytes quoted there, now taught"). As of this topic's build time, Chapter 15 (Data-System Design) only extends through §15.3 in `registry.ts`, and neither id exists. This topic does not claim those ids; see `OUTLINE.md` for the gap.
