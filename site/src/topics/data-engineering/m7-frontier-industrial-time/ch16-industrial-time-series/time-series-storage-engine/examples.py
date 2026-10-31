"""A real head-block/WAL/block/compaction simulation (Prometheus's own
documented constants), the documented capacity formula computed for the
plant, an out-of-order accept/reject check against the documented window
rule, a TimescaleDB-style chunk-exclusion simulation, and an InfluxDB-3-style
staged write-buffer-to-WAL-to-Parquet pipeline at its own documented
timings."""

from __future__ import annotations

from dataclasses import dataclass, field

TWO_HOURS_SECONDS = 2 * 60 * 60
WAL_SEGMENT_BYTES = 128 * 1024 * 1024  # Prometheus's documented 128MB WAL segments


@dataclass
class Sample:
    series_id: int
    timestamp: int  # seconds
    value: float


@dataclass
class Block:
    """An immutable, time-bounded block: Prometheus's own chunk metadata
    (mint, maxt) lets a query skip a block without reading it."""
    mint: int
    maxt: int
    samples: list[Sample] = field(default_factory=list)


class HeadBlock:
    """The in-memory, WAL-backed current block. A head rolls into an
    immutable Block once it spans a full two-hour window."""

    def __init__(self, start_time: int):
        self.start_time = start_time
        self.samples: list[Sample] = []
        self.wal_bytes_written = 0

    def append(self, sample: Sample) -> None:
        self.samples.append(sample)
        # each sample's WAL record is a small, fixed-size entry in this simulation
        self.wal_bytes_written += 16

    def max_time(self) -> int:
        return max((s.timestamp for s in self.samples), default=self.start_time)

    def should_roll(self, now: int) -> bool:
        return now - self.start_time >= TWO_HOURS_SECONDS

    def to_block(self) -> Block:
        return Block(mint=self.start_time, maxt=self.start_time + TWO_HOURS_SECONDS, samples=list(self.samples))


def simulate_ingestion(total_seconds: int, samples_per_second: int) -> tuple[list[Block], HeadBlock]:
    """Run a synthetic ingestion stream through head blocks that roll every
    two hours, exactly as Prometheus's storage documentation describes."""
    head = HeadBlock(start_time=0)
    blocks = []
    for second in range(total_seconds):
        for i in range(samples_per_second):
            head.append(Sample(series_id=i, timestamp=second, value=float(i)))
        if head.should_roll(second + 1):
            blocks.append(head.to_block())
            head = HeadBlock(start_time=second + 1)
    return blocks, head


def compact(blocks: list[Block], max_span_seconds: int) -> list[Block]:
    """Merge consecutive blocks into a longer block, capped at max_span_seconds
    (Prometheus's own '10% of retention time, or 31 days, whichever is
    smaller' rule, simplified here to a stated cap)."""
    if not blocks:
        return []
    merged: list[Block] = []
    current = blocks[0]
    for b in blocks[1:]:
        if (b.maxt - current.mint) <= max_span_seconds:
            current = Block(mint=current.mint, maxt=b.maxt, samples=current.samples + b.samples)
        else:
            merged.append(current)
            current = b
    merged.append(current)
    return merged


def needed_disk_space(retention_time_seconds: int, ingested_samples_per_second: int, bytes_per_sample: float) -> float:
    """Prometheus's own documented capacity formula, verbatim."""
    return retention_time_seconds * ingested_samples_per_second * bytes_per_sample


def query_skips_block(block: Block, query_start: int, query_end: int) -> bool:
    """A query can skip a block entirely when the block's [mint, maxt) does
    not overlap the query's time range — the chunk-metadata pruning
    Prometheus's documentation describes."""
    return block.maxt <= query_start or block.mint >= query_end


def out_of_order_accepted(sample_timestamp: int, head_max_time: int, out_of_order_time_window: int) -> bool:
    """Prometheus's own documented rule: a sample is ingested as long as its
    timestamp is >= head_max_time - out_of_order_time_window."""
    return sample_timestamp >= head_max_time - out_of_order_time_window


@dataclass
class Chunk:
    """A TimescaleDB-style time-partitioned chunk."""
    start: int
    end: int
    rows: list[tuple[int, float]] = field(default_factory=list)


def build_hypertable_chunks(total_seconds: int, chunk_interval_seconds: int, rows: list[tuple[int, float]]) -> list[Chunk]:
    chunks: dict[int, Chunk] = {}
    for ts, value in rows:
        chunk_start = (ts // chunk_interval_seconds) * chunk_interval_seconds
        chunk = chunks.setdefault(chunk_start, Chunk(start=chunk_start, end=chunk_start + chunk_interval_seconds))
        chunk.rows.append((ts, value))
    return sorted(chunks.values(), key=lambda c: c.start)


def chunk_exclusion_query(chunks: list[Chunk], query_start: int, query_end: int) -> list[Chunk]:
    """Tiger Data's own documented behavior: a query identifies the correct
    chunk and runs on it instead of going through the entire table."""
    return [c for c in chunks if c.end > query_start and c.start < query_end]


@dataclass
class InfluxDB3Pipeline:
    """A staged write-buffer -> WAL -> queryable-buffer -> Parquet pipeline
    at InfluxDB 3 Core's own documented default timings: a 1-second WAL
    flush, a 900-WAL-file (15-minute) queryable buffer, and a 10-minute
    Parquet persistence cycle that keeps the most recent 5 minutes in
    memory."""
    wal_flush_interval_seconds: int = 1
    queryable_buffer_seconds: int = 15 * 60
    parquet_persist_interval_seconds: int = 10 * 60
    memory_retention_seconds: int = 5 * 60

    write_buffer: list[tuple[int, float]] = field(default_factory=list)
    wal: list[tuple[int, float]] = field(default_factory=list)
    queryable_buffer: list[tuple[int, float]] = field(default_factory=list)
    parquet_files: list[list[tuple[int, float]]] = field(default_factory=list)
    in_memory_tail: list[tuple[int, float]] = field(default_factory=list)

    def write(self, timestamp: int, value: float) -> None:
        self.write_buffer.append((timestamp, value))

    def tick(self, now: int) -> None:
        # every second: flush the write buffer to the WAL, then into the queryable buffer
        if now % self.wal_flush_interval_seconds == 0 and self.write_buffer:
            self.wal.extend(self.write_buffer)
            self.queryable_buffer.extend(self.write_buffer)
            self.write_buffer.clear()
        # every ten minutes: persist the oldest data to Parquet, keep the most recent 5 minutes
        if now > 0 and now % self.parquet_persist_interval_seconds == 0:
            cutoff = now - self.memory_retention_seconds
            to_persist = [r for r in self.queryable_buffer if r[0] < cutoff]
            self.in_memory_tail = [r for r in self.queryable_buffer if r[0] >= cutoff]
            if to_persist:
                self.parquet_files.append(to_persist)
            self.queryable_buffer = self.in_memory_tail


def run_influxdb3_pipeline(total_seconds: int, samples_per_second: int) -> InfluxDB3Pipeline:
    pipeline = InfluxDB3Pipeline()
    for second in range(total_seconds):
        for i in range(samples_per_second):
            pipeline.write(second, float(i))
        pipeline.tick(second)
    return pipeline


def main() -> None:
    # --- Prometheus head/WAL/block/compaction ---
    SAMPLES_PER_SECOND = 50
    TOTAL_SECONDS = 6 * 60 * 60 + 30 * 60  # six and a half hours, so a partial block remains in the head
    blocks, head = simulate_ingestion(TOTAL_SECONDS, SAMPLES_PER_SECOND)
    assert len(blocks) == 3, "six hours of ingestion must roll exactly three two-hour blocks"
    assert all(b.maxt - b.mint == TWO_HOURS_SECONDS for b in blocks)
    assert len(head.samples) > 0, "the final partial block must still be live in the head"

    compacted = compact(blocks, max_span_seconds=TWO_HOURS_SECONDS * 2)
    assert len(compacted) < len(blocks), "compaction must merge the smaller blocks into fewer, larger ones"

    # chunk-metadata pruning: a query entirely before the first block must skip every block
    assert all(query_skips_block(b, query_start=-1000, query_end=-1) for b in blocks)
    # a query spanning the whole range must not be able to skip any block
    assert not any(query_skips_block(b, query_start=0, query_end=TOTAL_SECONDS) for b in blocks)

    # --- the documented capacity formula, for the plant's own ingestion rate ---
    PLANT_SERIES = 1297  # the actual series count topic 12 computed for this plant
    PLANT_SAMPLE_INTERVAL_SECONDS = 10
    plant_samples_per_second = PLANT_SERIES / PLANT_SAMPLE_INTERVAL_SECONDS
    RETENTION_SECONDS = 15 * 24 * 60 * 60  # Prometheus's own documented 15-day default
    BYTES_PER_SAMPLE = 1.5  # Prometheus's own documented "1-2 bytes per sample" midpoint
    disk_bytes = needed_disk_space(RETENTION_SECONDS, plant_samples_per_second, BYTES_PER_SAMPLE)
    assert disk_bytes > 0
    disk_gb = disk_bytes / (1024 ** 3)

    # --- out-of-order window ---
    HEAD_MAX_TIME = 10_000
    assert out_of_order_accepted(HEAD_MAX_TIME - 5, HEAD_MAX_TIME, out_of_order_time_window=0) is False, "with the documented default window of zero, any out-of-order sample must be rejected"
    assert out_of_order_accepted(HEAD_MAX_TIME - 5, HEAD_MAX_TIME, out_of_order_time_window=10) is True, "a sample within a nonzero window must be accepted"
    assert out_of_order_accepted(HEAD_MAX_TIME - 50, HEAD_MAX_TIME, out_of_order_time_window=10) is False, "a sample older than the window must still be rejected"

    # --- TimescaleDB-style chunk exclusion ---
    CHUNK_INTERVAL = 24 * 60 * 60  # one-day chunks
    rows = [(t, float(t)) for t in range(0, 5 * CHUNK_INTERVAL, 3600)]
    chunks = build_hypertable_chunks(5 * CHUNK_INTERVAL, CHUNK_INTERVAL, rows)
    assert len(chunks) == 5, "five days of data in one-day chunks must produce exactly five chunks"
    matching = chunk_exclusion_query(chunks, query_start=2 * CHUNK_INTERVAL, query_end=3 * CHUNK_INTERVAL)
    assert len(matching) == 1, "a query entirely inside one day must touch exactly one chunk, not the whole table"
    all_matching = chunk_exclusion_query(chunks, query_start=0, query_end=5 * CHUNK_INTERVAL)
    assert len(all_matching) == 5, "a query spanning every day must touch every chunk"

    # --- InfluxDB 3 Core's own documented WAL-then-Parquet pipeline ---
    PIPELINE_SECONDS = 30 * 60 + 1  # ends exactly one second past a ten-minute persistence boundary
    pipeline = run_influxdb3_pipeline(total_seconds=PIPELINE_SECONDS, samples_per_second=3)
    assert len(pipeline.wal) > 0, "every written sample must reach the WAL within the one-second flush interval"
    total_persisted = sum(len(f) for f in pipeline.parquet_files)
    assert total_persisted > 0, "at least one ten-minute Parquet persistence cycle must have run"
    assert len(pipeline.in_memory_tail) > 0, "the most recent five minutes must remain in memory, not yet in Parquet"
    oldest_in_memory = min(r[0] for r in pipeline.in_memory_tail)
    newest_persisted = max((r[0] for f in pipeline.parquet_files for r in f), default=-1)
    assert oldest_in_memory > newest_persisted, "every sample still in memory must be newer than every sample already persisted to Parquet"
    assert (PIPELINE_SECONDS - 1) - oldest_in_memory <= pipeline.memory_retention_seconds, "the in-memory tail must hold no more than the most recent five minutes' worth of data"

    print("all storage-engine assertions passed")
    print(f"  Prometheus: {len(blocks)} two-hour blocks rolled, compacted to {len(compacted)} block(s)")
    print(f"  capacity formula: {plant_samples_per_second:.1f} samples/sec, 15-day retention -> {disk_gb:.3f} GB")
    print(f"  TimescaleDB chunks: {len(chunks)} total, {len(matching)} touched by a single-day query")
    print(f"  InfluxDB 3: {len(pipeline.wal)} samples through WAL, {total_persisted} persisted to Parquet, {len(pipeline.in_memory_tail)} still in memory")


if __name__ == "__main__":
    main()
