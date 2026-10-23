# Outline — Tournament and loser trees (topic 31, dsa.tournament-loser-trees, full)

## Learning outcomes

- Build and trace a loser tree performing a k-way merge by hand.
- State and justify the ⌈log₂ k⌉-comparisons-per-output bound, and contrast it against a binary-heap-based merge's own cost per output on the identical k and input.
- Name external sorting's merge phase and LSM compaction as the two real systems whose actual merge kernel this structure is.

## Engagement arc (full topic: 2 predicts, 12-14 min)

- **Hook** (step 1): a binary heap (topic 30) answers "what's smallest" for one stream — a k-way merge asks it across k streams at once, every single output.
- **Predict 1** (step 3, "HeapPredict"): what does a heap-based merge actually cost per output?
- **Predict 2** (step 5, "TournamentPredict"): can a different structure beat a heap's own cost here?
- **Surprising number**: the topic's own `examples.py` measures real comparisons-per-output for naive scanning, a heap, and a loser tree, on the identical k runs.
- **Takeaways** (steps 4, 7, 9).
- **Recap** (step 9, "ProveIt").

## 9-step reel storyboard

1. **Opening.** *Title:* "A binary heap answers what's smallest right now for one stream of insertions. A k-way merge asks the same question across several already-sorted streams at once, every time it produces one output — and a heap's own sift-down re-examines a full root-to-leaf path to answer it, which is more comparison work than the problem actually requires." *Body:* "Same question as topic 30, asked k times at once: of k sorted runs' current heads, which is smallest, right now?" *Visual:* k short sealed runs (echoing Chapter 5's run visuals) feeding into one output stream.

2. **NaiveReveal.** *Title:* "The obvious approach: scan every run's current head and pick the smallest. That costs k−1 comparisons for every single output element — linear in k, every time." *Body:* "No structure at all, just a fresh scan each time. It works. It's also the first thing worth beating." *Visual:* k heads laid out in a row, a sweep comparing each in turn.

3. **HeapPredict.** *Title:* "Put the k heads in a binary heap instead, one pop-and-refill per output. What does that actually cost per output element?" *Predict options:* (a) "The same k−1 comparisons — a heap doesn't help here" (b) "Exactly log₂(k) comparisons" (c) "Roughly twice log₂(k) comparisons, because a sift-down compares both children at every level", correct (d) "Zero — a heap always knows its minimum for free." *Visual:* the k heads re-drawn as heap leaves, a question mark over the pop-and-refill step.

4. **HeapReveal.** *Title:* "A heap-based merge costs about 2·log₂(k) comparisons per output: a sift-down walks from the root down to the bottom, and at every level it has to compare both children to find the smaller one." *Body:* "Better than scanning all k every time — but every level costs two comparisons, not one." *Visual:* a sift-down path, both children highlighted at each level on the way down.
   *Takeaway (step 4):* "A heap-based k-way merge costs about 2·log₂(k) comparisons per output, not log₂(k) — it compares both children at every level."

5. **TournamentPredict.** *Title:* "A tournament tree turns this into a single-elimination bracket over the k runs' current heads instead. Can a structure built this way beat a heap's own cost per output?" *Predict options:* (a) "No — log₂(k) rounds either way, so the cost is the same" (b) "Yes — exactly one comparison per round, fewer than a heap's own cost", correct (c) "Yes, but only because it skips some comparisons unsafely" (d) "No — a bracket needs more rounds than a heap has levels." *Visual:* the same k heads redrawn as a bracket's own first-round pairs.

6. **TournamentReveal.** *Title:* "A tournament tree is an elimination bracket: two elements compete each game, the smaller one is promoted, and the bracket is a binary tree of games. Because each round plays one game per pair, each layer costs exactly one comparison — log₂(k) comparisons total, not the heap's own 2·log₂(k)." *Body:* "Same depth as the heap's own tree. Fewer comparisons per level, because only one pair competes at each node." *Visual:* the bracket's games resolving round by round up to a single overall winner.

7. **LoserTreeReveal.** *Title:* "Store only each game's loser, and the overall winner floats above the root: that's a loser tree. When the winning run's head is consumed and refilled, only the single path from that leaf back up to the root needs replaying — every other node is untouched." *Body:* "The rest of the bracket already reflects every game it isn't part of. Nothing else needs to move." *Visual:* one leaf refilled, its path up to the root lighting up while the rest of the bracket stays still.
   *Takeaway (step 7):* "A loser tree repairs itself along one root-to-leaf path per output — the same single-path discipline as a heap's own sift-down, with fewer comparisons at every level."

8. **ExternalSortReveal.** *Title:* "This is the real merge kernel behind two systems already in this course: external sorting's own second stage merges sorted runs this way, and an LSM-tree's own compaction step — leveled or tiered, topic 29 — is exactly this same k-way merge of several runs into one." *Body:* "A wider merge pass, built on this structure, needs fewer passes: six runs merged two at a time takes three passes; merged six-way, it's one." *Visual:* several on-disk runs (echoing topic 29's own compaction visuals) merging through a bracket into one output run.

9. **ProveIt.** *Title:* "Prove it." *Body:* "Measured, not assumed: real comparisons per output for a naive scan, a heap-based merge, and a loser tree, on the identical k sorted runs — including why the heap's own measured gap over the loser tree comes out smaller than the source's own rough '2x' estimate." *Visual:* three comparisons-per-output bars, populated with `examples.py`'s own measured numbers.
   *Takeaway (step 9):* "A loser tree beats a heap-based merge on every measured run here — by a real margin, not necessarily the full 2x a rough per-level estimate suggests."

## Narrator's line of thought (one bullet per step)

1. Topic 30 answered this for one stream. Here it's the same question, asked across several streams at once, every single output.
2. Before any structure at all: the obvious thing is to just look at everything and pick the smallest. That's a real baseline, not a strawman.
3. Before the reveal, think about what a heap actually does on the way down a tree — does it only ever look at one child, or both?
4. Here's the catch people miss: a heap's own sift-down isn't free just because it's O(log k) — it's comparing two things at every level, not one.
5. Before this reveal, think about what changes if, instead of a tree that compares two children per level, you build a tree that only ever plays one game per level.
6. This is the whole trick: same depth as the heap's tree, but one comparison per level instead of two, because only one pair ever competes at a node.
7. Notice what doesn't move here either — same discipline as topic 30's sift-down, just with half the per-level cost.
8. This isn't a toy structure. It's quietly already inside two systems this course already covered — external sorting, and the compaction step from two topics ago.
9. This is the one place in the whole topic where every claimed number gets checked against a real count, not just argued for.

## Post-notes headings

- **Internals**: the balanced-tree construction (sentinels for exhausted runs, null runs padded to a power of two) that keeps every leaf-to-root path at exactly ⌈log₂ k⌉, even when k isn't a power of two.
- **Lab**: `examples.py`'s own naive-scan vs. heap vs. loser-tree comparisons-per-output measurement, on the identical k runs.
- **Production**: external sorting's own second-stage merge, and the direct count of merge passes a wider merge saves (six runs, three binary passes vs. one six-way pass).
- **Frontier**: named only in passing — binomial heaps, pairing heaps, and Fibonacci heaps, deferred to the syllabus's own skipped topics (their own decrease-key-optimized use case, graph algorithms, isn't this chapter's problem).
- **Where this goes next**: Chapter 7's own opening question — given a string, where does it live, independent of how many strings there are.

## Examples-to-execute list

1. Build k sorted runs (the log's own records, echoing topic 29's own flushed/compacted runs) and merge them three ways: a naive scan of all k current heads, a binary-heap-based merge, and a loser-tree-based merge.
2. Count real comparisons per output element for each of the three approaches, on the identical k runs and the identical total element count.
3. Assert the loser tree's own comparisons-per-output matches ⌈log₂ k⌉ exactly (padding k to the next power of two with sentinel runs, per the balanced-tree construction), and that the heap's own cost is roughly twice that.
4. Assert all three approaches produce the exact same fully merged, sorted output (correctness independent of which structure did the merging).
5. Run the comparison at more than one k (including a non-power-of-two k) to confirm the ⌈log₂ k⌉ bound holds generally, not only for one convenient k.

## Bridge (topic 30's own handoff, quoted word for word)

"A binary heap answers what's smallest right now for one stream of insertions. A k-way merge asks the same question across several already-sorted streams at once, every time it produces one output — and a heap's own sift-down re-examines a full root-to-leaf path to answer it, which is more comparison work than the problem actually requires. Tournament and loser trees, next: the structure built to hit the bound a k-way merge actually allows."

## Handoff (this topic's own, quoted word for word from `CHAPTER.md`)

"Every structure in this chapter answered the same question, which one is smallest right now, without ever asking where its own data physically sits — a sharp contrast with Chapters 4 and 5, where that question was the entire point. The next chapter asks something different again: given a string, where does it live, and how fast can that be found out, independent of how many strings there are. Tries, next."

## Concept ledger

- **Introduces:** `tournament-tree`, `loser-tree`, `k-way-merge-bound`.
- **Uses:** `binary-heap` (topic 30, as the structure this one is contrasted against); `sstable`, `compaction-policy` (topic 29, as the real-world destination this structure's own mechanism already appeared inside, unnamed).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. A naive scan of all k current heads costs Θ(k) comparisons per output → Wikipedia "K-way merge algorithm".
2. A heap-based k-way merge costs roughly 2·log(k) comparisons per output, because a sift-down compares both children at every level → Wikipedia.
3. A tournament tree is a single-elimination bracket: two elements compete per game, the smaller is promoted, forming a binary tree of games → Wikipedia.
4. A tournament tree costs only log(k) comparisons per output, one comparison per layer on the way up → Wikipedia.
5. A loser tree stores each game's loser (the overall winner floats above the root); when a leaf is refilled, only the path from that leaf to the root is replayed → Wikipedia; a second, independent statement of the "only the leaf-to-root path is examined" advantage → TutorialsPoint.
6. k-way merges are the second stage of external sorting; a wider merge needs fewer passes (six runs: three binary passes vs. one six-way pass) → Wikipedia.

## Claims not made

- The heap's own "approximately 2·log₂(k)" cost is the source's own rough per-operation estimate for a full root-to-bottom sift-down; it is not claimed here as the real measured ratio over an actual merge. `examples.py` measures real comparisons on real runs and finds the heap-to-loser-tree ratio comes out smaller than 2x (about 1.2x–1.5x in the measured runs) — because a k-way merge's replacement values are usually close to what was just removed, so a sift-down often doesn't sink the full depth. The topic reports this honestly in "Prove it" rather than asserting the source's own rough estimate as the measured result.
- Neither source states the bound using the precise ceiling notation "⌈log₂ k⌉" — both use "log(k)"/"Θ(log k)" informally. This topic states the bound in ceiling form as the structural consequence of the balanced-tree construction both sources do describe (sentinel-padded runs to the next power of two, one comparison per layer), and verifies it directly in `examples.py` by counting real comparisons at more than one k, including a non-power-of-two k.
- The formal information-theoretic lower bound (no comparison-based k-way merge can beat Θ(n log k), per Wikipedia's own "Lower bound on running time" section) is named, not re-derived; this topic's own concern is the per-output comparison count of three concrete approaches, not the general lower-bound proof.
- The LSM-compaction connection is drawn from topic 29's own already-verified leveled/tiered compaction content (each compaction step merges several runs into one), not from a new source that names "loser tree" inside an LSM context specifically — no such source was found, and none is claimed.
- Binomial heaps, pairing heaps and Fibonacci heaps are named only in the frontier section, per the chapter plan's own skip list, not taught as mechanisms.
