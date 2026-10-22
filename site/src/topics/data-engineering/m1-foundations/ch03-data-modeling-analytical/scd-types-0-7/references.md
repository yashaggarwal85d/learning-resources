Last verified against these sources: 22 October 2026, with the mini-dimension sizing and
row/update-cost scenario computed directly in `examples.py` as a disclosed worked illustration
(this topic has no lab of its own). Expert sign-off: pending.

- Kimball Group, "Type 0: Retain Original": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-0/). The value never changes.
- Kimball Group, "Type 1: Overwrite": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-1/). Overwrite, destroys history.
- Kimball Group, "Type 3: Add New Attribute": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-3/). A second column, the "alternate reality."
- Kimball Group, "Type 4: Add Mini-Dimension": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-4/). A rapidly changing group, split off.
- Kimball Group, "Type 5: Add Mini-Dimension and Type 1 Outrigger": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-5/). Type 4 plus a current Type 1 pointer.
- Kimball Group, "Type 6: Add Type 1 Attributes to Type 2 Dimension": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-6/). Type 2 plus overwritten current columns.
- Kimball Group, "Type 7: Dual Type 1 and Type 2 Dimensions": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-7/). Same functionality as Type 6, via dual keys.
- Kimball Group, Design Tip #152, "Slowly Changing Dimension Types 0, 4, 5, 6 and 7" (Margy Ross, 2013): [kimballgroup.com](https://www.kimballgroup.com/2013/02/design-tip-152-slowly-changing-dimension-types-0-4-5-6-7/). Where the type numbers were formally assigned, and why.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=scd-types-0-7:%20).
