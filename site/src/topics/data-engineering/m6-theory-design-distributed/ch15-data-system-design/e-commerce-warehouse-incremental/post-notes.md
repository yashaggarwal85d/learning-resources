<section data-section="outcomes">

## Outcomes

Clicks are an append-only stream with no natural dimensions. Orders are mutable business
entities that have to be modelled, loaded incrementally, and joined to customers and products —
this topic is the warehouse that holds them. Grain comes first: an order-line fact, a daily
inventory snapshot fact, and conformed customer, product and date dimensions, chosen from three
priced alternatives. A deleted or cancelled source row is invisible to a plain incremental
extract unless the design is explicitly told to look for one, and a fact that lands before its
dimension gets an inferred placeholder key rather than being dropped. A changed row merges by a
stated unique key, or it silently becomes a duplicate. A handful of marts earn their keep, and
revenue is defined once in a semantic layer. And the full-versus-incremental crossover is a
number computed from the shop's own constants, not a feeling about which approach sounds more
modern.

</section>

<section data-section="internals">

## Internals

None claimed independently here. Dimensional-modelling mechanics, SCD implementations, merge
syntax, and dbt incremental models are each named only as a choice pointing to its home chapter
(Chapter 3 and Chapter 2) — this topic doesn't re-derive any of their mechanics. CDC itself is
topic 14's.

</section>

<section data-section="lab">

## Lab

None of its own as a syllabus lab leg. The full-versus-incremental cost crossover, computed
from the shop's constants and a measured merge cost, is this topic's executable evidence.
`examples.py`'s own lab: `crossover_table_size()` and `which_wins()` compute the crossing point
and pick a side; `deleted_source_row_gap()` and `merge_with_delete_guard()` show the hazard and
its fix; `land_fact_with_inferred_dimension()` shows a fact landing before its dimension;
`merge_by_unique_key()` shows a changed row replacing its old version instead of duplicating.

</section>

<section data-section="production">

## Production failures this topic warns about

**A deleted source row with no guard.** An incremental extract built only to pull changed-or-new
rows never notices a row that disappeared at the source — the gap stays silent until someone
reconciles counts and finds the shortfall.

**Guessing instead of computing the crossover.** "Incremental has stopped paying off" is a
feeling; the right answer is the table's own current size and change rate run through the
crossover formula, which can land on either side of what the symptom suggests.

</section>

<section data-section="frontier">

## Frontier

None claimed. Grain-first dimensional modelling and incremental merge loads are established
practice, not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

An incremental load needs a source of changed rows. The cleanest source is the order database's
own change log, and the moment you read it you inherit its hazards: a replication slot that can
fill a disk, a snapshot that must hand over to a stream without a gap. The next design is CDC
from the transactional database into the lakehouse.

</section>
