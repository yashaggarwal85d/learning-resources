# Outline — Separate chaining

## Learning outcomes

1. State load factor (α = n/m) and explain why expected chain length under chaining is about α.
2. Explain why chaining tolerates α > 1 without failing — it degrades, it never breaks.
3. Name chaining's per-entry pointer cost as the trade-off the next topic's scheme (open addressing) avoids.

## Engagement arc

- **Hook (step 1):** topic 16 ended on "a hash function says nothing about two keys landing on the same number" — chaining is the oldest answer.
- **Predict (step 5):** "At load factor α ≈ 1.5, what's the expected length of the chain a random key lands in?"
- **Surprising number:** none needed — the real surprise here is how closely the measured average chain length tracks α itself, not a dramatic ratio; the reel treats "it's almost exactly α" as the payoff.
- **Takeaways:** steps 4, 6, 7 (three).
- **Recap (step 8, "Prove it"):** the three measured load factors (α ≈ 0.5, 0.75, 1.5) and their measured average chain lengths, side by side with α itself.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** two keys from topic 16's hash box landing on the same slot number; the box that used to look like a clean one-to-one arrow now has two arrows converging on one slot.
- **Caption:** a hash function turns any key into a number. It says nothing about what happens when two different keys turn into the same one.
- **Narrator's line of thought:** "last topic ended right here, on purpose — two keys, same slot. This topic is the oldest answer anyone gave."

### 2 — ChainMechanism
- **fig:** `ChainMechanism`
- **Visual idea:** a bucket array; the colliding slot grows a small linked list downward as each new key arrives, reusing Chapter 2's own linked-list drawing (node, pointer, node).
- **Caption:** "link records in the same slot into a list" — a bucket doesn't hold one entry, it holds a chain of them.
- **Narrator's line of thought:** names the one new idea directly: nothing about the hash function changes; the bucket itself becomes a tiny linked list, the exact structure from two topics back.

### 3 — RealLibrary
- **fig:** `RealLibrary`
- **Visual idea:** Java's `HashMap`, drawn as a bucket array of chains, labelled directly from its own source comment ("a binned (bucketed) hash table"); a small honest footnote that an overgrown bin becomes a balanced tree in real Java, named but not built here.
- **Caption:** a real, current standard library ships exactly this — chaining is not a toy.
- **Narrator's line of thought:** grounds the mechanism in something real before the worst case, the same move topic 16 made with Rust's `HashMap`.

### 4 — WorstCase
- **fig:** `WorstCase`
- **Visual idea:** every key routed to the same slot; one chain grows to hold everything, Θ(n) access, drawn in `cherry`.
- **Caption:** every key could still land in one slot. The chain just keeps growing — nothing breaks, it just gets slow.
- **Takeaway:** "Chaining never runs out of room in a bucket — in the worst case it just degrades to one long list."
- **Narrator's line of thought:** "this is the honest worst case, and it's exactly why open addressing, next topic, has to work differently — it can't just grow a list in place."

### 5 — ChainPredict (predict)
- **fig:** `ChainPredict`
- **Visual idea:** the bucket array at α ≈ 1.5 (more keys than slots), one random key's arrow pointing at its bucket, asking how long that chain probably is.
- **Predict options:**
  1. "0 — most buckets are probably still empty"
  2. "Always exactly 1, however many keys there are"
  3. **"About α — the load factor itself"** (correct)
  4. "It grows without bound as more keys are added, regardless of table size"
- **Explain:** under a hash that spreads keys evenly, the expected number of keys sharing any one bucket is n divided by m — which is exactly α by definition. More buckets or fewer keys makes chains shorter; it's a ratio, not a fixed number or an unbounded one.
- **Narrator's line of thought:** "you already know α's definition from two steps ago. The question is just asking you to trust what that ratio actually measures."

### 6 — ChainLengthReveal
- **fig:** `ChainLengthReveal`
- **Visual idea:** the cited Θ(1 + α) result from the MIT lecture, shown as a formula; beside it, the real measured longest chain at each α staying close to α itself under Python's own hash — contrasted with the worst case's longest chain (step 4), which held every single key. The average chain length is labelled as "= α, always, by counting" (a fact true of any hash, not evidence of anything), with the longest chain's closeness to that average as the real, hash-dependent result.
- **Caption:** a real citation, not a re-derivation: the expected search cost under chaining is Θ(1 + α) — and that only means something because chains stay close to that average, not because the average itself is small.
- **Takeaway:** "The average chain length is always α, by counting — the real promise is that no single chain runs away from it."
- **Narrator's line of thought:** "watch this carefully: the average being α doesn't actually prove anything — that's true no matter how bad your hash function is, because every key has to land somewhere. The honest question is whether any one bucket hoards the keys, and that's what a well-spread hash actually buys you."

### 7 — PointerCost
- **fig:** `PointerCost`
- **Visual idea:** one bucket's chain, each node now drawn with its explicit next-pointer highlighted in `cherry`, beside a hypothetical "entry lives in the table itself" slot with no pointer at all (dimmed, previewing topic 18, not built).
- **Caption:** every entry pays for a pointer to the next one in its chain. That's the one real cost open addressing avoids.
- **Takeaway:** "Chaining's flexibility costs a pointer per entry — the next topic's scheme gives that up, and pays differently."
- **Narrator's line of thought:** "this is the one trade-off worth remembering before the next topic — not that chaining is worse, just that it spends memory differently."

### 8 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** three bucket arrays side by side at α ≈ 0.5, 0.75, 1.5, each with its measured average chain length labelled beside α itself.
- **Caption:** three load factors, one real table, one real measurement each time: the average chain length tracks α closely at every one of them.
- **Narrator's line of thought:** recap, not new content — "three load factors, three real measurements, one simple ratio holding every time."

## Post-notes headings (Deep dive)

- `outcomes` — the three learning outcomes above.
- `internals` — the simple-uniform-hashing assumption the Θ(1+α) result depends on, stated precisely; why a successful search's bound is the same but the proof is "a little more complicated" (the lecture's own words) and is cited, not re-derived.
- `lab` — none planned beyond `examples.py`'s own measurement (no syllabus *Lab* bullet in §3.2 for this topic).
- `production` — Java's `HashMap` real refinement beyond pure chaining: a bin past a size threshold becomes a balanced tree bin, trading a little memory for a worst-case O(log n) guarantee even under a bad hash function or an adversary — named here as the honest "pure chaining isn't quite what ships" caveat.
- `frontier` — universal hashing (already named skipped in CHAPTER.md) is what would make "simple uniform hashing" a guarantee instead of an assumption; one sentence, no mechanism.
- `questions` — "If α could be made very small (many more buckets than keys), what does that buy you, and what does it cost?"; "Java's `HashMap` treeifies a bin only past a size threshold, not always. Why not treeify every bin from the start?"
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. A from-scratch chained hash table (bucket array + chain, reusing topic 16's `ChainedTable` shape) built with a real, well-spread hash (Python's own `hash()`, the keyed/PRF tier topic 16 already established as production-real).
2. At three load factors (α ≈ 0.5, 0.75, 1.5), insert enough random keys to hit that ratio exactly (n = round(α · m) for a fixed m). The average chain length is exactly α by counting at every α, for any hash whatsoever — proven as a sanity assertion, not the real claim. The real, hash-dependent claim measured is that the longest chain stays a small fraction of n (under 5%) at every α, under Python's own well-spread `hash()`.
3. A worst-case construction: force every key into one bucket (a deliberately constant, degenerate hash), and assert the single chain's length equals n exactly, with every other bucket untouched — the real Θ(n) worst case, computed, and its longest-chain-over-average ratio (literally thousands of times the average) contrasted directly against the well-spread case above.
4. Every number shown on screen (steps 5, 6, 8) is asserted directly from these runs.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md`): "A hash function turns any key into a number. It says nothing yet about what happens when two different keys turn into the same one. Here is the oldest answer, and the one every language's standard library still ships."
- **Handoff** (word for word, matching `CHAPTER.md`): "Chaining never runs out of room in a bucket, at the cost of a pointer per entry. The next scheme gives that pointer up — every entry lives in the table itself — and pays for it differently."

## Concept ledger

- **Introduces:** `load-factor`, `collision`, `separate-chaining`, `bucket`.
- **Uses:** `singly-linked-list` (Ch.2 topic 2).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. Chaining links records in the same slot into a list. → `SOURCES.md` § MIT 6.046 lecture 7.
2. Worst case: every key hashes to the same slot, access time Θ(n). → `SOURCES.md` § MIT 6.046 lecture 7.
3. Load factor α = n/m, the average number of keys per slot, under the simple-uniform-hashing assumption. → `SOURCES.md` § MIT 6.046 lecture 7.
4. Expected time for an unsuccessful search under chaining is Θ(1 + α); Θ(1) when α = O(1). → `SOURCES.md` § MIT 6.046 lecture 7.
5. A successful search has the same asymptotic bound, but a more complicated proof — cited, not re-derived here. → `SOURCES.md` § MIT 6.046 lecture 7.
6. Java's `HashMap` is a real, current, chaining-based ("binned/bucketed") standard-library hash table; default load factor 0.75, rehashing at the load-factor·capacity threshold. → `SOURCES.md` § OpenJDK HashMap.java.
7. **Honest scope flag:** Java's `HashMap` is not *pure* chaining — an overgrown bin is transformed into a balanced tree bin, a refinement beyond this topic's own scope. → `SOURCES.md` § OpenJDK HashMap.java; `FACT-CHECK.md`.
8. Every number put on screen (steps 5, 6, 8) is measured directly in `examples.py`, not asserted from the citation alone. → `examples.py`.
9. **The correction found while building `examples.py`:** the average chain length over all buckets equals α exactly, by simple counting, for any hash function at all — measuring it alone proves nothing about chaining needing a good hash. The actual hash-dependent claim is that the longest chain stays close to that average (measured: under 5% of n at every tested α), contrasted against the worst case's longest chain (100% of n). → `examples.py`; `FACT-CHECK.md`.

## Changes from the chapter plan

The chapter plan's own visual idea (three load factors, chains drawn growing downward) is followed directly. Two additions, both found during building rather than planned in advance, and both recorded rather than silently folded in: the honest Java tree-bin caveat (claim 7), found during research; and the average-chain-length-is-a-tautology correction (claim 9), found while writing `examples.py`'s first draft, which originally asserted only that the average tracked α — true of any hash, and not the real claim this topic needed to demonstrate.
