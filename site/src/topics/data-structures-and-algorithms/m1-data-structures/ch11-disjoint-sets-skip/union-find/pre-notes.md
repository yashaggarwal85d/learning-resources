- **Forest / rooted tree**: a set of trees where each node has at most one parent, and a root has none. *Where you meet it:* every structure in this topic is one or more of these.
- **Parent pointer**: a node storing a reference to the one node above it, with a root pointing at itself. *Where you meet it:* the `parent` array this topic draws.
- **Tree depth**: the number of edges from a node up to its tree's root. *Where you meet it:* what a naive `Find` costs, one step per edge.
- **Amortized cost**: the average cost per operation over a whole sequence, even when individual operations vary a lot. *Where you meet it:* this topic's headline bound describes a sequence of calls, not any single one.
- **Logarithm base two**: how many times a quantity can be halved before reaching one. *Where you meet it:* the height bound union by rank guarantees.
- **Ackermann function**: a function, defined by repeating simpler operations on themselves, that grows faster than any function built from ordinary addition, multiplication and exponentiation. *Where you meet it:* only by name, as the thing this topic's bound is the inverse of.

**Check yourself:** if a tree holds 16 elements and every merge only ever joins two trees of the same height, how many merges does it take to reach one single tree? (Answer: four — 16 to 8 to 4 to 2 to 1 trees, one merge round per halving.)
