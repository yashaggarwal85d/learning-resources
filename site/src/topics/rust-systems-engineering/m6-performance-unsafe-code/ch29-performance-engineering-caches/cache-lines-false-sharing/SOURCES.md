# Sources — Cache lines and false sharing

## `CachePadded` — crossbeam_utils Documentation
URL: https://docs.rs/crossbeam-utils/latest/crossbeam_utils/struct.CachePadded.html
Fetched: 2026-10-24, cached at `sources/crossbeam-cachepadded.txt`.
> Pads and aligns a value to the length of a cache line.

> In concurrent programming, sometimes it is desirable to make sure commonly accessed pieces of
data are not placed into the same cache line. Updating an atomic value invalidates the whole
cache line it belongs to, which makes the next access to the same cache line slower for other
CPU cores.

## False sharing — Wikipedia
URL: https://en.wikipedia.org/wiki/False_sharing
Fetched: 2026-10-24, cached at `sources/false-sharing-wikipedia.txt`.
> By far the most common usage of this term is in modern multiprocessor CPU caches, where memory is cached in lines of some small power of two word size (e.g., 64 aligned, contiguous bytes).

> If two processors operate on independent data in the same memory address region storable in a single line, the cache coherency mechanisms in the system may force the whole line across the bus or interconnect with every data write, forcing memory stalls in addition to wasting system bandwidth.

> false sharing in CPU caches can be prevented by reordering variables or adding padding (unused bytes) between variables.
