---
id: de.er-modeling-relationship-cardinality
title: ER modeling and relationship cardinality
---

<section data-section="outcomes">

## After this refresher you can

- Read crow's-foot cardinality off a diagram: a ring for zero, a dash for one, a crow's foot for many, paired to
  give a minimum and a maximum on each end of a relationship line.
- State why a one-to-many relationship's foreign key lives on the "many" side, and why the reverse placement
  cannot work for an ordinary column.
- Explain why a many-to-many relationship always resolves to a third table, with a foreign key to each side it
  connects, rather than to a column on either original table.
- Tell optionality apart from cardinality: optionality is a separate symbol choice (ring vs. dash) at one end of
  a line, not a property implied by whether the other end says "one" or "many."

</section>

<section data-section="internals">

## A little deeper

Wikipedia's "Entity–relationship model" article traces crow's-foot notation back to a 1976 article by Gordon
Everest. The notation pairs two symbols per relationship end rather than one: an inner symbol (ring or dash) giving the minimum, and an
outer symbol (dash or crow's foot) giving the maximum. That pairing is what actually earns the four combinations
this topic uses — optional-to-one, mandatory-to-one, optional-to-many, mandatory-to-many — out of just three
shapes, rather than needing a separate symbol for each combination.

The foreign-key placement rule and the junction-table requirement both come from the same underlying fact about
ordinary columns: a column holds exactly one value per row, never a variable-length list. A one-to-many
relationship fits that constraint directly, by putting the single foreign key on the side that only ever points
at one of the other entity, which is why swapping it onto the "one" side would require a column that somehow
holds many values. A many-to-many relationship cannot fit either side into a single column at all, in either
direction, which is exactly why Wikipedia's "Associative entity" article describes it as requiring an entirely
separate base table rather than a workaround on one of the two original tables. That junction table's own primary
key being the pair of foreign keys together is not a convention so much as a consequence: that pair is already
the only thing that uniquely identifies one link between the two sides.

</section>
