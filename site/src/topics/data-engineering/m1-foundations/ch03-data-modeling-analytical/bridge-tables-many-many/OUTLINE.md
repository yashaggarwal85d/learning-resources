# Outline — de.bridge-tables-many-many

1. Hook: one order, three promo tags, one question — how much did it actually total?
2. Reveal: multivalued dimension, quoted directly (one group key, one row per simultaneous value).
3. Predict: does joining through the bridge and summing give the order's real total?
4. Reveal: the double-count, measured (joined and summed without weights, three times over).
5. Reveal: the weighting fix, quoted directly (an allocation factor assigned to each bridge row).
6. Reveal: the weighting fix, measured (weights summing to one, the true total recovered).
7. Reveal: ragged hierarchy, quoted directly (indeterminate depth, hard to model directly).
8. Predict: does a flattened bridge table need recursion at query time?
9. Reveal: the flattened bridge, measured (every path pre-computed once, no recursion needed).
10. Reveal: the recursive check, measured (walking the raw table directly finds the same categories).
11. Recap.
12. Prove it: a product with two overlapping tags and a naive unweighted sum — fix it or trust it?
