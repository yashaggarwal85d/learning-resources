# Sources

## Technical explanation (datafold/data-diff)

URL: https://raw.githubusercontent.com/datafold/data-diff/master/docs/technical-explanation.md
Version: data-diff, master branch docs (fetched 2026-10-31)

> Uses an outer-join to diff the rows as efficiently and accurately as possible.

> Employs a divide and conquer algorithm based on hashing, optimized for few changes.

> data-diff splits the table into smaller segments, then checksums each segment in both databases.

> When the checksums for a segment aren't equal, it will further divide that segment into yet smaller segments, checksumming those until it gets to the differing row(s).

> This approach has performance within an order of magnitude of count(*) when there are few/no changes, but is able to output each differing row!

## Numeric Types (PostgreSQL 18 Documentation)

URL: https://www.postgresql.org/docs/18/datatype-numeric.html
Version: PostgreSQL 18 (fetched 2026-10-31)

> The data types real and double precision are inexact, variable-precision numeric types.

> Comparing two floating-point values for equality might not always work as expected.

## Date/Time Types (PostgreSQL 18 Documentation)

URL: https://www.postgresql.org/docs/18/datatype-datetime.html
Version: PostgreSQL 18 (fetched 2026-10-31)

> The allowed range of p is from 0 to 6.
