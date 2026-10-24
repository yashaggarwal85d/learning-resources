# Outline — Tries and node representations (topic 32, dsa.tries-node-representations, full)

## Learning outcomes

- Build a trie over a small dictionary using each of four node representations, and trace a lookup through each one.
- State and justify the O(key length) lookup bound, independent of n, and contrast it with an earlier chapter's own O(log n)-style bound.
- Measure and explain the real memory cost of each node representation on the identical dictionary, and name which later, skipped design each one's own weakness motivates.

## Engagement arc (full topic: 3 predicts, 13-14 min)

- **Hook** (step 1): every structure so far compared whole keys against each other; a trie compares one character at a time instead, and that choice changes what the cost depends on.
- **Predict 1** (step 3, "CostPredict"): does a trie lookup's cost depend on how many other keys are stored?
- **Predict 2** (step 5, "ArrayPredict"): what happens to an array-child node's own memory as the alphabet gets wider but the dictionary stays sparse?
- **Predict 3** (step 8, "TSTPredict"): can a representation beat the array's memory without giving up the array's own O(1)-per-character step?
- **Surprising number**: `examples.py`'s own measured bytes per representation on the identical 21-word dictionary — the array representation measured at 96.3% wasted (null) child slots.
- **Takeaways** (steps 4, 7, 9).
- **Recap** (step 10, "ProveIt").

## 10-step reel storyboard

1. **Opening.** *Title:* "Every structure this course has built so far — hash tables, balanced trees, heaps, loser trees — answers 'which key, right now' by comparing whole keys, or whole values, against each other. A trie asks a different question: given a string, where does it live, found out one character at a time?" *Body:* "Not comparing keys to each other anymore — walking the string's own characters instead." *Visual:* a handful of words sharing prefixes, drawn first as entries in a hash table, then redrawn as a tree of shared prefixes.

2. **TrieReveal.** *Title:* "A trie stores characters in its nodes, not keys: each node has one child per possible next character, and walking from the root one character at a time either finds the string or proves it isn't there." *Body:* "The node for 'ca' is shared by every word that starts 'ca' — 'cat', 'car', 'care', 'cart' all walk through it." *Visual:* the word list's shared-prefix tree, root to leaves, each edge labeled with one character.

3. **CostPredict.** *Title:* "A trie lookup walks one character at a time, stopping at the key's own length. Does that cost depend on how many other keys are stored in the trie?" *Predict options:* (a) "Yes — more stored keys means more nodes to search through" (b) "No — the cost depends only on the key's own length", correct (c) "Yes, but only logarithmically, the same as a balanced tree" (d) "It depends on the alphabet size, not the key or the dictionary." *Visual:* the same trie redrawn twice, once sparse and once with many more words added, a lookup path highlighted in both.

4. **CostReveal.** *Title:* "Every chapter before this one paid a cost that grew with n — the number of keys stored. A trie lookup pays for exactly the key's own length, L, and nothing else: each step consumes one character and moves to exactly one child." *Body:* "Add a million more words to the dictionary. This lookup's cost doesn't move." *Visual:* the lookup path lit up identically across both trie sizes, a step counter ticking exactly to the key's length each time.
   *Takeaway (step 4):* "A trie lookup costs exactly the key's own length — adding more stored keys never changes it."

5. **ArrayPredict.** *Title:* "The most direct way to store a node's children is a fixed-size array, one slot per possible character. For a sparse dictionary over a 26-letter alphabet, what happens to most of those slots?" *Predict options:* (a) "Most stay empty — one node rarely has anywhere near 26 real children", correct (b) "Most fill up, because every letter eventually appears somewhere" (c) "Exactly half stay empty, on average, for any alphabet" (d) "None stay empty — a trie only allocates a slot when it's used." *Visual:* one trie node's own 26-slot array, most slots drawn as hollow boxes.

6. **ArrayReveal.** *Title:* "Array children: one slot per possible character, found in one step with no comparison at all — and, measured on this exact 21-word dictionary, 96.3 percent of those slots sit empty." *Body:* "Fast to the point of free. The cost shows up somewhere else entirely: in memory that was allocated but never used." *Visual:* every node's own array drawn at once, the vast majority of slots shown hollow, the few filled ones highlighted.

7. **AlternativesReveal.** *Title:* "Three other ways to store the same children, each trading the array's free lookup step for something smaller: a hash table keyed by character, a sorted list of children searched by binary search, or a ternary search tree — a tiny three-child structure built around comparing one character at a time." *Body:* "Same shared-prefix tree underneath. Only the per-node storage changes." *Visual:* the identical trie node redrawn three more times, its children held as a hash table, a sorted list, and a tiny three-child comparison structure in turn.
   *Takeaway (step 7):* "Array, hash, sorted-list and ternary-search-tree children all answer the same question — they just store a node's children differently, trading lookup speed against memory."

8. **TSTPredict.** *Title:* "A ternary search tree still walks one character at a time, like the array — it just uses two extra comparisons per node instead of a direct slot. Can it beat the array's own memory without losing that one-character-per-step discipline?" *Predict options:* (a) "No — saving memory always costs at least one extra traversal step per character" (b) "Yes — comparing against one stored character, not indexing into 26 slots, needs far less memory per node", correct (c) "No — three child pointers always cost more than one array" (d) "Yes, but only by giving up the O(key length) bound entirely." *Visual:* one TST node's own three fields — a character, and three child references — set directly beside the array node's own 26 slots.

9. **TSTReveal.** *Title:* "A ternary search tree node holds exactly one character, a value, and three children: lo and hi compare against the same character position, equal advances to the next one — the array's own one-step-per-character discipline, kept, with three references instead of 26 slots." *Body:* "Measured on the identical dictionary, the ternary search tree used the least memory of all four representations." *Visual:* the full dictionary's TST, three-way branches at every node, set beside the array trie's own mostly-hollow nodes.
   *Takeaway (step 9):* "A ternary search tree keeps the trie's own one-character-per-step cost while storing only three child references per node, not R."

10. **ProveIt.** *Title:* "Prove it." *Body:* "Measured, not assumed: real bytes per representation, on the identical 21-word dictionary — array, hash, sorted-list, and ternary search tree — and the real fraction of an array node's own slots that go unused. This is also the exact problem every skipped later design (path compression, adaptive node sizes) exists to fix." *Visual:* four memory bars, populated with `examples.py`'s own measured byte counts.
    *Takeaway (step 10, within 20 words budget; see concept ledger):* "The array representation measured the most memory of all four, by a wide margin — exactly the gap later tries variants exist to close."

## Narrator's line of thought (one bullet per step)

1. Every structure so far compared whole keys or whole values to each other. Here's one that compares individual characters instead — worth noticing as a real shift, not a variation on the same idea.
2. The trie's own shape: shared prefixes as shared nodes, one character consumed per edge.
3. Before the reveal: think about what actually changes if the dictionary gets much bigger. Does the lookup even notice?
4. Here's the part worth sitting with: every earlier chapter's own bound depended on n. This one, for the first time, doesn't.
5. Before this reveal: picture one node's own array of 26 possible next characters, and ask how many of those slots a sparse dictionary would actually use.
6. The measured number lands harder than the word "most": 96.3 percent of this dictionary's own array slots are empty.
7. Same tree. Three different ways to store what's inside a node — worth seeing side by side before picking a favorite.
8. Before this reveal: the array's advantage was a single indexed lookup, no comparisons. Can something smaller still keep that one-step-per-character discipline?
9. The TST's own trick: it still moves one character at a time, it just does it by comparing against one stored character instead of indexing into a slot.
10. This is the one place every claimed number gets checked against a real count — and the one place to say plainly which representation this topic's own measurements favor.

## Post-notes headings

- **Internals**: the ternary-search-tree's own insert and lookup recursion (lo/hi compare the current character position, equal advances to the next one), and why it preserves the array's O(key length) bound despite adding comparisons.
- **Lab**: `examples.py`'s own real byte-count measurement across all four representations on the identical 21-word dictionary, plus the array representation's own null-slot fraction.
- **Production**: named in passing — the array representation's own memory blow-up is the exact, measured reason every later variant this syllabus names (Patricia trees' path compression, adaptive radix trees' variable node sizes) exists, without re-deriving their own fixes.
- **Frontier**: Radix and Patricia trees, longest-prefix-match lookup, and adaptive radix trees (ART), all skipped per the chapter's own cut list — named as the frontier this topic's own memory measurement motivates, not taught as mechanisms.
- **Where this goes next**: Chapter 8's own opening question — given a long sequence of numbers, how do you answer a running sum, or update one value, without re-scanning everything each time.

## Examples-to-execute list

1. Build a trie over the identical small word dictionary using all four node representations: array, hash, sorted-list (binary search), ternary search tree.
2. Trace a lookup for several present and absent keys through each representation, and assert all representations agree on hit/miss.
3. Count real lookup steps per key and assert it equals the key's own length, independent of dictionary size, for the array, hash, and sorted-list representations.
4. Measure real memory (bytes) for each representation on the identical dictionary using `sys.getsizeof`, recursively summing every node and its own child-storage container; assert the array representation uses the most memory of the four.
5. Count the array representation's own total child slots versus how many are actually filled, and assert most are null (empty) on this sparse dictionary.

## Bridge (topic 31's own handoff, quoted word for word)

"Tries answered where a string lives, independent of how many strings are stored — a question about a key's own characters. The next chapter asks a different question about position instead: given a long sequence of numbers, how do you answer a running sum, or update a single value, without re-scanning everything each time it's asked? Fenwick trees, next."

Note: `CHAPTER.md` quotes this same text as both this topic's own "Bridge" (word for word from Chapter 6's actual handoff) and as the forward-looking "Handoff" to Chapter 8 — matching the registry's actual topic-31 `handoff` field exactly (verified by grep against `registry.ts`).

## Handoff (this topic's own, quoted word for word from `CHAPTER.md`)

"Tries answered where a string lives, independent of how many strings are stored — a question about a key's own characters. The next chapter asks a different question about position instead: given a long sequence of numbers, how do you answer a running sum, or update a single value, without re-scanning everything each time it's asked? Fenwick trees, next."

## Concept ledger

- **Introduces:** `trie`, `node-representation`, `trie-lookup-bound`.
- **Uses:** `separate-chaining` (Chapter 3, as the hash-children representation's own reused mechanism); `binary-search-tree` (Chapter 4, as the ternary-search-tree representation's own reused comparison shape, one tiny BST-shaped structure per character position).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. A trie stores characters in nodes, not keys; each node has up to R children, one per possible alphabet character → Princeton COS 226 "5.2 Tries".
2. A trie search hit costs Θ(L), where L is the key's own length, independent of n → Princeton.
3. Array children: a fixed-size array of R links per node, found by direct index, no comparison → UW CSE 373 "Lec 23: Tries".
4. Hash children: a hash table used to find the child for a given character → UW.
5. Sorted-list / BST children: a binary search tree (this topic's closest documented variant to a plain binary-search-over-sorted-list) used to find the child for a given character → UW.
6. Ternary-search-tree children: a node holding one character, a value, and three child references (left/lo, middle/equal, right/hi); lo/hi compare the same character position, equal (middle) advances to the next character → Princeton (five-field Java node); UW (independently, "internal left/right" plus "trie child: advance to next string index"); Wikipedia "Ternary search tree" (a third, independent statement of the same three-child shape).
7. The array representation wastes space: Θ(nR) space, at least R links per key, measured directly against a TST on the identical key set (26 null links per leaf vs. 3, 1035 vs. 155 null links total) → Princeton.
8. A TST is as fast as hashing for string keys and is space efficient → Princeton; ternary search trees are more space efficient than standard prefix tries, at the cost of speed → Wikipedia (independent, second statement of the same trade-off).

## Claims not made

- No source fetched describes a plain sorted-array-with-binary-search child representation as its own separately named trie variant, distinct from a binary search tree. `examples.py` implements the sorted-list representation directly as a Python list kept sorted by character, searched with `bisect` — a direct, uncontroversial application of binary search, the same technique this course has used since Chapter 1 — and this topic does not claim a named primary source for that specific implementation choice beyond the general binary-search technique and UW's closest documented analogue (a binary search tree).
- Princeton's own null-link comparison (1035 vs. 155 null links, a 26-way trie vs. a TST) is quoted as that source's own specific example on its own key set, not assumed to be this topic's own measured ratio. `examples.py` measures its own 21-word dictionary independently and finds the array representation's own total memory is 4.48x the TST's, with 96.3% of the array's own child slots null — the same direction, a different exact number, reported honestly as this topic's own measurement rather than copying the source's figure onto a different dictionary.
- Radix and Patricia trees, longest-prefix-match lookup, and adaptive radix trees (ART) are named only as the frontier this topic's own memory measurement motivates, per the chapter plan's own skip list — not taught as mechanisms, and no claim is made about their own specific memory savings beyond what the chapter plan itself states (path compression, adaptive node sizes).
- Finite-state transducers (§7.2) are not mentioned; the chapter plan skips that section entirely, and this topic — the chapter's only surviving topic — makes no claim about automata-based dictionaries.
