# Outline — de.row-vs-columnar-vs

8-step refresher, ~5 min. Running example: a 1,000-row, 4-attribute employee relation
(`emp_id`, `dept_id`, `age`, `salary`), packed as real bytes with `struct` in `examples.py` —
every byte count on screen is read back from those packed blobs, not estimated.

## Engagement arc

1. **Hook.** NSM (row-major) point lookup: one contiguous 32-byte read for one row. Fast, cheap,
   the thing row storage is built for.
2. **Predict: does row storage also win the scan?** (predict step, within the first four)
   options: "No — scanning one column still has to pass over every row's full width, correct:
   true" / "Yes — if it's fast for one row it's fast for one column too". Narrator's line: a
   reader has just seen row storage look unbeatable; the question is whether that holds for the
   opposite access pattern — reading one column across every row.
3. **Reveal: the scan NSM can't avoid.** fig: a column scan over 1,000 rows touches all 32,000
   bytes of the file, because every attribute of every row sits in the way. Visual: the NSM blob
   as a packed strip, the "age" column highlighted but every byte still shaded as touched.
   takeaway: a row-major scan for one column still reads every byte of every row; the attribute
   you don't need travels through memory anyway.
4. **Reveal: DSM wins the scan, loses the lookup.** fig: DSM's column scan touches only 8,000 of
   those bytes (seventy-five percent less) — but a DSM point lookup needs four separate reads
   across four sub-relations, one per attribute, where NSM needed one. Visual: four separate
   blobs, four separate read markers converging on one reconstructed row. takeaway: decomposing a
   relation by column wins every scan and loses every point lookup to a join across sub-relations.
5. **Reveal: PAX, the compromise.** fig: grouping columns into minipages inside each page keeps a
   point lookup to one page (like NSM) while a column scan still touches only the needed
   minipage's bytes (like DSM) — without reading a single extra page. Visual: one page split into
   four column-grouped minipages, a point-lookup arrow touching just that page, a scan arrow
   crossing every page but shaded only in its own minipage. takeaway: PAX changes the layout
   inside a page, not which pages are read, so it keeps NSM's I/O and DSM's useful-byte ratio.
6. **Reveal: the surprising number.** fig: PAX still opens all ten pages to scan one column — the
   same page count as NSM — but only twenty-five percent of each page's bytes are the column it
   needed. Visual: ten pages in a row, each shaded one quarter.
7. **Reveal: why Parquet is PAX.** fig: Parquet is a column-oriented file format that compresses
   and encodes per column — exactly the layout a PAX-style page buys. Visual: a Parquet-labeled
   page using the same minipage drawing as step 5, each minipage carrying its own compression.
   takeaway (none here; this step explains the real-world payoff of step 5's result, not a new
   measured fact).
8. **Recap.** Three storage models, three trade-offs: NSM wins the lookup and loses the scan, DSM
   wins the scan and loses the lookup, PAX keeps NSM's I/O while reading DSM's bytes. Handoff:
   every one of these layouts still has to survive a reader using a different schema version than
   the writer did.

## Concept ledger

- Introduces: `row-vs-columnar-layout`.
- Uses: `text-format-traps` (topic 1: CSV/JSON have no types; this topic shows the physical
  consequence of how those bytes sit on a page or file).
- Declared: Chapter 3's OLTP-vs-OLAP access-pattern framing, Chapter 5's page vocabulary (a
  "page" as a fixed-size I/O unit).

## Claims list

1. NSM stores records contiguously; an offset table locates each record. (PAX paper, §1)
2. DSM partitions a relation vertically into per-attribute sub-relations. (PAX paper, §1)
3. A DSM point lookup across several attributes costs a join across sub-relations. (PAX paper, §1)
4. PAX keeps the same per-page data as NSM but groups attribute values into per-page minipages.
   (PAX paper, §1)
5. PAX changes layout inside a page only; it does not change which pages are read (I/O). (PAX
   paper, §1 — direct quote)
6. The sandbox's own packed-byte measurements: NSM point lookup 32 bytes/1 read; NSM column scan
   32,000 bytes; DSM point lookup 4 reads; DSM column scan 8,000 bytes (75% less); PAX point
   lookup 1 page; PAX column scan 10 pages but 8,000 useful bytes (25% of 32,000 total).
7. Parquet is a column-oriented format built for compressed, per-column-tunable storage. (Parquet
   docs, Overview + Motivation)
