<section data-section="outcomes">

## Outcomes

Contrast `SELECT ... FOR UPDATE` (pessimistic locking, topic 14's own mechanism), a version-column
compare-and-set (optimistic, built and measured here), and validate-at-commit OCC (topic 13's own
SSI, named at the whole-read-set level) as three real implementations of the same underlying
choice. Measure, directly against this sandbox's own Postgres cluster at a low and a high conflict
rate, which approach actually wins and why — an actual measured reversal, not an assertion. Name
object-store table commits and distributed SQL's own commit protocols as the same optimistic bet
reappearing elsewhere in this course.

</section>

<section data-section="internals">

## Internals

The crossover isn't about which mechanism is "better" in the abstract — it's about what each one
wastes. A blocked `SELECT ... FOR UPDATE` session spends time, but never discards work: once it
gets the lock, its one read and one write both still count. A failed optimistic compare-and-set
discards both: the read that's now stale, and the write that never applied. Under light
contention, that waste is rare enough that skipping the lock's own overhead wins outright. Under
heavy contention, the same waste compounds — this topic's own measured high-conflict run threw
away over five thousand reads and writes to land fewer than twenty-five hundred real increments.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reaching for optimistic concurrency by default, on a resource everyone hits at once.** This
topic's own measured `high_conflict_pessimistic_wins` experiment shows directly that a
version-column compare-and-set isn't a free upgrade over locking — against the same 2 rows the
same 8 workers were hammering, it finished measurably slower and burned thousands of wasted round
trips doing it. A "claim this seat" or "decrement this one inventory row" endpoint under real
concurrent load is exactly the shape optimistic concurrency loses on.

**Assuming a single row's own version column is validation enough for a transaction that reads
more than one row.** A version-column compare-and-set only protects the one row it writes — it
says nothing about any other row the same transaction read along the way. Validate-at-commit OCC
(topic 13's own SSI) exists specifically because a whole transaction's whole read set can conflict
with a concurrent write even when no single row's version ever collides.

</section>

<section data-section="frontier">

## Frontier

Object-store table formats (Delta Lake, Apache Iceberg, Apache Hudi) and distributed SQL systems'
own commit protocols are named here only as a destination this exact choice reappears at, per the
chapter plan's own scope — their own mechanisms are each a later topic's content (§6.3, §5.3), not
built or measured here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every mechanism in this section so far assumed one engine making one decision. The next topic is
what happens the moment a transaction has to span more than one: two-phase commit.

</section>
