# Outline: Data-diff regression testing

1. **Hook** — a one-line currency-rounding fix is deployed; a naive full-table-equality check reports "14 million rows changed" (true, useless, un-reviewable); a column-level diff summary instead says exactly which column moved, by how much, and that every other column is untouched.
2. **Predict: does comparing every row mean reading every row?** A full join-diff is exact. Does an exact diff have to scan every row to be exact?
   - Answer: not necessarily — a checksum can stand in for a whole range of rows, and only a mismatching checksum forces a real read.
3. **Reveal: the full join-diff** — join old and new on key, compare every column, exact but always touches every row, both sides.
4. **Reveal: checksum bisection** — hash key ranges; a matching checksum skips the whole range; a mismatching one splits and recurses until it reaches the actual differing rows. Same mismatches found, far fewer rows actually read.
5. **Predict: does a float difference always mean a real change?** The same total, computed two different but equally valid ways, can come out as two different floats.
   - Answer: no — a tolerance band distinguishes harmless summation-order noise from a genuine regression.
6. **Reveal: tolerance in practice** — one harmless reordering (noise) and one real planted bug, the same diff, a tolerant comparison lets the first pass and still catches the second.
7. **Reveal: column-level change summary** — from the single planted bug, a summary names the one column, how many rows, and the size of the change, instead of a raw row count.
8. **Reveal: the cost curve** — at a fixed number of real changes, join-diff's cost grows exactly with table size; bisection's relative advantage widens as the table grows.
9. **Recap** — two exact strategies, one cost tradeoff; a tolerance band for floats and timestamps; a column summary for a usable report.
10. **Prove it** — run both diffs against the same 1,000-row table with the same planted bug and compare rows scanned, live.

## Internals / Frontier
- Internals: why a checksum of a *contiguous key range* (not a random sample) is what makes bisection safe — any real change inside the range changes the hash, so nothing is missed, only reread with zero information loss.
- Frontier: this topic's technique is run on a plain schema copy, not a true zero-copy clone/branch (the skipped 11.4 syllabus entry); topic 17 is what schedules this diff selectively rather than on every PR.
