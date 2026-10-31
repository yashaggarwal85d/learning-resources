## CPython `Lib/functools.py`

URL: https://raw.githubusercontent.com/python/cpython/main/Lib/functools.py
Version: `main` branch, fetched 2026-10-31

> Least-recently-used cache decorator.

> The internals of the lru_cache are encapsulated for thread safety and
> # to allow the implementation to change (including a possible C version).

> View the cache statistics named tuple (hits, misses, maxsize, currsize)
> with f.cache_info(). Clear the cache and statistics with
> f.cache_clear(). Access the underlying function with f.__wrapped__.

Contents: the `lru_cache` decorator's docstring, its thread-safety note, and its public
`cache_info`/`cache_clear`/`__wrapped__` surface.

## Java SE 21 `LinkedHashMap`

URL: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedHashMap.html
Version: Java SE 21 & JDK 21, fetched 2026-10-31

> A special constructor is
> provided to create a linked hash map whose encounter order is the order
> in which its entries were last accessed, from least-recently accessed to
> most-recently (access-order). This kind of map is well-suited to
> building LRU caches.

> The removeEldestEntry(Map.Entry) method may be overridden to
> impose a policy for removing stale mappings automatically when new mappings
> are added to the map.

> Sample use: this override will allow the map to grow up to 100
> entries and then delete the eldest entry each time a new entry is
> added, maintaining a steady state of 100 entries.

> This implementation merely returns false (so that this
> map acts like a normal map - the eldest element is never removed).

Contents: `LinkedHashMap`'s access-order constructor, its iteration-order contract, and the
`removeEldestEntry` hook with its sample override.

## OSTEP, Chapter 22: Beyond Physical Memory: Policies

URL: https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf
Version: Arpaci-Dusseau, *Operating Systems: Three Easy Pieces*, fetched 2026-10-31

> How does the OS employ the use bit to approximate LRU? Well, there
> could be a lot of ways, but with the clock algorithm [C69], one simple
> approach was suggested. Imagine all the pages of the system arranged in
> a circular list. A clock hand points to some particular page to begin with
> (it doesn't really matter which). When a replacement must occur, the OS
> checks if the currently-pointed to page P has a use bit of 1 or 0. If 1, this
> implies that page P was recently used and thus is not a good candidate
> for replacement. Thus, the use bit for P is set to 0 (cleared), and the clock
> hand is incremented to the next page (P + 1). The algorithm continues
> until it finds a use bit that is set to 0, implying this page has not been
> recently used

> The clock algorithm of
> Corbato's was just one early approach which met with some success, and
> had the nice property of not repeatedly scanning through all of memory
> looking for an unused page.

Contents: why exact LRU is expensive, the use-bit/reference-bit idea, and the clock algorithm's
circular-sweep mechanics with its Corbato 1969 attribution.

## PostgreSQL `src/backend/storage/buffer/README`

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/storage/buffer/README
Version: `master` branch, fetched 2026-10-31

> To choose a victim buffer to recycle we use a simple clock-sweep algorithm.

> Each buffer header contains a usage counter, which is incremented (up to a
> small limit value) whenever the buffer is pinned.

> The "clock hand" is a buffer index, nextVictimBuffer, that moves circularly
> through all the available buffers.

> When running a query that needs to access a large number of pages just once,
> such as VACUUM or a large sequential scan, a different strategy is used.
> A page that has been touched only by such a scan is unlikely to be needed
> again soon, so instead of running the normal clock-sweep algorithm and
> blowing out the entire buffer cache, a small ring of buffers is allocated

> For sequential scans, a 256KB ring is used.

Contents: PostgreSQL's buffer-manager clock-sweep victim-selection algorithm and its buffer-ring
exception for sequential scans and VACUUM.

## Redis `src/evict.c`

URL: https://raw.githubusercontent.com/redis/redis/unstable/src/evict.c
Version: `unstable` branch, fetched 2026-10-31

> Redis uses an approximation of the LRU algorithm that runs in constant
> * memory. Every time there is a key to expire, we sample N keys (with
> * N very small, usually in around 5) to populate a pool of best keys to
> * evict of M keys (the pool size is defined by EVPOOL_SIZE).

Contents: the comment block above `evictionPoolAlloc`/`evictionPoolPopulate` describing Redis's
sampled-LRU approximation and its eviction-pool design.

## Redis documentation: Key eviction

URL: https://redis.io/docs/latest/develop/reference/eviction/
Version: fetched 2026-10-31

> The Redis LRU algorithm uses an approximation of the least recently used
> keys rather than calculating them exactly. It samples a small number of keys
> at random and then evicts the ones with the longest time since last access.

> (Redis Open Source only) You can tune the performance of the algorithm by changing the number of samples to check
> before every eviction with the maxmemory-samples configuration directive:

> maxmemory-samples 5

> As you can see Redis 3.0 does a better job with 5 samples compared to Redis 2.8, however most objects that are among the latest accessed are still retained by Redis 2.8. Using a sample size of 10 in Redis 3.0 the approximation is very close to the theoretical performance of Redis 3.0.

Contents: the approximated-LRU algorithm's description, the `maxmemory-samples` directive and its
default of 5, and the measured effect of raising the sample size to 10.

### Not fetched

- CPython's pure-Python `_lru_cache_wrapper` implementation (the doubly-linked-list splice code
  itself, with its `PREV`/`NEXT` sentinel-list mechanics) fetches, but this project's `sources.mjs`
  corrupts it the same way it corrupted Redis's `server.h` (see `SOURCES.md` in the `union-find`
  topic and project memory `learning-resources-sources-mjs-c-header-mangling`): the comparison
  `if maxsize < 0` pairs its `<` with an unrelated later `>`, deleting the entire function body
  between them. The quoted docstring and thread-safety comment (above) survive intact since they
  contain no `<`/`>`; the doubly-linked-list mechanics themselves are described from the actual
  CPython source read directly (not through this project's fetch-and-check pipeline) in
  `FACT-CHECK.md`, and the topic's own `examples.py` builds and measures that same mechanism from
  scratch rather than relying on a quote of CPython's version.
