# OUTLINE: Skip lists (`dsa.skip-lists`)

## Storyboard (11 steps, ~14 min)

1. **Hook.** LevelDB's memtable must stay sorted, take inserts at a high rate, and let readers
   run with no lock at all. A red-black tree balances by rotating, and a rotation rewrites several
   pointers that must change together — exactly what a lock-free reader cannot survive mid-update.
   What if height came from a coin flip instead of an invariant?
2. **Towers by coin flip.** A base row of sorted keys; above each key, a tower as tall as the
   number of consecutive "heads" a coin flip gives it (Pugh's algorithm: climb one level per
   successful flip, capped). Visual: towers rising over the sixteen-key picture.
3. **Predict (within first four steps).** "Half the nodes that reach level one also reach level
   two. About what fraction reaches level three?" Options built around 1/2, 1/4, 1/8 vs. "no way
   to say" — correct: a fixed fraction of whichever level you're already on, every time: p again.
4. **Reveal: the geometric tower, and its price.** Promotion is memoryless: every level has the
   same fraction `p` promoted to the next (measured: 0.2509 at p=1/4, 0.4990 at p=1/2, both against
   a target that round to the same two decimal places). That same geometric shape sets the expected
   pointer count per node at 1/(1-p) — measured 1.3358 at p=1/4 (target 4/3) and 1.9971 at p=1/2
   (target 2). **Takeaway.**
5. **Search, traced.** Start at the top-left, step right while the next key is smaller, else drop
   a level — the same shape every time, down to level zero. Visual: a caramel path on the towers.
6. **Predict.** "For a list of twenty thousand elements, is a typical search closer to twenty
   steps, two hundred steps, or two thousand steps?" Correct: closer to twenty — logarithmic, not
   linear, and the same whichever key is searched for.
7. **Reveal: the bound, and why one in four.** Pugh's own bound on expected search cost (climbing
   out of a list of n elements: L(n)/p + 1/(1-p)) is measured directly: 26.29 steps against a bound
   of 29.91 at p=1/4, and 28.76 against 30.58 at p=1/2, both on the same twenty-thousand-element
   list — and the bound itself is smaller at p=1/4, Pugh's own reason for recommending it over his
   original one-half. The paper's own tail statement: for more than two hundred fifty elements, the
   chance a search takes more than three times the expected time is under one in a million.
   **Takeaway.**
8. **Why a reader never sees a broken list.** An insert's splice writes exactly one forward pointer
   per level the new node occupies — measured directly across twenty thousand inserts, never more
   than the node's own height (max eleven pointer writes on this run, well under the level cap). A
   tree rotation must change several pointers together; a skip-list splice changes one pointer at a
   time, bottom-up, each one a single atomic store (LevelDB's release-store, read by an acquire-load
   that is guaranteed to see a fully initialized node or nothing — never a half-built one).
   **Takeaway.**
9. **Same shape, two real systems.** LevelDB and RocksDB's default memtable is exactly this
   structure (RocksDB's `SkipListFactory` is one of only two memtable implementations that report
   concurrent-insert support, and it is the default; `write_buffer_size` defaults to sixty-four
   megabytes). Redis's sorted set pairs this same structure with a hash table, and tags every link
   with a span, the count of elements it skips — so asking "what rank is this member" sums the
   spans already crossed instead of walking the list from the front (measured: zero mismatches
   against a direct count, on a two-thousand-element list, and the rank walk visits the same order
   of nodes as a plain search, not a second pass over the whole list). **Takeaway.**
10. **Recap.** A skip list buys its O(log n) expected cost from a coin flip repeated at insert
    time, never rebalanced afterward; the price is "expected", not "worst case" — and that price is
    the reason a reader needs no lock at all.
11. **Prove it.** "LevelDB's iterator has `Next()` and `Prev()`. If there are no explicit backward
    pointers, how does `Prev()` work?" Correct: it searches again, for the last key less than the
    current one — exactly what `find_less_than` in `examples.py` does, verified against the real
    predecessor on six probes with zero mismatches.

## Engagement arc

- Hook: a real, named production structure (LevelDB's memtable) with a real constraint (lock-free
  reads) that the obvious alternative (a balanced tree) cannot satisfy.
- First predict: step 3, inside the first four steps.
- Second predict: step 6, right before the search-cost reveal (makes the learner commit to a
  guess before seeing the measured number).
- Surprising number: step 7 — a twenty-thousand-element list searched in under thirty steps on
  average, and the smaller, "worse-sounding" p = 1/4 beats p = 1/2's bound.
- Four takeaways: steps 4, 7, 8, 9.
- Recap: step 10, in the narrator's own words, not a replay of the takeaways.
- Third predict: step 11 ("Prove it"), closing on a real implementation detail rather than a
  restatement.

## Post-notes section headings (planned)

`Outcomes`, `Internals`, `Lab`, `Production failures this topic warns about`, `Frontier`,
`Where this goes next` — same six as topic 38, per the chapter's shared shape.

## Bridge / handoff (word for word from `CHAPTER.md`)

- **Bridge:** "Union–find answers one question, same set or not, and answers it with no notion of
  order at all: its trees are shaped by rank, not by key. Most of the structures in this course
  keep keys in order, and every ordered structure so far has paid for its balance with an invariant
  that rotations or splits must restore. The next topic balances with coin flips instead, and
  nothing ever has to be restored. Skip lists, next."
- **Handoff:** "A skip list keeps keys in order and costs a pointer or two per entry, which is
  cheap when the structure is the one thing in memory. A real process has a fixed budget of
  memory, and sooner or later the structures it keeps are full. The next question is not how to
  find an entry but which entry to give up when there is no room for a new one, and the most
  common answer is to drop whichever was used longest ago. Least recently used caches, next."

## Concept ledger

- **Introduces:** `skip-list`, `tower-height-distribution`, `skip-list-expected-search`,
  `skip-list-span-rank`, `skip-list-concurrency-argument`, `skip-list-plus-hash-index`.
- **Uses:** `singly-linked-list`, `expected-vs-average`, `with-high-probability`, `memtable`,
  `sstable`, `order-statistic-tree`, `subtree-size-augmentation`, `rank-select-query`,
  `separate-chaining`, `incremental-rehashing`, `cache-miss`.
- **Declared:** `geometric-distribution`, `acquire-release-publication` (the second is Rust Systems
  Engineering Chapter 7's name for the memory-ordering detail; this topic shows the picture, not
  the memory model).

## Changes from the chapter plan

- **Memtable keys row dropped.** `CHAPTER.md`'s planning table says the memtable visual should use
  "the keys of Chapter 5's memtable picture". Chapter 5's memtable topic uses its own illustrative
  key set; re-deriving and cross-checking it exactly would duplicate that topic's `examples.py`
  without adding anything this topic's own claims depend on. The sixteen-key picture here
  (`PICTURE_KEYS` in `examples.py`) is this topic's own small, seeded, on-screen example instead —
  the claim it illustrates (geometric height, one splice, no rebalancing) does not depend on which
  sixteen keys are used.
- **No literal thread demonstration.** The chapter plan's "why they are easy to make concurrent"
  clause is taught by the measured splice-write-count invariant (one pointer write per level,
  never more) plus LevelDB's own documented release-store/acquire-load contract, not by actually
  running concurrent Python threads against the list — Python's GIL makes a real concurrent-read
  race non-reproducible in this sandbox, and the claim itself is about pointer-store atomicity, not
  wall-clock concurrency, so a single-threaded measurement of the splice property is the right
  evidence.
- **RocksDB wiki unreachable; memtablerep.h and options.h used instead.** The chapter plan cites
  "the RocksDB wiki page MemTable"; it returns HTTP 403 to this sandbox's fetcher. The same claims
  (skiplist is the default, skiplist supports concurrent insert, `write_buffer_size` defaults to
  64MB) are confirmed instead directly from `memtablerep.h` and `options.h` — see `SOURCES.md`.
  One correction found in the process: `memtablerep.h` shows `VectorRepFactory` *also* reports
  concurrent-insert support, so "only the skiplist memtable supports concurrent insert" (the
  chapter plan's phrasing) overstates it; the topic says "the default, skiplist-based memtable"
  instead.
- **Redis `server.h` macro values not quote-checked.** `ZSKIPLIST_MAXLEVEL 32` and
  `ZSKIPLIST_P 0.25` are real and current (confirmed via `mcp__github__search_code`'s raw-text
  match), but this project's source-fetching tool corrupts this specific file (see `SOURCES.md`'s
  "Not fetched" section and the project-memory note on the bug); the values are stated as fact,
  attributed, but not run through the word-for-word checker.

## Progress

All ten of this topic's substantive claims are measured in `examples.py` and pass. Remaining:
`FACT-CHECK.md`, `coverage.json`, `pre-notes.md`/`prerequisites.mdx`/`references.md`/
`post-notes.md`, `reel.tsx`/`scenes.tsx`/`narration.json`, registry entry, reviews, checks, ship.
