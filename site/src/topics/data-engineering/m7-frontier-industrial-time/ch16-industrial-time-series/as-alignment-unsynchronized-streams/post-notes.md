<section data-section="outcomes">

## Outcomes

A dense pressure series joined to a sparse temperature series by a backward as-of join, with a
tolerance and a per-equipment partition key, in both DuckDB and pandas, producing identical rows.
The null rate shown climbing as the tolerance shrinks past the signal's own report period, and the
specific finding that a tolerance set below a known clock-offset uncertainty excludes correct
matches rather than recovering stale ones. A backward-step value and a look-ahead interpolated
value compared against a known ramp's true value, with the interpolated one closer but only
reachable by looking past the left row's own time. The identity stated between this join and the
point-in-time feature join of Chapter 17, without re-deriving either one's logical plan shapes.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every computation directly: a dense pressure series and a sparse temperature
series, both split across two pieces of equipment, joined by `pandas.merge_asof` and by DuckDB's
`ASOF JOIN`, checked row for row for agreement; a null-rate sweep across several tolerance values,
checked to be zero once the tolerance covers the signal's report period and positive below it; a
comparison of the null rate at a clock-offset value against one second tighter, checked to never
decrease; a backward-step value and an interpolated value computed against a known ramp's true
value at a point between two samples; and a check that omitting the partition key still returns
one row per left row, silently matching across equipment rather than raising an error.

</section>

<section data-section="production">

## Production failures this topic warns about

**Setting a join tolerance by intuition instead of the signal's own report period and clock
uncertainty.** The hook's root-cause query is the production shape of this bug in both directions:
no tolerance accepts a match of any age, and a tolerance set too tight (below the clock's own
uncertainty) throws away matches that were already correct.

**Running an as-of join across a multi-sensor dataset without a partition key.** Pandas and DuckDB
both execute this without error — the join simply returns a value, borrowed from whichever
equipment happens to be nearest in time, with nothing in the output to flag that it crossed
equipment boundaries.

</section>

<section data-section="frontier">

## Frontier

ClickHouse's `ASOF JOIN` and kdb+'s `aj` are both named and quoted in `SOURCES.md` for their own
closest-match semantics, but neither was run in this environment (no ClickHouse or kdb+ instance
here) — both are **sourced-only**, as CHAPTER.md allows for named engines that aren't installable.
The point-in-time feature join's own framing — feature TTLs, label timelines, and training-set
leakage — belongs to Chapter 17 topic 21, not here; this topic states only the mechanism identity
between the two.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Joining raw series is fine for a single spike. It is too slow and too large for a quarter. The
next topic is how to aggregate over time so the answer stays correct when it is rolled up again,
and how to keep recent data in detail and old data in summary.

</section>
