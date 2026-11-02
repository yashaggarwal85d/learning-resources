# References

- datafold/data-diff, "Technical explanation": https://github.com/datafold/data-diff/blob/master/docs/technical-explanation.md
- PostgreSQL 18 Documentation, "Numeric Types": https://www.postgresql.org/docs/18/datatype-numeric.html
- PostgreSQL 18 Documentation, "Date/Time Types": https://www.postgresql.org/docs/18/datatype-datetime.html

Last verified: 2026-10-31. Expert sign-off: pending.

Software run in this sandbox: Python 3 standard library (`hashlib`, `random`, `datetime`) for the real full join-diff, checksum-bisection diff, tolerance demo, column-summary demo and cost curve, all run against a synthetic `fct_orders` table with a deliberately planted single-column regression. Every data-diff and PostgreSQL quote is verified word for word against the fetched source text.
