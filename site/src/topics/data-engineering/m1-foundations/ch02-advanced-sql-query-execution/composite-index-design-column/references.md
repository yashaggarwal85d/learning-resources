Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§11.3, "Multicolumn Indexes"](https://www.postgresql.org/docs/18/indexes-multicolumn.html) — equality-before-range ordering and B-tree skip scan, quoted verbatim.
- PostgreSQL 18 Documentation, [§11.4, "Indexes and ORDER BY"](https://www.postgresql.org/docs/18/indexes-ordering.html) — using index order to avoid an explicit sort, quoted verbatim.
- PostgreSQL 18 Documentation, [§11.1, "Introduction"](https://www.postgresql.org/docs/18/indexes-intro.html) — the write overhead of keeping an index synchronized, quoted verbatim.
- PostgreSQL 18 Documentation, [§E.6, "Release 18"](https://www.postgresql.org/docs/18/release-18.html) — the B-tree skip scan feature announcement, quoted verbatim.
- Measured directly: PostgreSQL 16.15 and a freshly installed PostgreSQL 18.6 (same sandbox, separate clusters, from topic 27) for the equality-before-range, ORDER BY, skip scan, and write/storage cost comparisons — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=composite-index-design-column:%20).
