<section data-section="outcomes">

## Outcomes

A dataset's layout decision starts earlier than the layout itself: name which copy is the system
of record and which stores are merely derived and rebuildable, since that decides what actually
needs careful backup. From there, the dominant access path — the one query shape that costs the
most — picks the partition key, not instinct about what "sounds fast." The same layout choice
that makes a query cheap or expensive also decides how expensive erasure is: a key that groups
one person's data together makes a deletion request touch one place, while a key that scatters
it (date, in this topic's hook) makes that same request touch every shelf the layout has.
Retention tiers aren't just a price tag on storage — each one carries a clock backed by a real
legal requirement (GDPR's storage-limitation and design-by-default principles), not a vague
convention.

</section>

<section data-section="internals">

## Internals

None claimed independently here. The mechanics of how a table format like Iceberg, Delta or Hudi
actually implements partitioning and layout evolution belong to Chapter 6, and the mechanics of
partition pruning, zone maps and plan-time versus run-time pruning belong to Chapter 2 §2.4 — both
`uses`, not re-derived. This topic teaches only the *decision* (which access path, which key,
which tier, whether erasure was designed in) that those mechanics execute underneath.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` is the method's lab (topic 9 hosts the chapter's own assigned
lab). `customer_partitioned_layout()` and `date_partitioned_layout()` compute the actual file
counts and pruned fractions for the two layouts against the shop's own nightly-job access
pattern; `erasure_cost_in_partitions_touched()` shows the exact trade-off a date-first key creates.
Try changing `ACTIVE_DAYS_PER_CUSTOMER` and see how much worse the erasure cost gets as a
customer's history spreads across more days.

</section>

<section data-section="production">

## Production failures this topic warns about

**Choosing a partition key from a feeling about "lookups," not a measured access path.** The
shop's own hook is this failure exactly: customer-id partitioning sounded like it would speed up
lookups, without anyone naming which query actually dominates the system's cost. The fix isn't a
different intuition — it's measuring which query shape costs the most and partitioning for that
one.

**Treating erasure as a feature to add later.** A layout chosen for query performance alone, with
no thought given to how a single subject's data could later be deleted, turns a routine privacy
request into a full-table rewrite. GDPR's own "data protection by design" principle names exactly
this: the measures have to be designed in "at the time of the determination of the means for
processing," not after.

</section>

<section data-section="frontier">

## Frontier

None claimed. System-of-record versus derived-store reasoning and access-path-driven
partitioning are decades-old, settled data-engineering practice; GDPR's design-and-default
principles (in force since 2018) are now a mature, well-litigated legal requirement, not an
emerging one. Nothing in this topic is still maturing — what changes is which table format
implements the layout decision, which is Chapter 6's own subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Data is now somewhere, laid out for its main query. What turns it into answers is the engine, and
what delivers the answers is the serving store. The next topic is choosing both: by state size,
latency and query shape, and by who has to operate them.

</section>
