---
title: "Supply-chain trust and provenance"
---

## Outcomes

- Measure that a real `cargo audit` run against a real, pinned, known-vulnerable dependency version reports the real, published advisory against it, by its own real id, with no project-specific configuration.
- Measure that the identical real lookup against the real, patched version one release later reports a clean result, from the exact same real, live database.
- Measure that the real advisory database tells the two real, pinned versions apart correctly, flagging only the one it actually names, not the crate as a whole.
- State, from the RustSec Advisory Database's own front page, the real nature of the database and the `cargo-audit` tool this topic's own two lookups measure directly.

## Internals

`cargo deny`, the syllabus's own other named tool, extends the identical real advisory lookup this topic measures with real policy enforcement beyond just known vulnerabilities: license checks, allowed dependency sources, and detecting multiple versions of the same crate in one real dependency tree. `cargo vet`, also named in the syllabus, lets one project's own real audit of a dependency be shared with and reused by another project, rather than every project running the identical real review independently. Neither is measured directly in this topic's own reel, which isolates the single advisory lookup `cargo audit` performs.

## In production

Build scripts and proc macros run arbitrary real code at build time, on the machine actually building the project, which a version-pinned advisory lookup does not catch on its own, since running arbitrary code is not itself a known, disclosed vulnerability. Typosquatted malicious crates, like the real, named `faster_log`/`async_println` pair removed from crates.io in September 2025, are the identical kind of risk: a real, deliberately malicious crate with no advisory against it yet, since an advisory only exists once a vulnerability has actually been disclosed and recorded.

## The frontier

`cargo auditable` embeds a real dependency tree directly into a compiled binary, so a real production binary can be audited after the fact, by someone who never built it themselves, continuing the identical real lookup this topic measures but applied to an artifact rather than a source tree. crates.io's own Trusted Publishing removes long-lived, stealable publish tokens from the real publishing step itself, addressing a real supply-chain risk upstream of anything a dependency-version lookup can catch.

## Where this goes next

A real boundary inside a project's own code, and a real, published record of which outside code is actually trustworthy, are both real, concrete answers to the same underlying question, whether trust is actually checked or merely assumed; the next real question this milestone asks is how to actually test a system that only fails under a real, specific interleaving or a real, specific kind of crash.
