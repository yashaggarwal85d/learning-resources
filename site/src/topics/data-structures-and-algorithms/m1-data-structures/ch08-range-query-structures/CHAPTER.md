# Chapter 8 plan: Range-Query Structures (Data Structures & Algorithms, Milestone 1)

This is the contract for every topic of Chapter 8. Builders keep to their own entry and read the entries next to theirs. Don't edit this file. If a topic really can't keep to its entry, record why under `OUTLINE.md` → "Changes from the chapter plan" and say so in the report.

- **Planned:** 23 October 2026, from `syllabus/data-structures-and-algorithms.md` (Chapter 8, §8.1) and Chapter 7's final handoff.
- **Registry fields shared by every topic:** `domain: 'data-structures-and-algorithms'`, `milestone: { number: 1, title: 'Data Structures' }`, `chapter: { number: 8, title: 'Range-Query Structures', section: '8.1' }`. The registry `title` and `syllabusTitle` are both the syllabus title word for word.
- **Folders:** every topic lives in `…/m1-data-structures/ch08-range-query-structures/<folder>`, next to this file.
- **Inherits from earlier chapters** (not re-taught; used directly): the plain array itself (Chapter 2's dynamic array) is assumed background, not a reused technique — both of this chapter's structures are built on top of a fixed-size array, never resized mid-topic. Recursion and the divide-and-conquer shape of a balanced binary tree (Chapter 4's own binary search trees) inform the segment tree's own recursive layout directly, though the segment tree is not itself a search tree (it's indexed by position, not by key comparison) and is treated as its own structure, not a BST variant.

---

## The chapter

### The problem it solves

Every structure in Chapters 3–7 answered some version of "is this key here, and if so, where" or "where does this string live" — one key, one answer, looked up directly. This chapter asks a different kind of question about an array of values that keeps changing: not "what's at position i," but "what's true about positions i through j, right now" — a sum, a minimum, or some other aggregate — answered again and again as individual positions get updated in between. Scanning the range on every query costs O(n) per query; rebuilding a running total from scratch on every update costs the same. A Fenwick tree (topic 33) answers one specific version of this question — prefix sums, with point updates — in O(log n) for both, using nothing but lowest-set-bit arithmetic over one array, no explicit tree at all. A segment tree (topic 34) answers the fully general version: any associative combine function, any contiguous range, with lazy propagation so that even a range update (not just a range query) costs O(log n) instead of touching every position the range covers.

### Order of ideas, and why

1. **§8.1 Static and dynamic range queries, narrow case first (33).** Fenwick trees (33: lowest-set-bit indexing for prefix sums with point updates in O(log n); the range-sum-from-two-prefix-sums trick; range-update/range-query with two Fenwick trees; 2D Fenwick trees for a grid). Sparse tables and RMQ are skipped (see "Skipped in this chapter" below): that structure answers a *static* range-minimum query in O(1) after O(n log n) preprocessing, but never supports an update at all, which is exactly the capability this chapter is built around, so it's skipped as a fundamentally different (update-free) problem, not a slower alternative to what topic 33 builds.
2. **§8.1 continued, the general case (34).** Segment trees and lazy propagation (34: the recursive and iterative/bottom-up layouts; arbitrary associative combine functions — sum, min, max, gcd, or any other associative operator — not just prefix sums; lazy tags that defer a range update until a query actually needs to descend into that subtree, and what makes a tag composable so two pending updates on the same node can be merged into one before either is pushed down). 33 before 34 because 34's whole point is generalization: a learner needs a concrete, working O(log n) range structure already in hand (33's Fenwick tree) before 34 can show what a Fenwick tree *can't* do (range minimum, or a range-wide update) and what it costs to build a structure that can. Square-root decomposition and Mo's algorithm are both skipped (see below); the chapter keeps the two structures that generalize cleanly to arbitrary associative operators and to range updates, without the block-decomposition and offline-query-reordering techniques that exist for workloads with awkward update patterns or batched, read-only queries.
3. **Handoff to Chapter 9.** Topic 34 ends on the same question this chapter opened on, now answered in full generality: any associative aggregate, over any range, updated in O(log n), range-wide updates included. Chapter 9 asks a different question about dimension instead: not where a value sits along one array, but how to order points scattered across two or three dimensions so that nearby points end up nearby in one linear ordering — space-filling curves, next.

### One running example: per-minute event counts from the log

Chapters 1–7 kept the log's own records as single entities, searched by key or by string. This chapter needs a different shape: a plain array of numbers, each position holding one slot's own value, queried and updated by *position*, not by key. Both topics in this chapter use the same running example — the log's own events, bucketed into one fixed array slot per minute, each slot holding that minute's own event count. Topic 33 asks for a running total (how many events happened up through minute i) and supports a point update (minute i's own count changes). Topic 34 asks the more general question (what's the minimum, or the sum, of event counts across minutes i through j) and supports both a point update and a range-wide update (every minute in a range gets the same correction applied at once, via a lazy tag, without touching each one individually). Every number on screen is computed or asserted in that topic's own `examples.py`; the values here are planning values, and a builder who finds one wrong fixes it in its own topic and records it in `REVIEW.md` for the release seam check.

| Piece | Planning values (each topic's builder computes and asserts its own) | Used by |
|---|---|---|
| The array | one fixed-size array of per-minute event counts, a plain array of integers, distinct from every earlier chapter's key-indexed structure | 33, 34 |
| Array size | small enough that every Fenwick/segment-tree picture fits one frame, large enough that an O(log n) vs. O(n) contrast is visible | 33, 34 |
| Point-update workload | a sequence of individual count changes, each one's real cost measured against a naive O(n) prefix-sum rebuild | 33 |
| Range-query / range-update workload | a mix of range-sum or range-min queries and range-wide corrections (point and lazy range), each one's real cost measured and asserted against the O(log n) bound | 34 |

### Shared notation and terms

- **Prefix sum:** the running total of every slot from the array's start up through some position i — the specific aggregate a Fenwick tree is built around; defined in topic 33, assumed without restatement in topic 34's own general-aggregate framing.
- **Lowest set bit:** the least-significant 1 bit of a position's own binary representation — the single piece of arithmetic a Fenwick tree's own index-jumping (both for updates and for prefix-sum queries) runs on; defined and verified directly in topic 33.
- **Associative combine function:** any operator where grouping doesn't change the result (sum, min, max, gcd, and others) — the general notion topic 34 builds its own segment tree around, in contrast to topic 33's one fixed operator (sum).
- **Lazy tag:** a pending update stored at an internal node instead of applied to every leaf underneath it immediately, pushed down only when a query actually needs to descend past that node — defined in topic 34, together with what makes two tags composable (mergeable into one before either is pushed down).
- **Spoken numbers:** narration has no digits, symbols or code names (automatic check); say "log base two of n," "lowest set bit," "prefix sum," "lazy tag," and add new terms the first time each appears (`fenwick tree`, `segment tree`, `lazy propagation`, `associative combine function`, QUALITY.md #29).

### One visual language for the chapter's reels

The chapter builds from `site/src/reels/kit.tsx` and `DESIGN.md`'s briefing theme (PROJECT_PLAN.md, "Theme — briefing"): black and white carry everything, colour is rare and means something. On top of that this chapter shares one grammar:

- **Colour:** `crema` the array's own live state, as it is; `latte` secondary labels (an index, a bit position); `taupe` a slot not yet touched by the current operation; `caramel` **the thing to look at**: the exact indices an update or query actually visits, each one highlighted as it's touched; `cinnamon` (rare) **the alternative being compared**: a naive O(n) scan or rebuild set directly against the structure's own O(log n) path (33), or a segment tree without lazy tags (touching every leaf in a range) set against one with them (34); `cherry` with `cherryText` **the bad outcome**: the full O(n) work a naive approach pays that the chapter's own structure skips.
- **The array is drawn the same way in every topic:** one row of slots, index labels shown as real computed indices, never hand-waved; an update or a query is drawn as a small number of slots lighting up in sequence, one jump at a time, never an instant highlight of the whole structure at once.
- **Fenwick index-jumping (33):** each step of an update or a prefix-sum query drawn as one jump to a new index, computed from the current index's own lowest set bit, shown as a real binary number with that bit highlighted.
- **Segment-tree recursion (34):** a small binary tree over the array drawn above the array itself, a range query or update shown descending only into the nodes it actually needs, lazy tags drawn as a small marker sitting on a node until a query forces it to push down into that node's own children.
- **Reel shape.** Topic 33 is a full topic (about 12–14 minutes, 2–4 predict questions): open on the problem (a naive running total, costed), a predict question in the first three to four steps, the lowest-set-bit mechanism, then "Prove it." Topic 34 is also a full topic, similarly shaped, opening on what a Fenwick tree can't do (range minimum, or a range-wide update) before building the more general structure.

---

## The topics, in syllabus order

Folder prefix: `site/src/topics/data-structures-and-algorithms/m1-data-structures/ch08-range-query-structures/`. Concept ids are kebab-case. A concept is in `uses` only if an earlier topic introduces it, or this topic `declared` it. The ledger is per domain; ids Data Engineering and Rust Systems Engineering also use keep the same meaning here.

**Skipped in this chapter** (stay in the curriculum, get no reel, per `syllabus/review-notes/dsa-cuts.md`): Sparse tables and RMQ (§8.1, the static-only, update-free alternative); Square-root decomposition and Mo's algorithm (§8.1, block decomposition and offline query reordering for awkward update patterns). Where the syllabus's own *Lab* bullet needs a piece that doesn't depend on a skipped structure (benchmarking a Fenwick tree and a lazy segment tree against each other at varying update/query ratios), the piece is kept across topics 33–34 and the sparse-table leg of the Lab is left out — see "Notes for the release run" below.

### 33. Fenwick trees (`dsa.fenwick-trees`): full, §8.1

- **Folder:** `fenwick-trees`. About 13 min.
- **Scope (syllabus clause → what it delivers):**
  - "lowest-set-bit indexing for prefix sums with point updates in O(log n)": the real arithmetic — a Fenwick tree stores, at index i, a partial sum covering a range determined by i's own lowest set bit; a point update at index i walks forward by repeatedly adding that index's own lowest set bit; a prefix-sum query up through index i walks backward by repeatedly subtracting it — both O(log n), both verified against a current primary or well-documented source, not assumed from memory.
  - "range-update/range-query with two trees": the direct extension from a single prefix-sum Fenwick tree to supporting a range-wide add (add a constant to every position in a range) and answering a range sum query, using two Fenwick trees together rather than one.
  - "2D Fenwick trees": the same lowest-set-bit indexing applied along two dimensions at once, for a point update and a prefix-sum query over a 2D grid, named and demonstrated at a small scale, not built out to a full production-scale grid.
- **Outcomes:**
  - Compute a Fenwick tree's own point-update and prefix-sum-query index sequences by hand, using lowest-set-bit arithmetic, and explain why each is O(log n).
  - Derive a range-sum query from two prefix sums, and extend a single Fenwick tree to a range-update/range-query pair using two trees.
  - State what a 2D Fenwick tree computes and why its own indexing is the 1D case applied along two dimensions at once.
- **Introduces:** `fenwick-tree`, `lowest-set-bit-indexing`, `prefix-sum-query`. **Uses:** none from an earlier chapter as a reused mechanism (the plain array is assumed background, not a reused technique). **Declared:** none new beyond its own.
- **Bridge:** word for word, Chapter 7's own handoff above ("Tries answered where a string lives... Fenwick trees, next.").
- **Handoff:** "A Fenwick tree answers one specific aggregate — a running sum — in O(log n) for both a point update and a prefix-sum query, using nothing but one array and lowest-set-bit arithmetic. It can't answer a range minimum, and it can't apply one update to an entire range without extending it. Segment trees, next: the fully general structure, built to answer any associative aggregate over any range, with a range-wide update costing no more than a single point update does here."
- **Prerequisites panel:** none from an earlier chapter as a direct prerequisite (lowest-set-bit arithmetic is introduced fresh in this topic). On-site: none new.
- **Visual idea:** a row of array slots with a small Fenwick-tree overlay above them; a point update and a prefix-sum query each drawn as a short sequence of index jumps, each jump's own lowest set bit highlighted in binary; a real comparison/operation-count bar chart, a naive O(n) rebuild against the Fenwick tree's own O(log n) path, on the identical update sequence.
- **Sources to start from:** a current, careful textbook or course treatment of Fenwick trees (binary indexed trees) and their lowest-set-bit arithmetic (a standard algorithms reference, verified at research time).

### 34. Segment trees and lazy propagation (`dsa.segment-trees-lazy-propagation`): full, §8.1

- **Folder:** `segment-trees-lazy-propagation`. About 14 min.
- **Scope (syllabus clause → what it delivers):**
  - "recursive and iterative (bottom-up) layouts": a segment tree built two ways on the identical array — the straightforward recursive version (each node covers a range, split in half at its two children) and the iterative, bottom-up array layout (no pointers, no recursion, index arithmetic only) — both verified to compute the identical answers, contrasted for simplicity against raw speed.
  - "arbitrary associative combine functions": the structure generalized beyond sum to any associative operator (minimum, maximum, gcd, or another), with the same O(log n) query and update bound holding regardless of which operator is plugged in, verified directly by building the identical tree shape with more than one operator.
  - "lazy tags for range assignment and range add, and what makes a tag composable": a pending update stored at an internal node instead of pushed immediately to every leaf beneath it, applied lazily only when a later query actually needs to descend past that node; the specific property (composability) that lets two pending tags on the same node merge into one before either is pushed down, verified with a real example where it matters (a range-add tag followed by another range-add tag on the same node) and a case where composability breaks (an assignment tag that must override, not combine with, a later add).
- **Outcomes:**
  - Build a segment tree both recursively and as a bottom-up array layout, and confirm both answer the identical range query.
  - Build the identical tree shape with a different associative combine function (not just sum) and show the same O(log n) bound holds.
  - Explain lazy propagation's own deferred-update mechanic, and work through a real example where two pending tags compose into one versus a case where they can't.
- **Introduces:** `segment-tree`, `lazy-propagation`, `associative-combine-function`, `range-update-bound`. **Uses:** `fenwick-tree` (topic 33, as the structure this one is contrasted against and generalizes past). **Declared:** none new beyond its own.
- **Bridge:** word for word, topic 33's own handoff above ("A Fenwick tree answers one specific aggregate... Segment trees, next.").
- **Handoff:** "Fenwick trees and segment trees both answer aggregate questions over a changing array in O(log n), whichever one fits the operator and the update pattern. The next chapter asks a different question about dimension instead: not where a value sits along one array, but how to order points scattered across two or three dimensions so that nearby points end up nearby in a single linear ordering. Space-filling curves, next."
- **Prerequisites panel:** `dsa.fenwick-trees` (Before this: the O(log n) range-query bound this topic generalizes past, and the specific gap — range minimum, range-wide updates — this topic exists to close). On-site: none new.
- **Visual idea:** a small binary tree drawn above the array, both as explicit recursive nodes and as a flat bottom-up array layout; a range query or update descending only into the nodes it actually needs, lit up one level at a time; a lazy tag drawn as a small marker sitting on an internal node until a later query forces it to push down into that node's own children; a real operation-count comparison, a segment tree without lazy tags (touching every leaf in a range update) against one with them.
- **Sources to start from:** a current, careful textbook or course treatment of segment trees, their recursive and iterative layouts, and lazy propagation (a standard algorithms reference, verified at research time).

---

## Concept ledger at a glance (introduces, in order)

33. `fenwick-tree`, `lowest-set-bit-indexing`, `prefix-sum-query`
34. `segment-tree`, `lazy-propagation`, `associative-combine-function`, `range-update-bound`

Each concept is introduced once. No concept is declared a second time in this chapter.

## Notes for the release run

1. **Verification discipline carries over from Chapters 1–7.** Every "to verify" claim above is a placeholder for the research stage (section 3 of the skill): fetch or read a current primary or well-documented source, quote or cite it in `SOURCES.md`, and only then commit the claim to `OUTLINE.md`. Nothing above is to be taken on screen from this plan's memory.
2. **Seams to check at release:** topic 33's own range-update/range-query (two-tree) extension against its own single-tree prefix-sum mechanic (the extension must be a real, verified construction, not asserted by analogy); topic 34's own segment-tree baseline against topic 33's own Fenwick tree where the chapter plan claims a direct contrast (the "what a Fenwick tree can't do" framing in topic 34's opening must be accurate to what topic 33 actually built, not a generic claim); topic 34's own handoff against Chapter 9's first topic's actual opening.
3. **The syllabus's own Lab bullet** ("implement a Fenwick tree, a lazy segment tree and a sparse table; benchmark range-sum and range-min workloads at varying update/query ratios and explain the winners per ratio") spans structures this chapter keeps and one it skips. Topic 33's `examples.py` builds and measures the Fenwick-tree side (point update and prefix-sum/range-sum cost). Topic 34's `examples.py` builds and measures the segment-tree side (range-sum and range-min cost, with and without lazy tags, at varying update/query ratios). The sparse-table leg of the Lab depends on a structure this chapter skips entirely (it answers no update at all) and is not reproduced by any topic in this chapter.
4. **Cross-domain links:** none this chapter's syllabus line names. This chapter builds the structures; it does not forward-link to another domain's own topics.
