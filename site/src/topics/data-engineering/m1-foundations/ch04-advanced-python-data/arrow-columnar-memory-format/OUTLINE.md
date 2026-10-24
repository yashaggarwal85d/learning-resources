# Outline — de.arrow-columnar-memory-format

Learning outcomes:
- Describe an Arrow array as buffers (a validity bitmap plus data/offset buffers) rather than a
  blob, and say when the bitmap itself is absent.
- Contrast dictionary encoding, run-end encoding and the string-view layout by what each one
  actually compresses (repeats, runs, and string storage/comparison respectively).
- Run a real Arrow compute kernel and measure its real advantage over an equivalent Python loop.
- State why Arrow became the shared interchange layer between engines, backed by a real
  same-object handoff between two engines already in this sandbox (Polars, DuckDB).

1. **Hook.** Topic 29 measured a native engine beating a Python loop by a wide margin, and a
   handoff into that engine that beat a CSV round trip. It never asked the more basic question:
   how do two completely different engines — Polars, DuckDB — read the very same bytes at all?
2. **Reveal: an array is buffers, not a blob.** A validity bitmap plus a data buffer, quoted
   directly from the spec and shown on a real small PyArrow array.
3. **Predict (within first four).** This array has zero nulls. Does PyArrow still allocate a
   validity bitmap buffer for it? (Tempting wrong answer: yes, for safety / consistency with the
   nulled version. Real answer, quoted and measured: no — the buffer is absent, `None`.)
4. **Reveal: chunked arrays and record batches.** Several record batches become one logical
   `ChunkedArray` column with no copying — real PyArrow `Table.from_batches`, `num_chunks`
   measured directly.
5. **Reveal: dictionary encoding.** Repeated values become small integer indices into a
   separate dictionary array — real measured byte reduction on a column with many repeats.
6. **Reveal: run-end encoding.** Takeaway here. Contrast directly with step 5: dictionary
   encoding compresses *repeats* anywhere in the array; run-end encoding compresses *runs* —
   consecutive repeats — and loses on data that repeats but doesn't run. Real measured byte
   reduction (far larger than dictionary's, on data built to actually run), plus the spec's own
   binary-search random access, contrasted with classic run-length encoding's lack of it.
7. **Reveal: the string-view ("German strings") layout.** Classic `StringArray` (one packed
   data buffer plus offsets) versus `StringViewArray`'s 16-byte view: short strings inlined,
   long strings keeping a 4-byte prefix for fast comparison. Real PyArrow cast measured; the
   DataFusion source's own naming (Andy Pavlo, after TU Munich's Umbra paper) and its real
   ClickBench number (20%-200%) cited as sourced evidence from a system not in this sandbox.
8. **Reveal: nested types reuse the same primitives.** A `List` array is just a validity bitmap,
   an offsets buffer and a child array of whatever type — no separate nested representation.
9. **Reveal: compute kernels.** Takeaway here. A real `pyarrow.compute` kernel versus an
   equivalent Python loop on the same data, measured directly — the vectorized kernel operates
   straight on these buffers, which is exactly the object-overhead gap topic 26 first measured.
10. **Reveal: why Arrow became the interchange layer.** Takeaway here. The spec's own words —
    "language-agnostic," "true zero-copy access in shared memory" — demonstrated for real: the
    identical `pyarrow.Table` object, with no conversion step, consumed directly by both Polars
    (`pl.from_arrow`) and DuckDB (querying the Python variable by name) in this sandbox.
11. **Recap.**
12. **Prove it.** Three columns, three shapes: repeated low-cardinality codes, a long sorted run
    of timestamps, and free-text comments. Match each to the layout that actually fits it
    (dictionary, run-end, string-view) and say what happens if you pick wrong.

## Narrator's line of thought (beyond the description)

- Step 1: why would anyone care how two *different* engines read the same bytes — because every
  prior topic's native-engine win assumed that handoff was free, and never asked why.
- Step 2: the wrong intuition to correct — "an array" sounds like one thing; it's actually a
  small bundle of separately-addressable buffers, and that's what makes zero-copy slicing and
  the view layout both possible.
- Step 3: before revealing, ask what a bitmap is *for* — if the answer is "marking nulls," then
  an array that provably has none shouldn't need to pay for one; the question is whether the
  implementation actually takes advantage of that.
- Step 4: the question to ask before the reveal — if batches keep arriving on a socket, must the
  earlier ones be copied into a bigger buffer to make one dataset? The chunk is the "no" answer.
- Step 5: what's being traded for that integer index — a layer of indirection through the
  dictionary array for a lot less memory, exactly like a foreign key.
- Step 6: the wrong intuition from step 5 — "dictionary encoding is strictly better for repeats"
  — corrected by showing it has no idea runs exist, while run-end encoding is built for nothing
  else; the two are not competitors, they're specialists.
- Step 7: the question before the reveal — why keep a *copy* of the first four bytes inline when
  the full string already lives in a buffer one hop away? Because that hop is the expensive
  part for the comparisons that decide most queries.
- Step 8: the correction — nesting doesn't require a new kind of memory, only another buffer and
  another child array; the validity-bitmap convention from step 2 never changes.
- Step 9: tie explicitly back to topic 26 — the per-row loop was slow because of boxed
  `PyObject`s; the kernel is fast because it never builds one, and that's a direct, measured
  consequence of the buffer layout this whole topic has been describing.
- Step 10: the question to leave the learner with — "interchange format" is a phrase every
  library's marketing uses; what does it actually cost to *not* have one, and what's the
  specific textual promise ("zero-copy access in shared memory") being cashed in here, for real.
- Step 12 (Prove it): no new fact, a synthesis — which of this topic's four layouts actually
  fits each shape, and the real cost of guessing wrong (comments stored as a dictionary waste
  the dictionary on near-unique values; a sorted-timestamp column stored as plain values wastes
  a 100x-smaller run-end encoding).

## Post-notes headings (layers 5-8)

- **Internals**: the exact byte layout of the view struct (table from the spec), why `buf. index`
  and `offset` exist, why run-end's `run_ends` enables binary search where RLE's lengths don't.
- **Lab**: the chunked-array/no-copy-append measurement, the dictionary- vs run-end-encoding byte
  counts, the kernel-vs-loop timing, and the Polars/DuckDB same-object handoff, all from
  `examples.py`.
- **Production failures**: picking dictionary encoding for a near-unique column (the dictionary
  grows almost as large as the data it was meant to shrink); assuming "Arrow" everywhere means
  zero-copy everywhere, when a format conversion (e.g. through JSON, or to a non-Arrow-aware
  library) still forces a real copy.
- **Frontier**: StringView's 2024 landing in arrow-rs/DataFusion and PyArrow's own
  `string_view()` cast, both recent enough to still be opt-in or newly default in parts of the
  ecosystem — sourced from the DataFusion post's own release-version language.
- **Where this goes next**: pandas 3.0 adopting Arrow-backed dtypes as an option rather than the
  default; Parquet's own, related-but-different type system (§6.1).

## Examples to execute (and what each must assert)

- Validity bitmap presence/absence: assert a buffer is `None` for a 0-null-count array and a
  real 1-byte+ buffer for one with a null.
- Chunked array/no-copy append: assert `num_chunks == len(batches)` and that total row count
  equals the sum, without any data copy function being called.
- Dictionary encoding: assert the dictionary-encoded byte size is smaller than the plain array's
  on real repeated data, and name the actual numbers.
- Run-end encoding: assert its byte size is dramatically smaller than the plain array's on real
  run-structured data, and smaller than the same data's dictionary-encoded size.
- String-view cast: assert short strings are stored inline and long strings are not, from the
  real buffer layout PyArrow produces.
- Nested type buffers: assert a `List` array's own buffer set is exactly validity + offsets (no
  separate buffer kind).
- Compute kernel vs. Python loop: assert the kernel result equals the loop's result and measure
  both real times, asserting the kernel is meaningfully faster.
- Polars/DuckDB same-object handoff: assert both engines compute the identical correct answer
  from the one `pyarrow.Table` object, with no intermediate file or DataFrame conversion call.

## Bridge and handoff

- Bridge: "Every profiling number in §4.1 was read off Python-level code calling into a native
  engine underneath it. This topic is the memory format most of those native engines now share
  without copying a single byte at the boundary: Arrow."
- Handoff: "Arrow is the shared memory format; pandas 3.0 is the first topic to show what
  changes when a library actually builds its own dtypes on top of it instead of NumPy's."

## Concept ledger

- Introduces: `arrow-columnar-format`.
- Uses: `cpython-object-model` (step 9's direct contrast).
- Declared: none beyond topic 1.

## Claims list (claim → source)

1. An array is buffers + length + null count + optional dictionary, not a single blob — Arrow
   Columnar Format spec, "Physical Memory Layout".
2. A 0-null-count array may omit its validity bitmap buffer entirely — spec, validity bitmaps
   section; confirmed directly on this sandbox's PyArrow (`buffers()[0] is None`).
3. The validity bit convention is LSB-first, 1 = valid — spec, `is_valid[j] -> bitmap[j/8] &
   (1 << (j%8))`.
4. `ChunkedArray`/`Table` let multiple record batches act as one logical column without copying
   — PyArrow "Data Types and In-Memory Data Model" docs.
5. Dictionary encoding stores integer indices into a separate dictionary array; the index array's
   layout is a plain primitive integer layout; dictionaries may hold duplicates or nulls — spec,
   "Dictionary-encoded Layout".
6. Run-end encoding stores two child arrays (`run_ends`, `values`); `run_ends` holds the
   cumulative end index of each run, enabling binary-search random access, unlike classic RLE's
   direct run-length storage — spec, "Run-End Encoded Layout".
7. The string-view layout's 16-byte view: <=12-byte strings inlined; longer strings keep a
   4-byte length, prefix, buffer index and offset — spec, "Variable-size Binary View Layout",
   independently confirmed by the DataFusion blog's identical byte breakdown.
8. "German Strings" is Andy Pavlo's name (after TU Munich's Umbra paper); Velox, Polars, DuckDB
   and CedarDB already used the idea before Arrow's `StringViewArray` — DataFusion blog.
9. StringView measurably improved ClickBench string-query performance by 20%-200% — DataFusion
   blog (a claim about DataFusion, sourced-only here since DataFusion isn't in this sandbox).
10. Nested types (e.g. `List`) are built from the same primitive buffer kinds as flat types
    (validity bitmap + offsets + child array) — spec, "Physical Memory Layout" / List layout.
11. `pyarrow.compute` kernels run vectorized over these buffers and can be meaningfully faster
    than an equivalent per-row Python loop on the same data — PyArrow compute docs, confirmed by
    direct measurement on this sandbox.
12. Arrow's own stated goal is a "language-agnostic in-memory data structure specification" with
    "true zero-copy access in shared memory" — spec, intro/"key features"; confirmed for real by
    one `pyarrow.Table` object consumed directly by both Polars and DuckDB with no conversion
    step on this sandbox.
13. Arrow's type system does not separate "physical" and "logical" types the way Parquet's does
    — spec's own note, naming Parquet directly (the syllabus's §6.1 forward reference).

## Changes from the chapter plan

None; this topic keeps to its CHAPTER.md entry as written.
