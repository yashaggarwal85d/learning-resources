"""Toy Kafka Streams model: a partition-to-task assignment (parallelism bounded by partition
count), a KStream-to-KTable aggregation with the resulting table read back out as a stream (the
stream-table duality), and a standby-replica recovery-time comparison between a task with no
standby and one with a warm standby already caught up.
"""


def assign_tasks(num_partitions, num_instances):
    """Kafka Streams creates one task per input partition and distributes tasks across however
    many application instances are running; the assignment never changes, and parallelism is
    bounded by the partition count, not by how many instances are started."""
    tasks = [f"task-{i}" for i in range(num_partitions)]
    assignment = {inst: [] for inst in range(num_instances)}
    for i, task in enumerate(tasks):
        assignment[i % num_instances].append(task)
    idle_instances = [inst for inst, owned in assignment.items() if not owned]
    return assignment, idle_instances


def stream_to_table(events):
    """A KStream of (key, value) events aggregated into a KTable: each new event for a key
    overwrites that key's current value, modeling a count-style aggregation's changelog."""
    table = {}
    for key, _ in events:
        table[key] = table.get(key, 0) + 1
    return table


def table_to_stream(table):
    """The same duality in reverse: a KTable's current state read back out as a stream of
    (key, value) change records, one per key."""
    return sorted(table.items())


def recovery_time_without_standby(state_size, replay_rate):
    """With no standby replica, recovery after a failure has to replay the entire changelog
    topic from scratch before the task can resume processing."""
    return state_size / replay_rate


def recovery_time_with_standby(state_size, replay_rate, standby_lag):
    """With a warm standby already caught up to within `standby_lag` records of the active
    task, recovery only has to replay the small gap, not the whole changelog."""
    return standby_lag / replay_rate


if __name__ == "__main__":
    assignment_5_3, idle_5_3 = assign_tasks(num_partitions=5, num_instances=3)
    total_tasks = sum(len(v) for v in assignment_5_3.values())
    assert total_tasks == 5, "every partition must map to exactly one task"
    assert not idle_5_3, "with fewer instances than partitions, no instance should sit idle"

    assignment_5_8, idle_5_8 = assign_tasks(num_partitions=5, num_instances=8)
    assert len(idle_5_8) == 3, "excess instances beyond the partition count must sit idle"
    print(f"5 partitions, 3 instances: {assignment_5_3}, idle: {idle_5_3}")
    print(f"5 partitions, 8 instances: idle instances {idle_5_8} (parallelism capped at 5)")

    events = [
        ("user-a", "click"), ("user-b", "click"), ("user-a", "click"),
        ("user-c", "click"), ("user-a", "click"), ("user-b", "click"),
    ]
    table = stream_to_table(events)
    assert table == {"user-a": 3, "user-b": 2, "user-c": 1}
    stream_back = table_to_stream(table)
    assert stream_back == [("user-a", 3), ("user-b", 2), ("user-c", 1)]
    reconstructed_table = dict(stream_back)
    assert reconstructed_table == table, "the table reconstructed from its own stream must match the original"
    print(f"stream aggregated to table: {table}")
    print(f"table read back as stream: {stream_back} (the same data, both directions)")

    state_size, replay_rate = 100_000, 500
    no_standby_time = recovery_time_without_standby(state_size, replay_rate)
    with_standby_time = recovery_time_with_standby(state_size, replay_rate, standby_lag=200)
    assert with_standby_time < no_standby_time
    speedup = no_standby_time / with_standby_time
    assert speedup > 100, "a warm standby must cut recovery time by a large factor, not a marginal one"
    print(f"recovery time: no standby {no_standby_time:.1f} ticks, "
          f"with a warm standby {with_standby_time:.1f} ticks ({speedup:.0f}x faster)")

    print("all checks passed")
