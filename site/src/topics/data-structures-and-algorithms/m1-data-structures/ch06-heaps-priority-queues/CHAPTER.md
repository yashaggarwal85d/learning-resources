# Chapter 6 plan: Heaps and Priority Queues (Data Structures & Algorithms, Milestone 1)

This is the contract for every topic of Chapter 6. Builders keep to their own entry and read the entries next to theirs. Don't edit this file. If a topic really can't keep to its entry, record why under `OUTLINE.md` → "Changes from the chapter plan" and say so in the report.

- **Planned:** 23 October 2026, from `syllabus/data-structures-and-algorithms.md` (Chapter 6, §6.1–§6.2) and Chapter 5's final handoff.
- **Registry fields shared by every topic:** `domain: 'data-structures-and-algorithms'`, `milestone: { number: 1, title: 'Data Structures' }`, `chapter: { number: 6, title: 'Heaps and Priority Queues', section: '6.1' | '6.2' }`. The registry `title` and `syllabusTitle` are both the syllabus title word for word.
- **Folders:** every topic lives in `…/m1-data-structures/ch06-heaps-priority-queues/<folder>`, next to this file.
- **Inherits from earlier chapters** (not re-taught; used directly): none this chapter needs to reuse as a mechanism. A binary heap's implicit-array representation is a plain, contiguous array — the dynamic-array mechanics of Chapter 2 (`dsa.dynamic-arrays-growth-policy`) are assumed as ordinary background, not reused as a technique. Chapters 4–5's own structures (red-black trees, B-trees, LSM-trees) are explicitly *not* reused: this chapter's structures abandon the "keep everything sorted" question entirely and answer a narrower one instead (see "The problem it solves" below). Chapter 5's `sstable` and `bloom-filter-pruning`/`tombstone`/`compaction-policy` are referenced only as the real-world destination of topic 31's own merge kernel (LSM compaction's own merge step), not reused as a building block.

---

## The chapter

### The problem it solves

Every chapter so far answered some version of "is this key here, and if so, where" — a hash table, a balanced tree, a B-tree, an LSM-tree. This chapter asks a narrower, different question that doesn't care where anything sits or whether it's sorted at all: of everything not yet handled, which one is smallest (or highest-priority) right now? A binary heap (topic 30) answers that question for one stream of insertions and extractions, in an implicit tree held entirely in one array, no pointers at all. Topic 31 then asks the same question under a different shape of problem entirely: not "what's smallest across everything I've inserted," but "what's smallest across k already-sorted streams, repeatedly, as each stream's current head gets consumed and replaced" — the k-way merge at the center of external sorting and, as topic 29 already showed concretely, LSM compaction itself. A binary heap can do a k-way merge, but it re-examines the full root-to-leaf path on every single output; a tournament/loser tree is built specifically to shrink that cost to the bound the problem actually allows: ⌈log₂ k⌉ comparisons per output, not more.

### Order of ideas, and why

1. **§6.1 Array heaps (30).** Binary heaps and heapify (30, a refresher: sift-up/sift-down, the implicit array representation and its index arithmetic, and the O(n) bottom-up build via the sum-of-heights argument — not the naive O(n log n) one-at-a-time-insert bound). d-ary heaps and monotone integer priority queues are both skipped (see "Skipped in this chapter" below); the chapter keeps the one structure every later topic and every other domain's own priority-queue use assumes, without the research-tier and competitive-programming variants that generalize past it.
2. **§6.2 Mergeable and amortized heaps (31).** Tournament and loser trees (31: k-way merge with a ⌈log₂ k⌉-comparisons-per-output bound, one root-to-leaf replay per output, and the connection back to the actual merge kernel of external sorting and LSM compaction). 30 before 31 because 31's whole point is a contrast: a binary heap *can* run a k-way merge, just not at the bound a tournament tree achieves, so a learner needs 30's own heap, sift-down included, already in hand before 31 can show what it costs to use one here and why a different structure does better. Binomial heaps, pairing heaps and Fibonacci heaps are all skipped; the chapter keeps the practical default (binary heaps) and the specific merge-kernel result the syllabus's own Lab bullet asks for, without the decrease-key-optimized structures that exist for a graph-algorithm use case this chapter doesn't cover.
3. **Handoff to Chapter 7.** Topic 31 ends on the same question this chapter opened on, now answered as cheaply as a k-way merge allows — and on the observation that every structure in this chapter answered "which one is smallest" without ever asking where its data physically sits, in direct contrast to Chapters 4–5. Chapter 7 opens by asking a different question again: given a string, where does it live, and how fast can that be found out, independent of how many strings there are.

### One running example: ranking the log's own records

Chapters 1–5 kept one record format (the log's own timestamped records) and asked how to find one. This chapter asks instead how to repeatedly pull out whichever unprocessed record ranks lowest (or highest) right now — the question a scheduler, a top-N query, or an external merge all actually ask. Topic 30 sizes its own example as a small batch of the log's records, built into a heap both by repeated insertion and by the linear bottom-up build, with insertion counts the bound for each. Topic 31 sizes its own example as several already-sorted runs of the log's own records (echoing topic 29's own flushed-and-compacted runs directly) being merged into one output stream, with comparisons counted per output element against both a binary-heap-based merge and the bound a tournament/loser tree achieves. Every number on screen is computed or asserted in that topic's own `examples.py`; the values here are planning values, and a builder who finds one wrong fixes it in its own topic and records it in `REVIEW.md` for the release seam check.

| Piece | Planning values (each topic's builder computes and asserts its own) | Used by |
|---|---|---|
| The key | the log record's own timestamp (or another single orderable field), consistent with every earlier chapter | 30, 31 |
| Heap size for the sift-up/down and build pictures | small enough that every sift fits on one frame (illustrative, not a realistic scheduler's queue depth) | 30 |
| Build-cost contrast | n one-at-a-time insertions (the naive bound) against one bottom-up build on the identical n keys, both counted in real comparisons/swaps | 30 |
| k-way merge contrast | the same k (number of runs) and total element count, merged once with a binary heap and once with a tournament/loser tree, comparisons counted per output for each | 31 |

### Shared notation and terms

- **Implicit tree, one array:** a binary heap's tree structure lives entirely in index arithmetic over one array (a parent/child relationship by position, no pointers) — defined in topic 30, assumed without restatement in topic 31's own heap-based merge baseline.
- **Sift-up / sift-down:** the two heap-repair operations (restore the heap property after an insert, or after replacing the root) — defined in topic 30, and the specific operation topic 31 contrasts its own "replay one root-to-leaf path" move against.
- **Comparisons per output, not total comparisons:** this chapter's headline cost measure for topic 31 (echoing topic 29's shift from one global cost number to a per-operation one) — a k-way merge produces n outputs, and the question is how many comparisons each one costs, not merely a total.
- **Spoken numbers:** narration has no digits, symbols or code names (automatic check); say "log base two of k", "sift up", "sift down", "bottom-up build", and add new terms the first time each appears (`heap`, `sift`, `heapify`, `tournament tree`, `loser tree`, `run`, QUALITY.md #29).

### One visual language for the chapter's reels

The chapter builds from `site/src/reels/kit.tsx` and `DESIGN.md`'s briefing theme (PROJECT_PLAN.md, "Theme — briefing"): black and white carry everything, colour is rare and means something. On top of that this chapter shares one grammar:

- **Colour:** `crema` a heap's own live state, as it is; `latte` secondary labels (a node's index, a run's own label); `taupe` an empty/unallocated array slot; `caramel` **the thing to look at**: the node being sifted, the path a sift-down actually walks, the run a tournament tree's current winner came from; `cinnamon` (rare) **the alternative being compared**, always the same side of each pair: the naive one-at-a-time build against the bottom-up build (30), a binary-heap-based merge against a tournament/loser tree (31); `cherry` with `cherryText` **the bad outcome**: a heap property violated before a sift repairs it (30), a merge re-examining a full root-to-leaf path that a loser tree would have skipped (31).
- **The heap is drawn the same way in every topic:** an implicit binary tree over a flat array, both representations on screen together (the tree for intuition, the array for what's actually stored), with index arithmetic shown as a real computed index, never hand-waved; a sift-up or sift-down (30) is the same single-path move every time — one value walking up or down the tree, swapping as it goes, never an instant relocation.
- **Build contrast (30):** n one-at-a-time insertions, each triggering its own sift-up, drawn beside one single bottom-up build pass, both counted in real comparisons/swaps, side by side, never a claimed ratio.
- **k-way merge (31):** k runs drawn as k short sealed strips (echoing Chapter 5's own run visuals), with a heap-based merge's full root-to-leaf re-examination in `cinnamon` beside a tournament/loser tree's single replayed path in `caramel`.
- **Reel shape.** Topic 30 is a refresher (about 5 minutes, a fast recap, at least one predict in its first four steps). Topic 31 is a full topic (about 12–14 minutes, 2–4 predict questions): open on a problem drawn from the log's own on-disk runs, a predict question in the first three to four steps, the mechanism, then "Prove it."

---

## The topics, in syllabus order

Folder prefix: `site/src/topics/data-structures-and-algorithms/m1-data-structures/ch06-heaps-priority-queues/`. Concept ids are kebab-case. A concept is in `uses` only if an earlier topic introduces it, or this topic `declared` it. The ledger is per domain; ids Data Engineering and Rust Systems Engineering also use keep the same meaning here.

**Skipped in this chapter** (stay in the curriculum, get no reel, per `syllabus/review-notes/dsa-cuts.md`): d-ary heaps, Monotone integer priority queues (§6.1); Binomial and pairing heaps, Fibonacci heaps (§6.2). Where the syllabus's own *Lab* bullet needs a piece that doesn't depend on a skipped structure (a 256-way merge with a heap vs. a loser tree, reporting comparisons), the piece is kept in topic 31 and the skipped structures' own Dijkstra-comparison slice of the Lab is left out — see "Notes for the release run" below.

### 30. Binary heaps and heapify (`dsa.binary-heaps-heapify`): refresher, §6.1

- **Folder:** `binary-heaps-heapify`. About 5 min.
- **Scope (syllabus clause → what it delivers):**
  - "sift-up/sift-down": the two heap-repair operations defined precisely — sift-up restores the heap property after an insertion at the array's end by walking a new value up toward the root; sift-down restores it after the root is replaced (typically by the array's last element) by walking that value down toward whichever child violates the property, verified against a current primary or well-documented source, not assumed from memory.
  - "O(n) bottom-up build (sum-of-heights argument)": the real argument for why building a heap from n arbitrary elements costs O(n), not the O(n log n) a learner gets by inserting one at a time — each node's own sift-down cost is bounded by its height, and the sum of every node's height across a complete binary tree is O(n), not O(n log n), because most nodes are near the bottom and have small height.
  - "heap as an implicit tree in an array": the index arithmetic (a node at index i has children at 2i+1 and 2i+2, and a parent at ⌊(i−1)/2⌋, for a zero-indexed array) that makes the tree structure free — no pointers, no extra storage beyond the keys themselves.
- **Outcomes:**
  - Trace a sift-up and a sift-down by hand and show each restores the heap property.
  - State and justify the O(n) bottom-up build bound via the sum-of-heights argument, and contrast it against the O(n log n) bound of n one-at-a-time insertions on the same input.
  - Compute a node's parent and child indices directly from its own array position, with no pointers involved.
- **Introduces:** `binary-heap`, `sift-up-down`, `implicit-array-tree`, `heapify-linear-build`. **Uses:** none from an earlier chapter as a reused mechanism (Chapter 2's dynamic array is assumed background, not a technique reused here). **Declared:** none new beyond its own.
- **Bridge:** word for word, Chapter 5's own handoff above ("Every structure in this chapter optimized where data physically sits... Binary heaps, next.").
- **Handoff:** "A binary heap answers what's smallest right now for one stream of insertions. A k-way merge asks the same question across several already-sorted streams at once, every time it produces one output — and a heap's own sift-down re-examines a full root-to-leaf path to answer it, which is more comparison work than the problem actually requires. Tournament and loser trees, next: the structure built to hit the bound a k-way merge actually allows."
- **Prerequisites panel:** none from an earlier chapter as a direct prerequisite (this is a refresher reintroducing a structure most learners have some exposure to). On-site: none new.
- **Visual idea:** an implicit binary tree over a flat array, shown together; an out-of-place value sifting up after an insertion, and the root sifting down after a replacement, both as single-path moves; a side-by-side comparison/swap-count bar chart, n one-at-a-time insertions against one bottom-up build, on the identical input.
- **Sources to start from:** a current, careful textbook or course treatment of binary-heap mechanics and the sum-of-heights O(n) build argument (a standard algorithms reference, verified at research time).

### 31. Tournament and loser trees (`dsa.tournament-loser-trees`): full, §6.2

- **Folder:** `tournament-loser-trees`. About 13 min.
- **Scope (syllabus clause → what it delivers):**
  - "k-way merge with ⌈log₂ k⌉ comparisons per output": a tournament tree (or its loser-tree variant) structured so that producing one output element from k sorted runs costs exactly ⌈log₂ k⌉ comparisons, the number of rounds in a single-elimination tournament over k competitors — verified against a current primary or well-documented source, not assumed from memory, and contrasted directly against a binary-heap-based k-way merge's own cost per output.
  - "one root-to-leaf replay": the mechanic that achieves the bound — once the tournament's winner (the current smallest) is consumed and replaced by its run's next element, only the single root-to-leaf path the new element competes along needs replaying, not a full re-comparison against every other run's current head.
  - "the merge kernel of external sorting and LSM compaction (Ch.15)": the real-world destination of this exact mechanism — an external sort's merge phase and, as topic 29 already showed concretely, an LSM-tree's own compaction step are both k-way merges of sorted runs, and this is the structure that makes either one cheap per output rather than linear in k per output.
  - Leaves binomial/pairing/Fibonacci heaps' own decrease-key-optimized use case (graph algorithms like Dijkstra) to the skipped topics named above; leaves d-ary heaps' own cache-alignment tuning to the skipped topic named above.
- **Outcomes:**
  - Build and trace a loser tree performing a k-way merge by hand.
  - State and justify the ⌈log₂ k⌉-comparisons-per-output bound, and contrast it against a binary-heap-based merge's own cost per output on the identical k and input.
  - Name external sorting's merge phase and LSM compaction as the two real systems whose actual merge kernel this structure is.
- **Introduces:** `tournament-tree`, `loser-tree`, `k-way-merge-bound`. **Uses:** `binary-heap` (topic 30, as the structure this one is contrasted against); `sstable`, `compaction-policy` (topic 29, as the real-world destination this structure's own mechanism already appeared inside, unnamed, when topic 29's own leveled and tiered compaction each merged several runs together). **Declared:** none new beyond its own.
- **Bridge:** word for word, topic 30's own handoff above ("A binary heap answers what's smallest right now for one stream of insertions... Tournament and loser trees, next.").
- **Handoff:** "Every structure in this chapter answered the same question, which one is smallest right now, without ever asking where its own data physically sits — a sharp contrast with Chapters 4 and 5, where that question was the entire point. The next chapter asks something different again: given a string, where does it live, and how fast can that be found out, independent of how many strings there are. Tries, next."
- **Prerequisites panel:** `dsa.binary-heaps-heapify` (Before this: sift-up/sift-down and the implicit array representation this topic's own heap-based baseline is built from); `dsa.lsm-compaction-amplification` (Before this: the leveled and tiered compaction this topic's own merge kernel is the real mechanism behind). On-site: none new.
- **Visual idea:** k short sealed runs merging through a tournament bracket into one output stream; a binary-heap-based merge's full root-to-leaf re-examination drawn in `cinnamon` beside a loser tree's single replayed path in `caramel`; a comparisons-per-output bar chart for both structures on the identical k and input.
- **Sources to start from:** a current, careful textbook or course treatment of tournament/loser trees and the k-way merge bound (a standard algorithms or external-memory-algorithms reference, verified at research time); a current external-sorting or LSM-engine's own documentation naming its merge phase as a k-way merge, tying the mechanism back to a real system.

---

## Concept ledger at a glance (introduces, in order)

30. `binary-heap`, `sift-up-down`, `implicit-array-tree`, `heapify-linear-build`
31. `tournament-tree`, `loser-tree`, `k-way-merge-bound`

Each concept is introduced once. No concept is declared a second time in this chapter.

## Notes for the release run

1. **Verification discipline carries over from Chapters 1–5.** Every "to verify" claim above is a placeholder for the research stage (section 3 of the skill): fetch or read a current primary or well-documented source, quote or cite it in `SOURCES.md`, and only then commit the claim to `OUTLINE.md`. Nothing above is to be taken on screen from this plan's memory.
2. **Seams to check at release:** topic 30's O(n) bottom-up build claim against its own one-at-a-time O(n log n) baseline (the contrast must be real, computed numbers, not two unrelated claims); topic 31's heap-based merge baseline against topic 30's own sift-down mechanic (31 must use the identical heap operation 30 defined, not a different one); topic 31's own naming of LSM compaction's merge step against topic 29's actual leveled/tiered mechanics (the connection must be accurate to what topic 29 built, not a generic claim); topic 31's handoff against Chapter 7's first topic's actual opening.
3. **The syllabus's own Lab bullet** ("implement binary, 4-ary, pairing and radix heaps; run Dijkstra on a road graph and a random graph with each, then a 256-way merge with a heap vs a loser tree; report comparisons, cache misses and wall time") spans structures this chapter keeps and structures it skips. Topic 30's `examples.py` builds and measures the binary-heap side (build-cost comparison). Topic 31's `examples.py` builds and measures the one slice of the Lab that doesn't depend on a skipped structure: a many-way merge with a heap vs. a loser tree, reporting comparisons per output. The Dijkstra-with-four-structures slice of the Lab depends on d-ary, pairing and radix heaps, all skipped, and is not reproduced by any topic in this chapter.
4. **Cross-domain links:** none this chapter's syllabus line names. This chapter builds the structures; it does not forward-link to another domain's own topics.
