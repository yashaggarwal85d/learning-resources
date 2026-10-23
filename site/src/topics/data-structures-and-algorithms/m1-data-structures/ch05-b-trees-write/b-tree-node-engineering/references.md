Last verified: 2026-10-23. Expert sign-off: pending.

- PostgreSQL `nbtree` README (`master` branch) — suffix truncation's mechanism and purpose, and deduplication's lazy, split-time-only application, from a current production B-tree's own documentation. [source](https://raw.githubusercontent.com/postgres/postgres/master/src/backend/access/nbtree/README)
- PostgreSQL 13.0 Release Notes — the version deduplication shipped in, and the `REINDEX` requirement on upgrade for an existing index. [source](https://www.postgresql.org/docs/release/13.0/)
- PostgreSQL CREATE INDEX reference — fill factor's definition, default and range, explicitly tied to bulk loading; the `deduplicate_items` parameter's default. [source](https://www.postgresql.org/docs/current/sql-createindex.html)
- Carnegie Mellon 15-445/645 Database Systems (Spring 2024), "Lecture 3: Database Storage Part 1" — the slotted page layout: header, slot array, variable-length data area. [source](https://15445.courses.cs.cmu.edu/spring2024/slides/03-storage1.pdf)
- University at Buffalo CSE 350 (Spring 2026), "Lecture 16: B-Tree Bulk Loading" — the bulk-load algorithm from sorted input and the right-most-path-only split property. [source](https://cse.buffalo.edu/adblab/people/zzhao35/teaching/cse350_spring26/files/16-btree-bulkload.pdf)
- MyRocks record format wiki — the exact byte-level key-normalization scheme for integers and floats in a real, current production key-value store. [source](https://raw.githubusercontent.com/wiki/facebook/mysql-5.6/MyRocks-record-format.md)

Canonical numbers (the pivot-tuple byte size before and after suffix truncation on this topic's key
set; the normalized-byte-string sort order checked against the original typed values; the
bulk-load page-write count against one-at-a-time insertion on the identical sorted input; and the
deduplication savings ratio on a repeated-key set) are computed and asserted directly in this
topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): `dsa.b-tree-b-tree` (this chapter) for the node whose fanout
this topic's techniques exist to make as large as possible; LSM-tree write and read paths (next)
for the structure that refuses in-place updates entirely.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=b-tree-node-engineering:%20).
