# Outline — de.pandas-3-0-semantics

Learning outcomes:
- Demonstrate, on this sandbox's installed pandas 3.0.5, that chained assignment no longer
  mutates the original frame and that `SettingWithCopyWarning` is gone — replaced by a
  differently-named warning, not silence.
- Contrast the new default `str` dtype's missing-value sentinel against the older, still-present
  nullable `string[pyarrow]` dtype's sentinel, and against NumPy-backed vs. Arrow-backed
  nullable numeric dtypes.
- State pandas 3.0's microsecond-resolution datetime-inference default.
- Name the pandas 2.3 opt-in flags that let a team rehearse 3.0's behavior before upgrading.

1. **Hook.** Arrow is the shared memory format topic 30 just described. pandas 3.0's own
   headline changes — a default string dtype, Copy-on-Write always on — only make sense in
   terms of those buffers: this is the first library in the chapter actually built on them.
2. **Reveal: a default string dtype, not object.** A plain list of strings, given to `pd.Series`
   on this installed pandas, now infers a dedicated `str` dtype instead of the old catch-all
   `object` dtype — backed by PyArrow under the hood when it's installed, which it is here.
3. **Predict (within first four).** This new default string dtype's missing-value marker — does
   it look like the strict, typed nullable extension dtypes' own marker, or like the old,
   loose `object` dtype's marker it's replacing? (Tempting wrong answer: the strict nullable
   marker, since it's PyArrow-backed under the hood. Real answer, measured: the old, loose
   marker — intentionally, to keep existing code's missing-value checks working.)
4. **Reveal: every indexing operation behaves as a copy.** Subsetting a frame never lets you
   mutate the original through that subset — measured directly: the subset shares the original's
   memory right up until the moment it's actually mutated, and only then does pandas copy.
5. **Reveal: chained assignment stops working.** `SettingWithCopyWarning` really is gone — but a
   differently-named warning takes its place, measured directly on this sandbox, and the
   original frame is confirmed unmutated either way.
6. **Reveal: two confusingly similar string dtypes.** Takeaway here. The new default
   `str` dtype and the older, still-present opt-in `string[pyarrow]` dtype sound almost
   interchangeable, but they print different dtype names *and* use different missing-value
   sentinels — measured directly, side by side.
7. **Reveal: NumPy-backed vs. Arrow-backed nullable numbers.** Takeaway here. A NumPy-backed
   nullable `Int64` and an Arrow-backed `int64[pyarrow]` column use the *same* missing-value
   sentinel — the axis that actually matters for missing-value semantics is nullable-extension
   vs. not, not NumPy vs. Arrow.
8. **Reveal: microsecond-resolution datetime inference.** Parsing a date string now infers
   microsecond resolution by default instead of always nanoseconds — measured directly, with the
   resolution actually used shown for a string and for an integer input side by side.
9. **Reveal: migrating via pandas 2.3's warnings.** Takeaway here. The pre-3.0 opt-in flags
   (`future.infer_string`, `mode.copy_on_write = "warn"`) that let a team rehearse this behavior
   before upgrading — measured directly that setting the now-legacy flag on this installed 3.0.5
   triggers an explicit deprecation notice rather than silently doing nothing.
10. **Recap.**
11. **Prove it.** A team's existing code checks `.dtype == object` to detect string columns and
    relies on chained assignment to silence a linter. Both checks are about to silently stop
    doing what the team assumes. What actually breaks, and what's the fix for each?

## Narrator's line of thought (beyond the description)

- Step 1: the question to plant — a library can be "built on Arrow" in name only, or the
  buffers can actually change what the library's own API promises; which is pandas 3.0?
- Step 2: the wrong intuition to correct — "object dtype" sounds specific to strings; it was
  never specific to anything, which is exactly the problem the new dtype fixes.
- Step 3: before revealing, ask what "PyArrow-backed" should imply about missing values — if the
  answer is "the strict nullable marker," why might pandas deliberately choose not to use it.
- Step 4: the question before the reveal — if every subset is supposed to act like a copy, does
  pandas actually copy the data every single time, or only when it has to?
- Step 5: the correction — "the warning is gone" doesn't mean "nothing warns you anymore"; it
  means a different, more specific warning replaced it, and chained assignment never silently
  succeeds either way.
- Step 6: the wrong intuition from step 2 — "PyArrow-backed" implies one consistent set of
  missing-value rules; it doesn't, because two genuinely different dtypes share that property.
- Step 7: the correction to step 6's implied lesson — the backing storage (NumPy vs. Arrow) is
  not what decided the sentinel in step 6; being a nullable extension dtype at all is what did.
- Step 8: tie back to topic 30 — this is the same kind of "always defaulted to the biggest size"
  story the chapter has told before, resolved the same way: infer the resolution you actually
  need instead of assuming the widest one.
- Step 9: the question to leave the learner with — a breaking change this large didn't arrive
  with no warning at all; what did the release right before it actually let a team test first?
- Step 11 (Prove it): no new fact, a synthesis — which specific pandas 3.0 behavior breaks each
  assumption, and what the one-line fix is for each (checking `.dtype == object` → check against
  `str` or use `pd.api.types.is_string_dtype`; relying on chained assignment → a single `.loc`
  call).

## Post-notes headings (layers 5-8)

- **Internals**: the lazy-copy mechanism (views reused until mutation), the actual
  `pd.errors.ChainedAssignmentError` class and why it's a `Warning` subclass despite its name,
  the exact missing-value-sentinel table across `str` / `string[pyarrow]` / `Int64` /
  `int64[pyarrow]` / plain `object`.
- **Lab**: none of its own; all measurements are this topic's own (chained assignment, the
  lazy-copy/memory-sharing check, the sentinel contrasts, datetime resolution inference, the
  2.3 migration flags).
- **Production failures**: code that checks `.dtype == object` to detect string columns (now
  silently stops matching); code that relies on chained assignment plus a defensive `.copy()`
  to silence a linter (the defensive copy is now needless, and the assignment itself never
  worked to begin with); code that assumes any "Arrow-backed" pandas dtype shares the same
  missing-value sentinel.
- **Frontier**: the pandas 3.1.0 docs already note a further change to integer-input datetime
  resolution inference (also defaulting to microseconds), disclosed here as sourced-only since
  it postdates this sandbox's installed 3.0.5 and wasn't independently verified against it.
- **Where this goes next**: pandas 3.0 adopted Arrow-backed dtypes as an option rather than the
  default API; the next topic is the dataframe library built around Arrow and lazy evaluation
  from the ground up.

## Examples to execute (and what each must assert)

- Default string dtype: assert a plain `pd.Series(["a","b"])` gets `dtype == "str"` on this
  installed pandas, and name the exact dtype string.
- Missing-value sentinel contrast: assert the new default `str` dtype's missing value reprs as
  `nan` while the older, opt-in `string[pyarrow]` dtype's missing value reprs as `<NA>`, same
  display dtype name on both.
- NumPy- vs. Arrow-backed nullable numeric sentinel: assert both a nullable `Int64` column and
  an `int64[pyarrow]` column's missing value both repr as `<NA>`.
- Copy-on-Write lazy view: assert a subset shares memory with the original via
  `np.shares_memory` before any mutation, and assert the original is unchanged after mutating
  the subset.
- Chained assignment: assert the operation raises/emits `pd.errors.ChainedAssignmentError` (via
  `warnings.catch_warnings`) and assert the original frame's value is unchanged afterward.
- Microsecond datetime inference: assert `pd.to_datetime(["2024-03-22 11:36"]).dtype` is
  `datetime64[us]` and `pd.to_datetime([0], unit="s").dtype` is `datetime64[s]`.
- 2.3 migration flags on 3.0.5: assert setting `pd.options.mode.copy_on_write = "warn"` emits a
  deprecation warning by name, and assert `pd.options.future.infer_string` can still be set
  without raising.

## Bridge and handoff

- Bridge: "Arrow is the shared memory format underneath. This topic is the first library this
  chapter shows actually built on it: pandas 3.0, whose headline semantic changes — Copy-on-Write
  always on, an Arrow-backed string dtype — only make sense in terms of the buffers topic 5 just
  introduced."
- Handoff: "pandas 3.0 adopted Arrow-backed dtypes as an option; the next topic is the dataframe
  library that was designed around Arrow and lazy evaluation from the start, rather than
  retrofitted onto it."

## Concept ledger

- Introduces: `pandas-copy-on-write`.
- Uses: `arrow-columnar-format`.
- Declared: basic pandas familiarity (DataFrame, Series).

## Claims list (claim → source)

1. A dedicated `str` dtype is enabled by default in pandas 3.0, backed by PyArrow when
   installed, otherwise NumPy object-dtype — pandas 3.0.0 whatsnew; confirmed directly
   (`pd.Series(["a","b"]).dtype == "str"` on this sandbox's pandas 3.0.5 with PyArrow 26.0.0
   installed).
2. The `str` dtype's missing-value sentinel is always `NaN`, matching other default dtypes —
   pandas 3.0.0 whatsnew; confirmed directly against the older `string[pyarrow]` dtype's `pd.NA`
   sentinel, measured on this sandbox.
3. Every indexing operation or method returning a new DataFrame/Series behaves as a copy in the
   user API, with views reused under the hood until a mutation forces a real copy — pandas 3.0.0
   whatsnew ("views as much as possible, and only copy when needed"); confirmed directly via
   `np.shares_memory` before and after a mutation.
4. Chained assignment stops working consistently, and `SettingWithCopyWarning` is removed —
   pandas 3.0.0 whatsnew; confirmed directly, and the sandbox's pandas 3.0.5 raises
   `pd.errors.ChainedAssignmentError` as the specific replacement warning class, which is not
   named in the fetched whatsnew prose and is disclosed as a direct sandbox observation, not a
   quoted claim.
5. `mode.copy_on_write` no longer has any effect and is deprecated, to be removed in pandas 4.0
   — pandas 3.0.0 whatsnew; confirmed directly: setting it on this sandbox emits a
   `Pandas4Warning` deprecation notice.
6. The new default resolution when parsing date strings is microseconds, falling back to
   nanoseconds only when precision requires it — pandas 3.0.0 whatsnew; confirmed directly
   (`pd.to_datetime(["2024-03-22 11:36"]).dtype == "datetime64[us]"`).
7. pandas 2.3 offered `pd.options.future.infer_string = True` to preview the 3.0 string-dtype
   default, and `pd.options.mode.copy_on_write = "warn"` (since 2.2) to flag subtler
   Copy-on-Write-related behavior changes before the hard 3.0 cutover — pandas 2.3.0 whatsnew.

## Changes from the chapter plan

None; this topic keeps to its CHAPTER.md entry as written.
