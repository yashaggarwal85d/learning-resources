<section data-section="outcomes">

## Outcomes

The Purdue and ISA-95 segmentation model recapped as a network boundary, with the DMZ and
unidirectional gateways that enforce it and a stated point where a data platform's extraction
path has to cross it. A read-only extraction's load computed against a PLC's own stated budget,
showing a naive poll breaching it six times over, a change-of-value subscription cutting that
load sharply and still breaching it, and a read from a historian or replica removing the load
from the PLC entirely. A bounded buffer shown absorbing a stalled consumer by dropping its own
oldest item, so the producer side never once stalls. Ownership assigned separately for an
operational copy, an analytical copy, and a field's own definition, with the definition's owner
shown to stay put even when its bytes move to a system a different team owns. A tag rename
shown breaking a reader keyed only on the current name, and an alias-contract reader surviving
the same rename.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every computation directly: a direct-poll load computed against a PLC's
stated budget and shown to exceed it; the same tag mix's change-of-value subscription load
computed and shown lower but still over budget; a historian-replica read's load on the PLC
computed as zero; two hundred fifty pushes run through a hundred-item bounded buffer, with
exactly the expected number dropped and every producer push still succeeding; an ownership
dictionary asserting a shared definition's owner stays the operational side's owner even once
its analytical copy belongs to a different team; and a tag rename shown breaking a reader keyed
on the old name while an alias-contract reader reads both the pre- and post-rename value
correctly.

</section>

<section data-section="production">

## Production failures this topic warns about

**Polling a PLC's tags directly to build a dashboard.** This topic's own load-budget comparison
is the production shape of the bug: a script that asks a controller for every tag on every
tick, instead of reading from a historian or subscribing through a system built to absorb that
load, can measurably slow the loop that runs the actual process.

**Keying a pipeline on a tag's current name with no path for a future rename.** A firmware
re-scale or an engineering change that renames a tag silently breaks every downstream reader that
was never given an alias to fall back on, and the break is invisible until someone notices a gap
in the data.

</section>

<section data-section="frontier">

## Frontier

The ISA/IEC 62443 series is this chapter's named pointer for OT/ICS cybersecurity standards, but
ISA's own standards pages (confirmed on three separate URLs while researching this chapter) state
a site-wide prohibition on feeding their content into any AI tool. This topic names the series
bibliographically only and sources every verbatim segmentation claim from NIST SP 800-82r3
instead, a U.S. government publication with no such restriction. Chapter 10 §10.6's own IT/OT
topic and Chapter 11 §11.3's schema-change expand/contract topic, the two cross-chapter anchors
CHAPTER.md asks this topic to build on, do not exist in the registry yet at this topic's build
time; this topic's segmentation recap and rename pattern are built and sourced from scratch
instead, logged as a gap to revisit once both chapters ship.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

That closes the model of the plant: its hierarchy, what it makes, how well it makes it, what it
consumes and who owns what. Everything so far assumed a reading arrives with its time attached.
The next section is about that time. It starts with the first thing that goes wrong: three
clocks, none of them right.

</section>
