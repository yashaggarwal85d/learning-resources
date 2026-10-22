Last verified against these sources: 22 October 2026, with the double-counting, weighting-fix, and
ragged-hierarchy demonstrations run directly on this session's PostgreSQL sandbox against a
throwaway order/promo-tag bridge and a throwaway four-category hierarchy, both built for this topic
and dropped afterward. Expert sign-off: pending.

- Kimball Group, "Multivalued Dimensions and Bridge Tables": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/multivalued-dimension-bridge-table/). One group key, one bridge row per value.
- Kimball Group, Design Tip #166, "Potential Bridge (Table) Detours": [kimballgroup.com](https://www.kimballgroup.com/2014/05/design-tip-166-potential-bridge-table-detours/). Over-counting without a weighting factor.
- Kimball Group, "Ragged/Variable Depth Hierarchies": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/ragged-variable-depth-hierarchy/). A bridge of every path, or a pathstring.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=bridge-tables-many-many:%20).
