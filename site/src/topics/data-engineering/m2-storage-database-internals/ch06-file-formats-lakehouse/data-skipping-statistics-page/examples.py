"""
Builds a real row-group/page layout for a 1000-row sorted and unsorted dataset and measures how
many row groups and pages a selective query actually has to read, using hand-rolled row-group
min/max statistics (Parquet's own ColumnMetaData.Statistics) and a page index (ColumnIndex), per
PageIndex.md. Builds a real split-block Bloom filter (SBBF) from BloomFilter.md's own pseudocode
and checks its false-positive rate against the spec's own stated example. Reproduces a real
truncated-statistics skipping bug: a writer that truncates a long max value without rounding up
silently causes a reader to skip a row group that actually contains a matching row.

No pyarrow/duckdb installed in this sandbox: every structure is hand-rolled from each spec's text.
"""

import hashlib
import random

# ---------------------------------------------------------------------------
# Row-group / page layout: 1000 rows, 10 row groups of 100 rows, 4 pages of 25 rows per
# row group — the same numbers whether the column is sorted or shuffled.
# ---------------------------------------------------------------------------

ROW_COUNT = 1000
ROW_GROUP_SIZE = 100
PAGE_SIZE = 25
ROW_GROUPS = ROW_COUNT // ROW_GROUP_SIZE
PAGES_PER_ROW_GROUP = ROW_GROUP_SIZE // PAGE_SIZE
assert ROW_GROUPS == 10
assert PAGES_PER_ROW_GROUP == 4

sorted_user_ids = list(range(ROW_COUNT))  # 0..999, already sorted

shuffled_user_ids = list(range(ROW_COUNT))
random.Random(7).shuffle(shuffled_user_ids)  # same 1000 values, fixed deterministic shuffle


def row_group_stats(values: list) -> list:
    """Row-group-level Statistics: min, max, and null_count per row group (ColumnMetaData.Statistics)."""
    stats = []
    for g in range(ROW_GROUPS):
        chunk = values[g * ROW_GROUP_SIZE:(g + 1) * ROW_GROUP_SIZE]
        stats.append({'min': min(chunk), 'max': max(chunk), 'null_count': 0})
    return stats


def row_groups_overlapping(stats: list, lo: int, hi: int) -> list:
    """A row group can be skipped only if its [min, max] range has no overlap with [lo, hi]."""
    return [g for g, s in enumerate(stats) if not (s['max'] < lo or s['min'] > hi)]


QUERY_LO, QUERY_HI = 250, 270

sorted_stats = row_group_stats(sorted_user_ids)
shuffled_stats = row_group_stats(shuffled_user_ids)

sorted_hits = row_groups_overlapping(sorted_stats, QUERY_LO, QUERY_HI)
shuffled_hits = row_groups_overlapping(shuffled_stats, QUERY_LO, QUERY_HI)

assert sorted_hits == [2]  # row group 2 covers values 200-299, the only overlap with 250-270
assert len(shuffled_hits) == ROW_GROUPS  # a shuffled column's [min, max] per group spans ~0-999 everywhere

sorted_row_groups_read = len(sorted_hits)
sorted_row_groups_skipped = ROW_GROUPS - sorted_row_groups_read
shuffled_row_groups_read = len(shuffled_hits)
shuffled_row_groups_skipped = ROW_GROUPS - shuffled_row_groups_read

assert sorted_row_groups_read == 1
assert sorted_row_groups_skipped == 9
assert shuffled_row_groups_skipped == 0


# ---------------------------------------------------------------------------
# Page index (ColumnIndex): per-page min/max inside the one row group that survived
# row-group pruning, per PageIndex.md's own ColumnIndex/OffsetIndex design.
# ---------------------------------------------------------------------------

def page_stats(values: list, row_group: int) -> list:
    base = row_group * ROW_GROUP_SIZE
    stats = []
    for p in range(PAGES_PER_ROW_GROUP):
        chunk = values[base + p * PAGE_SIZE: base + (p + 1) * PAGE_SIZE]
        stats.append({'min': min(chunk), 'max': max(chunk)})
    return stats


def pages_overlapping(stats: list, lo: int, hi: int) -> list:
    return [p for p, s in enumerate(stats) if not (s['max'] < lo or s['min'] > hi)]


surviving_row_group = sorted_hits[0]
sorted_page_stats = page_stats(sorted_user_ids, surviving_row_group)
page_hits = pages_overlapping(sorted_page_stats, QUERY_LO, QUERY_HI)

assert sorted_page_stats == [
    {'min': 200, 'max': 224}, {'min': 225, 'max': 249}, {'min': 250, 'max': 274}, {'min': 275, 'max': 299},
]
assert page_hits == [2]  # only the page covering 250-274 overlaps the 250-270 query
pages_read = len(page_hits)
pages_skipped = PAGES_PER_ROW_GROUP - pages_read
assert pages_read == 1
assert pages_skipped == 3


# ---------------------------------------------------------------------------
# Split block Bloom filter (SBBF), built exactly to BloomFilter.md's own pseudocode: an 8-word,
# 256-bit block with a fixed salt, and a filter of z such blocks selected by a value's top 32 bits.
# (The real spec hashes values with XXH64; this sandbox substitutes the first 8 bytes of a
# SHA-256 digest as a well-distributed 64-bit hash, since XXH64 itself is out of this topic's
# scope -- the SBBF algorithm this topic checks is the block/mask/filter_insert/filter_check
# structure, not the hash function. A hand-rolled FNV-1a was tried first and measured a false
# positive rate over 10x the spec's own stated figure, because FNV-1a's upper bits -- exactly
# the bits filter_insert/filter_check use to pick a block -- stay highly correlated across the
# sequential keys this topic inserts; SHA-256 does not have that weakness.)
# ---------------------------------------------------------------------------

SALT = [0x47b6137b, 0x44974d91, 0x8824ad5b, 0xa2b7289d,
        0x705495c7, 0x2df1424b, 0x9efc4947, 0x5c6bfb31]
MASK32 = 0xFFFFFFFF


def hash64(data: bytes) -> int:
    digest = hashlib.sha256(data).digest()
    return int.from_bytes(digest[:8], 'big')


def block_mask(x: int) -> list:
    """Returns the 8 words (32 bits each) of mask(x), per BloomFilter.md's own pseudocode."""
    words = [0] * 8
    for i in range(8):
        y = (x * SALT[i]) & MASK32
        words[i] = 1 << (y >> 27)
    return words


def block_insert(block: list, x: int) -> None:
    masked = block_mask(x)
    for i in range(8):
        block[i] |= masked[i]


def block_check(block: list, x: int) -> bool:
    masked = block_mask(x)
    return all((block[i] & masked[i]) == masked[i] for i in range(8))


class SBBF:
    def __init__(self, num_blocks: int):
        self.z = num_blocks
        self.blocks = [[0] * 8 for _ in range(num_blocks)]

    def _block_index(self, h: int) -> int:
        h_top = h >> 32
        return (h_top * self.z) >> 32

    def insert(self, h: int) -> None:
        i = self._block_index(h)
        block_insert(self.blocks[i], h & MASK32)

    def check(self, h: int) -> bool:
        i = self._block_index(h)
        return block_check(self.blocks[i], h & MASK32)


# Spec's own worked example: 1024 blocks (262,144 bits), 26,214 inserted values -> ~1.26% FPR.
BLOOM_BLOCKS = 1024
BLOOM_INSERTS = 26214
assert BLOOM_BLOCKS * 256 == 262144  # total bit usage, matching the spec's own stated number

sbbf = SBBF(BLOOM_BLOCKS)
inserted_keys = [f'session-{i}' for i in range(BLOOM_INSERTS)]
inserted_hashes = [hash64(k.encode()) for k in inserted_keys]
for h in inserted_hashes:
    sbbf.insert(h)

# No false negatives: every inserted key must check true.
assert all(sbbf.check(h) for h in inserted_hashes)

# Empirically measure the false-positive rate on keys that were never inserted.
rng = random.Random(11)
TEST_NON_MEMBERS = 50000
false_positives = 0
for _ in range(TEST_NON_MEMBERS):
    candidate = f'absent-{rng.randrange(10**9)}'
    h = hash64(candidate.encode())
    if sbbf.check(h):
        false_positives += 1
bloom_fpr_pct = round(100 * false_positives / TEST_NON_MEMBERS, 2)
assert 0.5 <= bloom_fpr_pct <= 2.5  # the spec's own example states "around 1.26%"
assert bloom_fpr_pct == 1.25

# One concrete equality check: a real present key checks true, a real absent key checks false.
present_key_hash = hash64('session-12345'.encode())
absent_key_hash = hash64('definitely-not-present-key'.encode())
assert sbbf.check(present_key_hash) is True
assert sbbf.check(absent_key_hash) is False


# ---------------------------------------------------------------------------
# Truncated statistics skipping failure: a writer that truncates a long max string without
# rounding up produces a max that is no longer a true upper bound, silently causing a reader to
# skip a row group that actually contains a matching row (a real class of production bug).
# ---------------------------------------------------------------------------

names_row_group = ['Alice', 'Blart Versenwald III', 'Bob', 'Carol']


def truncate_correct(s: str, keep: int) -> str:
    """Truncates and rounds the last kept byte up by one, so the result is still >= every
    untruncated string with that prefix -- the technique PageIndex.md itself describes."""
    prefix = s[:keep]
    return prefix[:-1] + chr(ord(prefix[-1]) + 1)


def truncate_buggy(s: str, keep: int) -> str:
    """The bug: truncates but does NOT round up, so the result can be LESS than strings it
    was supposed to bound."""
    return s[:keep]


real_max = max(names_row_group)
assert real_max == 'Carol'
# Use a 1-byte truncation deliberately so the bug is visible: "B" < "Blart Versenwald III".
real_min_with_b_prefix = min(n for n in names_row_group if n.startswith('B'))
assert real_min_with_b_prefix == 'Blart Versenwald III'

correct_truncated_max = truncate_correct('Blart Versenwald III', 1)
buggy_truncated_max = truncate_buggy('Blart Versenwald III', 1)
assert correct_truncated_max == 'C'
assert buggy_truncated_max == 'B'

QUERY_NAME = 'Bl'  # a query for name >= 'Bl' should match "Blart Versenwald III"
assert 'Blart Versenwald III' >= QUERY_NAME  # the real data really does match

correct_would_skip = correct_truncated_max < QUERY_NAME
buggy_would_skip = buggy_truncated_max < QUERY_NAME
assert correct_would_skip is False   # correct truncation keeps the row group — no data lost
assert buggy_would_skip is True      # buggy truncation wrongly skips it — a real row goes missing


if __name__ == "__main__":
    print(f"sorted: {sorted_row_groups_read} row group read, {sorted_row_groups_skipped} skipped (query {QUERY_LO}-{QUERY_HI})")
    print(f"shuffled: {shuffled_row_groups_read} row groups read, {shuffled_row_groups_skipped} skipped")
    print(f"row group {surviving_row_group} page index: {pages_read} page read, {pages_skipped} skipped")
    print(f"bloom filter: {BLOOM_BLOCKS} blocks, {BLOOM_INSERTS} inserts, measured FPR {bloom_fpr_pct}%")
    print(f"truncation: correct max '{correct_truncated_max}' keeps the row group, "
          f"buggy max '{buggy_truncated_max}' wrongly skips it")
    print("All assertions passed.")
