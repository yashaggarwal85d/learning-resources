# Sources — de.row-column-security-dynamic

## PostgreSQL — Row Security Policies

URL: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

> tables can have row security policies that restrict, on a per-user basis, which rows can be returned by normal queries or inserted, updated, or deleted by data modification commands

> Superusers and roles with the BYPASSRLS attribute always bypass the row security system when accessing a table. Table owners normally bypass row security as well, though a table owner can choose to be subject to row security with ALTER TABLE ... FORCE ROW LEVEL SECURITY.

> This expression will be evaluated for each row prior to any conditions or functions coming from the user's query. (The only exceptions to this rule are leakproof functions, which are guaranteed to not leak information; the optimizer may choose to apply such functions ahead of the row-security check.)

## Snowflake — Understanding column-level security (Dynamic Data Masking)

URL: https://docs.snowflake.com/en/user-guide/security-column-ddm-intro

> In Snowflake, masking policies are schema-level objects, which means a database and schema must exist in Snowflake before a masking policy can be applied to a column.

> At query runtime, the masking policy is applied to the column at every location where the column appears.

## Snowflake — Understanding row access policies

URL: https://docs.snowflake.com/en/user-guide/security-row-intro

> A row access policy is a schema-level object that determines whether a given row in a table or view can be viewed

> the query output only contains rows based on the policy definition evaluating to TRUE

## Google BigQuery — Introduction to BigQuery row-level security

URL: https://docs.cloud.google.com/bigquery/docs/row-level-security-intro

> Row-level security lets you filter data and enables access to specific rows in a table based on qualifying user conditions.

> Any users or groups not specifically included in the allowed list are denied access.

> The filter_expression functions like a WHERE clause in a typical query.

## AWS Lake Formation — Data filtering and cell-level security in Lake Formation

URL: https://docs.aws.amazon.com/lake-formation/latest/dg/data-filtering.html

> Lake Formation uses data filtering to achieve column-level security, row-level security, and cell-level security.

> Filters apply only to read operations. Therefore, you can grant only the SELECT Lake Formation permission with filters.

## Databricks — Create and manage row filter and column mask policies

URL: https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/policies

> Creates a row filter policy. The UDF evaluates each row and returns a boolean.

> Creates a column mask policy. The UDF takes the column value as input and returns the original or a masked version.

> Rows where the UDF returns FALSE are excluded from query results.

## Trino — Open Policy Agent access control

URL: https://trino.io/docs/current/security/opa-access-control.html

> supports retrieving filter definitions from OPA by configuring the OPA endpoint for row filter processing

> supports fetching column masks from OPA by configuring the OPA endpoint for columns mask processing
