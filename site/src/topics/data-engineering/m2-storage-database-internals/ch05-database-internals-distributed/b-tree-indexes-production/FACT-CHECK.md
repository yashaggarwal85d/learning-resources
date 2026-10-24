# Fact-check — de.b-tree-indexes-production

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A B-tree index is a multi-level tree of leaf and internal pages; over 99% of all pages are typically leaf pages. | Confirmed | `sources/btree-implementation.txt`, quoted verbatim. |
| 2 | A page split happens when a leaf page can't fit an incoming tuple; splits cascade upward, and a root split adds a new level to the tree. | Confirmed | `sources/btree-implementation.txt`, quoted verbatim. |
| 3 | A fifty-thousand-row table's own primary-key B-tree keeps a root level of one (two levels total) and around 139 total pages. | Confirmed, direct measurement | `examples.py`; `fanout_bounds_lookup_depth_despite_many_rows`, real run via `bt_metap()` and `pg_relation_size()`. |
| 4 | Fillfactor controls how full leaf pages are packed at build time (default 90); lower fillfactor settings can smooth out or lower the absolute number of page splits for update-heavy tables. | Confirmed | `sources/createindex.txt`, quoted verbatim. |
| 5 | Under an identical batch of mid-range inserts, a fillfactor=100 index grows by real pages while an otherwise identical fillfactor=10 index on the same data grows by none. | Confirmed, direct measurement | `examples.py`; `fillfactor_changes_split_count_under_midrange_inserts`, real run: 19 vs. 0 pages, repeated across 3 runs with the identical result each time. |
| 6 | A duplicate is a leaf tuple where all indexed columns match another leaf tuple's; B-tree indexes can use deduplication, a space-efficient representation for duplicates. | Confirmed | `sources/btree-implementation.txt`, quoted verbatim. |
| 7 | An index on a heavily duplicated column (ten distinct values across fifty thousand rows) is real pages smaller with deduplication on than off. | Confirmed, direct measurement | `examples.py`; `deduplication_reduces_index_size_with_many_duplicates`, real run: 45 vs. 139 pages, repeated across 3 runs with the identical result each time. |
| 8 | Lehman and Yao's algorithm adds a right-link pointer to each page and a "high key" upper bound, making it possible to detect a concurrent page split and search without holding read locks except on the page being read. | Confirmed | `sources/nbtree-readme.txt`, quoted verbatim. |
| 9 | When a search's key exceeds a page's high key, the page must have split concurrently, and the search follows the right-link (possibly repeatedly) to find the right page. | Confirmed | `sources/nbtree-readme.txt`, quoted verbatim. |
| 10 | PostgreSQL 18 adds support for "skip scan" lookups, letting a multicolumn B-tree index be used in more cases. | Confirmed | `sources/release-18.txt`, quoted verbatim. |
| 11 | InnoDB uses the primary key as a clustered index, storing table data itself in primary-key order. | Confirmed | `sources/mariadb-pk-constraints.txt`, quoted verbatim. |
| 12 | A secondary-index lookup on an InnoDB (clustered) table costs two B-tree traversals (secondary index, then the clustered primary-key index); a Postgres (heap-organized) secondary-index lookup is one index traversal plus one direct heap-page fetch. | Confirmed, sourced-only for the InnoDB half (not reproduced — no InnoDB engine in this sandbox) | `sources/mariadb-best-index.txt`, quoted verbatim, for the InnoDB half; the Postgres half follows directly from this chapter's own topic 1 ("Pages, slotted pages and tuple layout"), which established that a Postgres index tuple stores a `ctid` pointing to a heap page, not the row itself. |

## Red team

- **Does the fanout measurement actually demonstrate "bounded, not linear" depth, or just report one data point?** A single measurement (50,000 rows → level 1) can't on its own prove the *shape* of the scaling curve, only one point on it. The claim as written in the reel is careful to say the tree "stays small" for this row count, not to assert the general logarithmic curve as something this topic itself measured at multiple scales — the logarithmic-growth claim is the textbook B-tree property (declared background from the Data Structures & Algorithms track's own B-tree topic), and this topic's own contribution is confirming that property holds for a real index on this real cluster, not re-deriving the asymptotic bound from scratch.
- **Is the fillfactor measurement actually isolating fillfactor, or just measuring "inserts cause growth"?** Both indexes are built on the identical table, in the identical order, and hit with the identical insert batch (identical `INSERT ... SELECT` statement, run once, since both indexes update together from the same underlying table writes). The only variable between the two indexes is their own `fillfactor` setting. The comparison is therefore a fair, isolated test of fillfactor's own effect, not a confound with insert volume or pattern.
- **Does "grew by 0 pages" for the loose index mean literally zero splits happened, or could splits have happened without net page growth?** A page split always adds exactly one new page (the overflowing page's contents split across the original page and one new page), so a net page-count growth of zero is only possible if zero splits occurred — there's no mechanism by which a split could occur without increasing the page count by at least one. The claim "grew by none" is therefore equivalent to "split zero times," not merely "ended up the same size through some other path."
- **Is the deduplication claim overstated, given it depends entirely on how duplicated the data is?** The claim is explicitly scoped ("a heavily duplicated column," "ten distinct values across fifty thousand rows") rather than stated as a universal space saving — this is deliberate, since deduplication's benefit is directly proportional to how much duplication actually exists in the indexed column (confirmed by Postgres's own documentation describing it as space-efficient specifically "for duplicates"). The "Prove it" step (step 10) is built directly around testing whether a learner has internalized this scoping rather than over-generalizing it.
- **Predict question (step 4, fillfactor) wrong-answer trap.** The tempting wrong answer ("pack as full as possible, wasted space is wasted space") treats disk space as the only cost worth minimizing, ignoring that a page split has its own real cost (I/O to write the new page, a new downlink to insert in the parent, possible cascading). The real measurement in step 5 demonstrates this isn't a theoretical nuance — it's a real, large, directly measured difference (19 pages vs. 0) under a realistic mid-range-insert workload.
- **Is claim 12's Postgres half actually established, or just asserted here?** It is established directly by this chapter's own topic 1 (`de.pages-slotted-pages-tuple`), whose own scope is specifically "why slots decouple logical row identity (Postgres ctid) from physical offset" — a Postgres secondary index storing a `ctid` rather than the row itself is exactly what topic 1 already taught, so this topic correctly treats it as already-established background (per `uses: ['slotted-page-layout']`) rather than re-deriving or re-sourcing it.
- **"Prove it" step 10 — is the premise realistic?** A schema change that reduces a column's own duplication (e.g., splitting a coarse "status" into a finer-grained set of columns, or the underlying data simply becoming more varied over time) is a common, realistic production scenario, not a contrived edge case — exactly the kind of "the benefit doesn't transfer to a different data shape" trap the "Prove it" step is meant to test.

## Problem Solving

The InnoDB clustered-index source was harder to find than expected: the obvious canonical page
(`dev.mysql.com/doc/refman/.../innodb-index-types.html`) returned HTTP 403 (as in earlier
topics' own InnoDB-sourcing attempts), and the old MariaDB Knowledge Base URL pattern
(`mariadb.com/kb/en/innodb-primary-key/`) now redirects to a generic GitBook landing page rather
than real article content (confirmed directly by checking the fetched byte count: 3,069 bytes,
matching the known landing-page size from an earlier topic's own identical problem). Fixed by
finding MariaDB's own new documentation URL structure (`mariadb.com/docs/server/...`), which
served real, substantial article content (12KB and 27KB respectively) for both the clustered-index
claim and the secondary-lookup-cost claim.

The fillfactor measurement's first design inserted new rows purely at the end of the existing key
range (ascending ids), which is exactly the append-only case Postgres's own documentation notes
fillfactor does *not* help with ("filled... when extending the index at the right"). Recognizing
this from the source material itself during research led to redesigning the insert workload to
land inside the existing key range (`id*10 + 1..9`, strictly between existing keys) instead, which
is the actual case fillfactor's own documented benefit applies to — a case caught and fixed before
writing `examples.py`, not after a failed run.
