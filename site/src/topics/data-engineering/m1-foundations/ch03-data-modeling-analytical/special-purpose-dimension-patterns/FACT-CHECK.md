# Fact-check — de.special-purpose-dimension-patterns

| # | Claim | Status |
|---|---|---|
| 1 | A dimension is sometimes defined with no content except its primary key | Confirmed, quoted directly (Kimball Group, "Degenerate Dimensions") |
| 2 | When line items inherit the invoice's dimension foreign keys, the invoice number keeps no unique content of its own, yet remains a valid dimension key at the line-item level | Confirmed, quoted directly |
| 3 | A degenerate dimension sits in the fact table with explicit acknowledgment that no dimension table exists for it | Confirmed, quoted directly |
| 4 | Degenerate dimensions are most common with transaction and accumulating snapshot fact tables | Confirmed, quoted directly |
| 5 | A single physical dimension can be referenced multiple times in a fact table, each reference a logically distinct role | Confirmed, quoted directly (Kimball Group, "Role-Playing Dimensions") |
| 6 | Each foreign key must refer to a separate view of the shared dimension so the references stay independent | Confirmed, quoted directly |
| 7 | These separate dimension views, with unique attribute column names, are called roles | Confirmed, quoted directly |
| 8 | Transactional processes typically produce miscellaneous low-cardinality flags and indicators | Confirmed, quoted directly (Kimball Group, "Junk Dimensions") |
| 9 | Rather than a separate dimension per flag, a single junk dimension can combine them | Confirmed, quoted directly |
| 10 | A junk dimension need not be the full Cartesian product of every attribute's possible values — only the combinations that actually occur in the source data | Confirmed, quoted directly |
| 11 | A dimension can contain a reference to another dimension table | Confirmed, quoted directly (Kimball Group, "Outrigger Dimensions") |
| 12 | These secondary dimension references are called outrigger dimensions | Confirmed, quoted directly |
| 13 | Outriggers are permissible but should be used sparingly; in most cases the correlation should instead be demoted to the fact table as separate foreign keys | Confirmed, quoted directly |
| 14 | A real order-line table with a bare, tableless order number correctly groups two lines under one order number and one line under another | Measured directly on this sandbox; see examples.py |
| 15 | A single real `dim_date` table, referenced by two separate foreign keys from one fact row, correctly returns two distinct dates from the one underlying table | Measured directly on this sandbox; see examples.py |
| 16 | A real junk dimension of three shipping flags stores exactly three actual combinations against a full Cartesian product of eight | Measured directly on this sandbox; see examples.py |
| 17 | A real account-dimension outrigger referencing a date-opened dimension requires a query to touch three tables, one more than a flattened design would require | Measured directly on this sandbox; see examples.py |
