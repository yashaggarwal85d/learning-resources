## Skip Lists: A Probabilistic Alternative to Balanced Trees

URL: https://www.cl.cam.ac.uk/teaching/2005/Algorithms/skiplists.pdf
Version: William Pugh, Communications of the ACM 33(6), June 1990, pp. 668–676 (course-hosted PDF of the paper)

> It is very unlikely a skip list data structure will
> be significantly unbalanced (e.g., for a dictionary of more
> than 250 elements, the chance that a search will take more
> than 3 times the expected time is less than one in a million).

> Initially, we discussed a probability distribution where half of
> the nodes that have level i pointers also have level i+1 pointers. To get away from magic constants, we say that a fraction
> p of the nodes with level i pointers also have level i+1 pointers. (for our original discussion, p = 1/2).

> We can calculate the expected maximum level is at most
> L(n) + 1/(1–p).

> Since some of the constant overheads are related to L(n) (rather than L(n)/p), choosing p = 1/4 (rather than
> 1/2) slightly improves the constant factors of the speed of the
> algorithms as well. I suggest that a value of 1/4 be used for p

> If we use the standard algorithm and start our search at
> level 14, we will do a lot of useless work.

Contents: dictionary/ordered-list background, the skip-list definition and search/insert/delete algorithms, the derivation of L(n) = log_{1/p} n, the expected search-cost analysis, the tail-probability result, the p = 1/4 recommendation, and a discussion of related work.

## LevelDB `db/skiplist.h`

URL: https://raw.githubusercontent.com/google/leveldb/main/db/skiplist.h
Version: `main` branch, fetched 2026-10-31

> // Writes require external synchronization, most likely a mutex.
> // Reads require a guarantee that the SkipList will not be destroyed
> // while the read is in progress. Apart from that, reads progress
> // without any internal locking or synchronization.

> The contents of a Node except for the next/prev pointers are
> // immutable after the Node has been linked into the SkipList.
> // Only Insert() modifies the list, and it is careful to initialize
> // a node and use release-stores to publish the nodes in one or
> // more lists.

> // Use an 'acquire load' so that we observe a fully initialized
> // version of the returned Node.

> // Use a 'release store' so that anybody who reads through this
> // pointer observes a fully initialized version of the inserted node.

> // Instead of using explicit "prev" links, we just search for the
> // last node that falls before key.

Contents: the class's thread-safety contract and invariants, the templated `SkipList` interface, the `Node` link accessors with their memory-order barriers, and the iterator's `Next`/`Prev`/`Seek` methods.

## Redis sorted sets

URL: https://redis.io/docs/latest/develop/data-types/sorted-sets/
Version: fetched 2026-10-31

> Sorted sets are implemented via a
> dual-ported data structure containing both a skip list and a hash table, so
> every time we add an element Redis performs an O(log(N)) operation. That's
> good, so when we ask for sorted elements, Redis does not have to do any work at
> all, it's already sorted.

Contents: the sorted-set data type, `ZADD`/`ZRANGE`/`ZRANK` and related commands, and the implementation note on the skip-list-plus-hash-table design.

## Redis `src/t_zset.c`

URL: https://raw.githubusercontent.com/redis/redis/unstable/src/t_zset.c
Version: `unstable` branch, fetched 2026-10-31

> Returns a random level for the new skiplist node we are going to create.
> * The return value of this function is between 1 and ZSKIPLIST_MAXLEVEL
> * (both inclusive), with a powerlaw-alike distribution where higher
> * levels are less likely to be returned.

> store rank that is crossed to reach the insert position

Contents: `zslCreateNode`/`zslInsert`/`zslDeleteNode`, `zslRandomLevel`, and the rank-tracking (`span`) logic used by `ZRANK`.

## RocksDB `include/rocksdb/memtablerep.h`

URL: https://raw.githubusercontent.com/facebook/rocksdb/main/include/rocksdb/memtablerep.h
Version: `main` branch, fetched 2026-10-31

> // Return true if the current MemTableRep supports concurrent inserts
> // Default: false

Contents: the abstract `MemTableRep`/`MemTableRepFactory` interface, `IsInsertConcurrentlySupported()` and its per-implementation overrides, and the `SkipListFactory`/`VectorRepFactory` declarations.

## RocksDB `include/rocksdb/options.h`

URL: https://raw.githubusercontent.com/facebook/rocksdb/main/include/rocksdb/options.h
Version: `main` branch, fetched 2026-10-31

> // Note that write_buffer_size is enforced per column family.

> // Default: 64MB

Contents: `ColumnFamilyOptions`/`DBOptions` fields including `write_buffer_size`, its default and per-column-family scope.

### Not fetched

- Tarjan and van Leeuwen-style ACM citations do not apply to this topic; no paywalled sources were needed.
- Redis `src/server.h` (`ZSKIPLIST_MAXLEVEL`/`ZSKIPLIST_P` macro definitions): the raw file fetches, but this project's `sources.mjs` treats any non-PDF fetch as HTML and strips everything between an unmatched `<` and a later `>` — in a C header full of bare comparisons and shift operators (`64 << 20`), this silently deletes large spans, including the `#define` block itself (confirmed: the surrounding `UNUSED(V)` macro, a few lines away in the real file, is also missing from the cached text). The values `ZSKIPLIST_MAXLEVEL 32` and `ZSKIPLIST_P 0.25` are confirmed instead from the file's real raw content via GitHub code search (`mcp__github__search_code`, 2026-10-31, `repo:redis/redis ZSKIPLIST_MAXLEVEL`, which returned the literal line `#define ZSKIPLIST_MAXLEVEL 32 /* Should be enough for 2^64 elements */` and `#define ZSKIPLIST_P 0.25 /* Skiplist P = 1/4 */`), not run through `sources.mjs check` since that would re-fetch the same corrupted text. Recorded as a tool gotcha in project memory (`learning-resources-sources-mjs-c-header-mangling`).
- RocksDB's wiki page "MemTable" (`github.com/facebook/rocksdb/wiki/MemTable`) returns HTTP 403 to this sandbox's fetcher (GitHub wikis require a browser session for some requests). The two claims it would have sourced — the skiplist memtable's default-ness and its concurrent-insert support — are instead confirmed directly from `memtablerep.h` (`IsInsertConcurrentlySupported()` returns `true` for both `SkipListFactory` and `VectorRepFactory`, `false` by default for any other `MemTableRep`) and `options.h` (`write_buffer_size`'s 64MB default). Note: `memtablerep.h` shows `VectorRepFactory` also reports concurrent-insert support, so the skiplist memtable is not the *only* one that does — the reel's claim is softened to "the default, skiplist-based memtable" rather than "the only memtable that supports concurrent insert."
