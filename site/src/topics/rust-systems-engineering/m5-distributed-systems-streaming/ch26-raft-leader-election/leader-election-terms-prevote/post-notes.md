---
title: "Leader election, terms, and PreVote"
---

## Outcomes

- Build a real toy cluster of nodes, each tracking its own term, role, and log state, holding a real election under real, deterministic "randomized" timeouts.
- Measure that a healthy election genuinely elects the node whose real timeout fired first, with a real majority of votes.
- Measure that an out-of-date candidate's own vote request is genuinely rejected by the real up-to-date-log voting rule, fresh term or not.
- Measure that a real PreVote round genuinely stops the exact disruption a partitioned node's own stale, locally incremented term would otherwise genuinely cause on rejoin.
- State, from the Raft paper itself and from a real, widely used implementation's own documentation, the real rules this topic's own code measures directly.

## Internals

The election simulated here uses a real, deterministic xorshift64 generator for each node's own timeout, so "randomized" is a real, reproducible number rather than hidden system randomness. The up-to-date-log check and the pre-vote leader-stickiness check are kept as two separate functions in the code, deliberately, because the Raft paper and a real implementation's own documentation name them as two separate rules solving two separate problems: one protects against an out-of-date candidate winning at all, the other protects an already-working leader from ever being disturbed by a bare, higher term.

## In production

The Raft paper itself states the up-to-date-log voting rule directly: a voter denies its vote if its own log is more up to date than the candidate's, comparing the last entry's term first and length second. A real, widely used implementation's own documentation states PreVote's exact purpose directly too: a pre-election using the same rules as a regular election, in which no node raises its own term unless the pre-election indicates it would actually win, specifically to minimize disruption when a partitioned node rejoins the cluster. Real production Raft implementations in Rust, such as `raft-rs` (TiKV) and `openraft`, build on exactly these two rules.

## The frontier

CheckQuorum, the companion mechanism this chapter's own terms name alongside PreVote, has a leader itself step down if it stops hearing from a quorum of followers, rather than waiting passively; it is named in prose here rather than separately measured, since this topic's own job is the foundational election and voting-rule question CheckQuorum is itself built on top of. The next topic in this chapter turns from winning an election to the log replication and commitment rules an elected leader must then follow. All of this topic's own measured claims run entirely on plain in-memory Rust structs and a real deterministic PRNG, with no file, network, or root access needed.

## Where this goes next

Holding a correct election decides who gets to lead; it says nothing yet about whether the entries that leader then replicates are ever safely committed, or whether a follower's own divergent log is ever safely repaired rather than silently corrupted.
