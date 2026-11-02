"""Hybrid connectivity, egress and latency — worked examples.

Disclosed simulations (no root/network-namespace access in this sandbox, see OUTLINE.md):
- The bandwidth-delay-product demo injects an artificial per-chunk delay instead of real
  tc/netem traffic shaping. The result shape (parallel streams beat one stream on a delayed
  link) matches the real mechanism described in SOURCES.md.
- The WAN-failure drill uses a local, in-process queue standing in for the WAN link and
  MirrorMaker 2's buffering behaviour, exactly as CHAPTER.md's Lab description specifies.

SAP Note 3255746 (topic 19) and the 13 February 2025 Databricks/SAP partnership date are
reused by reference only, not re-quoted here.
"""

import queue
import threading
import time


# ---------------------------------------------------------------------------
# 1. Bandwidth-delay product
# ---------------------------------------------------------------------------

def bandwidth_delay_product_bits(bandwidth_bps, round_trip_seconds):
    """BDP = bandwidth (bits/sec) * round-trip delay (sec), in bits in flight."""
    return bandwidth_bps * round_trip_seconds


def bdp_worked_example():
    # A 10 Gbps dedicated interconnect, 40 ms round trip Germany <-> an EU region.
    bandwidth_bps = 10_000_000_000
    rtt_seconds = 0.040
    bdp_bits = bandwidth_delay_product_bits(bandwidth_bps, rtt_seconds)
    bdp_bytes = bdp_bits / 8
    # The classic TCP window-scale ceiling is 65,535 bytes unscaled.
    unscaled_window_bytes = 65_535
    return {
        "bdp_bytes": bdp_bytes,
        "unscaled_window_bytes": unscaled_window_bytes,
        "unscaled_window_is_insufficient": unscaled_window_bytes < bdp_bytes,
    }


# ---------------------------------------------------------------------------
# 2. Single-stream vs parallel-streams throughput over a latency-shaped link
# ---------------------------------------------------------------------------

class LatencyShapedLink:
    """A disclosed stand-in for a real WAN link: each chunk send sleeps for the
    link's configured one-way delay before the byte count is credited, simulating
    a link where throughput is gated by how much data can be in flight at once
    (the real mechanism tc/netem would enforce at the kernel level)."""

    def __init__(self, one_way_delay_seconds, max_in_flight_chunks):
        self.one_way_delay_seconds = one_way_delay_seconds
        self.max_in_flight_chunks = max_in_flight_chunks
        self._in_flight = threading.Semaphore(max_in_flight_chunks)

    def send_chunk(self, chunk_bytes):
        self._in_flight.acquire()
        try:
            time.sleep(self.one_way_delay_seconds)
            return chunk_bytes
        finally:
            self._in_flight.release()


def throughput_single_stream(link, chunk_bytes, chunk_count):
    start = time.monotonic()
    total = 0
    for _ in range(chunk_count):
        total += link.send_chunk(chunk_bytes)
    elapsed = time.monotonic() - start
    return total / elapsed


def throughput_parallel_streams(link, chunk_bytes, chunk_count, stream_count):
    start = time.monotonic()
    totals = [0] * stream_count
    per_stream = chunk_count // stream_count

    def worker(i):
        t = 0
        for _ in range(per_stream):
            t += link.send_chunk(chunk_bytes)
        totals[i] = t

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(stream_count)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    elapsed = time.monotonic() - start
    return sum(totals) / elapsed


def single_vs_parallel_worked_example():
    # A link that can hold 8 chunks in flight at once, each incurring a 5 ms one-way delay.
    link = LatencyShapedLink(one_way_delay_seconds=0.005, max_in_flight_chunks=8)
    chunk_bytes = 64_000
    chunk_count = 64

    single = throughput_single_stream(link, chunk_bytes, chunk_count)
    parallel = throughput_parallel_streams(link, chunk_bytes, chunk_count, stream_count=8)
    return {
        "single_stream_bytes_per_sec": single,
        "parallel_streams_bytes_per_sec": parallel,
        "parallel_beats_single": parallel > single,
    }


# ---------------------------------------------------------------------------
# 3. Latency budget allocation
# ---------------------------------------------------------------------------

def latency_budget_remaining(end_to_end_budget_ms, wan_hop_latency_ms, fixed_overhead_ms):
    """Given a near-real-time SLO, how much is left for processing after the WAN
    hop and any fixed overhead (e.g. a known queueing/serialisation cost)."""
    remaining = end_to_end_budget_ms - wan_hop_latency_ms - fixed_overhead_ms
    return max(remaining, 0)


def latency_budget_worked_example():
    # A near-real-time OEE dashboard SLO: 2000 ms end to end.
    oee_budget = latency_budget_remaining(
        end_to_end_budget_ms=2000, wan_hop_latency_ms=40, fixed_overhead_ms=160
    )
    # A tighter alerting SLO on the same link leaves much less processing room.
    alerting_budget = latency_budget_remaining(
        end_to_end_budget_ms=500, wan_hop_latency_ms=40, fixed_overhead_ms=160
    )
    return {
        "oee_processing_budget_ms": oee_budget,
        "alerting_processing_budget_ms": alerting_budget,
        "oee_has_more_room": oee_budget > alerting_budget,
    }


# ---------------------------------------------------------------------------
# 4. Data-gravity decision rule (reusing topic 21's classification, applied here
#    as "where should compute live" rather than "should we be on-prem at all")
# ---------------------------------------------------------------------------

def compute_location_decision(data_volume_tb, wan_egress_cost_per_tb, compute_migration_cost):
    """If moving the data to the cloud (egress, repeated) would cost more than
    moving the compute to the data once, compute should live where the data is."""
    moving_data_cost = data_volume_tb * wan_egress_cost_per_tb
    return "on_prem_compute" if moving_data_cost > compute_migration_cost else "cloud_compute"


def compute_location_worked_example():
    # The plant's steady-state historian export: large, recurring, on-prem data.
    plant_decision = compute_location_decision(
        data_volume_tb=50, wan_egress_cost_per_tb=90, compute_migration_cost=2000
    )
    # A small, one-off reporting extract: cheap to move once.
    reporting_decision = compute_location_decision(
        data_volume_tb=0.2, wan_egress_cost_per_tb=90, compute_migration_cost=2000
    )
    return {"plant_decision": plant_decision, "reporting_decision": reporting_decision}


# ---------------------------------------------------------------------------
# 5. WAN-failure buffered-catch-up drill (the chapter's closing lab mechanism)
# ---------------------------------------------------------------------------

class WanLinkStandIn:
    """A local queue standing in for the WAN link and MirrorMaker 2's own
    buffering behaviour (per CHAPTER.md's own Lab description). While "up," a
    put() is delivered immediately; while "down," puts are held in an
    unbounded local backlog and delivered, in order, only once the link comes
    back up and drain() is called."""

    def __init__(self):
        self.up = True
        self._delivered = queue.Queue()
        self._backlog = []

    def send(self, record):
        if self.up:
            self._delivered.put(record)
        else:
            self._backlog.append(record)

    def cut(self):
        self.up = False

    def restore(self):
        self.up = True
        for record in self._backlog:
            self._delivered.put(record)
        self._backlog = []

    def drain_delivered(self):
        out = []
        while not self._delivered.empty():
            out.append(self._delivered.get())
        return out


def wan_failure_drill():
    link = WanLinkStandIn()
    sent = []

    def send_batch(n, start_id):
        ids = list(range(start_id, start_id + n))
        for i in ids:
            record = {"id": i, "region": "eu" if i % 2 == 0 else "us"}
            link.send(record)
            sent.append(record)
        return ids

    # Before the outage: 10 records flow through immediately.
    send_batch(10, start_id=0)

    # The WAN link is cut for a simulated four-hour maintenance window. The
    # producer keeps writing — MirrorMaker 2's documented buffering behaviour —
    # instead of blocking on the source.
    link.cut()
    send_batch(5, start_id=10)

    # The link is restored; the buffered backlog drains in order.
    link.restore()

    delivered = link.drain_delivered()

    return {
        "sent_count": len(sent),
        "delivered_count": len(delivered),
        "no_loss": len(delivered) == len(sent),
        "no_duplication": len(delivered) == len({r["id"] for r in delivered}),
        "order_preserved": [r["id"] for r in delivered] == sorted(r["id"] for r in delivered),
    }


if __name__ == "__main__":
    bdp = bdp_worked_example()
    assert bdp["unscaled_window_is_insufficient"] is True

    throughput = single_vs_parallel_worked_example()
    assert throughput["parallel_beats_single"] is True

    budgets = latency_budget_worked_example()
    assert budgets["oee_has_more_room"] is True

    location = compute_location_worked_example()
    assert location["plant_decision"] == "on_prem_compute"
    assert location["reporting_decision"] == "cloud_compute"

    drill = wan_failure_drill()
    assert drill["sent_count"] == 15
    assert drill["delivered_count"] == 15
    assert drill["no_loss"] is True
    assert drill["no_duplication"] is True
    assert drill["order_preserved"] is True

    print("All worked examples passed.")
    print(bdp)
    print(throughput)
    print(budgets)
    print(location)
    print(drill)
