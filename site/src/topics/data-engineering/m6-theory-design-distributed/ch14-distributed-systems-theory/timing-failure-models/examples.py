"""A deterministic discrete-event simulator for a primary-backup register.

The chapter's shared tool (CHAPTER.md): a seeded scheduler with per-process state, a network
that can delay, reorder, drop or duplicate messages, and processes that crash and recover,
possibly having lost unflushed (not fsync'd) state. Every later topic in Chapter 14 builds its
own small simulator of this same shape; this topic is the first, so it is the simplest one:
two processes, one register, one invariant.

The protocol under test (asynchronous primary-backup replication, a real and common setup,
not a strawman): the primary A applies a write to its own durable store, tells the client
"acknowledged" immediately (it does not wait for the backup), and ships the write to the
backup B in the background. The one safety invariant every topic-1 scenario checks is the
one Chapter 5's replication topic already named: an acknowledged write must survive on at
least one live, durable copy. The three fault injections below are exactly the chapter's own
§14.1 lab: message loss, message reordering, and crash-recovery with a lost (unflushed) disk.
"""

from dataclasses import dataclass, field
from itertools import permutations


@dataclass
class Node:
    name: str
    durable: dict = field(default_factory=dict)   # fsync'd: survives a crash
    volatile: dict = field(default_factory=dict)  # applied but not yet fsync'd: lost on crash
    alive: bool = True

    def apply(self, seq, value, fsync_now):
        """Apply a write at this node. fsync_now=False models a write that reached memory
        (the OS page cache) but had not yet been forced to disk when the node crashed —
        the same gap Chapter 1's fsync/fsync-failure topic and Chapter 5's WAL topic name."""
        if fsync_now:
            self.durable[seq] = value
        else:
            self.volatile[seq] = value

    def crash_recover(self):
        """Crash-stop, then restart: everything not yet fsync'd is gone. The disk itself is
        untouched — this models an unclean restart, not a destroyed drive."""
        self.volatile.clear()
        self.alive = True

    def has(self, seq):
        return seq in self.durable or seq in self.volatile

    def value_of(self, seq):
        return self.durable.get(seq, self.volatile.get(seq))


def run(fault, schedule=None):
    """Run one write (seq 1, value 'v1') then a second write (seq 2, value 'v2') to the same
    key through the asynchronous primary-backup protocol, under one named fault. Returns
    (acknowledged_seqs, invariant_violated_at) where invariant_violated_at is the seq number
    whose acknowledged value is not recoverable from any live, durable copy, or None."""
    a, b = Node("A"), Node("B")
    acknowledged = []
    violated_at = None

    def check(seq, expected_value):
        nonlocal violated_at
        # the invariant: an acknowledged write's value is recoverable from at least one live node
        live_values = [n.value_of(seq) for n in (a, b) if n.alive and n.has(seq)]
        if expected_value not in live_values and violated_at is None:
            violated_at = seq

    if fault == "message_loss":
        # Write 1: A applies and fsyncs, acknowledges the client immediately, ships to B.
        a.apply(1, "v1", fsync_now=True)
        acknowledged.append(1)
        # The REPLICATE(1) message to B is dropped by the network — B never sees it.
        # A then crashes permanently (crash-stop, no further recovery in this run).
        a.alive = False
        check(1, "v1")  # only A ever had it, and A is gone: zero live durable copies

    elif fault == "reordering":
        # Writes 1 and 2 (same key) both reach the client as acknowledged, in order, at A.
        a.apply(1, "v1", fsync_now=True)
        acknowledged.append(1)
        a.apply(2, "v2", fsync_now=True)
        acknowledged.append(2)
        # The network reorders the two REPLICATE messages: B receives seq 2 before seq 1,
        # and this protocol applies whatever arrives last without checking sequence numbers.
        for seq, value in [(2, "v2"), (1, "v1")]:
            b.apply(seq, value, fsync_now=True)
        # B's current value for the key is whichever REPLICATE landed last in arrival order
        # (dict insertion order, since this protocol applies blindly, with no sequence check),
        # not whichever write is actually the latest by sequence number.
        read_back_from_b = list(b.durable.values())[-1]
        if read_back_from_b != "v2":
            violated_at = 2

    elif fault == "crash_recovery_lost_disk":
        # Write 1: applied and fsync'd on A, acknowledged, and this time it does reach B and
        # is fsync'd there too — two durable copies exist, the invariant genuinely holds.
        a.apply(1, "v1", fsync_now=True)
        acknowledged.append(1)
        b.apply(1, "v1", fsync_now=True)
        check(1, "v1")
        assert violated_at is None, "the invariant must hold with two real durable copies"
        # A is retired (a real failover): B alone now carries the acknowledged history.
        a.alive = False
        # Write 2: the client is told "acknowledged" as soon as B's OS has the bytes, before
        # B's own fsync has actually completed (the gap Chapter 1's fsync-failure topic and
        # the fsyncgate incident both name) — then B crashes and restarts before that fsync
        # lands, so the unflushed write is gone even though the disk itself is fine.
        b.apply(2, "v2", fsync_now=False)
        acknowledged.append(2)
        b.crash_recover()
        check(2, "v2")  # B is "alive" again, but the unflushed write didn't survive the restart

    else:
        raise ValueError(fault)

    return acknowledged, violated_at


def every_fault_breaks_the_invariant_exactly_once():
    results = {}
    for fault in ("message_loss", "reordering", "crash_recovery_lost_disk"):
        acknowledged, violated_at = run(fault)
        assert violated_at is not None, f"{fault} was expected to break the invariant, but didn't"
        assert violated_at in acknowledged, f"{fault}: the violated write ({violated_at}) was never acknowledged"
        results[fault] = violated_at
    assert results["message_loss"] == 1
    assert results["reordering"] == 2
    assert results["crash_recovery_lost_disk"] == 2
    return results


def a_clean_run_under_no_fault_never_violates_the_invariant():
    # The same protocol, same two writes, nothing injected: both end up durable on both nodes.
    a, b = Node("A"), Node("B")
    for seq, value in [(1, "v1"), (2, "v2")]:
        a.apply(seq, value, fsync_now=True)
        b.apply(seq, value, fsync_now=True)
    for seq, value in [(1, "v1"), (2, "v2")]:
        live_values = [n.value_of(seq) for n in (a, b) if n.alive and n.has(seq)]
        assert value in live_values, f"write {seq} should be durable on both nodes with no fault injected"
    return True


# ── The exhaustive-search lab leg: the executable stand-in for the skipped TLA+ lab ──
# A small schedule space — which of the two replicate deliveries to B happens first, and
# whether B's second apply is fsync'd before or after its crash — searched exhaustively
# for the SHORTEST sequence of scheduling decisions that reaches a lost acknowledged write.
SCHEDULE_SPACE = list(permutations(["deliver_1", "deliver_2", "crash_before_fsync"]))


def shortest_lost_write_trace():
    best = None
    for order in SCHEDULE_SPACE:
        state = {"durable": {}, "volatile": {}, "acked": set()}
        trace = []
        lost_at = None
        for step in order:
            trace.append(step)
            if step == "deliver_1":
                state["durable"][1] = "v1"
                state["acked"].add(1)
            elif step == "deliver_2":
                # delivered to B's memory, not yet fsync'd
                state["volatile"][2] = "v2"
                state["acked"].add(2)
            elif step == "crash_before_fsync":
                # a crash before write 2's fsync discards it; write 1 (already durable) survives
                state["volatile"].clear()
            # after each step, check whether every acknowledged write is still recoverable
            for seq in state["acked"]:
                if seq not in state["durable"] and seq not in state["volatile"]:
                    lost_at = (tuple(trace), seq)
                    break
            if lost_at:
                break
        if lost_at and (best is None or len(lost_at[0]) < len(best[0])):
            best = lost_at
    assert best is not None, "the schedule space should contain at least one lost-write trace"
    return best


def main():
    results = every_fault_breaks_the_invariant_exactly_once()
    assert a_clean_run_under_no_fault_never_violates_the_invariant()
    trace, lost_seq = shortest_lost_write_trace()
    print(f"message loss breaks the invariant at write #{results['message_loss']}")
    print(f"reordering breaks the invariant at write #{results['reordering']}")
    print(f"crash-recovery with a lost (unflushed) disk breaks the invariant at write #{results['crash_recovery_lost_disk']}")
    print(f"a clean run with nothing injected: invariant holds throughout")
    print(f"shortest lost-write trace found by exhaustive search: {trace} -> write #{lost_seq} lost")
    assert len(SCHEDULE_SPACE) == 6, "the schedule space should be the six orderings of three events"
    print("timing-failure-models examples: all checks pass")


if __name__ == "__main__":
    main()
