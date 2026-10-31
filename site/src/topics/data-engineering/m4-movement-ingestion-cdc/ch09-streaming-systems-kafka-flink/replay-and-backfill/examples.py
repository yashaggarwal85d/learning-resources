"""Toy models for de.replay-and-backfill: real offset-for-times lookup, scoped replay,
backfill-source selection, and replay safety (versioned output vs suppressed side effect).
No real Kafka cluster; every assert runs against this file's own deterministic state."""

from bisect import bisect_left


class OffsetTimeIndex:
    """Mirrors KafkaConsumer.offsetsForTimes: earliest offset whose timestamp is >= target."""

    def __init__(self, records):
        # records: list of (offset, timestamp), strictly increasing offset and timestamp
        self.offsets = [r[0] for r in records]
        self.timestamps = [r[1] for r in records]

    def offset_for_time(self, target_timestamp):
        i = bisect_left(self.timestamps, target_timestamp)
        if i == len(self.timestamps):
            return None
        return self.offsets[i]


def test_offset_time_index():
    # a day's worth of records, one per hour, offsets 100..123
    records = [(100 + h, h * 3600) for h in range(24)]
    index = OffsetTimeIndex(records)
    # "replay everything since hour 10" -> jump straight to that hour's offset
    assert index.offset_for_time(10 * 3600) == 110
    # a timestamp that falls between two records lands on the next one at or after it
    assert index.offset_for_time(10 * 3600 + 1) == 111
    # a timestamp past every record's own timestamp finds nothing to jump to
    assert index.offset_for_time(999999) is None


class ScopedReplay:
    """Replays either a single partition or a bounded time range, never the whole topic
    unless both are left unscoped."""

    def __init__(self, partitions):
        self.partitions = partitions  # {partition_id: [(offset, timestamp, key), ...]}

    def replay(self, partition_id=None, start_ts=None, end_ts=None):
        parts = (
            {partition_id: self.partitions[partition_id]}
            if partition_id is not None
            else self.partitions
        )
        out = []
        for pid, records in parts.items():
            for offset, ts, key in records:
                if start_ts is not None and ts < start_ts:
                    continue
                if end_ts is not None and ts > end_ts:
                    continue
                out.append((pid, offset, key))
        return out


def test_scoped_replay():
    partitions = {
        0: [(0, 0, "a"), (1, 10, "b"), (2, 20, "c")],
        1: [(0, 5, "d"), (1, 15, "e"), (2, 25, "f")],
    }
    replay = ScopedReplay(partitions)
    # scoped to one partition: only that partition's records come back
    only_p0 = replay.replay(partition_id=0)
    assert [r[0] for r in only_p0] == [0, 0, 0]
    assert len(only_p0) == 3
    # scoped to a time range across both partitions: only records inside the window
    windowed = replay.replay(start_ts=8, end_ts=20)
    assert sorted(r[2] for r in windowed) == ["b", "c", "e"]
    # unscoped: every record from every partition
    everything = replay.replay()
    assert len(everything) == 6


class BackfillSourceChooser:
    """Chooses where a replay actually pulls records from, given the data's age."""

    def __init__(self, hot_log_retention_days, tiered_total_retention_days):
        self.hot_log_retention_days = hot_log_retention_days
        self.tiered_total_retention_days = tiered_total_retention_days

    def source_for(self, data_age_days):
        if data_age_days <= self.hot_log_retention_days:
            return "hot-log"
        if data_age_days <= self.tiered_total_retention_days:
            return "tiered-storage"
        return "lakehouse"


def test_backfill_source_chooser():
    chooser = BackfillSourceChooser(hot_log_retention_days=3, tiered_total_retention_days=30)
    assert chooser.source_for(1) == "hot-log"
    # past the hot log's retention but within tiered storage's total retention
    assert chooser.source_for(14) == "tiered-storage"
    # aged out of Kafka entirely: must be reconstructed from the lakehouse instead
    assert chooser.source_for(90) == "lakehouse"


class OverwriteSink:
    """An unsafe replay sink: a replayed write overwrites the original in place."""

    def __init__(self):
        self.table = {}

    def write(self, key, value):
        self.table[key] = value


class VersionedSink:
    """A safe replay sink: a replay writes to a new, separately labeled version,
    leaving the original intact for comparison."""

    def __init__(self):
        self.versions = {}

    def write(self, version, key, value):
        self.versions.setdefault(version, {})[key] = value


def test_versioned_output_survives_a_bad_replay():
    unsafe = OverwriteSink()
    unsafe.write("metric_2026_10_17", 42)
    # a buggy replay overwrites the original value in place
    unsafe.write("metric_2026_10_17", -1)
    # the original is gone; there is nothing left to diff against
    assert unsafe.table["metric_2026_10_17"] == -1

    safe = VersionedSink()
    safe.write("v1", "metric_2026_10_17", 42)
    # the same buggy replay writes to a new version instead of overwriting
    safe.write("v2-replay", "metric_2026_10_17", -1)
    # both versions survive, so the bad replay can be diffed and rolled back
    assert safe.versions["v1"]["metric_2026_10_17"] == 42
    assert safe.versions["v2-replay"]["metric_2026_10_17"] == -1


class SideEffectGatedConsumer:
    """Each record fans out to a downstream side effect, unless it is flagged as replayed."""

    def __init__(self):
        self.side_effects_fired = []

    def process(self, record):
        applied = {"key": record["key"], "value": record["value"]}
        if not record.get("is_replay"):
            self.side_effects_fired.append(record["key"])
        return applied


def test_suppressed_side_effect_on_replay():
    consumer = SideEffectGatedConsumer()
    consumer.process({"key": "order-1", "value": 10, "is_replay": False})
    # a replayed record still gets its state corrected...
    consumer.process({"key": "order-1", "value": 12, "is_replay": True})
    # ...but doesn't trigger the external side effect (e.g. a confirmation email) a second time
    assert consumer.side_effects_fired == ["order-1"]


if __name__ == "__main__":
    test_offset_time_index()
    test_scoped_replay()
    test_backfill_source_chooser()
    test_versioned_output_survives_a_bad_replay()
    test_suppressed_side_effect_on_replay()
    print("all asserts passed")
    print("offset_for_time(10h) ->", OffsetTimeIndex([(100 + h, h * 3600) for h in range(24)]).offset_for_time(10 * 3600))
    chooser = BackfillSourceChooser(hot_log_retention_days=3, tiered_total_retention_days=30)
    print("source for 14-day-old data ->", chooser.source_for(14))
    print("source for 90-day-old data ->", chooser.source_for(90))
