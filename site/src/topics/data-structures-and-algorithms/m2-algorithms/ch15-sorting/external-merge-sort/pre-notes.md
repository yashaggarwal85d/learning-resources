- **Block** (one line): the unit a disk or SSD actually transfers; reading one byte costs
  the same I/O as reading the whole block it lives in. *Where you meet it:* every pass
  count in this topic is really a count of block transfers, not item comparisons.
- **Buffer**: the in-memory space held for one block's worth of data while it is read or
  written. *Where you meet it:* the merge keeps one buffer per input run plus one for
  output, and that buffer count is what limits the fan-in.
- **Run** (carried over from topic 49): a maximal sorted stretch, here written out to disk
  rather than kept in memory. *Where you meet it:* pass 0 of this topic's algorithm makes
  nothing but runs.
- **Pass over a file**: one read-through (and usually a write-through) of every block.
  *Where you meet it:* the whole cost of external merge sort is counted in passes, since
  each pass moves every block once.
- **Fan-in**: the number of runs merged into one at a time in a single pass. *Where you
  meet it:* a bigger fan-in means fewer passes, but it is bounded by how many buffers fit
  in memory at once.
- **Heap and loser tree** (carried over from Chapter 6): a heap always gives the smallest
  remaining item; a loser tree is a tournament that does the same for a k-way merge in
  ⌈lg k⌉ comparisons. *Where you meet it:* replacement selection runs on a heap; the
  multi-way merge runs on a loser tree.
- **N, M and B in items** (carried over from Chapter 1's I/O model): N is the file's total
  size, M is how much fits in memory at once, B is one block's size — all measured in the
  same unit (items). *Where you meet it:* every formula in this topic is written in terms
  of these three numbers alone.
