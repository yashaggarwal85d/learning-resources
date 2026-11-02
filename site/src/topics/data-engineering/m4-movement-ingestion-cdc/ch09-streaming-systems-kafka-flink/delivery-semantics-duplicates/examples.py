"""Toy models for de.delivery-semantics-duplicates: the two canonical crash windows that create
loss or duplication, reproduced as standalone simulations (no real broker or consumer runs in
this sandbox), per Kafka's own design documentation (SOURCES.md)."""


def producer_retry_window(ack_lost, had_retries, is_idempotent):
    """A producer sends a batch; the broker commits it, but the ack is lost on the way back.
    Without retries, the producer just loses track (no duplicate, no guaranteed delivery). With
    retries and no idempotence, the retry writes a second copy. With idempotence, the broker
    recognizes and drops the duplicate."""
    if not ack_lost:
        return "delivered_once"
    if not had_retries:
        return "ack_lost_no_retry"
    if is_idempotent:
        return "retried_deduplicated"
    return "retried_duplicate_written"


def consumer_crash_window(commit_before_process, crash_after_process_before_commit):
    """Two different orderings of "process the message" and "save position" produce two
    different failure shapes on a crash."""
    if commit_before_process:
        if crash_after_process_before_commit:
            # impossible combination guarded against by caller; included for clarity
            raise ValueError("commit happens before process in this ordering")
        return "at_most_once"  # crash before commit never reached -> lost, never duplicated
    if crash_after_process_before_commit:
        return "at_least_once"  # effect already applied, position not saved -> reprocessed
    return "clean_run"


def effect_count(semantics, crash_happens):
    """What each semantics actually promises about how many times the EFFECT lands, not how
    many times delivery is attempted."""
    if not crash_happens:
        return 1
    return {"at_most_once": 0, "at_least_once": 2, "exactly_once": 1}[semantics]


def run():
    assert producer_retry_window(ack_lost=False, had_retries=True, is_idempotent=False) == "delivered_once"
    assert producer_retry_window(ack_lost=True, had_retries=False, is_idempotent=False) == "ack_lost_no_retry"
    assert producer_retry_window(ack_lost=True, had_retries=True, is_idempotent=False) == "retried_duplicate_written"
    assert producer_retry_window(ack_lost=True, had_retries=True, is_idempotent=True) == "retried_deduplicated"

    assert consumer_crash_window(commit_before_process=True, crash_after_process_before_commit=False) == "at_most_once"
    assert consumer_crash_window(commit_before_process=False, crash_after_process_before_commit=True) == "at_least_once"
    assert consumer_crash_window(commit_before_process=False, crash_after_process_before_commit=False) == "clean_run"

    assert effect_count("at_most_once", crash_happens=True) == 0
    assert effect_count("at_least_once", crash_happens=True) == 2
    assert effect_count("exactly_once", crash_happens=True) == 1
    assert effect_count("exactly_once", crash_happens=False) == 1

    print("producer, ack lost, retries on, no idempotence:",
          producer_retry_window(ack_lost=True, had_retries=True, is_idempotent=False))
    print("producer, ack lost, retries on, idempotent:",
          producer_retry_window(ack_lost=True, had_retries=True, is_idempotent=True))
    print("consumer, commit-then-process, crash after process:",
          consumer_crash_window(commit_before_process=True, crash_after_process_before_commit=False))
    print("consumer, process-then-commit, crash after process:",
          consumer_crash_window(commit_before_process=False, crash_after_process_before_commit=True))
    print("effect counts under a crash: at-most-once=%d, at-least-once=%d, exactly-once=%d" % (
        effect_count("at_most_once", True), effect_count("at_least_once", True), effect_count("exactly_once", True)))


if __name__ == "__main__":
    run()
