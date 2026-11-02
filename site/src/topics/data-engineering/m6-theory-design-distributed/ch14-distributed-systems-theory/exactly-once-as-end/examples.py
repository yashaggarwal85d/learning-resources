"""Executable evidence for de.exactly-once-as-end.

A small deterministic simulator: a payment service, a retrying client, and a
charge ledger, used to show at-least-once delivery, idempotent writes, and an
atomic offset+output commit as three separate, composable ideas.
"""

from dataclasses import dataclass, field


@dataclass
class ChargeLedger:
    """Models a card processor: charge(order_id) either appends a new charge or,
    if an idempotency key has already been seen, is a no-op."""
    charges: list = field(default_factory=list)
    seen_idempotency_keys: set = field(default_factory=set)

    def charge_without_idempotency_key(self, order_id, amount):
        self.charges.append((order_id, amount))

    def charge_with_idempotency_key(self, idempotency_key, order_id, amount):
        if idempotency_key in self.seen_idempotency_keys:
            return  # no-op: this exact charge already happened
        self.seen_idempotency_keys.add(idempotency_key)
        self.charges.append((order_id, amount))


def retry_after_lost_acknowledgement_without_idempotency_key(ledger, order_id, amount):
    """The first charge actually succeeds, but its acknowledgement is lost, so the
    client retries, believing the first attempt failed. Nothing stops the second
    charge from landing too."""
    ledger.charge_without_idempotency_key(order_id, amount)  # first attempt: succeeds
    # acknowledgement lost here; client sees a timeout, not a success
    ledger.charge_without_idempotency_key(order_id, amount)  # retry: also succeeds
    return len(ledger.charges)


def retry_after_lost_acknowledgement_with_idempotency_key(ledger, order_id, amount, idempotency_key):
    """Identical scenario, except both attempts carry the same idempotency key, so
    the processor recognises the retry as the same charge."""
    ledger.charge_with_idempotency_key(idempotency_key, order_id, amount)  # succeeds
    # acknowledgement lost here too
    ledger.charge_with_idempotency_key(idempotency_key, order_id, amount)  # no-op
    return len(ledger.charges)


def at_most_once_never_retries_and_can_lose_the_message(delivered):
    """At-most-once is the choice NOT to retry; if the one send is lost, there is
    no second attempt, so the message is simply gone. There is no third option on
    a lossy link: either you retry (risking a duplicate) or you don't (risking
    loss)."""
    return delivered  # True if the single send happened to arrive, False if lost


@dataclass
class OffsetAndOutputStore:
    """Models the atomic unit "consume offset N, produce output, commit both" as
    one object: either the whole triple is visible, or none of it is."""
    committed_offset: int | None = None
    committed_output: str | None = None

    def atomic_commit(self, offset, output):
        self.committed_offset = offset
        self.committed_output = output

    def crash_after_output_before_offset_is_impossible_once_atomic(self, offset, output):
        # modeling the atomic commit as a single step means there is no
        # intermediate state where output exists but the offset doesn't, or
        # vice versa - the whole point of making the pair one unit
        self.atomic_commit(offset, output)
        return self.committed_offset is not None and self.committed_output is not None


def non_atomic_commit_can_leave_output_without_recorded_offset(store, offset, output):
    """Contrast: writing output and recording the offset as two separate steps
    means a crash between them leaves output applied with no record of having
    consumed that input - the exact gap an atomic commit closes."""
    store.committed_output = output  # step one
    crashed_before_step_two = True
    if not crashed_before_step_two:
        store.committed_offset = offset  # step two, never reached
    return store.committed_offset is None and store.committed_output is not None


def exactly_once_in_effect_survives_duplicate_delivery(ledger, order_id, amount, idempotency_key, num_duplicate_deliveries):
    """Deliver the same message an arbitrary number of extra times; with an
    idempotent write, the number of actual charges never grows past one."""
    for _ in range(1 + num_duplicate_deliveries):
        ledger.charge_with_idempotency_key(idempotency_key, order_id, amount)
    return len(ledger.charges)


def idempotency_key_alone_does_not_fix_a_non_idempotent_side_effect(email_sent_log, idempotency_key):
    """An idempotency key only helps where the receiving system checks it. A
    pipeline that sends a confirmation email on every attempt, with no
    deduplication on the email side, still sends the email twice even though the
    payment charge itself was deduplicated by its own idempotency key."""
    email_sent_log.append(f"confirmation for {idempotency_key}")
    email_sent_log.append(f"confirmation for {idempotency_key}")  # the retry, resent
    return len(email_sent_log)


if __name__ == "__main__":
    ledger_a = ChargeLedger()
    charges_without_key = retry_after_lost_acknowledgement_without_idempotency_key(ledger_a, "order-1", 42)
    assert charges_without_key == 2  # charged twice: the duplicate the hook describes

    ledger_b = ChargeLedger()
    charges_with_key = retry_after_lost_acknowledgement_with_idempotency_key(ledger_b, "order-1", 42, "idem-key-1")
    assert charges_with_key == 1  # the retry is a harmless no-op

    assert at_most_once_never_retries_and_can_lose_the_message(delivered=False) is False

    store = OffsetAndOutputStore()
    assert store.crash_after_output_before_offset_is_impossible_once_atomic(offset=7, output="row-7") is True

    store2 = OffsetAndOutputStore()
    assert non_atomic_commit_can_leave_output_without_recorded_offset(store2, offset=8, output="row-8") is True

    ledger_c = ChargeLedger()
    total_charges = exactly_once_in_effect_survives_duplicate_delivery(
        ledger_c, "order-2", 15, "idem-key-2", num_duplicate_deliveries=4
    )
    assert total_charges == 1  # five deliveries, one charge

    email_log = []
    emails_sent = idempotency_key_alone_does_not_fix_a_non_idempotent_side_effect(email_log, "idem-key-3")
    assert emails_sent == 2  # the idempotency key protected the charge, not the email

    print("all examples passed")
