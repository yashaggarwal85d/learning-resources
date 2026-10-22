## Kimball Group, "Degenerate Dimensions"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/degenerate-dimension/

> Sometimes a dimension is deﬁned that has no content except for its primary key.

> For example, when an invoice has multiple line items, the line item fact rows inherit all the descriptive dimension foreign keys of the invoice, and the invoice is left with no unique content. But the invoice number remains a valid dimension key for fact tables at the line item level.

> This degenerate dimension is placed in the fact table with the explicit acknowledgment that there is no associated dimension table.

> Degenerate dimensions are most common with transaction and accumulating snapshot fact tables.

## Kimball Group, "Role-Playing Dimensions"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/role-playing-dimension/

> A single physical dimension can be referenced multiple times in a fact table, with each reference linking to a logically distinct role for the dimension.

> It is essential that each foreign key refers to a separate view of the date dimension so that the references are independent.

> These separate dimension views (with unique attribute column names) are called roles.

## Kimball Group, "Junk Dimensions"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/junk-dimension/

> Transactional business processes typically produce a number of miscellaneous, low-cardinality ﬂags and indicators.

> Rather than making separate dimensions for each ﬂag and attribute, you can create a single junk dimension combining them together.

> This dimension, frequently labeled as a transaction proﬁle dimension in a schema, does not need to be the Cartesian product of all the attributes’ possible values, but should only contain the combination of values that actually occur in the source data.

## Kimball Group, "Outrigger Dimensions"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/outrigger-dimension/

> A dimension can contain a reference to another dimension table.

> These secondary dimension references are called outrigger dimensions.

> Outrigger dimensions are permissible, but should be used sparingly. In most cases, the correlations between dimensions should be demoted to a fact table, where both dimensions are represented as separate foreign keys.

## Measured directly on this sandbox
URL: n/a — measured on this session's PostgreSQL sandbox (port 5432, `shop` database), on throwaway tables built for this topic and dropped immediately after

A real order-line fact table carried an order number with no dimension table attached, and grouping
by that number correctly found two lines sharing one order and a separate single line on another —
proof the degenerate key still works as a grouping key with no table behind it. A real single
`dim_date` table, holding three rows, was referenced twice by one order fact's own two foreign keys,
and joining it in both roles at once correctly returned a distinct order date and ship date from
the identical underlying table. A real junk dimension of three shipping flags stored only three
actual combinations, against a full Cartesian product of eight that was never needed. A real
account dimension referencing a separate date-opened dimension (an outrigger) required a query to
touch three tables — the fact, the account dimension, and the date-opened dimension — to answer one
question a flattened design would have answered by touching two.
