# Outline: B+-tree fanout and page splits (`rust.b-tree-fanout-page`)

Chapter 21, topic 55 (only topic, closes Chapter 21). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, minimal B+-tree over fixed-size byte buffers playing the role of disk pages, each page a self-describing header plus a fixed-size entry array.
2. Measure that inserting past a page's own fill factor genuinely triggers a real split, propagating a new separator key up into the parent.
3. Measure that the tree's own depth stays within a handful of levels even as the number of inserted records grows into the thousands.
4. Measure that packing pages less than completely full on purpose genuinely changes how often the identical insert sequence has to split again.
5. Measure that a separator key built from only its first differing part genuinely takes less storage than a full copy of the key, while still routing every search identically.
6. State, from PostgreSQL's own documentation and its `nbtree` README, why fanout, fill factor, and suffix truncation are named together.

## Changes from the chapter plan

None. All claims are measured directly against a real, deterministic B+-tree built from fixed-size byte buffers; nothing here needs root access, real wall-clock timing, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"A leaf page holds only a handful of entries before it's full, say seven. Insert one more into a full page. What happens?"** (predict, hook) — `fig`: a full leaf page, one more entry arriving. Options: it's simply rejected, the new entry has nowhere to go / it silently overwrites the oldest entry to make room / it splits into two pages, and a new key is pushed up into its parent (correct).
2. **"Measured: inserting past a full page genuinely allocated a new page and pushed a real separator key up into a new root; every original key is still found afterward"** — `fig`: the real split, one page becoming two, a separator in a new parent. Takeaway: "A full page doesn't reject or overwrite a new entry; it splits in two and hands a new key up."
3. **"Keep inserting records, into the thousands. Does the tree's own depth grow about as fast as the record count, or much slower?"** (predict) — `fig`: the same tree, record count climbing into the thousands. Options: about as fast, so a huge table means a huge number of levels / much slower; a high enough fanout keeps the tree only a few levels deep (correct) / depth never changes once the tree has a root.
4. **"Measured: after thousands of inserts, the tree's own depth genuinely stayed within a handful of levels, with every record still found correctly"** — `fig`: the real, measured depth ladder, still only a few bands even at thousands of records. Takeaway: "High fanout is why a lookup touches only a few pages, even at billions of records."
5. **"Two trees get the identical sequence of inserts. One packs each page less than completely full before its next split; the other packs pages fuller. Which one ends up splitting more times overall?"** (predict) — `fig`: two trees, the same inserts, different packing. Options: the one packed less full, since each split leaves less spare room before the next insert forces another one (correct) / the one packed fuller, since it's always closer to overflowing / exactly the same number of times either way.
6. **"Measured: packing pages less full genuinely caused more splits over the identical insert sequence than packing them fuller did"** — `fig`: the real, measured split counts, side by side. Takeaway: "Packing a page less than completely full on purpose smooths out how often it has to split again."
7. **"A split's new separator key only has to tell two sides apart, not describe either key in full. Can it genuinely take less storage than a full copy of the key, and still route every search correctly?"** (predict) — `fig`: a full key beside a shortened separator. Options: no, a separator always needs the full key to compare correctly / yes, a shorter separator can route identically, as long as it still carries the first real difference (correct) / only if the two sides' keys happen to already be identical.
8. **"Measured: a separator built from only the first differing part of the key genuinely took fewer bytes than a full copy, yet routed every test key exactly like the full one"** — `fig`: the real, measured byte counts, shortened versus full, same routing outcome. Takeaway: "Keeping only the shortest piece of a key that still tells two sides apart shrinks separator keys for free."
9. **"PostgreSQL's own `nbtree` README names exactly why it bothers with this directly: what does it say the goal of suffix truncation actually is?"** — `fig`: the real system's own words on suffix truncation, shown directly. NO new predict (continues directly from step seven's own separator-shrinking question, to the real system's own stated reason). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — a full page doesn't reject a new entry, it splits in two and pushes a new key up; high fanout is exactly why that keeps the tree only a few levels deep, even at a huge record count. Packing a page less than completely full on purpose smooths out how often it has to split again, and a separator key only needs the shortest piece that still tells two sides apart, which is exactly what PostgreSQL's own `nbtree` does to improve fanout further still.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (about separator-key truncation; step 9 continues from it directly, with no new predict, to PostgreSQL's own `nbtree` README words on the same trade-off).
- Surprising fact: step 9 (the real system's own documentation naming exactly this topic's own measured technique).
- Takeaways: steps 2, 4, 6, 8 (four — step 9 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| typically, over 99% of all pages in a B-tree index are leaf pages | PostgreSQL docs (quoted) |
| a page split must insert a new downlink into the parent page, which may cause the parent to split in turn | PostgreSQL docs (quoted) |
| if pages become completely full they are split, leading to fragmentation; B-trees use a default fillfactor of 90 | PostgreSQL docs (quoted) |
| the goal of suffix truncation of key attributes is to improve index fan-out | PostgreSQL `nbtree` README (quoted) |
| inserting past a full leaf page genuinely triggers a real split, allocating a new page and pushing a real separator key up into a new root, with every original key still found afterward | `examples/runtime-demo/src/btree_fanout_split_depth_truncation.rs` (executed, measured) |
| the tree's own depth genuinely stays within a handful of levels even after thousands of inserts, with every record still found correctly | `examples/runtime-demo/src/btree_fanout_split_depth_truncation.rs` (executed, measured) |
| packing pages less than completely full on purpose genuinely causes more splits over an identical insert sequence than packing them fuller does | `examples/runtime-demo/src/btree_fanout_split_depth_truncation.rs` (executed, measured) |
| a separator key built from only its first differing part genuinely takes fewer bytes than a full copy of the key, while routing every test key identically | `examples/runtime-demo/src/btree_fanout_split_depth_truncation.rs` (executed, measured) |

## Concept ledger

- `introduces`: `btree-fanout-split-tradeoff` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `self-describing-page-header`, `slot-indirection-stable-identity` (Chapter 19)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.1's own line for this topic, reused: "Chapter 20 closed on a durable, recoverable log, but said nothing about how a single record is actually found among billions of others without scanning every page to find it."
- Handoff: `CHAPTER.md` §A.2's own line for this topic, reused verbatim: "A B+-tree pays its own write cost immediately, at insert time, as a split; the next chapter's write-optimized alternative defers that cost instead, and the trade-off between the two is the real subject of the next chapter's own first topic."
