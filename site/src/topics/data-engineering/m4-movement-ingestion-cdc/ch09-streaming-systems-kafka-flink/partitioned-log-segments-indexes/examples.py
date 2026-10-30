"""Toy partitioned log: segments, a sparse offset index, and consumer-owned offsets.

Every number this topic's reel puts on screen is asserted here, on a real run,
not invented for the picture. This is a small, from-scratch reimplementation of
the *shape* of Kafka's own on-disk design (one partition = a directory of
segment files, each with a small companion sparse index) -- not a port of
Kafka's own Java source, and not a claim about Kafka's exact byte layout.
"""

from __future__ import annotations

import bisect
import os
import shutil
import tempfile
import time
from dataclasses import dataclass, field


# Kafka's real defaults (Apache Kafka trunk, read from
# storage/internals/log/LogConfig.java and server/config/ServerLogConfigs.java,
# see SOURCES.md): log.segment.bytes = 1 GiB, log.roll.ms = 7 days,
# log.index.interval.bytes = 4096. This toy log uses tiny numbers so the reel
# can show a roll and an index on screen in a few hundred records instead of
# a gigabyte of data; the real defaults are cited in post-notes.md, not here.
TOY_SEGMENT_BYTES = 4_096
TOY_INDEX_INTERVAL_BYTES = 256


@dataclass
class IndexEntry:
    offset: int
    position: int  # byte position within the segment's .log file


@dataclass
class Segment:
    base_offset: int
    log_path: str
    index: list[IndexEntry] = field(default_factory=list)
    size: int = 0
    sealed: bool = False
    next_offset: int = 0  # offset the next appended record will get


class Partition:
    """A toy partition: a directory of segments, each with a sparse index."""

    def __init__(self, directory: str, segment_bytes: int = TOY_SEGMENT_BYTES,
                 index_interval_bytes: int = TOY_INDEX_INTERVAL_BYTES):
        self.directory = directory
        self.segment_bytes = segment_bytes
        self.index_interval_bytes = index_interval_bytes
        self.segments: list[Segment] = []
        self.rolls = 0
        self._bytes_since_index = index_interval_bytes  # force an index entry at offset 0
        self._open_new_segment(base_offset=0)

    def _open_new_segment(self, base_offset: int) -> None:
        if self.segments:
            self.segments[-1].sealed = True
        path = os.path.join(self.directory, f"{base_offset:020d}.log")
        seg = Segment(base_offset=base_offset, log_path=path, next_offset=base_offset)
        self.segments.append(seg)
        with open(path, "wb"):
            pass

    @property
    def active_segment(self) -> Segment:
        return self.segments[-1]

    def append(self, record: bytes) -> int:
        """Append one record; returns the offset it was assigned. May roll a new segment."""
        seg = self.active_segment
        record_bytes = len(record) + 8  # a toy fixed-size length prefix, for realism only
        if seg.size + record_bytes > self.segment_bytes and seg.size > 0:
            self.rolls += 1
            self._open_new_segment(base_offset=seg.next_offset)
            self._bytes_since_index = self.index_interval_bytes  # new segment starts with an index entry
            seg = self.active_segment

        offset = seg.next_offset
        position = seg.size
        with open(seg.log_path, "ab") as f:
            f.write(len(record).to_bytes(8, "big") + record)
        seg.size += record_bytes
        seg.next_offset += 1

        # Sparse index: only record an entry once we've crossed the interval,
        # exactly Kafka's own log.index.interval.bytes idea (never one entry per record).
        self._bytes_since_index += record_bytes
        if self._bytes_since_index >= self.index_interval_bytes:
            seg.index.append(IndexEntry(offset=offset, position=position))
            self._bytes_since_index = 0

        return offset

    def total_records(self) -> int:
        return sum(s.next_offset - s.base_offset for s in self.segments)

    def total_index_entries(self) -> int:
        return sum(len(s.index) for s in self.segments)

    def _segment_for_offset(self, offset: int) -> Segment:
        for seg in self.segments:
            if offset < seg.next_offset:
                return seg
        raise KeyError(f"offset {offset} not found")

    def read_sparse(self, offset: int) -> tuple[bytes, int, int]:
        """Read a record by seeking via the sparse index, then a short local scan.
        Returns (record_bytes, index_entries_checked, records_scanned)."""
        seg = self._segment_for_offset(offset)
        positions = [e.offset for e in seg.index]
        i = bisect.bisect_right(positions, offset) - 1
        index_entries_checked = 1 if i >= 0 else 0
        start_offset = seg.index[i].offset if i >= 0 else seg.base_offset
        start_position = seg.index[i].position if i >= 0 else 0

        with open(seg.log_path, "rb") as f:
            f.seek(start_position)
            cur_offset = start_offset
            records_scanned = 0
            while True:
                length_bytes = f.read(8)
                if not length_bytes:
                    raise KeyError(f"offset {offset} not found in segment {seg.base_offset}")
                length = int.from_bytes(length_bytes, "big")
                data = f.read(length)
                records_scanned += 1
                if cur_offset == offset:
                    return data, index_entries_checked, records_scanned
                cur_offset += 1

    def read_naive(self, offset: int) -> tuple[bytes, int]:
        """Read a record by scanning every record from the start of the partition.
        Returns (record_bytes, records_scanned). Used only as the "before" comparison."""
        records_scanned = 0
        for seg in self.segments:
            with open(seg.log_path, "rb") as f:
                cur_offset = seg.base_offset
                while True:
                    length_bytes = f.read(8)
                    if not length_bytes:
                        break
                    length = int.from_bytes(length_bytes, "big")
                    data = f.read(length)
                    records_scanned += 1
                    if cur_offset == offset:
                        return data, records_scanned
                    cur_offset += 1
        raise KeyError(f"offset {offset} not found")


class Consumer:
    """A toy consumer: its position is a single integer it owns. The partition
    (and its segments/index) is never touched by any consumer operation here --
    exactly the "offsets are owned by the consumer, not the broker" claim."""

    def __init__(self, partition: Partition):
        self.partition = partition
        self.offset = 0

    def poll(self) -> bytes | None:
        try:
            record, _, _ = self.partition.read_sparse(self.offset)
        except KeyError:
            return None
        self.offset += 1
        return record

    def seek(self, offset: int) -> None:
        self.offset = offset


def run() -> dict:
    results: dict = {}
    tmp = tempfile.mkdtemp(prefix="toy-partition-")
    try:
        partition = Partition(tmp)

        # 1. Build the toy log and watch it roll.
        n_records = 400
        record_size = 24
        for i in range(n_records):
            partition.append(f"order-{i:06d}".encode().ljust(record_size, b"\0"))

        assert partition.rolls > 0, "expected at least one segment roll over 400 records"
        assert len(partition.segments) == partition.rolls + 1
        results["segment_bytes_limit"] = TOY_SEGMENT_BYTES
        results["total_records"] = partition.total_records()
        assert results["total_records"] == n_records
        results["rolls"] = partition.rolls
        results["segment_count"] = len(partition.segments)

        # 2. The index is sparse: far fewer entries than records.
        results["index_entries"] = partition.total_index_entries()
        assert 0 < results["index_entries"] < n_records, (
            "index must be sparse: more than zero entries, far fewer than records"
        )

        # 3. Seek cost: sparse-index seek vs naive full scan, for the same target offset.
        target_offset = n_records - 5  # near the end, so a naive scan pays the full cost
        record_fast, idx_checked, records_scanned_fast = partition.read_sparse(target_offset)
        record_slow, records_scanned_slow = partition.read_naive(target_offset)
        assert record_fast == record_slow, "sparse-index seek and naive scan must return the same record"
        results["seek_target_offset"] = target_offset
        results["index_entries_checked"] = idx_checked
        results["records_scanned_sparse"] = records_scanned_fast
        results["records_scanned_naive"] = records_scanned_slow
        assert results["records_scanned_sparse"] < results["records_scanned_naive"], (
            "the sparse-index seek must scan strictly fewer records than the naive scan"
        )

        # 4. Timing comparison (real wall-clock, from a real run, not invented).
        t0 = time.perf_counter()
        for _ in range(200):
            partition.read_sparse(target_offset)
        t_fast = (time.perf_counter() - t0) / 200
        t0 = time.perf_counter()
        for _ in range(200):
            partition.read_naive(target_offset)
        t_slow = (time.perf_counter() - t0) / 200
        results["seek_seconds_sparse"] = t_fast
        results["seek_seconds_naive"] = t_slow

        # 5. Active segment is never the one compaction/retention would act on mid-write:
        # confirm the active segment is always the last one, and every earlier one is sealed.
        assert partition.active_segment is partition.segments[-1]
        assert all(s.sealed for s in partition.segments[:-1])
        assert not partition.active_segment.sealed

        # 6. Consumer offset ownership: rewinding and re-reading touches no broker-side state.
        consumer = Consumer(partition)
        first_five = [consumer.poll() for _ in range(5)]
        segments_before = [(s.size, s.sealed, len(s.index)) for s in partition.segments]
        consumer.seek(0)  # deliberate rewind
        first_five_again = [consumer.poll() for _ in range(5)]
        segments_after = [(s.size, s.sealed, len(s.index)) for s in partition.segments]
        assert first_five == first_five_again, "a rewound consumer must re-read the identical records"
        assert segments_before == segments_after, (
            "rewinding and re-reading must not mutate the partition's segments or index at all"
        )
        results["rewind_offset"] = 0
        results["rewind_matched"] = first_five == first_five_again
        results["rewind_mutated_partition"] = segments_before != segments_after

        return results
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    import json

    out = run()
    print(json.dumps(out, indent=2))
