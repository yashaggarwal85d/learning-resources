# Sources — File descriptors and I/O safety

## `std::os::fd` module docs

URL: https://doc.rust-lang.org/std/os/fd/index.html
Fetched: 2026-10-23, cached at `sources/os-fd.txt`.

> Owned and borrowed Unix-like file descriptors.

## `OwnedFd` docs

URL: https://doc.rust-lang.org/std/os/fd/struct.OwnedFd.html
Fetched: 2026-10-23, cached at `sources/owned-fd.txt`.

> This closes the file descriptor on drop. It is guaranteed that nobody else will close the file descriptor.

> Creates a new OwnedFd instance that shares the same underlying file description as the existing OwnedFd instance.

## `BorrowedFd` docs

URL: https://doc.rust-lang.org/std/os/fd/struct.BorrowedFd.html
Fetched: 2026-10-23, cached at `sources/borrowed-fd.txt`.

> This has a lifetime parameter to tie it to the lifetime of something that owns the file descriptor. For the duration of that lifetime, it is guaranteed that nobody will close the file descriptor.

## `AsFd` docs

URL: https://doc.rust-lang.org/std/os/fd/trait.AsFd.html
Fetched: 2026-10-23, cached at `sources/as-fd.txt`.

> A trait to borrow the file descriptor from an underlying object.

## `dup(2)` man page

URL: https://man7.org/linux/man-pages/man2/dup.2.html
Fetched: 2026-10-23, cached at `sources/dup-2.txt`.

> The dup() system call allocates a new file descriptor that refers to the same open file description as the descriptor oldfd.

> Since the two file descriptors refer to the same open file description, they share file offset and file status flags; for example, if the file offset is modified by using lseek(2) on one of the file descriptors, the offset is also changed for the other file descriptor.

> The two file descriptors do not share file descriptor flags (the close-on-exec flag).

## `open(2)` man page

URL: https://man7.org/linux/man-pages/man2/open.2.html
Fetched: 2026-10-23, cached at `sources/open-2.txt`.

> Note that the use of this flag is essential in some multithreaded programs, because using a separate fcntl(2) F_SETFD operation to set the FD_CLOEXEC flag does not suffice to avoid race conditions where one thread opens a file descriptor and attempts to set its close-on-exec flag using fcntl(2) at the same time as another thread does a fork(2) plus execve(2).

## `getrlimit(2)` man page

URL: https://man7.org/linux/man-pages/man2/getrlimit.2.html
Fetched: 2026-10-23, cached at `sources/getrlimit-2.txt`.

> This specifies a value one greater than the maximum file descriptor number that can be opened by this process.
