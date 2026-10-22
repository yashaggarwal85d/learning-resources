Last verified against these sources: 22 October 2026, with the MERGE-load, idempotency, and replay
demonstrations run directly on this session's PostgreSQL sandbox against a throwaway customer
dimension and a throwaway change feed, both built for this topic and dropped afterward. Expert
sign-off: pending.

- Kimball Group, "Type 2: Add New Row": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2/). A new row, a new surrogate key, per version.
- PostgreSQL Documentation, "MERGE": [postgresql.org](https://www.postgresql.org/docs/current/sql-merge.html). One statement, conditional insert, update, or delete.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=scd-type-2-implementation:%20).
