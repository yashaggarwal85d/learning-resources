# OUTLINE: LRU caches (`dsa.lru-caches`)

## Storyboard (10 steps, ~14 min)

1. **Hook.** A cache is full. Something has to go. The textbook answer: drop whichever entry was
   used longest ago. How do you find that entry in O(1), on every single access?
2. **Two structures, one answer.** A hash map for O(1) lookup, plus a doubly linked list in
   recency order (most recent at the head); the map's job is finding a node, the list's job is
   ordering nodes, and a node that already knows its own neighbours can be unlinked and relinked
   in O(1) — exactly the splice property Chapter 2's linked-list topic names.
3. **Predict (within first four steps).** "A hit on an entry doesn't just read it — it has to do
   something else too. What?" Correct: move it to the front of the list. A get is also a write.
4. **Reveal: O(1), measured directly.** Every get/put touches a small, fixed number of pointers —
   measured at capacity one hundred and again at capacity fifty thousand, same bound both times.
   **Takeaway.**
5. **The replay.** A hot set of keys reused over and over, capacity smaller than the hot set —
   trace it by hand on the twelve-access picture, then at scale.
6. **Predict.** "A hit under LRU costs a list reorder. What would make a hit cost less, at the
   price of losing some precision about exactly which entry was used most recently?" Correct:
   approximate the order instead of keeping it exact.
7. **Reveal: CLOCK, the lock-friendly approximation.** A reference bit per entry and a hand
   sweeping a circle; a hit costs one bit set, not a reorder — measured: CLOCK's miss ratio lands
   within a hair of exact LRU's on the same replay, for a cost per hit that never touches a
   pointer at all. **Takeaway.**
8. **Predict.** "What happens to a cache full of hot entries when one enormous one-time scan runs
   through it?" Correct: the scan evicts the hot entries, because recency alone can't tell "used
   once, forever" apart from "used constantly."
9. **Reveal, measured: a scan really does flush it.** The hit rate measured right after a scan is
   substantially lower than the same measurement with no scan in between, under both LRU and
   CLOCK — recency has no way to protect a working set from one pass through something bigger
   than the cache. Redis's own sampled approximation, named here as a third real point on the
   same spectrum (no ordered structure at all, just a few random candidates per eviction).
   **Takeaway.**
10. **Recap.** Hash map plus list gives O(1); CLOCK trades exact order for a cheaper hit; neither
    one survives a scan, which is next topic's whole subject.

(No "Prove it" step: this topic's scope ends at the point LRU and CLOCK both fail the same way;
the next topic — scan-resistant policies — is the direct answer, not a twist on this one, so the
chapter's own storyboard puts the predict at step 8 instead of a closing "Prove it".)

## Engagement arc

- Hook: a concrete, universal problem (a full cache) stated before any mechanism.
- First predict: step 3, inside the first four steps.
- Second predict: step 6, committing to a guess before CLOCK's reveal.
- Third predict: step 8, committing to a guess before the scan-damage reveal.
- Surprising number: step 9 — the measured hit-rate drop right after a scan, on the very
  structure that was performing well a moment before.
- Three takeaways: steps 4, 7, 9.
- Recap: step 10, in the narrator's own words, pointing directly at next topic's subject.

## Post-notes section headings (planned)

`Outcomes`, `Internals`, `Lab`, `Production failures this topic warns about`, `Frontier`,
`Where this goes next` — same six as topics 38 and 39.

## Bridge / handoff (word for word from `CHAPTER.md`)

- **Bridge:** "A skip list keeps keys in order and costs a pointer or two per entry, which is
  cheap when the structure is the one thing in memory. A real process has a fixed budget of
  memory, and sooner or later the structures it keeps are full. The next question is not how to
  find an entry but which entry to give up when there is no room for a new one, and the most
  common answer is to drop whichever was used longest ago. Least recently used caches, next."
- **Handoff (from `CHAPTER.md` topic 40):** a cache that is full and must decide which entry to
  give up; LRU is O(1) and textbook, until one scan larger than the cache throws out everything
  that mattered — the exact problem the scan-resistant topic answers.

## Concept ledger

- **Introduces:** `lru-cache`, `hash-map-doubly-linked-list`, `clock-reference-bit`,
  `sampled-lru`, `miss-ratio-trace-replay`.
- **Uses:** `doubly-linked-list`, `splice-operation`, `stable-addresses`, `circular-list`,
  `separate-chaining`, `bucket`, `cache-miss`, `expected-vs-average`.
- **Declared:** none.

## Changes from the chapter plan

- **The public cache trace (CDN/block-I/O) is named, not replayed in the reel.** `CHAPTER.md`'s
  shared notation says the builder "names the trace, checks its availability and licence at
  research time, records the scale actually replayed, and keeps it to topics 40–41's post-notes
  lab, not the reel." Checked: no small, freely licensed public cache trace was found that this
  sandbox could download and replay inside a reasonable time budget this session (most well-known
  ones, e.g. the UMass or SNIA traces, require registration or are hosted behind forms not
  reachable by this sandbox's fetcher). `post-notes.md`'s Lab section says this plainly instead of
  asserting a trace was used when it wasn't; the reel's own synthetic trace (seeded, with real
  temporal locality, documented in `examples.py`) carries every on-screen claim instead.
- **A genuinely locality-aware synthetic trace, not i.i.d. uniform.** The first version of
  `examples.py`'s hot-set trace drew keys uniformly at random (`rng.choices`), which carries no
  recency signal at all — every eviction policy converged to the same miss ratio on it, which is
  correct but doesn't teach anything. Replaced with a trace that revisits one of the last eighty
  distinct keys with probability 0.85 (and a fresh uniform draw otherwise), which gives LRU and
  CLOCK a real pattern to exploit and sampled LRU something to measurably do worse on.
- **A real bug found and fixed in the scan-effect measurement.** The first version of the
  "does a scan flush the cache" measurement for CLOCK never reinserted a missed key during the
  cooldown-measurement loop, so its "hit rate after a scan" was fixed at exactly zero regardless
  of input — not a real result. Fixed, and additionally replaced the original full-cooldown
  measurement (which self-warms over thousands of accesses and washes out the scan's effect
  entirely) with a short post-scan probe compared against the same probe with no scan, which is
  what actually isolates the damage. See `FACT-CHECK.md`'s red team section.

## Progress

All of this topic's measured claims pass in `examples.py`. Remaining: `FACT-CHECK.md`,
`coverage.json`, `pre-notes.md`/`prerequisites.mdx`/`references.md`/`post-notes.md`,
`reel.tsx`/`scenes.tsx`/`narration.json`, registry entry, reviews, checks, ship.
