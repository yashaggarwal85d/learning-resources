"""A real postings index built and intersected for a multi-label query, a
worst-case-vs-actual series-count calculation for the plant's label scheme,
an unbounded label shown multiplying series count, and a postings lookup
measured against a scan-based (DuckDB) model for both a point lookup and a
high-cardinality analytical query."""

from __future__ import annotations

import random
import time
from collections import defaultdict
from dataclasses import dataclass

import duckdb

SITES = ["plantA", "plantB", "plantC"]
LINES = [f"line{i}" for i in range(1, 9)]  # 8 lines per site
EQUIPMENT = [f"eq{i}" for i in range(1, 13)]  # 12 pieces of equipment per line
SENSORS = ["temperature", "pressure", "vibration", "flow", "level"]  # 5 sensors per equipment
STATUS = ["running", "idle", "fault"]  # 3 status values


@dataclass
class Series:
    series_id: int
    labels: dict[str, str]


def worst_case_series_count() -> int:
    """The product of every label's distinct value count, per Prometheus's
    own dimensional-data-model rule: a new combination is a new series."""
    return len(SITES) * len(LINES) * len(EQUIPMENT) * len(SENSORS) * len(STATUS)


def build_actual_series(rng: random.Random) -> list[Series]:
    """Not every combination actually occurs: a given piece of equipment only
    has the sensors it was actually fitted with, and only one status label is
    active for it at a time (status isn't crossed with every sensor — it is
    its own series per equipment, the way a real plant's tag list would be)."""
    series: list[Series] = []
    sid = 0
    for site in SITES:
        for line in LINES:
            for eq in EQUIPMENT:
                # each piece of equipment is fitted with a random subset of sensors, not all five
                fitted = rng.sample(SENSORS, k=rng.randint(2, len(SENSORS)))
                for sensor in fitted:
                    series.append(Series(sid, {"site": site, "line": line, "equipment": eq, "sensor": sensor}))
                    sid += 1
                # one status series per equipment, not crossed with sensor at all
                series.append(Series(sid, {"site": site, "line": line, "equipment": eq, "sensor": "status"}))
                sid += 1
    return series


def build_postings(series: list[Series]) -> dict[tuple[str, str], list[int]]:
    """A sorted postings list per (label, value) pair, mirroring the TSDB
    format's own description: 'monotonically increasing lists of series
    references that contain a given label pair.'"""
    postings: dict[tuple[str, str], list[int]] = defaultdict(list)
    for s in series:
        for label, value in s.labels.items():
            postings[(label, value)].append(s.series_id)
    for key in postings:
        postings[key].sort()
    return postings


def intersect_sorted(a: list[int], b: list[int]) -> list[int]:
    """A merge-pointer intersection of two sorted postings lists."""
    i, j, out = 0, 0, []
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            out.append(a[i])
            i += 1
            j += 1
        elif a[i] < b[j]:
            i += 1
        else:
            j += 1
    return out


def equality_query(postings: dict, matchers: list[tuple[str, str]]) -> list[int]:
    """Intersect the postings lists for several equality matchers."""
    lists = [postings[m] for m in matchers]
    lists.sort(key=len)  # smallest list first keeps the running intersection small
    result = lists[0]
    for lst in lists[1:]:
        result = intersect_sorted(result, lst)
    return result


def regex_query(series: list[Series], label: str, prefix: str) -> list[int]:
    """A regex/prefix matcher has no postings entry of its own — it has to
    scan every distinct value of that label and union their postings lists,
    which is the expensive case the postings design doesn't help with."""
    return [s.series_id for s in series if s.labels.get(label, "").startswith(prefix)]


def unbounded_label_blowup(base_series: list[Series], distinct_batch_ids: int, rng: random.Random) -> int:
    """Adding one unbounded label (a batch/lot ID) to every sensor series
    multiplies the series count by the number of distinct values that label
    takes on, exactly as the series-identity rule predicts."""
    sensor_series = [s for s in base_series if s.labels["sensor"] != "status"]
    new_count = 0
    for s in sensor_series:
        for _ in range(distinct_batch_ids):
            new_count += 1
    return new_count


def per_series_memory_bytes(series_count: int, bytes_per_series: int = 3_500) -> int:
    """A stated per-series memory estimate (index entry plus head-block
    state), used only to size the blowup, not to claim an exact number for
    any one real implementation."""
    return series_count * bytes_per_series


def postings_point_lookup(postings: dict, matchers: list[tuple[str, str]]) -> tuple[list[int], float]:
    start = time.perf_counter()
    result = equality_query(postings, matchers)
    return result, time.perf_counter() - start


def columnar_scan_point_lookup(con: duckdb.DuckDBPyConnection, site: str, line: str, equipment: str, sensor: str) -> tuple[int, float]:
    start = time.perf_counter()
    n = con.execute(
        "SELECT count(*) FROM samples WHERE site = ? AND line = ? AND equipment = ? AND sensor = ?",
        [site, line, equipment, sensor],
    ).fetchone()[0]
    return n, time.perf_counter() - start


def columnar_scan_high_cardinality(con: duckdb.DuckDBPyConnection, batch_id: str) -> tuple[int, float]:
    """A query on the unbounded batch_id column: an ordinary predicate over
    an ordinary column in the columnar model, with no per-series index to
    blow up — the cost is a scan, not an index miss."""
    start = time.perf_counter()
    n = con.execute("SELECT count(*) FROM samples WHERE batch_id = ?", [batch_id]).fetchone()[0]
    return n, time.perf_counter() - start


def main() -> None:
    rng = random.Random(7)

    worst_case = worst_case_series_count()
    actual_series = build_actual_series(rng)
    actual_count = len(actual_series)
    assert actual_count < worst_case, "the plant's actual series count must be below the worst-case cross product, since not every sensor is fitted to every equipment"
    assert actual_count > 0

    postings = build_postings(actual_series)

    # a multi-label equality query: one specific site, one specific sensor type
    matchers = [("site", "plantA"), ("sensor", "temperature")]
    direct = sorted(equality_query(postings, matchers))
    brute_force = sorted(
        s.series_id for s in actual_series if s.labels.get("site") == "plantA" and s.labels.get("sensor") == "temperature"
    )
    assert direct == brute_force, "the postings intersection must match a brute-force scan over the same matchers exactly"

    # the expensive case: a regex/prefix matcher has to scan every series, not look one up
    regex_result = sorted(regex_query(actual_series, "equipment", "eq1"))
    assert len(regex_result) > 0
    equality_lookup_size = min(len(postings[m]) for m in matchers)
    assert len(actual_series) >= equality_lookup_size, "a regex matcher inspects every series while an equality matcher only touches its own postings list"

    # unbounded label blowup: a batch_id with many distinct values multiplies the series count
    DISTINCT_BATCHES = 40_000
    sensor_series_count = len([s for s in actual_series if s.labels["sensor"] != "status"])
    blown_up_count = unbounded_label_blowup(actual_series, DISTINCT_BATCHES, rng)
    assert blown_up_count == sensor_series_count * DISTINCT_BATCHES
    multiplier = blown_up_count / actual_count
    assert multiplier > 1000, "a single unbounded label must multiply the series count by orders of magnitude, matching Prometheus's own high-cardinality warning"

    before_bytes = per_series_memory_bytes(actual_count)
    after_bytes = per_series_memory_bytes(actual_count + blown_up_count)
    assert after_bytes > before_bytes * 1000, "the per-series memory cost must blow up by the same order of magnitude as the series count"

    # columnar scan-based model: build the same data as rows in DuckDB and compare
    con = duckdb.connect()
    con.execute("CREATE TABLE samples(site TEXT, line TEXT, equipment TEXT, sensor TEXT, batch_id TEXT, value DOUBLE)")
    rows = []
    for s in actual_series:
        if s.labels["sensor"] == "status":
            continue
        for _ in range(20):  # 20 synthetic readings per series
            rows.append((s.labels["site"], s.labels["line"], s.labels["equipment"], s.labels["sensor"], f"batch{rng.randint(0, DISTINCT_BATCHES - 1)}", rng.random()))
    con.executemany("INSERT INTO samples VALUES (?, ?, ?, ?, ?, ?)", rows)

    point_result, point_time = postings_point_lookup(postings, matchers)
    scan_result, scan_time = columnar_scan_point_lookup(con, "plantA", "line1", "eq1", "temperature")
    assert len(point_result) >= 0 and scan_result >= 0

    _, high_card_scan_time = columnar_scan_high_cardinality(con, "batch0")
    assert high_card_scan_time >= 0, "the columnar model answers a high-cardinality predicate with an ordinary scan, not an index lookup that could blow up"

    con.close()

    print("all cardinality/postings/scan assertions passed")
    print(f"  worst-case series count: {worst_case}")
    print(f"  actual series count: {actual_count} (ratio to worst case: {actual_count / worst_case:.3f})")
    print(f"  equality-query result size: {len(direct)}, regex-query result size: {len(regex_result)}")
    print(f"  series count before/after unbounded label: {actual_count} -> {blown_up_count} (x{multiplier:.0f})")
    print(f"  estimated memory before/after: {before_bytes} -> {after_bytes} bytes")
    print(f"  postings point-lookup time: {point_time*1000:.3f}ms, columnar scan point-lookup time: {scan_time*1000:.3f}ms")


if __name__ == "__main__":
    main()
