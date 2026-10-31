<section data-section="outcomes">

## Outcomes

- Build a skip list with seeded coin-flip levels and show its height histogram and expected
  pointer count per node at p = 1/4 and p = 1/2.
- State the expected search-cost bound with its constants, say what "expected" ranges over (the
  coin flips, not the input), and measure a real search's average cost against that bound.
- Explain why an insert is safe for a lock-free reader (one pointer store per level, bottom-up)
  and where that exact structure is used today: LevelDB/RocksDB's memtable, Redis's sorted set.

</section>

<section data-section="internals">

## Internals

A node's height is not decided in advance and never changes: `_random_level` in `examples.py`
climbs one level per successful coin flip, capped, exactly as Pugh's Figure 5 algorithm does. That
single rule produces every property this topic measures. The fraction of nodes that are promoted
from level *i* to level *i+1* is always *p*, regardless of *i* — a memoryless process, the same
geometric shape at every level. Summed across all levels, that gives an expected pointer count of
1/(1-p) per node: a skip list spends more memory than a plain linked list, but the spending is
small and predictable (1.34 pointers per node at p=1/4, 2.00 at p=1/2, both measured).

Pugh's own derivation of the expected search cost climbs the search path backwards: from the
bottom of the climb to level *L(n) = log_{1/p} n*, the expected number of leftward movements is
bounded by *L(n)/p*; from *L(n)* up to the list's actual maximum level, a separate argument adds at
most *1/(1-p)* more. The two pieces together give the bound measured in this topic: at *n* =
20,000, 29.91 steps at p=1/4 and 30.58 at p=1/2 — and the real average search, measured the same
way, comes in under both (26.29 and 28.76). The paper's own further result — that for more than 250
elements, a search longer than three times its expected cost happens less than one time in a
million — is a *tail* bound, a different and stronger claim than the *average* bound this topic's
script measures; `FACT-CHECK.md` keeps the two separate rather than treating one as proof of the
other.

The reason any of this helps a concurrent reader is a property of the *insert*, not of the search:
every insert's splice writes exactly one forward pointer per level the new node occupies — this
topic measured that directly across 20,000 inserts and found the count always equal to the new
node's own height, never more, regardless of how large the list already is. A tree rotation, by
contrast, must change several pointers together to keep the tree's shape invariant; there is no way
to make that update "one pointer at a time" without a moment where the tree is inconsistent.
LevelDB's own header comment states the resulting contract word for word: writes need external
synchronization, but reads need no lock at all beyond "the list isn't destroyed mid-read" — and the
mechanism that makes a half-built node invisible to a concurrent reader is a release-store paired
with an acquire-load, a hardware/compiler-level ordering guarantee, not something this topic's
pure-Python measurement can itself demonstrate (see `FACT-CHECK.md`'s red team #4).

</section>

<section data-section="lab">

## Lab

`examples.py` doubles as this topic's lab: a 200,000-node seeded run for the height-distribution
measurements, and a 20,000-key seeded skip list (built once, searched for every key) for the
search-cost measurement, both finishing in under a second in this sandbox — no scaled-down
approximation was needed here, unlike topic 38's union-find lab. The rank-via-span measurement
builds a separate 2,000-key list and checks every probed rank against a direct count from the
front; the splice-write measurement re-inserts 20,000 keys into a fresh list and records every
single insert's (height, pointer-writes-this-insert) pair, asserting the two are always equal.

</section>

<section data-section="production">

## Production failures this topic warns about

A hand-rolled "optimization" that reuses a node across inserts, or that writes a node's own forward
pointers *before* splicing it in (instead of after, as `examples.py`'s `insert` does — build the new
node fully, then publish it into each level) breaks exactly the guarantee LevelDB's comment
describes: a reader could observe a node whose own pointers aren't set yet. The fix is ordering, not
locking: always finish constructing a node before any other node points to it, and always use the
ordered store/load pair your language provides (Python's GIL hides this bug in a way C++ and Rust
will not). A second, unrelated failure mode: choosing p close to 1 "to save memory" collapses the
skip list toward a plain sorted linked list (very few nodes get promoted at all), losing the
O(log n) search property this topic measured — the height histogram this topic built is exactly the
tool for noticing that regression before it reaches production.

</section>

<section data-section="frontier">

## Frontier

Lock-free *multi-writer* skip lists (marked deletion pointers, CAS-based bottom-up insertion; Java's
`ConcurrentSkipListMap`, RocksDB's own concurrent memtable inserts) are named in the syllabus as
Chapter 14's *(skipped)* "Concurrent skip lists" topic — this topic's claim is one writer, any
number of readers, which is a strictly easier problem than multiple writers racing each other.

</section>

<section data-section="where-next">

## Where this goes next

A skip list keeps keys in order at a pointer or two of memory per entry — cheap, as long as the
structure itself is the only thing competing for memory. Real processes don't get that luxury: a
process has a fixed memory budget, and sooner or later every structure it keeps is full. The next
topic asks a different question: not how to find an entry, but which one to give up when there's no
room for a new one. Least recently used caches, next.

</section>
