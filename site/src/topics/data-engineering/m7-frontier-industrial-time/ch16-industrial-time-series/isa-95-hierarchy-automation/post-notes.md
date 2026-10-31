<section data-section="outcomes">

## Outcomes

ISA-95's five levels, read directly off the standard's own page: level zero (the physical
process), level one (sensing and manipulating it), level two (monitoring and supervising
control), level three (manufacturing operations management, where ISA's page places SCADA
alongside MES), level four (business planning and logistics, ERP). The standard's own page
states plainly that it "primarily deals with the interface between levels three and four." A
real naming disagreement between the standard's own placement of SCADA and the level common
practitioner diagrams draw it at is named directly rather than smoothed over, and resolved by
the idea both sides actually agree on: a level is a time horizon, independent of which systems
support the functionality (Brandl & Johnsson, "Beyond the Pyramid," ISA InTech). A real, executed
comparison (`examples.py`) of the same synthetic reading stream, joined to a type-2 SCD hierarchy
by event time against joined to each machine's latest hierarchy row, shows a measured, asserted
share of one line's true output silently moved onto another line by the join choice alone.

</section>

<section data-section="lab">

## Lab

This topic hosts the two-plant-hierarchy-with-SCD-history leg of the §16.1 lab (the OEE
derivation itself is topic 4's). `examples.py` builds an in-memory SQLite dimension table for
four pieces of equipment across two lines, one of which (press7) moves mid-window with its own
`valid_from`/`valid_to` pair and a fresh surrogate key on each row; generates a seeded synthetic
count-event stream for each machine; runs the as-of join (`event_time >= valid_from AND
event_time < valid_to`) against the current-row join (`valid_to = '9999-12-31'`); and asserts
the exact mechanism behind the resulting totals, not just their direction.

</section>

<section data-section="production">

## Production failures this topic warns about

**A "current line" cache with no time window.** This topic's own "Prove it" scenario is the
production shape of the bug: a dashboard that caches each machine's current line and joins every
incoming reading against that cache, however old the reading is. Refreshing the cache more often
never fixes this — the cache answers "where is this machine now," which is the wrong question
for any reading older than the machine's last move, no matter how fresh the cache itself is.

**Treating the hierarchy as a lookup table instead of a dimension with history.** The instant a
team models "which line is this machine on" as a single mutable column rather than a type-2 SCD,
every historical report built on that column becomes silently wrong the first time a machine
moves, with no error, exception or obviously broken output to signal it.

</section>

<section data-section="frontier">

## Frontier

ISA-95's own Industry 4.0 material (Brandl & Johnsson, "Beyond the Pyramid") goes further than
this topic teaches: the pyramid is one traditional physical implementation of the functional
model, not a requirement, and a network-structured architecture can stay ISA95-compliant without
it — named here from the same source, not built, since this chapter's own notation (the
`site/area/line/equipment/sensor` path) keeps the hierarchical framing that every later topic in
the chapter joins against.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The hierarchy says where a machine sits and which system owns which data. It says nothing yet
about what the machines make. The next topic is the objects that move through that hierarchy:
work orders, runs, batches and the lots whose parentage a recall depends on.

</section>
