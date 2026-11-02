# Outline — de.columnar-encodings-dictionary-rle

10 steps, `kind: full`. Predict steps: 2 and 6 (first within the first 4). Takeaways: steps 4, 8, 10 (≥3, ≤20 words each).

1. **Hook** — the same 200-row warehouse dataset, five columns, encoded five different ways: 400 bytes of `zone` shrinks to 113; 1600 bytes of shipment IDs shrinks to 60.
2. **Predict: a 6-value zone column written 200 times — same bytes 200 times, or something smaller?** (predict) — `zone` only ever holds one of 6 warehouse codes.
3. **Reveal: dictionary + RLE/bit-packing, two pages** — a dictionary page of the 6 unique strings, then a data page of 1-byte bit-width header plus RLE/bit-packed indexes: 400 bytes becomes 113.
4. **Reveal: the real fallback, not an idealized one** (takeaway) — the same scheme on a column where every value is distinct falls back to PLAIN; a dictionary with 200 entries for 200 rows saves nothing.
5. **Reveal: RLE/bit-packing's narrow charter** — the hybrid is only used for levels, dictionary indices, and booleans, one bit width per whole page — set up as the direct contrast with what's next.
6. **Predict: 200 near-sorted shipment IDs — does a wider or narrower encoding win?** (predict) — consecutive IDs differ by only 1 or 2.
7. **Reveal: DELTA_BINARY_PACKED, miniblock by miniblock** — differences between consecutive values, then a per-miniblock minimum subtracted out so every stored value is small and non-negative: 1600 bytes becomes 60, a 96% cut.
8. **Reveal: DELTA_BYTE_ARRAY and BYTE_STREAM_SPLIT are two different bets** (takeaway) — one bets strings share prefixes, the other bets a compressor will do the work after transposition.
9. **Reveal: encode first, compress second** — the same weights column, same size either way under PLAIN or BYTE_STREAM_SPLIT, but `zlib` shrinks the transposed version 24% further than the untransposed one.
10. **Recap** — dictionary trades repetition for indirection and can fall back; RLE/bit-packing stays narrow on purpose; delta encodings bet on nearby values or shared prefixes; byte-stream-split bets on what happens after it, not instead of it.
