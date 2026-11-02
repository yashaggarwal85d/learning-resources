# Fact-check — de.row-column-security-dynamic

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A row-security policy expression is evaluated for each row prior to any conditions from the user's own query, except for leakproof functions. | PostgreSQL documentation | Confirmed, quoted verbatim. |
| 2 | Superusers and roles with BYPASSRLS always bypass row security; table owners normally bypass it too unless FORCE ROW LEVEL SECURITY is set. | PostgreSQL documentation | Confirmed, quoted verbatim. |
| 3 | Dynamic Data Masking is a column-level security feature that masks plain-text data at query time. | Snowflake documentation | Confirmed, quoted verbatim. |
| 4 | A row access policy is a schema-level object that determines whether a given row can be viewed. | Snowflake documentation | Confirmed, quoted verbatim. |
| 5 | When the query engine must choose between optimization and protecting against information leakage, it always makes the secure choice, which can affect performance. | Databricks documentation | Confirmed, quoted verbatim. |
| 6 | Row-level security lets you filter data and enables access to specific rows based on qualifying user conditions, extending least privilege. | BigQuery documentation | Confirmed, quoted verbatim. |
| 7 | Cell-level security combines row filtering and column filtering for a highly flexible permissions model. | AWS Lake Formation documentation | Confirmed, quoted verbatim. |
| 8 | A restricted role querying a real PostgreSQL table with no row policy sees all 3,000 rows. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 9 | The same role, same query, after a row policy restricting to one region, sees exactly 1,000 of 3,000 rows. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 10 | EXPLAIN shows no Filter node before the policy exists, and an explicit Filter node after it is applied. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 11 | A superuser role bypasses the row policy entirely, seeing all 3,000 rows regardless. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |

## Red-team: the predict questions (steps 3 and 6)

**Question 1 (step 3):** before any row policy exists, how many rows does the eventually
restricted role see?

**Attack — "the role's own name already implies some restriction."** Nothing about a role's
name or future plans restricts what it can query today. `examples.py`'s own measurement
confirms the role sees the full 3,000-row table until an actual policy object exists on it —
naming a role `analyst_role` ahead of writing any policy grants nothing and restricts nothing.

**Question 2 (step 6):** after a policy restricting to one region, does the same unchanged
query still return everything?

**Attack — "a policy only matters if the query's own WHERE clause references it."** This is
precisely backwards from how row security works: the policy is evaluated regardless of what the
query asks. `examples.py` runs the identical query text both before and after the policy, and
only the policy's own presence changes the result, from 3,000 rows to 1,000.

## Abandoned approaches

Measuring the Hook's own three paths (masked-column query, derived-table query, direct file
read) as three separate quantitative claims was considered, but the derived-table and
direct-file paths don't need separate measurement once the superuser bypass demonstrates the
general mechanism (a path that never asks the engine's policy anything gets the same answer no
matter which specific path it is); measuring the superuser bypass once, and naming the other two
bypass paths by the same mechanism in `coverage.json`'s expert items and `post-notes.md`, avoids
three near-duplicate measurements that would show the identical thing three times.
