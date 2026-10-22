---
id: de.conformed-dimensions-drill-across
title: Conformed dimensions and drill-across
---

<section data-section="outcomes">

## After this topic you can

- Explain what it means for a dimension to be conformed across two fact tables, and why that alone
  does not guarantee the two tables share a grain.
- Build and read an enterprise bus matrix as a planning grid of business processes against
  conformed dimensions.
- Write a drill-across query correctly — aggregate each fact table to the shared grain, then join
  the summaries — and explain why joining the fact tables directly silently fans out rows instead.

</section>

<section data-section="internals">

## A little deeper

The fan-out in this topic's reveals is run against a real, disclosed pair of throwaway fact tables
built for this topic, not a described hypothetical: an orders fact with two orders and a
support-tickets fact with three tickets, both sharing one conformed date. Joined directly on that
date and summed, the query returns six rows — every order row duplicated once per matching ticket
row — and an order total nearly three times the true figure. Aggregating each fact table to the
shared date first, then joining those two already-summarized rows, reproduces the correct totals
exactly, and those totals are independently confirmed by summing each fact table alone, with no
join at all. The fanned-out number matches neither of those independent sums, which is the concrete
proof that it was never a real total in the first place.

The point this demonstration makes is narrower than "joins can go wrong": a conformed dimension
specifically does not promise that two fact tables share a grain. Conforming the date dimension
made the two fact tables comparable at all, exactly as Kimball Group's own material claims, but
comparability and matching grain are two different things, and only drilling across — aggregate,
then align — respects that difference.

</section>
