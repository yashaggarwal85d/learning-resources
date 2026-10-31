## Ongaro and Ousterhout: In Search of an Understandable Consensus Algorithm (Extended Version)

URL: https://raft.github.io/raft.pdf
Version: extended version, fetched 2026-10-30

> act as a logical clock [14] in Raft, and they allow servers
to detect obsolete information such as stale leaders.

> If a candidate or leader discovers
that its term is out of date, it immediately reverts to follower state. If a server receives a request with a stale term
number, it rejects the request.

> Election Safety: at most one leader can be elected in a
given term.

> Leader Append-Only: a leader never overwrites or deletes
entries in its log; it only appends new entries.

> Log Matching: if two logs contain an entry with the same
index and term, then the logs are identical in all entries
up through the given index.

> Leader Completeness: if a log entry is committed in a
given term, then that entry will be present in the logs
of the leaders for all higher-numbered terms.

> State Machine Safety: if a server has applied a log entry
at a given index to its state machine, no other server
will ever apply a different log entry for the same index.

> If the
candidate’s log is at least as up-to-date as any other log
in that majority (where “up-to-date” is defined precisely
below), then it will hold all the committed entries.

> Raft determines which of two logs is more up-to-date
by comparing the index and term of the last entries in the
logs. If the logs have last entries with different terms, then
the log with the later term is more up-to-date. If the logs
end with the same term, then whichever log is longer is
more up-to-date.

> If the follower does not find an entry in
its log with the same index and term, then it refuses the
new entries.

> To eliminate problems like the one in Figure 8, Raft
never commits log entries from previous terms by counting replicas. Only log entries from the leader’s current
term are committed by counting replicas; once an entry
from the current term has been committed in this way,
then all prior entries are committed indirectly because
of the Log Matching Property.

> Figure 8: A time sequence showing why a leader cannot determine commitment using log entries from older terms. In
(a) S1 is leader and partially replicates the log entry at index
2. In (b) S1 crashes; S5 is elected leader for term 3 with votes
from S3, S4, and itself, and accepts a different entry at log
index 2. In (c) S5 crashes; S1 restarts, is elected leader, and
continues replication. At this point, the log entry from term 2
has been replicated on a majority of the servers, but it is not
committed. If S1 crashes as in (d), S5 could be elected leader
(with votes from S2, S3, and S4) and overwrite the entry with
its own entry from term 3. However, if S1 replicates an entry from its current term on a majority of the servers before
crashing, as in (e), then this entry is committed (S5 cannot
win an election).

> In Raft the cluster
first switches to a transitional configuration we call joint
consensus; once the joint consensus has been committed,
the system then transitions to the new configuration.

> the cluster membership, which uses overlapping majorities to guarantee safety.

> It is simpler and more understandable than other algorithms

> It produces a result equivalent to (multi-)Paxos, and
it is as efficient as Paxos, but its structure is different
from Paxos; this makes Raft more understandable than
Paxos

## Ongaro: Consensus: Bridging Theory and Practice (PhD thesis, named only)

URL: https://web.stanford.edu/~ouster/cgi-bin/papers/OngaroPhD.pdf
Version: fetched 2026-10-30 (the single-server membership-change variant is named here, not quoted, per CHAPTER.md's Leaves out)

Fetched to confirm reachability and that the thesis does cover single-server membership changes as the later, simpler alternative to joint consensus; not quoted directly, consistent with CHAPTER.md naming this topic as a pointer owned by the Rust track's skipped topic.

## Lamport: Paxos Made Simple (named only)

URL: https://lamport.azurewebsites.net/pubs/paxos-simple.pdf
Version: fetched 2026-10-30

Named only, per CHAPTER.md's Leaves out (the Paxos, Multi-Paxos and quorum-intersection theory are skipped syllabus topics, pointed to here with their source, not taught).

## de.linearizability (internal cross-reference)

URL: internal-not-fetched-de.linearizability
Version: this topic's own commit history

No quotes; the stale-leader-read hazard this topic's hook dramatizes is topic 5's, referenced here, not re-quoted.

## de.cap-stated-precisely-pacelc (internal cross-reference)

URL: internal-not-fetched-de.cap-stated-precisely-pacelc
Version: this topic's own commit history

No quotes; this topic answers topic 8's handoff (the strongest model CAP permits needs a mechanism), referenced here, not re-quoted.
