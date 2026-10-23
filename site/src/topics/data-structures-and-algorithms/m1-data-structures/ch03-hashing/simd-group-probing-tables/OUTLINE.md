# Outline — SIMD group-probing tables (Swiss Tables)

## Learning outcomes

1. Explain the forcing problem Swiss Tables solve and name the design (H1/H2 split, one control byte per slot) that solves it.
2. Explain why one SIMD instruction can test many slots at once, and what makes most of them rejectable by one byte instead of the whole key.
3. Name the three real languages/runtimes that converged on this design, as verified at research time.

## Engagement arc

- **Hook (step 1):** topic 18 ended on "open addressing still walks a probe sequence one slot at a go" — Swiss Tables test many candidate slots in a single instruction instead.
- **Predict (step 3):** "A group holds 16 slots. How many of them does one SIMD compare instruction actually test?"
- **Predict (step 6):** "A 7-bit fingerprint has 128 possible values. What are the odds a wrong candidate's fingerprint matches by coincidence, forcing a wasted real key comparison?" — a `kind: 'full'` topic needs at least 2 predicts, and this is the natural second one: the surprising number itself, not just the mechanism that produces it.
- **Surprising number:** a 7-bit fingerprint (H2) rejects almost every wrong candidate — only a 1/128 chance of a false match forcing a real key comparison.
- **Takeaways:** steps 5, 7, 9 (three).
- **Recap (step 9, "Prove it"):** three real adopters (Abseil/C++, Rust's `std::HashMap`, Go's built-in map since 1.24), each verified at research time, side by side.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** the probe sequence from topic 18, hopping one slot at a time, dissolving into a single wide SIMD compare sweeping an entire group of slots at once.
- **Caption:** open addressing still walks its probe sequence one slot at a go. This topic tests many candidate slots in a single instruction.
- **Narrator's line of thought:** "last topic's mechanism was correct. This one is about doing the same kind of work, just far fewer instructions at a time."

### 2 — ForcingProblem
- **fig:** `ForcingProblem`
- **Visual idea:** a chained table (topic 17's own picture) shown with its per-node pointer and allocation overhead highlighted, beside a cache-miss-heavy probe walk — the two real costs Abseil's own design note names.
- **Caption:** a node-per-entry table pays a pointer and an allocation per entry, and almost every probe misses the cache. Swiss Tables exist to avoid both.
- **Narrator's line of thought:** grounds the motivation in the real cost, not an abstract "faster" claim.

### 3 — GroupPredict (predict)
- **fig:** `GroupPredict`
- **Visual idea:** one group of 16 slots and its control-byte row; the question of how many of those 16 one SIMD compare instruction actually tests.
- **Predict options:**
  1. "Just 1 — SIMD only helps with arithmetic, not comparisons like this"
  2. "2, one pair at a time"
  3. **"All 16 at once, in a single instruction"** (correct)
  4. "It depends on how many slots are actually occupied"
- **Explain:** the whole point of the control-byte layout is that every slot's metadata fits in one small, densely packed array — a single wide compare instruction tests the entire group's control bytes against the query's H2 byte simultaneously, "winnowing 16 candidates down" at once, in Abseil's own words.
- **Narrator's line of thought:** "this is the one idea the whole topic turns on — don't let it go by as just 'computers are fast.'"

### 4 — H1H2Split
- **fig:** `H1H2Split`
- **Visual idea:** one 64-bit (or 57+7-bit, per Abseil's own split) hash value splitting into H1 (which group to probe) and H2 (a one-byte fingerprint stored in the control array, not the key).
- **Caption:** "H1... used to identify the element index"; "H2... used to store metadata for this element" — one hash, two jobs.
- **Narrator's line of thought:** names the split precisely from the source, not a paraphrase.

### 5 — GroupMatch
- **fig:** `GroupMatch`
- **Visual idea:** the control byte row for a group, a query's H2 fingerprint compared against all of them in one highlighted sweep, non-matching lanes fading, matching lane(s) staying lit.
- **Caption:** one instruction checks a whole group's control bytes against the query's H2 byte at once — most false candidates are rejected by one byte, before the real key is ever touched.
- **Takeaway:** "One SIMD instruction tests a whole group's control bytes at once — most wrong candidates are rejected by one byte."
- **Narrator's line of thought:** "the key comparison still happens — just almost never, because the fingerprint already ruled out almost everyone."

### 6 — FingerprintPredict (predict)
- **fig:** `FingerprintPredict`
- **Visual idea:** a single 7-bit fingerprint byte (0–127) beside a wrong candidate's own fingerprint; the question of how often the two coincide by chance.
- **Predict options:**
  1. "Essentially never — collisions this specific don't really happen"
  2. **"About 1 in 128"** (correct)
  3. "About 1 in 2 — a byte only really narrows it down by half"
  4. "It depends on the hash function, not the fingerprint width"
- **Explain:** a 7-bit fingerprint has exactly 128 possible values, so two unrelated keys land on the same one by pure chance about 1 time in 128 — rare, but not zero, which is exactly why the design still falls back to a real key comparison instead of trusting the fingerprint alone.
- **Narrator's line of thought:** "don't let 'rare' slide by without the actual number — 1 in 128 is a specific, checkable claim, not a vibe."

### 7 — FingerprintOdds
- **fig:** `FingerprintOdds`
- **Visual idea:** a 7-bit H2 fingerprint's own collision odds (1/128) drawn as a small fraction of lit candidates among many groups.
- **Caption:** a 7-bit fingerprint has only a 1-in-128 chance of a false match — rare enough that the real key comparison it still requires almost never happens.
- **Takeaway:** "A 7-bit fingerprint has only a 1-in-128 chance of a false match that still needs a real key comparison."
- **Narrator's line of thought:** "the fingerprint doesn't replace the real comparison — it just makes paying for one incredibly rare."

### 8 — ThreeAdopters
- **fig:** `ThreeAdopters`
- **Visual idea:** three real logos/names side by side — Abseil's `flat_hash_map` (C++, 2017/2018 original), Rust's `std::HashMap` (via `hashbrown`, since Rust 1.36), Go's built-in map (since Go 1.24) — each dated and sourced.
- **Caption:** three real, current languages and runtimes converged on this exact design, verified at research time, not assumed from memory.
- **Narrator's line of thought:** "I actually went and checked Go's own blog post for this, dated this year — not relying on what I remembered about Go's map."

### 9 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** recap of the three adopters, their dates, and the one shared mechanism (control byte + SIMD group compare) each one independently arrived at.
- **Caption:** one mechanism, three independent real adopters, each one verified: Abseil (2017/2018), Rust's standard library (since 1.36), Go's built-in map (since 1.24).
- **Narrator's line of thought:** recap, not new content — "the same trick, converged on three times."

## Post-notes headings (Deep dive)

- `outcomes` — the three learning outcomes above.
- `internals` — the honest group-size difference between Abseil's original 16-wide SSE groups and Go's own 8-slot groups (per the Go blog's own metadata diagram), and why both still call it the same design.
- `lab` — none planned beyond naming the mechanism; the syllabus's §3.3 *Lab* bullet is kept for topic 18's own linear-probing measurement, per `CHAPTER.md`.
- `production` — all three real adopters (Abseil, Rust `std::HashMap`/`hashbrown`, Go's built-in map since 1.24), each cited from its own current source.
- `frontier` — the full capacity-and-growth mechanics of resizing such a table (topic 20's own subject); Robin Hood and cuckoo hashing, named with no mechanism, skipped in the syllabus.
- `questions` — "Why does a 7-bit fingerprint, not a 1-bit or a 32-bit one, turn out to be the right size?"; "Go's built-in map splits into multiple independent tables rather than one big one. Why might that matter for a map under concurrent-ish use?"
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. A real group-probing table built from scratch: a backing array divided into groups of 16 slots, each group with a one-byte-per-slot control array (empty/deleted/H2-fingerprint), using Python's own `hash()` (the same real hash topic 16 established) split into H1/H2 exactly as Abseil's own design note describes.
2. A SIMD-equivalent group-match step (implemented honestly as a vectorized/batched comparison over the group's control bytes, since Python has no raw SSE intrinsics) contrasted against a naive one-slot-at-a-time scan over the same groups, counting comparisons each approach performs to find or rule out a key.
3. A measurement of the 7-bit fingerprint's real false-positive rate over many random lookups, confirming it stays close to the theoretical 1/128 rather than asserting the number from the source alone.
4. Every number shown on screen (steps 6, 8) is asserted directly from these runs.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md`): "Open addressing keeps every entry in the array itself, one cache line at a time — but still walks a probe sequence one slot at a go. Swiss Tables test many candidate slots in a single instruction, by not looking at the entries at all until one byte says it's worth it."
- **Handoff** (word for word, matching `CHAPTER.md`): "Every scheme so far has worked inside a table of fixed size. None of them has yet said what happens when that table fills up. Next: resizing, and the two real ways to pay for it."

## Concept ledger

- **Introduces:** `swiss-table`, `control-byte`, `h1-h2-split`, `simd-group-match`.
- **Uses:** `open-addressing`, `probe-sequence`, `tombstone`, `cache-lines`, `cache-miss`.
- **Declared:** `tombstone` (topic 18 already introduces it; restated as one of three control-byte states).

## Claims list (claim → source)

1. The H1/H2 hash split: H1 picks the element index; H2 (the remaining bits) is stored as per-slot metadata. → `SOURCES.md` § Abseil design notes.
2. One control byte per slot: one control bit plus the 7-bit H2 fingerprint. → `SOURCES.md` § Abseil design notes.
3. A single SIMD compare instruction tests a whole group's control bytes against a query's H2 byte at once ("winnow 16 candidates... in only a few instructions"). → `SOURCES.md` § Abseil design notes.
4. Swiss Tables originated at Google in 2017, open-sourced in Abseil in 2018. → `SOURCES.md` § The Go Blog.
5. Go 1.24 (a current, dated adoption, not assumed from memory) replaced its built-in map's implementation with this design. → `SOURCES.md` § The Go Blog.
6. Go's own group size (8 slots, h2 as the lower 7 bits of the hash) is a real, verified implementation detail distinct from Abseil's original 16-wide groups. → `SOURCES.md` § The Go Blog.
7. Testing a whole group's control bytes "at once, in parallel" is what let both the Abseil and Go implementations raise their maximum load factor. → `SOURCES.md` § The Go Blog.
8. Rust's standard library `HashMap` has used this design (via the `hashbrown` crate) since Rust 1.36, with one byte of overhead per entry instead of a pointer-and-allocation per entry. → `SOURCES.md` § `hashbrown` README.
9. Every number put on screen (steps 6, 8) is measured directly in `examples.py`. → `examples.py`.

## Changes from the chapter plan

The chapter plan's own visual idea (a control-byte row under the topic 18 table, a single caramel sweep across all sixteen control bytes versus topic 18's slot-by-slot probe sequence) is followed directly. One honest addition found during research: the chapter plan's syllabus clause says "matching 16 slots per SIMD instruction," which is Abseil's own original group size — but Go's own blog post (verified at research time, dated this year) shows Go's built-in map uses groups of 8, not 16. This topic names both real group sizes rather than presenting "16" as a universal constant of the design, recorded in `FACT-CHECK.md`.
