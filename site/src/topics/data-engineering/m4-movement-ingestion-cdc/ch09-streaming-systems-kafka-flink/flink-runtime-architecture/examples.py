"""Toy Flink runtime model: max parallelism from slots, a cost comparison between chained and
unchained operators, a credit-counter simulation of backpressure propagating backward through a
chain, and adaptive batch scheduling deciding parallelism from upstream data volume.
"""


def max_parallelism(task_managers, slots_per_task_manager):
    """A job's parallelism is bounded by the total slots available across all TaskManagers."""
    return task_managers * slots_per_task_manager


def run_chained(records, per_record_cost=1):
    """Chained operators run in one thread: one pass over the data, no per-hop handoff."""
    total_cost = 0
    for _ in records:
        total_cost += per_record_cost  # one unit of work, no handoff between operators
    return total_cost


def run_unchained(records, per_record_cost=1, handoff_cost=2, num_hops=3):
    """Unchained operators run as separate tasks: every hop between them pays a thread-to-thread
    handoff and (de)serialization cost, on top of the same per-record work."""
    total_cost = 0
    for _ in records:
        total_cost += per_record_cost
        total_cost += handoff_cost * num_hops
    return total_cost


class Channel:
    """One logical channel between a sender and a receiver, tracked by credits (1 buffer = 1
    credit), per the credit-based flow control model: a sender may only forward a buffer to the
    receiver if it currently holds credit for that channel."""
    def __init__(self, initial_credits):
        self.credits = initial_credits

    def grant(self, n):
        self.credits += n

    def try_send(self):
        if self.credits > 0:
            self.credits -= 1
            return True
        return False


def run_backpressure_chain(num_stages, initial_credits, consumer_rate, ticks=20):
    """`num_stages` operators in a row, connected by `num_stages - 1` channels (channel i runs
    from stage i to stage i+1). Every channel sends one buffer per tick whenever it has credit.
    The last channel (into the slow consumer) is only regranted credit at `consumer_rate` — a
    stuck consumer regrants none. Every earlier channel is only regranted credit when the channel
    after it still has credit of its own to forward into: a stage can only free up a slot for its
    upstream neighbor if it can also push its own output along. That dependency is what makes the
    stall drain backward through the chain one hop at a time, exactly as credit-based flow control
    is meant to behave, instead of every channel starving all at once."""
    num_channels = num_stages - 1
    channels = [Channel(initial_credits) for _ in range(num_channels)]
    credits_over_time = []

    for _tick in range(ticks):
        grants = [0] * num_channels
        grants[-1] = consumer_rate
        for i in range(num_channels - 2, -1, -1):
            grants[i] = 1 if channels[i + 1].credits > 0 else 0
        for ch in channels:
            ch.try_send()
        for i, g in enumerate(grants):
            channels[i].grant(g)
        credits_over_time.append([c.credits for c in channels])

    return credits_over_time


def adaptive_batch_parallelism(upstream_output_bytes, target_bytes_per_task, max_parallelism_cap):
    """The Adaptive Batch Scheduler decides an operator's parallelism from the size of its
    consumed (upstream) dataset, not a parallelism fixed up front."""
    needed = -(-upstream_output_bytes // target_bytes_per_task)  # ceiling division
    return max(1, min(needed, max_parallelism_cap))


if __name__ == "__main__":
    task_managers, slots = 4, 3
    assert max_parallelism(task_managers, slots) == 12, "4 TaskManagers x 3 slots should bound parallelism at 12"
    print(f"max parallelism: {task_managers} TaskManagers x {slots} slots each = {max_parallelism(task_managers, slots)}")

    records = list(range(1000))
    chained_cost = run_chained(records)
    unchained_cost = run_unchained(records)
    assert chained_cost == 1000, f"chained cost should equal the record count, got {chained_cost}"
    assert unchained_cost > chained_cost, "unchained operators must cost more than chained ones"
    multiplier = unchained_cost / chained_cost
    assert 6.5 <= multiplier <= 7.5, f"expected roughly a seven-times cost multiplier, got {multiplier}"
    print(f"chained: {chained_cost} cost units; unchained: {unchained_cost} cost units "
          f"({multiplier:.2f}x more expensive, same records)")

    num_stages = 4
    credits_over_time = run_backpressure_chain(
        num_stages=num_stages,
        initial_credits=5,
        consumer_rate=0,  # the slow consumer grants no new credit back at all
        ticks=25,
    )
    num_channels = num_stages - 1
    final_credits = credits_over_time[-1]
    assert final_credits[-1] == 0, f"the channel into the slow consumer should be starved, got {final_credits[-1]}"
    first_hits_zero = [next((t for t, snap in enumerate(credits_over_time) if snap[i] == 0), None) for i in range(num_channels)]
    assert all(t is not None for t in first_hits_zero), "every channel must eventually starve"
    assert first_hits_zero == sorted(first_hits_zero, reverse=True), (
        "the channel closest to the slow consumer must starve first, and each channel further "
        f"upstream must starve later, got {first_hits_zero}"
    )
    assert len(set(first_hits_zero)) == num_channels, "each channel must starve at a distinct tick"
    print(f"backpressure chain ({num_stages} stages, {num_channels} channels): credits hit zero "
          f"at ticks {first_hits_zero}, draining backward from the slow consumer one hop at a time")

    small_batch = adaptive_batch_parallelism(upstream_output_bytes=200, target_bytes_per_task=100, max_parallelism_cap=64)
    large_batch = adaptive_batch_parallelism(upstream_output_bytes=6400, target_bytes_per_task=100, max_parallelism_cap=64)
    capped_batch = adaptive_batch_parallelism(upstream_output_bytes=1_000_000, target_bytes_per_task=100, max_parallelism_cap=64)
    assert small_batch == 2, f"a small upstream output should need a small parallelism, got {small_batch}"
    assert large_batch == 64, f"a much larger upstream output should need a larger parallelism, got {large_batch}"
    assert capped_batch == 64, f"parallelism must not exceed the configured cap, got {capped_batch}"
    print(f"adaptive batch scheduling: a small stage gets parallelism {small_batch}, "
          f"a much larger stage gets parallelism {large_batch}, both decided from data volume, not fixed up front")

    print("all checks passed")
