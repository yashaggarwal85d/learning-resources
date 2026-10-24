# Fact-check — de.pages-slotted-pages-tuple

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A page has five parts: header, line-pointer array, free space, items, special space. | Confirmed | `sources/pg-page-layout.txt`, quoted verbatim. |
| 2 | A line pointer (ItemIdData) is a 4-byte (offset, length) pair that never moves until freed, even when the item it points to is physically relocated. | Confirmed | `sources/pg-page-layout.txt`, quoted verbatim. |
| 3 | A CTID (page number + line-pointer index) is what makes a line pointer usable as a long-term reference to an item. | Confirmed | `sources/pg-page-layout.txt`, quoted verbatim. |
| 4 | The heap tuple header has a fixed size followed by an optional null bitmap, present only if the row has a null column. | Confirmed | `sources/pg-page-layout.txt`, quoted verbatim. |
| 5 | A fixed page size forces a large value to be compressed and/or broken into multiple physical rows (TOAST), triggered once a row crosses roughly 2 kB. | Confirmed | `sources/pg-toast.txt`, quoted verbatim. |
| 6 | TOAST chunks an out-of-line value into a separate table (chunk_id, chunk_seq, chunk_data). | Confirmed | `sources/pg-toast.txt`, quoted verbatim. |
| 7 | `get_raw_page` and `heap_page_items` read a live page directly. | Confirmed | `sources/pg-pageinspect.txt`, quoted verbatim; used directly throughout `examples.py`. |
| 8 | InnoDB solves the identical fixed-page problem with its own overflow pages, with different row formats storing different amounts of data out of line. | Confirmed, sourced-only (not reproduced — no InnoDB instance in this sandbox) | `sources/innodb-row-format.txt`, quoted verbatim. |
| 9 | A page's own pd_lower sits before pd_upper, which sits at or before pd_special, on a real inserted table. | Confirmed, direct measurement | `examples.py`; `page_has_five_real_parts`, read directly via `page_header`. |
| 10 | A surviving row's CTID is unchanged by a real VACUUM even though the row's own physical offset (lp_off) does move. | Confirmed, direct measurement | `examples.py`; `slot_decouples_identity_from_physical_offset`, a real DELETE + VACUUM against this sandbox's own Postgres cluster. |
| 11 | A row with a null column carries a real null bitmap whose bit for that column is 0; a row with no null column carries no bitmap at all. | Confirmed, direct measurement | `examples.py`; `null_bitmap_marks_the_missing_column`, read directly via `heap_page_items`. |
| 12 | An incompressible value well past the TOAST threshold is split into multiple real chunks in a separate TOAST table, leaving a far smaller row in the main table that still round-trips to the exact original value. | Confirmed, direct measurement | `examples.py`; `toast_moves_a_large_value_out_of_line`, a real base64-encoded random 8000-byte value. |

## Red team

- **Is the "line pointer never moves" claim about the line pointer's own index, or its contents?** The source is precise: the line pointer's *index* never changes until freed; its *contents* (the offset it stores) absolutely can and does change, which is exactly what VACUUM does in `examples.py`'s own measurement. The reel's predict question (step 4) is built to test this exact distinction rather than let it slide past as "the pointer never moves."
- **Does the VACUUM demonstration actually prove slot indirection, or just that VACUUM ran?** The measurement specifically checks that the *CTID* (page + line-pointer index) for the surviving rows is bit-for-bit identical before and after, while the line pointer's own stored offset (`lp_off`) for those same line-pointer indices demonstrably changed. Both facts together — same CTID, different offset — is the actual claim; either one alone wouldn't be.
- **Is the TOAST measurement choosing an unfairly compressible value?** The first attempt used a 10,000-character string of a single repeated character, which PostgreSQL's own compression collapsed to well under the inline threshold, so TOAST never actually triggered — caught directly by checking the resulting chunk count was zero. Fixed by switching to `os.urandom` base64-encoded data, which has high entropy and reliably exceeds the threshold even after compression is attempted; `examples.py`'s own assertion that `chunk_count > 1` is now a real, non-trivial check rather than one that happens to pass by luck.
- **Predict question (step 4) wrong-answer trap.** The tempting wrong answer ("yes, the CTID changes") plays on CTID *looking* like a physical address (it displays as `(page, offset-ish-number)` in `psql`'s output) when it is actually a logical reference through the line-pointer array. The reveal's own real VACUUM run is the direct evidence the tempting answer is wrong.
- **Is the InnoDB comparison fair, given it isn't run?** The claim made about InnoDB (it has its own overflow-page mechanism, and different row formats store different amounts out of line) is exactly what InnoDB's own documentation states about itself, not a guess about how it must work by analogy to Postgres. Nothing about InnoDB's own measured numbers is claimed, only its documented mechanism — matching the disclosed, sourced-only pattern Chapters 1–4 already established for claims this sandbox can't run directly.

## Problem Solving

The TOAST demonstration's first draft used a large but highly repetitive string, which
PostgreSQL's own column compression defeated before out-of-line storage could ever trigger —
caught directly (the chunk count came back zero) rather than assumed to have worked. Fixed by
switching to `os.urandom`-derived, base64-encoded data, which is reliably incompressible at the
size used and triggers real, measurable out-of-line chunking every run.

The slot-indirection demonstration was built around a real `VACUUM` run rather than `VACUUM
FULL` or `CLUSTER`, since a plain `VACUUM` with `autovacuum_enabled = off` on the table gives a
small, deterministic, single-page table where the compaction behavior is easy to read directly
off `heap_page_items` without needing a second, larger table to force multi-page behavior that
this topic doesn't need.
