Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`, against this sandbox's own PostgreSQL 16 cluster via `pageinspect`): a real
page's header fields read and checked for ordering; a real `DELETE` plus `VACUUM` with CTIDs
compared before and after; a real inserted row with one null column, its bitmap decoded; a real
incompressible value forced into TOAST and its chunk count and round-tripped length checked
directly. InnoDB's own overflow-page mechanism is a disclosed, sourced-only claim, since this
sandbox has no InnoDB instance to run it against.

- PostgreSQL docs, "Database Page Layout": [postgresql.org](https://www.postgresql.org/docs/16/storage-page-layout.html). The page's five parts, the line-pointer array, the heap tuple header and its null bitmap.
- PostgreSQL docs, "TOAST": [postgresql.org](https://www.postgresql.org/docs/16/storage-toast.html). Why a fixed page size forces large values out of line, and the chunking scheme.
- PostgreSQL docs, "pageinspect": [postgresql.org](https://www.postgresql.org/docs/16/pageinspect.html). `get_raw_page` and `heap_page_items`, the real functions this topic's examples use directly.
- MariaDB Knowledge Base, "InnoDB Row Formats Overview": [mariadb.com](https://mariadb.com/kb/en/innodb-row-formats-overview/). InnoDB's own overflow-page mechanism, the comparison point.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=pages-slotted-pages-tuple:%20).
