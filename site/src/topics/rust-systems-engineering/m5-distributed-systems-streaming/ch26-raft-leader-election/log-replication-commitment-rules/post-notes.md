---
title: "Log replication and commitment rules"
---

## Outcomes

- Build a real, AppendEntries-shaped replication call directly on top of the previous topic's own elected leader.
- Measure that conflict repair genuinely finds the real common prefix between a leader and a genuinely divergent follower, and overwrites the follower's own divergent suffix exactly, with no index silently corrupted.
- Measure that an entry from a previous term, even once replicated to a real majority, is genuinely not committed by counting replicas alone, exactly the paper's own Figure 8 hazard.
- Measure that once the leader also replicates a real entry from its own current term to the identical majority, that entry genuinely commits, and the earlier entry commits indirectly along with it.
- State, from the Raft paper itself and from a real, widely used Rust Raft implementation's own documentation, the real rules this topic's own code measures directly.

## Internals

The conflict-repair loop here optimistically assumes a follower is fully caught up, sends the consistency check, and on a real rejection backs the assumed common point up by exactly one entry before retrying, continuing until the real common prefix is found; this is a direct, measured implementation of the paper's own described mechanism, not a shortcut. The commitment function walks the log backward from the end and returns on the first current-term entry whose own replica count already meets a real majority, which is the real, direct way "everything before a committed current-term entry commits indirectly" is actually computed, rather than a separate claim asserted on faith.

## In production

The Raft paper itself states both rules directly: a log entry is committed once the leader that created it has replicated it on a majority of the servers, but Raft never commits log entries from previous terms by counting replicas; only entries from the leader's own current term are committed that way. On conflict, the leader forces a follower's log to duplicate its own, finding the latest point of agreement and overwriting everything after it. A real, widely used Rust Raft implementation, openraft, keeps the consensus log and the application's own state machine fully pluggable and separate, through its own storage and state-machine traits, which is exactly what lets consensus itself be tested against a trivial state machine first, as real production systems do.

## The frontier

The paper's own full proof sketch for why the current-term-only commitment rule is actually safe (section 5.4's Leader Completeness Property) is named in prose here rather than reproduced, since this topic measures the simpler, directly checkable version of the same rule the full proof establishes in general. Real production systems also add optimizations this topic does not measure, such as a follower reporting the term of its own conflicting entry so the leader can skip an entire term's worth of rejected AppendEntries calls in one step, rather than backing up one entry at a time. All of this topic's own measured claims run entirely on plain in-memory Rust vectors and structs, with no file, network, or root access needed.

## Where this goes next

This chapter measured how a cluster agrees on a leader and safely commits what that leader replicates; the next chapter turns to what a log built on exactly this kind of replicated, ordered structure looks like once it is a real product-facing abstraction, with its own partitions, delivery guarantees, and retention rules.
