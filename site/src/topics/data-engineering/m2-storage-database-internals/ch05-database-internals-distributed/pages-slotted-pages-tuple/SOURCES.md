## Database Page Layout (PostgreSQL docs)

URL: https://www.postgresql.org/docs/16/storage-page-layout.html
Version: PostgreSQL 16 docs (fetched 2026-10-24)

> Every table and index is stored as an array of pages of a fixed size (usually 8 kB, although a different page size can be selected when compiling the server). In a table, all the pages are logically equivalent, so a particular item (row) can be stored in any page.

> Table 73.2 shows the overall layout of a page. There are five parts to each page.

> The first 24 bytes of each page consists of a page header (PageHeaderData).

> Following the page header are item identifiers (ItemIdData), each requiring four bytes. An item identifier contains a byte-offset to the start of an item, its length in bytes, and a few attribute bits which affect its interpretation. New item identifiers are allocated as needed from the beginning of the unallocated space.

> Because an item identifier is never moved until it is freed, its index can be used on a long-term basis to reference an item, even when the item itself is moved around on the page to compact free space. In fact, every pointer to an item (ItemPointer, also known as CTID) created by PostgreSQL consists of a page number and the index of an item identifier.

> The items themselves are stored in space allocated backwards from the end of unallocated space.

> All table rows are structured in the same way. There is a fixed-size header (occupying 23 bytes on most machines), followed by an optional null bitmap, an optional object ID field, and the user data.

> The null bitmap is only present if the HEAP_HASNULL bit is set in t_infomask. If it is present it begins just after the fixed header and occupies enough bytes to have one bit per data column (that is, the number of bits that equals the attribute count in t_infomask2). In this list of bits, a 1 bit indicates not-null, a 0 bit is a null.

Contents: a page's own five-part layout (header, line-pointer array, free space, items, special space); the line-pointer (ItemIdData) array as an (offset, length) pair per item; why a CTID (page number + line-pointer index) stays stable even when an item physically moves within the page; the heap tuple header's own fixed size and its optional null bitmap.

## TOAST (PostgreSQL docs)

URL: https://www.postgresql.org/docs/16/storage-toast.html
Version: PostgreSQL 16 docs (fetched 2026-10-24)

> PostgreSQL uses a fixed page size (commonly 8 kB), and does not allow tuples to span multiple pages. Therefore, it is not possible to store very large field values directly. To overcome this limitation, large field values are compressed and/or broken up into multiple physical rows.

> Out-of-line values are divided (after compression if used) into chunks of at most TOAST_MAX_CHUNK_SIZE bytes (by default this value is chosen so that four chunk rows will fit on a page, making it about 2000 bytes). Each chunk is stored as a separate row in the TOAST table belonging to the owning table.

> The TOAST management code is triggered only when a row value to be stored in a table is wider than TOAST_TUPLE_THRESHOLD bytes (normally 2 kB).

Contents: why a fixed page size forces large values out of line; the TOAST table's own chunking scheme (chunk_id, chunk_seq, chunk_data); the 2 kB threshold that triggers TOAST.

## pageinspect — low-level inspection of database pages (PostgreSQL docs)

URL: https://www.postgresql.org/docs/16/pageinspect.html
Version: PostgreSQL 16 docs (fetched 2026-10-24)

> get_raw_page reads the specified block of the named relation and returns a copy as a bytea value. This allows a single time-consistent copy of the block to be obtained.

> heap_page_items shows all line pointers on a heap page. For those line pointers that are in use, tuple headers as well as tuple raw data are also shown.

Contents: `get_raw_page` and `heap_page_items` as the real functions this topic uses to read a live page's own bytes directly.

## InnoDB Row Formats Overview (MariaDB docs)

URL: https://mariadb.com/kb/en/innodb-row-formats-overview/
Version: MariaDB Knowledge Base (fetched 2026-10-24)

> Third, all InnoDB row formats can store certain kinds of data in overflow pages, so the maximum row size of an InnoDB table can be larger than the maximum amount of data that can be stored in the row's main data page.

> Some row formats can store more data in overflow pages than others. For example, the DYNAMIC and COMPRESSED row formats can store the most data in overflow pages.

Contents: InnoDB's own overflow-page mechanism as the comparison point to Postgres's TOAST, both solving the same fixed-page-size problem differently.
