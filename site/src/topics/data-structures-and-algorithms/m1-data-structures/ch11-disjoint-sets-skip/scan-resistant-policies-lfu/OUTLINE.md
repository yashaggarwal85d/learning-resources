# OUTLINE: Scan-resistant policies: LFU, 2Q, ARC, LIRS (`dsa.scan-resistant-policies-lfu`)

## Storyboard (12 steps, ~15 min)

1. **Hook.** The previous topic's own measured result: one scan larger than the cache flushed
   exact LRU and CLOCK alike, because recency alone can't tell "used once" from "used constantly."
   What if the cache remembered something besides recency?
2. **LFU: evict the least frequently used.** A hit count per key instead of a timestamp; a scan's
   pages, each touched once, lose to any hot page immediately. Scan survives.
3. **Predict (within first four steps).** "A rule that counts hits and never forgets has one
   obvious failure mode. What is it?" Correct: a page that was hot for a while stays "hot" by the
   count forever, even after it's never touched again.
4. **Reveal: decay, and Redis's real counter.** Periodically halve every count; Redis's own
   implementation (since 4.0) uses a tiny probabilistic counter, a few bits per key, that decays
   on a timer. **Takeaway.**
5. **2Q: the ghost list idea.** A short queue for first-time keys; if a key's identifier was
   recently pushed out, the *next* time it's seen, promote it to a real LRU list.
6. **Predict.** "A ghost list remembers that a key was recently evicted. What does a ghost entry
   actually have to store — the key's whole value, or something smaller?" Correct: only the
   identifier. It never holds data.
7. **Reveal: 2Q's own measured scan-resistance.** The scan's pages pass straight through the
   first-time queue and into the ghost list without ever reaching the protected LRU list — the
   hot set measured untouched afterward. **Takeaway.**
8. **ARC: self-tuning, predict.** "A hit on an identifier in a ghost list is a signal. What does
   it tell the cache?" Correct: the ghost list's *live* partner list was too small to hold it.
9. **Reveal: ARC adapts, by hand.** Walk a short hand trace: a ghost hit grows the target size of
   the partner list; no frequency counts, no tuning parameter set by a person, maintaining a
   directory of twice the cache's own size. **Takeaway.**
10. **LIRS: reuse distance.** Rank by how many *distinct* keys were touched since a key's last
    use, not by elapsed time; keep a small low-reuse-distance set resident no matter what else
    happens. Survives even a loop slightly larger than the cache, where LRU gets zero hits.
11. **The measured comparison.** All four policies' hit rate right after the same scan that
    flushed LRU and CLOCK, side by side with the two that didn't survive it.
12. **Recap.** Each policy remembers one more thing than plain recency — a count, a ghost, an
    adapted split, a distance — and each costs something extra for it. The cheapest thing any of
    them remembers is a ghost list holding nothing but an identifier. That same question, asked at
    a much larger scale, is its own data structure. Bloom filters, next.

## Engagement arc

- Hook: a direct callback to the previous topic's own measured failure, not a new setup.
- First predict: step 3, inside the first four steps.
- Second predict: step 6, a concrete "what does this cost" question.
- Third predict: step 8, committing to ARC's adaptation rule before the reveal.
- Surprising number: step 11 — all four policies hold their hit rate essentially flat through the
  same scan that cost LRU and CLOCK a double-digit drop (measured in `dsa.lru-caches`).
- Three takeaways: steps 4, 7, 9.
- Recap: step 12, in the narrator's own words, pointing directly at the next topic's subject.

## Post-notes section headings (planned)

`Outcomes`, `Internals`, `Lab`, `Production failures this topic warns about`, `Frontier`,
`Where this goes next` — same six as the previous three topics.

## Bridge / handoff (word for word from `CHAPTER.md`)

- **Bridge:** topic 40's own handoff ("Every variant in this topic answers the same question the
  same way… Scan-resistant policies, next.").
- **Handoff (from `CHAPTER.md` topic 41):** scan resistance came from remembering something LRU
  forgets, and the cheapest thing to remember is the identity of a page that was just evicted — a
  ghost list holds only keys, answering "have I seen this before?" Asking that question at billions
  of keys, in a few bits each, with error allowed in one direction only, is Bloom filters.

## Concept ledger

- **Introduces:** `scan-pollution`, `lfu-frequency-decay`, `two-queue-2q`, `ghost-list`,
  `arc-adaptive-partition`, `reuse-distance-lirs`.
- **Uses:** `lru-cache`, `hash-map-doubly-linked-list`, `clock-reference-bit`, `sampled-lru`,
  `miss-ratio-trace-replay` (topic 40), `doubly-linked-list`, `fifo`, `queue` (Chapter 2: 2Q's
  `A1in` is a FIFO queue).
- **Declared:** none.

## Changes from the chapter plan

- **LIRS's claims are sourced to a secondary description, not the original paper.** The SIGMETRICS
  '02 paper is ACM-paywalled (`dl.acm.org`'s PDF link returns HTTP 403), and the authors' own
  mirror of the extended journal version (`ranger.uta.edu`) fails TLS verification from this
  sandbox — the same `.edu`-hosted-source TLS failure pattern recorded in project memory for other
  chapters. Per `CHAPTER.md`'s own instruction for exactly this case ("if it cannot be opened,
  LIRS is reduced to the reuse-distance idea with the claim cut"), this topic keeps LIRS to the
  reuse-distance idea and the LIR/HIR partition, sourced to Wikipedia's "LIRS caching algorithm"
  article (which itself cites and summarizes the original paper), and says so plainly in
  `SOURCES.md`, `FACT-CHECK.md` and `post-notes.md` rather than presenting it as independently
  verified.
- **ARC's implementation follows the paper's published four-case pseudocode exactly** (Case I:
  hit in T1 or T2; Case II: ghost hit in B1; Case III: ghost hit in B2; Case IV: cold miss, with
  its own two-way split on whether T1+B1 already equals the cache size) rather than a simplified
  approximation — an earlier, ad-hoc first draft of `examples.py`'s `ARC` class produced an
  incorrect result on the very first hand-traceable case (it created a ghost entry for a cold
  miss that should have evicted directly from a full T1 with no ghost at all, since the paper's
  own Case IV only creates a ghost entry when T1 has already shrunk below the cache size through
  prior adaptation) — fixed by implementing the paper's branching directly; see `FACT-CHECK.md`'s
  red team.
- **The ARC hand-trace demo in `examples.py` needed one promotion before a ghost would form.**
  Filling a `capacity=4` ARC with four distinct first-time keys fills T1 to exactly the cache size
  with no ghost lists populated at all (matching the paper: with zero reuse, ARC degrades to plain
  LRU, since Case IV's first branch evicts directly from T1 rather than creating a ghost entry
  when T1 is already at the cache's own size). A ghost entry only appears once at least one hit
  has moved a key from T1 to T2, freeing T1 to shrink below the cache size — the hand trace in
  `examples.py` includes that one hit before it can show a B1 ghost hit growing `p`.

## Progress

All of this topic's measured claims pass in `examples.py`: the hot-set replay (all four below
twenty percent miss ratio, LFU-decay the weakest at roughly sixteen point six percent, likely
because its decay tick is slow relative to the trace), the scan-probe (all four essentially flat
through the scan, a stark contrast with `dsa.lru-caches`'s measured nine-point drop for LRU and
CLOCK), and the ARC hand trace (p rises on the engineered B1 ghost hit). Remaining: `FACT-CHECK.md`,
`coverage.json`, `pre-notes.md`/`prerequisites.mdx`/`references.md`/`post-notes.md`,
`reel.tsx`/`scenes.tsx`/`narration.json`, registry entry, reviews, checks, ship.
