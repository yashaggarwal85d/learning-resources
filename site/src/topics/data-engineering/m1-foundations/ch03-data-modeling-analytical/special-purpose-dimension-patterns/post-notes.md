---
id: de.special-purpose-dimension-patterns
title: Special-purpose dimension patterns
---

<section data-section="outcomes">

## After this topic you can

- Recognize when a degenerate dimension — an order number with no dimension table of its own — is
  the right call, and know it still works correctly as a grouping key.
- Use one date dimension in multiple roles, such as order date and ship date, without duplicating
  the underlying table.
- Build a junk dimension for a cluster of low-cardinality flags, storing only the combinations that
  actually occur rather than every combination that could.
- Use an outrigger correctly, and know the real extra-join cost it carries on every query that
  needs its own attribute.

</section>

<section data-section="internals">

## A little deeper

Every measured claim in this topic's reveals is run against a real, disclosed throwaway table
built for this topic, not a described hypothetical. The degenerate-dimension reveal groups a real
order-line table by a bare order number with no dimension table anywhere in sight, and the grouping
comes out exactly right — two lines under one order number, one line under another. The
role-playing reveal builds one single `dim_date` table and joins it twice from the same order row,
confirming that a single physical table, referenced through two separately named foreign keys,
really does return two independent, distinct dates. The junk-dimension reveal computes the full
Cartesian product of three shipping flags (eight) alongside the number of rows actually needed to
store the combinations that occurred (three), making Kimball's own "only the combinations that
actually occur" claim a measured saving rather than an assumed one. The outrigger reveal counts the
tables a real query has to touch to read an account's opened date through its outrigger dimension
(three) against what a flattened design, with that date as a plain column, would have needed (two)
— the concrete cost behind Kimball's own advice to use outriggers sparingly and demote the
correlation to the fact table in most cases instead.

</section>
