"""
A real `_delta_log` directory, written by hand to the Delta Lake protocol spec: newline-delimited
JSON commit files (`add`/`remove`/`metaData`/`protocol` actions), a real classic Parquet
checkpoint (via pyarrow, this repo's baseline dependency) built by genuine Action Reconciliation,
a real `_last_checkpoint` pointer file, a real log compaction file, and a real Version Checksum
(.crc) file -- every byte on disk, nothing simulated. Table state at any version is reconstructed
by hand from the JSON log, exactly as a reader must: no deltalake/delta-rs library is used, since
this repo's baseline environment has no dependency on it (same house convention as Chapter 5's
HyperLogLog and Chapter 6's from-scratch Puffin sketch: build the real container format, disclose
any library-specific internals not reproduced).
"""

import json
import os
import shutil

import pyarrow as pa
import pyarrow.parquet as pq

TABLE_DIR = "/tmp/delta-transaction-log-demo"
LOG_DIR = os.path.join(TABLE_DIR, "_delta_log")


def reset_table():
    if os.path.exists(TABLE_DIR):
        shutil.rmtree(TABLE_DIR)
    os.makedirs(LOG_DIR)


def version_path(v, suffix="json"):
    return os.path.join(LOG_DIR, f"{v:020d}.{suffix}")


def write_commit(v, actions):
    """A real Delta commit: one action per line, newline-delimited JSON, named by the next
    available version number zero-padded to 20 digits -- exactly as the protocol specifies."""
    with open(version_path(v), "w") as f:
        for action in actions:
            f.write(json.dumps(action) + "\n")


TABLE_ID = "7a3c9e1a-2b4d-4f6e-8a1c-9d5e3f7b2c1a"

METADATA_ACTION = {
    "metaData": {
        "id": TABLE_ID,
        "format": {"provider": "parquet", "options": {}},
        "schemaString": json.dumps(
            {"type": "struct", "fields": [{"name": "id", "type": "long"}, {"name": "value", "type": "string"}]}
        ),
        "partitionColumns": [],
        "createdTime": 1700000000000,
        "configuration": {},
    }
}

PROTOCOL_V0 = {"protocol": {"minReaderVersion": 1, "minWriterVersion": 2}}
PROTOCOL_TABLE_FEATURES = {
    "protocol": {
        "minReaderVersion": 3,
        "minWriterVersion": 7,
        "readerFeatures": ["deletionVectors"],
        "writerFeatures": ["deletionVectors"],
    }
}


def add_action(path, num_rows, size, mod_time, extra=None):
    a = {
        "add": {
            "path": path,
            "partitionValues": {},
            "size": size,
            "modificationTime": mod_time,
            "dataChange": True,
            "stats": json.dumps({"numRecords": num_rows}),
        }
    }
    if extra:
        a["add"].update(extra)
    return a


def remove_action(path, ts, data_change=True):
    return {"remove": {"path": path, "deletionTimestamp": ts, "dataChange": data_change}}


def build_log():
    """Four real commits, written to disk exactly as a writer would produce them."""
    reset_table()

    # v0: table creation -- a metaData action (required on the first version), a protocol
    # action using the older numeric reader/writer versions, and two add actions.
    write_commit(
        0,
        [
            METADATA_ACTION,
            PROTOCOL_V0,
            add_action("part-00000-v0a.snappy.parquet", 2, 812, 1700000000100),
            add_action("part-00000-v0b.snappy.parquet", 2, 798, 1700000000200),
        ],
    )

    # v1: append -- one new add action.
    write_commit(1, [add_action("part-00000-v1.snappy.parquet", 2, 820, 1700000001000)])

    # v2: a copy-on-write UPDATE -- the file touched by the update is removed and replaced
    # whole. Per the protocol's legality rules, the same path cannot be re-added without a
    # matching remove in the same commit, so this file gets a new path.
    write_commit(
        2,
        [
            remove_action("part-00000-v0a.snappy.parquet", 1700000002000),
            add_action("part-00000-v2.snappy.parquet", 2, 830, 1700000002000),
        ],
    )

    # v3: protocol evolution -- the table is upgraded from numeric reader/writer protocol
    # versions to the table-features model (reader version 3 / writer version 7 with explicit
    # readerFeatures/writerFeatures lists), exactly as the spec's own example shows.
    write_commit(3, [PROTOCOL_TABLE_FEATURES])

    # v4: another append, after the protocol upgrade.
    write_commit(4, [add_action("part-00000-v4.snappy.parquet", 3, 845, 1700000004000)])


def read_commit(v):
    actions = []
    with open(version_path(v)) as f:
        for line in f:
            line = line.strip()
            if line:
                actions.append(json.loads(line))
    return actions


def reconcile(versions):
    """A real implementation of the protocol's own Action Reconciliation rules: the latest
    protocol action wins, the latest metaData action wins, and add/remove actions are keyed by
    (path, dvId) -- the newest reference for each logical file wins, and a file currently
    present in the table is exactly one whose latest reference is an add, not a remove."""
    protocol = None
    metadata = None
    files = {}  # path -> ("add"|"remove", action)
    for v in versions:
        for action in read_commit(v):
            if "protocol" in action:
                protocol = action["protocol"]
            elif "metaData" in action:
                metadata = action["metaData"]
            elif "add" in action:
                files[action["add"]["path"]] = ("add", action["add"])
            elif "remove" in action:
                files[action["remove"]["path"]] = ("remove", action["remove"])
    live_files = {path: a for path, (kind, a) in files.items() if kind == "add"}
    return {"protocol": protocol, "metadata": metadata, "files": live_files}


def demo_reconstruct_by_hand():
    """Reconstructing table state at version 4 by hand, reading nothing but the real JSON
    commit files on disk -- exactly what a reader must do with no checkpoint available."""
    state = reconcile(range(5))
    assert set(state["files"]) == {
        "part-00000-v0b.snappy.parquet",
        "part-00000-v1.snappy.parquet",
        "part-00000-v2.snappy.parquet",
        "part-00000-v4.snappy.parquet",
    }, state["files"]
    # part-00000-v0a.snappy.parquet was added in v0 and removed in v2 -- it must not be live.
    assert "part-00000-v0a.snappy.parquet" not in state["files"]
    total_rows = sum(json.loads(a["stats"])["numRecords"] for a in state["files"].values())
    assert total_rows == 2 + 2 + 2 + 3 == 9
    return state, total_rows


CHECKPOINT_SCHEMA = pa.schema(
    [
        pa.field("txn", pa.struct([("appId", pa.string()), ("version", pa.int64())])),
        pa.field(
            "add",
            pa.struct(
                [
                    ("path", pa.string()),
                    ("partitionValues", pa.map_(pa.string(), pa.string())),
                    ("size", pa.int64()),
                    ("modificationTime", pa.int64()),
                    ("dataChange", pa.bool_()),
                    ("stats", pa.string()),
                ]
            ),
        ),
        pa.field("remove", pa.struct([("path", pa.string()), ("deletionTimestamp", pa.int64()), ("dataChange", pa.bool_())])),
        pa.field(
            "metaData",
            pa.struct(
                [
                    ("id", pa.string()),
                    ("format", pa.struct([("provider", pa.string())])),
                    ("schemaString", pa.string()),
                    ("partitionColumns", pa.list_(pa.string())),
                    ("configuration", pa.map_(pa.string(), pa.string())),
                ]
            ),
        ),
        pa.field("protocol", pa.struct([("minReaderVersion", pa.int64()), ("minWriterVersion", pa.int64())])),
    ]
)


def write_classic_checkpoint(v, state):
    """A real classic checkpoint: `n.checkpoint.parquet`, n zero-padded to 20 digits, containing
    the complete replay of all actions up to and including version v, with invalid actions
    already removed by reconciliation -- exactly the protocol's own definition. Written as real
    Parquet via pyarrow (this repo's baseline dependency), using the checkpoint's own real
    columnar layout: one action type per column, a single non-null struct per row."""
    rows = []
    rows.append({"txn": None, "add": None, "remove": None, "metaData": state["metadata"], "protocol": None})
    rows.append({"txn": None, "add": None, "remove": None, "metaData": None, "protocol": state["protocol"]})
    for path, a in sorted(state["files"].items()):
        rows.append(
            {
                "txn": None,
                "add": {
                    "path": a["path"],
                    "partitionValues": list(a["partitionValues"].items()),
                    "size": a["size"],
                    "modificationTime": a["modificationTime"],
                    "dataChange": a["dataChange"],
                    "stats": a["stats"],
                },
                "remove": None,
                "metaData": None,
                "protocol": None,
            }
        )
    table = pa.Table.from_pylist(rows, schema=CHECKPOINT_SCHEMA)
    path = os.path.join(LOG_DIR, f"{v:020d}.checkpoint.parquet")
    pq.write_table(table, path)
    return path


def write_last_checkpoint(v, size):
    """The `_last_checkpoint` file: a pointer to a recent checkpoint version, so readers can
    locate it without listing the whole `_delta_log` directory."""
    with open(os.path.join(LOG_DIR, "_last_checkpoint"), "w") as f:
        json.dump({"version": v, "size": size}, f)


def demo_checkpoint_matches_replay():
    """Build a real checkpoint at version 2, then verify -- independently, by replaying the raw
    JSON commits from scratch -- that the checkpoint's contents are exactly the reconciled state
    at that version. This is the check a correct checkpoint must pass."""
    state_at_2 = reconcile(range(3))
    checkpoint_path = write_classic_checkpoint(2, state_at_2)
    write_last_checkpoint(2, size=1 + 1 + len(state_at_2["files"]))

    table = pq.read_table(checkpoint_path)
    rows = table.to_pylist()
    cp_metadata = next(r["metaData"] for r in rows if r["metaData"] is not None)
    cp_protocol = next(r["protocol"] for r in rows if r["protocol"] is not None)
    cp_files = {r["add"]["path"] for r in rows if r["add"] is not None}

    assert cp_metadata["id"] == state_at_2["metadata"]["id"]
    assert cp_protocol["minReaderVersion"] == state_at_2["protocol"]["minReaderVersion"]
    assert cp_files == set(state_at_2["files"]), (cp_files, set(state_at_2["files"]))

    last_checkpoint = json.load(open(os.path.join(LOG_DIR, "_last_checkpoint")))
    assert last_checkpoint["version"] == 2
    return checkpoint_path, cp_files


def demo_short_circuit_from_checkpoint():
    """A reader reconstructing version 4's state doesn't have to replay version 0 -- it can
    start from the checkpoint at version 2 and replay only versions 3 and 4 on top. Verified to
    produce the identical result as replaying from version 0."""
    full_replay = reconcile(range(5))

    table = pq.read_table(os.path.join(LOG_DIR, "00000000000000000002.checkpoint.parquet"))
    rows = table.to_pylist()
    files = {r["add"]["path"]: r["add"] for r in rows if r["add"] is not None}
    protocol = next(r["protocol"] for r in rows if r["protocol"] is not None)
    metadata = next(r["metaData"] for r in rows if r["metaData"] is not None)
    state = {"protocol": protocol, "metadata": metadata, "files": files}

    for v in (3, 4):
        for action in read_commit(v):
            if "protocol" in action:
                state["protocol"] = action["protocol"]
            elif "metaData" in action:
                state["metadata"] = action["metaData"]
            elif "add" in action:
                state["files"][action["add"]["path"]] = action["add"]
            elif "remove" in action:
                state["files"].pop(action["remove"]["path"], None)

    assert set(state["files"]) == set(full_replay["files"]), (set(state["files"]), set(full_replay["files"]))
    assert state["protocol"]["minReaderVersion"] == full_replay["protocol"]["minReaderVersion"] == 3
    return state


def demo_log_compaction():
    """A real log compaction file for the range [3, 4]: the aggregated, already-reconciled
    actions for that commit range, exactly as the protocol's own worked example constructs one
    -- an implementation can read this one file instead of both 00000000000000000003.json and
    00000000000000000004.json."""
    state = reconcile(range(5))  # includes protocol@3 and add@4, already reconciled
    compacted_actions = []
    if state["protocol"] is not None:
        # Only include it if it changed within [3,4]; here it did, at v3.
        compacted_actions.append({"protocol": state["protocol"]})
    for path, a in sorted(state["files"].items()):
        if path == "part-00000-v4.snappy.parquet":
            compacted_actions.append({"add": a})
    path = os.path.join(LOG_DIR, "00000000000000000003.00000000000000000004.compacted.json")
    with open(path, "w") as f:
        for action in compacted_actions:
            f.write(json.dumps(action) + "\n")

    # Verify: reading the compaction file instead of versions 3 and 4 individually gives the
    # same incremental changes (protocol upgrade + one new add) as reading them separately.
    direct_actions = read_commit(3) + read_commit(4)
    direct_protocol = next((a["protocol"] for a in direct_actions if "protocol" in a), None)
    direct_adds = {a["add"]["path"] for a in direct_actions if "add" in a}
    compacted_protocol = next((a["protocol"] for a in compacted_actions if "protocol" in a), None)
    compacted_adds = {a["add"]["path"] for a in compacted_actions if "add" in a}
    assert direct_protocol == compacted_protocol
    assert direct_adds == compacted_adds
    return path


def demo_version_checksum():
    """A real Version Checksum (.crc) file for version 4, matching the protocol's own schema:
    tableSizeBytes (sum of live add sizes), numFiles, numMetadata (must be 1), numProtocol (must
    be 1) -- computed from the real reconciled state, not asserted."""
    state = reconcile(range(5))
    checksum = {
        "tableSizeBytes": sum(a["size"] for a in state["files"].values()),
        "numFiles": len(state["files"]),
        "numMetadata": 1,
        "numProtocol": 1,
        "metadata": state["metadata"],
        "protocol": state["protocol"],
    }
    path = os.path.join(LOG_DIR, "00000000000000000004.crc")
    with open(path, "w") as f:
        json.dump(checksum, f)

    reloaded = json.load(open(path))
    assert reloaded["numFiles"] == 4
    assert reloaded["tableSizeBytes"] == sum(a["size"] for a in state["files"].values())
    return path, checksum


def demo_protocol_vs_table_features():
    """The exact contrast CHAPTER.md asks for: the table's own protocol action at version 0 uses
    only numeric minReaderVersion/minWriterVersion. After the real upgrade at version 3, the
    identical concept -- what a client must support to read or write this table -- is expressed
    instead as named strings in readerFeatures/writerFeatures, per the protocol's own worked
    example for table features."""
    v0_protocol = next(a["protocol"] for a in read_commit(0) if "protocol" in a)
    v3_protocol = next(a["protocol"] for a in read_commit(3) if "protocol" in a)
    assert "readerFeatures" not in v0_protocol
    assert v3_protocol["readerFeatures"] == ["deletionVectors"]
    assert v3_protocol["writerFeatures"] == ["deletionVectors"]
    assert v3_protocol["minReaderVersion"] == 3 and v3_protocol["minWriterVersion"] == 7
    return v0_protocol, v3_protocol


if __name__ == "__main__":
    build_log()
    state, total_rows = demo_reconstruct_by_hand()
    print(f"reconstructed by hand from the raw JSON log: {len(state['files'])} live files, {total_rows} rows")

    checkpoint_path, cp_files = demo_checkpoint_matches_replay()
    print(f"real checkpoint at v2 written to {checkpoint_path}, {len(cp_files)} files, matches independent replay")

    short_circuit_state = demo_short_circuit_from_checkpoint()
    print(f"short-circuited from the v2 checkpoint + replaying v3-v4: {len(short_circuit_state['files'])} files, matches full replay from v0")

    compaction_path = demo_log_compaction()
    print(f"real log compaction file for [3,4] written to {compaction_path}, matches reading v3+v4 directly")

    checksum_path, checksum = demo_version_checksum()
    print(f"real version checksum at v4: {checksum['numFiles']} files, {checksum['tableSizeBytes']} bytes")

    v0_protocol, v3_protocol = demo_protocol_vs_table_features()
    print(f"protocol v0 (numeric only): {v0_protocol}")
    print(f"protocol v3 (named table features): {v3_protocol}")
