"""Toy broker/producer models for de.idempotent-producer: a PID + epoch + per-partition sequence
number check that really rejects a replayed or out-of-order batch, and an epoch bump that really
fences a zombie producer. Standalone simulation (no real Kafka broker runs in this sandbox), per
KIP-98's own design text (SOURCES.md)."""


class TinyBroker:
    """Tracks, per (pid, epoch, partition), the last accepted sequence number — exactly the
    in-memory state KIP-98 describes the broker keeping."""

    def __init__(self):
        self._last_seen = {}  # (pid, epoch, partition) -> last accepted sequence number
        self._current_epoch = {}  # pid -> current (highest-seen) epoch

    def accept(self, pid, epoch, partition, sequence):
        current = self._current_epoch.get(pid)
        if current is not None and epoch < current:
            return "fenced_zombie_epoch"
        self._current_epoch[pid] = max(current or 0, epoch)

        key = (pid, epoch, partition)
        last = self._last_seen.get(key)
        if last is None:
            if sequence != 0:
                return "out_of_sequence"
            self._last_seen[key] = sequence
            return "accepted"
        if sequence <= last:
            return "duplicate_rejected"
        if sequence != last + 1:
            return "out_of_sequence"
        self._last_seen[key] = sequence
        return "accepted"


def run():
    broker = TinyBroker()

    # Baseline: three batches, in order, on one (pid, epoch, partition) — all accepted.
    assert broker.accept(pid="p1", epoch=0, partition=0, sequence=0) == "accepted"
    assert broker.accept(pid="p1", epoch=0, partition=0, sequence=1) == "accepted"
    assert broker.accept(pid="p1", epoch=0, partition=0, sequence=2) == "accepted"

    # A lost-ack retry resends sequence 1 — the broker recognizes it as an already-accepted
    # duplicate and rejects it, closing topic 9's first crash window.
    assert broker.accept(pid="p1", epoch=0, partition=0, sequence=1) == "duplicate_rejected"

    # A gap (sequence 4 arrives, but 3 never did) is a different, fatal failure, not a duplicate.
    assert broker.accept(pid="p1", epoch=0, partition=0, sequence=4) == "out_of_sequence"

    # Scope check: the SAME sequence number on a DIFFERENT partition is a fresh counter, not a
    # duplicate — idempotence is per (pid, partition), not per pid alone.
    assert broker.accept(pid="p1", epoch=0, partition=1, sequence=0) == "accepted"

    # Zombie fencing: a producer restarts under the same PID with a new, higher epoch. Its first
    # write at the new epoch is accepted. A late write still in flight from the OLD epoch is
    # fenced off, even though its sequence number would otherwise look valid.
    assert broker.accept(pid="p1", epoch=1, partition=0, sequence=0) == "accepted"
    assert broker.accept(pid="p1", epoch=0, partition=0, sequence=5) == "fenced_zombie_epoch"

    print("duplicate retry on an already-accepted sequence:",
          broker.accept(pid="p1", epoch=1, partition=0, sequence=0))
    print("same sequence number, different partition:",
          broker.accept(pid="p1", epoch=1, partition=2, sequence=0))
    print("zombie producer (stale epoch) rejected:",
          broker.accept(pid="p1", epoch=0, partition=0, sequence=6))


if __name__ == "__main__":
    run()
