<section data-section="outcomes">

## Outcomes

A cumulative meter register turned into interval consumption, with a rollover corrected exactly
using the register's own known width, a reset bounded rather than guessed at (the lost
consumption has no formula that recovers it), and a meter swap split rather than diffed across.
A real demonstration that the previous "fix" (dropping negative differences) hid a loss instead
of bounding it. A power series properly integrated into energy, against the classic error of
averaging unevenly-spaced readings as if they were evenly spaced. A shared header meter's total
allocated to a line under two different rules, with the spread between them converted into an
actual currency figure. And energy per good unit, shown to inherit whichever allocation rule
produced the energy it was divided from.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every computation directly: a rollover classified and corrected using a known
register width; a reset classified and its true loss left unreported, only bounded; a meter-swap
series split at the swap; a naive "drop negative diffs" comparison against the honest bound; an
irregularly-sampled power series integrated by the trapezoid rule against a naive unweighted
average; a shared header meter allocated to two lines under two rules, with the spread costed in
currency; and energy per good unit computed under both rules.

</section>

<section data-section="production">

## Production failures this topic warns about

**Dropping negative differences and calling it fixed.** This topic's own "old fix" comparison is
the production shape of the bug: a pipeline that silently zeroes out a negative reading instead
of classifying and bounding it reports a confident number that is simply wrong, with nothing in
its own output to say so.

**Reporting an energy-per-unit figure without naming the allocation rule behind it.** The number
depends on a modelling choice as much as a measurement; omitting the rule makes the figure look
more objective than it actually is.

</section>

<section data-section="frontier">

## Frontier

IEC's own meter-data-exchange standards (for example IEC 61968/62056) would be the industry's own
specific vocabulary for counter resets, rollovers and meter swaps, named here as a pointer this
course doesn't build from, since no free, quotable primary text was found (see `FACT-CHECK.md`).
This topic's own handling is sourced from Prometheus's documented, freely verifiable treatment of
the same underlying problem in a different domain.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The meter, the PLC and the MES each hold a piece of the plant's data, and each sits in a network
that must never be disturbed by a data platform. The next topic is the boundary between the plant
floor and the rest of the company: where the networks are segmented, who owns each copy of the
data, and how to read without touching control.

</section>
