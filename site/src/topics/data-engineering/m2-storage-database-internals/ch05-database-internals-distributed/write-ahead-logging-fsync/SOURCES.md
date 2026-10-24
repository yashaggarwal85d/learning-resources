## 30.6. WAL Internals

URL: https://www.postgresql.org/docs/16/wal-internals.html
Version: PostgreSQL 16

The LSN itself, in the engine's own words.

> The insert position is described by a Log Sequence Number (LSN) that is a byte offset into the WAL, increasing monotonically with each new record.

> Values can be compared to calculate the volume of WAL data that separates them, so they are used to measure the progress of replication and recovery.

## 20.5. Write Ahead Log

URL: https://www.postgresql.org/docs/16/runtime-config-wal.html
Version: PostgreSQL 16

`wal_sync_method`'s own options: fsync, fdatasync, and the `O_DSYNC`-based option.

> open_datasync (write WAL files with open() option O_DSYNC)

> fdatasync (call fdatasync() at each commit)

> fsync (call fsync() at each commit)

Group commit, as `commit_delay` actually implements it.

> Setting commit_delay adds a time delay before a WAL flush is initiated. This can improve group commit throughput by allowing a larger number of transactions to commit via a single WAL flush, if system load is high enough that additional transactions become ready to commit within the given interval.

Full-page writes, the torn-page defense.

> When this parameter is on, the PostgreSQL server writes the entire content of each disk page to WAL during the first modification of that page after a checkpoint. This is needed because a page write that is in process during an operating system crash might be only partially completed, leading to an on-disk page that contains a mix of old and new data.

> Storing the full page image guarantees that the page can be correctly restored, but at the price of increasing the amount of data that must be written to WAL.

## 30.1. Reliability

URL: https://www.postgresql.org/docs/16/wal-reliability.html
Version: PostgreSQL 16

A torn page, described directly.

> Disk platters are divided into sectors, commonly 512 bytes each. Every physical read or write operation processes a whole sector. When a write request arrives at the drive, it might be for some multiple of 512 bytes (PostgreSQL typically writes 8192 bytes, or 16 sectors, at a time), and the process of writing could fail due to power loss at any time, meaning some of the 512-byte sectors were written while others were not.

> To guard against such failures, PostgreSQL periodically writes full page images to permanent WAL storage before modifying the actual page on disk. By doing this, during crash recovery PostgreSQL can restore partially-written pages from WAL.

## Fsync Errors

URL: https://wiki.postgresql.org/wiki/Fsync_Errors
Version: PostgreSQL wiki, retrieved 2026-10-24

The 2018 fsyncgate lesson, and PostgreSQL's own fix.

> This article covers the current status, history, and OS and OS version differences relating to the circa 2018 fsync() reliability issues discussed on the PostgreSQL mailing list and elsewhere. It has sometimes been referred to as "fsyncgate 2018".

> As of this PostgreSQL 12 commit, PostgreSQL will now PANIC on fsync() failure. It was backpatched to PostgreSQL 11, 10, 9.6, 9.5 and 9.4.

> fsync() errors can be lost in various ways; also buffers are marked clean after errors, so retrying fsync() can falsely report success and the modified buffer can be thrown away at any time due to memory pressure

## InnoDB Doublewrite Buffer

URL: https://docs.w3cub.com/mariadb/innodb-doublewrite-buffer/
Version: mirrored MariaDB Knowledge Base content

InnoDB's own torn-page defense, a different mechanism for the identical problem.

> The InnoDB doublewrite buffer was implemented to recover from half-written pages. This can happen when there's a power failure while InnoDB is writing a page to disk.

> Whenever InnoDB flushes a page to disk, it is first written to the double write buffer. Only when the buffer is safely flushed to disk will InnoDB write the page to the final destination.
