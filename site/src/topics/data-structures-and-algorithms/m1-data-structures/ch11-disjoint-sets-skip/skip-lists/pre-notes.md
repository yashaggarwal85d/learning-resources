- **Sorted linked list.** A chain of nodes, each pointing to the next, kept in key order. Finding
  anything means walking from the front — O(n) per search, no matter how it's organized above it.
- **Geometric distribution.** The number of coin flips until the first "tails" (or, here, until the
  first flip that fails to promote a node another level). Most trials are short; a long run is
  rare but not impossible, and the chance of any particular length halves (or quarters) each step.
- **Expected value.** The average outcome over many repetitions of a random process — not a
  guarantee about any one run, but a number that real, repeated runs converge toward.
- **Comparison cost.** How many times a search has to compare a key against the list before it
  finds (or fails to find) what it's looking for — the thing a search's "cost" usually means here.
- **Pointer.** A stored reference to another node in memory; following one is one step of work,
  whether the structure is a list, a tree, or a skip list's tower.
- **Memtable (one line).** The in-memory structure a storage engine writes new entries into before
  they're flushed to disk, which this chapter's Chapter 5 topic introduced; it needs to stay sorted
  and needs readers to be able to run while a writer inserts.
- **Release/acquire, in one line.** A release-store publishes everything written before it; a
  matching acquire-load is guaranteed to see that published state, never a half-written version of
  it. This topic shows the picture; the full memory-model mechanics are a different track's topic.

**Check yourself:** if a coin-flip process stops climbing a tower with probability 1 - p at every
level, what's the probability a tower reaches exactly level 3 (climbs past levels 1 and 2, then
stops)? (Answer in the reel: step 4.)
