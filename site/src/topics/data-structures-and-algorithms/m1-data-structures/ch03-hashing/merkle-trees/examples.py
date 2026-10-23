"""Every number this topic's reel puts on screen is computed here, never asserted from Merkle's,
Cassandra's, Git's, RFC 6962's, or Dolt's own cited numbers alone.

A real Merkle tree is built from scratch over a batch of leaves, hashed up to one root, exactly
Merkle's own "tree authentication": `H(i,j)` built recursively from two halves, up to one root
`H(1,n)`. Two things are measured directly: how many hashes a root-to-leaf walk-down checks to find
one changed leaf, against a full leaf-by-leaf scan, on the same tree; and how many chunks change
their hash after one small edit near the start of a data stream, under fixed-offset chunking versus
content-defined chunking (the mechanism Dolt's own docs describe for prolly trees), on the same data.
"""

import hashlib
import math
import random


def h(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()


class MerkleTree:
    """A binary tree of hashes over a list of leaf values, leaves padded to a power of two."""

    def __init__(self, leaves: list[bytes]):
        n = 1
        while n < len(leaves):
            n *= 2
        padded = leaves + [b""] * (n - len(leaves))
        self.num_leaves = len(padded)
        self.leaf_hashes = [h(v) for v in padded]
        self.levels = [self.leaf_hashes]
        level = self.leaf_hashes
        while len(level) > 1:
            level = [h(level[i] + level[i + 1]) for i in range(0, len(level), 2)]
            self.levels.append(level)

    @property
    def root(self) -> bytes:
        return self.levels[-1][0]

    def hashes_to_find_mismatch(self, other: "MerkleTree") -> tuple[int, int]:
        """Walk down from the root, following only the child whose hash disagrees.
        Returns (hashes_checked, leaf_index_found)."""
        checked = 0
        depth = len(self.levels) - 1
        idx = 0
        for level in range(depth, 0, -1):
            left_a, right_a = self.levels[level - 1][2 * idx], self.levels[level - 1][2 * idx + 1]
            left_b, right_b = other.levels[level - 1][2 * idx], other.levels[level - 1][2 * idx + 1]
            checked += 2
            idx = 2 * idx if left_a != left_b else 2 * idx + 1
        return checked, idx


random.seed(20261023)

# --- Root-to-leaf walk-down vs full scan, finding one changed leaf -----------------------------

NUM_LEAVES = 64
leaves = [f"segment-{i}-{random.randint(0, 10**9)}".encode() for i in range(NUM_LEAVES)]
tree_a = MerkleTree(leaves)

changed_index = 37
leaves_b = list(leaves)
leaves_b[changed_index] = b"edited-segment-content"
tree_b = MerkleTree(leaves_b)

assert tree_a.root != tree_b.root, "an edited leaf must change the root hash"

full_scan_checks = NUM_LEAVES  # compare every leaf, one hash comparison each
walk_checks, found_index = tree_b.hashes_to_find_mismatch(tree_a)

print(f"{NUM_LEAVES} leaves, one leaf changed (index {changed_index}):")
print(f"  full leaf-by-leaf scan: {full_scan_checks} hash comparisons")
print(f"  root-to-leaf walk-down: {walk_checks} hash comparisons, found index {found_index}")

assert found_index == changed_index, "the walk-down must find the exact leaf that changed"

expected_walk_checks = 2 * math.log2(NUM_LEAVES)
assert walk_checks == expected_walk_checks, f"walk should check exactly 2*log2(n) hashes, not {walk_checks}"
assert walk_checks < full_scan_checks, "the walk-down must check far fewer hashes than a full scan"

# A matching root really does guarantee every leaf matches: build a second, independent tree from
# the same leaf values and confirm its root is identical, and that changing nothing changes nothing.
tree_a_rebuilt = MerkleTree(leaves)
assert tree_a_rebuilt.root == tree_a.root, "the same leaves must always produce the same root"

# --- Content-defined chunking vs fixed-offset chunking, after one small edit --------------------

STREAM_LEN = 20000
FIXED_CHUNK_SIZE = 256
AVG_CHUNK_SIZE = 256  # target average, for a fair comparison against the fixed scheme
THRESHOLD = 2**32 // AVG_CHUNK_SIZE


def fixed_offset_chunks(data: bytes) -> list[bytes]:
    return [data[i : i + FIXED_CHUNK_SIZE] for i in range(0, len(data), FIXED_CHUNK_SIZE)]


def content_defined_chunks(data: bytes) -> list[bytes]:
    chunks = []
    start = 0
    window = 16
    for i in range(window, len(data)):
        rolling = int.from_bytes(h(data[i - window : i])[:4], "big")
        if rolling < THRESHOLD or i - start >= AVG_CHUNK_SIZE * 8:
            chunks.append(data[start:i])
            start = i
    chunks.append(data[start:])
    return chunks


def chunk_hashes(chunks: list[bytes]) -> list[bytes]:
    return [h(c) for c in chunks]


stream = bytes(random.randint(0, 255) for _ in range(STREAM_LEN))
EDIT_POSITION = 50  # near the very start of the stream

fixed_before = chunk_hashes(fixed_offset_chunks(stream))
cdc_before = chunk_hashes(content_defined_chunks(stream))

# fixed-offset chunking keeps every chunk the same byte length, so inserting one byte shifts the
# byte position of everything after it -- and therefore every later fixed-offset chunk boundary,
# and every later chunk's hash with it. Content-defined chunking's boundaries are set by the
# data's own content, not a byte count, so only the one boundary near the edit should move.
inserted_stream = stream[:EDIT_POSITION] + b"\x00" + stream[EDIT_POSITION:]
fixed_after_insert = chunk_hashes(fixed_offset_chunks(inserted_stream))
cdc_after_insert = chunk_hashes(content_defined_chunks(inserted_stream))

fixed_changed_on_insert = sum(1 for i in range(min(len(fixed_before), len(fixed_after_insert))) if fixed_before[i] != fixed_after_insert[i])
fixed_changed_on_insert += abs(len(fixed_before) - len(fixed_after_insert))

cdc_changed_on_insert = 0
for a, b in zip(cdc_before, cdc_after_insert):
    if a != b:
        cdc_changed_on_insert += 1
    else:
        break
cdc_changed_on_insert += abs(len(cdc_before) - len(cdc_after_insert))

print(f"\n{STREAM_LEN}-byte stream, one byte inserted near position {EDIT_POSITION}:")
print(f"  fixed-offset chunking:    {len(fixed_before)} chunks before, {fixed_changed_on_insert} chunks changed hash")
print(f"  content-defined chunking: {len(cdc_before)} chunks before, {cdc_changed_on_insert} chunks changed hash")

assert fixed_changed_on_insert >= len(fixed_before) - 1, (
    "inserting one byte should shift almost every fixed-offset chunk boundary after it, not just a few"
)
assert cdc_changed_on_insert < fixed_changed_on_insert, (
    "content-defined chunking must reshape far fewer chunks than fixed-offset chunking after the same edit"
)
assert cdc_changed_on_insert <= 3, f"content-defined chunking should reshape only the one nearby chunk, not {cdc_changed_on_insert}"

if __name__ == "__main__":
    print("\nAll checks passed.")
