- **Boolean logic (AND, OR, NOT)**: AND is true when both sides are, OR when at least one is, NOT flips. *Where you meet it:* every `WHERE a AND (b OR NOT c)` you have written.
- **Predicate**: an expression that is true or false for a row. *Where you meet it:* `amount > 100` in a `WHERE` clause.
- **Subquery**: a `SELECT` used as a value or a list inside another query. *Where you meet it:* `WHERE id IN (SELECT id FROM blocked)`.
- **Constraint**: a rule the database enforces on stored data. *Where you meet it:* `UNIQUE`, `NOT NULL`, `PRIMARY KEY`.
- **Placeholder / sentinel value**: a made-up value standing in for "no data", such as 0 or an empty string. *Where you meet it:* legacy tables that use `-1` for "unknown"; NULL exists to avoid this.

**Check yourself:** in ordinary logic, what is `TRUE AND FALSE` and `TRUE OR FALSE`? (Answer: FALSE and TRUE.)
