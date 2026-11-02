# Sources: Row/column security and dynamic masking in-engine (`de.row-column-security-dynamic`)

PostgreSQL's row security policies documentation (the runnable local example), Snowflake's
column-level security and row access policy documentation, Databricks' row-filter and
column-mask documentation, BigQuery's row-level and column-level access-control documentation,
and AWS Lake Formation's data-filtering documentation are all fetched directly.

## PostgreSQL documentation — 5.9. Row Security Policies

URL: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
Version: PostgreSQL 18 documentation, retrieved 2026-11-01

> To specify which rows are visible or modifiable according to a policy, an expression is required that returns a Boolean result. This expression will be evaluated for each row prior to any conditions or functions coming from the user's query. (The only exceptions to this rule are leakproof functions, which are guaranteed to not leak information; the optimizer may choose to apply such functions ahead of the row-security check.)

> Superusers and roles with the BYPASSRLS attribute always bypass the row security system when accessing a table. Table owners normally bypass row security as well, though a table owner can choose to be subject to row security with ALTER TABLE ... FORCE ROW LEVEL SECURITY.

> Enabling and disabling row security, as well as adding policies to a table, is always the privilege of the table owner only.

Contents: the exact mechanics the reel runs directly -- a policy expression evaluated before the
user's own query conditions except for leakproof functions, and the owner/BYPASSRLS bypass this
topic's own hook depends on -- the "enforce in the query engine, not the application" and
"Postgres row-security documentation is the runnable local example" clauses.

## Snowflake Documentation — Understanding Dynamic Data Masking

URL: https://docs.snowflake.com/en/user-guide/security-column-ddm-intro
Version: retrieved 2026-11-01

> Dynamic Data Masking is a Column-level Security feature that uses masking policies to selectively mask plain-text data in table and view columns at query time.

Contents: Snowflake's own description of masking as a query-time transform rather than a
rewrite of stored data -- the "no static masking, masks at query time" half of the named-engines
clause.

## Snowflake Documentation — Understanding row access policies

URL: https://docs.snowflake.com/en/user-guide/security-row-intro
Version: retrieved 2026-11-01

> A row access policy is a schema-level object that determines whether a given row in a table or view can be viewed from the following types of statements:

Contents: Snowflake's own separate row-access-policy mechanism, confirming it is a distinct
feature from column masking rather than the same policy object doing both.

## Databricks documentation — Row filters and column masks

URL: https://docs.databricks.com/aws/en/data-governance/unity-catalog/row-and-column-filters
Version: retrieved 2026-11-01

> Row filters and column masks control data visibility by ensuring that users cannot view base table values before filtering or masking is applied. When the query engine must choose between optimization and protecting against information leakage from filtered or masked values, it always makes the secure choice, which can affect query performance.

Contents: Databricks' own direct statement of the pruning/caching trade-off -- the "impact on
pruning and caching" clause, in the vendor's own words rather than inferred.

## BigQuery documentation — Introduction to BigQuery row-level security

URL: https://cloud.google.com/bigquery/docs/row-level-security-intro
Version: retrieved 2026-11-01

> Row-level security lets you filter data and enables access to specific rows in a table based on qualifying user conditions.

> Row-level security extends the principle of least privilege by enabling fine-grained access control to a subset of data in a BigQuery table, by means of row-level access policies.

Contents: BigQuery's own row-level-security mechanism, named alongside its own column-level
policy tags as the two halves of the same named-engines clause.

## AWS Lake Formation documentation — Data filtering and cell-level security in Lake Formation

URL: https://docs.aws.amazon.com/lake-formation/latest/dg/data-filtering.html
Version: retrieved 2026-11-01

> Cell-level security combines row filtering and column filtering for a highly flexible permissions model.

Contents: Lake Formation's own data filters, combining row and column security into one
mechanism (a "data cells filter") -- the Lake Formation half of the named-engines clause.

Note on Trino's row filtering and column masking: Trino's OPA integration (row filtering and
column masking as access decisions returned by a policy engine) was already fetched and quoted
directly in the previous topic's own `SOURCES.md` (`de.access-control-models-rbac`); this topic
reuses those same two quotes rather than re-fetching the identical page, and cites it the same
way.
