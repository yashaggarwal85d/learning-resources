# Chapter 26 — Raft: Leader Election, Log Replication, and Commitment (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 5, *Distributed Systems and Streaming* (its second chapter). Chapter 26 has two sections: 26.1 *Core protocol*, with two full topics, and 26.2 *Production concerns*, with two topics that stay in the curriculum for reference but get no reel (`syllabus/review-notes/rust-cuts.md`, owner decision of 13 October 2026): "Linearizable reads: ReadIndex and leases" and "Membership changes and log compaction". The chapter's own two lab exercises (a deterministic-then-randomized 3-node Raft-like log checked against a linearizable register spec; serving stale reads from a deposed leader and fixing them with ReadIndex) are not reels either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 25, *Replication, Quorums, and Failure Semantics* (two topics live: acknowledgement points define durability, and failure injection and linearizability checking), which closed by naming this chapter's own first question directly: how a cluster of nodes, with no leader assumed in advance, actually agrees on which one gets to make the acknowledgement promise at all, and proves it stays correct.

This file is the contract the chapter's two topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 25 measured what a single acknowledgement point is allowed to promise, and how to check a whole recorded history against that promise under injected failure, but it assumed a leader already existed. This chapter opens the real question underneath that assumption: with no leader assumed in advance, and any node able to fail or be partitioned at any time, how does a cluster of nodes agree on exactly one of them being the leader at any given term, and how does that leader then make an entry's commitment genuinely safe against every node restarting, being replaced, or seeing a stale view of the log? Raft answers this with a small number of precise rules — terms that only ever increase, randomized election timeouts that make a single leader likely without any clock synchronization, a voting rule that forces a candidate to prove its own log is at least as up to date as a majority's before it may win, and a commitment rule that only counts an entry as committed once it is replicated to a majority under the leader's own current term (the paper's own Figure 8 hazard being exactly the case this rule exists to rule out). This chapter builds a real, minimal implementation of exactly these rules and measures, directly, that each one does what the paper claims: that terms and randomized timeouts genuinely converge on one leader without a human picking one, that an out-of-date candidate's own vote request is genuinely rejected, and that an entry is genuinely committed only once a real majority holds it under the real current term, with a real divergent follower suffix genuinely overwritten by the leader's own conflict-repair rule rather than silently corrupted.

By the end of this chapter's two topics, the learner can: build a real toy Raft-like cluster that holds a leader election under randomized timeouts and measure that terms and the log-up-to-date voting rule genuinely produce a correct result; and build a real log-replication and commitment path on top of that same cluster and measure that an entry commits only under the paper's own majority-under-current-term rule, with a genuinely corrupting conflict case caught and repaired rather than silently accepted.

## A.2 The order of ideas, and why

1. **Leader election, terms, and PreVote** (topic 68, this chapter's first topic) — builds the foundation every later topic in this chapter measures against: a real toy cluster of nodes, each a follower, candidate, or leader, holding a real election under terms and randomized timeouts. Measures that an out-of-date candidate's own vote request is genuinely rejected by the up-to-date-log voting rule, and that PreVote genuinely stops a partitioned node's own stale term from disrupting a healthy cluster's current leader.
2. **Log replication and commitment rules** (topic 69) — builds directly on topic 68's own elected leader: replicates real log entries via a real `AppendEntries`-shaped call, and measures that an entry commits only once a real majority holds it under the leader's own current term, with a genuinely divergent follower log repaired by the leader backing up to a common prefix rather than corrupted.

*(The chapter's two labs — a deterministic-then-randomized 3-node Raft-like log checked against a linearizable register spec; then serving a stale read from a deposed leader and fixing it with ReadIndex — are not reels; they stay in the syllabus as lab exercises, exercising both of this chapter's topics together (the second lab also reaching into 26.2's own skipped material), rather than introducing a new tested claim of their own. "Linearizable reads: ReadIndex and leases" and "Membership changes and log compaction," both marked `*(skipped)*` in the syllabus per the 13 October 2026 owner decision, are not reels either; their own further material is named in prose in topic 69's own post-notes rather than measured.)*

## A.3 The running example: one real toy Raft-like cluster, built and measured

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–25's conventions.

- **Topic 68** builds a real toy cluster of nodes, each genuinely tracking its own role (follower, candidate, leader), current term, and voted-for state, with a real randomized election-timeout mechanism and a real vote-request/vote-grant exchange enforcing the paper's own log-up-to-date voting rule. Measures, under a real injected scenario (an out-of-date candidate, and a partitioned node rejoining with a stale term), whether the real election outcome matches what the paper's own rules require.
- **Topic 69** builds directly on topic 68's own elected leader: replicates real log entries to the cluster via a real, explicit function carrying the same fields as the paper's own `AppendEntries` (term, previous log index and term, entries, leader commit index), and measures, under a real injected log-divergence scenario, whether an entry's own commitment and a follower's own conflicting suffix are handled exactly as the paper's own commitment and conflict-repair rules require.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). This chapter needs no root access, no real network I/O, and no real multiple machines; "nodes," "elections," "terms," and "partitions" are all real, deterministic, in-memory Rust values and functions, continuing this milestone's own pattern of measuring a real, small, fully-controlled model directly rather than a simulation taken on faith.

## A.4 Terms and notation (continuing Chapters 1–25's vocabulary)

Everything in Chapters 1–25 §A.4 still applies. This chapter adds:

- **Term**: a monotonically increasing counter that every node agrees defines at most one leader at any given value; a node that sees a higher term immediately treats its own as stale.
- **Randomized election timeout**: a randomly chosen duration a follower waits without hearing from a leader before becoming a candidate, chosen specifically so that, across a real cluster, one candidate is likely to time out first and win before a second one starts.
- **Log-up-to-date voting rule**: a candidate may only win a voter's vote if the candidate's own log is at least as up to date as the voter's own log, comparing the last entry's term first and index second; this is the real rule that stops an out-of-date candidate from ever becoming leader.
- **PreVote**: an extra round before a real election, in which a node confirms it could actually win a real majority's votes before incrementing its own term, specifically to stop a partitioned node's own stale, ever-incrementing term from disrupting a healthy cluster's current leader when it reconnects.
- **AppendEntries and the commitment rule**: the leader's own real replication call, carrying its current term, the previous log index and term it expects a follower to already hold, the new entries, and its own current commit index; an entry is only ever considered committed once it is stored on a real majority of nodes under the leader's own current term (the paper's own Figure 8 hazard is exactly the case of committing too early, under an old term, that this rule exists to prevent).
- **Conflict repair**: when a follower's own log diverges from the leader's, the leader backs up to the last index both genuinely agree on and overwrites the follower's own divergent suffix from there, rather than ever silently corrupting an index.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "a count every node agrees defines at most one leader" for a term; "a random wait before trying to become leader" for a randomized election timeout; "a candidate must prove its own log is at least as current" for the log-up-to-date voting rule; "checking it could really win before it tries" for PreVote; "the leader's own real call that replicates entries and says what's committed" for AppendEntries; "only counted as committed once a real majority holds it under the current count" for the commitment rule; "backing up to the last point both sides agree on" for conflict repair.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A role glyph**: a small set of labeled nodes, each marked follower, candidate, or leader, for showing a real election's own state directly.
- **A log-strip glyph**: a short horizontal strip of log entries, each with its own term, for showing real replication and a real divergent suffix directly.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–25 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 5, title: 'Distributed Systems and Streaming' }` and `chapter: { number: 26, title: 'Raft: Leader Election, Log Replication, and Commitment', section: '26.1' }`. A cargo crate under `examples/` is used; no root access, real network I/O, or real multiple machines are needed, since "nodes," "elections," and "terms" are real, deterministic, in-memory Rust values and functions rather than an actual distributed deployment, continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–25's own declared list. Chapter 25's own *introduced* ids this chapter draws on directly: `linearizability-checking-over-injected-failure` (25's own second topic), since this chapter's own labs and topic 69's own measured history continue checking a real recorded history for correctness, the identical real technique Chapter 25 built.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `leader-election-log-up-to-date-voting` | 68 | A real election among a cluster of nodes, under terms and randomized timeouts, genuinely elects a correct leader only when the log-up-to-date voting rule is enforced; an out-of-date candidate's own vote request is genuinely rejected, and PreVote genuinely stops a partitioned node's own stale term from disrupting a healthy cluster. |
| `commitment-requires-majority-under-current-term` | 69 | An entry is only genuinely committed once it is replicated to a real majority of nodes under the leader's own current term; committing under an earlier term, or repairing a follower's divergent suffix incorrectly, can genuinely corrupt the log, which this chapter's own conflict-repair rule exists to prevent. |

## A.8 Bridges and handoffs

- **68** bridges from Chapter 25's own real handoff (this chapter's own first sentence names it directly: how a cluster of nodes, with no leader assumed in advance, actually agrees on which one gets to make the acknowledgement promise at all) and uses `linearizability-checking-over-injected-failure` only where its own lab continues checking a recorded history, not in the topic's own core measured claim. Hands off within the chapter to topic 69: "Holding a correct election decides who gets to lead; it says nothing yet about whether the entries that leader then replicates are ever safely committed, or whether a follower's own divergent log is ever safely repaired rather than silently corrupted."
- **69** bridges from topic 68's own elected leader directly and hands off to the next chapter: "This chapter measured how a cluster agrees on a leader and safely commits what that leader replicates; the next chapter turns to what a log built on exactly this kind of replicated, ordered structure looks like once it is a real product-facing abstraction, with its own partitions, delivery guarantees, and retention rules."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The Raft paper itself (Ongaro & Ousterhout, "In Search of an Understandable Consensus Algorithm") or its own extended technical report, for both topics' own concrete reference on terms, elections, the voting rule, AppendEntries, and the commitment rule, if fetchable; the Raft website's own documentation summary (raft.github.io) is an acceptable concrete substitute where the paper itself is not fetchable.
- Documentation from a real, widely used Rust Raft implementation (`raft-rs` from TiKV, or `openraft`) on PreVote, CheckQuorum, or the conflict-repair rule, for a concrete production reference, if fetchable.
