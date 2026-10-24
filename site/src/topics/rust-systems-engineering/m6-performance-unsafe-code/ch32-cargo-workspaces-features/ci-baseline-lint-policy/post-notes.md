---
title: "CI baseline and lint policy"
---

## Outcomes

- Measure that `cargo fmt --check` genuinely catches a real formatting violation `cargo build` compiles without complaint, and genuinely passes again once it is reverted.
- Measure that a lint denied once in the workspace's own `[lints]` table genuinely fails a real build the moment a member crate violates it, and genuinely passes again once the violation is reverted.
- Measure that a real logic regression a type signature cannot express is caught by `cargo test`, never by `cargo build`, which only checks that code compiles.
- State, from the Cargo Book, the real rules this topic's own code measures directly.

## Internals

An MSRV check against a crate's own declared `rust-version` (for example via `cargo +<pinned-toolchain> check`, or the dedicated `cargo msrv` tool) verifies that a crate genuinely still builds on the oldest Rust version it promises to support, catching an accidental dependency on a newer language or standard-library feature; this sandboxed container has only one installed toolchain (stable 1.97.0), so no second, older toolchain is available to measure a real MSRV violation directly. Dependency auditing (checking a crate's own dependency tree against a real vulnerability database) is deferred by the syllabus itself to Chapter 41, where it gets its own full topic.

## In production

`cargo nextest`, the syllabus's own named faster test runner, and `cargo-semver-checks`, the syllabus's own named tool for catching an accidental breaking change to a library's own public API between releases, are both named here in prose rather than run for real, since neither is installed in this sandboxed container (`shutil.which` returns nothing for either). A real project's CI pipeline typically wires all three of this topic's own measured gates, plus these two, into one pipeline that runs on every push, so a regression is caught before a human reviewer ever has to notice it by eye.

## The frontier

`cargo fix --edition`, the syllabus's own named tool for automating most of the mechanical work a Rust edition migration needs, is a real, separate concern from the three gates this topic measures directly: it changes code to match a new edition's own rules, rather than checking that existing code already meets a rule. None of this topic's own three measured gates (format, a denied lint, a test) would catch a crate that is simply still declaring an older edition; that is a choice a project makes on purpose, not a violation any of these three gates is designed to report.

## Where this goes next

A lint and a test enforced the same way every time catches a real regression in the code; it says nothing yet about the real, separate cost a release build itself imposes once that correct code actually has to ship.
