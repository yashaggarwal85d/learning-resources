# Sources — Lightweight encodings and cascading compression

## Apache Parquet Docs: Encodings
URL: https://parquet.apache.org/docs/file-format/data-pages/encodings/
Fetched: 2026-10-24, cached at `sources/parquet-encodings.txt`.
> This encoding uses a combination of bit-packing and run length encoding to more efficiently store repeated values.

> Delta encoding consists of a header followed by blocks of delta encoded values

> The delta encoding algorithm described above stores a bit width per miniblock and is less sensitive to variations in the size of encoded integers. It is also somewhat doing RLE encoding as a block containing all the same values will be bit packed to a zero bit width thus being only a header.

> The plain encoding is used whenever a more efficient encoding cannot be used.

## Apache Parquet Docs: Compression
URL: https://parquet.apache.org/docs/file-format/data-pages/compression/
Fetched: 2026-10-24, cached at `sources/parquet-compression.txt`.
> Parquet allows the data block inside dictionary pages and data pages to be compressed for better space efficiency. The Parquet format supports several compression codecs covering different areas in the compression ratio / processing cost spectrum.

> For all compression codecs except the deprecated LZ4 codec, the raw data of a (data or dictionary) page is fed as-is to the underlying compression library, without any additional framing or padding.
