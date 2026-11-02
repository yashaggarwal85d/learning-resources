- **Cache.** A smaller, faster place to keep a copy of something expensive to fetch again, so a
  later request can skip the expensive path.
- **Hit and miss.** A hit finds what it's looking for already in the cache; a miss doesn't, and
  pays the full cost of fetching it from wherever the cache is standing in for.
- **Eviction.** Making room in a full cache by throwing something out, chosen by whatever rule the
  cache follows.
- **Recency.** How long ago an entry was last touched — the signal "least recently used" is built
  entirely out of.
- **Doubly linked list (one line).** A chain of nodes where each one also points to the one before
  it, so a node can be removed or moved without walking the list to find its neighbours.
- **Hash map (one line).** A structure that finds a value from its key in a small, fixed number of
  steps on average, by computing where to look instead of searching for it.
- **Reference bit.** A single bit set when an entry is touched and cleared later by a sweep — a
  cheap, coarse stand-in for an exact "used most recently" timestamp.
- **Random sample.** Picking a few items at random from a larger set, instead of examining all of
  them, to make a decision that's good enough without the cost of being exact.

**Check yourself:** if a hit on an entry only reads its value and never moves it, does the cache
still know which entry to evict next time it's full? (Answer in the reel: step 3.)
