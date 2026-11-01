# Sources: Integer compression (`dsa.integer-compression`)

## Lemire and Boytsov, "Decoding billions of integers per second through vectorization"

*Software: Practice and Experience* 45(1), 2015; arXiv:1209.2137.

URL: https://arxiv.org/pdf/1209.2137
Version: fetched 2026-10-31, arXiv preprint (final published form at SPE 45(1), 2015)

> It is nearly twice as fast
as the previously fastest schemes on desktop processors (varint-G8IU and PFOR).

> SIMD-BP128? saves up to 2 bits per integer.

> (SIMD-FastPFOR) that has a compression ratio within 10% of a state-of-the-art scheme
(Simple-8b) while being two times faster during decoding.

> A page is coded in blocks of 128 integers, with a separate storage array for the exceptions.

> We implemented all schemes with 128 integers per block and a page size of at least 216 integers.

> SIMD-BP128 combines 16 blocks of 128 integers whereas BP32 combines 4 blocks of

## Lemire, Kurz and Rupp, "Stream VByte: faster byte-oriented integer compression"

*Information Processing Letters* 130, 2018; arXiv:1709.08990.

URL: https://arxiv.org/pdf/1709.08990
Version: fetched 2026-10-31, arXiv preprint (final published form at IPL 130, 2018)

> a novel byte-oriented compression technique that separates the control stream from the encoded data.

> can be up to twice as fast as VARINT-G8IU decoding over real data sets.

> On a 3.4 GHz Haswell
processor, it decodes more than 4 billion differentially-coded integers per second from
RAM to L1 cache.

> this
block-based design can reduce the number of branch mispredictions by a factor of four.

> Stepanov et al. proposed a new patented byteoriented format (VARINT-G8IU) designed with SIMD instructions in mind.

## Google Protocol Buffers, "Encoding" (Protobuf documentation)

URL: https://protobuf.dev/programming-guides/encoding/
Version: fetched 2026-10-31

> So, for example, here is the number 1, encoded as `01` – it’s a single
byte, so the MSB is not set:

> And here is 150, encoded as `9601` – this is a bit more complicated:

> sintN uses the “ZigZag” encoding instead of two’s complement to encode
negative integers. Positive integers p are encoded as 2 * p (the even
numbers), while negative integers n are encoded as 2 * |n| - 1 (the odd
numbers).

## WebAssembly specification, "Values" (binary format)

URL: https://webassembly.github.io/spec/core/binary/values.html
Version: fetched 2026-10-31, "WebAssembly 3.0 (2026-10-28)"

> All integers are encoded using the LEB128 variable-length integer encoding, in either unsigned or signed variant.

## Apache Lucene, `Lucene99PostingsFormat` (9.11.1 core API)

URL: https://lucene.apache.org/core/9_11_1/core/org/apache/lucene/codecs/lucene99/Lucene99PostingsFormat.html
Version: fetched 2026-10-31, Lucene 9.11.1 (current format name re-checked at research time, per CHAPTER.md's note that the name changes with each Lucene format)

> the block size (i.e. number of integers inside block) is fixed (currently 128).

> PackedFreqBlock --> PackedInts, uses patching
 PackedDocDeltaBlock --> PackedInts, does not use patching

## Apache Parquet, `Encodings.md`

URL: https://raw.githubusercontent.com/apache/parquet-format/master/Encodings.md
Version: fetched 2026-10-31, `master` branch

> RLE = 3 | BOOLEAN, Dictionary Indices |

> DELTA_BINARY_PACKED = 5 | INT32, INT64 |

> This encoding uses a combination of bit-packing and run length encoding to more efficiently store repeated values.

## FastPFor (library) README

URL: https://raw.githubusercontent.com/lemire/FastPFor/master/README.md
Version: fetched 2026-10-31, `master` branch

> Myth: SIMD compression requires very large blocks of integers (1024 or more).

> Fact: This is not true. Our fastest scheme (SIMDBinaryPacking) works over blocks of 128 integers.

### Zukowski, Héman, Nes and Boncz, "Super-scalar RAM-CPU cache compression" (citation only)

ICDE 2006. Title and venue checked against the Lemire-Boytsov paper's own citation; the paper's
own text was not read this session, per `CHAPTER.md`'s instruction to attribute only what the
Lemire-Boytsov paper says it proposed.

### Goldstein, Ramakrishnan and Shaft, "Compressing relations and indexes" (citation only)

ICDE 1998. Title and venue checked against the Lemire-Boytsov paper's own citation (the frame-of-
reference attribution); the paper's own text was not read this session.

### Lemire, Boytsov and Kurz, "SIMD compression and the intersection of sorted integers" (citation only)

*Software: Practice and Experience* 46(6), 2016; arXiv:1401.6399. Citation checked, not read, per
`CHAPTER.md`.
