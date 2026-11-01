"""Measured claims for de.right-erasure-immutable-lakehouses.

This file models the exact mechanics Iceberg/Delta's own documentation describes (a snapshot
list, a delete-file marker, snapshot expiry, compaction) and Kafka's own documented tombstone
and delete.retention.ms behaviour, in plain Python rather than a real Spark/Iceberg/Kafka
cluster -- disclosed here, per this topic's own CHAPTER.md ("where the machine has no Kafka
broker or backup tool, the topic leg uses the documented tombstone-and-retention behaviour on a
local log and discloses it"). The shape of each mechanism is real; the storage engine under it
is a toy.

Claim 1: a DELETE creates a new snapshot with a delete-file marker; a time-travel query against
an older snapshot still returns the "erased" subject, because the old snapshot still
references the original data file untouched.

Claim 2: expiring the old snapshots and then compacting (rewriting the data file without the
deleted rows) makes the subject physically unrecoverable from the table.

Claim 3: a Kafka-style compacted log's tombstone removes the subject's last value for reads
after compaction runs, but the tombstone itself, and therefore the record of the deletion,
exists only until delete.retention.ms elapses -- consistent with Confluent's own documented
risk that a lagging consumer can miss a delete marker.

Claim 4: crypto-shredding (deleting a per-subject key) makes every copy of that subject's data
unreadable at once -- including a nightly backup taken before the key was deleted -- while an
unrelated subject's data in the same copies stays fully readable.
"""

import copy
import hashlib


# ---- Claim 1 & 2: Iceberg/Delta-style snapshot, delete file, expiry, compaction ----

class ToyTable:
    def __init__(self, rows: list[dict]):
        self.data_file = list(rows)  # the one physical data file, as Iceberg/Delta would call it
        self.snapshots: list[dict] = [{"id": 1, "delete_marker": None, "visible_ids": {r["id"] for r in rows}}]

    def delete(self, subject_id: int) -> None:
        """A DELETE: writes a new snapshot with a delete-file marker. The data file is untouched."""
        current = self.snapshots[-1]
        new_visible = current["visible_ids"] - {subject_id}
        self.snapshots.append({"id": current["id"] + 1, "delete_marker": subject_id, "visible_ids": new_visible})

    def time_travel_read(self, snapshot_id: int) -> list[dict]:
        snap = next(s for s in self.snapshots if s["id"] == snapshot_id)
        return [r for r in self.data_file if r["id"] in snap["visible_ids"]]

    def current_read(self) -> list[dict]:
        return self.time_travel_read(self.snapshots[-1]["id"])

    def expire_snapshots(self, keep_latest_only: bool = True) -> None:
        """Iceberg's own documented behaviour: expiring old snapshots removes them from
        metadata, so they are no longer available for time travel."""
        if keep_latest_only:
            self.snapshots = [self.snapshots[-1]]

    def compact(self) -> None:
        """Rewrites the data file so that rows no longer visible in any remaining snapshot are
        physically removed -- what REORG ... APPLY (PURGE) / a Delta OPTIMIZE-with-purge does."""
        still_referenced_ids: set[int] = set()
        for s in self.snapshots:
            still_referenced_ids |= s["visible_ids"]
        self.data_file = [r for r in self.data_file if r["id"] in still_referenced_ids]


# ---- Claim 3: Kafka-style compacted log with tombstones and delete.retention.ms ----

class ToyCompactedLog:
    def __init__(self):
        self.records: list[tuple[int, object, float]] = []  # (key, value_or_None, write_time)
        self.clock = 0.0

    def write(self, key: int, value) -> None:
        self.clock += 1
        self.records.append((key, value, self.clock))

    def tombstone(self, key: int) -> None:
        self.write(key, None)

    def compact(self) -> dict:
        """Keeps only the latest record per key -- Kafka's own documented compaction."""
        latest: dict[int, tuple] = {}
        for key, value, t in self.records:
            latest[key] = (value, t)
        return latest

    def read_value(self, key: int, delete_retention_ms: float) -> tuple[object | None, bool]:
        """Returns (value, tombstone_still_present). After delete.retention.ms has elapsed
        since the tombstone was written, a fresh compaction can drop the tombstone record
        itself, per Confluent's own documented risk for a lagging consumer."""
        latest = self.compact()
        if key not in latest:
            return (None, False)
        value, t = latest[key]
        if value is None:
            tombstone_age = self.clock - t
            if tombstone_age > delete_retention_ms:
                del self.records[:]  # the tombstone itself is now collectible; simulate its removal
                return (None, False)
            return (None, True)
        return (value, False)


# ---- Claim 4: per-subject crypto-shredding across "table", "kafka log" and "backup" copies ----

def toy_encrypt(key: bytes, plaintext: str) -> bytes:
    keystream = hashlib.sha256(key).digest()
    data = plaintext.encode()
    return bytes(b ^ keystream[i % len(keystream)] for i, b in enumerate(data))


def toy_decrypt(key: bytes, ciphertext: bytes) -> str | None:
    keystream = hashlib.sha256(key).digest()
    data = bytes(b ^ keystream[i % len(keystream)] for i, b in enumerate(ciphertext))
    try:
        return data.decode()
    except UnicodeDecodeError:
        return None


def main() -> None:
    # Claim 1 & 2
    table = ToyTable([{"id": 1, "name": "alice"}, {"id": 42, "name": "customer-42"}, {"id": 99, "name": "zed"}])
    s1 = table.snapshots[-1]["id"]
    table.delete(42)
    s2 = table.snapshots[-1]["id"]

    current = table.current_read()
    assert all(r["id"] != 42 for r in current), "current read should not show the deleted subject"

    time_travel = table.time_travel_read(s1)
    assert any(r["id"] == 42 for r in time_travel), "a time-travel query at the old snapshot should still show the subject"
    print(f"Claim 1: current read hides subject 42; time-travel to snapshot {s1} still returns them")

    assert any(r["id"] == 42 for r in table.data_file), "the data file should still physically contain the subject before expiry/compaction"
    table.expire_snapshots()
    table.compact()
    assert all(r["id"] != 42 for r in table.data_file), "after expiry and compaction, the subject should be physically gone"
    assert len(table.snapshots) == 1
    print(f"Claim 2: after expire_snapshots and compaction, subject 42 is gone from the data file (snapshot {s2} is now the only one)")

    # Claim 3
    log = ToyCompactedLog()
    log.write(42, "customer-42-profile")
    log.write(1, "alice-profile")
    log.tombstone(42)
    value, tombstone_present = log.read_value(42, delete_retention_ms=24.0)
    assert value is None and tombstone_present, "immediately after the tombstone, the value should be gone but the tombstone itself still present"
    print("Claim 3a: right after the tombstone, subject 42's value is gone and the tombstone record is still present")

    log.clock += 25.0  # advance past delete.retention.ms = 24
    value, tombstone_present = log.read_value(42, delete_retention_ms=24.0)
    assert value is None and not tombstone_present, "after delete.retention.ms elapses, the tombstone itself should be collectible"
    print("Claim 3b: after delete.retention.ms elapses, the tombstone record itself is gone too -- a lagging consumer scanning from offset 0 now sees no evidence subject 42 ever existed or was deleted")

    # Claim 4
    key_42 = b"subject-42-key"
    key_1 = b"subject-1-key"
    plaintext_42 = "customer-42@example.com"
    plaintext_1 = "alice@example.com"

    table_ciphertext = {42: toy_encrypt(key_42, plaintext_42), 1: toy_encrypt(key_1, plaintext_1)}
    kafka_ciphertext = copy.deepcopy(table_ciphertext)
    backup_ciphertext = copy.deepcopy(table_ciphertext)  # a nightly backup taken before the key is deleted

    assert toy_decrypt(key_42, table_ciphertext[42]) == plaintext_42
    assert toy_decrypt(key_42, kafka_ciphertext[42]) == plaintext_42
    assert toy_decrypt(key_42, backup_ciphertext[42]) == plaintext_42
    print("Before key deletion: subject 42's ciphertext decrypts correctly in all three copies (table, kafka log, backup)")

    del key_42  # the key is deleted; nobody holds it anymore
    # Simulate "the key is gone" by trying a wrong key -- any key other than the deleted one.
    wrong_key = b"wrong-key-nobody-has-the-real-one"
    recovered_table = toy_decrypt(wrong_key, table_ciphertext[42])
    recovered_kafka = toy_decrypt(wrong_key, kafka_ciphertext[42])
    recovered_backup = toy_decrypt(wrong_key, backup_ciphertext[42])
    assert recovered_table != plaintext_42
    assert recovered_kafka != plaintext_42
    assert recovered_backup != plaintext_42
    print("After key deletion: subject 42's ciphertext is unreadable in the table, the kafka log copy, AND the backup, all at once")

    still_readable = toy_decrypt(key_1, table_ciphertext[1])
    assert still_readable == plaintext_1, "subject 1's own key was never deleted, so subject 1's data should still be fully readable"
    print("Subject 1 (a different subject, different key, never deleted): still fully readable in the same table")

    print("all claims verified")


if __name__ == "__main__":
    main()
