- **Running total**: an aggregate that grows as you move down an ordered list. *Where you meet it:* a bank statement's balance column.
- **Timestamp tie**: two rows with exactly the same value in the ordering column. *Where you meet it:* events logged in the same millisecond, or dates without a time.
- **CTE / subquery**: a named or inline query whose result an outer query reads. *Where you meet it:* `WITH t AS (SELECT …) SELECT … FROM t`.
- **Rank**: the position of a row in an ordering. *Where you meet it:* a leaderboard.

**Check yourself:** three rows have amounts 5, 5 and 7, and the first two tie on the ordering key. Is "the order of the two 5s" defined by `ORDER BY key` alone? (Answer: no, it is arbitrary, so add a unique tiebreaker.)
