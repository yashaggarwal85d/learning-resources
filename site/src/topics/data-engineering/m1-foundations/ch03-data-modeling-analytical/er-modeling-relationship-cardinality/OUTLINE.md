# Outline — ER modeling and relationship cardinality

Refresher, about five minutes. Scope (CHAPTER.md / syllabus): 1:1, 1:N, M:N and optionality; ER diagrams as a
communication artifact; how cardinality drives junction tables and foreign-key placement.

Running example: a customer and an order (1:N), a customer and a loyalty card (1:1), and an order and a product
(M:N) — three relationships on the chapter's own shop domain.

1. **Opening.** "Cardinality, in five minutes." The same box-and-line diagram answers a very specific question
   for every relationship: how many of one thing can relate to how many of another.
2. **Reveal: the three symbols.** Crow's foot notation uses three shapes — ring (zero), dash (one), crow's foot
   (many) — paired to show a minimum and a maximum on each end of a relationship line.
3. **Reveal: 1:1 — customer and loyalty card.** Dash and dash on both ends: one customer, one card, mandatory on
   both sides.
4. **Predict.** A customer and an order are related 1:N — one customer, many orders. Which table gets the foreign
   key: the customer table, or the order table? Plausible wrong answer: the customer table, since it is the "one"
   side.
5. **Reveal: the answer — the foreign key lives on the many side.** Each order needs exactly one customer, so the
   order row is where that single value lives; a customer row cannot hold a variable number of order ids.
   Takeaway: a 1:N relationship's foreign key lives on the "many" side, naming the one thing it belongs to.
6. **Reveal: M:N — orders and products.** An order has many products, and a product appears on many orders. The
   crow's foot now sits at both ends.
7. **Reveal: why M:N forces a junction table.** Neither table has a column that holds a variable number of
   values, so a third table is introduced, with a foreign key to each side; its own primary key is often the pair
   of foreign keys together. Takeaway: a many-to-many relationship always resolves to a third table, never to a
   column on either original one.
8. **Reveal: optionality changes the symbol, not the shape.** A ring at an end means that side is optional (zero
   is allowed); a dash means it is mandatory. Takeaway: optionality is read directly off the diagram, not assumed
   from the relationship's name.
9. **Recap ("In one breath").** Three symbols, paired for minimum and maximum; the many side holds the foreign
   key; many-to-many always means a third table. Swipe on to the next refresher: which columns actually determine
   which others, now that the relationships themselves are named.

Predict lands on step 4, within the first four steps. Three takeaways, on steps 5, 7 and 8.
