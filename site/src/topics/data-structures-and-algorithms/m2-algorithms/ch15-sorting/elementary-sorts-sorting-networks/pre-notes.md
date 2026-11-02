# Pre-notes

Terms to know before this reel, per `CHAPTER.md`'s own list:

- **Array and index**: a fixed-size sequence of values, each reachable by its position.
- **Comparison**: deciding which of two keys is smaller; for sorting to make sense, "less than"
  must be a total order (any two keys are comparable, and the order is consistent).
- **Inversion**: a pair of positions *i* < *j* where the key at *i* is greater than the key at
  *j* — a pair that is out of the order the sort is trying to reach.
- **Stable**: a sort that keeps equal keys in their original input order.
- **In place**: a sort that uses no more than a constant amount of extra memory beyond the input.
- **Big-O, in one line**: a bound on how a cost grows as the input grows, ignoring constant
  factors.
- **Branch**: a point in a program where the next instruction depends on a comparison's result.
