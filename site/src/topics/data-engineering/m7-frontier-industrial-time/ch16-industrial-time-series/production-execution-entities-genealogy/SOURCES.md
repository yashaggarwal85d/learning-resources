## ISA-88: The Framework for Smarter Batch Process Control (named, not quoted)

URL: https://www.isa.org/standards-and-publications/isa-standards/isa-88-standards
Version: ISA.org standard-series page — fetched once during this chapter's research, then deleted; not quoted.

**Correction, 2026-10-31:** this SOURCES.md originally quoted ISA's own standard-series page
verbatim (Part 1's own description, and the recipe-structure sentence from the later parts). ISA's
standards pages carry a site-wide notice prohibiting the entry of their content into any AI tool,
discovered while researching this chapter's topic 6 and confirmed on this exact page. Those
quotes are removed. This topic now **names ISA-88 bibliographically only** (the part structure:
Part 1 models and terminology, Part 2 data structures, Part 3 general/site recipe models, Part 4
batch production records), and keeps the underlying point (a consistent batch-control vocabulary
across cross-functional teams, and a standardized, reusable recipe structure across facilities)
as this topic's own stated summary of what the standard does, not a quoted sentence.

## ISA-88 (Wikipedia)

URL: https://en.wikipedia.org/wiki/ISA-88
Version: Wikipedia, retrieved 2026-10-31. Used per CHAPTER.md's own allowance ("the Wikipedia/standards descriptions of the physical and procedural models, to be confirmed against ISA's own text") since ISA's own public page names the standard's parts but does not itself publish the model hierarchy's internal structure.

The physical model's own nesting, as the secondary source states it.

> The physical model begins with the enterprise, which may contain a site, which may contain areas, which may contain process cells, which must contain a unit, which may contain equipment modules, which may contain control modules. Some of these levels may be excluded, but not the Unit.

The procedural model's own nesting.

> The procedural control model consists of recipe procedures, which consist of an ordered set of unit procedures, which consist of an ordered set of operations, which consist of an ordered set of phases.

Contents: the physical model's six levels; the procedural model's four levels; the standard's four original problems (no universal batch-control model, requirements communication, supplier integration, batch-control configuration).

## 7.8. WITH Queries (Common Table Expressions)

URL: https://www.postgresql.org/docs/current/queries-with.html
Version: PostgreSQL 18 documentation

The general shape of a recursive query, and the built-in cycle-detection syntax this topic's `examples.py` uses.

> The general form of a recursive WITH query is always a non-recursive term, then UNION (or UNION ALL), then a recursive term, where only the recursive term can contain a reference to the query's own output.

> When working with recursive queries it is important to be sure that the recursive part of the query will eventually return no tuples, or else the query will loop indefinitely.

> The CYCLE clause specifies first the list of columns to track for cycle detection, then a column name that will show whether a cycle has been detected, and finally the name of another column that will track the path. The cycle and path columns will implicitly be added to the output rows of the CTE.

Contents: the recursive-query evaluation algorithm; manual cycle detection with a path array; the built-in `CYCLE` clause (added in PostgreSQL 14) and its equivalence to the manual form; `SEARCH`/`CYCLE` combined for breadth-first ordering.
