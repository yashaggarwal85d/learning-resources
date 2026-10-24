<section data-section="outcomes">

## Outcomes

Describe a B+-tree's own fanout and why it bounds lookup depth, confirmed directly: a real index
on fifty thousand rows, inspected via Postgres's own `pageinspect` extension, stays a two-level
tree. Explain a page split and fill factor's real, measured effect: an identical batch of
mid-range inserts grows a tightly packed (high fillfactor) index by real pages while an
otherwise identical, loosely packed (low fillfactor) index on the same data grows by none at
all. Explain the Lehman-Yao (B-link) approach to concurrent B-tree access without locking the
whole tree, and index deduplication (measured directly: a heavily duplicated column's index
shrinks to roughly a third its size with deduplication on) and multicolumn skip scan as real,
versioned Postgres features. Contrast a secondary-index lookup's real cost on a clustered
(InnoDB) table against a heap-organized (Postgres) one, sourced directly from both engines' own
documentation.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` runs three real measurements directly against this sandbox's own
Postgres 16 cluster, using the `pageinspect` extension: `bt_metap()`'s own `level` field and a
real page count for a fifty-thousand-row table's primary-key index; the real page-count growth
of two otherwise identical indexes (one tightly packed, one loosely packed) under an identical
batch of mid-range inserts; and the real page-count difference between an index built with
deduplication on versus off, on a column with only ten distinct values.

</section>

<section data-section="production">

## Production failures this topic warns about

**Setting fillfactor to its maximum on a table that turns out to need updates.** This topic's
own measurement shows the real cost directly: a tightly packed index grows under mid-range
inserts where an otherwise identical, loosely packed one doesn't grow at all. A table assumed to
be static, built with fillfactor maxed out, that later starts receiving real writes pays for
that assumption with a sudden flood of page splits — exactly the risk Postgres's own
documentation names directly.

**Assuming deduplication is a free, universal win regardless of the data's own shape.** This
topic's own measurement is deliberately scoped to a heavily duplicated column; deduplication's
benefit is directly proportional to how much real duplication exists in the indexed values. A
schema change or a data shift that reduces a column's own duplication (the subject of this
topic's own "Prove it" step) can silently erase a benefit a team assumed was permanent.

</section>

<section data-section="frontier">

## Frontier

Postgres's own index documentation goes further than this topic measures: `INCLUDE` columns
(covering indexes) let a query be answered from the index alone without a heap fetch at all,
and `pg_stat_user_indexes` reports real, per-index usage statistics in production — named here
from the same source family, not measured, since this topic's own scope is fanout, splits,
fillfactor, deduplication, concurrency and the clustered-vs-heap contrast. InnoDB's own adaptive
hash index, a different production feature entirely, is named directly from the same MariaDB
documentation used for the clustered-index contrast, not reproduced.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A B-tree index answers "where is this row" fast, but says nothing about what happens when two
transactions want to change the same row at once. That's the next question: MVCC, Postgres's own
answer to concurrent writes.

</section>
