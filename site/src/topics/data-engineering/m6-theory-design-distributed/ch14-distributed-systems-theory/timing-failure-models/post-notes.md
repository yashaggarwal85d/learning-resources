<section data-section="internals">

## Internals: the model as a contract

Dwork, Lynch and Stockmeyer's 1988 paper (quoted in `SOURCES.md`) doesn't just name three timing
models — it proves something sharper: requiring a consensus protocol to be correct in the GST
model (a Δ bound that holds only from some unknown Global Stabilization Time onward) is exactly
equivalent to splitting its correctness condition into two parts. **Safety** ("no two correct
processors should ever reach disagreement") must hold no matter how badly the network behaves,
even if the Δ bound never arrives at all. **Termination** ("each correct processor should
eventually make a decision") only has to hold once Δ actually starts holding. A protocol that
is safe always and live only after GST automatically satisfies the GST model, and the paper's
own argument for why is worth sitting with: a safety violation has to happen at some *finite*
point in time, and whatever run led to it could always be continued into one where Δ eventually
holds from then on — so if the protocol never violates safety in *that* continuation, it can't
have violated it in the original run either. This is the shape every later topic in this
chapter reuses: Raft (topic 9) is safe under arbitrary asynchrony and only *makes progress*
once the network stabilises.

The fault hierarchy has the same "contains" structure DLS states directly: Byzantine behavior
includes everything an omission fault can do (send nothing) plus active lying, and omission
includes everything crash-stop can do (go silent) plus partial silence. That containment is
why Byzantine tolerance costs strictly more replicas for the same resiliency: DLS gives
`2t+1` processors as enough to tolerate `t` crash-stop or omission faults, but `3t+1` for `t`
Byzantine faults with authenticated signatures (and Byzantine without any signature mechanism
needs a majority among the *honest* processors to exceed two-thirds, which the paper also
states). The extra replicas aren't paying for more failures — they're paying for the fact that
a lying processor can vote itself into looking like a majority unless there are enough honest
votes to out-number any set of liars small enough to be "faulty".

Crash-recovery, this topic's addition to DLS's own three classes, is where Chapter 1's `fsync`
and `fsync-failure` and Chapter 5's `wal-lsn-fsync` stop being storage trivia and become a
distributed-systems fault model: "the process restarts" is not one fact, it's a question of
*which writes were flushed before the crash*, and the lab's `crash_recovery_lost_disk` run is
built entirely out of that gap — a write applied to memory but not yet fsync'd when the crash
hits is gone on restart, even though the disk itself never failed.

The fair-loss-to-reliable construction (EPFL/Cachin–Guerraoui–Rodrigues, quoted in
`SOURCES.md`) is worth stating plainly because it is so often assumed away: FL1 only promises
that a message retried *infinitely often* is delivered *infinitely often* — it says nothing
about any single attempt, which can be lost, duplicated or reordered freely. A reliable link's
validity property (PL1: every message sent by a correct process is eventually delivered) is
built on top of FL1 by a sender that keeps retrying and a receiver that deduplicates by a
sequence number or request id. The protocol in this topic's lab skips exactly that layer: it
ships one replicate message, once, with no retry and no sequence check on the receiving end —
which is precisely why message loss and reordering both break it for free.

</section>

<section data-section="lab">

## Lab: searching for the shortest lost-write trace

The chapter hosts one lab per topic; this one is §14.1's: take a primary-backup register
through message loss, reordering and a crash-recovery with a lost disk in the simulator, and
record which invariant breaks first in each. `examples.py`'s three named runs do exactly that,
and `every_fault_breaks_the_invariant_exactly_once` asserts each one breaks the register's one
safety invariant ("every acknowledged write survives on at least one live, durable copy") at
the write number the narration states, no more and no less. A fourth run,
`a_clean_run_under_no_fault_never_violates_the_invariant`, is the control: the identical
protocol, nothing injected, never breaks the invariant — proof that the faults, not the
protocol's ordinary operation, are doing the breaking.

§14.9 of this chapter (verification: TLA+ and deterministic simulation testing) is entirely
*(skipped)* from the syllabus. Its own lab — write a TLA+ spec of a two-replica primary-backup
protocol, let the TLC model checker find the lost-write trace when the primary fails
mid-replication, fix it, and re-check — is not built here. What *is* built, as the honest
stand-in named in CHAPTER.md, is `shortest_lost_write_trace`: an exhaustive search over the six
orderings of three scheduling events (`deliver_1`, `deliver_2`, `crash_before_fsync`), checking
the same safety invariant after every step of every ordering, and returning the shortest
ordering that loses an acknowledged write. This is deterministic simulation testing in
miniature — a model checker proper (TLC, or the deterministic-simulation-testing tradition
FoundationDB and others popularized) explores a vastly larger state space the same way, by
exhaustive or randomized search over schedules rather than by proof.

</section>

<section data-section="production">

## Production: the incident this model explains

Rewrite the hook's incident in the model's own vocabulary. The team's tests ran the
primary-backup protocol under a model that was, without anyone deciding so explicitly,
crash-stop only (a crashed test machine was simply restarted fresh by the test harness, never
mid-write) and assumed a reliable, in-order link (the test network, inside one host or one
rack, essentially never drops, reorders or duplicates a loopback message). Production supplied
crash-recovery with a lost disk (a real machine's OS page cache, not yet flushed, discarded on
an unclean reboot) and, separately, duplicate or reordered delivery across a real network path
with retries at some layer the application didn't control. Neither fault is exotic — Chapter
5's own replication-acknowledgement topic already named "asynchronous replication: acknowledge
before the backup has it" as a real, common, and real-risk configuration, and this topic is the
reason it is risky stated precisely: that configuration's safety invariant has no defense
against exactly the omission and crash-recovery fault classes DLS already named in 1988.

</section>

<section data-section="frontier">

## Frontier: Byzantine's cost, and where it's actually paid

DLS's `2t+1` vs `3t+1` resiliency bounds are not a historical curiosity; they are the reason
Byzantine fault tolerant systems are a different (and more expensive) engineering tradition
than the crash-fault-tolerant one this course mostly lives in. Named, not built: BFT consensus
protocols (PBFT and its descendants) that explicitly budget for `3t+1` replicas and signed or
otherwise unforgeable messages; and public blockchains, whose entire reason for needing
proof-of-work, proof-of-stake or a similarly expensive Sybil defense — rather than ordinary
majority voting — is that an open, permissionless network cannot bound how many "processors"
an adversary controls, which breaks DLS's `N` and `t` bookkeeping at its foundation. This
course's later consensus topics (9–11) stay inside the crash/omission tolerant tradition
(Raft, the coordination services real data systems run on); Byzantine tolerance is named here
as the strongest point on the fault hierarchy and left there.

</section>

<section data-section="where-next">

## Where this goes next

A model says processes may be slow and messages may be late, but it gives them no shared clock
to measure *how* late. The next topic is what the clocks a machine actually has — quartz
oscillators, NTP, the wall clock versus the monotonic clock — really promise, and why "last
write wins by timestamp" quietly loses writes even when every clock involved reports itself as
synchronized.

</section>
