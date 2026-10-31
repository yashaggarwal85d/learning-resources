"""Toy keyed-state model: keys hashed into a fixed number of key groups, key groups (not
individual keys) reassigned to instances on rescale; a TaskManager-failure recovery-time model
driven by state size, not job complexity; and a heap-vs-RocksDB access-cost and capacity
comparison.
"""

import hashlib


def key_group(key, max_parallelism):
    """A key is hashed into one of a fixed number of key groups, set once by max parallelism and
    never recomputed from the job's current parallelism."""
    digest = hashlib.sha256(key.encode()).digest()
    return int.from_bytes(digest[:4], "big") % max_parallelism


def assign_instance(group, num_instances):
    """Key groups, not keys, are what actually get assigned to an operator instance."""
    return group % num_instances


def rescale(keys, max_parallelism, instances_before, instances_after):
    """Rescale a job from `instances_before` to `instances_after` instances. Returns, for every
    key, its key group and its instance before and after — and asserts that every key sharing a
    key group always shares an instance, both before and after, proving key groups move as whole
    blocks."""
    rows = []
    for k in keys:
        g = key_group(k, max_parallelism)
        rows.append((k, g, assign_instance(g, instances_before), assign_instance(g, instances_after)))

    by_group_before, by_group_after = {}, {}
    for _, g, before, after in rows:
        by_group_before.setdefault(g, set()).add(before)
        by_group_after.setdefault(g, set()).add(after)
    for g, instances in by_group_before.items():
        assert len(instances) == 1, f"key group {g} split across instances before rescale: {instances}"
    for g, instances in by_group_after.items():
        assert len(instances) == 1, f"key group {g} split across instances after rescale: {instances}"

    return rows


def recovery_time(key_groups_owned, state_size_per_group, operator_count):
    """Recovery time after a TaskManager failure is driven by how much state the failed
    instance's key groups held — `operator_count` is accepted but never used, because job
    complexity isn't what determines recovery time."""
    return sum(state_size_per_group.get(g, 0) for g in key_groups_owned)


def access_cost(backend, num_accesses, heap_unit_cost=1, rocksdb_unit_cost=6):
    """Heap state is plain objects on the JVM heap; RocksDB state pays a real de/serialization
    cost on every access."""
    if backend == "heap":
        return num_accesses * heap_unit_cost
    if backend == "rocksdb":
        return num_accesses * rocksdb_unit_cost
    raise ValueError(backend)


def max_capacity(backend, memory_limit_bytes, disk_limit_bytes):
    """Heap state is bounded by available cluster memory; RocksDB state is bounded by disk space,
    which is typically far larger."""
    if backend == "heap":
        return memory_limit_bytes
    if backend == "rocksdb":
        return disk_limit_bytes
    raise ValueError(backend)


if __name__ == "__main__":
    max_parallelism = 128
    keys = [f"user-{i}" for i in range(20_000)]

    rows = rescale(keys, max_parallelism, instances_before=4, instances_after=6)
    groups_before = {g: before for _, g, before, _ in rows}
    groups_after = {g: after for _, g, _, after in rows}
    moved_groups = sum(1 for g in groups_before if groups_before[g] != groups_after[g])
    moved_keys = sum(1 for _, g, before, after in rows if before != after)
    assert moved_groups > 0, "rescaling from 4 to 6 instances should move at least some key groups"
    assert moved_groups < max_parallelism, "not every key group should need to move"
    print(f"rescale (4 -> 6 instances, {max_parallelism} key groups, {len(keys)} keys): "
          f"{moved_groups} key groups moved, carrying {moved_keys} keys with them, verified with "
          f"no key group ever split across two instances")

    state_size_per_group = {g: 10 + (g * 7) % 50 for g in range(max_parallelism)}
    instance_groups = {}
    for g in range(max_parallelism):
        instance_groups.setdefault(assign_instance(g, 6), []).append(g)
    heaviest_instance = max(instance_groups, key=lambda i: sum(state_size_per_group[g] for g in instance_groups[i]))

    simple_job_recovery = recovery_time(instance_groups[heaviest_instance], state_size_per_group, operator_count=1)
    complex_job_recovery = recovery_time(instance_groups[heaviest_instance], state_size_per_group, operator_count=40)
    assert simple_job_recovery == complex_job_recovery, (
        "recovery time must depend only on state held, not on operator count"
    )
    lightest_instance = min(instance_groups, key=lambda i: sum(state_size_per_group[g] for g in instance_groups[i]))
    lightest_recovery = recovery_time(instance_groups[lightest_instance], state_size_per_group, operator_count=1)
    assert simple_job_recovery > lightest_recovery, (
        "the instance holding more state should take measurably longer to recover"
    )
    print(f"recovery time: heaviest instance {simple_job_recovery} units regardless of operator "
          f"count (1 vs 40, identical), lightest instance {lightest_recovery} units — state size "
          f"decides it, not job complexity")

    accesses = 10_000
    heap_cost = access_cost("heap", accesses)
    rocksdb_cost = access_cost("rocksdb", accesses)
    assert rocksdb_cost > heap_cost, "RocksDB access must cost more than heap access per the same accesses"
    heap_cap = max_capacity("heap", memory_limit_bytes=8_000_000_000, disk_limit_bytes=2_000_000_000_000)
    rocksdb_cap = max_capacity("rocksdb", memory_limit_bytes=8_000_000_000, disk_limit_bytes=2_000_000_000_000)
    assert rocksdb_cap > heap_cap, "RocksDB's disk-bound capacity should exceed heap's memory-bound capacity"
    print(f"access cost over {accesses} accesses: heap {heap_cost} units, rocksdb {rocksdb_cost} "
          f"units ({rocksdb_cost / heap_cost:.1f}x); capacity: heap bounded at {heap_cap} bytes "
          f"(memory), rocksdb bounded at {rocksdb_cap} bytes (disk)")

    print("all checks passed")
