## Wikipedia — "K-way merge algorithm"

URL: https://en.wikipedia.org/wiki/K-way_merge_algorithm
Version: fetched 2026-10-23

> A straightforward implementation would scan all k arrays to determine the minimum.
This straightforward implementation results in a running time of Θ(kn).

> We can improve upon this by computing the smallest element faster.
By using either heaps, tournament trees, or splay trees, the smallest element can be determined in O(log k) time.

> The heap is more commonly used, although a tournament tree is faster in practice. A heap uses approximately 2*log(k) comparisons in each step because it handles the tree from the root down to the bottom and needs to compare both children of each node. Meanwhile, a tournament tree only needs log(k) comparisons because it starts on the bottom of the tree and works up to the root, only making a single comparison in each layer. The tournament tree should therefore be the preferred implementation.

> The Tournament Tree [3] is based on an elimination tournament, as in sports competitions. In each game, two of the input elements compete. The winner is promoted to the next round. Therefore, we get a binary tree of games. The list is sorted in ascending order, so the winner of a game is the smaller one of both elements.

> For k-way merging, it is more efficient to only store the loser of each game (see image). The data structure is therefore called a loser tree.

> The algorithm iteratively appends the minimum element to the result and then removes the element from the corresponding input list. It updates the nodes on the path from the updated leaf to the root (replacement selection). The removed element is the overall winner. Therefore, it has won each game on the path from the input array to the root. When selecting a new element from the input array, the element needs to compete against the previous losers on the path to the root.

> When one of the leaves is updated, all games from the leaf to the root are replayed.

> A tournament tree can be represented as a balanced binary tree by adding sentinels to the input lists (i.e. adding a member to the end of each list with a value of infinity) and by adding null lists (comprising only a sentinel) until the number of lists is a power of two.

> In each step of merging, only the games on the path from the new element to the root need to be replayed. In each layer, only one comparison is needed. As the tree is balanced, the path from one of the input arrays to the root contains only Θ(log k) elements. In total, there are n elements that need to be transferred. The resulting total running time is therefore in Θ(n log k).[3]

> k-way merges are used in external sorting procedures.[4] External sorting algorithms are a class of sorting algorithms that can handle massive amounts of data.

> k-way merge algorithms usually take place in the second stage of external sorting algorithms, much like they do for merge sort.

> A multiway merge allows for the files outside of memory to be merged in fewer passes than in a binary merge. If there are 6 runs that need be merged then a binary merge would need to take 3 merge passes, as opposed to a 6-way merge's single merge pass.

### Contents (item by item, this topic's scope)

- A naive scan of all k runs' current heads costs Θ(k) per output element; a heap costs roughly 2·log(k) comparisons per step (both children compared at every level on the way down); a tournament/loser tree costs only log(k) comparisons per step (one comparison per layer, on the way up).
- The tournament tree's own elimination-bracket structure, and the loser-tree variant that stores only each game's loser, keeping the overall winner above the root.
- The exact repair mechanic: only the single path from the newly refilled leaf up to the root is replayed; every other node in the tree is untouched.
- The balanced-tree construction (sentinels for exhausted lists, null lists padded to a power of two) that keeps the path length at Θ(log k).
- The real-world destination: k-way merges are the second stage of external sorting, and a wider merge (6-way vs. binary) directly cuts the number of merge passes needed.

## TutorialsPoint — "Tournament Trees, Winner Trees and Loser Trees in Data Structure"

URL: https://www.tutorialspoint.com/article/tournament-trees-winner-trees-and-loser-trees-in-data-structure
Version: fetched 2026-10-23

> The Tournament tree is a complete binary tree with n external nodes and n – 1 internal nodes. The external nodes represent the players, and the internal nodes are representing the winner of the match between the two players.

> An advantage of the looser is that, to restructure the tree after winner tree been output, it is sufficient to examine node on the path from leaf to root rather than the sibling of the nodes on this path.

### Contents (item by item, this topic's scope)

- A second, independent statement of the tournament tree's own shape (n external "player" nodes, n−1 internal nodes) and the loser tree's own advantage: restructuring touches only the leaf-to-root path, not every sibling along the way.
