---
title: "B+-tree fanout and page splits"
---

## Outcomes

- Build a real, minimal B+-tree over fixed-size byte buffers playing the role of disk pages, each page a self-describing header plus a fixed-size entry array.
- Measure that inserting past a page's own fill factor genuinely triggers a real split, propagating a new separator key up into the parent.
- Measure that the tree's own depth stays within a handful of levels even as the number of inserted records grows into the thousands.
- Measure that packing pages less than completely full on purpose genuinely changes how often the identical insert sequence has to split again.
- Measure that a separator key built from only its first differing part genuinely takes less storage than a full copy of the key, while still routing every search identically.

## Internals

Every page here is a fixed-size byte buffer with a self-describing header — page type and entry count — plus a fixed-size entry array, continuing Chapter 19's own page-and-slot pattern rather than standing in a plain collection for a page. The fill factor controls the split point directly, as the fraction of an overflowing page's entries that stay on the left side of a split, modeling the same right-edge packing PostgreSQL applies during initial builds and sequential appends. The truncation demonstration uses a four-attribute composite key, because real suffix truncation drops whole trailing key attributes, not arbitrary suffix bytes of one scalar value.

## In production

PostgreSQL's own documentation states the split behavior directly: typically, over 99% of all pages in a B-tree are leaf pages, and a page split must insert a new downlink into the parent, which can cascade the parent's own split in turn. Its `CREATE INDEX` reference names the same trade-off for fillfactor: a page that becomes completely full gets split, fragmenting the index, so B-trees default to a fillfactor of ninety rather than one hundred. Its `nbtree` README states the point of suffix truncation plainly: the goal is to improve index fan-out.

## The frontier

This topic's own page capacity — seven entries — is a deliberately small, fixed constant chosen so a bulk insert of thousands of keys produces many real splits and several real levels within one quick, deterministic run; it is not a claim about production page sizes. All four of this topic's own measured claims run entirely on in-memory, fixed-size byte buffers, with no file, network, or root access needed.

## Where this goes next

A B+-tree pays its own write cost immediately, at insert time, as a split; a write-optimized structure can defer that cost instead, and that trade-off is the next chapter's own first subject.
