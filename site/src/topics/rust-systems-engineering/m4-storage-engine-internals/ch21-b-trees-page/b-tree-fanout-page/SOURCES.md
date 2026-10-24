# Sources — B+-tree fanout and page splits

## PostgreSQL: B-Tree Indexes
URL: https://www.postgresql.org/docs/current/btree.html
Fetched: 2026-10-24, cached at `sources/btree.txt`.
> Typically, over 99% of all pages are leaf pages.

> Page splits must also insert a new downlink to the new page in the parent page, which may cause the parent to split in turn.

## PostgreSQL: CREATE INDEX (fillfactor)
URL: https://www.postgresql.org/docs/current/sql-createindex.html
Fetched: 2026-10-24, cached at `sources/sql-createindex.txt`.
> If pages subsequently become completely full, they will be split, leading to fragmentation of the on-disk index structure. B-trees use a default fillfactor of 90, but any integer value from 10 to 100 can be selected.

## PostgreSQL nbtree README (suffix truncation)
URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/access/nbtree/README
Fetched: 2026-10-24, cached at `sources/nbtree-readme.txt`.
> The goal of suffix truncation of key attributes is to improve index fan-out.
