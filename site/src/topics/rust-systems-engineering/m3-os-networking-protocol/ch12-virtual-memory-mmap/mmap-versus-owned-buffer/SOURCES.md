# Sources — mmap versus an owned buffer pool

## Crotty, Leis & Pavlo, "Are You Sure You Want to Use MMAP in Your Database Management System?" (CIDR 2022)

URL: https://www.cidrdb.org/cidr2022/papers/p13-crotty.pdf
Fetched: 2026-10-23, cached at `sources/cidr2022-paper.txt`.

> The core issue is that, due to transparent paging, the OS can flush a dirty page to secondary storage at any time, irrespective of whether the writing transaction has committed.

> accessing any page could result in an unexpected I/O stall because the DBMS cannot know whether the page is in memory.

> any code that interacts with mmap-backed memory can now produce a SIGBUS that the DBMS must deal with via cumbersome signal handlers.

> the OS has to issue an expensive inter-processor interrupt to flush them, which is called a TLB shootdown

> Your working set (or the entire database) fits in memory and the workload is read-only.

## `mmap(2)` man page

URL: https://man7.org/linux/man-pages/man2/mmap.2.html
Fetched: 2026-10-23, cached at `sources/mmap-2.txt`.

> Share this mapping. Updates to the mapping are visible to other processes mapping the same region, and (in the case of file-backed mappings) are carried through to the underlying file.

## `open(2)` man page

URL: https://man7.org/linux/man-pages/man2/open.2.html
Fetched: 2026-10-23, cached at `sources/open-2.txt`.

> Try to minimize cache effects of the I/O to and from this file. In general this will degrade performance, but it is useful in special situations, such as when applications do their own caching.

> In Linux 2.6.0, this was relaxed to the logical block size of the block device (typically 512 bytes).

## `memmap2::Mmap` docs

URL: https://docs.rs/memmap2/latest/memmap2/struct.Mmap.html
Fetched: 2026-10-23, cached at `sources/memmap2-mmap.txt`.

> All file-backed memory map constructors are marked unsafe because of the potential for Undefined Behavior (UB) using the map if the underlying file is subsequently modified, in or out of process.
