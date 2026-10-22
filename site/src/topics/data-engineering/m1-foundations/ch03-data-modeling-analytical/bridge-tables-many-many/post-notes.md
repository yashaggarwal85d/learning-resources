---
id: de.bridge-tables-many-many
title: Bridge tables and many-to-many
---

<section data-section="outcomes">

## After this topic you can

- Build a bridge table for a genuinely multivalued dimension, one row per linked value.
- Demonstrate double counting through a bridge without weights, and fix it with a correctly
  normalized weighting factor.
- Choose between a flattened and a recursive hierarchy bridge for a ragged, variable-depth
  hierarchy.

</section>

<section data-section="internals">

## A little deeper

Both halves of this topic are run against real, disclosed throwaway tables built for this topic,
not described hypotheticals. The multivalued half builds one real order with a known true total
and bridges it to three real promo tags. Joined and summed with no weighting at all, the query
returns the order's amount three times over — a measured double-count, not a described one. The
same three bridge rows, carrying weights that are independently confirmed to sum to exactly one
within the group, are then multiplied into the amount before summing, and the true total comes
back exactly: Kimball's own "allocation/weighting factor" claim, verified as an executed fix rather
than an assumed one.

The ragged-hierarchy half builds a real four-category tree with genuinely uneven depth — one
branch three levels deep, one branch a single leaf — and flattens it once, with a recursive query,
into a bridge table of ancestor-descendant pairs. Reading "everything under the top category" out
of that flattened bridge needs nothing but a flat filter. To confirm the flattening didn't silently
drop or duplicate anything, a second, fully independent recursive query walks the raw parent-child
table directly and returns the identical set of categories — genuine cross-validation between two
different ways of asking the same question, not a single computation checked against itself.

</section>
