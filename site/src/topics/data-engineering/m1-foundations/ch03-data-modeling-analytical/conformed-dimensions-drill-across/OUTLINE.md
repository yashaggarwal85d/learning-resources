# Outline — de.conformed-dimensions-drill-across

1. Hook: two fact tables, one shared date, one question — can they even be compared?
2. Reveal: conformed dimension, quoted directly (same column names, same domain contents).
3. Predict: can two fact tables of different grains be joined directly and then summed safely?
4. Reveal: drilling across, quoted directly (separate queries, aligned by sort-merge, not joined).
5. Reveal: the bus matrix, quoted directly (business processes × conformed dimensions, the planning tool).
6. Reveal: the fan-out, measured (joining directly multiplies rows and inflates the sum).
7. Reveal: aggregate-first, measured (summarize each fact table to the grain first, then join).
8. Predict: which number was actually correct all along?
9. Reveal: both totals confirmed independently (the aggregate-first numbers match the lone sums).
10. Recap.
11. Prove it: a third fact table at a different grain joins the same conformed date — aggregate first, or join directly?
