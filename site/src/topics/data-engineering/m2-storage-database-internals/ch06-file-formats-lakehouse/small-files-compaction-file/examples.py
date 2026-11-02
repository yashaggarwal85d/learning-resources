"""
de.small-files-compaction-file -- real demonstrations of where small files
come from, what they really cost, and what a real bin-pack compaction buys
back.

A real local directory stands in for a table partition's data files (this
chapter's own disclosed substitution, same as topic 17's). A streaming
job's micro-batch commits are reproduced directly: one small real file per
commit, same pattern Iceberg's own maintenance docs name as the reason
`rewriteDataFiles` exists ("small data files causes an unnecessary amount
of metadata and less efficient queries from file open costs").

Four real demonstrations:
  1. A streaming ingestion pattern produces many real small files for the
     same logical partition.
  2. Those many small files cost real, measured bytes of extra manifest
     metadata, and a real, measured amount of extra per-file open/LIST
     overhead -- both scale with file count alone, not with the data.
  3. A real bin-pack compaction merges the small files into few
     target-sized files, byte for byte, and both costs collapse by the
     same factor the file count did.
  4. The exact same bytes, compressed once as 200 separate streams versus
     once as a single stream, compress to a measurably different size --
     splitting data into small files loses the ability to compress across
     the split.
"""

import json
import os
import shutil
import zlib

BASE = "/tmp/small_files_compaction_demo"
SMALL_FILE_BYTES = 2_000
NUM_SMALL_FILES = 200
TARGET_FILE_BYTES = 40_000
MANIFEST_ENTRY_BYTES = 200
OPEN_COST_UNITS_PER_FILE = 50


def reset_base():
    if os.path.exists(BASE):
        shutil.rmtree(BASE)
    os.makedirs(BASE, exist_ok=True)


def write_streaming_partition(table_dir):
    """One real small file per streaming micro-batch commit."""
    os.makedirs(table_dir, exist_ok=True)
    paths = []
    for i in range(NUM_SMALL_FILES):
        pattern = bytes([i % 7, 0xAB, 0xCD, i % 13]) * (SMALL_FILE_BYTES // 4)
        path = os.path.join(table_dir, f"events-{i:05d}.bin")
        with open(path, "wb") as f:
            f.write(pattern[:SMALL_FILE_BYTES])
        paths.append(path)
    return paths


def write_manifest(table_dir, manifest_name, file_paths):
    """A real fixed-width manifest: one padded JSON entry per data file,
    so its measured size on disk is exactly MANIFEST_ENTRY_BYTES * file count."""
    manifest_path = os.path.join(table_dir, manifest_name)
    with open(manifest_path, "w") as f:
        for p in file_paths:
            entry = json.dumps({"path": os.path.basename(p), "size": os.path.getsize(p)})
            padded = entry.ljust(MANIFEST_ENTRY_BYTES - 1) + "\n"
            assert len(padded) == MANIFEST_ENTRY_BYTES
            f.write(padded)
    return manifest_path


def open_list_cost(file_paths):
    """A deterministic proxy for real per-file open/LIST overhead: a fixed
    cost per file touched, separate from the bytes actually read. Models
    Iceberg's documented 'file open cost' and the per-request overhead the
    AWS S3 Tables post measures (more, smaller requests per query), without
    timing a wall clock that could vary across machines."""
    overhead = OPEN_COST_UNITS_PER_FILE * len(file_paths)
    data_bytes = sum(os.path.getsize(p) for p in file_paths)
    return overhead, data_bytes


def bin_pack_compact(table_dir, small_paths, target_bytes):
    """A real bin-pack compaction: read each small file's real bytes, in
    order, and pack them into new files that each hold up to target_bytes."""
    compacted_dir = os.path.join(table_dir, "compacted")
    os.makedirs(compacted_dir, exist_ok=True)
    compacted_paths = []
    buf = bytearray()
    index = 0
    for p in small_paths:
        with open(p, "rb") as f:
            buf.extend(f.read())
        while len(buf) >= target_bytes:
            chunk, buf = bytes(buf[:target_bytes]), buf[target_bytes:]
            path = os.path.join(compacted_dir, f"compacted-{index:05d}.bin")
            with open(path, "wb") as f:
                f.write(chunk)
            compacted_paths.append(path)
            index += 1
    if buf:
        path = os.path.join(compacted_dir, f"compacted-{index:05d}.bin")
        with open(path, "wb") as f:
            f.write(bytes(buf))
        compacted_paths.append(path)
    return compacted_paths


def concat_bytes(paths):
    out = bytearray()
    for p in paths:
        with open(p, "rb") as f:
            out.extend(f.read())
    return bytes(out)


# --- Demonstration 1: a streaming ingestion pattern produces many real
#     small files for the same logical partition -----------------------

def demo_streaming_produces_many_small_files():
    table_dir = os.path.join(BASE, "events_table")
    small_paths = write_streaming_partition(table_dir)
    assert len(small_paths) == 200
    total_bytes = sum(os.path.getsize(p) for p in small_paths)
    assert total_bytes == 400_000
    return table_dir, small_paths, total_bytes


# --- Demonstration 2: many small files cost real, measured extra
#     manifest metadata and real, measured extra open/LIST overhead,
#     scaling with file count alone --------------------------------------

def demo_small_files_cost_more_metadata_and_open(table_dir, small_paths):
    manifest_before = write_manifest(table_dir, "manifest-before.jsonl", small_paths)
    manifest_bytes_before = os.path.getsize(manifest_before)
    assert manifest_bytes_before == 40_000

    overhead_before, data_bytes_before = open_list_cost(small_paths)
    assert overhead_before == 10_000
    assert data_bytes_before == 400_000

    return manifest_bytes_before, overhead_before


# --- Demonstration 3: a real bin-pack compaction merges the small files
#     into few target-sized files, byte for byte, and both costs
#     collapse by the same factor the file count did --------------------

def demo_bin_pack_compaction_measured_before_after(table_dir, small_paths):
    original_bytes = concat_bytes(small_paths)

    compacted_paths = bin_pack_compact(table_dir, small_paths, TARGET_FILE_BYTES)
    assert len(compacted_paths) == 10

    compacted_bytes = concat_bytes(compacted_paths)
    assert compacted_bytes == original_bytes  # every byte preserved, same order

    manifest_after = write_manifest(table_dir, "manifest-after.jsonl", compacted_paths)
    manifest_bytes_after = os.path.getsize(manifest_after)
    assert manifest_bytes_after == 2_000

    overhead_after, data_bytes_after = open_list_cost(compacted_paths)
    assert overhead_after == 500
    assert data_bytes_after == 400_000  # the data itself never changed

    return compacted_paths, manifest_bytes_after, overhead_after


# --- Demonstration 4: the exact same bytes compress to a measurably
#     different size as 200 separate streams versus one stream ---------

def demo_small_files_compress_worse(small_paths, compacted_paths):
    compressed_as_many_small = sum(len(zlib.compress(open(p, "rb").read(), 9)) for p in small_paths)
    whole_stream = concat_bytes(small_paths)
    compressed_as_one_stream = len(zlib.compress(whole_stream, 9))
    assert concat_bytes(compacted_paths) == whole_stream
    assert compressed_as_one_stream < compressed_as_many_small
    return compressed_as_many_small, compressed_as_one_stream


if __name__ == "__main__":
    reset_base()
    table_dir, small_paths, total_bytes = demo_streaming_produces_many_small_files()
    manifest_bytes_before, overhead_before = demo_small_files_cost_more_metadata_and_open(table_dir, small_paths)
    compacted_paths, manifest_bytes_after, overhead_after = demo_bin_pack_compaction_measured_before_after(table_dir, small_paths)
    compressed_small, compressed_whole = demo_small_files_compress_worse(small_paths, compacted_paths)
    shutil.rmtree(BASE, ignore_errors=True)

    print("streaming produces many small files:")
    print(f"  small files written: {len(small_paths)}")
    print(f"  total data bytes: {total_bytes}")
    print()
    print("before compaction:")
    print(f"  manifest bytes: {manifest_bytes_before}")
    print(f"  open/LIST overhead units: {overhead_before}")
    print()
    print("after a real bin-pack compaction:")
    print(f"  compacted file count: {len(compacted_paths)}")
    print(f"  manifest bytes: {manifest_bytes_after}")
    print(f"  open/LIST overhead units: {overhead_after}")
    print()
    print("compression, same bytes, split vs. whole:")
    print(f"  compressed as 200 separate files: {compressed_small} bytes")
    print(f"  compressed as one stream: {compressed_whole} bytes")
    print()
    print("All assertions passed.")
