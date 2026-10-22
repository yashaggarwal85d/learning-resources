<section data-section="outcomes">

## Outcomes

An inferred dimension member lets a fact post before its real dimension context exists: a placeholder row with generic unknown values, resolved later with a Type 1 overwrite in place, never a new row, because the placeholder was never a genuine prior version of anything. A backdated fact must be joined to whichever SCD2 version was actually in effect on the fact's own event date, found by searching the dimension's history rather than reading off the current flag. Every real strategy for lateness needs a named, bounded horizon, because unbounded lateness means unbounded resource retention, not just unbounded correctness.

</section>

<section data-section="internals">

## Internals: why the placeholder is Type 1, never Type 2

An inferred member and a real Type 2 version look similar on the surface — both are rows in the same dimension table — but they answer different questions. A Type 2 row records that an attribute was genuinely, verifiably different during some real stretch of time. A placeholder records nothing at all; it's a stand-in for an absence of information, not a fact about the world. Overwriting it when the real data arrives doesn't destroy any history, because there was no history there to destroy — just a gap, now filled. This is also why a retroactive Type 2 correction is handled completely differently (a new row, and fact restatement): that case *does* involve genuine historical information that was simply recorded late.

</section>

<section data-section="lab">

## Lab

The inferred-member insert and resolve, and the as-of join against a real three-version SCD2 history, were both run for real on a throwaway schema built for this topic and dropped immediately after (`SOURCES.md`, `examples.py`). No lab beyond that is this topic's own (`CHAPTER.md`); the chapter's shared MERGE lab belongs to topic 13.

</section>

<section data-section="production">

## Production failures this topic warns about

**Joining facts to "the" dimension row.** A pipeline that always joins on `is_current = true` (or an equivalent "the one row" assumption) silently mis-attributes every backdated fact to whatever happens to be true today, not what was true when the event occurred — exactly the failure the as-of join's two different surrogate keys demonstrate directly.

**No named limit on reprocessing.** A pipeline that promises to "always find the right version, no matter how late" without naming a bound ends up holding history, retry queues, or reprocessing jobs open indefinitely for data that may never arrive, or arrives so late that correctness is no longer worth the resource cost.

</section>

<section data-section="frontier">

## Frontier

Streaming systems formalize the same tradeoff this topic names informally for a warehouse: a watermark tracks when a window's data can be considered complete, and an explicit "allowed lateness" setting (Apache Beam's `.withAllowedLateness`, illustrated here at two days) bounds exactly how long a window stays open for data that arrives after that. The underlying decision — pick a horizon, accept that anything later gets handled some other way — is identical to choosing a bounded reprocessing window for a batch warehouse pipeline.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every topic in this chapter built tables assuming a warehouse's own physical home was already settled. The next topic zooms out to that home itself: the architectural history from a coupled warehouse, to a lake, to an open-table-format lakehouse, and what each stage still does best.

</section>
