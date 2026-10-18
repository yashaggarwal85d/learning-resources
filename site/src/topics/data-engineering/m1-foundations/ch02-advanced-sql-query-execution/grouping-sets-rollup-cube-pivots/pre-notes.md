- **Aggregate function**: a function that collapses many rows into one value, such as `SUM`, `COUNT`, `AVG`. *Where you meet it:* `SUM(amount)` in a revenue report.
- **GROUP BY**: splits rows into groups by the listed columns and runs the aggregates once per group. *Where you meet it:* `GROUP BY status`.
- **Subtotal and grand total**: a total over one group of a hierarchy, and a total over everything. *Where you meet it:* a spreadsheet with a total row under each section.
- **Long vs wide table**: long has one row per observation; wide has one column per category. *Where you meet it:* a month-by-status matrix versus a list of (month, status, amount) rows.

**Check yourself:** what does `SELECT status, SUM(amount) FROM orders GROUP BY status` return? (Answer: one row per status with that status's total.)
