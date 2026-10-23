# Sources — Buffered versus direct I/O

## `posix_fadvise(2)` man page

URL: https://man7.org/linux/man-pages/man2/posix_fadvise.2.html
Fetched: 2026-10-23, cached at `sources/posix-fadvise-2.txt`.

> The advice is not binding; it merely constitutes an expectation on behalf of the application.

> POSIX_FADV_DONTNEED attempts to free cached pages associated with the specified region.

> Any unwritten dirty pages will not be freed. If the application wishes to ensure that dirty pages will be released, it should call fsync(2) or fdatasync(2) first.

## `readahead(2)` man page

URL: https://man7.org/linux/man-pages/man2/readahead.2.html
Fetched: 2026-10-23, cached at `sources/readahead-2.txt`.

> readahead() initiates readahead on a file so that subsequent reads from that file will be satisfied from the cache, and not block on disk I/O

## `open(2)` man page

URL: https://man7.org/linux/man-pages/man2/open.2.html
Fetched: 2026-10-23, cached at `sources/open-2.txt`.

> Try to minimize cache effects of the I/O to and from this file. In general this will degrade performance, but it is useful in special situations, such as when applications do their own caching.

## Documentation for `/proc/sys/vm/` (The Linux Kernel documentation)

URL: https://docs.kernel.org/admin-guide/sysctl/vm.html
Fetched: 2026-10-23, cached at `sources/vm-sysctl.txt`.

> Contains, as a percentage of total available memory that contains free pages and reclaimable pages, the number of pages at which a process which is generating disk writes will itself start writing out dirty data.

## Concepts overview (The Linux Kernel documentation)

URL: https://docs.kernel.org/admin-guide/mm/concepts.html
Fetched: 2026-10-23, cached at `sources/mm-concepts.txt`.

> Whenever a file is read, the data is put into the page cache to avoid expensive disk access on the subsequent reads.
