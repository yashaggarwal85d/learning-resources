- **Fixed-width integer**: a whole number stored in a set number of bits, so it can hold only a finite range of values. *Where you meet it:* a column typed `INT` in SQL is a 32-bit signed integer.
- **Signed vs unsigned**: a signed integer spends one bit on the sign and can be negative; an unsigned one cannot. *Where you meet it:* a database id column is usually signed, an array index in Rust is unsigned.
- **Decimal vs binary fraction**: people write numbers in base ten; hardware stores them in base two, where some tenths have no finite representation. *Where you meet it:* `0.1` typed into a program is already a slightly different number inside it.
- **Epoch timestamp**: an instant stored as a count of time units since a fixed start, usually 1 January 1970 UTC. *Where you meet it:* log files and APIs often hand you an integer like `1760000000`.
- **Aggregate and GROUP BY**: an aggregate (`SUM`, `COUNT`) collapses many rows into one value; `GROUP BY` does so once per distinct key. *Where you meet it:* revenue per day is a `SUM` grouped by day.

**Check yourself:** can you say what `SELECT status, SUM(amount) FROM orders GROUP BY status` returns? (Answer: one row per distinct `status`, with the total `amount` for that status.)
