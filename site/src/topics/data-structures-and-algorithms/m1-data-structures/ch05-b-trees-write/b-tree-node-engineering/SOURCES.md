## PostgreSQL nbtree README (Lehman & Yao B-tree, canonical source tree)

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/access/nbtree/README
Version: `master` branch, fetched 2026-10-23

> We truncate away suffix key attributes that are not needed for a page high key during a leaf page split.

> The remaining attributes must distinguish the last index tuple on the post-split left page as belonging on the left page, and the first index tuple on the post-split right page as belonging on the right page.

> Since the high key is subsequently reused as the downlink in the parent page for the new right page, suffix truncation makes pivot tuples short.

> The goal of suffix truncation of key attributes is to improve index fan-out. The technique was first described by Bayer and Unterauer (R.Bayer and K.Unterauer, Prefix B-Trees, ACM Transactions on Database Systems, Vol 2, No. 1, March 1977, pp 11-26).

> Suffix truncation is primarily valuable because it makes pivot tuples smaller, which delays splits of internal pages, but that isn't the only reason why it's effective.

> We deduplicate non-pivot tuples in non-unique indexes to reduce storage overhead, and to avoid (or at least delay) page splits.

> Deduplication alters the physical representation of tuples without changing the logical contents of the index, and without adding overhead to read queries.

> Non-pivot tuples are merged together into a single physical tuple with a posting list (a simple array of heap TIDs with the standard item pointer format).

> Deduplication is always applied lazily, at the point where it would otherwise be necessary to perform a page split.

> A major goal of our lazy approach to deduplication is to limit the performance impact of deduplication with random updates.

Contents (item by item, this topic's scope):
1. Suffix truncation: dropped at a leaf split, keeping only the attributes that distinguish the last left-page tuple from the first right-page tuple, named after Bayer and Unterauer's 1977 Prefix B-Trees paper.
2. Why it matters: smaller pivot tuples (the routing keys stored in parent pages), which delays internal-page splits and improves fan-out.
3. Deduplication: merging repeated non-pivot tuples into one physical tuple with a posting list of heap TIDs, applied lazily only when a page split would otherwise be needed.

## PostgreSQL 13.0 Release Notes

URL: https://www.postgresql.org/docs/release/13.0/
Version: 13.0, released 2020-09-24

> More efficiently store duplicates in B-tree indexes (Anastasia Lubennikova, Peter Geoghegan)

> This allows efficient B-tree indexing of low-cardinality columns by storing duplicate keys only once. Users upgrading with pg_upgrade will need to use REINDEX to make an existing index use this feature.

Contents (item by item, this topic's scope):
1. The exact version B-tree deduplication shipped in (13.0), confirming the syllabus's own "(PostgreSQL 13+)" claim, and the upgrade caveat (REINDEX is required to gain the feature on an existing index).

## PostgreSQL CREATE INDEX reference

URL: https://www.postgresql.org/docs/current/sql-createindex.html
Version: current (fetched 2026-10-23)

> Controls how full the index method will try to pack index pages. For B-trees, leaf pages are filled to this percentage during initial index builds, and also when extending the index at the right (adding new largest key values).

> If pages subsequently become completely full, they will be split, leading to fragmentation of the on-disk index structure. B-trees use a default fillfactor of 90, but any integer value from 10 to 100 can be selected.

> B-tree indexes on tables where many inserts and/or updates are anticipated can benefit from lower fillfactor settings at CREATE INDEX time (following bulk loading into the table).

> Controls usage of the B-tree deduplication technique described in Section 65.1.4.3. Set to ON or OFF to enable or disable the optimization.

Contents (item by item, this topic's scope):
1. Fill factor's precise definition for a B-tree: the percentage leaf pages are packed to during an initial build and during right-edge appends, default 90, range 10-100.
2. The explicit link between fill factor and bulk loading: a lower fill factor is chosen at `CREATE INDEX` time "following bulk loading into the table."
3. `deduplicate_items`, the real, current, named on/off switch for B-tree deduplication, default on.

## CMU 15-445/645 Database Systems, Lecture 3: Database Storage Part 1

URL: https://15445.courses.cs.cmu.edu/spring2024/slides/03-storage1.pdf
Version: Spring 2024 (Carnegie Mellon, taught by Jignesh Patel)

> The slot array maps "slots" to the tuples' starting position offsets.

> The header keeps track of:

> The # of used slots

> The offset of the starting location of

> the last slot used.

> The most common layout scheme is called slotted pages.

Contents (item by item, this topic's scope):
1. The slotted-page layout itself: a header tracking used-slot count and the last-used offset, plus a slot array mapping slot numbers to variable-length tuples' actual byte offsets.
2. This is named as the most common page layout scheme in real database systems, the same layout a B-tree's own leaf (and inner) pages are built from.

## CSE 350: Advanced Data Structures and Indexes, Lecture 16: B-Tree Bulk Loading

URL: https://cse.buffalo.edu/adblab/people/zzhao35/teaching/cse350_spring26/files/16-btree-bulkload.pdf
Version: Spring 2026 (University at Buffalo)

> If we have a large collection of data, and we want to create a B-tree on their key

> Doing so by repeatedly inserting records can be very slow.

> Also leads to minimal leaf utilization

> fill factor: the default utilization ratio for leaf and internal pages (may vary for leaf and internal pages)

> typical values: 70%/80%

> Initialization: Sort all data entries, insert pointer to first (leaf) page in a new (root) page.

> Index entries for leaf pages always entered into right-most index page just above leaf level. When this fills up, it splits. (Split may go up right-most path to the root.)

> Much faster than repeated inserts, especially when one considers locking!

Contents (item by item, this topic's scope):
1. Why repeated one-at-a-time insertion into a fresh B-tree is slow and leaves leaves under-filled, especially under sequential insertion.
2. The bulk-load algorithm itself: sort all entries first, then build leaf pages left to right, keeping an in-memory, not-yet-written root; every structural split happens only along the tree's own right-most path, never anywhere else.
3. Fill factor's role during a bulk load specifically, with typical values (70%/80%), distinct from (but the same concept as) the per-tuple insert fill factor.

## MyRocks record format (Facebook mysql-5.6 wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/mysql-5.6/MyRocks-record-format.md
Version: wiki page, fetched 2026-10-23

> The **key**, of the lower level key/value, consists of a 4 byte index number followed by the memcomparable format of the primary key (denoted as 'M()'). The memcomparable format allows comparison of two values by using the simple memcmp "C" function. This is much more efficient than parsing out individual fields from the key and doing type-specific comparisons.

> For integral types the bytes are switched to big-endian order and negative values have all bits negated while positive values have the high bit turned on.

> For floating point types the bytes are switched to big-endian order and negative values have all bits negated while positive values have the high bit turned on and the exponent gets incremented.

> It is important to be able to compare keys without de-serializing and doing type-specific comparisons.

Contents (item by item, this topic's scope):
1. Key normalization's actual motivation: converting a typed key into a fixed, byte-comparable form so comparisons reduce to `memcmp`, never per-type parsing.
2. The concrete byte-level mechanism for the two most common fixed-width types: integers (big-endian, sign bit flipped) and floats (big-endian, sign bit flipped, exponent adjusted) — exactly what "normalization" does, in a real, current production key-value store built for MySQL.
