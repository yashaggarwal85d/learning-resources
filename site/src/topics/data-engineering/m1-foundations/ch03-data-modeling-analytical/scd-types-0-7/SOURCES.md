# Sources — de.scd-types-0-7

## Kimball Group, "Type 0: Retain Original"

URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-0/
Fetched: 2026-10-22.

Quote:
> With slowly changing dimension type 0, the dimension attribute value never changes, so facts are always grouped by this original value. Type 0 is appropriate for any attribute labeled "original," such as a customer's original credit score or a durable identifier. It also applies to most attributes in a date dimension.

Items (for coverage): (1) the attribute value never changes; (2) facts are always grouped by the original value; (3) appropriate for "original"-labeled attributes and durable identifiers; (4) applies to most date-dimension attributes.

## Kimball Group, "Type 1: Overwrite"

URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-1/
Fetched: 2026-10-22.

Quote:
> With slowly changing dimension type 1, the old attribute value in the dimension row is overwritten with the new value; type 1 attributes always reﬂects the most recent assignment, and therefore this technique destroys history. Although this approach is easy to implement and does not create additional dimension rows, you must be careful that aggregate fact tables and OLAP cubes affected by this change are recomputed.

Items: (1) old value is overwritten with the new value; (2) destroys history; (3) easy to implement, no additional dimension rows; (4) aggregate fact tables and OLAP cubes must be recomputed.

## Kimball Group, "Type 3: Add New Attribute"

URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-3/
Fetched: 2026-10-22.

Quote:
> Slowly changing dimension type 3 changes add a new attribute in the dimension to preserve the old attribute value; the new value overwrites the main attribute as in a type 1 change. This kind of type 3 change is sometimes called an alternate reality. A business user can group and ﬁlter fact data by either the current value or alternate reality. This slowly changing dimension technique is used relatively infrequently.

Items: (1) adds a new attribute/column to preserve the old value; (2) the main attribute is overwritten, Type 1 style; (3) called an "alternate reality"; (4) can group/filter by either value; (5) used relatively infrequently.

## Kimball Group, "Type 4: Add Mini-Dimension"

URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-4/
Fetched: 2026-10-22.

Quote:
> Slowly changing dimension type 4 is used when a group of attributes in a dimension rapidly changes and is split off to a mini–dimension. This situation is sometimes called a rapidly changing monster dimension. Frequently used attributes in multimillion-row dimension tables are mini-dimension design candidates, even if they don’t frequently change. The type 4 mini-dimension requires its own unique primary key; the primary keys of both the base dimension and mini-dimension are captured in the associated fact tables.

Items: (1) a group of rapidly changing attributes is split off into a mini-dimension; (2) "rapidly changing monster dimension"; (3) frequently-used attributes in multimillion-row tables are also candidates, even without frequent change; (4) mini-dimension has its own primary key; (5) both base and mini-dimension keys go in the fact table.

## Kimball Group, "Type 5: Add Mini-Dimension and Type 1 Outrigger"

URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-5/
Fetched: 2026-10-22.

Quote:
> Slowly changing dimension type 5 is used to accurately preserve historical attribute values, plus report historical facts according to current attribute values. Type 5 builds on the type 4 mini-dimension by also embedding a current type 1 reference to the mini-dimension in the base dimension. This enables the currently-assigned mini- dimension attributes to be accessed along with the others in the base dimension without linking through a fact table. Logically, you’d represent the base dimension and mini-dimension outrigger as a single table in the presentation area. The ETL team must overwrite this type 1 mini-dimension reference whenever the current mini-dimension assignment changes.

Items: (1) preserves history and reports by current value, both; (2) builds on Type 4 by embedding a current Type 1 reference in the base dimension; (3) reads current mini-dimension attributes without a fact-table join; (4) logically one table in the presentation layer; (5) the Type 1 reference is overwritten whenever the current assignment changes.

## Kimball Group, "Type 6: Add Type 1 Attributes to Type 2 Dimension"

URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-6/
Fetched: 2026-10-22.

Quote:
> Like type 5, slowly changing dimension type 6 also delivers both historical and current dimension attribute values. Type 6 builds on the type 2 technique by also embedding current type 1 versions of the same attributes in the dimension row so that fact rows can be ﬁltered or grouped by either the type 2 attribute value in effect when the measurement occurred or the attribute’s current value. In this case, the type 1 attribute is systematically overwritten on all rows associated with a particular durable key whenever the attribute is updated.

Items: (1) delivers both historical and current values; (2) builds on Type 2 by embedding current Type 1 versions of the same attributes; (3) fact rows can filter/group by the in-effect value or the current value; (4) the Type 1 attribute is overwritten on all rows for the durable key whenever it updates.

## Kimball Group, "Type 7: Dual Type 1 and Type 2 Dimensions"

URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-7/
Fetched: 2026-10-22.

Quote:
> Slowly changing dimension type 7 is the ﬁnal hybrid technique used to support both as-was and as-is reporting. A fact table can be accessed through  a dimension modeled both as a type 1 dimension showing only the most current  attribute values, or as a type 2 dimension showing correct contemporary  historical proﬁles. The same dimension table enables both perspectives. Both the durable key and primary surrogate key of the dimension are placed in the fact table. For the type 1 perspective, the current ﬂag in the dimension is constrained to be current,  and the fact table is joined via the durable key. For the type 2 perspective, the current ﬂag is not constrained, and the fact table is joined via the surrogate primary key. These two perspectives would be deployed as separate views to the BI applications.

Items: (1) supports both as-was and as-is reporting from the same table; (2) both durable key and surrogate key go in the fact table; (3) the Type 1 perspective joins via the durable key, constrained to current; (4) the Type 2 perspective joins via the surrogate key, unconstrained; (5) deployed as two separate views.

## Kimball Group, Design Tip #152, "Slowly Changing Dimension Types 0, 4, 5, 6 and 7" (Margy Ross, 5 February 2013)

URL: https://www.kimballgroup.com/2013/02/design-tip-152-slowly-changing-dimension-types-0-4-5-6-7/
Fetched: 2026-10-22.

Quotes:
> Dimensional modelers, in conjunction with the business’s data governance representatives, must specify the data warehouse’s response to operational attribute value changes.

> The type 5 technique builds on the type 4 mini-dimension by embedding a “current profile” mini-dimension key in the base dimension that’s overwritten as a type 1 attribute. This approach, called type 5 because 4 + 1 equals 5, allows the currently-assigned mini-dimension attribute values to be accessed along with the base dimension’s others without linking through a fact table.

> The type 6 moniker was suggested by an HP engineer in 2000 because it’s a type 2 row with a type 3 column that’s overwritten as a type 1; both 2 + 3 + 1 and 2 x 3 x 1 equal 6. With this approach, the current attributes are updated on all prior type 2 rows associated with a particular durable key

> Type 7 delivers the same functionality as type 6, but it’s accomplished via dual keys instead of physically overwriting the current attributes with type 6.

Items: (1) the SCD choice is a per-attribute governance decision, made with the business; (2) Type 5 named for 4+1=5; (3) Type 6 named for 2+3+1 (and 2×3×1) =6, current attributes updated on all prior rows for the durable key; (4) Type 7 delivers the same functionality as Type 6 via dual keys, without overwriting.

## This topic's own worked scenario (no lab of its own, per `CHAPTER.md`)

URL: n/a — this topic has no lab of its own (`CHAPTER.md`); a disclosed, self-consistent combinatorial scenario computed in `examples.py`, not a claim about a real running system.

Not a claim about a real running system: a disclosed, self-consistent combinatorial scenario computed directly in `examples.py` — the mini-dimension sizing (9 possible `income_tier` × `marketing_channel` combinations, 5 actually observed), the row-count contrast between embedding those two columns as Type 2 on the base dimension (160 wide rows for 40 customers × 3 changes each) versus a Type 4 mini-dimension (45 rows total, bounded by observed combinations), and the Type 6 vs. Type 7 update-cost contrast (6 historical rows touched vs. 0) for one customer's accumulated history.
