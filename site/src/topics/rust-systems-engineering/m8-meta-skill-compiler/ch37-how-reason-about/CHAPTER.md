# Chapter 37 — How to Reason About a New Systems Problem in Rust (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 8, *Meta-Skill, Compiler, Embedded, GPU, Security, and Testing* (its first chapter). Chapter 37 has one section: 37.1 *Method* (two full topics: the systems design worksheet, and choosing the abstraction level; no skipped topics). The chapter's own lab exercise (fill in the worksheet for Capstone D before writing code, then record which implicit decision caused the most rework) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter's own last topic: topic 91, *Failure budget and overload behaviour*, which closed Chapter 34 by naming the next real system this milestone would build, judged by surviving the process itself failing. Chapters 35 and 36 build exactly that (a durable key-value engine, a Raft-backed replicated state machine) but are entirely skipped in this curriculum (every one of their own topics is marked `*(skipped)*`), so this chapter bridges directly from Chapter 34's own last real lesson instead of from either capstone.

This file is the contract the chapter's two topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan."

## A.1 The problem it solves

Every earlier chapter in this domain taught one real mechanism at a time, each already decided for the learner (a bounded channel, a typed error, a span). A genuinely new systems problem comes with none of those decisions made, and the real risk is not using the wrong mechanism, it is leaving a real decision implicit until a real failure forces it into the open at the worst possible time. This chapter measures two real, specific costs of exactly that: a design that leaves its own backpressure point implicit defaults to an unbounded real queue, which genuinely grows without limit under real overload instead of shedding load the way Chapter 34's own explicit, bounded design did; and an optimization decision made without a real, recorded hypothesis, workload, metric, and result cannot actually tell a real improvement from real measurement noise, however confident it feels at the time.

By the end of this chapter's two topics, the learner can: run a real, concrete system through the worksheet's own nine items and measure a real, specific difference between the design that leaves one of them implicit and the one that states it; and apply the evidence-discipline method to one real, small optimization, recording its own hypothesis, workload, metric, and result, and measure whether the real outcome actually supports the real hypothesis or not.

## A.2 The order of ideas, and why

1. **The systems design worksheet** (topic 92, this chapter's first topic) — takes the identical real, layered service from Chapter 34 and builds a second, deliberately implicit version that never states its own backpressure point, measuring a real, concrete difference under real, identical overload: the explicit, Chapter 34 design sheds load and stays bounded; the implicit version's real queue grows without limit instead.
2. **Choosing the abstraction level** (topic 93) — applies the evidence-discipline method (hypothesis, workload, metric, change, result) to one real, small optimization decision on the identical service, measuring whether a real, recorded hypothesis about one specific change is actually borne out by the real, measured result, or not.

*(The chapter's own lab — filling in the worksheet for Capstone D before writing any code, then recording which implicit decision caused the most rework — is not a reel; it stays in the syllabus as a lab exercise, exercising this chapter's own two full topics together rather than introducing a new tested claim of its own.)*

## A.3 The running example: the worksheet and the discipline, both applied to one real service

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–34's conventions, with one explicit, chapter-wide change: both topics in this chapter measure a real, deliberate comparison between two versions of a real, small async service, rather than one mechanism built once. Topic 92 builds the comparison; topic 93 reuses it for the evidence-discipline exercise. Each topic's own `examples/` folder holds its own independent copy at the point that topic needs it, continuing this domain's own self-contained-topic rule.

- **Topic 92** builds two real, independent instances of the identical real service shape Chapter 34 established (a real Axum edge over a real `tokio::sync::mpsc` queue and worker pool): one genuinely bounded (the explicit, Chapter 34 design, with a real, stated backpressure point), and one genuinely unbounded (the implicit version, which never states a backpressure point at all and so defaults to an unbounded real channel). Both are driven by the identical real burst of concurrent requests; it measures that the bounded version's own real queue length stays capped and sheds load, while the unbounded version's own real queue length keeps growing with every request the burst sends, never shedding at all.
- **Topic 93** reuses the identical real, bounded service and records a real, explicit hypothesis about one specific, real change to it (that replying to a client only after a real, simulated storage write completes, rather than immediately on being queued, changes the real, measured latency the client observes), states the real workload and metric it will check that hypothesis against, makes the real change, and measures whether the real, observed result actually matches the real, stated hypothesis.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024, cargo, tokio, axum and reqwest available from crates.io). This chapter needs no root access beyond ordinary package installation and no real network I/O beyond a `cargo build`'s own dependency fetches and the real, local HTTP traffic each topic's own `examples.py` drives against its own server bound to `127.0.0.1` on an OS-assigned port, continuing Ch.18's and Ch.34's own established pattern. "The worksheet" and "the discipline" are each measured as a real, concrete difference in a real, running system's own behaviour, continuing this domain's own established pattern of measuring a real, small, fully-controlled system directly rather than a simulation taken on faith.

## A.4 Terms and notation (continuing Chapters 1–34's vocabulary)

Everything in Chapters 1–34 §A.4 still applies. This chapter adds:

- **Implicit decision**: a real, specific design question (here, the backpressure point) that was never explicitly answered, and so was answered anyway, by whatever a language or library's own default happens to do.
- **The worksheet**: the syllabus's own nine real questions (resources, owners, sharing rules, queues, persistence boundary, failure modes, consistency rule, backpressure point, observability signals) a design is not finished until each one has a real, explicit answer.
- **Evidence discipline**: recording a real hypothesis, workload, metric, change, and result for a real optimization, specifically so the real result can be checked against the real hypothesis rather than only against a feeling that it worked.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "a question nobody actually answered" for an implicit decision; "the one place load is allowed to be turned away" for the backpressure point; "writing down the guess before checking it" for evidence discipline.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A checklist glyph**: a real, simple vertical list of short items, each with a real, visible mark showing whether it was answered explicitly or left implicit.
- **A growing-versus-capped glyph**: two real, simple lines side by side, one capped at a real, visible ceiling, one genuinely climbing past it, used to show the bounded-versus-unbounded comparison directly.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–34 §A.6, with this chapter's own explicit addition: every topic's own `examples.py` drives a real `cargo build`/`cargo run` of a real, small Axum service under `examples/`, started against a real `TcpListener` bound to `127.0.0.1` on an OS-assigned port exactly as Ch.18's and Ch.34's own topics established, and driven by a real HTTP client (`reqwest`). Every measured claim comes from the real service's own printed, real counts, never from a terminal's own formatted log output or from a claim merely asserted in prose without a real, executed comparison behind it. Registry fields use `milestone: { number: 8, title: 'Meta-Skill, Compiler, Embedded, GPU, Security, and Testing' }` and `chapter: { number: 37, title: 'How to Reason About a New Systems Problem in Rust', section: '37.1' }` (this chapter's own two full topics are both in section 37.1).

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–34's own declared list. Topic 92's own first topic in this chapter reuses `a-rejected-request-never-reaches-the-layer-behind-it` (Ch.34) directly, building the identical bounded design as its own explicit half of a real comparison; its own bridge instead names Chapter 34's own real handoff in prose. Topic 93 reuses topic 92's own introduced id directly, continuing the identical within-chapter pattern Chapters 30–34 established.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `an-implicit-backpressure-point-is-still-a-real-decision` | 92 | Leaving a design's own backpressure point implicit does not avoid the decision; it genuinely defaults to an unbounded real queue, measurably different from a real, explicit, bounded one under the identical real overload. |
| `a-recorded-hypothesis-is-what-a-result-is-checked-against` | 93 | A real optimization's own result only means something once it is checked against a real, stated hypothesis recorded before the change; the identical real measurement, without that recorded hypothesis, is just a number with nothing to confirm or contradict. |

## A.8 Bridges and handoffs

- **92** bridges from Chapter 34's own real handoff (naming directly that a real service judged under real overload is this milestone's own subject, and that Chapters 35–36's own further capstones are skipped in this curriculum) and reuses Ch.34's own bounded design directly as one half of its own real comparison. Hands off within the chapter to topic 93: "An implicit decision answered by a real default is still a real decision, measured directly; the next real question is whether a decision that was made on purpose, an optimization, actually did what it was meant to."
- **93** bridges from topic 92's own measured comparison directly and hands off to whatever this milestone's own next chapter begins with: "A real method for finding an implicit decision, and a real method for checking an optimization's own result against what it was supposed to do, are both real, repeatable habits; the next real question this milestone asks is what the compiler itself is actually doing with the code those habits produce."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The `tokio::sync::mpsc` module's own documentation (`docs.rs/tokio`), for topic 92's own concrete reference on the real difference between its bounded and unbounded channel variants.
- Google's SRE workbook chapter on monitoring and the scientific method (`sre.google/workbook`), for topic 93's own concrete reference on recording a hypothesis before measuring a change.
