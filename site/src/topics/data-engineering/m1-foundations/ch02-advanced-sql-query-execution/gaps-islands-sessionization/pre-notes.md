- **Event stream**: a log of timestamped records, one per thing that happened. *Where you meet it:* a clickstream or an application log.
- **Inactivity threshold**: the pause that ends a session. *Where you meet it:* 30 minutes in many analytics tools.
- **Interval**: a span of time, as a subtraction of two timestamps. *Where you meet it:* `INTERVAL '30 minutes'` in SQL.
- **Window function with `ORDER BY`**: a calculation that can see the neighbouring rows of an ordered set. *Where you meet it:* `LAG(ts) OVER (ORDER BY ts)` returns the previous row's timestamp.

**Check yourself:** activity on days 1, 2, 3, 5, 6. How many unbroken runs are there? (Answer: two, days 1 to 3 and days 5 to 6.)
