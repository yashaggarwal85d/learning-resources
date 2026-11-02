# REVIEW: Concurrent hash maps

## Pass 1 — content

- Every mechanism claim (CAS on an empty bin, lock-on-first-node, the Poisson table, the treeify/
  untreeify thresholds and their off-by-one, the forwarding-node resize, split-ordered doubling,
  dashmap's shard formula) is replayed and asserted in `examples.py`, not stated from memory of
  the source's prose. All assertions pass (`python3 examples.py`).
- No compiled benchmark is needed or built for this topic (see `OUTLINE.md`, "Why no compiled
  benchmark"): every outcome `CHAPTER.md` sets for topic 47 is a mechanism to trace, not a
  throughput curve to measure, unlike the previous topic.
- Research-stage findings resolved two "to verify" items from `CHAPTER.md`'s plan: the exact node
  that trips `TREEIFY_THRESHOLD` (confirmed: the eighth, since the source counts the newly
  inserted node before comparing `binCount >= TREEIFY_THRESHOLD`) and the untreeify condition on
  a resize split (confirmed: `lc <= UNTREEIFY_THRESHOLD`, not removal alone).
- One correction made during fact-checking: `SOURCES.md` originally quoted
  `MIN_TREEIFY_CAPACITY`'s declaration with an incorrect `private` modifier not present in the
  actual source; corrected after a direct `grep` of the raw fetched source confirmed only
  `DEFAULT_CONCURRENCY_LEVEL` among the four related constants is actually `private`.
- The source-mangling workaround used for the two previous topics (raw `curl` fetch + manual
  cache-file seeding, replicating `sources.mjs`'s own slug/hash naming) was needed again for
  `ConcurrentHashMap.java`'s Java generics and shift operators, plus a new sub-problem: the
  seeded file's literal javadoc `*`-continuation markers broke quote matching on line-wrapped
  quotes, since `norm()` collapses whitespace but not literal asterisks. Fixed by stripping
  javadoc comment markers from the seeded file before writing it to the cache path. Documented in
  `/tmp/claude/memory/team/silo/` for future topics hitting the same fetch pipeline.
- `sources.mjs check` passes: 30 quotes found word for word, 0 problems.

## Pass 2 — looks and mechanics

- `reel.tsx`: all thirteen steps use only spelled-out numbers in title/body/fig/takeaway; no
  literal digit appears anywhere outside `duration:` lines, so the digit-check has nothing to
  compare against (every number this topic needs on screen is small enough, or qualitative
  enough, to say in words — "eight nodes," "sixty-four bins," "sixteen threads").
- `coverage.json`: all four syllabus clauses are literal substrings of the syllabus scope
  (verified by concatenation: the four clauses plus their original punctuation reconstruct the
  scope line exactly); at least two primary sources mapped with items; an independent
  fourteen-item expert list; no open gap-review items.
- `narration.json`: ran `narration-teaches.mjs` — all thirteen steps pass description-overlap
  (under fifty percent) and longest-line (at or under fifty words). One VERBATIM flag on step
  five (a narration line matching the body text word for word) was caught and fixed by
  rewording the narration line to teach the same point differently rather than echo the caption.
- `prerequisites.mdx`: every linked title (Progress guarantees and linearizability, Bounded MPMC
  ring queues, Separate chaining, Resizing and incremental rehashing, Practical hash functions
  and HashDoS, Red-black trees, Skip lists) verified against `registry.ts` by exact grep match
  before use.
- No Playwright-specific scene-layout issues found in `scenes.tsx` this pass (reused the
  lessons from the previous two topics: font sizes at or above thirteen units throughout; no two
  adjacent small labels closer than roughly one hundred fifty pixels; the takeaway sits on step
  five, not the first non-predict step after hook+predict, following the pattern that already
  worked for both previous topics in this chapter).
