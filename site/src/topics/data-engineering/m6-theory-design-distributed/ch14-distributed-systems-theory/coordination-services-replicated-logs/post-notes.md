<section data-section="internals">

## Internals: the hook's four combinations are two independent switches, not four special cases

`examples.py` models the hook's scenario with exactly two booleans: `unclean_election_enabled`
and which replica set `min.insync.replicas` requires. `the_hooks_four_combinations` runs all
four pairings through the identical `survives_leader_failure` function, and the result changes
only when `unclean_election_enabled` flips — `min.insync.replicas` at one versus two changes how
weak the starting acknowledgment was, but once the leader and its in-sync follower have both
failed, only the unclean-election setting decides whether the surviving replica is allowed to
become leader without the write. Treating this as "four scenarios to memorize" misses that it is
one decision, checked twice under two different starting conditions.

</section>

<section data-section="lab">

## Lab: compare-and-swap doesn't need a lock, because it doesn't need to wait

`iceberg_commit_as_compare_and_swap` makes the no-locking claim concrete: writer B's attempt
doesn't block waiting for writer A's commit to finish, and it doesn't fail permanently either —
it fails this one attempt, rebuilds against the now-current pointer, and retries. The catalog
never has to coordinate who goes first; it only has to refuse a swap whose base has gone stale,
which is a single comparison, not a protocol. This is the same optimistic-concurrency shape
Chapter 5's `occ-vs-pcc` topic names for row-level writes, here applied to one pointer covering
an entire table's state.

</section>

<section data-section="production">

## Production: three stores, three different answers to "how fresh is a read?"

ZooKeeper's A-linearizable writes let it serve ordinary reads from whichever replica a client is
connected to, which can lag; `sync` costs a round trip through the leader to close that gap. etcd
makes the identical trade explicit as a per-request choice: strictly serializable by default, or
an opt-in `serializable` read that may be stale but skips the live consensus round trip. Kafka's
two knobs, `acks` and `min.insync.replicas`, don't trade read freshness at all — they trade how
many replicas must hold a write before the producer is told it succeeded, which is a durability
question, not a read-staleness one. The three systems answer three different questions that are
easy to conflate because all three involve "how much do you trust what you just read or wrote."

</section>

<section data-section="frontier">

## Frontier: a cheaper quorum is not a free quorum

It's tempting to read the in-sync set's lower replica count as evidence that Kafka found a way
around the cost majority-vote quorums pay. It didn't: the design document's own comparison notes
that, to tolerate the same number of failures, both approaches end up waiting for the same number
of acknowledgments before committing — the saving is specifically in total replica count, not in
commit latency, and comes paired with a real cost majority vote doesn't have: a commit waits on
the slowest in-sync member, where majority vote only waits on the fastest majority. The in-sync
set is a genuinely different point in the trade-off space, not a dominant improvement on it.

</section>

<section data-section="where-next">

## Where this goes next

Everything in this topic made one group of replicas agree on one value, atomically. A transaction
that touches data on several such groups needs all of them to agree on the same outcome — commit
or abort — even if the one deciding crashes halfway through. That is atomic commitment, and its
textbook protocol has a famous flaw. Two-phase commit is the next topic.

</section>
