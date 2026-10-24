---
title: "Property-based and model-based testing"
---

## Outcomes

- Measure that a real property test, driven by `proptest`, genuinely finds a real, planted bug in a naive insert implementation across a large, random space of generated inputs, and shrinks the real failure down to a minimal case.
- Measure that the identical real property test genuinely passes, across hundreds of real random cases, against a checked, correct insert implementation.
- Measure that a real, stateful, model-based comparison between the checked implementation and a real, deliberately simpler reference model agrees on every real decision, across a real, random sequence of operations.
- State, from the `proptest` crate's own README, the real nature of property-based testing and shrinking this topic's own two measured runs demonstrate directly.

## Internals

This topic's own third real run, the stateful, model-based comparison between the checked allocator and the simpler reference model, is driven by the identical `proptest::test_runner::TestRunner` and the identical random sequence strategy as the first two runs, but checks real agreement between two independent implementations at every step rather than checking one invariant against one implementation; both are real applications of the identical underlying tool, generating a real, random space of inputs and checking something real against every one of them.

## In production

`loom`'s own real, exhaustive exploration of scheduler interleavings, the syllabus's own other named technique for this chapter, finds a real bug in concurrent code that depends on a specific, real thread interleaving rather than on a specific, real sequence of operations against a single-threaded structure; this topic's own `SlotPage` has no real concurrency to interleave, so `loom` is named here rather than measured directly.

## The frontier

Deterministic simulation testing (a single-threaded, deterministic executor with a simulated network, disk, and clock, replayable from a real seed) and turning real fuzz findings into permanent regression tests are the syllabus's own other two named techniques for this chapter, both skipped in this curriculum; each would extend the identical real discipline this topic measures, trying many real cases and reducing a real failure to its own minimal cause, to a far larger, real, distributed system than this topic's own tiny allocator.

## Where this goes next

A real property test and a real, stateful, model-based comparison both catch what a hand-picked example cannot; the next real question this milestone asks is how all of this domain's own real techniques come together in one real system, built and judged end to end.
