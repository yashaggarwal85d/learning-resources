<section data-section="outcomes">

## Outcomes

Map two schemas by name, type and instance evidence and write the mapping as a SQL
transformation. Build a slowly changing crosswalk and join a fact to the correct version.
Convert units and currencies with explicit, dated rates and store time as an instant plus a
zone. Add tests that fail when a source introduces an unmapped code.

</section>

<section data-section="internals">

## Internals: measured directly against this sandbox's own real PostgreSQL cluster

The slowly changing crosswalk, the dated-exchange-rate conversion, the DST-transition
comparison and the mapping test are all measured directly. A real crosswalk table with its own
`valid_from`/`valid_to` window is joined to two facts by event time, confirming an order placed
before a real re-categorization gets the old target and one placed after gets the new one. A
legacy source's own integer-cents figure, divided by the correct minor-unit exponent and then
converted by a rate dated to the transaction, lands on the same major-unit figure the shop's own
decimal-native source already carries; skipping that division is measured to be off by exactly
the minor-unit scale factor. This sandbox's own PostgreSQL first finds a real Europe/Berlin
daylight-saving transition by scanning real `AT TIME ZONE` output (never assuming a date), then
confirms a zone-aware conversion of a local wall-clock time on the transition night lands on a
different UTC instant than a naive fixed-offset conversion would, while the two agree safely off
the transition itself. A real anti-join mapping test passes against known codes, fails the
moment a brand-new, unmapped code is inserted, and passes again once the missing crosswalk row
is added. Rahm and Bernstein's own schema-matching taxonomy is named from secondary summaries
rather than quoted, since the paper itself sits behind a sign-in wall and its own mirror refused
a direct fetch.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a legacy integer-cents figure as if it were already a decimal amount.** Measured
directly here: skipping the minor-unit division is off by exactly the minor-unit scale factor,
not a rounding error — the Hook's own "off by a factor of a hundred" incident, reproduced
exactly.

**Converting a local timestamp with a fixed offset instead of a real time zone.** Measured
directly here: the fixed-offset conversion agrees with the zone-aware one on every ordinary
night and diverges by exactly one hour on the real DST transition it was never built to notice.

</section>

<section data-section="frontier">

## Frontier

Record linkage, blocking, clustering, survivorship and golden-record construction are named
only here, since they are this syllabus's own skipped topics. The plant and ISA-95 data model,
time-series time handling, and data contracts with CI enforcement are each named only, since
they are later chapters' own subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This chapter moved data from where it is produced to where it can be read, row by row and
change by change, and made two systems' records agree. The next chapter takes the other kind of
source: not a database to be read, but a stream of events that someone is already appending to,
and the partitioned log that carries them. Kafka's internals are next.

</section>
