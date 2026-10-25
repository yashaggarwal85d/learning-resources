import shutil
import tempfile

import rocksdict


def fresh_db(opts=None, with_stats=False):
    path = tempfile.mkdtemp(prefix="lsm-demo-")
    if opts is None:
        opts = rocksdict.Options()
        opts.create_if_missing(True)
    if with_stats:
        opts.enable_statistics()
    return rocksdict.Rdict(path, opts), path, opts


def memtable_flush_lifecycle():
    """A write lands in the active memtable; a flush turns it into a new, immutable SSTable file."""
    db, path, _ = fresh_db()
    try:
        before_files = db.live_files()
        db["k1"] = "A"
        db.flush()
        after_files = db.live_files()

        assert before_files == [], f"expected no SST files before any flush, got {before_files}"
        assert len(after_files) == 1, f"expected exactly one SST file after the first flush, got {len(after_files)}"
        assert after_files[0]["level"] == 0, f"a freshly flushed memtable should land at L0, got level {after_files[0]['level']}"
        assert after_files[0]["num_entries"] == 1, f"expected 1 entry in the flushed SST, got {after_files[0]['num_entries']}"

        print(f"before any flush: {len(before_files)} SST file(s)")
        print(f"after flushing one write: {len(after_files)} SST file(s), level {after_files[0]['level']}, {after_files[0]['num_entries']} entry")
        return before_files, after_files
    finally:
        db.close()
        shutil.rmtree(path, ignore_errors=True)


def point_read_checks_newest_first():
    """A key written after the last flush lives only in the active memtable. A point read must find
    it there, without ever touching the older SST that holds a stale value for the same key."""
    db, path, opts = fresh_db(with_stats=True)
    try:
        db["k1"] = "A"
        db.flush()
        db["k1"] = "B"
        value = db["k1"]

        stats = opts.get_statistics()

        def stat(name):
            for line in stats.split("\n"):
                if line.startswith(name + " "):
                    return int(line.split(":")[1].strip())
            return None

        memtable_hits = stat("rocksdb.memtable.hit")
        l0_hits = stat("rocksdb.l0.hit")

        assert value == "B", f"a point read must return the newest write, got {value!r}"
        assert memtable_hits == 1, f"the read should be answered by the active memtable, got {memtable_hits} memtable hit(s)"
        assert l0_hits == 0, f"the read should never reach the older L0 SST once the memtable answers it, got {l0_hits} L0 hit(s)"

        print(f"db['k1'] = {value!r} (older SST on disk still holds 'A')")
        print(f"memtable hits: {memtable_hits}, L0 (SSTable) hits: {l0_hits}")
        return value, memtable_hits, l0_hits
    finally:
        db.close()
        shutil.rmtree(path, ignore_errors=True)


def range_read_merges_sorted_runs():
    """A range scan has no single newest structure to stop at: it must merge the memtable's sorted
    run with the SST's sorted run, keeping only the newest version of any key both of them hold."""
    db, path, _ = fresh_db()
    try:
        for i in range(1, 6):
            db[f"k{i}"] = "old"
        db.flush()
        db["k3"] = "new"
        db["k6"] = "new"

        it = db.iter()
        it.seek_to_first()
        result = []
        while it.valid():
            result.append((it.key(), it.value()))
            it.next()

        expected = [("k1", "old"), ("k2", "old"), ("k3", "new"), ("k4", "old"), ("k5", "old"), ("k6", "new")]
        assert result == expected, f"expected the merged, deduplicated run {expected}, got {result}"

        print(f"merged range scan: {result}")
        return result
    finally:
        db.close()
        shutil.rmtree(path, ignore_errors=True)


def tombstones_are_not_free():
    """Deleting half of a flushed file's keys and flushing again produces a second SST made almost
    entirely of tombstones. The original file is untouched: total size on disk grows from a delete."""
    db, path, _ = fresh_db()
    try:
        n = 500
        assert n // 2 == 250, "this experiment's own numbers are written for n = 500 (250 deleted)"
        for i in range(n):
            db[f"k{i:06d}"] = "v" * 20
        db.flush()
        files_after_insert = db.live_files()
        size_after_insert = sum(f["size"] for f in files_after_insert)

        for i in range(0, n, 2):
            del db[f"k{i:06d}"]
        db.flush()
        files_after_delete = db.live_files()
        size_after_delete = sum(f["size"] for f in files_after_delete)

        tombstone_file = min(files_after_delete, key=lambda f: f["num_entries"])

        assert len(files_after_insert) == 1, f"expected one SST after the initial insert, got {len(files_after_insert)}"
        assert len(files_after_delete) == 2, f"expected a second, separate SST after deleting half the keys, got {len(files_after_delete)}"
        assert tombstone_file["num_deletions"] == n // 2, f"expected {n // 2} tombstones in the new SST, got {tombstone_file['num_deletions']}"
        assert tombstone_file["num_entries"] == n // 2, f"a tombstone-only SST's entries should equal its deletions, got {tombstone_file['num_entries']} entries vs {tombstone_file['num_deletions']} deletions"
        assert size_after_delete > size_after_insert, f"deleting keys should grow total on-disk size (a new tombstone file), {size_after_insert} -> {size_after_delete}"
        # Deterministic on this RocksDB build (confirmed across repeated runs): pin the exact byte counts too, not just the direction.
        assert size_after_insert == 5187, f"expected 5187 bytes after the first flush of {n} keys, got {size_after_insert}"
        assert size_after_delete == 7926, f"expected 7926 total bytes after the delete-and-flush, got {size_after_delete}"

        print(f"after inserting {n} keys and flushing: {len(files_after_insert)} file, {size_after_insert} bytes")
        print(f"after deleting {n // 2} of them and flushing: {len(files_after_delete)} files, {size_after_delete} bytes (grew)")
        print(f"the new file holds {tombstone_file['num_entries']} entries, all {tombstone_file['num_deletions']} of them tombstones")
        return size_after_insert, size_after_delete, tombstone_file
    finally:
        db.close()
        shutil.rmtree(path, ignore_errors=True)


def bloom_filter_rejects_absent_keys():
    """A per-file Bloom filter lets most lookups for an absent key skip the actual block read.
    Querying keys that fall inside the file's own key range (so RocksDB can't skip the file on
    range alone) forces a real Bloom-filter check for every one of them."""
    opts = rocksdict.Options()
    opts.create_if_missing(True)
    opts.enable_statistics()
    bbo = rocksdict.BlockBasedOptions()
    bbo.set_bloom_filter(10, False)
    opts.set_block_based_table_factory(bbo)
    db, path, _ = fresh_db(opts=opts)
    try:
        n = 500
        for i in range(n):
            db[f"k{i:06d}"] = "v" * 20
        db.flush()

        for i in range(n):
            _ = db.get(f"k{i:06d}a")  # absent, but lexically inside k000000..k000499

        stats = opts.get_statistics()

        def stat(name):
            for line in stats.split("\n"):
                if line.startswith(name + " "):
                    return int(line.split(":")[1].strip())
            return None

        useful = stat("rocksdb.bloom.filter.useful")
        false_positives = stat("rocksdb.bloom.filter.full.positive")
        true_positives = stat("rocksdb.bloom.filter.full.true.positive")

        assert useful + false_positives == n, f"every one of the {n} lookups should be either rejected by the filter or a false positive, got {useful} + {false_positives}"
        assert true_positives == 0, f"none of these {n} keys actually exist, so there should be no true positive, got {true_positives}"
        assert useful > n * 0.9, f"a 10-bits-per-key Bloom filter should reject the large majority of absent-key lookups, only rejected {useful} of {n}"
        # Deterministic on this RocksDB build (confirmed across repeated runs): pin the exact split too.
        assert useful == 494, f"expected 494 lookups rejected by the filter, got {useful}"
        assert false_positives == 6, f"expected 6 false positives, got {false_positives}"

        print(f"{n} lookups for keys that don't exist, inside the file's own key range:")
        print(f"  rejected by the Bloom filter without touching the block: {useful}")
        print(f"  false positives that still had to read a block: {false_positives}")
        return useful, false_positives, true_positives
    finally:
        db.close()
        shutil.rmtree(path, ignore_errors=True)


def main():
    memtable_flush_lifecycle()
    point_read_checks_newest_first()
    range_read_merges_sorted_runs()
    tombstones_are_not_free()
    bloom_filter_rejects_absent_keys()
    print("lsm-trees-write-read examples: all checks pass")


if __name__ == "__main__":
    main()
