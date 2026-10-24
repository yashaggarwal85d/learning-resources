# Outline: Columnar layout and the Arrow format (`rust.columnar-layout-arrow-format`)

Chapter 24, topic 62 (first of four, opens Chapter 24 and Milestone 4's last chapter). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real row-major layout (a struct holding every column's own value for one logical row) and a real column-major layout (one buffer per column, plus a packed validity bitmap) over the identical rows.
2. Measure that a narrow-column scan genuinely touches far fewer bytes in the column-major layout than in the row-major layout, on the identical rows.
3. Measure that a wide-row update genuinely touches more separate, non-adjacent regions in the column-major layout than in the row-major layout, on the identical rows.
4. Measure that a packed validity bitmap correctly skips the rows it marks absent during a scan, and genuinely uses far fewer bytes than one byte per row would.
5. State, from Apache Arrow's own format documentation and the `arrow-buffer` crate's own docs, the real trade-off a columnar format is built to accept.

## Changes from the chapter plan

None. All claims are measured directly against a real row-major `Vec<struct>` and a real column-major table of separate `Vec`s plus a packed `Vec<u8>` validity bitmap, built from plain Rust data structures; nothing here needs root access, real file I/O, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Build the identical rows two ways: a row-major table, and a column-major table split into one buffer per column. Scanning just one column, does the column-major table genuinely touch fewer bytes than the row-major one?"** (predict, hook) — `fig`: one row-major table, one column-major table, same rows. Options: no, both touch the same number of bytes either way / yes, genuinely, far fewer bytes in the column-major table (correct) / only if the row-major table happens to store that column first.
2. **"Measured: the column-major table touched far fewer bytes scanning that one column"** — `fig`: the real, measured byte counts. NO takeaway (this is the reel's own "from" step for the phone swipe test, per `QUALITY.md` #64; the point — a row-major layout's other columns ride along for free during a narrow scan, so every row's full struct gets touched regardless — is stated directly in the step's own body instead).
3. **"Now update every field of one single logical row instead, in each layout. Does the column-major table touch more separate, non-adjacent regions doing that than the row-major table does?"** (predict) — `fig`: one logical row, every field updated, both layouts. Options: no, both touch the same single region / yes, genuinely, the column-major table touches several separate regions (correct) / only if the row happens to sit at the very start of the table.
4. **"Measured: the column-major table touched four separate regions updating that one row; the row-major table touched exactly one"** — `fig`: the real, measured region counts. Takeaway: "A column-major layout trades a cheap, contiguous row update for an expensive, scattered one across every column's own buffer."
5. **"Mark every seventh row's own value absent, using a packed bitmap, one bit per row, the way Arrow's own format does it. Does a scan over that column correctly skip exactly those marked rows?"** (predict) — `fig`: the packed bitmap, one bit per row, nulled rows marked. Options: no, the scan still sums every row's raw value regardless / yes, genuinely, exactly those rows get skipped (correct) / only if the bitmap happens to use a full byte per row instead of a single bit.
6. **"Measured: the scan correctly skipped exactly the rows the bitmap marked absent, using one bit, not one byte, per row"** — `fig`: the real, measured skip count and bitmap size. Takeaway: "A packed validity bitmap tells a scan exactly which rows to skip, at a small fraction of the cost of a byte per row."
7. **"Apache Arrow's own format documentation states this exact trade-off directly. Does it name comparatively more expensive mutation operations as the real cost of its own locality and performance guarantees?"** (predict) — `fig`: Arrow's own words on the trade-off, shown directly. Options: no, Arrow's own format claims both scans and mutations are equally cheap / yes, genuinely; it names the more expensive mutation cost directly (correct) / only for arrays that already contain null values.
8. **"Measured, in Apache Arrow's own words: analytical performance and data locality guarantees, in exchange for comparatively more expensive mutation operations"** — `fig`: Arrow's own words, shown directly. Takeaway: "A columnar format isn't a free upgrade over a row-major one; it trades cheap mutation for cheap scanning, on purpose."
9. **"The `arrow-buffer` crate's own docs name the identical trade-off from the implementation side: does handling the validity bitmap separately, rather than folding it into each value, genuinely improve real performance?"** — `fig`: `arrow-buffer`'s own words on the null mask, shown directly. NO new predict (continues directly from step seven's own question, to the real Rust implementation's own name for exactly why it keeps the bitmap separate). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — a column-major layout touches far fewer bytes scanning one column and skips exactly the rows its packed validity bitmap marks absent, but it pays for that by scattering a single logical row's own update across every column's own separate buffer instead of touching one contiguous region.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (Arrow's own stated trade-off; step 9 continues from it directly, with no new predict, to `arrow-buffer`'s own implementation-side framing).
- Surprising fact: step 9 (the real crate's own documentation naming exactly why it keeps the validity bitmap separate from the values).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Data adjacency for sequential access (scans) is a key feature of the Arrow columnar format | Apache Arrow Docs: Arrow Columnar Format (quoted) |
| the Arrow columnar format provides analytical performance and data locality guarantees in exchange for comparatively more expensive mutation operations | Apache Arrow Docs: Arrow Columnar Format (quoted) |
| a validity bitmap's set bit at index j means the value is not null, a bit not set means it is null | Apache Arrow Docs: Arrow Columnar Format (quoted) |
| validity bitmaps are initialized to be all unset at allocation time, including padding | Apache Arrow Docs: Arrow Columnar Format (quoted) |
| arrays having a 0 null count may choose to not allocate the validity bitmap at all | Apache Arrow Docs: Arrow Columnar Format (quoted) |
| a NullBuffer is a BooleanBuffer used to encode validity (null values) for Arrow arrays | `arrow-buffer` crate docs: `NullBuffer` (quoted) |
| a true value in the NullBuffer indicates that the corresponding value is not NULL | `arrow-buffer` crate docs: `NullBuffer` (quoted) |
| it is more efficient to not set the null buffer at all if every value is known to be valid | `arrow-buffer` crate docs: `NullBuffer` (quoted) |
| handling the null mask separately can yield significant performance improvements over an iterator approach | `arrow-buffer` crate docs: `NullBuffer` (quoted) |
| a narrow-column scan touches far fewer bytes in the column-major layout than in the row-major layout, on the identical rows | `examples/runtime-demo/src/columnar_layout_locality_tradeoff.rs` (executed, measured) |
| a wide-row update touches more separate, non-adjacent regions in the column-major layout than in the row-major layout, on the identical rows | `examples/runtime-demo/src/columnar_layout_locality_tradeoff.rs` (executed, measured) |
| a packed validity bitmap correctly skips the rows it marks absent during a scan, using far fewer bytes than one byte per row would | `examples/runtime-demo/src/columnar_layout_locality_tradeoff.rs` (executed, measured) |

## Concept ledger

- `introduces`: `columnar-layout-locality-tradeoff` (per `CHAPTER.md` §A.7's concept table)
- `uses`: []
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused (itself Chapter 23's own closing handoff): "This chapter measured what a storage engine owes a concurrent reader: a consistent version to see, a precise rule on which histories are allowed, and a real cost for every version kept around until nothing could still need it; the next chapter turns to a different layout question entirely, how storing values column by column instead of row by row changes what a scan and a point update each cost."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A column-major layout already cuts the bytes a narrow scan has to touch; it says nothing yet about how much smaller those bytes themselves could genuinely get, or at what cost to read them back out."
