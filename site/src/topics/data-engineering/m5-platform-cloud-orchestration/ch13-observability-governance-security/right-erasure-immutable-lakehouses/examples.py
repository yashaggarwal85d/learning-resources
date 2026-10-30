"""Examples for de.right-erasure-immutable-lakehouses.

The table leg below runs against a real Delta Lake table (`pip install deltalake pyarrow`) --
DELETE, time travel and VACUUM are the actual library calls, not a simulation. The Kafka leg
and the backup leg use a local, documented stand-in: no broker or backup tool is assumed to be
on this machine, so a compacted in-memory log and a plain directory copy illustrate the same
tombstone-and-retention and backup-survives-the-table behaviour Kafka's and any backup tool's
own documentation describe. The crypto-shredding leg reuses topic 5's toy-KMS pattern (XOR
"encryption" under a key the KMS can forget), applied here across all three artefacts at once.
"""

import random
import shutil
import tempfile

from deltalake import DeltaTable, write_deltalake
import pyarrow as pa


# --- 1. The table: DELETE, time travel, VACUUM (real Delta Lake) -----------------------------

def erase_from_table_with_sql(table_dir, backup_dir):
    """DELETE removes the row from every normal query, but the OLD snapshot -- and the files it
    points at -- are still on disk and still readable by time travel, until the snapshot expires
    and the now-unreferenced files are vacuumed away."""
    table = pa.table({"id": [1, 2, 3], "name": ["alice", "bob", "carla"]})
    write_deltalake(table_dir, table, mode="overwrite")

    # A nightly backup, taken before anyone asked for the subject to be erased. No table
    # operation that runs against table_dir from here on ever touches this separate copy.
    shutil.copytree(table_dir, backup_dir, dirs_exist_ok=True)

    dt = DeltaTable(table_dir)
    version_before_delete = dt.version()

    dt.delete("id = 2")  # the subject being erased
    version_after_delete = dt.version()

    live_query = dt.to_pandas()
    time_travel_query = DeltaTable(table_dir, version=version_before_delete).to_pandas()

    # VACUUM with zero retention: remove files no longer referenced by the CURRENT snapshot.
    # (Production tables keep Delta's own 7-day default; a lab needs to see the effect at once.)
    dt.vacuum(retention_hours=0, dry_run=False, enforce_retention_duration=False)

    time_travel_after_vacuum_failed = False
    try:
        DeltaTable(table_dir, version=version_before_delete).to_pandas()
    except Exception:
        time_travel_after_vacuum_failed = True

    return {
        "version_before_delete": version_before_delete,
        "version_after_delete": version_after_delete,
        "subject_in_live_query": "bob" in live_query["name"].tolist(),
        "subject_in_time_travel_before_vacuum": "bob" in time_travel_query["name"].tolist(),
        "time_travel_fails_after_vacuum": time_travel_after_vacuum_failed,
    }


# --- 2. The Kafka topic: a compacted log, a tombstone, retention -----------------------------

class CompactedLog:
    """A stand-in for a Kafka compacted topic: a dict keeps the latest value per key, a
    None-valued record is a tombstone, and the tombstone itself is only forgotten after its own
    retention window (24 hours by default, per Kafka's own documentation)."""

    def __init__(self, retention_seconds):
        self.retention_seconds = retention_seconds
        self.latest = {}       # key -> value, None for a live tombstone
        self.tombstoned_at = {}  # key -> the time the tombstone was written

    def produce(self, key, value):
        self.latest[key] = value
        self.tombstoned_at.pop(key, None)

    def tombstone(self, key, now):
        self.latest[key] = None
        self.tombstoned_at[key] = now

    def compact(self, now):
        """Compaction keeps the latest record per key; a tombstone older than the retention
        window is itself finally removed."""
        expired = [k for k, t in self.tombstoned_at.items() if now - t >= self.retention_seconds]
        for k in expired:
            del self.latest[k]
            del self.tombstoned_at[k]
        return expired


def erase_from_kafka_topic():
    log = CompactedLog(retention_seconds=24 * 3600)
    log.produce("customer-42", "alice")

    t0 = 0
    log.tombstone("customer-42", now=t0)
    value_right_after_tombstone = log.latest["customer-42"]       # still a key, value None
    key_present_right_after_tombstone = "customer-42" in log.latest

    # Compacting before the retention window has elapsed changes nothing.
    log.compact(now=t0 + 3600)                                     # one hour later
    key_present_before_retention_elapses = "customer-42" in log.latest

    # Compacting after the retention window finally drops the key entirely.
    log.compact(now=t0 + 25 * 3600)                                 # 25 hours later
    key_present_after_retention_elapses = "customer-42" in log.latest

    return {
        "value_right_after_tombstone": value_right_after_tombstone,
        "key_present_right_after_tombstone": key_present_right_after_tombstone,
        "key_present_before_retention_elapses": key_present_before_retention_elapses,
        "key_present_after_retention_elapses": key_present_after_retention_elapses,
    }


# --- 3. The backup: a plain directory copy, untouched by the table's own DELETE --------------

def backup_survives_a_table_delete(backup_dir):
    """The backup was copied before the table's own DELETE and VACUUM ever ran, so nothing that
    happened to table_dir afterwards reaches it."""
    backup_table = DeltaTable(backup_dir)
    backup_rows = backup_table.to_pandas()
    return {"subject_in_backup": "bob" in backup_rows["name"].tolist()}


# --- 4. Crypto-shredding: one key, every copy of the subject unreadable at once ---------------

class ToyKMS:
    """Same toy KEK store as topic 5: wrap/unwrap only ever handle a small key, never the data."""

    def __init__(self, seed=1):
        self._rng = random.Random(seed)
        self._keys = {}

    def generate_key(self, key_id):
        self._keys[key_id] = self._rng.randint(10**9, 10**10)
        return key_id

    def forget(self, key_id):
        del self._keys[key_id]

    def encrypt(self, key_id, value):
        return value ^ self._keys[key_id]

    def decrypt(self, key_id, ciphertext):
        return ciphertext ^ self._keys[key_id]

    def has_key(self, key_id):
        return key_id in self._keys


def crypto_shred_across_all_three_copies():
    """Encrypt the same subject's value under one per-subject key, store a "copy" of the
    ciphertext in three different artefacts (table, topic, backup), then delete the key once --
    every copy becomes unreadable at the same moment, without touching the table, the topic, or
    the backup at all."""
    kms = ToyKMS()
    key_id = "subject-42"
    kms.generate_key(key_id)

    plaintext = 42424242
    copies = {
        "table": kms.encrypt(key_id, plaintext),
        "kafka_topic": kms.encrypt(key_id, plaintext),
        "backup": kms.encrypt(key_id, plaintext),
    }

    readable_before = {name: kms.decrypt(key_id, c) == plaintext for name, c in copies.items()}

    kms.forget(key_id)  # the one operation: delete the key

    readable_after = {}
    for name, c in copies.items():
        try:
            kms.decrypt(key_id, c)
            readable_after[name] = True
        except KeyError:
            readable_after[name] = False

    return {
        "readable_before_all_three": all(readable_before.values()),
        "readable_after_any": any(readable_after.values()),
        "copies_touched_to_erase": 0,  # the table, topic and backup files themselves are untouched
    }


def main():
    table_dir = tempfile.mkdtemp(prefix="erasure-lab-")
    backup_dir = tempfile.mkdtemp(prefix="backup-")
    try:
        table_result = erase_from_table_with_sql(table_dir, backup_dir)
        print(
            f"table: DELETE moved v{table_result['version_before_delete']} -> "
            f"v{table_result['version_after_delete']}; subject in live query: "
            f"{table_result['subject_in_live_query']}; subject still in time travel before "
            f"vacuum: {table_result['subject_in_time_travel_before_vacuum']}; time travel fails "
            f"after vacuum: {table_result['time_travel_fails_after_vacuum']}"
        )
        assert table_result["subject_in_live_query"] is False
        assert table_result["subject_in_time_travel_before_vacuum"] is True
        assert table_result["time_travel_fails_after_vacuum"] is True

        backup_result = backup_survives_a_table_delete(backup_dir)
        print(f"backup: subject still present in the backup copy: {backup_result['subject_in_backup']}")
        assert backup_result["subject_in_backup"] is True
    finally:
        shutil.rmtree(table_dir, ignore_errors=True)
        shutil.rmtree(backup_dir, ignore_errors=True)

    kafka_result = erase_from_kafka_topic()
    print(
        f"kafka topic: value right after tombstone={kafka_result['value_right_after_tombstone']!r}, "
        f"key present right after={kafka_result['key_present_right_after_tombstone']}, "
        f"key present before retention elapses={kafka_result['key_present_before_retention_elapses']}, "
        f"key present after retention elapses={kafka_result['key_present_after_retention_elapses']}"
    )
    assert kafka_result["value_right_after_tombstone"] is None
    assert kafka_result["key_present_right_after_tombstone"] is True
    assert kafka_result["key_present_before_retention_elapses"] is True
    assert kafka_result["key_present_after_retention_elapses"] is False

    shred_result = crypto_shred_across_all_three_copies()
    print(
        f"crypto-shredding: all three copies readable before={shred_result['readable_before_all_three']}, "
        f"any copy readable after the one key is deleted={shred_result['readable_after_any']}, "
        f"copies (table/topic/backup files) touched to erase them={shred_result['copies_touched_to_erase']}"
    )
    assert shred_result["readable_before_all_three"] is True
    assert shred_result["readable_after_any"] is False
    assert shred_result["copies_touched_to_erase"] == 0

    print("de.right-erasure-immutable-lakehouses examples: all checks pass")


if __name__ == "__main__":
    main()
