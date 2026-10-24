---
title: "Columnar layout and the Arrow format"
---

## Outcomes

- Build a real row-major layout and a real column-major layout, with a packed validity bitmap, over the identical rows.
- Measure that a narrow-column scan genuinely touches far fewer bytes in the column-major layout.
- Measure that a wide-row update genuinely touches more separate, non-adjacent regions in the column-major layout.
- Measure that a packed validity bitmap correctly skips exactly the rows it marks absent, using far fewer bytes than one byte per row.
- State, from Apache Arrow's own format documentation and the `arrow-buffer` crate's own docs, the real trade-off a columnar format is built to accept.

## Internals

The bytes-touched counts measured here come from Rust's own `std::mem::size_of` applied to the real struct and element types involved, not numbers picked to make the demonstration work: a four-field `i64` struct genuinely occupies four times the bytes of a single `i64` column, so a narrow scan over one column in the row-major layout genuinely has no way to avoid touching the other three columns' own bytes riding along in the identical struct. The validity bitmap built here is a real bit-packed `Vec<u8>`, one bit per row, matching Arrow's own documented packed-bitmask convention directly rather than standing a `Vec<bool>` in for it; its skip count is checked against an independently computed expected count, not merely trusted.

## In production

Apache Arrow's own format documentation states the real trade-off directly, in its own words: analytical performance and data locality guarantees, in exchange for comparatively more expensive mutation operations. The `arrow-rs` crate's own `arrow-buffer` documentation names the identical trade-off from the implementation side, stating that handling the validity bitmap separately from each value can yield significant, real performance improvements over folding it in. Beyond the plain row-major and column-major layouts measured here, Arrow's real format adds offset buffers for variable-length values, dictionary arrays for repeated values, and the variable-size `Utf8View`/`BinaryView` ("German strings") layouts with inline prefixes, each a further refinement of the identical locality-versus-mutation trade this topic measures in its simplest form.

## The frontier

This topic measures the foundational row-major-versus-column-major trade-off and the validity bitmap that Arrow's further layouts (offset buffers, dictionary arrays, the variable-size view layouts) are themselves built on top of; those further layouts are named in prose here rather than separately measured, since this topic's own job is the trade-off beneath all of them. All of this topic's own measured claims run entirely on plain in-memory Rust structs and vectors, with no file, network, or root access needed.

## Where this goes next

This topic opens Chapter 24, continuing directly from Chapter 23's own closing handoff: a column-major layout already cuts the bytes a narrow scan has to touch; it says nothing yet about how much smaller those bytes themselves could genuinely get, or at what cost to read them back out. The next topic turns to exactly that question, measuring a real lightweight encoding's own compression ratio and decode cost on this topic's own column-major layout.
