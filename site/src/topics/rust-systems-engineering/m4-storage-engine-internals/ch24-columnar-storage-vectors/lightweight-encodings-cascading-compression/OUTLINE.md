# Outline: Lightweight encodings and cascading compression (`rust.lightweight-encodings-cascading-compression`)

Chapter 24, topic 63 (second of four). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real run-length encoder and decoder over a column, building directly on topic 62's own column-major layout.
2. Measure that the encoding genuinely wins big, by compression ratio, on a skewed, repetitive column.
3. Measure that the identical encoding genuinely loses on a uniformly random column of the identical length, proving the trade is data-distribution-dependent, not a default win.
4. Measure that decode work (run-headers processed per output value) is itself genuinely data-distribution-dependent, and that both encoded columns decode back to their exact original values.
5. State, from Apache Parquet's own format documentation, the real trade-off between an encoding's compression ratio and its own processing cost.

## Changes from the chapter plan

None. All claims are measured directly against a real run-length encoder and decoder built from plain Rust data structures, operating on a real skewed column and a real, deterministically-generated uniformly random column; nothing here needs root access, real file I/O, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Run-length encode a skewed, repetitive column: long stretches of the identical value, the way a real status column often looks. Does the encoding genuinely win big, by compression ratio, on data shaped like that?"** (predict, hook) — `fig`: a skewed column, long runs of the identical value. Options: no, the ratio stays close to even / yes, genuinely, a huge compression ratio (correct) / only if every single value in the column is identical.
2. **"Measured: a huge real compression ratio on the skewed, repetitive column"** — `fig`: the real, measured ratio. NO takeaway (this is the reel's own "from" step for the phone swipe test, per `QUALITY.md` #64; the point — long runs of the identical value collapse to one header each, so the real win scales directly with how repetitive the data actually is — is stated directly in the step's own body instead).
3. **"Run the identical encoding on a uniformly random column of the identical length instead. Does it still win, or does it genuinely lose there?"** (predict) — `fig`: a uniformly random column, no real runs. Options: it still wins, just by less / it genuinely loses, taking more space than the raw column (correct) / it exactly breaks even.
4. **"Measured: the identical encoding genuinely lost, taking more space than the raw column, on the uniformly random data"** — `fig`: the real, measured loss. Takeaway: "The identical encoding that wins big on repetitive data genuinely loses on random data; the choice has to follow the real data, not a default."
5. **"Now measure decode work itself: how many run-headers does decoding have to process, per value it produces, on each column? Does that cost genuinely depend on the data's own distribution too?"** (predict) — `fig`: run-headers processed per output value, both columns. Options: no, decoding always processes one header per output value regardless / yes, genuinely, far fewer headers per value on the skewed column (correct) / only if the random column happens to repeat a value by chance.
6. **"Measured: decoding the skewed column processed far fewer run-headers per value than decoding the random column did, and both decoded back to their exact original values"** — `fig`: the real, measured header counts, and a correctness check. Takeaway: "Decode cost, like compression ratio, rides on the real shape of the data, not on the encoding scheme alone."
7. **"Apache Parquet's own format documentation states the processing-cost side of this trade-off directly. Does it name several real compression codecs as covering different points in a compression-ratio-versus-processing-cost spectrum?"** (predict) — `fig`: Parquet's own words on the spectrum, shown directly. Options: no, Parquet names one single best codec for every case / yes, genuinely; it names a real spectrum of codecs trading one for the other (correct) / only for codecs applied to already-dictionary-encoded columns.
8. **"Measured, in Apache Parquet's own words: several compression codecs, covering different areas in the compression ratio / processing cost spectrum"** — `fig`: Parquet's own words, shown directly. Takeaway: "A real format doesn't pick one encoding and move on; it offers a real spectrum, and the right point on it depends on the data."
9. **"Parquet's own documentation also names exactly what run-length encoding itself is doing underneath: does it combine bit-packing with run-length encoding to store repeated values more efficiently?"** — `fig`: Parquet's own words on the RLE/bit-packing hybrid, shown directly. NO new predict (continues directly from step seven's own question, to the real format's own name for exactly what this topic's own encoder implements). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — a lightweight encoding like run-length can win hugely on repetitive data and lose outright on random data, in both compression ratio and decode work, so the real choice has to follow the real data's own shape, not be applied by default.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (Parquet's own stated ratio-versus-cost spectrum; step 9 continues from it directly, with no new predict, to Parquet's own name for the RLE/bit-packing hybrid itself).
- Surprising fact: step 9 (the real format's own documentation naming exactly what this topic's own encoder implements).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| this encoding uses a combination of bit-packing and run length encoding to more efficiently store repeated values | Apache Parquet Docs: Encodings (quoted) |
| delta encoding consists of a header followed by blocks of delta encoded values | Apache Parquet Docs: Encodings (quoted) |
| the delta encoding algorithm is less sensitive to variations in the size of encoded integers, and a block of all-identical values bit-packs to a zero bit width, effectively also doing RLE | Apache Parquet Docs: Encodings (quoted) |
| the plain encoding is used whenever a more efficient encoding cannot be used | Apache Parquet Docs: Encodings (quoted) |
| Parquet allows the data block inside dictionary pages and data pages to be compressed for better space efficiency, with several codecs covering different areas in the compression ratio / processing cost spectrum | Apache Parquet Docs: Compression (quoted) |
| for all compression codecs except the deprecated LZ4 codec, the raw data of a page is fed as-is to the underlying compression library, without any additional framing or padding | Apache Parquet Docs: Compression (quoted) |
| run-length encoding genuinely wins big, by compression ratio, on a skewed, repetitive column | `examples/runtime-demo/src/lightweight_encoding_decode_cost_tradeoff.rs` (executed, measured) |
| the identical encoding genuinely loses on a uniformly random column of the identical length | `examples/runtime-demo/src/lightweight_encoding_decode_cost_tradeoff.rs` (executed, measured) |
| decode work per value is itself genuinely data-distribution-dependent, and both encoded columns decode back to their exact original values | `examples/runtime-demo/src/lightweight_encoding_decode_cost_tradeoff.rs` (executed, measured) |

## Concept ledger

- `introduces`: `lightweight-encoding-decode-cost-tradeoff` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `columnar-layout-locality-tradeoff` (topic 62)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused: "A column-major layout already cuts the bytes a narrow scan has to touch; it says nothing yet about how much smaller those bytes themselves could genuinely get, or at what cost to read them back out."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Compression changes how many bytes a column takes up on disk or in memory; it says nothing yet about how a query actually works through those bytes once they're back in hand, one row at a time or a whole batch at once."
