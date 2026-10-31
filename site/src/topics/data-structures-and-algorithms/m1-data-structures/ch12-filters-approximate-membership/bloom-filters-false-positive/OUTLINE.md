# OUTLINE: Bloom filters and false-positive math (`dsa.bloom-filters-false-positive`)

## Storyboard (12 steps, ~15 min)

1. **Hook.** A read for a key that is not in the database would open every run of an LSM tree.
   Chapter 5's filter makes that read nearly free, at about ten bits per key. How wrong is it
   allowed to be — at ten bits/key with seven hash functions, one absent key in a hundred slips
   through; to reach one in a million needs about nineteen more bits per key, not a million times
   the memory.
2. **The structure.** k hash functions over m bits; insert sets k bits, query reports "maybe" only
   if all k are set, "absent" at the first zero. One-sided error: a bit once set is never cleared,
   so no false negative is ever possible. The structure holds no keys — it cannot list them.
3. **Predict (within first four steps).** "A bit that's already one from some other key gets set
   again by this key. What happens to it?" Correct: nothing — it was already one, stays one;
   setting a bit that's already set costs nothing and loses nothing.
4. **Reveal: the rate, derived.** The one line: after n·k settings a given bit is still zero with
   probability ≈ e^(−kn/m); a false positive needs all k probes landing on ones, each with
   probability 1 − e^(−kn/m); multiply, the rate is (1 − e^(−kn/m))^k. Measured against formula at
   5 bits-per-key values. **Takeaway.**
5. **The optimum.** Minimizing the rate over k gives k = (m/n) ln 2; at that k exactly half the
   bits are ones and the rate is (1/2)^k. The valley is flat — k=6, 7, 8 all close at 10 bits/key,
   which is why real code rounds or truncates k freely.
6. **Predict.** "To cut the false-positive rate from one in a hundred to one in a million — about
   ten thousand times rarer — does the filter need about ten thousand times the memory?" Correct:
   no — about 2.9x the bits per key (19 more bits, not 10,000x).
7. **Reveal: the bound.** Counting argument: a filter with no false negatives and rate ε needs
   m ≥ n·log₂(1/ε) bits, the Chapter 1 information-theoretic bound applied here; Bloom's own
   optimum needs n·log₂(e)·log₂(1/ε) ≈ 1.44x that — the gap is a fixed constant, not a growing
   one. **Takeaway.**
8. **Predict.** "A filter needs to probe k different places from one hash value. Does it need k
   separate, independently-computed hash functions, or can two do the job?" Correct: two.
9. **Reveal: derived probes.** g_i(x) = h1(x) + i·h2(x) mod m from two hash values simulates k
   probes with no measurable loss in the false-positive rate (Kirsch & Mitzenmacher) — measured
   against k independent hashes at the same bits/key, agreeing within sampling noise. The same
   arithmetic shape as Chapter 3's double hashing, used for a different purpose there (resolving
   a collision) versus here (spreading k probes). **Takeaway.**
10. **No deletes.** Clearing a key's bits can clear bits other keys also set — a false negative,
    the one thing the structure promises never to give. Demonstrated on a small filter, found by
    search, not hand-picked. Why an LSM run doesn't care: the run and its filter are immutable;
    a deleted key lives on as a tombstone in a newer run (topic 28).
11. **The measured comparison / recap setup.** Chapter 5 topic 28's own number (9.9 bits/key →
    about 1%) reproduced directly from this topic's formula at k=7, closing the loop Chapter 5
    left open.
12. **Recap.** A Bloom filter spends about 1.44x the fewest bits any filter could to answer one
    question about one key, paid for with a one-sided wrong answer and two things it cannot do:
    delete, and list what it holds. Compressed bitmaps, next.

## Engagement arc

- Hook: directly extends Chapter 5's own use of the structure, not a fresh setup.
- First predict: step 3, inside the first four steps (a free, nearly-trick question building
  intuition for "no false negatives").
- Second predict: step 6 (the surprising "not 10,000x" number, before the bound's derivation).
- Third predict: step 8 (commits to "two hashes" before the derivation reveals why).
- Takeaways: steps 4, 7, 9 (three, each immediately after its derivation).
- Surprising number: step 6's "not 10,000x, about 2.9x the bits" and step 7's fixed 1.44x gap.
- Recap: step 12, in the narrator's own words, naming what the structure cannot do and pointing
  directly at the next topic (compressed bitmaps / Roaring), not restating the takeaways verbatim.

## Post-notes section headings (planned)

`Outcomes`, `Internals`, `Lab`, `Production failures this topic warns about`, `Frontier`,
`Where this goes next` — same six as the previous chapter's topics.

## Bridge / handoff (word for word from `CHAPTER.md`)

- **Bridge:** Chapter 11 topic 41's own handoff, word for word: "Scan resistance came from
  remembering something LRU forgets, and the cheapest thing to remember turned out to be the
  identity of pages that were just evicted: a ghost list holds only keys, and its one job is to
  answer 'have I seen this before?' Exactly that question, at billions of keys, in a few bits
  each, and with a wrong answer allowed in one direction only, is its own data structure. Bloom
  filters, next." The topic opens (step 1) by naming Chapter 5's use of the structure and
  promising what Chapter 5 left out: the reason for 9.9 bits/key and k=7.
- **Handoff:** "A Bloom filter spends about one and a half times the fewest bits any filter
  could, to answer one question about one key, and it pays for that with a wrong answer in one
  direction and with everything it cannot do: it cannot delete, and it cannot list what it holds.
  When the thing to store is a set of integers and every answer must be exact, with intersections
  and unions as fast as the data can be read, a different bit array does the work: one bit per
  possible value, compressed in pieces. Compressed bitmaps: Roaring, next."

## Running example

Chapter 5's per-run LSM filter: `examples.py` builds a 200,000-key set (small enough to run fast,
per CHAPTER.md), measures false-positive rate at 8/10/12/16/20 bits per key against absent keys,
the flat optimum at 10 bits/key across k = 1,2,4,6,7,8,10,14, the ~0.503 fill fraction, the bound
at 1% and one-in-a-million, derived-probe agreement with independent hashes, a found (not
hand-picked) deletion failure, and the reconciliation with topic 28's 9.9-bits/key ≈ 1% figure.
All values measured in `examples.py` land within the planning table's tolerances (CHAPTER.md).

## Changes from the chapter plan

- None structural. One measurement detail: the first implementation used Python's built-in
  `hash()` for the k simulated hash functions, salted by tupling in an integer index; this
  produced a false-positive rate 2-3x the formula's prediction (e.g. 2.9% measured vs. 0.82%
  predicted at 10 bits/key, k=7) because CPython's tuple-hash mixing leaves visible correlation
  across probes of the same key when one of the mixed values is a small sequential integer. Fixed
  by hashing with SHA-256 (truncated to 64 bits) instead, which removed the correlation and
  brought every measured rate within sampling noise of its formula value. This is implementation
  detail, not a claim changed from any source — recorded here and in `FACT-CHECK.md`'s red team
  as the kind of own-code bug this topic's method (derive the formula, then verify a real
  implementation against it) is built to catch.
