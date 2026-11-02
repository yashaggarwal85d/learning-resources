"""
Two real statistics mechanisms, built and read back in this sandbox with the real `pyiceberg`
library (0.12.0) against a real table -- not simulations. First: a real column's lower and upper
bound, as pyiceberg's own Parquet writer actually stores them in the manifest for a long string
value, read directly off `table.inspect.data_files()` and compared against the real untruncated
value in the data file itself. Second: a real Theta sketch (K Minimum Values method, implemented
here from first principles in pure Python -- this repo's baseline environment has no dependency
on the real Apache DataSketches library the Puffin spec names, so the sketch *algorithm* is real
and the *container* bytes are real, but the sketch payload's exact wire encoding is this script's
own, disclosed in FACT-CHECK.md) serialized into a real Puffin file, byte-exact to the Puffin file
format spec (magic, blob, footer with JSON blob metadata), registered on the table through
pyiceberg's own public `update_statistics()` API, then read back by parsing the raw file bytes
independently of pyiceberg (which has no public Puffin blob reader), and compared against the
table's true distinct count. File paths and UUIDs are real-system randomness, so this script
asserts and prints structure and values rather than literal paths, verified byte-identical across
3 consecutive runs.
"""

import hashlib
import heapq
import json
import os
import struct
import tempfile

import pyarrow as pa
from pyiceberg.catalog.sql import SqlCatalog
from pyiceberg.schema import Schema
from pyiceberg.types import NestedField, StringType, LongType
from pyiceberg.table.statistics import StatisticsFile, BlobMetadata

ICEBERG_SCHEMA = Schema(
    NestedField(1, "id", LongType(), required=False),
    NestedField(2, "name", StringType(), required=False),
)
ARROW_SCHEMA = pa.schema([("id", pa.int64()), ("name", pa.string())])
ROW_COUNT = 20_000
LONG_NAME = "z" * 200
MIDDLE_NAME = "middle_value_here_longer_than_sixteen_bytes"

PUFFIN_MAGIC = bytes([0x50, 0x46, 0x41, 0x31])


class ThetaSketch:
    """A Theta sketch via the K Minimum Values method: retains the K smallest distinct hash
    values seen (a max-heap bounded to size K), and estimates distinct count as (K-1) / theta,
    where theta is the largest retained hash scaled into [0, 1) -- the fraction of the hash
    space the sketch has covered so far. Needing fewer retained values as more of the hash
    space is covered is exactly what keeps memory bounded regardless of stream length, the same
    shared idea this chapter's HyperLogLog topic (Chapter 5, §5.6) already built a different way."""

    HASH_SPACE = 2 ** 64

    def __init__(self, k=4096):
        self.k = k
        self._seen = set()
        self._heap = []  # max-heap of the k smallest distinct hashes, via negation

    def _hash(self, value):
        return int.from_bytes(hashlib.sha256(str(value).encode("utf-8")).digest()[:8], "big")

    def update(self, value):
        h = self._hash(value)
        if h in self._seen:
            return
        if len(self._heap) < self.k:
            heapq.heappush(self._heap, -h)
            self._seen.add(h)
        elif h < -self._heap[0]:
            evicted = -heapq.heapreplace(self._heap, -h)
            self._seen.discard(evicted)
            self._seen.add(h)

    def theta(self):
        if len(self._heap) < self.k:
            return 1.0
        return (-self._heap[0]) / self.HASH_SPACE

    def estimate(self):
        if len(self._heap) < self.k:
            return float(len(self._heap))
        return (self.k - 1) / self.theta()

    def serialize(self):
        body = struct.pack("<II", self.k, len(self._heap))
        for h in sorted(-x for x in self._heap):
            body += struct.pack("<Q", h)
        return body

    @staticmethod
    def deserialize(data):
        k, n = struct.unpack_from("<II", data, 0)
        sk = ThetaSketch(k=k)
        offset = 8
        for _ in range(n):
            (h,) = struct.unpack_from("<Q", data, offset)
            offset += 8
            sk._heap.append(-h)
            sk._seen.add(h)
        heapq.heapify(sk._heap)
        return sk


def build_table(warehouse_dir):
    """A real table of 20,000 rows, one data file, with one deliberately long string value and
    one deliberately mid-length one, so the manifest's string bounds actually get truncated."""
    catalog = SqlCatalog("default", uri=f"sqlite:///{warehouse_dir}/catalog.db", warehouse=f"file://{warehouse_dir}/data")
    catalog.create_namespace("ns")
    table = catalog.create_table("ns.events", schema=ICEBERG_SCHEMA)
    rows = [{"id": i, "name": f"user-{i:06d}"} for i in range(2, ROW_COUNT)]
    rows = [{"id": 0, "name": MIDDLE_NAME}, {"id": 1, "name": LONG_NAME}] + rows
    table.append(pa.Table.from_pylist(rows, schema=ARROW_SCHEMA))
    return catalog, catalog.load_table("ns.events"), rows


def demo_manifest_bounds_are_truncated(table, rows):
    """The real lower_bound and upper_bound pyiceberg's own writer stored for the `name` column,
    read directly off the manifest -- compared against the real minimum and maximum string values
    actually in the data file, which the truncated bounds only approximate."""
    data_files = table.inspect.data_files()
    name_field_id = 2
    bounds_row = data_files.column("lower_bounds")[0].as_py()
    lower_bounds = dict(bounds_row)
    upper_bounds = dict(data_files.column("upper_bounds")[0].as_py())
    lower_bound = lower_bounds[name_field_id]
    upper_bound = upper_bounds[name_field_id]

    true_min = min(r["name"] for r in rows)
    true_max = max(r["name"] for r in rows)

    assert len(lower_bound) == 16, "lower bound must be truncated to 16 bytes"
    assert len(upper_bound) == 16, "upper bound must be truncated to 16 bytes"
    assert lower_bound == true_min.encode("utf-8")[:16]
    assert upper_bound != true_max.encode("utf-8")[:16], "upper bound must be incremented past the truncated prefix"
    assert upper_bound[:15] == true_max.encode("utf-8")[:15]
    assert upper_bound[15] == true_max.encode("utf-8")[15] + 1, "last truncated byte must be incremented by one"
    assert true_min <= true_max
    assert len(true_max) > 16 and len(true_min) > 16, "both real values must be longer than the truncated bound"

    return {
        "lower_bound_bytes": lower_bound,
        "upper_bound_bytes": upper_bound,
        "true_min_length": len(true_min),
        "true_max_length": len(true_max),
    }


def write_puffin_sketch_file(table, warehouse_dir, rows):
    """A real Theta sketch over the table's `id` column, serialized into a real Puffin file --
    byte-exact to the Puffin file format spec's Magic/Blob/Footer structure -- then registered
    on the table through pyiceberg's own public `update_statistics()` API, the same call path a
    real writer uses to point a table at a statistics file it computed."""
    sketch = ThetaSketch(k=4096)
    for r in rows:
        sketch.update(r["id"])
    blob_bytes = sketch.serialize()
    ndv_property = str(round(sketch.estimate()))

    snapshot = table.metadata.current_snapshot()
    blob_metadata_json = {
        "type": "apache-datasketches-theta-v1",
        "fields": [1],
        "snapshot-id": snapshot.snapshot_id,
        "sequence-number": snapshot.sequence_number,
        "offset": len(PUFFIN_MAGIC),
        "length": len(blob_bytes),
        "properties": {"ndv": ndv_property},
    }
    footer_payload = json.dumps({"blobs": [blob_metadata_json]}).encode("utf-8")
    footer_payload_size = struct.pack("<i", len(footer_payload))
    flags = struct.pack("<I", 0)
    puffin_bytes = (
        PUFFIN_MAGIC + blob_bytes + PUFFIN_MAGIC + footer_payload + footer_payload_size + flags + PUFFIN_MAGIC
    )

    puffin_path = f"{warehouse_dir}/data/ns/events/metadata/stats-{snapshot.snapshot_id}.stats"
    os.makedirs(os.path.dirname(puffin_path), exist_ok=True)
    with open(puffin_path, "wb") as f:
        f.write(puffin_bytes)

    footer_size = len(PUFFIN_MAGIC) + len(footer_payload) + 4 + 4 + len(PUFFIN_MAGIC)
    with table.update_statistics() as update:
        update.set_statistics(statistics_file=StatisticsFile(
            snapshot_id=snapshot.snapshot_id,
            statistics_path=puffin_path,
            file_size_in_bytes=len(puffin_bytes),
            file_footer_size_in_bytes=footer_size,
            blob_metadata=[BlobMetadata(
                type="apache-datasketches-theta-v1",
                snapshot_id=snapshot.snapshot_id,
                sequence_number=snapshot.sequence_number,
                fields=[1],
                properties={"ndv": ndv_property},
            )],
        ))
    return puffin_path, ndv_property


def demo_statistics_registered_and_read_back(catalog, puffin_path, ndv_property, rows):
    """The statistics file is now real table metadata, read back from a freshly reloaded table.
    The sketch itself is then read back by parsing the raw Puffin bytes directly -- pyiceberg has
    no public reader for Puffin blob contents, the same shape of gap this chapter already met with
    equality deletes -- and its estimate is checked against the table's true distinct count."""
    reloaded = catalog.load_table("ns.events")
    assert len(reloaded.metadata.statistics) == 1
    registered = reloaded.metadata.statistics[0]
    assert registered.statistics_path == puffin_path
    assert registered.blob_metadata[0].type == "apache-datasketches-theta-v1"
    assert registered.blob_metadata[0].properties["ndv"] == ndv_property

    with open(puffin_path, "rb") as f:
        raw = f.read()
    assert raw[:4] == PUFFIN_MAGIC
    assert raw[-4:] == PUFFIN_MAGIC
    footer_payload_size = struct.unpack("<i", raw[-12:-8])[0]
    footer_json = json.loads(raw[-12 - footer_payload_size: -12])
    blob_entry = footer_json["blobs"][0]
    offset, length = blob_entry["offset"], blob_entry["length"]
    sketch = ThetaSketch.deserialize(raw[offset: offset + length])

    estimate = round(sketch.estimate())
    true_ndv = len(set(r["id"] for r in rows))
    error_pct = round(abs(estimate - true_ndv) / true_ndv * 100, 2)
    return estimate, true_ndv, error_pct


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as warehouse_dir:
        catalog, table, rows = build_table(warehouse_dir)

        bounds = demo_manifest_bounds_are_truncated(table, rows)
        print(f"manifest bounds: both real values are {bounds['true_min_length']}-"
              f"{bounds['true_max_length']} bytes, but the stored lower_bound and upper_bound "
              f"are truncated to 16 bytes each, with the upper bound's last byte incremented so "
              f"it still sorts above every real value")

        puffin_path, ndv_property = write_puffin_sketch_file(table, warehouse_dir, rows)
        estimate, true_ndv, error_pct = demo_statistics_registered_and_read_back(
            catalog, puffin_path, ndv_property, rows
        )
        print(f"Puffin statistics file: registered on the table via pyiceberg's own "
              f"update_statistics(), independently re-read from raw bytes, sketch estimate "
              f"{estimate} vs. true distinct count {true_ndv} ({error_pct}% error) over "
              f"{ROW_COUNT} rows")
