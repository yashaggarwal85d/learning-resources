Last verified: 2026-11-05.

- Vitter, "Algorithms and Data Structures for External Memory" (*Foundations and Trends in Theoretical Computer Science* 2(4), 2008) — the replacement-selection run-length claim and the merge-pass-count formula this topic computes directly. [source](https://www.ittc.ku.edu/~jsv/Papers/Vit.IO_book.pdf)
- Kuiper, "Fastest Table Sort in the West – Redesigning DuckDB's Sort" (duckdb.org, 27 August 2021) — the K-way-merge-versus-cascade-merge contrast, the buffer manager's unload-to-disk behavior, and pointer swizzling. [source](https://duckdb.org/2021/08/27/external-sorting.html)
- PostgreSQL 18 Documentation, §19.4 "Resource Consumption" — the `work_mem` setting's documented role as the real-system analogue of this topic's own M parameter. [source](https://www.postgresql.org/docs/current/runtime-config-resource.html)
- Wikipedia, "K-way merge algorithm" — quoted via Chapter 6 topic 31's own `SOURCES.md` ("k-way merges are used in external sorting procedures"), not re-fetched this session.

Knuth, *TAOCP* vol. 3 §5.4.1 (the "snowplow" name and its own derivation of the 2M expected run length) stays **not opened** this session, per `CHAPTER.md`'s own framing; Vitter's book is the primary source actually quoted for the 2M claim instead. Aggarwal & Vitter's original 1988 CACM paper, Graefe's 2006 survey, and Sedgewick & Wayne's *Algorithms* §2.2 / the CLRS external-sorting problem are citation-only this session; no claim here rests on any of them.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=external-merge-sort:%20).
