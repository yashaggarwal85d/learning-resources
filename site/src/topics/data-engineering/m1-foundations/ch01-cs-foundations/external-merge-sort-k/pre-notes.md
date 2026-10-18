- **Merge of two sorted lists**: repeatedly compare the front items of two sorted lists and move the smaller to the output. *Where you meet it:* the combine step of merge sort.
- **Min-heap**: a structure that always gives you its smallest item in logarithmic time and accepts new items in logarithmic time. *Where you meet it:* Python's `heapq` module, or a priority queue.
- **Generator**: a function that hands out values one at a time and remembers where it stopped, so a long stream never has to sit in memory at once. *Where you meet it:* a Python function with `yield`.
- **Memory M and block size B**: the I/O model counts memory in items (M) and the unit the disk moves in items (B). *Where you meet it:* the cost model topic, where a scan costs N/B block transfers.
- **ORDER BY, sort-merge join**: the SQL clause that sorts a result, and a join that sorts both inputs on the key and walks them together. *Where you meet it:* `EXPLAIN` showing `Sort` or `Merge Join`.

**Check yourself:** merging two sorted lists of one million items each, how many items do you hold in memory at the same time? (Answer: two, one from the front of each list, if you stream the output.)
