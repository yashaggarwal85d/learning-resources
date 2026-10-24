# Sources — Columnar layout and the Arrow format

## Apache Arrow Docs: Arrow Columnar Format
URL: https://arrow.apache.org/docs/format/Columnar.html
Fetched: 2026-10-24, cached at `sources/arrow-columnar-format.txt`.
> Data adjacency for sequential access (scans)

> The Arrow columnar format provides analytical performance and data locality guarantees in exchange for comparatively more expensive mutation operations.

> this bitmap. A 1 (set bit) for index j indicates that the value is not null, while a 0 (bit not set) indicates that it is null.

> initialized to be all unset at allocation time (this includes padding)

> Arrays having a 0 null count may choose to not allocate the validity

## `arrow-buffer` crate docs: `NullBuffer`
URL: https://docs.rs/arrow-buffer/latest/arrow_buffer/buffer/struct.NullBuffer.html
Fetched: 2026-10-24, cached at `sources/arrow-buffer-nullbuffer.txt`.
> A BooleanBuffer used to encode validity (null values) for Arrow arrays

> true indicates that the corresponding value is not NULL

> it is more efficient to not set the null buffer if it is known to be all valid (aka all values are not null)

> Handling the null mask separately in this way can yield significant performance improvements over an iterator approach
