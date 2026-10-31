# Before you watch

- **Data diff** — comparing two versions of the same pipeline's output on identical input to see what actually changed.
- **Full join-diff** — join old and new output on key, compare every column, exact but reads every row on both sides.
- **Checksum bisection** — hash a key range on both sides; a matching checksum skips it, a mismatching one splits and recurses.
- **Diff tolerance** — a band that lets a harmless float or timestamp difference pass without hiding a real regression.
- **Column-level change summary** — a report naming which column changed, how many rows, and by how much, instead of a raw row count.
- **Unit test (from the prior topic)** — a check against one small, isolated piece of logic, fast and narrow.
