# Pre-notes

Terms to know before this reel, per `CHAPTER.md`'s own list:

- **Read-write lock**: a lock with two modes — many threads may hold it for reading at once, but only one thread may hold it for writing, and no reader may hold it while a writer does.
- **Synchronized block**: a region of code guarded by a lock that is taken on entry and released on exit, so only one thread runs it at a time.
- **Volatile read**: a read that is guaranteed to see the most recently published value, never a stale cached copy.
- **Hash code**: the integer a key's hash function produces.
- **Bin**: the slot a hash code maps a key into, which may hold a chain of several keys.
- **Stripe (or shard)**: one of several independent parts a table is split into, each guarded by its own lock, so threads on different stripes never contend.
- **Poisson distribution**: the probability of exactly *k* items landing in one bin when items land independently at random, given the average number of items per bin.
- **Compare and swap** (from the previous topics): an atomic instruction that stores a new value only if the current value still matches what was expected.
- **Forwarding node** (introduced in this reel): a marker left at the head of a bin once its contents have been moved to a new table, telling a thread that arrives later where to look instead.
