---
title: "Workspace and crate boundaries"
---

## Outcomes

- Build a real, small two-crate workspace with workspace-inherited dependencies and lints, and measure that a consumer-only source change leaves the crate it depends on genuinely untouched.
- Measure that changing the depended-on crate genuinely forces both it and its dependent to rebuild.
- Measure that the workspace's own inherited lint policy genuinely blocks a real, deliberately introduced violation in a member crate, and genuinely allows the identical workspace to build clean again once it is removed.
- State, from the Rust Reference and the Cargo Book, the real rules this topic's own code measures directly.

## Internals

This topic's own workspace declares `resolver = "3"`, Cargo's own MSRV-aware resolver, the default under edition 2024 (also the subject of topic 83's own syllabus clause on feature unification). Resolver 3 changed how `dev-dependencies` and build-dependencies unify features relative to resolver 2 and the older, default resolver 1, specifically to reduce the kind of unexpected feature leakage topic 83 measures directly; this topic's own two-crate workspace is small enough that the difference does not show up in its own measured claims, so it is named here rather than measured.

## In production

Workspace publishing (stable since Cargo 1.90) lets every member crate of a workspace that should be published to crates.io be versioned and released together through one real command, rather than publishing each member by hand in dependency order; this topic's own two crates are not published anywhere; the mechanism is named here in prose since this sandboxed container has no crates.io credentials to publish with for real.

## The frontier

The real alternative this topic's own two-crate split avoids is "a crate per module": splitting a project's own internal module structure into one crate per module regardless of whether a real API or dependency boundary exists there. Since a crate, not a module, is cargo's own real rebuild unit, that choice multiplies the number of real crate boundaries a change has to cross without multiplying any real, independent ownership; every extra crate boundary adds its own real linking and metadata overhead for no real incremental-build benefit, which is exactly why the syllabus's own opening clause ties a workspace boundary to API and dependency ownership instead.

## Where this goes next

A workspace decides which crates exist and what each one depends on; it says nothing yet about what happens when two of those crates want slightly different behavior from the one dependency they share.
