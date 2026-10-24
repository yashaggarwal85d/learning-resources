# Outline: Leader election, terms, and PreVote (`rust.leader-election-terms-prevote`)

Chapter 26, topic 68 (first of two, opens this chapter). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real toy cluster of nodes, each tracking its own term, role, and log state, holding a real election under real, deterministic "randomized" timeouts.
2. Measure that a healthy election genuinely elects the node whose real timeout fired first, with a real majority of votes.
3. Measure that an out-of-date candidate's own vote request is genuinely rejected by the paper's own up-to-date-log voting rule, and genuinely loses the election.
4. Measure that a real PreVote round genuinely stops the exact disruption a partitioned node's own stale, locally incremented term would otherwise genuinely cause when it rejoins the cluster.
5. State, from the Raft paper itself and from a real, widely used Raft implementation's own documentation, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real toy election simulation and a real, deterministic PRNG for timeouts; nothing here needs root access, real network I/O, or real multiple machines.

## Reel steps (storyboard)

1. **"Five identical, healthy nodes each get a real, deterministic timeout. The one whose timeout fires first becomes a candidate and asks for votes. Does it genuinely win, and does the winner genuinely match the fastest timeout?"** (predict, hook) — `fig`: five nodes, timeouts, one candidate. Options: yes, genuinely / no, ties always need a human to break them / only if every node's log is already identical.
2. **"Measured: the real election genuinely elects the node whose real timeout fired first, with a real majority of votes"** — `fig`: the real, measured result. NO takeaway (phone swipe test "from" step; the point is stated in the body instead).
3. **"Now one candidate's own log is genuinely behind the rest of the cluster's. Does its vote request still win, or does the up-to-date-log voting rule genuinely reject it?"** (predict) — `fig`: a stale candidate, fresh voters. Options: it still wins, since its term is still fresh / the voting rule genuinely rejects it (correct) / only if its log is behind by more than one entry.
4. **"Measured: the out-of-date candidate's own vote request is genuinely rejected; it loses the election"** — `fig`: the real, measured rejection. Takeaway about a fresh term alone never being enough.
5. **"A healthy cluster has a live leader. One node gets partitioned and, missing every heartbeat, keeps incrementing its own term locally. When it rejoins and broadcasts that stale, inflated term, does the healthy leader genuinely step down?"** (predict) — `fig`: a partitioned node, an inflated term, rejoining. Options: no, the healthy leader ignores a term it's never heard of / yes, genuinely, every node updates to a higher term it sees (correct) / only if the partitioned node also has a longer log.
6. **"Measured: genuinely disruptive. Every node updates its own term the moment it sees a higher one, and the healthy leader genuinely steps down"** — `fig`: the real, measured disruption. Takeaway about a bare term increase alone being able to depose a working leader.
7. **"Now the identical partitioned node runs a real PreVote round first, before ever raising its own term. Does PreVote genuinely stop the identical disruption this time?"** (predict) — `fig`: the identical node, a pre-vote round first. Options: no, PreVote only delays the same disruption / yes, genuinely, its term never even rises (correct) / only if the partitioned node's log is also stale.
8. **"Measured: with PreVote, every healthy voter already has a live leader and genuinely denies the pre-vote; the partitioned node's own term never rises, and the healthy leader is never disturbed"** — `fig`: the real, measured non-disruption. Takeaway about PreVote protecting a leader before any real term is ever spent.
9. **"One real, widely used Raft implementation's own documentation states this exact purpose directly, in its own words. Does it name stopping a partitioned node from disrupting the cluster on rejoin?"** — `fig`: the implementation's own words, shown directly. NO new predict (continues directly from the measured work). NO takeaway (a connecting step naming the real documentation this topic's own code mirrors).
10. **Recap** — a real election under terms and randomized timeouts elects a correct leader only when the up-to-date-log voting rule is enforced; an out-of-date candidate's own vote request is genuinely rejected, and a real PreVote round genuinely stops a partitioned node's own stale term from ever disrupting a healthy cluster at all.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 6 (a bare term increase alone, with nothing else wrong, can depose a genuinely working leader) and step 9 (a real, widely used implementation's own documentation names this exact purpose directly).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Raft uses randomized election timeouts to ensure that split votes are rare and that they are resolved quickly | Raft Paper (quoted) |
| this spreads out the servers so that in most cases only a single server will time out; it wins the election and sends heartbeats before any other servers time out | Raft Paper (quoted) |
| if the candidate's log is at least as up-to-date as any other log in that majority, then it will hold all the committed entries | Raft Paper (quoted) |
| the voter denies its vote if its own log is more up-to-date than that of the candidate | Raft Paper (quoted) |
| if the logs have last entries with different terms, the log with the later term is more up-to-date; if the logs end with the same term, whichever log is longer is more up-to-date | Raft Paper (quoted) |
| if an RPC request or response contains term T greater than currentTerm, a node sets currentTerm to T and converts to follower | Raft Paper (quoted) |
| a pre-election is carried out first, using the same rules as a regular election, and no node increases its term number unless the pre-election indicates that the campaigning node would win | etcd-io/raft (quoted) |
| this minimizes disruption when a partitioned node rejoins the cluster | etcd-io/raft (quoted) |
| a real election among healthy, identical logs genuinely elects the node whose real, deterministic timeout fired first, with a real majority of votes | `examples/runtime-demo/src/leader_election_log_up_to_date_voting.rs` (executed, measured) |
| an out-of-date candidate's own vote request is genuinely rejected by the real up-to-date-log voting rule, and it genuinely loses the election | `examples/runtime-demo/src/leader_election_log_up_to_date_voting.rs` (executed, measured) |
| a real PreVote round genuinely stops the exact disruption that the identical partitioned node genuinely causes without it | `examples/runtime-demo/src/leader_election_log_up_to_date_voting.rs` (executed, measured) |

## Concept ledger

- `introduces`: `leader-election-log-up-to-date-voting` (per `CHAPTER.md` §A.7's concept table)
- `uses`: []
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "How a cluster of nodes, with no leader assumed in advance, actually agrees on which one gets to make the acknowledgement promise at all, and proves it stays correct."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Holding a correct election decides who gets to lead; it says nothing yet about whether the entries that leader then replicates are ever safely committed, or whether a follower's own divergent log is ever safely repaired rather than silently corrupted."
