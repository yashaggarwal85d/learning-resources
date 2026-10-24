# Sources — Self-describing page formats

## PostgreSQL: Database Page Layout

URL: https://www.postgresql.org/docs/current/storage-page-layout.html
Fetched: 2026-10-24, cached at `sources/pg-page-layout.txt`.

> The first field tracks the most recent WAL entry related to this page. The second field contains the page checksum if data checksums are enabled.

> The next 2 bytes of the page header, pd_pagesize_version, store both the page size and a version indicator.

> Because an item identifier is never moved until it is freed, its index can be used on a long-term basis to reference an item, even when the item itself is moved around on the page to compact free space.

> In fact, every pointer to an item (ItemPointer, also known as CTID) created by PostgreSQL consists of a page number and the index of an item identifier.

## `crc32c`

URL: https://docs.rs/crc32c/latest/crc32c/index.html
Fetched: 2026-10-24, cached at `sources/crc32c.txt`.

> This crate provides the CRC-32-Castagnoli algorithm.

> Computes the CRC for the data payload.
