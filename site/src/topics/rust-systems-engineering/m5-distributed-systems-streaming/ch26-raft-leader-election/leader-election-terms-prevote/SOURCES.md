# Sources — Leader election, terms, and PreVote

## Raft Paper: "In Search of an Understandable Consensus Algorithm" (Ongaro & Ousterhout)
URL: https://raft.github.io/raft.pdf
Fetched: 2026-10-24, cached at `sources/raft-paper.txt`.
> Raft uses randomized election timeouts to ensure that split votes are rare and that they are resolved quickly

> This spreads out the servers so that in most cases only a single server will time out; it wins the election and sends heartbeats before any other servers time out

> If the candidate's log is at least as up-to-date as any other log in that majority

> the voter denies its vote if its own log is more up-to-date than that of the candidate

> If the logs have last entries with different terms, then the log with the later term is more up-to-date. If the logs end with the same term, then whichever log is longer is more up-to-date.

> If RPC request or response contains term T > currentTerm: set currentTerm = T, convert to follower

## etcd-io/raft (doc.go)
URL: https://raw.githubusercontent.com/etcd-io/raft/main/doc.go
Fetched: 2026-10-24, cached at `sources/etcd-raft-doc.txt`.
> a pre-election is carried out first (using the same rules as a regular election), and no node increases its term number unless the pre-election indicates that the campaigning node would win

> This minimizes disruption when a partitioned node rejoins the cluster.
