# This topic's engine of record is the estimate chain itself plus one real measurement (the
# warehouse scan rate, run directly against DuckDB — CHAPTER.md: "warehouse scan rates ... stated
# as the builder measures them on the sandbox's DuckDB or Postgres, never as a quoted vendor
# figure"). The shop constants fixed here are reused by every later design topic in this chapter
# (CHAPTER.md's own shared-constants table).

ORDERS_PER_DAY = 2_000_000          # the hook's own number
PEAK_TO_AVERAGE = 5                 # the hook's own number
EVENTS_PER_ORDER = 10               # the hook's own number ("ten clicks per order")
BYTES_PER_EVENT = 500               # a modest JSON clickstream event
REPLICATION_FACTOR = 3              # the hook's own number ("three-way replication")
COMPACTION_OVERHEAD = 1.3           # illustrative write-amplification multiplier, not a measured one
RETENTION_DAYS = 90                 # hot/queryable retention for events; topic 4 adds warm/cold tiers
SECONDS_PER_DAY = 86_400


def capacity_chain():
    events_per_day = ORDERS_PER_DAY * EVENTS_PER_ORDER
    mean_order_rate = ORDERS_PER_DAY / SECONDS_PER_DAY
    mean_event_rate = events_per_day / SECONDS_PER_DAY
    design_rate = mean_event_rate * PEAK_TO_AVERAGE
    bytes_per_day = events_per_day * BYTES_PER_EVENT
    storage_before_overhead = bytes_per_day * RETENTION_DAYS
    storage_bytes = storage_before_overhead * REPLICATION_FACTOR * COMPACTION_OVERHEAD
    return {
        "events_per_day": events_per_day,
        "mean_order_rate": mean_order_rate,
        "mean_event_rate": mean_event_rate,
        "design_rate": design_rate,
        "bytes_per_day": bytes_per_day,
        "storage_bytes": storage_bytes,
    }


def little_s_law_sizing(design_rate, processing_seconds=2.0, per_consumer_capacity=50):
    # L = lambda * W: the average number of events in flight at any instant.
    in_flight = design_rate * processing_seconds
    consumers_needed = -(-in_flight // per_consumer_capacity)  # ceiling division
    return {"in_flight": in_flight, "consumers_needed": int(consumers_needed)}


# --- A real measurement: this sandbox's own DuckDB, summing a column over real rows ------------
def measure_warehouse_scan_rate(row_count=20_000_000):
    import time
    import duckdb

    con = duckdb.connect()
    con.execute(f"CREATE TABLE t AS SELECT (range % 1000)::BIGINT AS v FROM range({row_count})")
    t0 = time.perf_counter()
    con.execute("SELECT SUM(v) FROM t").fetchall()
    elapsed = time.perf_counter() - t0
    con.close()
    return row_count / elapsed


# --- Reference numbers, each with its own stated ceiling -----------------------------------------
REFERENCE_NUMBERS = [
    {
        "name": "Kafka single-producer throughput (no replication)",
        "value": "about eight hundred thousand records a second",
        "source": "LinkedIn, 27 April 2014, three six-core machines with spinning disks",
        "is_not": "a planning figure for current hardware or any specific cluster",
    },
    {
        "name": "S3 per-prefix request floor",
        "value": "at least thirty-five hundred writes or fifty-five hundred reads a second, per prefix",
        "source": "AWS S3 documentation, current",
        "is_not": "a hard ceiling — more prefixes parallelize further",
    },
    {
        "name": "warehouse scan rate",
        "value": "measured directly against this machine's own DuckDB",
        "source": "examples.py, run on this sandbox",
        "is_not": "a promise about any real warehouse's disk-backed performance",
    },
]


def wrong_vs_right_use_of_reference_number():
    wrong = "our cluster will do eight hundred thousand events a second"
    right = "a single partition will not bottleneck us at our own design rate, which is far below it"
    return wrong, right


def check():
    chain = capacity_chain()
    assert round(chain["mean_order_rate"], 2) == 23.15
    assert chain["events_per_day"] == 20_000_000
    assert round(chain["design_rate"], 1) == 1157.4
    assert chain["bytes_per_day"] == 10_000_000_000
    assert round(chain["storage_bytes"] / 1e12, 2) == 3.51

    sizing = little_s_law_sizing(chain["design_rate"])
    assert round(sizing["in_flight"], 1) == 2314.8
    assert sizing["consumers_needed"] == 47

    rate = measure_warehouse_scan_rate(row_count=2_000_000)
    assert rate > 1_000_000  # sanity: a real in-memory scan is fast; not asserting a precise figure

    assert len(REFERENCE_NUMBERS) == 3
    assert all("is_not" in r for r in REFERENCE_NUMBERS)

    wrong, right = wrong_vs_right_use_of_reference_number()
    assert wrong != right

    print("back-envelope-capacity-estimation examples: all numbers check out")


if __name__ == "__main__":
    check()
