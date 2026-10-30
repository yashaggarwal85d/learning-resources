import math
import random


def simulate_arrivals(seed=42, n=300, window_s=7200):
    """A Poisson arrival process for the shop's `orders` stream: n orders over a two-hour
    (7200 second) window, same mean rate regardless of how the stream is later consumed. The
    three ingestion modes below are the same arrivals cut three different ways, not three
    different streams (the reel's own hook)."""
    rng = random.Random(seed)
    t = 0.0
    arrivals = []
    mean_gap = window_s / n
    while len(arrivals) < n:
        t += rng.expovariate(1.0 / mean_gap)
        arrivals.append(t)
    return arrivals


def delivery_delay(arrivals, interval_s):
    """A poll every `interval_s`: an order that arrives at time t is delivered at the next poll
    boundary after t (ceil(t / interval) * interval). This is the mechanism, not an adjective:
    the same ceil-to-boundary rule applied at three different interval sizes."""
    delays = []
    for t in arrivals:
        delivered_at = math.ceil(t / interval_s) * interval_s
        delays.append(delivered_at - t)
    return delays


def batch_vs_microbatch_vs_streaming():
    arrivals = simulate_arrivals()

    # Batch: one pull an hour (the reel's "hourly cron"). Micro-batch: one pull every 30 seconds.
    # Streaming: a continuous consumer, modelled at the simulation's own 1-second resolution
    # (disclosed: not literally zero latency, but far finer than a scheduled pull).
    batch_delays = delivery_delay(arrivals, 3600)
    micro_delays = delivery_delay(arrivals, 30)
    stream_delays = delivery_delay(arrivals, 1)

    batch_avg = sum(batch_delays) / len(batch_delays)
    micro_avg = sum(micro_delays) / len(micro_delays)
    stream_avg = sum(stream_delays) / len(stream_delays)
    batch_max = max(batch_delays)
    micro_max = max(micro_delays)
    stream_max = max(stream_delays)

    assert batch_max <= 3600, f"a single hourly poll must deliver within one interval, got {batch_max}"
    assert micro_max <= 30, f"a 30s poll must deliver within one interval, got {micro_max}"
    assert stream_max <= 1, f"a 1s poll must deliver within one interval, got {stream_max}"
    assert batch_avg > micro_avg > stream_avg, (
        f"expected avg delay to shrink as the interval shrinks, got batch={batch_avg} micro={micro_avg} stream={stream_avg}"
    )

    # One specific order, the row the reel's figure follows: the 151st arrival in the stream
    # (arbitrary but fixed, inside the window, not the first or last event).
    example_index = 150
    example_arrival = arrivals[example_index]
    example_batch_delay = batch_delays[example_index]
    example_micro_delay = micro_delays[example_index]
    example_stream_delay = stream_delays[example_index]
    assert example_batch_delay >= example_micro_delay >= example_stream_delay, (
        "expected the one example row to wait longest under batch and least under streaming"
    )

    print(
        f"one order, arriving at t={example_arrival:.1f}s into the window: "
        f"batch delivers it {example_batch_delay:.1f}s later, "
        f"micro-batch {example_micro_delay:.1f}s later, "
        f"streaming {example_stream_delay:.1f}s later"
    )
    print(
        f"across all {len(arrivals)} orders: average end-to-end delay is "
        f"batch={batch_avg:.1f}s, micro-batch={micro_avg:.1f}s, streaming={stream_avg:.1f}s"
    )
    return {
        "example_arrival": example_arrival,
        "example_batch_delay": example_batch_delay,
        "example_micro_delay": example_micro_delay,
        "example_stream_delay": example_stream_delay,
        "batch_avg": batch_avg,
        "micro_avg": micro_avg,
        "stream_avg": stream_avg,
    }


def burst_size_per_delivery():
    """The cost axis: how many rows arrive together at one delivery tick, on average, is the
    batch size downstream code must absorb. Batch: the whole window's rows in one tick.
    Micro-batch: a handful. Streaming: close to one row per tick, or none."""
    arrivals = simulate_arrivals()
    n = len(arrivals)
    window_s = arrivals[-1]
    ticks_batch = max(1, math.ceil(window_s / 3600))
    ticks_micro = max(1, math.ceil(window_s / 30))
    ticks_stream = max(1, math.ceil(window_s / 1))

    rows_per_tick_batch = n / ticks_batch
    rows_per_tick_micro = n / ticks_micro
    rows_per_tick_stream = n / ticks_stream

    assert rows_per_tick_batch > rows_per_tick_micro > rows_per_tick_stream, (
        f"expected burst size to shrink as the interval shrinks, got "
        f"batch={rows_per_tick_batch} micro={rows_per_tick_micro} stream={rows_per_tick_stream}"
    )
    print(
        f"rows handled per delivery tick: batch={rows_per_tick_batch:.1f}, "
        f"micro-batch={rows_per_tick_micro:.2f}, streaming={rows_per_tick_stream:.3f}"
    )
    return rows_per_tick_batch, rows_per_tick_micro, rows_per_tick_stream


def moving_parts_by_mode():
    """The complexity axis: a fixed architectural count, not a benchmark (disclosed in
    pre-notes/post-notes as such). Batch: one scheduled job. Micro-batch: a scheduler plus a
    durable checkpoint of how far it got (topic 6's own idea, named here only as a part count).
    Streaming (pull, Kafka's own design, SOURCES.md): a broker, a consumer group holding its own
    offset, and the backpressure the pull model buys over a naive push (SOURCES.md, Kafka Design:
    Push vs. pull)."""
    parts = {
        "batch": ["a scheduled job (the cron)"],
        "micro_batch": ["a scheduler", "a durable checkpoint of the last position read"],
        "streaming": ["a broker", "a consumer group", "the consumer's own committed offset"],
    }
    assert len(parts["batch"]) == 1
    assert len(parts["micro_batch"]) == 2
    assert len(parts["streaming"]) == 3
    print(
        f"moving parts: batch={len(parts['batch'])}, "
        f"micro-batch={len(parts['micro_batch'])}, streaming={len(parts['streaming'])}"
    )
    return {k: len(v) for k, v in parts.items()}


def main():
    batch_vs_microbatch_vs_streaming()
    burst_size_per_delivery()
    moving_parts_by_mode()
    print("ingestion-modes-push-vs examples: all checks pass")


if __name__ == "__main__":
    main()
