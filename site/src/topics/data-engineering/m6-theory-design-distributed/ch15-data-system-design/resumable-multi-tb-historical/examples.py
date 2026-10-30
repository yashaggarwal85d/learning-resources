"""Lab for de.resumable-multi-tb-historical.

The crash-and-resume simulation (no duplicate chunk output after a
mid-run kill), the throttle simulation against a production-latency
signal, and the duration-and-cost estimate are this topic's executable
evidence.
"""


def chunk_plan(total_days, days_per_chunk):
    """Five years of history cut into independent chunks."""
    chunks = []
    start = 0
    while start < total_days:
        end = min(start + days_per_chunk, total_days)
        chunks.append((start, end))
        start = end
    return chunks


def run_chunk(chunk, completed_checkpoint, output):
    """Idempotent: re-running a chunk already in output overwrites its own
    slot deterministically, never appending a duplicate.
    """
    output[chunk] = f"result-for-{chunk}"
    completed_checkpoint.add(chunk)
    return output


def resume_point(chunks, checkpoint):
    """A checkpoint resumes at the first incomplete chunk, not the start."""
    for chunk in chunks:
        if chunk not in checkpoint:
            return chunk
    return None


def simulate_crash_and_resume(chunks, crash_after_n):
    """Run chunks until a crash, then resume from the checkpoint with no
    duplicate output.
    """
    checkpoint = set()
    output = {}
    for chunk in chunks[:crash_after_n]:
        run_chunk(chunk, checkpoint, output)

    resume_from = resume_point(chunks, checkpoint)
    for chunk in chunks:
        if chunk in checkpoint:
            continue
        run_chunk(chunk, checkpoint, output)

    return output, resume_from


def throttled_concurrency(base_concurrency, production_latency_ms, latency_threshold_ms):
    """The throttle's signal is production's own latency, not a fixed
    concurrency number: concurrency drops as latency rises past the
    threshold, and recovers once it falls back.
    """
    if production_latency_ms <= latency_threshold_ms:
        return base_concurrency
    overshoot = production_latency_ms - latency_threshold_ms
    reduction = min(base_concurrency - 1, overshoot // 10)
    return max(1, base_concurrency - reduction)


def backfill_cost(total_days, cost_per_day, shadow_storage_overhead_factor):
    """Duration and cost estimate, including the shadow's doubled storage
    during the run.
    """
    base_cost = total_days * cost_per_day
    shadow_cost = base_cost * shadow_storage_overhead_factor
    return base_cost + shadow_cost


def diff_is_intended_only(diff_rows, intended_change_ids):
    """The diff must show only the intended change, or the swap doesn't
    happen.
    """
    unexpected = diff_rows - intended_change_ids
    return len(unexpected) == 0


def check():
    chunks = chunk_plan(total_days=1825, days_per_chunk=30)  # five years, 30-day chunks
    assert len(chunks) == 61
    assert chunks[0] == (0, 30)
    assert chunks[-1][1] == 1825

    output, resume_from = simulate_crash_and_resume(chunks, crash_after_n=40)
    assert resume_from == chunks[40]  # resumed at the first incomplete chunk, not chunk 0
    assert len(output) == len(chunks)  # every chunk present exactly once
    assert len(set(output.values())) == len(chunks)  # no duplicate results

    full_speed = throttled_concurrency(base_concurrency=10, production_latency_ms=50, latency_threshold_ms=100)
    throttled = throttled_concurrency(base_concurrency=10, production_latency_ms=200, latency_threshold_ms=100)
    assert full_speed == 10
    assert throttled < 10  # latency over threshold pulls concurrency down

    recovered = throttled_concurrency(base_concurrency=10, production_latency_ms=90, latency_threshold_ms=100)
    assert recovered == 10  # back under threshold, concurrency recovers

    cost_no_shadow = backfill_cost(total_days=1825, cost_per_day=20.0, shadow_storage_overhead_factor=0.0)
    cost_with_shadow = backfill_cost(total_days=1825, cost_per_day=20.0, shadow_storage_overhead_factor=1.0)
    assert cost_no_shadow == 36_500
    assert cost_with_shadow == 73_000  # the shadow roughly doubles the storage cost during the run

    clean_diff = diff_is_intended_only({"order_42"}, intended_change_ids={"order_42"})
    dirty_diff = diff_is_intended_only({"order_42", "order_99"}, intended_change_ids={"order_42"})
    assert clean_diff is True
    assert dirty_diff is False  # an unintended row in the diff blocks the swap


if __name__ == "__main__":
    check()
    print("de.resumable-multi-tb-historical: all checks passed")
