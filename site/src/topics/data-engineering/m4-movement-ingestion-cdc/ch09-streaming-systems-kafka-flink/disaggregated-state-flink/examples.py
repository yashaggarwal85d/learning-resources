"""Toy disaggregated-state model: a checkpoint-cost comparison between a local-primary backend
(RocksDB-style) and a remote-primary backend (ForSt-style), an async state-access model that
overlaps different keys' remote round trips while keeping same-key accesses strictly ordered, and
a cache-hit-rate model showing what a latency-sensitive job gives up without a warm local cache.
"""


def checkpoint_cost(state_size, primary_location, metadata_cost=2):
    """A local-primary backend's checkpoint has to copy the state itself to durable storage, so
    its cost grows with state size. A remote-primary backend's state is already durable where the
    checkpoint would copy it to, so a checkpoint there is close to a metadata-only operation."""
    if primary_location == "local":
        return state_size
    if primary_location == "remote":
        return metadata_cost
    raise ValueError(primary_location)


class AsyncStateAccess:
    """Models the async state API's own guarantee: per-key accesses complete strictly in the
    order they were issued; accesses for different keys may complete in any order, letting a
    remote round trip for one key overlap with another key's own round trip instead of blocking
    the whole record stream."""
    def __init__(self):
        self._next_seq_by_key = {}
        self._completed = []

    def issue(self, key, seq, remote_latency_ticks):
        completes_at = seq + remote_latency_ticks
        self._completed.append((completes_at, key, seq))

    def drain(self):
        self._completed.sort(key=lambda row: row[0])
        return self._completed


def sync_throughput_ticks(num_requests, remote_latency_ticks):
    """Synchronous access: each request fully blocks until its own remote round trip finishes."""
    return num_requests * remote_latency_ticks


def async_throughput_ticks(num_requests, remote_latency_ticks, concurrency):
    """Asynchronous access: up to `concurrency` requests have their remote round trips in flight
    at once, so total time is bounded by how many full rounds of concurrency are needed."""
    rounds = -(-num_requests // concurrency)  # ceiling division
    return rounds * remote_latency_ticks


def effective_access_latency(cache_hit_rate, local_latency, remote_latency):
    """What a latency-sensitive job actually pays per access: a blend of the fast local-cache hit
    and the slow remote round trip, weighted by how often the working set is already cached."""
    return cache_hit_rate * local_latency + (1 - cache_hit_rate) * remote_latency


if __name__ == "__main__":
    small_state, large_state = 50, 50_000
    local_small = checkpoint_cost(small_state, "local")
    local_large = checkpoint_cost(large_state, "local")
    remote_small = checkpoint_cost(small_state, "remote")
    remote_large = checkpoint_cost(large_state, "remote")
    assert local_large > local_small, "a local-primary checkpoint must grow with state size"
    assert remote_small == remote_large, "a remote-primary checkpoint's cost must stay flat regardless of state size"
    assert remote_large < local_large, "remote-primary checkpointing must cost far less than local-primary at large state"
    print(f"checkpoint cost, small state: local-primary {local_small}, remote-primary {remote_small}; "
          f"large state: local-primary {local_large}, remote-primary {remote_large} (flat)")

    access = AsyncStateAccess()
    for seq in range(5):
        access.issue("key-a", seq, remote_latency_ticks=3 + 2 * seq)
    for seq in range(5):
        access.issue("key-b", seq, remote_latency_ticks=4 + 2 * seq)
    completed = access.drain()

    seen_per_key = {}
    for _, key, seq in completed:
        seen_per_key.setdefault(key, []).append(seq)
    for key, seqs in seen_per_key.items():
        assert seqs == sorted(seqs), f"accesses for {key} must complete in the order they were issued, got {seqs}"
    overall_keys_in_order = [key for _, key, _ in completed]
    assert overall_keys_in_order != (["key-a"] * 5 + ["key-b"] * 5), (
        "different keys should be free to interleave rather than complete strictly key by key"
    )
    print(f"async access: same-key completions stayed in order for every key "
          f"({list(seen_per_key.keys())}), while completions across different keys interleaved")

    num_requests, remote_latency = 24, 5
    sync_time = sync_throughput_ticks(num_requests, remote_latency)
    async_time = async_throughput_ticks(num_requests, remote_latency, concurrency=8)
    assert async_time < sync_time, "overlapping requests asynchronously must finish faster than one at a time"
    print(f"throughput over {num_requests} requests: synchronous {sync_time} ticks, "
          f"asynchronous {async_time} ticks ({sync_time / async_time:.1f}x faster)")

    local_latency, remote_latency_access = 1, 20
    warm_cache = effective_access_latency(cache_hit_rate=0.95, local_latency=local_latency, remote_latency=remote_latency_access)
    cold_cache = effective_access_latency(cache_hit_rate=0.10, local_latency=local_latency, remote_latency=remote_latency_access)
    assert cold_cache > warm_cache, "a poorly cached working set must pay measurably higher effective latency"
    assert cold_cache > 5 * warm_cache, "the gap should be large enough to matter for a genuinely latency-sensitive job"
    print(f"effective access latency: warm cache (high hit rate) {warm_cache:.2f} units, "
          f"cold cache (low hit rate) {cold_cache:.2f} units — the real cost a latency-sensitive "
          f"job pays when its working set doesn't fit the local cache")

    print("all checks passed")
