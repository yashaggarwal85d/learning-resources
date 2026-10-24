# Fact-check — de.pandas-3-0-semantics

Role switch: re-deriving every claim in `OUTLINE.md`'s claims list directly from the fetched
source texts in `sources/` and from direct measurement on this sandbox's pandas 3.0.5, never
from memory of writing the outline.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A default `str` dtype, PyArrow-backed when installed | Confirmed, and directly measured | pandas 3.0.0 whatsnew quote, verbatim, plus `pd.Series(["a","b"]).dtype` → `str` on this sandbox (pandas 3.0.5, pyarrow 26.0.0 installed). |
| 2 | `str` dtype's sentinel is always `NaN` | Confirmed, and directly measured | whatsnew quote ("The missing value sentinel is always NaN...") + sandbox: `pd.Series(["a","b",None])[2]` reprs as `nan`, while `pd.Series(["a","b",None], dtype="string[pyarrow]")[2]` reprs as `<NA>` — different dtype names (`str` vs. `string`) *and* different sentinels. |
| 3 | Every indexing op behaves as a copy; views reused until mutation forces a copy | Confirmed, and directly measured | whatsnew quote ("views as much as possible, and only copy when needed") + sandbox: `np.shares_memory(df['a'].to_numpy(), sub.to_numpy())` is `True` before any mutation; after `sub.iloc[0] = 999`, the original `df['a']` is unchanged. |
| 4 | Chained assignment stops working; `SettingWithCopyWarning` removed | Confirmed, and directly measured, with a named addition beyond the quote | whatsnew quote, verbatim, plus sandbox: the chained-assignment statement raises/emits `pd.errors.ChainedAssignmentError` (confirmed `issubclass(pd.errors.ChainedAssignmentError, Warning)` — a Warning subclass despite the name), and the original frame's value is unchanged afterward either way. The class name itself is **not** in the fetched whatsnew prose; it is disclosed in post-notes and the reel's own body as a direct sandbox observation, not attributed to the quoted source. |
| 5 | `mode.copy_on_write` is deprecated, no effect, removed in 4.0 | Confirmed, and directly measured | whatsnew quote, verbatim + sandbox: setting `pd.options.mode.copy_on_write = "warn"` emits a `Pandas4Warning` whose message matches the quote almost verbatim ("Copy-on-Write can no longer be disabled..."). |
| 6 | Microsecond default resolution for parsed date strings | Confirmed, and directly measured | whatsnew quote, verbatim + sandbox: `pd.to_datetime(["2024-03-22 11:36"]).dtype` → `datetime64[us]`; `pd.to_datetime([0], unit="s").dtype` → `datetime64[s]` (integer input keeps its own unit, per the same section). |
| 7 | pandas 2.3's `future.infer_string` and `mode.copy_on_write = "warn"` as pre-3.0 rehearsal flags | Confirmed | 2.3.0 whatsnew quotes, verbatim, naming both flags and their purpose. |

## Red team

- **Step 3 predict** (does the new `str` dtype's missing marker look like the strict nullable
  marker or the loose `object`-dtype one?): tried the counter-case of an explicit
  `pd.array([...], dtype="string[pyarrow]")`, pandas's older, still-present opt-in Arrow-backed
  nullable string dtype — confirmed it uses `pd.NA`, genuinely different from the new default
  `str` dtype's `nan`, even though both are "PyArrow-backed" in some sense and both currently
  display as dtype `"string"` in some pandas reprs. This is the real source of the predict's
  tempting wrong answer, and it's disclosed explicitly in step 6 as its own reveal (two
  differently-named-but-same-displayed-name dtypes) rather than glossed over.
- **Step 4 (lazy view)**: tried to break the "views reused until mutation" claim by checking
  whether *any* indexing operation always copies immediately regardless (which would make the
  "lazy" framing misleading) — confirmed directly that `df['a']` genuinely shares memory with
  `df` right after creation (`np.shares_memory` is `True`), which would be impossible if pandas
  copied eagerly on every subset; the claim held up under this check.
- **Step 5 (ChainedAssignmentError)**: tried the counter-case of running the identical statement
  under `warnings.simplefilter("error")` to see whether it behaves differently — confirmed it
  then raises as an actual exception (since it's a `Warning` subclass, elevating warnings to
  errors turns it into one); under default warning filters it only warns, and the original frame
  is unmutated in both cases. The reel and narration are both worded to say "warns" as the
  sandbox's actual default behavior, not "raises," to avoid overstating what a default pandas
  session actually does.
- **Step 7 (nullable Int64 vs. Arrow int64)**: tried the counter-case of whether any numeric
  nullable dtype combination shows a sentinel difference the way strings did in step 6 — checked
  both `pd.array([1,2,None], dtype="Int64")` (NumPy-backed nullable) and
  `pd.array([1,2,None], dtype="int64[pyarrow]")` (Arrow-backed) and confirmed both repr their
  missing value as `<NA>`, identically — no sentinel difference here, which is itself the point
  of the reveal (the axis that matters is nullable-extension vs. not, not NumPy vs. Arrow), and
  is stated as a genuine finding rather than assumed from step 6's string-dtype result.
- **Step 9 (2.3 migration flags)**: tried running `pd.options.future.infer_string = True` on this
  3.0.5 sandbox to see whether the now-redundant flag errors or warns — confirmed it silently
  accepts the value with no warning raised under `-W error::FutureWarning -W
  error::DeprecationWarning`, unlike `mode.copy_on_write`, which does warn. This asymmetry is
  disclosed directly in the reveal rather than assuming both legacy flags behave identically.
- **Predict's wrong option plausibility**: the tempting wrong answer for step 3 (the strict
  nullable marker) is checked against a real, defensible reason someone might believe it — the
  dtype genuinely is PyArrow-backed under the hood when PyArrow is installed, which is exactly
  what makes the predict worth asking rather than obvious either way.

No claim was dropped. One addition beyond the sourced quotes (the `ChainedAssignmentError` class
name and its `Warning` subclass status) is explicitly flagged in this file, in post-notes, and in
the reel's own body as a direct sandbox observation rather than attributed to the fetched
whatsnew prose, consistent with the plan's "don't guess" rule applied in the other direction:
never attribute a sandbox-only finding to a source that didn't actually say it.

## Corrections applied to OUTLINE.md

- Step 5: worded as "warns" rather than "raises," since the default pandas session only warns;
  raising requires explicitly elevating warnings to errors, confirmed by the red-team check
  above.
