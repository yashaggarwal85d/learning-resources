# Outline: Log replication and commitment rules (`rust.log-replication-commitment-rules`)

Chapter 26, topic 69 (second and last of this chapter). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build directly on topic 68's own elected leader: a real, AppendEntries-shaped replication call (term, previous log index and term, entries, leader commit).
2. Measure that conflict repair genuinely finds the real common prefix between a leader and a genuinely divergent follower, and overwrites the follower's own divergent suffix exactly, with no index silently corrupted.
3. Measure that an entry from a previous term, even once replicated to a real majority, is genuinely not committed by counting replicas alone, exactly the paper's own Figure 8 hazard.
4. Measure that once the leader also replicates a real entry from its own current term to the identical majority, that entry genuinely commits, and the earlier entry commits indirectly along with it.
5. State, from the Raft paper itself and from a real, widely used Rust Raft implementation's own documentation, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real toy log-replication simulation; nothing here needs root access, real network I/O, or real multiple machines.

## Reel steps (storyboard)

1. **"A follower's own log genuinely diverges from the leader's at one point. The leader retries AppendEntries, backing up one entry at a time. Does it genuinely find the real common prefix, and overwrite only the divergent suffix?"** (predict, hook) — `fig`: a leader log, a divergent follower log. Options: yes, genuinely / no, a human has to point out where they diverge / only if the divergent entry is the very last one.
2. **"Measured: the real conflict-repair pass genuinely finds the common prefix and overwrites the follower's divergent suffix exactly"** — `fig`: the real, measured repair. NO takeaway (phone swipe test "from" step; the point is stated in the body instead).
3. **"Now a single entry from a previous term already sits on a real majority of the cluster. Does the leader genuinely count it as committed, just from that real majority alone?"** (predict) — `fig`: a previous-term entry, a majority. Options: yes, a real majority is a real majority / no, the leader genuinely refuses to count it alone (correct) / only if it's been there for more than one term.
4. **"Measured: genuinely not committed. A previous-term entry's own real majority alone is genuinely not enough"** — `fig`: the real, measured refusal. Takeaway about the Figure 8 hazard this rule exists to prevent.
5. **"Now the leader also replicates one real entry from its own current term to the identical majority. Does that entry genuinely commit, and does the earlier entry genuinely commit along with it?"** (predict) — `fig`: a current-term entry, the same majority. Options: only the new entry commits / both commit, genuinely, together (correct) / neither commits without a human's sign-off.
6. **"Measured: the current-term entry genuinely commits, and the earlier entry genuinely commits indirectly right along with it"** — `fig`: the real, measured commitment. Takeaway about one current-term entry's own real commitment reaching backward.
7. **"The Raft paper itself states this exact rule directly, in its own words: only entries from the leader's own current term are ever committed by counting replicas. Does this topic's own code measure exactly that rule?"** — `fig`: the paper's own words, shown directly. NO new predict (continues directly from the measured work). NO takeaway (a connecting step naming the exact rule this topic's own code measures).
8. **"A real, widely used Rust Raft implementation keeps the consensus log genuinely separate from the application's own state machine, through its own pluggable storage traits. Does separating them this way let consensus be tested against a trivial state machine first, exactly as the syllabus names?"** — `fig`: the implementation's own words, shown directly. NO predict, NO takeaway (a second connecting step, naming a real production design choice this topic's own code mirrors by keeping its own log and commit index separate from any particular use of the committed values).
9. **"Measured: conflict repair, the previous-term refusal, and the current-term commitment are all genuinely one coherent set of rules, run on one real log and one real follower"** — `fig`: all three real, measured results, side by side. Takeaway tying the whole chapter's own election and commitment rules together.
10. **Recap** — an entry is only genuinely committed once it is replicated to a real majority under the leader's own current term; conflict repair genuinely backs a divergent follower up to the real common prefix, never silently corrupting an index.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: within the first eight overall, counting this chapter's own earlier topic; this topic's own third and last predict is step 5, with steps 7–8 deliberately connecting rather than re-predicting, per `QUALITY.md`'s own guidance that a reel need not force a predict onto every remaining step.
- Surprising fact: step 4 (a real majority alone, for a previous-term entry, is still genuinely not enough) and step 8 (a real, widely used implementation's own pluggable design mirrors this topic's own separation of concerns directly).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, the reel's own "from" step for the phone swipe test; steps 7 and 8 deliberately have none too, both connecting steps).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| a log entry is committed once the leader that created the entry has replicated it on a majority of the servers | Raft Paper (quoted) |
| Raft never commits log entries from previous terms by counting replicas; only log entries from the leader's current term are committed by counting replicas | Raft Paper (quoted) |
| the leader handles inconsistencies by forcing the followers' logs to duplicate its own; conflicting entries in follower logs will be overwritten with entries from the leader's log | Raft Paper (quoted) |
| to bring a follower's log into consistency, the leader finds the latest log entry where the two logs agree, deletes any entries after that point, and sends the follower all of the leader's entries after that point | Raft Paper (quoted) |
| a leader never overwrites or deletes entries in its own log | Raft Paper (quoted) |
| a real Rust Raft implementation is fully pluggable across log storage and the state machine, separately | openraft README (quoted) |
| conflict repair genuinely finds the real common prefix between a divergent follower and the leader, and overwrites the follower's divergent suffix exactly, with no index silently corrupted | `examples/runtime-demo/src/log_replication_commitment_rules.rs` (executed, measured) |
| an entry from a previous term, even on a real majority, is genuinely not committed by counting replicas alone | `examples/runtime-demo/src/log_replication_commitment_rules.rs` (executed, measured) |
| once the leader also replicates a real entry from its own current term to the identical majority, that entry genuinely commits, and the earlier entry commits indirectly with it | `examples/runtime-demo/src/log_replication_commitment_rules.rs` (executed, measured) |

## Concept ledger

- `introduces`: `commitment-requires-majority-under-current-term` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `leader-election-log-up-to-date-voting` (topic 68's own concept, this topic builds directly on its elected leader)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Holding a correct election decides who gets to lead; it says nothing yet about whether the entries that leader then replicates are ever safely committed, or whether a follower's own divergent log is ever safely repaired rather than silently corrupted."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter measured how a cluster agrees on a leader and safely commits what that leader replicates; the next chapter turns to what a log built on exactly this kind of replicated, ordered structure looks like once it is a real product-facing abstraction, with its own partitions, delivery guarantees, and retention rules."
