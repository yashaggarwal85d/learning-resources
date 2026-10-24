# Sources — B-tree indexes in production

## btree-structure-leaf-internal — PostgreSQL 16 documentation (67.4.1. B-Tree Structure)
URL: https://www.postgresql.org/docs/16/btree-implementation.html
Fetched: 2026-10-24, cached at `sources/btree-implementation.txt`.

> PostgreSQL B-Tree indexes are multi-level tree structures, where each level of the tree can be used as a doubly-linked list of pages. A single metapage is stored in a fixed position at the start of the first segment file of the index. All other pages are either leaf pages or internal pages. Leaf pages are the pages on the lowest level of the tree. All other levels consist of internal pages. Each leaf page contains tuples that point to table rows. Each internal page contains tuples that point to the next level down in the tree. Typically, over 99% of all pages are leaf pages.

## btree-page-split — PostgreSQL 16 documentation (67.4.1. B-Tree Structure)
URL: https://www.postgresql.org/docs/16/btree-implementation.html
Fetched: 2026-10-24, cached at `sources/btree-implementation.txt`.

> New leaf pages are added to a B-Tree index when an existing leaf page cannot fit an incoming tuple. A page split operation makes room for items that originally belonged on the overflowing page by moving a portion of the items to a new page. Page splits must also insert a new downlink to the new page in the parent page, which may cause the parent to split in turn. Page splits "cascade upwards" in a recursive fashion. When the root page finally cannot fit a new downlink, a root page split operation takes place. This adds a new level to the tree structure by creating a new root page that is one level above the original root page.

## btree-deduplication — PostgreSQL 16 documentation (67.4.3. Deduplication)
URL: https://www.postgresql.org/docs/16/btree-implementation.html
Fetched: 2026-10-24, cached at `sources/btree-implementation.txt`.

> A duplicate is a leaf page tuple (a tuple that points to a table row) where all indexed key columns have values that match corresponding column values from at least one other leaf page tuple in the same index. Duplicate tuples are quite common in practice. B-Tree indexes can use a special, space-efficient representation for duplicates when an optional technique is enabled: deduplication.

## btree-fillfactor — PostgreSQL 16 documentation (CREATE INDEX)
URL: https://www.postgresql.org/docs/16/sql-createindex.html
Fetched: 2026-10-24, cached at `sources/createindex.txt`.

> The fillfactor for an index is a percentage that determines how full the index method will try to pack index pages. For B-trees, leaf pages are filled to this percentage during initial index builds, and also when extending the index at the right (adding new largest key values). If pages subsequently become completely full, they will be split, leading to fragmentation of the on-disk index structure. B-trees use a default fillfactor of 90, but any integer value from 10 to 100 can be selected.

## lehman-yao-right-link — PostgreSQL nbtree README (src/backend/access/nbtree/README)
URL: https://raw.githubusercontent.com/postgres/postgres/REL_16_STABLE/src/backend/access/nbtree/README
Fetched: 2026-10-24, cached at `sources/nbtree-readme.txt`.

> This directory contains a correct implementation of Lehman and Yao's high-concurrency B-tree management algorithm (P. Lehman and S. Yao, Efficient Locking for Concurrent Operations on B-Trees, ACM Transactions on Database Systems, Vol 6, No. 4, December 1981, pp 650-670). We also use a simplified version of the deletion logic described in Lanin and Shasha (V. Lanin and D. Shasha, A Symmetric Concurrent B-Tree Algorithm, Proceedings of 1986 Fall Joint Computer Conference, pp 380-389).

> Compared to a classic B-tree, L&Y adds a right-link pointer to each page, to the page's right sibling. It also adds a "high key" to each page, which is an upper bound on the keys that are allowed on that page. These two additions make it possible to detect a concurrent page split, which allows the tree to be searched without holding any read locks (except to keep a single page from being modified while reading it).

## lehman-yao-follow-right-link — PostgreSQL nbtree README
URL: https://raw.githubusercontent.com/postgres/postgres/REL_16_STABLE/src/backend/access/nbtree/README
Fetched: 2026-10-24, cached at `sources/nbtree-readme.txt`.

> When a search follows a downlink to a child page, it compares the page's high key with the search key. If the search key is greater than the high key, the page must've been split concurrently, and you must follow the right-link to find the new page containing the key range you're looking for. This might need to be repeated, if the page has been split more than once.

## skip-scan-pg18 — PostgreSQL 18 Release Notes (E.6. Release 18)
URL: https://www.postgresql.org/docs/18/release-18.html
Fetched: 2026-10-24, cached at `sources/release-18.txt`.

> Support for "skip scan" lookups that allow using multicolumn B-tree indexes in more cases.

## innodb-clustered-pk — MariaDB Documentation (PRIMARY KEY Constraints)
URL: https://mariadb.com/docs/server/architecture/server-constraints/primary-key-constraints
Fetched: 2026-10-24, cached at `sources/mariadb-pk-constraints.txt`.

> InnoDB uses the primary key as a clustered index, which means that InnoDB stores table data in the order determined by the primary key.

## innodb-secondary-lookup-cost — MariaDB Documentation (Building the best INDEX for a given SELECT)
URL: https://mariadb.com/docs/server/ha-and-performance/optimization-and-tuning/optimization-and-indexes/building-the-best-index-for-a-given-select
Fetched: 2026-10-24, cached at `sources/mariadb-best-index.txt`.

> InnoDB "clusters" the PRIMARY KEY with the data. Hence, given the value of the PK ("PRIMARY KEY"), after drilling down the BTree to find the index entry, you have all the columns of the row when you get there. A "secondary key" (any UNIQUE or INDEX other than the PK) in InnoDB first drills down the BTree for the secondary index, where it finds a copy of the PK. Then it drills down the PK to find the row.

**Named but not quoted:**

Lehman, P. and Yao, S., "Efficient Locking for Concurrent Operations on B-Trees," *ACM Transactions on Database Systems*, Vol 6, No. 4, December 1981, pp 650-670. Named by full reference per the nbtree README's own citation above; the paper's abstract and algorithm description are reproduced faithfully by Postgres's own README (the `lehman-yao-right-link` and `lehman-yao-follow-right-link` quotes above), which is this topic's primary, directly-verifiable source for the algorithm's mechanics rather than the original paywalled ACM paper.

Last verified: 2026-10-24. Expert sign-off: pending.
