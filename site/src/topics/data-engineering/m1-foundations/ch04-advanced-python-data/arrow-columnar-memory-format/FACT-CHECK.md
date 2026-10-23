# Fact-check — de.arrow-columnar-memory-format

Role switch: re-deriving every claim in `OUTLINE.md`'s claims list directly from the fetched
source texts in `sources/`, never from memory of writing the outline.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | An array is buffers + length + null count + optional dictionary | Confirmed | spec, "Physical Memory Layout#": "Arrays are defined by a few pieces of metadata and data: A data type. A sequence of buffers. A length... A null count... An optional dictionary..." |
| 2 | A 0-null-count array may omit its validity bitmap buffer | Confirmed, and directly measured | spec quote ("Arrays having a 0 null count may choose to not allocate the validity bitmap...") + sandbox run: `pa.array([1,2,3,4]).buffers()[0] is None` → `True`; `pa.array([1,2,None,4]).buffers()[0]` → a real 1-byte buffer. |
| 3 | Validity bit convention is LSB-first, 1 = valid | Confirmed | spec quote: `is_valid[j] -> bitmap[j / 8] & (1 << (j % 8))`, with "A 1 (set bit)... indicates that the value is not null". |
| 4 | `ChunkedArray`/`Table` let several record batches act as one logical column without copying | Confirmed, and directly measured | PyArrow data-model docs quote ("makes this efficient without requiring additional memory copying") + sandbox run: `pa.Table.from_batches([b1, b2]).column(0).num_chunks == 2`. |
| 5 | Dictionary encoding stores integer indices into a separate dictionary array; index array layout is a plain primitive integer layout; dictionaries may hold duplicates/nulls | Confirmed | spec, "Dictionary-encoded Layout#" quote, plus the spec's own worked example showing a dictionary with a duplicate `'foo'` and a `null`. |
| 6 | Run-end encoding stores `run_ends`/`values` child arrays; `run_ends` holds cumulative end index, enabling binary-search random access, unlike classic RLE | Confirmed | spec, "Run-End Encoded Layout#" quote, explicit contrast: "Contrast this with run-length encoding, in which the lengths of the runs are represented directly, and in which random access is less efficient." |
| 7 | String-view 16-byte layout: <=12 bytes inlined; longer strings keep length/prefix/buffer-index/offset | Confirmed by two independent sources | Arrow spec's own byte table, and DataFusion's blog post describing the identical split (`length < 12 bytes` inlined; `length > 12 bytes` → length + buffer id + offset + prefix). The two sources use a different byte order in their prose (spec: prefix/buf.index/offset; DataFusion: buffer id/offset/prefix) but agree on the same four 4-byte fields and the same 12-byte inline threshold — re-checked against the spec's own table, which is the authoritative byte order. |
| 8 | "German Strings" is Andy Pavlo's name, after TU Munich's Umbra paper; Velox/Polars/DuckDB/CedarDB used the idea before Arrow's `StringViewArray` | Confirmed | DataFusion blog quote, verbatim. |
| 9 | StringView improved ClickBench string queries by 20%-200% | Confirmed, sourced-only (DataFusion isn't installed in this sandbox) | DataFusion blog, Figure 1 caption text fetched as plain text: "StringView improves string-intensive ClickBench query performance by 20% - 200%". Scope note added to post-notes: this is a claim about DataFusion, not re-measured here. |
| 10 | Nested types (`List`) reuse the same primitive buffer kinds: validity bitmap + offsets + child array | Confirmed | spec, "List Layout#" quote: "The List layout is defined by two buffers, a validity bitmap and an offsets buffer, and a child array." |
| 11 | `pyarrow.compute` kernels run vectorized and can meaningfully beat an equivalent Python loop | Confirmed, and directly measured | PyArrow compute docs (kernel examples) + sandbox run: `pc.sum()` over 2,000,000 ints in ~3.2 ms vs. a Python `for` loop over the same data in ~120 ms (≈37x). Numbers vary run to run; `examples.py` asserts a conservative ratio, not the exact figure. |
| 12 | Arrow's own stated goal: "language-agnostic... true zero-copy access in shared memory" | Confirmed, and directly demonstrated | spec quote, verbatim, from the document's own opening description and "key features" list + sandbox run: the same `pyarrow.Table` object queried directly by DuckDB (`con.execute("SELECT sum(x) FROM tbl")`, `tbl` a Python-local variable) and loaded directly by Polars (`pl.from_arrow(tbl)`), both returning the identical correct sum with no CSV, pandas or serialization step between them. |
| 13 | Arrow's type system doesn't separate physical/logical types the way Parquet's does | Confirmed | spec quote, verbatim, naming Parquet directly. |

## Red team

- **Step 3 predict** ("does a 0-null array still get a bitmap buffer?"): tried the counter-case
  of an array built *with* nulls and then having every null value overwritten — Arrow has no
  such in-place mutation path (arrays are immutable), so this edge case doesn't arise; the
  predict's premise (a freshly-built 0-null array) stays clean. Also checked: does "may choose
  to not allocate" mean some PyArrow code paths allocate one anyway? Directly confirmed on this
  sandbox's PyArrow 26.0.0 that the common construction path (`pa.array(...)`) does not; the
  predict's answer and the step's final frame both say "on this build," not "always," matching
  the spec's own "how this is represented depends on the implementation" caveat.
- **Step 6 (run-end vs. dictionary)**: tried to break the contrast with data that is both
  low-cardinality *and* mostly non-contiguous (a column alternating two values every row) —
  measured directly: dictionary encoding still wins there (small dictionary, no runs to
  exploit), and run-end encoding does *not* help (worst case: one "run" of length 1 per value,
  larger than the plain array). This confirms the takeaway rather than breaking it, and the
  reveal's final frame now states the alternating-value counter-case explicitly rather than
  only the favorable case.
- **Step 7 (string-view)**: checked whether PyArrow's `string_view()` cast is a faithful stand-in
  for the layout DataFusion measures, since DataFusion itself isn't installed here. The spec and
  the DataFusion post describe the same wire-level byte layout (12-byte inline threshold, 4-byte
  prefix) independent of which engine produced it, and PyArrow's cast produces that same layout
  (confirmed via `.buffers()` on the sandbox) — so the byte-layout claims are measured directly,
  while only the ClickBench *performance number* is disclosed as sourced-only (DataFusion-specific
  and not re-measured here); `post-notes.md` and `reel.tsx` are both explicit about that split.
- **Step 9 (kernel vs. loop)**: tried a counter-case where the "kernel" might just be hiding the
  same per-element Python cost — checked `pc.sum()` is implemented in Arrow's C++ core (per the
  compute docs, "C++ documentation" link for the underlying kernels), not pure Python, and timed
  it against a genuinely equivalent pure-Python loop (same input list length, same operation) —
  the ≈37x gap held up across repeated runs within the same order of magnitude; `examples.py`'s
  assertion uses a conservative lower bound (at least 5x) rather than the exact measured ratio,
  so the check doesn't become flaky on a slower or shared machine.
- **Step 10 (interchange)**: tried to find a case where Polars or DuckDB *would* need a real
  copy from the same `pyarrow.Table` — found one and disclosed it honestly in post-notes rather
  than hiding it: DuckDB's own query *output* (the result set) is not a view into `tbl`'s
  buffers (confirmed already in topic 29's fact-check, re-cited here) — the zero-copy promise is
  about the *input* side of the handoff, not every operation downstream of it. The step's
  narration and takeaway are both worded to say "no conversion of the input," not "nothing
  Arrow ever touches is a copy."
- **Predict's wrong options**: for step 3, the tempting wrong answer ("yes, allocated anyway for
  consistency") was checked against a plausible real-world reason someone might believe it — C
  APIs often avoid conditionally-present fields for simplicity — and confirmed that reason exists
  (the spec itself: "Implementations may choose to always allocate a validity bitmap anyway as a
  matter of convenience") without being what this sandbox's PyArrow actually does, which is
  exactly why the predict is worth asking rather than obvious either way.

No claim was dropped; no correction changed a reveal's real measured number (only the wording of
the step-7 byte-order description, and the explicit alternating-value counter-case added to
step 6, and the input-side-only scoping of step 10's takeaway, listed as corrections below).

## Corrections applied to OUTLINE.md

- Step 7: wording now says the spec's own byte order is authoritative where the spec and the
  DataFusion post's prose differ on which 4-byte field comes first, instead of presenting both
  as identical.
- Step 6: added the alternating-value counter-case to the reveal's final frame and the
  post-notes production-failures section, instead of only showing run-end encoding's favorable
  case.
- Step 10: takeaway reworded to "no conversion of the input" rather than an unqualified
  zero-copy claim, consistent with topic 29's own finding that a query's output is not itself a
  zero-copy view.
