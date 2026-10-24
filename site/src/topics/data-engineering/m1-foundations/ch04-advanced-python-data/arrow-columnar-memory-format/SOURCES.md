## Apache Arrow Columnar Format specification

URL: https://arrow.apache.org/docs/format/Columnar.html
Version: Arrow Columnar Format v1.5 (docs built for Apache Arrow v26.0.0)

> The Arrow columnar format includes a language-agnostic in-memory
data structure specification, metadata serialization, and a protocol
for serialization and generic data transport.

> Data adjacency for sequential access (scans)

> SIMD and vectorization-friendly

> Relocatable without “pointer swizzling”, allowing for true zero-copy
access in shared memory

> Arrays having a 0 null count may choose to not allocate the validity
bitmap; how this is represented depends on the implementation (for
example, a C++ implementation may represent such an “absent” validity
bitmap using a NULL pointer).

> is_valid[j] -> bitmap[j / 8] & (1 << (j % 8))

> Variable-size Binary View Layout#

> Each value in this layout consists of 0 or more bytes. These bytes’
locations are indicated using a views buffer, which may point to one
of potentially several data buffers or may contain the characters
inline.

> * Short strings, length <= 12
 | Bytes 0-3 | Bytes 4-15 |
 |------------|---------------------------------------|
 | length | data (padded with 0) |

> * Long strings, length > 12
 | Bytes 0-3 | Bytes 4-7 | Bytes 8-11 | Bytes 12-15 |
 |------------|------------|------------|-------------|
 | length | prefix | buf. index | offset |

> In the short string case the string’s bytes are inlined — stored inside the
view itself, in the twelve bytes which follow the length. Any remaining bytes
after the string itself are padded with 0.

> In the long string case, a buffer index indicates which data buffer
stores the data bytes and an offset indicates where in that buffer the
data bytes begin. Buffer index 0 refers to the first data buffer, IE
the first buffer after the validity buffer and the views buffer.
The half-open range [offset, offset + length) must be entirely contained
within the indicated buffer. A copy of the first four bytes of the string is
stored inline in the prefix, after the length. This prefix enables a
profitable fast path for string comparisons, which are frequently determined
within the first four bytes.

> This layout is adapted from TU Munich’s UmbraDB.

> Dictionary encoding is a data representation technique to represent
values by integers referencing a dictionary usually consisting of
unique values. It can be effective when you have data with many
repeated values.

> Any array can be dictionary-encoded. The dictionary is stored as an optional
property of an array. When a field is dictionary encoded, the values are
represented by an array of non-negative integers representing the index of the
value in the dictionary. The memory layout for a dictionary-encoded array is
the same as that of a primitive integer layout. The dictionary is handled as a
separate columnar array with its own respective layout.

> Run-end encoding (REE) is a variation of run-length encoding (RLE). These
encodings are well-suited for representing data containing sequences of the
same value, called runs. In run-end encoding, each run is represented as a
value and an integer giving the index in the array where the run ends.

> Any array can be run-end encoded. A run-end encoded array has no buffers
by itself, but has two child arrays. The first child array, called the run ends array,
holds either 16, 32, or 64-bit signed integers. The actual values of each run
are held in the second child array.

> The values in the first child array represent the accumulated length of all runs
from the first to the current one, i.e. the logical index where the
current run ends. This allows relatively efficient random access from a logical
index using binary search. The length of an individual run can be determined by
subtracting two adjacent values. (Contrast this with run-length encoding, in
which the lengths of the runs are represented directly, and in which random
access is less efficient.)

> The List layout is defined by two buffers, a validity bitmap and an offsets
buffer, and a child array. The offsets are the same as in the
variable-size binary case, and both 32-bit and 64-bit signed integer
offsets are supported options for the offsets. Rather than referencing
an additional data buffer, instead these offsets reference the child
array.

> The primitive unit of serialized data in the columnar format is the
“record batch”. Semantically, a record batch is an ordered collection
of arrays, known as its fields, each having the same length as one
another but potentially different data types.

> In this section we define a protocol for serializing record batches
into a stream of binary payloads and reconstructing record batches
from these payloads without need for memory copying.

> Sometimes the term “logical type” is used to denote the Arrow data types
and distinguish them from their respective physical layouts. However,
unlike other type systems such as Apache Parquet’s,
the Arrow type system doesn’t have separate notions of physical types and
logical types.

Contents:
- data types table (fixed-size, variable-size binary, view-of-variable-size-binary, nested, dictionary, run-end encoded layouts)
- Physical Memory Layout (buffers, length, null count, optional dictionary, child arrays)
- Validity bitmaps (LSB bit ordering, elided when null count is 0)
- Variable-size Binary View Layout (the 16-byte view struct, inline vs. out-of-line)
- Dictionary-encoded Layout (index array + separate dictionary array, isDelta batches)
- Run-End Encoded Layout (run_ends/values child arrays, binary-search random access)
- Serialization and IPC (Schema, RecordBatch, DictionaryBatch messages; streaming protocol)

## PyArrow: Data Types and In-Memory Data Model

URL: https://arrow.apache.org/docs/python/data.html
Version: Apache Arrow v26.0.0 (Python docs)

> The PyArrow Table type is not part of the Apache Arrow
specification, but is rather a tool to help with wrangling multiple record
batches and array pieces as a single logical dataset. As a relevant example, we
may receive multiple small record batches in a socket stream, then need to
concatenate them into contiguous memory for use in NumPy or pandas. The Table
object makes this efficient without requiring additional memory copying.

> The table’s columns are instances of ChunkedArray, which is a
container for one or more arrays of the same type.

Contents:
- RecordBatch construction and slicing
- Table.from_batches, ChunkedArray as a Table column's physical container
- num_chunks / chunk(i) access without copying
- conversion to contiguous NumPy arrays for pandas

## PyArrow: Compute Functions

URL: https://arrow.apache.org/docs/python/compute.html
Version: Apache Arrow v26.0.0 (Python docs)

> Arrow supports logical compute operations over inputs of possibly
varying types.

> Many compute functions support both array (chunked or not)
and scalar inputs, but some will mandate either. For example,
sort_indices requires its first and only input to be an array.

Contents:
- pyarrow.compute module as the standard compute-function entry point
- element-wise functions (equal, multiply), aggregations (sum, min_max), sort_indices
- grouped aggregations via Table.group_by()
- user-defined compute functions registered alongside the standard ones

## Apache DataFusion blog: Using StringView / German Style Strings to Make Queries Faster, Part 1

URL: https://datafusion.apache.org/blog/2024/09/13/string-view-german-style-strings-part-1/
Version: published 2024-09-13 (StringView released in arrow-rs v52.2.0 / DataFusion v41.0.0)

> The concept of inlined strings with prefixes (called “German Strings” by Andy Pavlo, in homage to TUM, where the Umbra paper that describes them originated)
has been used in many recent database systems (Velox, Polars, DuckDB, CedarDB, etc.)
and was introduced to Arrow as a new StringViewArray[^3] type. Arrow’s original StringArray is very memory efficient but less effective for certain operations.
StringViewArray accelerates string-intensive operations via prefix inlining and a more flexible and compact string representation.

> Each view is 16 bytes long, and its contents differ based on the string’s length:

> string length < 12 bytes: the first four bytes store the string length, and the remaining 12 bytes store the inlined string.

> string length > 12 bytes: the string is stored in a separate buffer. The length is again stored in the first 4 bytes, followed by the buffer id (4 bytes), the buffer offset (4 bytes), and the prefix (first 4 bytes) of the string.

> StringView support was released as part of arrow-rs v52.2.0 and DataFusion v41.0.0.

Contents:
- the "German Strings" name (Andy Pavlo, after TUM's Umbra paper) and which systems already used the idea (Velox, Polars, DuckDB, CedarDB) before Arrow adopted it
- StringViewArray's 16-byte view layout, matching the Columnar spec's Variable-size Binary View Layout
- measured ClickBench query speedup (20%-200%) from switching to StringView
