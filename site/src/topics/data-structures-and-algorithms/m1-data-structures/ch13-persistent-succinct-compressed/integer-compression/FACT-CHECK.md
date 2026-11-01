# FACT-CHECK: Integer compression (`dsa.integer-compression`)

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Varint: 7 payload bits per byte, MSB a continuation flag; 1 as a single byte `01`, 150 as `9601` | Protobuf "Encoding" docs | Verified — quoted exactly; reproduced and asserted in `examples.py` |
| 2 | Byte-count table: below 128 → 1 byte, below 16,384 → 2, below 2,097,152 → 3, below 268,435,456 → 4 | `CHAPTER.md`'s own arithmetic (7 bits/byte) | Verified — `examples.py` asserts all four cutoffs exactly |
| 3 | sintN uses ZigZag: positive p → 2p, negative n → 2\|n\|−1 | Protobuf "Encoding" docs | Verified — quoted exactly; `examples.py` asserts the doc's own 5-value worked table |
| 4 | WebAssembly: all integers use LEB128, "in either unsigned or signed variant" | WebAssembly spec, "Values" | Verified — quoted exactly |
| 5 | Frame of reference: partition into blocks, store the block's own bit width, pack each value at that width; attributed to Goldstein, Ramakrishnan and Shaft (ICDE 1998) | Lemire & Boytsov 2015 (citation of Goldstein et al.) | Citation only for Goldstein et al. itself (not read, per `CHAPTER.md`); the mechanism is reproduced and measured in `examples.py` |
| 6 | PFOR: pick a narrow bit width, patch the values that don't fit as exceptions; attributed to Zukowski, Héman, Nes and Boncz (ICDE 2006) | Lemire & Boytsov 2015 (citation) | Citation only for Zukowski et al. itself (not read, per `CHAPTER.md`); the mechanism is reproduced and measured in `examples.py` |
| 7 | SIMD-BP128: "nearly twice as fast... as the previously fastest schemes" (varint-G8IU, PFOR), "saves up to 2 bits per integer," blocks of 128 integers | Lemire & Boytsov 2015 | Verified — quoted exactly |
| 8 | SIMD-FastPFOR: compression ratio "within 10% of a state-of-the-art scheme (Simple-8b) while being two times faster during decoding" | Lemire & Boytsov 2015 | Verified — quoted exactly |
| 9 | FastPFor's own fastest scheme (SIMDBinaryPacking) works over blocks of 128 integers, contradicting the myth that SIMD needs blocks of 1,024 or more; Stream VByte works over blocks of four | FastPFor README | Verified — quoted exactly |
| 10 | Varint-GB: one control byte per four integers; "can reduce the number of branch mispredictions by a factor of four" | Stream VByte paper (Lemire, Kurz, Rupp 2018) | Verified — quoted exactly |
| 11 | Stream VByte: separates the control stream from the encoded data; "up to twice as fast as VARINT-G8IU decoding over real data sets"; on a 3.4 GHz Haswell, "more than 4 billion differentially-coded integers per second from RAM to L1 cache" | Stream VByte paper | Verified — quoted exactly |
| 12 | VARINT-G8IU (Amazon) is patented, per the Stream VByte paper's own sentence | Stream VByte paper | Verified — quoted exactly; no further claim about the patent is made |
| 13 | Lucene 9.x `Lucene99PostingsFormat`: packed-block size "currently 128"; frequency blocks use patching, document-delta blocks do not | Lucene 9.11.1 Javadoc | Verified — quoted exactly, current version re-checked at research time per `CHAPTER.md`'s instruction |
| 14 | Parquet: `DELTA_BINARY_PACKED` (delta encoding) and the RLE/bit-packing hybrid are two separate, named encodings | Parquet `Encodings.md` | Verified — quoted exactly |
| 15 | The counting floor for a sorted n-subset of universe u is log₂C(u,n) bits, about n·(log₂(u/n) + 1.44) for n ≪ u; for n = 2²⁰, u = 2³², exactly 13.44 bits/id | `CHAPTER.md`'s own arithmetic (the same counting argument as Chapters 1 and 12) | Verified — `examples.py` computes log₂C(u,n) exactly via the log-gamma function and the closed-form approximation, both landing at 13.44 |

## Currency check

All sources read 2026-10-31/11-01. The two Lemire et al. papers are arXiv preprints of published
journal articles (SPE 45(1) 2015, IPL 130 2018) and don't change. Protobuf's "Encoding" docs,
WebAssembly's spec, the FastPFor README, and Parquet's `Encodings.md` were read from their
current live pages/default branches; Lucene's postings-format page was read at version 9.11.1
specifically (the format class name changes with each Lucene release, per `CHAPTER.md`'s own
warning) and this topic names that version explicitly rather than claiming permanence.

## Red team

1. **The GOV2-collection decimal bits-per-integer table in Lemire & Boytsov 2015 (binary packing
   at roughly 5.5, SIMD-BP128 at roughly 6.3, OptPFD at roughly 4.5, per `CHAPTER.md`'s own
   planning prose) could not be reliably re-extracted from this topic's own PDF-to-text fetch** —
   the table's numeric columns survive extraction but their alignment with each scheme's own row
   label does not, so quoting a specific decimal figure and attributing it to the wrong scheme
   would be a real error, not a cosmetic one. This topic cites the paper's qualitative claims
   (verified word for word) and does not repeat the specific GOV2 decimal figures. Documented in
   `OUTLINE.md`'s "Changes from the chapter plan."
2. **Decode speed is never measured in Python and reported as if it meant something on real
   hardware.** `examples.py` counts data-dependent branches per integer instead — a model, not a
   benchmark — and the reel, narration and post-notes all attribute every actual speed number
   (Stream VByte's 4 billion integers/second, SIMD-BP128's "nearly twice as fast") to its own
   paper's own named hardware, never to anything measured in this topic's own build.
3. **Frame of reference costing *more* bits than plain varint on this topic's own measured list
   (16.93 vs 15.97) is a real, outlier-driven result of this build's own gap distribution, not an
   error and not a universal claim about frame of reference.** Stated explicitly in the reel's
   own step 10 and in `post-notes.md`'s Internals section: on a list with no outliers (closer to
   `CHAPTER.md`'s own planning run), frame of reference would come out smaller, around 15 bits/id;
   this topic's own list deliberately adds outliers specifically so patching has something to
   fix, and reports the resulting number honestly rather than picking a gap distribution that
   would make frame of reference look better than it is on this list.
4. **PFOR's own exception encoding (base-width slot plus an eight-bit position plus a 32-bit
   value per exception) is this topic's own simplified instructional model**, not any specific
   library's exact bit layout — named as a model in `post-notes.md`'s Internals section, since
   real implementations (NewPFD, OptPFD) vary in how they pack exception positions and values.
5. **Two of the four "where this is used" claims (Lucene, Parquet) are read directly from each
   system's own current documentation**, not inferred from the papers' own adoption sentences
   (the papers don't name Parquet at all) — each one checked against the actual doc page, dated.

## Corrections applied

- The first draft of `examples.py`'s posting list used a plain exponential gap distribution with
  no outliers, following `CHAPTER.md`'s own planning description literally. Patching then barely
  improved on plain frame of reference (14.95 → 14.93 bits/id), too small a difference to teach
  anything. Fixed by adding a one-percent fraction of gaps drawn from a much wider exponential,
  which is exactly the "clustered gap distribution with outliers, to show patching" `CHAPTER.md`
  itself asks for — after the fix, frame of reference rises to 16.93 bits/id (one outlier per
  block really does widen the whole block) and patching recovers most of it, landing at 15.21.
