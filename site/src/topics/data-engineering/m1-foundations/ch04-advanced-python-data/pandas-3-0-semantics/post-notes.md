<section data-section="outcomes">

## Outcomes

A plain list of strings, given to `pd.Series`, now infers a dedicated `str` dtype rather than
the old catch-all `object` dtype — PyArrow-backed on this sandbox, where PyArrow is installed.
That dtype's own missing-value sentinel is deliberately `NaN`, matching the old `object` dtype's
loose behavior rather than the strict `pd.NA` the strict nullable tools use — measured directly
against the older, still-present opt-in `string[pyarrow]` dtype, which really does use `pd.NA`
despite sounding almost identical. Every indexing operation behaves as a copy in the user API,
but a subset genuinely shares memory with the original until the moment it's actually mutated —
measured directly with `np.shares_memory`. Chained assignment never silently works any more,
confirmed directly, and `SettingWithCopyWarning` really is gone — replaced by
`pd.errors.ChainedAssignmentError`, a name this topic discloses as a direct sandbox observation
rather than a quoted claim, since the fetched release notes never name it. Parsing a date string
now infers microsecond resolution rather than always assuming nanoseconds. And the release
right before this one (2.3) shipped two separate opt-in flags to rehearse this behavior early —
measured directly that one of them still actively warns on this installed 3.0.5, while the other
now does nothing at all.

</section>

<section data-section="lab">

## Lab

No lab of its own. Every number is still a real measurement on this sandbox's own pandas 3.0.5
and pyarrow 26.0.0 (`examples.py`): the default string dtype's name and sentinel; the same
contrast against `string[pyarrow]`; a NumPy-backed `Int64` vs. an Arrow-backed `int64[pyarrow]`
column's identical sentinel; a real `np.shares_memory` check before and after a mutation; a
real captured `ChainedAssignmentError` warning with the original frame confirmed unchanged;
`pd.to_datetime`'s inferred resolution for a string and for an integer input; and the measured
asymmetry between `mode.copy_on_write` (still warns) and `future.infer_string` (silent) on this
install.

</section>

<section data-section="production">

## Production failures this topic warns about

**Code that checks `.dtype == object` to detect a string column.** That check silently stops
matching once a column's default inferred dtype is `str` rather than `object` — the new dtype
needs its own check (`pd.api.types.is_string_dtype`, or comparing against the new dtype name
directly), not a migration of the old one.

**Code that relies on chained assignment plus a defensive `.copy()` to silence a linter.** The
chained assignment never worked to produce the intended mutation even before 3.0 (it was already
unreliable, just inconsistently so); the defensive copy that used to quiet
`SettingWithCopyWarning` is now pointless noise, and the fix is a single `.loc[...] = value`
call, not a bigger copy.

**Assuming any dtype that mentions "Arrow" or "pyarrow" shares one consistent set of
missing-value rules.** This topic measured two genuinely different outcomes: the new default
`str` dtype and the older `string[pyarrow]` dtype disagree on their sentinel, while a NumPy-
backed and an Arrow-backed nullable *numeric* dtype agree completely. The backing storage alone
doesn't decide this.

</section>

<section data-section="frontier">

## Frontier

The pandas docs (served from the 3.1.0 build) already note a further change to integer-input
datetime-resolution inference, also defaulting to microseconds, landing after this sandbox's
installed pandas 3.0.5 — disclosed here as sourced-only, since it postdates the installed
version and wasn't independently re-verified against it.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

pandas 3.0 adopted Arrow-backed dtypes as an option; the next topic is the dataframe library
that was designed around Arrow and lazy evaluation from the start, rather than retrofitted onto
it.

</section>
