# OUTLINE — B-tree indexes in production

## Learning outcomes

1. Describe a B+-tree's own fanout and why it bounds lookup depth, backed by a real measurement on this sandbox's own cluster.
2. Explain a page split and fill factor's real, measured effect on how often one happens under mid-range inserts.
3. Explain the Lehman-Yao (B-link) approach to concurrent B-tree access without locking the whole tree.
4. Explain index deduplication (measured) and multicolumn skip scan as real, versioned Postgres features.
5. Contrast a secondary-index lookup's real cost on a clustered (InnoDB) table against a heap-organized (Postgres) one.

## Changes from the chapter plan

CHAPTER.md's own "Visual idea" calls for a real B+-tree index inspected via `pageinspect`, with fanout read directly off a real index and a real page split shown as a level growing by one page. This sandbox delivers exactly that for fanout (via `bt_metap()`'s `level` field and real page counts) and for the page-split/fillfactor trade-off (via real page-count growth under a controlled mid-range insert workload comparing a tight, fillfactor=100 index against a loose, fillfactor=10 one) — a real, repeatable proxy for "how many splits happened" without needing to instrument an individual split event directly. The Lehman-Yao concurrency protocol and the InnoDB clustered-vs-Postgres heap-organized lookup-cost contrast are sourced-only: this sandbox has no InnoDB engine to measure directly, and reproducing a genuine concurrent page split under the L&Y protocol would require instrumenting Postgres's own internals beyond what SQL can observe.

## Claims list (for fact-check)

1. A B-tree index is a multi-level tree of leaf and internal pages; over 99% of all pages are typically leaf pages. — Source: `btree-implementation.txt` (btree-structure-leaf-internal).
2. A page split happens when a leaf page can't fit an incoming tuple; splits cascade upward and, when the root itself can't fit a new downlink, a root split adds a new level to the whole tree. — Source: `btree-implementation.txt` (btree-page-split).
3. This topic's own measurement: a table of fifty thousand rows keeps its primary-key B-tree at a root level of one (two levels total) and around 139 total pages — fanout bounding lookup depth as a real, concrete number. — Source: `examples.py`, real run.
4. Fillfactor controls how full leaf pages are packed at build time (default 90); a page that later fills completely will split, fragmenting the index; lower fillfactor settings can smooth out or even lower the absolute number of page splits for update-heavy tables. — Source: `createindex.txt` (btree-fillfactor).
5. This topic's own measurement: under an identical batch of mid-range inserts, a fillfactor=100 index grows by real pages while an otherwise identical fillfactor=10 index on the same data grows by none — the documented trade-off as a real, repeatable number. — Source: `examples.py`, real run.
6. A duplicate is a leaf tuple where all indexed columns match another leaf tuple's; B-tree indexes can use deduplication, a space-efficient representation for duplicates. — Source: `btree-implementation.txt` (btree-deduplication).
7. This topic's own measurement: an index on a heavily duplicated column (only ten distinct values across fifty thousand rows) is real pages smaller with deduplication on than with it off. — Source: `examples.py`, real run.
8. Lehman and Yao's algorithm adds a right-link pointer to each page (to its right sibling) and a "high key" upper bound, making it possible to detect a concurrent page split and search the tree without holding read locks except on the single page being read. — Source: `nbtree-readme.txt` (lehman-yao-right-link).
9. When a search's key exceeds a page's high key, the page must have been split concurrently, and the search follows the right-link (possibly repeatedly) to find the right page. — Source: `nbtree-readme.txt` (lehman-yao-follow-right-link).
10. PostgreSQL 18 adds support for "skip scan" lookups, letting a multicolumn B-tree index be used in more cases (without an equality condition on the leading column). — Source: `release-18.txt` (skip-scan-pg18).
11. InnoDB uses the primary key as a clustered index, storing table data itself in primary-key order. — Source: `mariadb-pk-constraints.txt` (innodb-clustered-pk).
12. A secondary-index lookup on an InnoDB (clustered) table requires two B-tree traversals — one in the secondary index to find the primary key, one in the primary key's own clustered index to fetch the row — whereas a Postgres (heap-organized) secondary-index lookup is one index traversal followed by one direct heap-page fetch. — Source: `mariadb-best-index.txt` (innodb-secondary-lookup-cost), contrasted with Postgres's own heap-organized design (established in topic 1 of this chapter, "Pages, slotted pages and tuple layout").

## Concept ledger

- `introduces`: `['btree-fanout-blink']`
- `uses`: `['slotted-page-layout', 'buffer-pool-pin-unpin']`
- `declared`: the B-tree background from the Data Structures & Algorithms track's own B-tree topic, assumed rather than re-taught.

## Engagement arc

- Hook: step 1.
- Predicts: step 4 (fillfactor) and step 10 ("Prove it"). Two predicts.
- Surprising number: deduplication measured at roughly a third the page count (45 vs 139 pages) for the same heavily duplicated column; fillfactor=100 grows by real pages under mid-range inserts while fillfactor=10 grows by none at all under the identical workload.
- Takeaways (≥3): steps 5, 6, 7.
- Recap: step 9.

## Storyboard

### Step 1 — Hook
- **fig**: "Every earlier topic assumed one path to a row: a direct page read. What finds the right page fast?"
- Visual idea: a single question mark over a wall of pages, no structure.
- On screen: a row "many pages" → "which one?" fading in, then a second row "a direct read" → "doesn't scale" revealing the gap.
- Beat: first row fades in, second row follows.
- Real values shown: none (set-up step).
- Final frame: both rows, the gap stated plainly.
- Caption's point: every mechanism so far (pages, buffer pool, WAL, checkpoints) assumed you already knew which page to read; this topic is what makes finding it fast.
- Narrator's line of thought: "Every topic in this chapter so far has quietly assumed something: that you already know which page holds the row you want. Real tables have millions of rows, spread across many pages. What actually finds the right one, fast, instead of checking every page in order?"

### Step 2 — Reveal: structure & fanout (real measurement)
- **fig**: "A real index, fifty thousand rows: how many levels deep does it actually stay?"
- Visual idea: two rows — "fifty thousand rows" → "a two-level tree" and "lookup cost" → "bounded, not linear."
- On screen: `Row` for row count → tree level, `Row` for the real page count.
- Beat: first row reveals the real level number, second reveals the real page count.
- Real values shown: `level = 1` (a two-level tree: one level of internal pages above the leaves), `139` total index pages, for `50,000` rows.
- Final frame: both rows.
- Caption's point: fanout is why the tree stays shallow even as the row count grows by orders of magnitude — this is a real, measured depth, not a diagram.
- `takeaway`: none on this step (held for the fillfactor/dedup measurements).
- Narrator's line of thought: "I built a real index on fifty thousand rows and asked Postgres's own `pageinspect` extension how deep the tree actually is. Two levels. Not fifty thousand comparisons, not even a thousand — two. That's fanout: each internal page points to many children, so the tree's height grows logarithmically, not linearly, with the row count."

### Step 3 — Reveal: page split & cascade
- **fig**: "A leaf page fills up. What happens to the tuple that doesn't fit?"
- Visual idea: two rows — "leaf page, full" → "split in two" and "parent page" → "gets a new downlink, may split too."
- On screen: `Row` for leaf split, `Row` for cascading parent split.
- Beat: leaf row reveals first, parent-cascade row follows.
- Real values shown: none (mechanism explanation; the fillfactor measurement two steps later is the real, measured consequence of this mechanism).
- Final frame: both rows.
- Caption's point: a split isn't contained to one page — it can cascade all the way to the root, which is exactly what adds a new level to the tree.
- Narrator's line of thought: "When a leaf page can't fit a new tuple, Postgres splits it: moves half the tuples to a new page, and inserts a pointer to that new page in the parent. If the parent itself is now full, it splits too — the split cascades upward. When even the root can't fit a new pointer, the whole tree grows by one level. That's the one moment fanout changes."

### Step 4 — Predict: fillfactor
- **fig**: "Should a new index pack its pages as full as possible, or leave room?"
- Predict options:
  - A: "As full as possible — wasted space is wasted space" 
  - B: "Leave real room on each page — it trades initial size for fewer future splits", correct
- `explain`: Packing every page to 100% leaves zero room for a future mid-range insert, so the very next insert that lands inside an existing page's key range forces an immediate split. A lower fillfactor sacrifices some space up front in exchange for genuine room to absorb inserts and updates without splitting, which is exactly the trade-off Postgres's own documentation describes.
- Beat: both options render, pause before the explain reveal.
- Caption's point: the "obviously correct" instinct (pack tight, waste nothing) is backwards for any index that will see more writes.
- Narrator's line of thought: "Before the measurement — if you're about to insert fifty thousand rows into a brand-new index, should you ask Postgres to pack every page as full as it'll go, or leave some of each page empty on purpose?"

### Step 5 — Reveal: the real fillfactor measurement (takeaway)
- **fig**: "The same mid-range inserts, two fillfactors: how many pages does each index actually grow by?"
- Visual idea: two rows — "fillfactor 100 (tight)" → "grew by real pages" and "fillfactor 10 (loose)" → "grew by none."
- On screen: `Row` for tight index growth, `Row` for loose index growth.
- Beat: tight row reveals first (the larger, more surprising number), loose row follows.
- Real values shown: the tight (fillfactor=100) index grew by `19` pages; the loose (fillfactor=10) index grew by `0` pages, under the identical batch of `4,000` mid-range inserts against the same `50,000`-row table.
- Final frame: both rows.
- Caption's point: the predicted trade-off, confirmed as a real, measured, stark difference — not a marginal one.
- `takeaway`: "Under identical mid-range inserts, a tightly packed index grows; a loosely packed one, on the same data, doesn't."
- Narrator's line of thought: "I ran it both ways on the identical data: one index built with fillfactor at its maximum, one with fillfactor at ten percent, then hit both with the same four thousand inserts that land inside the existing key range, not at the end. The tight index grew by real pages — had to split to make room. The loose one didn't grow by a single page. Same inserts, same data, opposite outcome."

### Step 6 — Reveal: the real deduplication measurement (takeaway)
- **fig**: "An index on a column with only ten distinct values: how much smaller with deduplication on?"
- Visual idea: two rows — "deduplication on" → "far fewer pages" and "deduplication off" → "far more pages."
- On screen: `Row` for dedup-on page count, `Row` for dedup-off page count.
- Beat: on-row reveals first, off-row follows for direct comparison.
- Real values shown: `45` pages with deduplication on, `139` pages with it off, for the identical `50,000`-row, ten-distinct-value column.
- Final frame: both rows.
- Caption's point: deduplication isn't a marginal space saving — on a genuinely duplicate-heavy column it's roughly a third the size.
- `takeaway`: "Deduplication shrinks a heavily duplicated index to roughly a third its size, measured directly."
- Narrator's line of thought: "Duplicates are common — a status column, a boolean flag, a category. I built the identical index twice on a column with only ten distinct values across fifty thousand rows: once with deduplication on, once off. On: forty-five pages. Off: a hundred thirty-nine. The space-efficient representation Postgres's own documentation describes isn't a rounding error."

### Step 7 — Reveal: Lehman-Yao concurrency (sourced, takeaway)
- **fig**: "A search is reading a page exactly when it splits underneath it. What stops that from reading garbage?"
- Visual idea: two rows — "every page" → "a right-link to its sibling" and "a split mid-search" → "follow the right-link, not a lock."
- On screen: `Row` for right-link/high-key mechanism, `Row` for the concurrent-split detection.
- Beat: mechanism row reveals first, detection row follows.
- Real values shown: none (sourced directly from Postgres's own nbtree README, not reproduced).
- Final frame: both rows.
- Caption's point: Postgres doesn't lock the whole tree to stay safe during concurrent writes — it adds just enough structure (a right-link, a high key) to detect and recover from a split instead.
- `takeaway`: "A B-tree search detects a concurrent split by its page's own high key, then just follows a right-link — no whole-tree lock needed."
- Narrator's line of thought: "Here's the part that makes a B-tree usable under real concurrent load. Lehman and Yao's nineteen-eighty-one algorithm adds one pointer to every page — to its right sibling — and one more value — a high key, the upper bound of what belongs on that page. If a search's target key is bigger than the page's own high key, the page must have just split underneath it. The fix isn't a lock: just follow the right-link to the new page. Postgres's own source implements exactly this."

### Step 8 — Reveal: two more production features (sourced)
- **fig**: "Two features production systems actually use: a smarter multicolumn lookup, and a different engine's own trade-off."
- Visual idea: two rows — "a query skips the leading column" → "PG18: still uses the index" and "a secondary lookup" → "one engine's own extra hop."
- On screen: `Row` for skip scan, `Row` for the clustered-vs-heap-organized contrast.
- Beat: skip-scan row reveals first, clustered-vs-heap row follows.
- Real values shown: none (both sourced directly — skip scan from Postgres 18's own release notes, the clustered/heap contrast from MariaDB's own documentation; no InnoDB engine in this sandbox to measure directly).
- Final frame: both rows.
- Caption's point: two real, named production features/trade-offs this topic doesn't reproduce locally but states precisely from primary sources.
- Narrator's line of thought: "Two more things worth naming precisely, even without a live measurement. Postgres eighteen adds skip scan: a multicolumn index usable even when a query's condition skips the first column, something earlier versions couldn't do. And a genuinely different design choice: InnoDB clusters a table's actual row data under its primary key, so a secondary-index lookup there costs two tree traversals — one to find the primary key, one to fetch the row. Postgres's own heap-organized tables mean a secondary-index lookup is one tree traversal plus one direct page fetch, not two traversals."

### Step 9 — Recap
- **fig**: "Fanout bounds depth, fillfactor and deduplication measured directly, and concurrency without a whole-tree lock."
- Visual idea: four compact rows restating: fanout/depth, fillfactor trade-off, deduplication, Lehman-Yao.
- On screen: four `Row`s.
- Beat: all four reveal in quick succession.
- Real values shown: the measured numbers restated compactly.
- Final frame: all four rows, held.
- Caption's point: one structure, four real, distinct, measured-or-sourced claims about how it behaves under real load.
- Narrator's line of thought: "A B-tree's fanout keeps lookup depth small no matter how many rows you add — two levels for fifty thousand rows, measured directly. Fillfactor and deduplication are real, measured trade-offs, not abstractions: a tight index splits under mid-range writes where a loose one doesn't; deduplication shrinks a duplicate-heavy index to about a third its size. And none of this needs to lock the whole tree to stay safe under concurrent writes — a right-link and a high key are enough."

### Step 10 — Predict: "Prove it" (transfer)
- **fig**: "A team removes all duplicates from a heavily duplicated index column by splitting it into two columns. What should happen to deduplication's own benefit?"
- Predict options:
  - A: "Nothing changes — deduplication still saves the same amount of space"
  - B: "The benefit shrinks or disappears — deduplication only helps when there really are duplicate tuples to pack together", correct
- `explain`: Deduplication's entire benefit comes from packing tuples that share identical indexed key values into one compact representation. If a schema change makes the indexed values mostly or entirely unique (removing the duplication that made the column worth deduplicating), there's nothing left to pack — the feature becomes a no-op rather than a space saver, exactly as this topic's own measurement showed happens in the opposite direction (duplication concentrated, size shrank dramatically).
- Beat: scenario renders, pause, then options.
- Caption's point: a measured benefit transfers only as far as the condition that produced it — deduplication is not a free, universal win.
- Narrator's line of thought: "Last one. A team sees this topic's own measurement — deduplication shrank a duplicate-heavy index to about a third its size — and assumes it's always worth turning on. Then they redesign the schema so that column's values become nearly all unique. What happens to deduplication's benefit on that same index now?"

## Post-notes headings

- **Outcomes**: restate the 5 learning outcomes.
- **Lab**: point at `examples.py`'s three real pageinspect-based measurements.
- **Production failures this topic warns about**: a fillfactor of 100 on a table that turns out to need updates (documented risk); assuming deduplication is a universal free win regardless of the data's own duplication shape.
- **Frontier**: Postgres's own INCLUDE columns (covering indexes) and `pg_stat_user_indexes`, named not measured; InnoDB's own `innodb_adaptive_hash_index`, named from the same MariaDB documentation.
- **Where this goes next**: verbatim handoff — "A B-tree index answers 'where is this row' fast, but says nothing about what happens when two transactions want to change the same row at once. That's the next question: MVCC, Postgres's own answer to concurrent writes."

## Bridge / handoff (verbatim from CHAPTER.md)

- **Bridge**: "Every mechanism so far assumed one path to a row: a direct page read. This topic is the structure that makes finding the right page fast in the first place, and the real concurrency and production features (deduplication, skip scan) a real B-tree index needs."
- **Handoff**: "A B-tree index answers 'where is this row' fast, but says nothing about what happens when two transactions want to change the same row at once. That's the next question: MVCC, Postgres's own answer to concurrent writes."
