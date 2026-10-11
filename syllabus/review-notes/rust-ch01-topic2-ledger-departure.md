# Review note — Rust Ch.1, topic 2 (`rust.raii-drop-order-leak`): ledger departure from the chapter plan

Written by the content review of `rust.raii-drop-order-leak` (October 2026). Applies to the registry entries of Ch.1 topics 1 to 4 (`single-ownership-move-semantics`, `raii-drop-order-leak`, and the two after it). Nothing here moves a topic.

## What departs from `CHAPTER.md`

- **`counting-allocator` is registered by topic 2.** The chapter plan gives the counting allocator to topic 1 (its reel builds the instrument and Lab 2 teaches it), but topic 1 did not register the id in its `introduces`. Topic 2 uses the instrument (leak measurements, `examples/leak.rs`), so its registry entry lists `counting-allocator` in `introduces` to keep the ledger check green. Until topic 1's entry is fixed, the chapter ledger says topic 2 introduces it.
- **`uses` names topic 1's real ids.** Topic 2 `uses`: `ownership, move-semantics, deinitialized-place, copy-trait, clone-cost, ownership-signatures`. The plan's list (`single-ownership`, `copy-vs-clone`, ...) does not match the ids topic 1 actually registered. See `OUTLINE.md` of topic 2, "Changes from the chapter plan", items 1 and 2.

## What to do

1. **At topic 1's release** (its run can do this while content-final; an unlock is needed only once it is live): add `counting-allocator` to topic 1's `introduces`, and delete it from topic 2's `introduces`. Keep topic 2's entry as it is until then.
2. **Topics 3 and 4** (built in parallel to the plan) must write `uses` with topic 1's real ids, not the plan's (`single-ownership`, `copy-vs-clone`, `counting-allocator`, ...), or the build's ledger check fails the same way. `counting-allocator` in a later topic's `uses` is valid only after step 1.
3. Update `CHAPTER.md` A.7 so the ledger table names the real ids.

## Status

Open for a human or the release run of topic 1; not fixed by this review because topic 1 is content final but not live, and touching its registry entry needs an unlock.
