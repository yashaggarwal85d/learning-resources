# Fact-check — de.bridge-tables-many-many

| # | Claim | Status |
|---|---|---|
| 1 | In a classic dimensional schema each dimension has a single value at the fact table's grain, but some dimensions are legitimately multivalued | Confirmed, quoted directly (Kimball Group, "Multivalued Dimensions and Bridge Tables") |
| 2 | A multivalued dimension attaches to the fact table through a group key to a bridge table, one row per simultaneous value in the group | Confirmed, quoted directly |
| 3 | A multivalued bridge table may need to be based on a type 2 slowly changing dimension | Confirmed, quoted directly |
| 4 | A common approach for handling multivalued dimensions is to introduce a bridge table | Confirmed, quoted directly (Kimball Group, Design Tip #166) |
| 5 | The bridge table is a powerful way to handle dimensions taking multiple values at the fact table's measurement grain | Confirmed, quoted directly |
| 6 | Grouping by the multivalued dimension over-counts a fact row's own metrics across its multiple linked rows unless each bridge row carries an allocation/weighting factor | Confirmed, quoted directly |
| 7 | Ragged hierarchies of indeterminate depth are difficult to model and query in a relational database | Confirmed, quoted directly (Kimball Group, "Ragged/Variable Depth Hierarchies") |
| 8 | A specially constructed bridge table, with a row for every possible path, lets all hierarchy traversal use standard SQL instead of special extensions | Confirmed, quoted directly |
| 9 | A pathstring attribute in the dimension is an alternative to the bridge table | Confirmed, quoted directly |
| 10 | The pathstring approach doesn't support rapid substitution of alternative hierarchies or shared-ownership hierarchies | Confirmed, quoted directly |
| 11 | A real order (true total 70.00), joined through a real bridge to 3 promo tags and summed without weights, returns the amount 3 times over (210.00) | Measured directly on this sandbox; see examples.py |
| 12 | The same join, with each bridge row's weight (summing to exactly 1) multiplied in before summing, recovers the true order total exactly | Measured directly on this sandbox; see examples.py |
| 13 | A real 4-category hierarchy of uneven depth, flattened once into a 7-row bridge table, answers "everything under the top category" with no recursion at query time | Measured directly on this sandbox; see examples.py |
| 14 | The identical traversal, run again with a standalone recursive query against the raw parent-child table, returns the exact same categories as the flattened bridge | Measured directly on this sandbox; see examples.py |
