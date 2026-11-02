# References

Last verified against each source listed below on 31 October 2026.

- William Pugh, "Skip Lists: A Probabilistic Alternative to Balanced Trees", *Communications of
  the ACM* 33(6), June 1990, pp. 668–676. https://www.cl.cam.ac.uk/teaching/2005/Algorithms/skiplists.pdf
- LevelDB, `db/skiplist.h`. https://raw.githubusercontent.com/google/leveldb/main/db/skiplist.h
- Redis documentation, "Redis sorted sets". https://redis.io/docs/latest/develop/data-types/sorted-sets/
- Redis, `src/t_zset.c`. https://raw.githubusercontent.com/redis/redis/unstable/src/t_zset.c
- Redis, `src/server.h` (the `ZSKIPLIST_MAXLEVEL`/`ZSKIPLIST_P` macros; confirmed via GitHub code
  search, not this project's own fetch-and-check pipeline — see `SOURCES.md`).
  https://raw.githubusercontent.com/redis/redis/unstable/src/server.h
- RocksDB, `include/rocksdb/memtablerep.h`. https://raw.githubusercontent.com/facebook/rocksdb/main/include/rocksdb/memtablerep.h
- RocksDB, `include/rocksdb/options.h`. https://raw.githubusercontent.com/facebook/rocksdb/main/include/rocksdb/options.h

Found an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new).
