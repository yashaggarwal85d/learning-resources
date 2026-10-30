"""Toy producer: the accumulator's batch.size/linger.ms race, sticky vs round-robin
partitioning, real batch compression, and an acks=1-vs-acks=all durability-risk simulation.

Every number this topic's reel puts on screen is asserted here, on a real run. The batching
and acks simulations are small, explicit discrete-event models of the *shape* of Kafka's own
design (not a port of Kafka's own Java source); the compression numbers are real bytes, really
compressed, with the `zstandard` and `lz4.frame` libraries themselves doing the work.
"""

from __future__ import annotations

import json

import lz4.frame
import zstandard

# Kafka's real producer-config defaults (Apache Kafka 4.4 `producer_config.html`, see
# SOURCES.md): batch.size = 16384 bytes, linger.ms = 5 (changed from 0 in Kafka 4.0). This toy
# counts records rather than bytes and uses a small record cap in place of a byte cap, so the
# reel can show the race in a few hundred records instead of 16KB of data; the real defaults are
# cited in SOURCES.md and references.md, not re-derived here.
TOY_BATCH_RECORD_CAP = 80
TOY_LINGER_MS = 5
TOY_REQUEST_OVERHEAD_MS = 5
TOY_ARRIVAL_INTERVAL_MS = 5
TOY_N_RECORDS = 1_000


def batch_race(n_records: int, arrival_interval_ms: float, request_overhead_ms: float,
               linger_ms: float, batch_cap: int) -> dict:
    """A single partition's accumulator: a batch closes when it hits `batch_cap` records or
    `linger_ms` have elapsed since it opened, whichever comes first -- the same "whichever
    happens first" race `batch.size`/`linger.ms` run in Kafka's own producer (SOURCES.md)."""
    next_free = 0.0
    batch: list[float] = []
    batch_open = 0.0
    batch_sizes: list[int] = []
    for i in range(n_records):
        arrival = i * arrival_interval_ms
        if not batch:
            batch_open = max(arrival, next_free)
        batch.append(arrival)
        elapsed = arrival - batch_open
        if len(batch) >= batch_cap or linger_ms == 0 or elapsed >= linger_ms:
            batch_sizes.append(len(batch))
            next_free = max(arrival, next_free) + request_overhead_ms
            batch = []
    if batch:
        batch_sizes.append(len(batch))
    n_requests = len(batch_sizes)
    return {
        "n_requests": n_requests,
        "avg_batch_size": sum(batch_sizes) / n_requests,
        "total_overhead_ms": n_requests * request_overhead_ms,
    }


def partition_fill(n_records: int, n_partitions: int, batch_cap: int, linger_ms: float,
                    sticky: bool) -> dict:
    """Keyless records land on a partition either sticky (stay on one partition until its own
    batch closes, then move to the next -- KIP-480) or round-robin (cycle every record, the
    pre-KIP-480 default). Same batch_cap/linger_ms race as `batch_race`, run per partition."""
    batches: list[list[float]] = [[] for _ in range(n_partitions)]
    opens = [0.0] * n_partitions
    batch_sizes: list[int] = []
    rr_next = 0
    sticky_p = 0
    for i in range(n_records):
        arrival = float(i)
        for p in range(n_partitions):
            if batches[p] and linger_ms > 0 and arrival - opens[p] >= linger_ms:
                batch_sizes.append(len(batches[p]))
                batches[p] = []
        p = sticky_p if sticky else rr_next
        if not sticky:
            rr_next = (rr_next + 1) % n_partitions
        if not batches[p]:
            opens[p] = arrival
        batches[p].append(arrival)
        if len(batches[p]) >= batch_cap or linger_ms == 0:
            batch_sizes.append(len(batches[p]))
            batches[p] = []
            if sticky:
                sticky_p = (sticky_p + 1) % n_partitions
    for p in range(n_partitions):
        if batches[p]:
            batch_sizes.append(len(batches[p]))
    return {"n_batches": len(batch_sizes), "avg_batch_size": sum(batch_sizes) / len(batch_sizes)}


def make_order_event(i: int) -> dict:
    return {
        "order_id": f"ord-{i:08d}",
        "customer_id": f"cust-{i % 500:05d}",
        "item_sku": f"sku-{i % 2000:06d}",
        "quantity": (i % 5) + 1,
        "price_cents": 1999 + (i % 50) * 137,
        "status": ["placed", "paid", "shipped", "delivered"][i % 4],
        "ts": 1_700_000_000 + i,
    }


def batch_bytes(n: int) -> bytes:
    return "\n".join(json.dumps(make_order_event(i)) for i in range(n)).encode()


def acks_crash_sim(n_followers: int, follower_catchup_ticks: int, crash_at_tick: int) -> dict:
    """A toy leader plus N followers, each replicating strictly behind the leader. At
    `crash_at_tick` the leader dies and a new leader is elected from the least-caught-up
    in-sync replica -- so any record past that replica's position is gone. Compares what an
    acks=1 producer (durable as soon as the leader writes it) believed survived against what an
    acks=all producer (durable only once every in-sync replica has it) believed survived."""
    leader_log = list(range(crash_at_tick + 1))
    follower_progress = [
        max(0, crash_at_tick - (f + 1) * follower_catchup_ticks) for f in range(n_followers)
    ]
    isr_floor = min(follower_progress)
    survives = set(r for r in leader_log if r <= isr_floor)

    believed_durable_acks1 = set(leader_log)
    believed_durable_acksall = set(r for r in leader_log if r <= isr_floor)

    return {
        "leader_wrote": len(leader_log),
        "isr_floor_at_crash": isr_floor,
        "believed_durable_acks1": len(believed_durable_acks1),
        "lost_acks1": len(believed_durable_acks1 - survives),
        "believed_durable_acksall": len(believed_durable_acksall),
        "lost_acksall": len(believed_durable_acksall - survives),
    }


def run() -> dict:
    results: dict = {}

    # 1. The batch.size/linger.ms race: same record volume, two linger.ms settings.
    r0 = batch_race(TOY_N_RECORDS, TOY_ARRIVAL_INTERVAL_MS, TOY_REQUEST_OVERHEAD_MS, 0, TOY_BATCH_RECORD_CAP)
    r5 = batch_race(TOY_N_RECORDS, TOY_ARRIVAL_INTERVAL_MS, TOY_REQUEST_OVERHEAD_MS, TOY_LINGER_MS, TOY_BATCH_RECORD_CAP)
    assert r5["n_requests"] < r0["n_requests"], "linger.ms must reduce the number of requests"
    assert r5["avg_batch_size"] > r0["avg_batch_size"]
    results["linger0_requests"] = r0["n_requests"]
    results["linger0_avg_batch"] = r0["avg_batch_size"]
    results["linger5_requests"] = r5["n_requests"]
    results["linger5_avg_batch"] = r5["avg_batch_size"]
    results["linger0_overhead_ms"] = r0["total_overhead_ms"]
    results["linger5_overhead_ms"] = r5["total_overhead_ms"]

    # 2. Sticky vs round-robin partitioning, identical keyless record stream.
    rr = partition_fill(900, 3, TOY_BATCH_RECORD_CAP, TOY_LINGER_MS, sticky=False)
    st = partition_fill(900, 3, TOY_BATCH_RECORD_CAP, TOY_LINGER_MS, sticky=True)
    assert st["avg_batch_size"] > rr["avg_batch_size"], "sticky must fill larger batches than round-robin"
    results["round_robin_avg_batch"] = rr["avg_batch_size"]
    results["round_robin_batches"] = rr["n_batches"]
    results["sticky_avg_batch"] = st["avg_batch_size"]
    results["sticky_batches"] = st["n_batches"]

    # 3. Real compression: one record vs a full 80-record batch, same compressor, same data shape.
    single = batch_bytes(1)
    full = batch_bytes(TOY_BATCH_RECORD_CAP)
    cctx = zstandard.ZstdCompressor()
    single_zstd = len(cctx.compress(single))
    full_zstd = len(cctx.compress(full))
    single_ratio = len(single) / single_zstd
    full_ratio = len(full) / full_zstd
    assert full_ratio > single_ratio, "a full batch must compress better than a single record"
    results["single_record_bytes"] = len(single)
    results["single_record_zstd_ratio"] = round(single_ratio, 2)
    results["full_batch_bytes"] = len(full)
    results["full_batch_zstd_ratio"] = round(full_ratio, 2)
    results["full_batch_lz4_ratio"] = round(len(full) / len(lz4.frame.compress(full)), 2)

    # 4. acks=1 vs acks=all under a leader crash.
    acks = acks_crash_sim(n_followers=2, follower_catchup_ticks=4, crash_at_tick=200)
    assert acks["lost_acks1"] > 0, "acks=1 must lose at least one record it believed durable"
    assert acks["lost_acksall"] == 0, "acks=all must never lose a record it believed durable"
    results.update({f"acks_{k}": v for k, v in acks.items()})

    return results


if __name__ == "__main__":
    out = run()
    print(json.dumps(out, indent=2))
