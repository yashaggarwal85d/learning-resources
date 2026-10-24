## Princeton COS 226 (Sedgewick & Wayne) — "5.2 Tries"

URL: https://www.cs.princeton.edu/courses/archive/spring23/cos226/lectures/52Tries.pdf
Version: fetched 2026-10-23

> Store characters in nodes (not keys).

> Each node has up to R children, one for each possible character in alphabet.

> Parameters. n = number of key–value pairs; L = length of key; R = alphabet size.

> Search hit. Θ(L).

> Space. At least Θ(n R) space.

> at least R links per key

> Bottom line. Fast search hit; even faster search miss; but wastes space.

> 26-way trie. 26 null links in each leaf.

> TST. 3 null links in each leaf.

> A TST node is five fields:

> A character.

> A reference to a left TST.

> A reference to a middle TST.

> A reference to a right TST.

> A value.

> Bottom line. TST is as fast as hashing (for string keys) and space efficient.

### Contents (item by item, this topic's scope)

- The abstract trie: characters, not keys, live in the nodes; each node holds up to R child links, one per possible alphabet character.
- The cost model: n = number of stored keys, L = length of the key being searched, R = alphabet size; a search hit costs Θ(L), independent of n.
- The array representation's own memory cost (at least Θ(nR) space, at least R links per key) and its own stated bottom line: fast lookup, wasted space.
- The ternary-search-tree node's own five fields (a character, a value, and three child references: left, middle, right) and the direct, measured null-link comparison against a 26-way array trie on the identical key set (26 null links per leaf for the array trie vs. 3 for the TST — 1035 vs. 155 null links on the same keys), with TST's own stated bottom line: as fast as hashing, and space efficient.

## UW CSE 373 — "Lec 23: Tries"

URL: https://courses.cs.washington.edu/courses/cse373/20su/lectures/23.pdf
Version: fetched 2026-10-23

> Instead of two children, we have 128 possible children

> How could we store these 128 children?

> 𝑅 = 128 links, 127 null (unused)

> Hash Table-based Implementation • Use Hash Table to find character at a given index

> BST-based Implementation • Use Binary Search Tree to find character at a given index

> Two types of children:

> 1) "Trie" child: advance a character (index)

> 2) "Internal" child: another character

> option at current character (index)

> Ternary Search Tree (TST) Implementation • Combines character mapping with Trie itself

> "Internal" left child (smaller character at same index)

> "Internal" right child (greater character at same index)

> "Trie" child: advance to next String index

> DataIndexedCharMap takes up a lot of space by storing R links per node

### Contents (item by item, this topic's scope)

- The array representation named explicitly as a fixed-size array of child links (128 possible children for an ASCII alphabet), with the exact waste counted: 128 links, 127 of them null, after storing a single character.
- Hash-table children: a hash table used to find the child for a given character, as its own named alternative to the array.
- BST children: a binary search tree used to find the child for a given character — this course's closest documented variant to a plain comparison-searched (binary-search) child list, used here for the chapter's "sorted-list children searched by binary search" representation.
- Ternary-search-tree children, independently described: one "trie" child that advances to the next string position, plus two "internal" siblings (smaller and greater character, same position) — consistent with Princeton's own five-field TST node.
- The array representation's own space cost, named a second, independent time: "a lot of space" from storing R links per node.

## Wikipedia — "Ternary search tree"

URL: https://en.wikipedia.org/wiki/Ternary_search_tree
Version: fetched 2026-10-23

> In computer science, a ternary search tree is a type of trie (sometimes called a prefix tree) where nodes are arranged in a manner similar to a binary search tree, but with up to three children rather than the binary tree's limit of two.

> However, ternary search trees are more space efficient compared to standard prefix trees, at the cost of speed.

> Each node of a ternary search tree stores a single character, an object (or a pointer to an object depending on implementation), and pointers to its three children conventionally named equal kid, lo kid and hi kid, which can also be referred respectively as middle (child), lower (child) and higher (child).

> The lo kid pointer must point to a node whose character value is less than the current node. The hi kid pointer must point to a node whose character is greater than the current node.

> The equal kid points to the next character in the word.

### Contents (item by item, this topic's scope)

- A third, independent statement of the ternary-search-tree node's own shape (one character, three named children: lo/equal/hi), and its own stated trade-off — more space efficient than a standard (array) trie, at some cost in speed — cross-referencing Princeton's own null-link measurement.

Note on the "sorted list" representation: the chapter plan (`CHAPTER.md`) names "sorted-list children searched by binary search" as a representation distinct from the ternary-search-tree's own BST-per-node shape. No source fetched describes a plain sorted-array-with-binary-search child list as its own separately-named trie variant; UW's "BST-based implementation" above is the closest documented comparison-searched alternative to the array representation. `examples.py` implements the sorted-list representation directly — a Python list kept sorted by character, searched with the standard library's `bisect` — as a general application of binary search, the same comparison-search technique this course has used since Chapter 1, rather than a claim requiring its own primary source.
