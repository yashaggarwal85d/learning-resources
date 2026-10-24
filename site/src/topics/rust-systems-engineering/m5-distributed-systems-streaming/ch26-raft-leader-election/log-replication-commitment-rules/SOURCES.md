# Sources — Log replication and commitment rules

## Raft Paper: "In Search of an Understandable Consensus Algorithm" (Ongaro & Ousterhout)
URL: https://raft.github.io/raft.pdf
Fetched: 2026-10-24, cached at `sources/raft-paper.txt`.
> A log entry is committed once the leader that created the entry has replicated it on a majority of the servers

> Raft never commits log entries from previous terms by counting replicas. Only log entries from the leader's current term are committed by counting replicas

> In Raft, the leader handles inconsistencies by forcing the followers' logs to duplicate its own. This means that conflicting entries in follower logs will be overwritten with entries from the leader's log.

> To bring a follower's log into consistency with its own, the leader must find the latest log entry where the two logs agree, delete any entries in the follower's log after that point, and send the follower all of the leader's entries after that point

> A leader never overwrites or deletes entries in its own log

## openraft (README.md)
URL: https://raw.githubusercontent.com/databendlabs/openraft/main/README.md
Fetched: 2026-10-24, cached at `sources/openraft-readme.txt`.
> Fully pluggable**: storage (`RaftLogStorage`, `RaftStateMachine`), networking (`RaftNetworkV2`, including application-defined snapshot transport), and every core type
