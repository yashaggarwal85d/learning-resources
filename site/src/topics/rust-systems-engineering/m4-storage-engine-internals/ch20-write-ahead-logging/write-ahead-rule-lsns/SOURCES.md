# Sources — Write-ahead rule and LSNs

## PostgreSQL: Write-Ahead Logging (WAL)
URL: https://www.postgresql.org/docs/current/wal-intro.html
Fetched: 2026-10-24, cached at `sources/wal-intro.txt`.
> changes to data files (where tables and indexes reside) must be written only after those changes have been logged, that is, after WAL records describing the changes have been flushed to permanent storage.

> any changes that have not been applied to the data pages can be redone from the WAL records.

## PostgreSQL: Reliability (Chapter 28.1)
URL: https://www.postgresql.org/docs/current/wal-reliability.html
Fetched: 2026-10-24, cached at `sources/wal-reliability.txt`.
> the process of writing could fail due to power loss at any time, meaning some of the 512-byte sectors were written while others were not. To guard against such failures, PostgreSQL periodically writes full page images to permanent WAL storage before modifying the actual page on disk.

> during crash recovery PostgreSQL can restore partially-written pages from WAL.
