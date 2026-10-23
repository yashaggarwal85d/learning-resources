# Chapter 7 plan: Tries and Ordered String Dictionaries (Data Structures & Algorithms, Milestone 1)

This is the contract for this chapter's one surviving topic. Builders keep to their own entry. If a topic really can't keep to its entry, record why under `OUTLINE.md` → "Changes from the chapter plan" and say so in the report.

- **Planned:** 23 October 2026, from `syllabus/data-structures-and-algorithms.md` (Chapter 7, §7.1–§7.2) and Chapter 6's final handoff.
- **Registry fields shared by every topic:** `domain: 'data-structures-and-algorithms'`, `milestone: { number: 1, title: 'Data Structures' }`, `chapter: { number: 7, title: 'Tries and Ordered String Dictionaries', section: '7.1' }`. The registry `title` and `syllabusTitle` are both the syllabus title word for word.
- **Folders:** the topic lives in `…/m1-data-structures/ch07-tries-ordered-string/<folder>`, next to this file.
- **Inherits from earlier chapters** (not re-taught; used directly): a trie node's own choice of child representation is itself a direct reuse of two earlier structures — a hash table (Chapter 3; a node's children held in a small hash map keyed by character) and a sorted structure searched by comparison (Chapters 2 and 4; a node's children held as a sorted list, found by binary search, or as a small binary-search-tree-shaped ternary search tree). Neither is reintroduced as a mechanism; this chapter names them as the specific representations a trie node can use and measures the trade-off between them directly.

---

## The chapter

### The problem it solves

Every structure so far — hash tables, balanced trees, B-trees, LSM-trees, heaps, tournament trees — answers some version of "which key, or which value, right now," by comparing whole keys against each other (or, for heaps and tournament trees, comparing whole values). This chapter asks a different question entirely: given a string, where does it live, and how fast can that be found out, in a way that depends only on the string's own length, never on how many other strings are stored? A trie answers this by keying on the characters (or bits) of the string itself rather than comparing whole strings against each other: each node represents one shared prefix, and walking from the root one character at a time either finds the string or proves it isn't there, in O(key length) time, independent of n. That independence from n is the chapter's whole point, and it comes at a real cost this chapter measures directly: a trie's own memory footprint, which the choice of node representation controls.

### Order of ideas, and why

1. **§7.1 Tries (32).** Tries and node representations (32: a trie's own shape; array children for fast, dense alphabets; hash children for sparse alphabets; sorted-list children searched by binary search; ternary-search-tree children, each node itself a small BST over one character; the O(key length) lookup bound, independent of n; and the memory blow-up — most array-child nodes mostly empty — that is the direct reason every later trie variant this syllabus names, and skips, exists to fix). Radix and Patricia trees, longest-prefix-match lookup, and adaptive radix trees (ART) are all skipped (see "Skipped in this chapter" below); this chapter keeps the one structure every skipped variant builds on, and the specific memory problem that motivates them, without re-deriving any of their own fixes.
2. **§7.2 Automata as dictionaries.** Finite-state transducers are skipped (see below); this chapter's one topic is also, therefore, the whole chapter — there is no second topic to sequence it against.
3. **Handoff to Chapter 8.** Topic 32 ends on its own measured memory cost, having answered "where does a string live" independent of how many strings there are. Chapter 8 asks a related but different question: given a long sequence of numbers, how do you answer a running sum, or update one value, without re-scanning everything each time — a question about position in a sequence, not about a string's own characters.

### One running example: a small dictionary of words

Chapters 1–6 kept one record format (the log's own timestamped records). This chapter's own example needs a different shape — strings, not single-field records — so topic 32 builds its own small dictionary of English words (or another short, consistent string set) and inserts, looks up, and measures memory for all four node representations on the identical set. Every number on screen is computed or asserted in the topic's own `examples.py`; the values here are planning values, and the builder who finds one wrong fixes it in `examples.py` and records it in `REVIEW.md`.

| Piece | Planning values (the builder computes and asserts its own) | Used by |
|---|---|---|
| The key | a short string (an English word, or another short consistent string), distinct from every earlier chapter's single-orderable-field key | 32 |
| Dictionary size | large enough that a memory-per-node difference between representations is visible, small enough that every example fits one frame's worth of explanation | 32 |
| Alphabet | a small, fixed character set (lowercase English letters, or another small fixed alphabet), consistent across all four representations measured | 32 |

### Shared notation and terms

- **Trie (prefix tree):** a tree keyed on the characters of a string, one node per shared prefix, where a lookup walks one character at a time from the root.
- **Node representation:** the specific data structure a trie node uses to store its own children — array, hash, sorted list, or ternary search tree — the chapter's own central variable.
- **O(key length), independent of n:** this chapter's headline cost measure, distinguished explicitly from every earlier chapter's own O(log n)-style bounds, which do depend on how many keys are stored.
- **Spoken numbers:** narration has no digits, symbols or code names (automatic check); say "order key length," "array children," "hash children," and add new terms the first time each appears (`trie`, `node representation`, `ternary search tree`, QUALITY.md #29).

### One visual language for the chapter's reel

The chapter builds from `site/src/reels/kit.tsx` and `DESIGN.md`'s briefing theme (PROJECT_PLAN.md, "Theme — briefing"): black and white carry everything, colour is rare and means something. On top of that this chapter shares one grammar:

- **Colour:** `crema` a trie's own live state (the nodes and edges actually walked or stored); `latte` secondary labels (a node's own character, a representation's own name); `taupe` an empty/unallocated child slot, especially in the array representation, where most slots are empty; `caramel` **the thing to look at**: the path a lookup actually walks, character by character; `cinnamon` (rare) **the alternative being compared**: one node representation's memory footprint set directly against another's, always the same pairing; `cherry` with `cherryText` **the bad outcome**: the memory an array-child node wastes on slots that are never filled.
- **The trie is drawn the same way regardless of node representation:** a root-to-leaf path highlighted character by character as a lookup walks it, with the node's own internal child-storage choice (an array of slots, a small hash table, a sorted list, a tiny BST) drawn explicitly inside each node, never hidden — the whole point of this topic is that the path length is identical across all four representations, and only the per-node storage, and so the memory, differs.
- **Memory contrast:** four node representations' own memory-per-node measured on the identical dictionary, side by side, never a claimed ratio without the real counted bytes behind it.
- **Reel shape.** Topic 32 is a full topic (about 12–14 minutes, 2–4 predict questions): open on the problem (what does a hash table or balanced tree actually compare, and what if the key is a string with a lot of shared structure with its neighbours), a predict question in the first three to four steps, the four node representations in turn, the memory blow-up, then "Prove it."

---

## The topics, in syllabus order

Folder prefix: `site/src/topics/data-structures-and-algorithms/m1-data-structures/ch07-tries-ordered-string/`. Concept ids are kebab-case. A concept is in `uses` only if an earlier topic introduces it, or this topic `declared` it.

**Skipped in this chapter** (stay in the curriculum, get no reel, per `syllabus/review-notes/dsa-cuts.md`): Radix and Patricia trees, Longest-prefix-match lookup, Adaptive radix trees (ART) (§7.1); Finite-state transducers (§7.2). Where the syllabus's own *Lab* bullet needs a piece that doesn't depend on a skipped structure (comparing a plain trie's own memory and lookup cost across node representations against a sorted array with binary search), the piece is kept in topic 32 and the Patricia-trie- and ART-specific slices of the Lab are left out — see "Notes for the release run" below.

### 32. Tries and node representations (`dsa.tries-node-representations`): full, §7.1

- **Folder:** `tries-node-representations`. About 13 min.
- **Scope (syllabus clause → what it delivers):**
  - "array, hash, sorted-list and ternary-search-tree children": all four node representations built and measured on the identical dictionary — array children (one fixed-size slot per possible character, O(1) access, but mostly empty for a sparse alphabet); hash children (a small hash table per node, keyed by character, reusing Chapter 3's hashing directly); sorted-list children (a node's children kept sorted, found by binary search, reusing the comparison-based search this course has used since Chapter 1); ternary-search-tree children (each node itself a tiny binary-search-tree-shaped structure over one character, reusing Chapter 4's own BST shape at the level of a single node's children) — each verified against a current primary or well-documented source, not assumed from memory.
  - "O(key length) lookup independent of n": the real argument for why a trie lookup's cost depends only on the string's own length, never on how many other strings are stored — each step down the trie consumes one character and moves to exactly one child, so the total work is bounded by the key's own length, not by the size of the dictionary.
  - "the memory blow-up that drives every later design": the array representation's own cost made concrete and measured — most of a sparse trie's array-child nodes are mostly empty slots, and that wasted memory, counted directly, is the exact problem every skipped later variant (Patricia trees' path compression, ART's adaptive node sizes) exists to fix, named here as the frontier, not re-derived.
- **Outcomes:**
  - Build a trie over a small dictionary using each of the four node representations, and trace a lookup through each one.
  - State and justify the O(key length) lookup bound, independent of n, and contrast it with an earlier chapter's own O(log n)-style bound.
  - Measure and explain the real memory cost of each node representation on the identical dictionary, and name which later, skipped design each one's own weakness motivates.
- **Introduces:** `trie`, `node-representation`, `trie-lookup-bound`. **Uses:** `separate-chaining` (Chapter 3, as the hash-children representation's own reused mechanism); `binary-search-tree` (Chapter 4, as the ternary-search-tree representation's own reused shape, one BST per node's children). **Declared:** none new beyond its own.
- **Bridge:** word for word, Chapter 6's own handoff above ("Every structure in this chapter answered the same question... Tries, next.").
- **Handoff:** "Tries answered where a string lives, independent of how many strings are stored — a question about a key's own characters. The next chapter asks a different question about position instead: given a long sequence of numbers, how do you answer a running sum, or update a single value, without re-scanning everything each time it's asked? Fenwick trees, next."
- **Prerequisites panel:** `dsa.separate-chaining` (Before this: the hash table a trie node's own hash-children representation reuses directly); `dsa.bst-operations-rotations` (Before this: the binary-search-tree shape a trie node's own ternary-search-tree representation reuses, one BST per node). On-site: none new.
- **Visual idea:** a trie drawn as a root-to-leaf path highlighted character by character as a lookup walks it, with each of the four node representations shown explicitly inside a node (an array of mostly-empty slots, a small hash table, a sorted list, a tiny BST); a memory-per-node bar chart across all four representations on the identical dictionary, with the array representation's own wasted space called out directly.
- **Sources to start from:** a current, careful textbook or course treatment of trie structures and node-representation trade-offs (a standard algorithms reference, verified at research time); a current reference on ternary search trees specifically (their own common name and structure are less universally known than the other three representations, so this needs independent confirmation).

---

## Concept ledger at a glance (introduces, in order)

32. `trie`, `node-representation`, `trie-lookup-bound`

Each concept is introduced once. No concept is declared a second time in this chapter.

## Notes for the release run

1. **Verification discipline carries over from Chapters 1–6.** Every "to verify" claim above is a placeholder for the research stage (section 3 of the skill): fetch or read a current primary or well-documented source, quote or cite it in `SOURCES.md`, and only then commit the claim to `OUTLINE.md`. Nothing above is to be taken on screen from this plan's memory.
2. **Seams to check at release:** topic 32's own hash-children representation against Chapter 3's actual hashing mechanics (the reuse must be the identical mechanism, not a generic claim); topic 32's own ternary-search-tree representation against Chapter 4's actual BST mechanics (same caveat); topic 32's own handoff against Chapter 8's first topic's actual opening.
3. **The syllabus's own Lab bullet** ("build a plain trie, a Patricia trie and an ART over 10M URLs or IP prefixes; compare memory per key, lookup latency and range-scan speed against a sorted array with binary search") spans a structure this chapter keeps and structures it skips. Topic 32's `examples.py` builds and measures the plain-trie side only: memory per key and lookup cost, across all four node representations, against a sorted array with binary search as the chapter's own stated baseline. The Patricia-trie and ART slices of the Lab depend on structures this chapter skips entirely and are not reproduced by any topic in this chapter.
4. **Cross-domain links:** none this chapter's syllabus line names. This chapter builds the structure; it does not forward-link to another domain's own topics.
