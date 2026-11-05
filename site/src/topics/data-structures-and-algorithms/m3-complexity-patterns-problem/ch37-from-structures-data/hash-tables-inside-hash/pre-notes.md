# Pre-notes — Hash tables inside hash joins

- **Equi-join:** a join whose condition is equality on a key, the shape a hash join answers.
- **Build side and probe side:** the smaller relation is loaded into a hash table (build); the
  larger relation streams past it, one lookup per row (probe), and is never stored.
- **Hash value:** the 32-bit number a hash function returns for a key; this topic's join keeps
  it on every stored tuple instead of recomputing it later.
- **Bucket:** one slot of the hash table's array, found from part of the hash value.
- **Batch:** one partition of the whole join, found from a different part of the same hash
  value, used when the build side does not fit in memory at once.
- **Temporary file (spill):** where rows for a batch other than the one in memory are written
  until that batch's turn comes.
- **Memory budget (work-mem budget):** the amount of memory the executor allows the hash table
  before it must spill or grow the batch count.
- **Bloom filter:** a fixed-size bit array that can say "definitely not present" for certain and
  "maybe present" with a known false-positive rate; a false positive costs a wasted probe.
