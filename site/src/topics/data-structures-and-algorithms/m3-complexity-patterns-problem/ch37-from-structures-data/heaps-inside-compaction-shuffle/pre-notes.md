# Pre-notes — Heaps inside compaction, shuffle and top-N

- **Priority queue:** a structure that always gives up its smallest (or largest) kept element
  next; a binary heap is the usual implementation, Chapter 6's structure this topic reuses.
- **Min-heap and max-heap:** a heap ordered so the smallest element sits at the root, or so the
  largest does; the same array-based structure, the comparator flipped.
- **Comparator:** the rule that orders two entries; this topic's merges all use a comparator that
  is more than "smaller key first," since a tie on the key still has to be broken somehow.
- **Sequence number (version of a key):** a counter stamped on every write in an LSM store, so
  several versions of the same user key can be told apart and ordered newest to oldest.
- **Range tombstone:** a marked deletion covering a range of keys, carried through a merge like
  an ordinary entry until a compaction drops it and everything it shadows.
- **Top-N query:** a query that keeps only the N best rows by some order, not the whole sorted
  result; the chapter's dashboard asking for the ten most expensive orders is one.
- **Partition (of a dataset):** one independently processed slice of a larger job; a bounded
  top-N computed per partition first, then merged once more, is this topic's running pattern.
