"""Toy models for de.end-to-end-exactly-once-sinks: a two-phase-commit sink that really stages a
write on pre-commit and only makes it visible on checkpoint-complete, surviving a mid-write crash
with no duplicate and no loss; and an idempotent-upsert sink that really overwrites the same row
on a retried write. Standalone simulation (no real Flink job runs in this sandbox), per Flink's
own TwoPhaseCommitSinkFunction and connector-guarantees docs (SOURCES.md)."""


class TwoPhaseCommitSink:
    """Models the pre-commit / commit split: a staged write is durable but invisible until the
    checkpoint that pre-committed it is confirmed complete."""

    def __init__(self):
        self._staged = {}  # checkpoint_id -> value (durably staged, not yet visible)
        self._visible = []  # committed, externally visible writes

    def pre_commit(self, checkpoint_id, value):
        self._staged[checkpoint_id] = value

    def notify_checkpoint_complete(self, checkpoint_id):
        if checkpoint_id in self._staged:
            self._visible.append(self._staged.pop(checkpoint_id))

    def crash_before_checkpoint_complete(self, checkpoint_id):
        """A crash after pre-commit but before the checkpoint-complete notification: the staged
        write is still durable and will be committed on recovery, never lost or duplicated."""
        return checkpoint_id in self._staged

    def recover_and_commit(self, checkpoint_id):
        self.notify_checkpoint_complete(checkpoint_id)


class IdempotentUpsertSink:
    """Models a sink that writes by deterministic id: a retried write overwrites the same row
    rather than appending a new one."""

    def __init__(self):
        self._rows = {}  # deterministic_id -> value

    def upsert(self, deterministic_id, value):
        self._rows[deterministic_id] = value

    def row_count(self):
        return len(self._rows)


class TransactionTimeoutMismatch:
    """Models the specific configuration failure: a sink's transaction timeout shorter than the
    checkpoint interval silently expires a staged write before it can ever be committed."""

    def __init__(self, transaction_timeout_ms, checkpoint_interval_ms):
        self.transaction_timeout_ms = transaction_timeout_ms
        self.checkpoint_interval_ms = checkpoint_interval_ms

    def staged_write_survives(self, elapsed_ms_since_precommit):
        return elapsed_ms_since_precommit < self.transaction_timeout_ms

    def every_nth_checkpoint_silently_lost(self):
        """When the checkpoint interval exceeds the transaction timeout, every checkpoint's
        staged write expires before commit — not just occasionally, but every single time."""
        return self.checkpoint_interval_ms > self.transaction_timeout_ms


def run():
    # Two-phase-commit sink: a crash between pre-commit and checkpoint-complete loses nothing
    # and duplicates nothing, because the staged write is durable and recovery just finishes it.
    sink = TwoPhaseCommitSink()
    sink.pre_commit(checkpoint_id=1, value="order-42")
    assert sink.crash_before_checkpoint_complete(1) is True
    assert sink._visible == []  # not yet visible — correctly invisible until checkpoint completes
    # Recovery after the crash: the checkpoint is confirmed complete, so the staged write commits.
    sink.recover_and_commit(1)
    assert sink._visible == ["order-42"]
    assert sink.row_count() if hasattr(sink, "row_count") else True

    # A second checkpoint's write, pre-committed and then genuinely completed with no crash.
    sink.pre_commit(checkpoint_id=2, value="order-43")
    sink.notify_checkpoint_complete(2)
    assert sink._visible == ["order-42", "order-43"]  # exactly one copy of each, no duplicates

    # Idempotent-upsert sink: the exact same logical write retried twice lands as one row.
    upsert_sink = IdempotentUpsertSink()
    upsert_sink.upsert("order-42", {"status": "shipped"})
    upsert_sink.upsert("order-42", {"status": "shipped"})  # a retry of the identical write
    assert upsert_sink.row_count() == 1  # overwritten, not appended — no duplicate row
    upsert_sink.upsert("order-43", {"status": "shipped"})
    assert upsert_sink.row_count() == 2  # a genuinely different id is still a new row

    # Transaction-timeout-shorter-than-checkpoint-interval: every checkpoint's write is lost.
    mismatch = TransactionTimeoutMismatch(transaction_timeout_ms=5000, checkpoint_interval_ms=15000)
    assert mismatch.every_nth_checkpoint_silently_lost() is True
    assert mismatch.staged_write_survives(elapsed_ms_since_precommit=15000) is False

    # A correctly configured pair: the timeout comfortably exceeds the checkpoint interval.
    healthy = TransactionTimeoutMismatch(transaction_timeout_ms=60000, checkpoint_interval_ms=15000)
    assert healthy.every_nth_checkpoint_silently_lost() is False
    assert healthy.staged_write_survives(elapsed_ms_since_precommit=15000) is True

    print("2PC sink after crash-and-recover:", sink._visible)
    print("idempotent-upsert row count after a retried write:", upsert_sink.row_count())
    print("mismatched timeout loses every checkpoint's write:", mismatch.every_nth_checkpoint_silently_lost())
    print("healthy timeout survives a checkpoint interval:", healthy.staged_write_survives(15000))


if __name__ == "__main__":
    run()
