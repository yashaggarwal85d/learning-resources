Last verified: 24 October 2026. Two real measured comparisons run in this sandbox (`examples.py`,
against this sandbox's own Postgres cluster): the identical 8-worker, 300-op workload run under
`SELECT ... FOR UPDATE` and under a version-column compare-and-set, once against 400 rows and once
against 2 rows — a real, measured reversal, stable across 7 repeated runs in both directions.

- PostgreSQL documentation, "13.3. Explicit Locking": [postgresql.org](https://www.postgresql.org/docs/current/explicit-locking.html). `FOR UPDATE`'s own row-locking semantics.
- PostgreSQL documentation, "13.4. Data Consistency Checks at the Application Level": [postgresql.org](https://www.postgresql.org/docs/current/applevel-consistency.html). `FOR UPDATE`/`FOR SHARE`/`LOCK TABLE` as the explicit, pessimistic route to protecting a row's current validity.
- Kung, H. T. and Robinson, J. T., "On Optimistic Methods for Concurrency Control", ACM Transactions on Database Systems, Vol. 6, No. 2, June 1981: [eecs.harvard.edu](https://www.eecs.harvard.edu/~htk/publication/1981-tods-kung-robinson.pdf). The original definition of optimistic concurrency control: its own three phases, and what happens when validation fails.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=optimistic-vs-pessimistic-concurrency:%20).
