## Kimball Group, "Conformed Dimensions"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/conformed-dimension/

> Dimension tables conform when attributes in separate dimension tables have the same column names and domain contents.

> Information from separate fact tables can be combined in a single report by using conformed dimension attributes that are associated with each fact table. When a conformed attribute is used as the row header (that is, the grouping column in the SQL query), the results from the separate fact tables can be aligned on the same rows in a drill-across report. This is the essence of integration in an enterprise DW/ BI system.

> Conformed dimensions, deﬁned once in collaboration with the business’s data governance representatives, are reused across fact tables; they deliver both analytic consistency and reduced future development costs because the wheel is not repeatedly re-created.

## Kimball Group, "Drilling Across"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/drilling-across/

> Drilling across simply means making separate queries against two or more fact tables where the row headers of each query consist of identical conformed attributes.

> The answer sets from the two queries are aligned by performing a sort-merge operation on the common dimension attribute row headers.

## Kimball Group, "Enterprise Data Warehouse Bus Architecture"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/kimball-data-warehouse-bus-architecture/

> It decomposes the DW/BI planning process into manageable pieces by focusing on the organization’s core business processes, along with the associated conformed dimensions.

> Conformed dimensions are common, standardized, master dimensions that are managed once in the extract, transformation, and load (ETL) system and then reused by multiple fact tables.

> They support the ability to drill across and integrate data from multiple business processes.

> The associated Enterprise Data Warehouse Bus Matrix, shown below, is a key design tool representing the organization’s core business processes and associated dimensionality.

## Measured directly on this sandbox
URL: n/a — measured on this session's PostgreSQL sandbox (port 5432, `shop` database), on throwaway tables built for this topic and dropped immediately after

Two real fact tables of different grains — an orders fact (two orders, one shared day) and a
support-tickets fact (three tickets, the same day) — were joined two ways. Joined directly on the
shared conformed date and then summed, the query returned six rows for that one day and a wrongly
inflated amount sum of four hundred thirty-five, because every order row was duplicated once per
matching ticket row. Aggregating each fact table to the shared date grain first, then joining those
two already-summarized rows, returned the correct totals exactly: the orders' own true sum and the
tickets' own true sum, independently confirmed by summing each fact table alone.
