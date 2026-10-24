# Sources — Slotted pages and record identity

## PostgreSQL: Database Page Layout

URL: https://www.postgresql.org/docs/current/storage-page-layout.html
Fetched: 2026-10-24, cached at `sources/pg-page-layout.txt`.

> Following the page header are item identifiers (ItemIdData), each requiring four bytes. An item identifier contains a byte-offset to the start of an item, its length in bytes, and a few attribute bits which affect its interpretation. New item identifiers are allocated as needed from the beginning of the unallocated space. The number of item identifiers present can be determined by looking at pd_lower, which is increased to allocate a new identifier. Because an item identifier is never moved until it is freed, its index can be used on a long-term basis to reference an item, even when the item itself is moved around on the page to compact free space. In fact, every pointer to an item (ItemPointer, also known as CTID) created by PostgreSQL consists of a page number and the index of an item identifier.

## PostgreSQL: TOAST

URL: https://www.postgresql.org/docs/current/storage-toast.html
Fetched: 2026-10-24, cached at `sources/storage-toast.txt`.

> PostgreSQL uses a fixed page size (commonly 8 kB), and does not allow tuples to span multiple pages. Therefore, it is not possible to store very large field values directly. To overcome this limitation, large field values are compressed and/or broken up into multiple physical rows.

## PostgreSQL: pageinspect

URL: https://www.postgresql.org/docs/current/pageinspect.html
Fetched: 2026-10-24, cached at `sources/pageinspect.txt`.

> heap_page_items shows all line pointers on a heap page. For those line pointers that are in use, tuple headers as well as tuple raw data are also shown.
