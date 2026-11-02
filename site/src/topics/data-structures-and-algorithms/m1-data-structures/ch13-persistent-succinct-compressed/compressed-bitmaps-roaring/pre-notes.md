- **Bit, bitmap.** A bitmap (or bitset) is one bit per possible value in a range; the ith bit is
  one if the ith value is in the set, zero otherwise.
- **Set intersection and union.** The values present in both sets; the values present in either.
- **Sorted array.** A list of values kept in increasing order.
- **Bitwise AND and OR on a machine word.** Both operate on every bit of a word (commonly 64
  bits) in one instruction.
- **Run of consecutive integers.** A maximal stretch of values with no gap, such as 11, 12, 13.
- **Row id.** A number identifying one row of a table.
- **Inverted index (one line).** For each value an attribute can take, the list of rows that
  have it.

**Check yourself:** a predicate matches a thousand rows out of four billion possible. Is a plain
bitmap or a plain sorted array of 32-bit ids smaller, and by roughly how much? (Answer in the
reel: step 1 — the array, by more than five orders of magnitude at this size.)
