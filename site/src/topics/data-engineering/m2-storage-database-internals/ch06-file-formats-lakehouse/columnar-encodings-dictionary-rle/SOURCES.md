# Sources — de.columnar-encodings-dictionary-rle

## Apache Parquet Format, `Encodings.md`

URL: https://raw.githubusercontent.com/apache/parquet-format/master/Encodings.md
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> The dictionary encoding builds a dictionary of values encountered in a given column. The
> dictionary will be stored in a dictionary page per column chunk. The values are stored as integers
> using the

> encoding. If the dictionary grows too big, whether in size
> or number of distinct values, the encoding will fall back to the plain encoding.

> Data page format: the bit width used to encode the entry ids stored as 1 byte (max bit width = 32),
> followed by the values encoded using the RLE/Bit-Packing described above (with the given bit width).

> This encoding uses a combination of bit-packing and run length encoding to more efficiently store repeated values.

> Note that the RLE encoding method is only supported for the following types of
> data:

> * Repetition and definition levels
> * Dictionary indices
> * Boolean values in data pages, as an alternative to PLAIN encoding

> 1. Compute the differences between consecutive elements. For the first
>  element in the block, use the last element in the previous block or, in
>  the case of the first block, use the first value of the whole sequence,
>  stored in the header.

> 2. Compute the frame of reference (the minimum of the deltas in the block).
>  Subtract this min delta from all deltas in the block. This guarantees that
>  all values are non-negative.

> This encoding is similar to the

> encoding. However the

> encoding is specifically used when the range of ints is small over the entire page, as is true of repetition and definition levels. It uses a single bit width for the whole page.

> This encoding is always preferred over PLAIN for byte array columns.

> This is also known as incremental encoding or front compression: for each element in a
> sequence of strings, store the prefix length of the previous entry plus the suffix.

> This encoding does not reduce the size of the data but can lead to a significantly better
> compression ratio and speed when a compression algorithm is used afterwards.

> This encoding creates K byte-streams of length N where K is the size in bytes of the data
> type and N is the number of elements in the data sequence.

> ALP works by converting floating-point values to integers using decimal scaling
> (controlled by an *exponent* `e` and *factor* `f`), then applying Frame of
> Reference (FOR) encoding and bit-packing. Values that cannot be losslessly
> converted are stored separately as *exceptions*.

Contents:
- Dictionary encoding's own fallback-to-PLAIN trigger, and its two-page structure (a dictionary page of unique values, a data page of RLE/bit-packed indexes).
- The RLE/bit-packing hybrid's scope (levels, dictionary indices, booleans) and its per-page single bit width — the direct contrast this topic draws against delta encoding's per-miniblock bit width.
- `DELTA_BINARY_PACKED`'s two-step algorithm (consecutive differences, then frame-of-reference subtraction), used directly in this topic's own hand-rolled encoder.
- `DELTA_BYTE_ARRAY`'s incremental/front-compression definition for sorted or near-sorted string columns.
- `BYTE_STREAM_SPLIT`'s byte-transposition description, used directly in this topic's own hand-rolled encoder for floats.
- ALP's conceptual description (decimal scaling, frame-of-reference, exceptions) from the format spec's own summary of the ALP paper.

## FSST, `README.md` (Boncz, Leis, Neumann)

URL: https://raw.githubusercontent.com/cwida/fsst/master/README.md
Version: cwida/fsst, `master` branch, fetched 2026-10-31

> FSST is a compression scheme focused on string/text data: it can compress strings from distributions with many different values (i.e. where dictionary compression will not work well). It allows *random-access* to compressed data: it is not block-based, so individual strings can be decompressed without touching the surrounding data in a compressed block.

> FSST encodes strings using a symbol table -- but it works on pieces of the string, as it maps "symbols" (1-8 byte sequences) onto "codes" (single-bytes).

> FSST ensures that strings that are equal, are also equal in their compressed form. This means equality comparisons can be performed without decompressing the strings.

Contents:
- What FSST targets that dictionary encoding does not: high-cardinality string columns, with random access and compressed-domain equality comparison, unlike dictionary encoding's low-cardinality assumption.
