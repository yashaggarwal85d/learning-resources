# Chapter 32 — Cargo Workspaces, Features, Lints, Tests, and Release Engineering (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 6, *Performance, Unsafe Code, FFI, Build, and Observability* (its fourth and final chapter). Chapter 32 has one section: 32.1 *Build engineering* (four full topics: workspace and crate boundaries, feature flags and their combinatorics, CI baseline and lint policy, and release profiles and build speed; no skipped topics). The chapter's own lab exercise (split a prototype into core/transport/storage/service crates with CI, feature-gated backends, integration tests and a reproducible release profile) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter's own last topic: topic 81, *Embedding Rust in Python and JVM*, which closed Chapter 31 by naming this chapter's own first question directly: once a project has more than one crate, where should a crate's own boundary actually sit.

This file is the contract the chapter's four topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 31 measured a single crate's own boundary with the outside world. This chapter's own opening sentence states its thesis directly: crate boundaries, feature combinatorics, and a release pipeline you can trust. A real project outgrows a single crate, and every one of this chapter's own four topics measures a real, specific cost of getting that growth wrong: a workspace split along the wrong line costs real incremental-compilation time, since a crate (not a module) is Cargo's own real unit of parallel and incremental rebuilding; a feature that is not genuinely additive costs a real, silent correctness bug the moment two dependents enable different, conflicting subsets, since Cargo's own real feature unification merges every dependent's requested features into one; a lint or a test that only runs locally costs a real regression that ships, since CI is the only real gate anyone but the author ever sees; and a release profile chosen by habit rather than measurement costs a real, needless slice of either build time or runtime speed, since `opt-level`, LTO, and `codegen-units` are real, independent dials with a real, measurable trade curve. None of this is a type the compiler checks; every one of these is a real, measurable engineering decision a project either gets right or pays for.

By the end of this chapter's four topics, the learner can: split a real multi-crate workspace along a real API/dependency boundary and measure that doing so genuinely changes what an incremental rebuild has to redo; build a real Cargo feature that stays additive under real unification and measure a real, concrete case where a non-additive feature would silently break; wire a real local CI baseline (format, lint-as-error, tests) and measure that it genuinely catches a real, introduced regression before it would ship; and measure the real, concrete build-time and binary-size trade-off a real release profile's own dials actually produce on this exact toolchain.

## A.2 The order of ideas, and why

1. **Workspace and crate boundaries** (topic 82, this chapter's first topic) — builds the foundation every later topic in this chapter measures against: a real, small multi-crate workspace with workspace-inherited dependencies and lints, measuring that a crate is genuinely Cargo's own real unit of incremental rebuilding, and that a boundary drawn along API/dependency ownership genuinely changes what a change actually has to recompile.
2. **Feature flags and their combinatorics** (topic 83) — builds a real Cargo feature inside that same workspace, measuring real feature unification across two dependents and a real, concrete case where a non-additive feature would silently produce the wrong behavior depending only on build order.
3. **CI baseline and lint policy** (topic 84) — builds a real local CI baseline (format check, Clippy with warnings as errors via the `[lints]` table) against that same workspace, measuring that it genuinely catches a real, deliberately introduced regression that a plain `cargo build` alone would not.
4. **Release profiles and build speed** (topic 85) — builds the identical small workspace under two real, different release profiles, measuring the real, concrete build-time and (where measurable in this sandboxed container) binary-size trade-off those profile dials actually produce.

*(The chapter's own lab — split a prototype into core/transport/storage/service crates with CI, feature-gated backends, integration tests and a reproducible release profile — is not a reel; it stays in the syllabus as a lab exercise, exercising this chapter's own four full topics together rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real, small, growing workspace

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–31's conventions, with one explicit, chapter-wide change: all four topics in this chapter build on the identical real, small Cargo workspace rather than four independent crates, since the chapter's own subject (workspace boundaries, feature unification, CI, and release profiles) only exists once more than one crate is involved. Topic 82 creates this workspace; topics 83–85 each extend it with their own specific, real, measured addition, and each topic's own `examples/` folder holds its own independent copy of the workspace at the point that topic needs it, so every topic still builds and runs on its own, continuing this domain's own self-contained-topic rule.

- **Topic 82** builds a real two-crate workspace (`core`, depending on nothing in the workspace; `consumer`, depending on `core`) with `[workspace.dependencies]` and `[workspace.lints]` both genuinely inherited rather than duplicated, and measures real `cargo build` timing evidence that changing only `consumer`'s own source leaves `core`'s own compiled artifact untouched, while changing `core`'s own source genuinely forces both to recompile.
- **Topic 83** adds a real, additive Cargo feature to `core` (for example, a feature gating one extra, purely additive method) and a second dependent crate that enables a different subset of features than `consumer` does, measuring that Cargo's own real feature unification builds one shared copy with every requested feature turned on, plus a real, concrete demonstration of what a non-additive feature (one that changes existing behavior rather than only adding to it) would silently do differently depending on which crate happens to be built first.
- **Topic 84** adds a real `[lints]` table denying a specific Clippy lint as an error, plus a deliberately introduced real violation of it, and measures that a real local CI-style check (`cargo fmt --check`, `cargo clippy`) genuinely fails on that violation and genuinely passes once it is fixed.
- **Topic 85** builds the identical workspace under two real, different `[profile.release]` configurations (differing in at least `codegen-units` and LTO) and measures the real, concrete wall-clock build-time difference between them on this exact toolchain, stating the real, standard trade-off (slower build, often-faster or smaller output) those dials name.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024, cargo). This chapter needs no root access beyond ordinary package installation and no real network I/O beyond a `cargo build`'s own dependency fetches; "the workspace," "the feature," "the lint," and "the profile" are all real Cargo projects built and measured directly, continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly rather than a simulation taken on faith.

## A.4 Terms and notation (continuing Chapters 1–31's vocabulary)

Everything in Chapters 1–31 §A.4 still applies. This chapter adds:

- **Workspace**: a real set of crates built and versioned together under one top-level `Cargo.toml`, sharing one `Cargo.lock` and one `target/` directory.
- **Workspace inheritance**: a real mechanism (`[workspace.dependencies]`, `[workspace.lints]`) letting every member crate state `dependency.workspace = true` instead of repeating a version or a lint policy in each crate's own `Cargo.toml`.
- **Feature unification**: Cargo's own real rule that, within one build, every dependent's requested features for a shared dependency are merged into one build of that dependency with all of them enabled, which is exactly why a feature must be additive to stay safe.
- **The `[lints]` table**: the real, stable (Cargo 1.97) mechanism for declaring a lint's own level (`warn`, `deny`, `forbid`) directly in `Cargo.toml`, enforced the same way for every contributor and every CI run.
- **Release profile**: the real, named set of compiler dials (`opt-level`, `lto`, `codegen-units`, `panic`, `strip`) Cargo applies to a `--release` build, each with a real, measurable effect on build time, binary size, or runtime speed.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "the crate, not the module, is the real unit of a rebuild" for incremental compilation; "stated once, shared by every crate in the workspace" for inherited dependencies and lints; "every dependent's own request, merged into one shared build" for feature unification; "a rule written down once, enforced the same way every time" for the lints table and CI; "a real trade a project is making on purpose" for a release profile's own dials.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A crate-box glyph**: a real, simple labeled rectangle for one crate, with a real arrow between boxes for a real dependency edge, for showing workspace boundaries and what a change does or does not force to rebuild.
- **A dial glyph**: a real, simple slider or knob shape marking one named release-profile setting directly, for showing a build-time/output trade-off.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–31 §A.6, with this chapter's own explicit addition: every topic's own `examples.py` drives a real `cargo build`/`cargo clippy`/`cargo fmt` invocation against a real workspace under `examples/`, timing it with real wall-clock measurements (`time.perf_counter()`) rather than asserting a specific number, since build timing is this sandboxed container's own, and every topic states that plainly rather than presenting a container-specific number as a general claim. Where a named tool this chapter's own syllabus mentions (`cargo hack`, `cargo nextest`, `cargo-semver-checks`, `sccache`) is not installed in this sandboxed container, the topic checks for it with `shutil.which` exactly as this domain's own established pattern does for `rustc`/`cargo`/`maturin`, and if missing, states its real role in `post-notes.md` rather than faking a result, continuing this domain's own rule of never faking a measurement it cannot actually run. Registry fields use `milestone: { number: 6, title: 'Performance, Unsafe Code, FFI, Build, and Observability' }` and `chapter: { number: 32, title: 'Cargo Workspaces, Features, Lints, Tests, and Release Engineering', section: '32.1' }` (this chapter's own four full topics are all in section 32.1).

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–31's own declared list. Topic 82's own first topic in this chapter reuses no earlier chapter's own introduced id directly in its own measured code, since this chapter changes subject from a single crate's own external boundary to the structure of a project with more than one crate; its own bridge instead names this chapter's own opening question in prose. Topics 83–85 each reuse the immediately preceding topic's own introduced id directly, continuing the identical within-chapter pattern Chapters 30 and 31 established.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `a-crate-is-the-real-unit-of-a-rebuild` | 82 | A real, small multi-crate workspace with workspace-inherited dependencies and lints genuinely changes what an incremental rebuild has to redo, confirming that Cargo rebuilds along crate boundaries, not module boundaries. |
| `a-feature-must-stay-additive-under-unification` | 83 | A real Cargo feature, built under real feature unification across two dependents with different requested feature sets, genuinely stays correct only because it only adds behavior, never changes existing behavior. |
| `a-lint-written-once-is-enforced-every-time` | 84 | A real `[lints]` table entry and a real local CI-style check genuinely catch a real, deliberately introduced violation before it would ship, the same way for every contributor. |
| `a-release-profiles-dials-are-a-real-measured-trade` | 85 | Two real, different `[profile.release]` configurations genuinely produce a real, measurable difference in build time on this exact toolchain, confirming the dials name a real trade rather than a free win. |

## A.8 Bridges and handoffs

- **82** bridges from Chapter 31's own real handoff (this chapter's own first sentence names it directly: a correct boundary and a working extension both still live inside one crate, and the next chapter turns to the question of where a crate's own boundary should actually sit once a real project has more than one of them) and needs no earlier chapter's own introduced concept directly, since it changes subject to the structure of a multi-crate project. Hands off within the chapter to topic 83: "A workspace decides which crates exist and what each one depends on; it says nothing yet about what happens when two of those crates want slightly different behavior from the one dependency they share."
- **83** bridges from topic 82's own measured workspace directly and hands off within the chapter to topic 84: "A feature that stays additive under real unification is a real, local correctness property; it says nothing yet about whether anyone but its own author ever actually checks that property before it ships."
- **84** bridges from topic 83's own measured feature-unification model directly and hands off within the chapter to topic 85: "A lint and a test enforced the same way every time catches a real regression in the code; it says nothing yet about the real, separate cost a release build itself imposes once that correct code actually has to ship."
- **85** bridges from topic 84's own measured CI baseline directly and hands off to the next chapter: "A workspace, a feature, a lint policy, and a release profile are all real, project-shaping decisions made once and paid for on every later build; the next chapter turns to a system that is actually running, where the cost of a wrong decision shows up only once real traffic is already flowing through it."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The Cargo Book's own chapters on workspaces (`doc.rust-lang.org/cargo/reference/workspaces.html`) and workspace inheritance, for topic 82's own concrete reference.
- The Cargo Book's own chapter on features (`doc.rust-lang.org/cargo/reference/features.html`), for topic 83's own concrete reference on feature unification and additivity.
- The Cargo Book's own chapter on the `[lints]` table (`doc.rust-lang.org/cargo/reference/manifest.html#the-lints-section` or its own dedicated page), for topic 84's own concrete reference.
- The Cargo Book's own chapter on profiles (`doc.rust-lang.org/cargo/reference/profiles.html`), for topic 85's own concrete reference on `opt-level`, LTO, and `codegen-units`.
