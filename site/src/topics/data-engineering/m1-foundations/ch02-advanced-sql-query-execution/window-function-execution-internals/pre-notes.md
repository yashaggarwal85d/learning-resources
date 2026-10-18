- **Linear vs quadratic cost**: work that grows in proportion to n, versus in proportion to n squared. *Where you meet it:* doubling a table doubles a scan but quadruples a naive all-pairs comparison.
- **Data skew**: an uneven spread of rows over keys. *Where you meet it:* one customer with half of all events.
- **Worker / thread**: a unit of parallel execution. *Where you meet it:* `Workers Planned: 4` in a plan.
- **Window frame**: the set of rows around the current one that a window function looks at, set with `ROWS BETWEEN … AND …` or `RANGE BETWEEN … AND …`. *Where you meet it:* a moving average over the six rows before this one and this one.
- **Aggregate function**: collapses many values into one, such as `SUM`, `AVG`, `MIN` or `COUNT`. *Where you meet it:* `SUM(amount)` over a column of order amounts.

**Check yourself:** after removing a value from a running sum, you subtract it. Why can't you do the same for a running maximum? (Answer: the removed value may have been the maximum, and the second largest is not stored.)
