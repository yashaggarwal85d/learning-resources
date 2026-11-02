<section data-section="outcomes">

## Outcomes

Compute the downstream blast radius of dropping a column from the lineage graph produced in
the OpenLineage topic, with and without column-level lineage, and show the difference in how
many consumers are falsely implicated or missed; plant a bad partition and mark every stale
downstream table; send a deduplicated, per-owner notification; run a deprecation workflow end
to end on the shop's graph; state precisely which dependents the graph cannot see.

</section>

<section data-section="measuring-the-blast-radius">

## Measuring the blast radius

`examples.py` builds a small lineage graph with both table-level edges (a consumer reads a
table at all) and column-level edges (a consumer's own output column derives from a specific
input column), then walks it downstream from a proposed column drop both ways. The table-level
walk implicates every consumer of the table, including one that never touches the dropped
column; the column-level walk implicates a strict subset. A deduplicated owner-resolution step
then shows two affected tables sharing one owner collapse into a single notification. Finally,
a reader that was never wired to emit a lineage event at all stays absent from either walk's
result -- not a bug, a gap in what the graph was ever told.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting table-level lineage for a column-level question.** The Hook's own scenario -- a
catalog undercounting a rename's real impact -- is exactly what happens when a review process
asks "what does this touch downstream" using only table-level edges, which flags everyone who
reads the table and misses nothing real, but can also waste review time on consumers who never
touched the changed column at all.

**Treating a clean blast-radius report as proof nothing is missed.** `examples.py`'s own
measurement shows an uninstrumented reader staying invisible to every walk method tried --
a report with zero flagged risk from an incomplete graph means zero risk was *found*, not that
zero risk exists.

</section>

<section data-section="frontier">

## Frontier

A real blast-radius score, per this topic's own scope, weighs not just the count of affected
nodes but their tier, their criticality, and whether a dependency is direct or only indirect in
column lineage -- a multi-factor score this topic's own measurement simplifies to a plain
affected-node count, which a real governance tool would need to weight before using the score
to decide how deep a review a given change actually needs.

</section>
