<section data-section="outcomes">

## Outcomes

Compute the downstream blast radius of dropping a column from the lineage graph produced in topic
11, with and without column-level lineage, and show the difference in how many consumers are
falsely implicated or missed; plant a bad partition and mark every stale downstream table; send a
deduplicated, per-owner notification; run a deprecation workflow end to end on the shop's graph;
state precisely which dependents the graph cannot see.

</section>

<section data-section="internals">

## Internals

`examples.py`'s `EDGES` is a planted, fourteen-table, two-dashboard lineage graph reusing topic
11's own DIRECT/INDIRECT column-lineage representation. `downstream_table_level` walks every
reachable table regardless of column; `downstream_column_level` only follows edges where the
tracked column (through a rename) actually propagates. `propagate_stale` reuses the table-level
walk, since a whole-partition failure can corrupt any column. `notify_owners` groups affected
tables by owner into one notification each. `run_deprecation` blocks on any dependent whose
owner hasn't signed off, and proceeds once the dependent set is empty or every owner has.
`UNINSTRUMENTED_READER` is never added as a node or edge, and both traversal functions are
asserted not to find it.

</section>

<section data-section="lab">

## Lab: hosts the blast-radius half of the §13.3 lab

Per `CHAPTER.md`, this topic hosts the blast-radius half of the §13.3 lab: plant a bad partition,
compute its blast radius from the lineage graph topic 11's mechanism produces, mark stale tables,
notify owners, and compare the run with and without column-level lineage. The lineage collection
itself is topic 11's own subject, composed here and not repeated.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a table-level walk's count as the true blast radius.** A table-level walk finds every
downstream table reachable at all, which includes tables that depend on the same upstream table
for an entirely different column — a real false positive, not a conservative overcount to be
shrugged off.

**Notifying per affected table instead of per owner.** An owner with many affected tables getting
one email per table either gets ignored by the fifth copy or trains them to stop reading lineage
alerts altogether — deduplication by owner is not a cosmetic nicety.

**Assuming perfect lineage coverage means perfect blast-radius accuracy.** A reader that never
reports a run has no edge in the graph for any algorithm to find, no matter how much of the rest of
the graph's coverage improves — this is a permanent category of gap, not a temporary one closed by
better tooling elsewhere.

</section>

<section data-section="frontier">

## Frontier

How lineage is collected is topic 11's own subject, not retold here. The catalog and its owners
are topic 10's. The incident process and runbooks (Chapter 11 §11.3) and contract-as-code CI gates
(Chapter 11 §11.4) are both declared gaps, logged in `OUTLINE.md` rather than guessed at — no
`section: '11.3'` or `'11.4'` entry exists in `registry.ts` yet. The operating model that assigns
ownership in the first place is topic 13's.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This chapter treated a platform as something you can observe, classify, protect and trace. Every
one of those mechanisms leaned on assumptions about clocks, messages and failures that this course
has not yet stated precisely: a timestamp, an alert's window, a lease, a lock. The next chapter
states those assumptions, starting with the timing and failure models every distributed protocol
is correct relative to.

</section>
