## Kimball Group, "Multivalued Dimensions and Bridge Tables"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/multivalued-dimension-bridge-table/

> In a classic dimensional schema, each dimension attached to a fact table has a single value consistent with the fact table’s grain. But there are a number of situations in which a dimension is legitimately multivalued.

> In these cases, the multivalued dimension must be attached to the fact table through a group dimension key to a bridge table with one row for each simultaneous diagnosis in a group.

> A multivalued bridge table may need to be based on a type 2 slowly changing dimension.

## Kimball Group, Design Tip #166, "Potential Bridge (Table) Detours"
URL: https://www.kimballgroup.com/2014/05/design-tip-166-potential-bridge-table-detours/

> A common approach for handling multivalued dimensions is to introduce a bridge table.

> The bridge table is a powerful way to handle dimensions that take on multiple values when associated with the grain of a fact table’s measurement event.

> Another unwanted outcome is the potential over-counting that occurs when grouping by the multivalued dimension as a single fact row’s performance metrics can be associated with multiple dimension rows unless an allocation/weighting factor is assigned to each row in the bridge table.

## Kimball Group, "Ragged/Variable Depth Hierarchies"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/ragged-variable-depth-hierarchy/

> Ragged hierarchies of indeterminate depth are difficult to model and query in a relational database.

> All these objections can be overcome in relational databases by modeling a ragged hierarchy with a specially constructed bridge table. This bridge table contains a row for every possible path in the ragged hierarchy and enables all forms of hierarchy traversal to be accomplished with standard SQL rather than using special language extensions.

> The use of a bridge table for ragged variable depth hierarchies can be avoided by implementing a pathstring attribute in the dimension.

> However, the pathstring approach does not enable rapid substitution of alternative hierarchies or shared ownership hierarchies.

## Measured directly on this sandbox
URL: n/a — measured on this session's PostgreSQL sandbox (port 5432, `shop` database), on throwaway tables built for this topic and dropped immediately after

A real order (true total seventy) was joined through a real bridge table to three promo tags.
Joined and summed without weights, the query returned the order's amount three times over, for a
total of two hundred ten. The identical join, with each bridge row's weight — the three weights
summing to exactly one — multiplied in before summing, returned the order's true total exactly.
Separately, a real four-category hierarchy of uneven depth (one branch three levels deep, one
branch a single leaf) was flattened into a bridge table of seven ancestor-descendant pairs, once,
using a recursive query. Reading "everything under the top category" straight out of that flattened
bridge, with no recursion at query time, returned the identical three categories that a second,
independently run recursive query found by walking the raw parent-child table directly.
