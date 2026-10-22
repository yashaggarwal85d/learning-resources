# Fact-check — de.conformed-dimensions-drill-across

| # | Claim | Status |
|---|---|---|
| 1 | Dimension tables conform when attributes in separate tables share the same column names and domain contents | Confirmed, quoted directly (Kimball Group, "Conformed Dimensions") |
| 2 | Conformed attributes used as the row header let separate fact tables' results align on the same rows in a drill-across report — the essence of integration | Confirmed, quoted directly |
| 3 | Conformed dimensions are defined once with the business's data governance representatives, reused across fact tables, delivering analytic consistency and reduced development cost | Confirmed, quoted directly |
| 4 | Drilling across means separate queries against two or more fact tables with identical conformed row headers | Confirmed, quoted directly (Kimball Group, "Drilling Across") |
| 5 | The answer sets are aligned by a sort-merge operation on the common dimension attribute row headers, not a row-level join | Confirmed, quoted directly |
| 6 | The bus architecture decomposes DW/BI planning around core business processes and their associated conformed dimensions | Confirmed, quoted directly (Kimball Group, "Enterprise Data Warehouse Bus Architecture") |
| 7 | Conformed dimensions are common, standardized, master dimensions managed once in ETL and reused by multiple fact tables | Confirmed, quoted directly |
| 8 | Conformed dimensions support the ability to drill across and integrate data from multiple business processes | Confirmed, quoted directly |
| 9 | The Enterprise Data Warehouse Bus Matrix is the key design tool representing business processes and their dimensionality | Confirmed, quoted directly |
| 10 | Joining two real fact tables of different grains directly on their shared conformed date, then summing, produces six rows and a wrongly inflated amount sum of four hundred thirty-five for a true total of one hundred forty-five | Measured directly on this sandbox; see examples.py |
| 11 | Aggregating each fact table to the shared date grain first, then joining those two summarized rows, reproduces both fact tables' true, independently-confirmed totals exactly | Measured directly on this sandbox; see examples.py |
