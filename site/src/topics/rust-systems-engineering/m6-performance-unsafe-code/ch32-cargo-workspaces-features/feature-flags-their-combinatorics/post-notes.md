---
title: "Feature flags and their combinatorics"
---

## Outcomes

- Measure that a non-additive feature a sibling crate requests silently changes a shared dependency's own existing behavior in a crate that never asked for it.
- Measure that a genuinely additive feature a sibling crate requests leaves that same shared dependency's own existing behavior, and every crate that never asked for it, untouched.
- Measure that a crate's own dev-dependency feature request leaks into its plain, non-test build under the old resolver default, and genuinely does not leak under the modern, edition-2024 resolver.
- State, from the Cargo Book, the real rule this topic's own code measures directly.

## Internals

`cargo tree -e features` is cargo's own real inspection command for seeing exactly which features actually got unified into a dependency, and from which requester, for a given build invocation. This topic measures the unified *result* through a built binary's own real stdout rather than parsing that command's own output, since the result is what the syllabus's own clause is actually about; the command itself is named here as the real tool to reach for when a unification result needs explaining rather than just observing.

## In production

`cargo hack --feature-powerset`, the syllabus's own named tool for building and testing a crate under every combination of its own features, is not installed in this sandboxed container, so it is named here in prose rather than run for real. On a real project with more than a small number of features, the number of combinations it covers grows exponentially, which is exactly why staying additive (so that no combination can silently misbehave) matters more as a crate's own feature count grows.

## The frontier

This topic's own dev-dependency comparison isolates exactly one resolver change: the one edition 2021's resolver 2 already fixed, which keeps a dev-dependency's own requested feature out of a plain, non-test build. The resolver edition 2024 defaults to additionally changed how target-specific dependencies and build-dependencies unify features, a real further nuance no crate in this topic's own workspace is shaped to exercise, since both workspaces here build for one target with no build-dependencies at all.

## Where this goes next

A feature that stays additive under real unification is a real, local correctness property; it says nothing yet about whether anyone but its own author ever actually checks that property before it ships.
