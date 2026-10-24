# Sources — fsync semantics and failure modes

## `fsync(2)` man page

URL: https://man7.org/linux/man-pages/man2/fsync.2.html
Fetched: 2026-10-23, cached at `sources/fsync-2.txt`.

> fsync() transfers ("flushes") all modified in-core data of (i.e., modified buffer cache pages for) the file referred to by the file descriptor fd to the disk device (or other permanent storage device) so that all changed information can be retrieved even if the system crashes or is rebooted.

> Calling fsync() does not necessarily ensure that the entry in the directory containing the file has also reached disk. For that an explicit fsync() on a file descriptor for the directory is also needed.

> fdatasync() is similar to fsync(), but does not flush modified metadata unless that metadata is needed in order to allow a subsequent data retrieval to be correctly handled.

## `std::fs::File` docs

URL: https://doc.rust-lang.org/std/fs/struct.File.html
Fetched: 2026-10-23, cached at `sources/file-sync.txt`.

> Attempts to sync all OS-internal file content and metadata to disk.

> This function is similar to sync_all, except that it might not synchronize file metadata to the filesystem.

## Rebello, Patel, Alagappan, Gunawi & Suresh, "Can Applications Recover from fsync Failures?" (USENIX ATC 2020)

URL: https://www.usenix.org/system/files/atc20-rebello.pdf
Fetched: 2026-10-23, cached at `sources/rebello-atc2020.txt`.

> all three file systems mark pages clean after fsync fails, rendering techniques such as application-level retry ineffective.

> when PostgreSQL retried the fsync a second time, there were no dirty pages for the file system to write, resulting in the second fsync succeeding without actually writing data to disk.

> developers changed PostgreSQL to respond to the fsync error by crashing and restarting without retrying the fsync.

## `pwritev2(2)` man page (`RWF_ATOMIC`)

URL: https://man7.org/linux/man-pages/man2/pwritev2.2.html
Fetched: 2026-10-23, cached at `sources/pwritev2-2.txt`.

> write protection means that for a power or any other hardware failure, all or none of the data from the write will be stored, but never a mix of old and new data.

> write protection only works with O_DIRECT flag, that is, buffered writes are not supported.
