<section data-section="internals">

## Internals: the crash is a missing message, not a missing fact

`coordinator_crashes_after_prepare` in `examples.py` never deletes the coordinator's decision; it
only models every participant being unable to see it, because that is the entire blocking
argument — the fact exists, durably, on one disk nobody else can read. `lock_hold_time` is computed
as the gap between the decision being logged and whenever recovery happens to occur, which is why
the number has no upper bound in the model: nothing about 2PC itself limits it.

</section>

<section data-section="lab">

## Lab: replicating the decision shrinks the wait to zero in the model, not in general

`participants_resolve_without_blocking_after_coordinator_dies` reruns the identical crash with one
change: the decision was written through `ReplicatedDecisionLog` before the coordinator's process
died. Every participant's lock-hold time drops to zero ticks, because a surviving log replica
answers immediately. That zero is a property of this particular model's timing, not a promise that
replication makes resolution instantaneous in a real system with real message delay — the lab
isolates the one variable (whose disk holds the decision) and holds everything else fixed.

</section>

<section data-section="production">

## Production: two different numbers, easy to conflate

Spanner's design and CockroachDB's Parallel Commits both answer "how do you avoid blocking on the
coordinator," but they spend the fix on different things. Spanner's transaction manager "stores
its state in the underlying Paxos group," which is purely about surviving a crash: the decision
doesn't vanish when one machine does. CockroachDB's Parallel Commits is purely about latency: it
lets a transaction's participants "wait for only a single round-trip of distributed consensus"
instead of two in sequence, which "halve[s] the latency of distributed transactions." Nothing
stops a system from doing only one of these.

</section>

<section data-section="frontier">

## Frontier: a famous flaw, carefully stated, is smaller than its reputation

"2PC blocks" is usually said as if it were an absolute defect. The precise version is narrower:
2PC blocks a prepared participant exactly when the coordinator's decision is unreachable, which is
a property of where that one decision is stored, not of the vote-then-decide shape itself. Paxos
Commit does not change the shape of 2PC — prepare still happens, a decision is still logged — it
only changes where the decision lives. The blocking problem turns out to be a placement problem in
disguise.

</section>

<section data-section="where-next">

## Where this goes next

Two-phase commit, with consensus under it, delivers an atomic outcome across shards. It does not
stop a message from being delivered twice, or a producer from retrying, or a consumer from
crashing after it acted and before it recorded that it had. Pipelines live in exactly that world,
and the phrase they use for it, exactly-once, is the subject of the last topic of this chapter.

</section>
