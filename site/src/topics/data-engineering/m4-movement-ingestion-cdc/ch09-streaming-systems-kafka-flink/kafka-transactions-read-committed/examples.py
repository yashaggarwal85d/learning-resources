"""Toy models for de.kafka-transactions-read-committed: a transaction-coordinator state machine
that really fences a zombie instance by transactional id, and a toy last-stable-offset / isolation
level check that really hides an aborted transaction's records from a read_committed reader while
showing them to a read_uncommitted one. Standalone simulation (no real Kafka broker runs in this
sandbox), per KIP-98's and KIP-890's own design text (SOURCES.md)."""


class TinyCoordinator:
    """Tracks, per transactional id, the current fencing epoch — the mechanism KIP-98 and
    KIP-890 describe for rejecting a zombie instance of a restarted producer."""

    def __init__(self):
        self._epoch = {}  # transactional_id -> current epoch

    def init_producer(self, transactional_id):
        """A new (or restarted) instance asks for its PID; the coordinator bumps the epoch,
        fencing any older instance still holding the previous epoch."""
        self._epoch[transactional_id] = self._epoch.get(transactional_id, -1) + 1
        return self._epoch[transactional_id]

    def write(self, transactional_id, epoch):
        if self._epoch.get(transactional_id) != epoch:
            return "fenced_zombie"
        return "accepted"


class TinyLog:
    """A toy partition log that records which offsets belong to which transaction, and whether
    that transaction committed or aborted, then filters a read by isolation level."""

    def __init__(self):
        self._records = []  # list of (offset, txn_id, value)
        self._txn_outcome = {}  # txn_id -> "committed" | "aborted" | None (still open)

    def append(self, txn_id, value):
        offset = len(self._records)
        self._records.append((offset, txn_id, value))
        return offset

    def end_transaction(self, txn_id, committed):
        self._txn_outcome[txn_id] = "committed" if committed else "aborted"

    def last_stable_offset(self):
        """The first offset belonging to a transaction that hasn't yet been decided (committed
        or aborted) — the point past which no open transaction's writes exist."""
        for offset, txn_id, _ in self._records:
            if self._txn_outcome.get(txn_id) is None:
                return offset
        return len(self._records)

    def read(self, isolation_level):
        if isolation_level == "read_uncommitted":
            return [v for _, _, v in self._records]
        # read_committed: only records from committed transactions, up to the LSO
        lso = self.last_stable_offset()
        return [v for offset, txn_id, v in self._records[:lso]
                if self._txn_outcome.get(txn_id) == "committed"]


def run():
    coordinator = TinyCoordinator()
    epoch_a = coordinator.init_producer("payments-writer")
    assert coordinator.write("payments-writer", epoch_a) == "accepted"

    # The application restarts under the same transactional id -> a new, higher epoch.
    epoch_b = coordinator.init_producer("payments-writer")
    assert epoch_b > epoch_a
    assert coordinator.write("payments-writer", epoch_b) == "accepted"
    # A write still in flight under the OLD epoch is fenced off, even though it's a legitimate
    # instance that simply hasn't noticed the restart yet.
    assert coordinator.write("payments-writer", epoch_a) == "fenced_zombie"

    log = TinyLog()
    log.append("txn-1", "order-committed")
    log.append("txn-2", "order-aborted")
    log.append("txn-1", "order-committed-2")
    log.end_transaction("txn-1", committed=True)
    log.end_transaction("txn-2", committed=False)
    log.append("txn-3", "order-still-open")  # an open transaction, never ended

    lso = log.last_stable_offset()
    assert lso == 3  # the first record of the still-open txn-3

    committed_view = log.read("read_committed")
    uncommitted_view = log.read("read_uncommitted")
    assert committed_view == ["order-committed", "order-committed-2"]
    assert "order-aborted" not in committed_view
    assert "order-aborted" in uncommitted_view
    assert "order-still-open" in uncommitted_view
    assert "order-still-open" not in committed_view

    print("zombie write under stale epoch:", coordinator.write("payments-writer", epoch_a))
    print("last stable offset:", lso)
    print("read_committed view:", committed_view)
    print("read_uncommitted view:", uncommitted_view)


if __name__ == "__main__":
    run()
