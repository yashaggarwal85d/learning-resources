# Pre-notes — Search trees inside storage engines

- **Page:** the fixed-size unit a storage engine reads and writes, the production stand-in for
  a B+-tree node.
- **Heap (an unordered table file):** where a database keeps its actual rows; a B+-tree index
  points *into* the heap rather than storing the row itself.
- **Tuple identifier:** the address of one row inside the heap (which page, which slot on it),
  carried in an index entry so the entry knows exactly which row it points to.
- **Sequence number:** a number that increases with every write, used to tell two versions of
  the same key apart and to say which one is newer.
- **Snapshot:** a fixed point in that sequence a reader commits to, so later writes stay
  invisible to it until it is done reading.
- **Tombstone:** a marker written for a delete, sorted and found exactly like an ordinary write
  so a reader can tell "deleted" from "never written."
- **Block cache:** the in-memory cache a storage engine keeps for pages it has recently read
  from disk, shared between data pages and the index structures that point at them.
- **Top-level index:** a small index over a larger structure's own pieces, letting a reader load
  only the one piece it needs instead of the whole structure.
