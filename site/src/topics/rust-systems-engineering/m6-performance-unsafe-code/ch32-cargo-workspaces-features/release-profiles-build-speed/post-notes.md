---
title: "Release profiles and build speed"
---

## Outcomes

- Measure that `codegen-units = 1` and `lto = "fat"` genuinely take longer to build than the default release profile, on this exact toolchain.
- Measure that `strip = true` genuinely produces a smaller real binary on disk than the default, unstripped profile.
- Measure that `panic = "abort"` genuinely produces a smaller real binary than the default, unwinding panic strategy, since no unwinding tables need to be generated for it.
- State, from the Cargo Book, the real trade-offs this topic's own code measures directly.

## Internals

Thin LTO and fat LTO differ in how much of the dependency graph gets optimized together: fat LTO attempts whole-program optimization across every crate, while thin LTO optimizes in smaller, parallel groups for substantially less linking time at a similar runtime benefit. This topic's own small Fibonacci crate has only one real crate in its build graph, so thin-versus-fat LTO's own real linking-time difference does not show up distinctly at this size; the direction (fat costs more linking time than thin, which costs more than none) is named here rather than measured on a crate too small to separate the three.

## In production

Reproducible builds (so the identical source genuinely produces a bit-for-bit identical binary), `sccache` (a real, shared compilation cache that can skip recompiling what another build already compiled), the LLD default linker on x86_64 Linux (stable since Cargo 1.90), and crates.io Trusted Publishing (OIDC-based authentication from CI, rolled out in 2025) are all real, separate build-engineering concerns the syllabus names alongside this topic's own three measured dials. None of them is measured directly here: `sccache` is not installed in this sandboxed container (`shutil.which` returns nothing for it), and the other three change how or where a build runs rather than producing a measurable difference in this topic's own small, single-machine crate.

## The frontier

PGO (profile-guided optimization, recompiling with real, previously-collected runtime profile data) and BOLT (a binary-level post-link optimizer) are real, further optimization techniques beyond what any single `[profile.release]` dial in this topic's own three measured trade-offs can produce; the syllabus itself defers both to Chapter 38, where they get their own full topic once this domain has built the profiling infrastructure PGO and BOLT both depend on.

## Where this goes next

A workspace, a feature, a lint policy, and a release profile are all real, project-shaping decisions made once and paid for on every later build; the next chapter turns to a system that is actually running, where the cost of a wrong decision shows up only once real traffic is already flowing through it.
