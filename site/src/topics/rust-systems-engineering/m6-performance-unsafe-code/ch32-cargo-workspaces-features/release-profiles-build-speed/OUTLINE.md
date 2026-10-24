# Outline — Release profiles and build speed

Concept ledger: introduces `a-release-profiles-dials-are-a-real-measured-trade`; uses `a-lint-written-once-is-enforced-every-time` (topic 84) only in prose, per Chapter 32's own CHAPTER.md §A.7 — this topic reuses the immediately preceding topic's own introduced id directly, continuing the identical within-chapter pattern Chapters 30 and 31 established, and closes Chapter 32.

Bridge/handoff (verbatim from CHAPTER.md §A.8): "A lint and a test enforced the same way every time catches a real regression in the code; it says nothing yet about the real, separate cost a release build itself imposes once that correct code actually has to ship." Hands off to Chapter 33's own first topic (verbatim): "A workspace, a feature, a lint policy, and a release profile are all real, project-shaping decisions made once and paid for on every later build; the next chapter turns to a system that is actually running, where the cost of a wrong decision shows up only once real traffic is already flowing through it."

This topic measures a real, small, genuinely recursive crate (`examples/profile_demo/`, a Fibonacci binary) under several real `[profile.release]` configurations, timing each real build with `time.perf_counter()` and measuring each real binary's own file size directly, per Chapter 32's own CHAPTER.md §A.6: no fixed number is asserted, only the real direction of each measured difference, since build timing and binary size are this sandboxed container's own.

## Storyboard (8 steps, 3 predict/reveal pairs)

1. **LtoPredict** — The identical crate is built once under the default release profile, then again with `codegen-units = 1` and `lto = "fat"` added. Does the second real build genuinely take longer? Options: no, fewer codegen units always builds faster; yes, genuinely, whole-program optimization costs real linking time (correct); only if the crate is large enough to need it.
2. **LtoReveal** — Measured: the real, default release build and the real `codegen-units = 1`, `lto = "fat"` build are timed directly on this container's own toolchain; the second genuinely takes measurably longer, every time. No separate takeaway here (this is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting step, below).
3. **StripPredict** — The identical crate is built once with the default profile, then again with `strip = true` added. Does the real binary on disk genuinely shrink? Options: no, stripping only changes a debugger's own view of it; yes, genuinely, the real file on disk gets smaller (correct); only on a non-Linux target.
4. **StripReveal** — Measured: the real, unstripped binary and the real, stripped binary are both measured directly by their own real file size on disk; the stripped one is genuinely smaller every time. Takeaway: a profile dial can shrink what actually ships without changing one line of the program's own real behavior.
5. **AbortPredict** — The identical crate is built once more with the default, unwinding panic strategy, then again with `panic = "abort"` added. Does the real binary genuinely shrink this time too? Options: no, the panic strategy only matters if the program actually panics; yes, genuinely, the unwinding machinery itself costs real space even when unused (correct); only if the crate uses `catch_unwind`.
6. **AbortReveal** — Measured: the real, unwinding binary and the real, `panic = "abort"` binary are both measured directly by their own real file size on disk; the `abort` one is genuinely smaller every time, since no stack-unwinding tables need to be generated for it. Takeaway: a release profile's own dials trade away a real capability (here, catching a panic) for a real, measured cost in return.
7. **DocsReveal** — The Cargo Book states these rules directly, in its own words: LTO produces better optimized code at the cost of longer linking time; more codegen units lets more of a crate build in parallel, possibly reducing compile time but producing slower code. Do this topic's own three measured trade-offs model exactly the trade the Cargo Book names? Takeaway (moved here from step 2): every one of a release profile's own dials is a real trade a project makes on purpose, never a free improvement.
8. **Recap** — `codegen-units` and `lto` trade build time for runtime optimization; `strip` trades debuggability for a smaller shipped binary; `panic` strategy trades a real safety capability for a smaller one still; a release profile is a set of real, deliberate trades, not a single "faster" switch.

## Engagement arc

- Predicts: steps 1, 3, 5 — each a genuine guess about what one specific, real build or real binary of this exact crate actually does.
- Takeaways: steps 4, 6, 7 (three — step 2 deliberately carries none, since it is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting "the docs say this" step; step 8's recap carries the closing statement instead of a fourth).

## Deferred to post-notes (not measured in the reel itself, per the kit's real-measurement standard)

- PGO and BOLT, the syllabus's own named further optimization techniques, deferred by the syllabus itself to Chapter 38, where they get their own full topic — The frontier.
- Reproducible builds, `sccache`, the LLD default linker on x86_64 Linux (stable since Cargo 1.90), and crates.io Trusted Publishing (OIDC from CI); none of these change this topic's own three measured dials directly, and `sccache` is not installed in this sandboxed container — In production.
- Thin vs. fat LTO's own real difference in linking time at a larger, more realistic crate size than this topic's own small Fibonacci binary needs to show the direction of the trade — Internals.
