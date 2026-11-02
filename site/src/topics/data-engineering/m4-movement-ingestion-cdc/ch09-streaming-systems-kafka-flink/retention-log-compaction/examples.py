"""
Toy retention/compaction simulations for de.retention-log-compaction.

No real Kafka broker is available in this sandbox. Each function below is a small, independent,
directly-asserted reimplementation of one mechanism this topic teaches, built from the sourced
behaviour in SOURCES.md (Kafka's own topic configuration reference and design documentation), not
a port of Kafka's real log cleaner or segment manager.

1. segment_deletion: time-based retention deletes a whole closed segment only once every record
   in it is older than retention.ms — never a single record out of a segment.
2. dirty_ratio_trigger: the log cleaner only fires a cleaning pass once the dirty (uncompacted)
   fraction of the log crosses the configured threshold.
3. compaction_lag_window: a record superseded by a newer value for the same key still survives
   until min.compaction.lag.ms has passed, and is forced eligible once max.compaction.lag.ms has.
4. tombstone_visible_to_lagging_consumer: a consumer reading from offset zero sees a delete
   tombstone only if it catches up to the head within delete.retention.ms of the tombstone being
   written; a consumer that lags past that window can miss it.
"""


def segment_deletion(segments, retention_ms, now_ms):
    """segments: list of (segment_id, newest_record_age_ms). A segment is deleted only when
    every record in it — i.e. its newest record — is older than retention.ms."""
    deleted = []
    kept = []
    for segment_id, newest_record_age_ms in segments:
        if now_ms - newest_record_age_ms < 0:
            raise ValueError("record from the future")
        age_of_newest_record_ms = newest_record_age_ms
        if age_of_newest_record_ms > retention_ms:
            deleted.append(segment_id)
        else:
            kept.append(segment_id)
    return {"deleted": deleted, "kept": kept}


def dirty_ratio_trigger(dirty_bytes, total_bytes, min_cleanable_dirty_ratio):
    dirty_ratio = dirty_bytes / total_bytes
    return {"dirty_ratio": dirty_ratio, "cleaning_fires": dirty_ratio >= min_cleanable_dirty_ratio}


def compaction_lag_window(record_age_ms, min_compaction_lag_ms, max_compaction_lag_ms, dirty_ratio_met):
    if record_age_ms < min_compaction_lag_ms:
        # Too fresh: never eligible yet, no matter what the dirty ratio says.
        return {"eligible": False, "reason": "younger than min.compaction.lag.ms"}
    if record_age_ms >= max_compaction_lag_ms:
        # Forced eligible regardless of the dirty ratio.
        return {"eligible": True, "reason": "older than max.compaction.lag.ms, forced eligible"}
    return {"eligible": dirty_ratio_met, "reason": "within the lag window, dirty ratio decides"}


def tombstone_visible_to_lagging_consumer(consumer_lag_ms, delete_retention_ms):
    return {"tombstone_seen": consumer_lag_ms <= delete_retention_ms}


def run():
    retention_case = segment_deletion(
        segments=[("seg-1", 1000), ("seg-2", 500), ("seg-3", 50)],
        retention_ms=600,
        now_ms=1000,
    )
    assert retention_case["deleted"] == ["seg-1"]
    assert retention_case["kept"] == ["seg-2", "seg-3"]

    below_threshold = dirty_ratio_trigger(dirty_bytes=300, total_bytes=1000, min_cleanable_dirty_ratio=0.5)
    assert below_threshold["cleaning_fires"] is False
    above_threshold = dirty_ratio_trigger(dirty_bytes=600, total_bytes=1000, min_cleanable_dirty_ratio=0.5)
    assert above_threshold["cleaning_fires"] is True

    too_fresh = compaction_lag_window(record_age_ms=100, min_compaction_lag_ms=500, max_compaction_lag_ms=5000, dirty_ratio_met=True)
    assert too_fresh["eligible"] is False
    forced = compaction_lag_window(record_age_ms=6000, min_compaction_lag_ms=500, max_compaction_lag_ms=5000, dirty_ratio_met=False)
    assert forced["eligible"] is True
    normal_window_waiting = compaction_lag_window(record_age_ms=1000, min_compaction_lag_ms=500, max_compaction_lag_ms=5000, dirty_ratio_met=False)
    assert normal_window_waiting["eligible"] is False
    normal_window_ready = compaction_lag_window(record_age_ms=1000, min_compaction_lag_ms=500, max_compaction_lag_ms=5000, dirty_ratio_met=True)
    assert normal_window_ready["eligible"] is True

    caught_up = tombstone_visible_to_lagging_consumer(consumer_lag_ms=3_600_000, delete_retention_ms=86_400_000)
    assert caught_up["tombstone_seen"] is True
    too_far_behind = tombstone_visible_to_lagging_consumer(consumer_lag_ms=172_800_000, delete_retention_ms=86_400_000)
    assert too_far_behind["tombstone_seen"] is False

    return {
        "segment_deletion": retention_case,
        "dirty_ratio": {"below_threshold": below_threshold, "above_threshold": above_threshold},
        "compaction_lag_window": {
            "too_fresh": too_fresh,
            "forced": forced,
            "normal_window_waiting": normal_window_waiting,
            "normal_window_ready": normal_window_ready,
        },
        "tombstone_visibility": {"caught_up": caught_up, "too_far_behind": too_far_behind},
    }


if __name__ == "__main__":
    import json

    print(json.dumps(run(), indent=2))
