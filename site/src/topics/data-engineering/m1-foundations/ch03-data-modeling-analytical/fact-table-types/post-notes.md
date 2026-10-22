---
id: de.fact-table-types
title: Fact table types
---

<section data-section="outcomes">

## After this topic you can

- Identify which of the four fact-table types — transaction, periodic snapshot, accumulating
  snapshot, factless — a given business process actually calls for.
- Build an accumulating-snapshot fact table that updates the same row in place as a process moves
  through its milestones, rather than inserting a new row at each step.
- Explain which fact types stay cleanly additive under a late update, and which one's own measures
  have to be recomputed instead of summed.

</section>

<section data-section="internals">

## A little deeper

Every demonstration in this topic's reveals is run against a real, disclosed throwaway table built
for this topic, not a described hypothetical. The periodic-snapshot reveal inserts rows for two
accounts across three days with no balance change at all, and counts exactly two accounts present
on every single day — the measured proof behind Kimball's own claim that the snapshot's grain is
the period, not the event. The accumulating-snapshot reveal goes further: one row is inserted when
an order line is created, then the identical row — same primary key — is revisited with two real
`UPDATE` statements as it passes through its ship and deliver milestones, with the row count
checked at exactly one throughout and two lag measures (one day, two days) computed from the
milestone dates rather than declared. The factless reveal builds a coverage table of three expected
students and an activity table of two who attended, and finds the missing student by an actual
`EXCEPT` query, not a described set difference.

The additivity verdict in the second half of this topic is this topic's own synthesis, not a
further Kimball Group quote: no single fetched source states, in these terms, which fact-table type
absorbs a late update by re-summing and which has to recompute. It follows directly from topic 8's
additivity classes, applied per fact-table type, and is marked in `coverage.json` as reasoning built
on sourced material rather than sourced material itself.

</section>
