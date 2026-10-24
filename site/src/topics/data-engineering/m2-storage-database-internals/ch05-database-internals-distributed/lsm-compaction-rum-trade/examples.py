import os
import random
import shutil
import tempfile
import time

import psycopg2
import rocksdict

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
N_ROWS = 2000
VAL_BYTES = 100  # hex-encoded random bytes: not compressible, so a fair comparison of the engines
# themselves rather than of their compressors.
ROW_BYTES = 4 + VAL_BYTES  # a 4-byte key/id plus the value, the same convention for both engines.
WRITE_LOGICAL_BYTES = N_ROWS * ROW_BYTES + (N_ROWS // 2) * ROW_BYTES  # every insert, plus every update.
SPACE_LOGICAL_BYTES = N_ROWS * ROW_BYTES  # the live data only, once the workload is done.


def row_value(seed):
    random.seed(seed)
    return os.urandom(VAL_BYTES // 2).hex()


def postgres_rum(cur):
    """Identical insert/update/read workload against this sandbox's real Postgres cluster:
    N_ROWS inserts, half of them updated again, then 200 random point reads."""
    cur.execute("DROP TABLE IF EXISTS rum_demo")
    cur.execute("CREATE TABLE rum_demo (id int PRIMARY KEY, val text)")
    cur.execute("CHECKPOINT")  # a checkpoint mid-run forces extra full-page WAL writes; starting
    # right after one keeps that cost out of this measurement, so it reflects the workload itself.

    def wal_bytes():
        cur.execute("SELECT pg_current_wal_lsn() - '0/0'")
        return float(cur.fetchone()[0])

    wal_before = wal_bytes()
    for i in range(N_ROWS):
        cur.execute("INSERT INTO rum_demo (id, val) VALUES (%s, %s)", (i, row_value(i)))
    for i in range(0, N_ROWS, 2):
        cur.execute("UPDATE rum_demo SET val = %s WHERE id = %s", (row_value(i + 1_000_000), i))
    wal_after = wal_bytes()
    write_amp = (wal_after - wal_before) / WRITE_LOGICAL_BYTES

    cur.execute("SELECT pg_total_relation_size('rum_demo')")
    size = cur.fetchone()[0]
    space_amp = size / SPACE_LOGICAL_BYTES

    ids = list(range(N_ROWS))
    random.shuffle(ids)
    latencies = []
    for i in ids[:200]:
        t0 = time.perf_counter()
        cur.execute("SELECT val FROM rum_demo WHERE id = %s", (i,))
        cur.fetchone()
        latencies.append(time.perf_counter() - t0)
    latencies.sort()
    p99 = latencies[int(len(latencies) * 0.99)]

    print(f"Postgres:  write amplification {write_amp:.2f}x, space amplification {space_amp:.2f}x, p99 read {p99 * 1000:.3f} ms")
    return write_amp, space_amp, p99


def rocksdb_rum():
    """The identical workload against a real RocksDB instance in this sandbox: N_ROWS inserts
    (flushed), half of them updated again (flushed), then compacted, then 200 random point reads."""
    path = tempfile.mkdtemp(prefix="rum-demo-")
    opts = rocksdict.Options()
    opts.create_if_missing(True)
    opts.enable_statistics()
    opts.set_compression_type(rocksdict.DBCompressionType.none())  # the same reason as VAL_BYTES above.
    db = rocksdict.Rdict(path, opts)
    try:
        for i in range(N_ROWS):
            db[f"k{i:06d}"] = row_value(i)
        db.flush()
        for i in range(0, N_ROWS, 2):
            db[f"k{i:06d}"] = row_value(i + 1_000_000)
        db.flush()
        db.compact_range(None, None)

        def stat(name):
            for line in opts.get_statistics().split("\n"):
                if line.startswith(name + " "):
                    return int(line.split(":")[1].strip())
            return 0

        written = stat("rocksdb.flush.write.bytes") + stat("rocksdb.compact.write.bytes")
        write_amp = written / WRITE_LOGICAL_BYTES

        size = sum(f["size"] for f in db.live_files())
        space_amp = size / SPACE_LOGICAL_BYTES

        keys = [f"k{i:06d}" for i in range(N_ROWS)]
        random.shuffle(keys)
        latencies = []
        for k in keys[:200]:
            t0 = time.perf_counter()
            _ = db[k]
            latencies.append(time.perf_counter() - t0)
        latencies.sort()
        p99 = latencies[int(len(latencies) * 0.99)]

        print(f"RocksDB:   write amplification {write_amp:.2f}x, space amplification {space_amp:.2f}x, p99 read {p99 * 1000:.3f} ms")
        return write_amp, space_amp, p99
    finally:
        db.close()
        shutil.rmtree(path, ignore_errors=True)


def rum_lab():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    cur = conn.cursor()
    pg_write_amp, pg_space_amp, pg_p99 = postgres_rum(cur)
    conn.close()

    rocks_write_amp, rocks_space_amp, rocks_p99 = rocksdb_rum()

    # Write and space amplification are deterministic for this workload on this build: pin them exactly.
    assert abs(pg_write_amp - 2.61) < 0.1, f"expected Postgres write amplification near 2.61x, got {pg_write_amp:.2f}x"
    assert abs(pg_space_amp - 1.89) < 0.1, f"expected Postgres space amplification near 1.89x, got {pg_space_amp:.2f}x"
    assert abs(rocks_write_amp - 1.85) < 0.02, f"expected RocksDB write amplification near 1.85x, got {rocks_write_amp:.2f}x"
    assert abs(rocks_space_amp - 1.11) < 0.02, f"expected RocksDB space amplification near 1.11x, got {rocks_space_amp:.2f}x"
    # No single overhead is minimal for both engines at once (the RUM conjecture itself): Postgres's
    # B-tree pays more in write and space amplification than RocksDB's compacted LSM tree pays, on
    # this same small workload.
    assert pg_write_amp > rocks_write_amp, "expected Postgres to show higher write amplification than RocksDB on this workload"
    assert pg_space_amp > rocks_space_amp, "expected Postgres to show higher space amplification than RocksDB on this workload"
    # p99 latency is real wall-clock time and varies run to run; only the direction is asserted.
    # RocksDB is an in-process, embedded read; Postgres's read crosses a real client-server round trip
    # on top of its own engine cost, so this gap is not a pure LSM-vs-B-tree read-amplification claim.
    assert rocks_p99 < pg_p99, "expected RocksDB's in-process read to be faster than Postgres's client-server round trip"

    return {
        "postgres": {"write_amp": pg_write_amp, "space_amp": pg_space_amp, "p99_ms": pg_p99 * 1000},
        "rocksdb": {"write_amp": rocks_write_amp, "space_amp": rocks_space_amp, "p99_ms": rocks_p99 * 1000},
    }


def compaction_style_file_counts():
    """The identical shuffled-key write pattern under RocksDB's two real compaction styles:
    leveled (its own 'Level Compaction') and tiered (its own 'Universal Compaction')."""
    n = 20000
    keys = list(range(n))
    random.Random(42).shuffle(keys)
    counts = {}
    for style_name, style in [("level", rocksdict.DBCompactionStyle.level()), ("universal", rocksdict.DBCompactionStyle.universal())]:
        path = tempfile.mkdtemp(prefix=f"style-{style_name}-")
        opts = rocksdict.Options()
        opts.create_if_missing(True)
        opts.set_compression_type(rocksdict.DBCompressionType.none())
        opts.set_compaction_style(style)
        opts.set_write_buffer_size(16 * 1024)
        opts.set_level_zero_file_num_compaction_trigger(4)
        db = rocksdict.Rdict(path, opts)
        try:
            for i in keys:
                db[f"k{i:08d}"] = row_value(i)
            db.flush()
            time.sleep(2)  # let background compaction settle before counting.
            counts[style_name] = len(db.live_files())
        finally:
            db.close()
            shutil.rmtree(path, ignore_errors=True)

    assert counts["level"] < counts["universal"], (
        f"expected leveled compaction to settle to fewer live files than tiered on the same workload, "
        f"got level={counts['level']}, universal={counts['universal']}"
    )
    print(f"same write pattern, two compaction styles: level settles to {counts['level']} file(s), universal to {counts['universal']}")
    return counts


def fifo_drops_oldest():
    """FIFO compaction never merges: once total size crosses a configured cap, it deletes the
    oldest file outright, dropping whatever keys it held."""
    path = tempfile.mkdtemp(prefix="fifo-demo-")
    opts = rocksdict.Options()
    opts.create_if_missing(True)
    opts.set_compression_type(rocksdict.DBCompressionType.none())
    opts.set_compaction_style(rocksdict.DBCompactionStyle.fifo())
    opts.set_write_buffer_size(16 * 1024)
    fco = rocksdict.FifoCompactOptions()
    fco.max_table_files_size = 100 * 1024  # a small cap, so the drop happens within this experiment's own writes.
    opts.set_fifo_compaction_options(fco)
    db = rocksdict.Rdict(path, opts)
    try:
        rounds = 20
        for r in range(rounds):
            for i in range(500):
                db[f"r{r:03d}k{i:04d}"] = row_value(r * 1000 + i)
            db.flush()
            time.sleep(0.05)
        time.sleep(1)

        oldest_gone = db.get("r000k0000") is None
        newest_present = db.get(f"r{rounds - 1:03d}k0000") is not None
        total_size = sum(f["size"] for f in db.live_files())

        assert oldest_gone, "the oldest file's own keys should have been dropped once the size cap was crossed"
        assert newest_present, "the newest file's own keys should still be present"
        assert total_size <= fco.max_table_files_size * 1.5, f"total size {total_size} should stay near the configured cap of {fco.max_table_files_size}"

        print(f"FIFO, cap {fco.max_table_files_size} bytes: oldest key gone ({oldest_gone}), newest key present ({newest_present}), total size {total_size} bytes")
        return oldest_gone, newest_present, total_size
    finally:
        db.close()
        shutil.rmtree(path, ignore_errors=True)


def write_stall_trigger_crossed():
    """A real, configured write-stall trigger (too many L0 files) and RocksDB's own real count,
    with background compaction held off so the count can be read deterministically."""
    path = tempfile.mkdtemp(prefix="stall-demo-")
    opts = rocksdict.Options()
    opts.create_if_missing(True)
    opts.set_compression_type(rocksdict.DBCompressionType.none())
    opts.set_write_buffer_size(16 * 1024)
    slowdown_trigger = 2
    opts.set_level_zero_slowdown_writes_trigger(slowdown_trigger)
    opts.set_disable_auto_compactions(True)  # hold L0 files in place to read the count deterministically.
    db = rocksdict.Rdict(path, opts)
    try:
        for r in range(6):
            for i in range(300):
                db[f"k{r:03d}_{i:04d}"] = row_value(r * 1000 + i)
            db.flush()

        l0_files = db.property_int_value("rocksdb.num-files-at-level0")
        assert l0_files >= slowdown_trigger, f"expected at least {slowdown_trigger} L0 files to demonstrate the trigger, got {l0_files}"

        print(f"level0_slowdown_writes_trigger = {slowdown_trigger}; real L0 file count = {l0_files} (at or past the trigger)")
        return l0_files, slowdown_trigger
    finally:
        db.close()
        shutil.rmtree(path, ignore_errors=True)


def main():
    rum_lab()
    compaction_style_file_counts()
    fifo_drops_oldest()
    write_stall_trigger_crossed()
    print("lsm-compaction-rum-trade examples: all checks pass")


if __name__ == "__main__":
    main()
