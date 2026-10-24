# Outline — Workspace and crate boundaries

Concept ledger: introduces `a-crate-is-the-real-unit-of-a-rebuild`; uses no earlier chapter's own introduced id directly in its own measured code, per Chapter 32's own CHAPTER.md §A.7 — this topic opens the chapter by building the one real, small, growing workspace every later topic in this chapter extends.

Bridge/handoff (verbatim from CHAPTER.md §A.8): "A correct boundary and a working extension both still live inside one crate; the next chapter turns to the question of where a crate's own boundary should actually sit once a real project has more than one of them." Hands off to topic 83 (verbatim): "A workspace decides which crates exist and what each one depends on; it says nothing yet about what happens when two of those crates want slightly different behavior from the one dependency they share."

Chapter 32's own disclosed convention (§A.3/§A.6) applies: all four topics in this chapter build on variants of one real, small Cargo workspace (`core_crate`, depending on nothing in the workspace; `consumer_crate`, depending on `core_crate`), with workspace-inherited dependencies (`once_cell`, via `[workspace.dependencies]`) and workspace-inherited lints (`unsafe_code = "forbid"`, via `[workspace.lints]`). This topic measures three real, falsifiable claims about that workspace using real build-artifact mtimes and a real, deliberately introduced violation, never a timed benchmark.

## Storyboard (8 steps, 3 predict/reveal pairs)

1. **ConsumerOnlyPredict** — A real two-crate workspace is built once, then only `consumer_crate`'s own source changes, and the workspace is rebuilt. Does `core_crate`'s own compiled artifact change too? Options: yes, cargo always rebuilds the whole workspace; no, genuinely, only `consumer_crate`'s own artifact changes (correct); only if the lints table also changed.
2. **ConsumerOnlyReveal** — Measured: after a consumer-only change, `core_crate`'s own real compiled artifact has the identical real modification time it had before; only `consumer_crate`'s own artifact genuinely changed. No separate takeaway here (this is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting step, below).
3. **CoreChangePredict** — The identical workspace now has `core_crate`'s own source changed instead. Does `consumer_crate` have to rebuild too, even though its own source never changed? Options: no, only `core_crate` needs to rebuild; yes, genuinely, since `consumer_crate` depends on it (correct); only if `consumer_crate` is rebuilt by hand.
4. **CoreChangeReveal** — Measured: after a real `core_crate` change, both `core_crate`'s own artifact and `consumer_crate`'s own artifact genuinely get a new, later real modification time. Takeaway: a dependency's own real boundary is exactly where a rebuild's own real cost actually propagates.
5. **LintEnforcedPredict** — The workspace's own `[workspace.lints]` table forbids unsafe code for every member crate. A real, deliberately unsafe block is added to `consumer_crate`. Does the inherited lint genuinely catch it? Options: no, lints only warn, they never block a build; yes, genuinely, the real build fails on it (correct); only if `cargo clippy` is run separately.
6. **LintEnforcedReveal** — Measured: the real build genuinely fails the instant the real unsafe block exists in `consumer_crate`, and genuinely succeeds again the moment it is removed, with no change to the workspace's own lint declaration at all. Takeaway: a lint declared once, inherited by every member, is enforced the identical way everywhere.
7. **DocsReveal** — The Rust Reference and the Cargo Book state these rules directly, in their own words: a crate is a real unit of compilation and linking; a workspace's own `[workspace.dependencies]` and `[workspace.lints]` tables are where a shared dependency or a shared lint configuration is defined once, to be inherited by every member. Does this topic's own three measured boundaries model exactly the rules both sources describe? Takeaway (moved here from step 2): drawing a workspace's own boundary along real ownership, not around a module, decides what a rebuild and a lint violation actually have to touch.
8. **Recap** — A crate, not a module, is the real unit cargo rebuilds; a dependency's own real boundary decides what a change forces to recompile, and a lint declared once is enforced the identical way for every member that inherits it.

## Engagement arc

- Predicts: steps 1, 3, 5 — each a genuine guess about what one specific, real rebuild or real lint check of this workspace actually does.
- Takeaways: steps 4, 6, 7 (three — step 2 deliberately carries none, since it is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting "both sources say this" step; step 8's recap carries the closing statement instead of a fourth).

## Deferred to post-notes (not measured in the reel itself, per the kit's real-measurement standard)

- Workspace publishing (Cargo 1.90), the syllabus's own named mechanism for publishing every member crate of a workspace together, beyond what this topic's own two-crate example needs to demonstrate — In production.
- `resolver = "3"`, the MSRV-aware resolver this topic's own workspace already declares, and what specifically changed from resolver 2 — Internals.
- The real alternative this topic's own two-crate split avoids: "a crate per module," and the real, concrete cost (every module becomes its own rebuild unit, multiplying crate-boundary overhead) that choice would add — The frontier.
