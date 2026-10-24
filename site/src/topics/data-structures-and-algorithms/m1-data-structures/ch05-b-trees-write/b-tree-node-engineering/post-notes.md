---
id: dsa.b-tree-node-engineering
title: B-tree node engineering
---

<section data-section="outcomes">

## After this topic you can

- Explain suffix truncation and key normalization, and show the byte savings each gives on a real key set.
- Lay out a page as a slot directory with a variable-length data area, and explain why this avoids shifting every entry on insert.
- Bulk-load a B+Tree from sorted input and show it costs fewer page writes than one-at-a-time insertion; explain PostgreSQL's duplicate-key deduplication and the version it shipped in.

</section>

<section data-section="internals">

## Into the internals

### Why suffix truncation is safe at a leaf split and never at an inner-node split

A leaf stores a record's actual key, so a leaf split has to leave both new leaves still answering "is this exact key here" correctly, which means a leaf keeps every key in full. The new routing entry promoted above that split answers a different, smaller question: which side does a search go. The PostgreSQL `nbtree` README is explicit that this is why the technique, loosely following Bayer and Unterauer's 1977 Prefix B-Trees paper, only ever applies at a leaf split's resulting pivot tuple, never at an inner-node split, where there is no equivalent "last key on one side, first key on the other" pair to truncate against.

### Why normalization and truncation solve different problems on the same key

Truncation shrinks what a routing entry stores, by dropping bytes that no longer distinguish anything. Normalization shrinks what a comparison has to know, by converting a typed value into a form where plain byte comparison already gives the right order — MyRocks's own documented scheme flips the sign bit and reorders bytes big-endian so an integer or a float never needs type-aware comparison logic again. A key can be normalized and then truncated; the two savings compound rather than compete.

</section>

<section data-section="lab">

## In the lab

`examples.py` measures the pivot-tuple byte size before and after suffix truncation on a real key set, normalizes a mixed set of signed integers and floats and verifies the normalized byte strings sort identically to the original typed values under plain byte comparison, bulk-loads a B+Tree from two hundred already-sorted keys while asserting every split during the build touches only the tree's own right-most node at its level, and compares that build's total page writes against one-at-a-time insertion of the identical sorted input. A separate simulation measures deduplication's storage savings on a key set built with many repeats.

</section>

<section data-section="production">

## In production

PostgreSQL's B-tree deduplication (`deduplicate_items`, on by default since version 13.0, released 2026-09-24) merges repeated non-pivot tuples into one physical tuple plus a posting list, applied lazily only at the point a page would otherwise split. An existing index built before upgrading needs a `REINDEX` to actually start using the feature. Fill factor (`fillfactor`, default ninety, configurable ten to one hundred) is the same documentation's own knob for how full a page gets packed on a build or a right-edge append, named in the same reference as being tied directly to bulk loading.

</section>

<section data-section="frontier">

## The frontier

PostgreSQL's own `nbtree` README explicitly declines to compress its deduplication posting lists, trading a larger on-disk footprint for simpler, faster concurrent deletion of individual entries — named here only in passing, not re-derived as its own mechanism.

</section>

<section data-section="questions">

## More questions

- Why does a leaf split need the full key even after the routing entry above it has already been truncated?
- What would go wrong with bulk loading's right-most-path property if the input keys weren't actually sorted first?

</section>

<section data-section="next">

## Where this goes next

Every technique so far still updates a page in place. LSM-trees, next, give up in-place updates entirely in exchange for turning every write into a sequential append.

</section>
