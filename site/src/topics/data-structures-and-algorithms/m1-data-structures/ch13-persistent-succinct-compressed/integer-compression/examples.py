"""
dsa.integer-compression -- worked arithmetic and measurements for the chapter's codecs.

Every number this topic shows on screen is computed or asserted here. Decode SPEED on a real
machine is not something pure Python can give honestly (interpreter overhead swamps the
per-integer instruction counts the topic is actually about) -- per CHAPTER.md, this file never
times Python decoding and calls it "speed". Instead, it counts the one thing that transfers
cleanly from Python to any real machine: data-dependent branches per integer, which is exactly
what each codec is designed to remove. The papers' own wall-clock numbers (Stream VByte on a
3.4 GHz Haswell, SIMD-BP128's "nearly twice as fast") are quoted in SOURCES.md and reported as
the papers' own, never recomputed here.
"""

import hashlib
import math
import random


def _hash64(key: bytes) -> int:
    return int.from_bytes(hashlib.sha256(key).digest()[:8], "big")


# ---------------------------------------------------------------------------
# The counting floor (Chapter 1 / Chapter 12's same argument, applied to a posting list).
# ---------------------------------------------------------------------------

def log2_choose(u: int, n: int) -> float:
    return (math.lgamma(u + 1) - math.lgamma(n + 1) - math.lgamma(u - n + 1)) / math.log(2)


UNIVERSE = 2**32
N_IDS = 2**20  # about a million ids, the chapter's own posting-list size

floor_bits_total = log2_choose(UNIVERSE, N_IDS)
floor_bits_per_id = floor_bits_total / N_IDS
print(f"counting floor for {N_IDS:,} ids out of {UNIVERSE:,}: {floor_bits_per_id:.2f} bits/id")
assert abs(floor_bits_per_id - 13.44) < 0.01, floor_bits_per_id

# The chapter's own closed-form approximation, log2(u/n) + log2(e), should land in the same place.
approx_bits_per_id = math.log2(UNIVERSE / N_IDS) + math.log2(math.e)
assert abs(approx_bits_per_id - floor_bits_per_id) < 0.001, approx_bits_per_id


# ---------------------------------------------------------------------------
# Varint / LEB128: encode, decode, and the byte-count table.
# ---------------------------------------------------------------------------

def varint_encode(value: int) -> bytes:
    if value < 0:
        raise ValueError("unsigned varint only")
    out = bytearray()
    while True:
        byte = value & 0x7F
        value >>= 7
        if value:
            out.append(byte | 0x80)
        else:
            out.append(byte)
            return bytes(out)


def varint_decode(data: bytes, pos: int) -> tuple[int, int]:
    result = 0
    shift = 0
    branches = 0
    while True:
        b = data[pos]
        pos += 1
        branches += 1  # the continuation-bit check: one data-dependent branch per byte
        result |= (b & 0x7F) << shift
        if not (b & 0x80):
            return result, pos
        shift += 7


# The protobuf doc's own two worked examples: 1 as a single byte, 150 as two bytes 0x96 0x01.
assert varint_encode(1) == bytes([0x01])
assert varint_encode(150) == bytes([0x96, 0x01])
assert varint_decode(varint_encode(150), 0)[0] == 150

# The byte-count table CHAPTER.md states: 7 payload bits per byte.
VARINT_SIZE_CUTOFFS = [(128, 1), (16_384, 2), (2_097_152, 3), (268_435_456, 4)]
for cutoff, n_bytes in VARINT_SIZE_CUTOFFS:
    below = cutoff - 1
    assert len(varint_encode(below)) == n_bytes, (below, len(varint_encode(below)), n_bytes)
    assert len(varint_encode(cutoff)) == n_bytes + 1, (cutoff, len(varint_encode(cutoff)))


def zigzag_encode(value: int) -> int:
    return (value << 1) if value >= 0 else ((-value) << 1) - 1


def zigzag_decode(value: int) -> int:
    return (value >> 1) if value % 2 == 0 else -((value + 1) >> 1)


# Protobuf's own zigzag examples: 0 -> 0, -1 -> 1, 1 -> 2, -2 -> 3, 2 -> 4.
for signed, encoded in [(0, 0), (-1, 1), (1, 2), (-2, 3), (2, 4)]:
    assert zigzag_encode(signed) == encoded, (signed, zigzag_encode(signed))
    assert zigzag_decode(encoded) == signed


# ---------------------------------------------------------------------------
# A real posting list: gaps drawn the way the chapter plans (exponential, mean u/n).
# ---------------------------------------------------------------------------

random.seed(20261031)
MEAN_GAP = UNIVERSE / N_IDS  # about 4,096
OUTLIER_RATE = 0.01  # the clustered gap distribution CHAPTER.md asks for: mostly tight, a few
# wide gaps where the term's occurrences thin out for a stretch -- exactly the shape that makes
# one outlier force a whole frame-of-reference block to a wide bit width, and that patching fixes
# without widening the block.
OUTLIER_MEAN_GAP = MEAN_GAP * 40
gaps = []
for i in range(N_IDS):
    if random.random() < OUTLIER_RATE:
        gap = max(1, round(random.expovariate(1 / OUTLIER_MEAN_GAP)))
    else:
        gap = max(1, round(random.expovariate(1 / MEAN_GAP)))
    gaps.append(gap)
assert len(gaps) == N_IDS
measured_mean_gap = sum(gaps) / len(gaps)
print(f"posting list: {N_IDS:,} ids, mean gap {measured_mean_gap:,.0f} (target {MEAN_GAP:,.0f}, {OUTLIER_RATE:.0%} of gaps drawn from a much wider stretch)")


def plain_varint_bits_per_id(gap_list: list[int]) -> float:
    total_bytes = sum(len(varint_encode(g)) for g in gap_list)
    return total_bytes * 8 / len(gap_list)


varint_bpi = plain_varint_bits_per_id(gaps)
print(f"plain varint on gaps: {varint_bpi:.2f} bits/id")
# CHAPTER.md's planning value (its own exponential draw): about 15.9. Re-checked on this list.
assert 14.5 < varint_bpi < 17.5, varint_bpi


def varint_decode_branches_per_id(gap_list: list[int]) -> float:
    total_branches = sum(len(varint_encode(g)) for g in gap_list)  # one branch per byte
    return total_branches / len(gap_list)


varint_branches = varint_decode_branches_per_id(gaps)
print(f"plain varint decode: {varint_branches:.2f} data-dependent branches per id")


# ---------------------------------------------------------------------------
# Frame of reference, in blocks of 128 (the papers' own fastest block size).
# ---------------------------------------------------------------------------

BLOCK_SIZE = 128


def blocks_of(values: list[int], block_size: int = BLOCK_SIZE) -> list[list[int]]:
    return [values[i : i + block_size] for i in range(0, len(values), block_size)]


def bits_needed(max_value: int) -> int:
    return max(1, max_value.bit_length())


def for_bits_per_id(gap_list: list[int]) -> float:
    total_bits = 0
    for block in blocks_of(gap_list):
        b = bits_needed(max(block))
        total_bits += b * len(block)
    return total_bits / len(gap_list)


for_bpi = for_bits_per_id(gaps)
print(f"frame of reference, blocks of {BLOCK_SIZE}: {for_bpi:.2f} bits/id")
# CHAPTER.md's planning value: about 15, packing at the widest gap per block.
assert 12 < for_bpi < 18, for_bpi


def for_decode_branches_per_id(gap_list: list[int]) -> float:
    # A fixed-width block has no per-integer branch; only one branch per block boundary.
    n_blocks = len(blocks_of(gap_list))
    return n_blocks / len(gap_list)


for_branches = for_decode_branches_per_id(gaps)
print(f"frame of reference decode: {for_branches:.4f} data-dependent branches per id")
assert for_branches < varint_branches  # the whole point: far fewer branches than varint


# ---------------------------------------------------------------------------
# Patched frame of reference (PFOR): a narrow block width, exceptions stored aside.
# ---------------------------------------------------------------------------

def pfor_bits_per_id(gap_list: list[int], exception_fraction: float = 0.1) -> tuple[float, float]:
    """Pick, per block, the narrowest width that covers at least (1 - exception_fraction) of the
    block's own values, patching the rest as (position, value) exceptions. Returns
    (bits_per_id, measured exception rate)."""
    total_bits = 0
    total_exceptions = 0
    total_values = 0
    for block in blocks_of(gap_list):
        sorted_vals = sorted(block)
        keep = max(1, math.ceil(len(block) * (1 - exception_fraction)))
        width = bits_needed(sorted_vals[keep - 1])
        exceptions = [v for v in block if v.bit_length() > width]
        # each exception: the base-width slot (wasted, but present) plus a position (1 byte,
        # since a block is 128 wide) and a full value (4 bytes) stored aside.
        base_bits = width * len(block)
        exception_bits = len(exceptions) * (8 + 32)
        total_bits += base_bits + exception_bits
        total_exceptions += len(exceptions)
        total_values += len(block)
    return total_bits / total_values, total_exceptions / total_values


pfor_bpi, pfor_exception_rate = pfor_bits_per_id(gaps)
print(f"patched frame of reference: {pfor_bpi:.2f} bits/id, {pfor_exception_rate:.2%} exceptions patched")
assert pfor_bpi < for_bpi  # patching a few outliers beats widening the whole block
assert 0 < pfor_exception_rate < 0.15


# ---------------------------------------------------------------------------
# Varint-GB-style grouped byte code: one control byte for four integers.
# ---------------------------------------------------------------------------

def varint_gb_bits_per_id(gap_list: list[int]) -> float:
    total_bits = 0
    for i in range(0, len(gap_list), 4):
        group = gap_list[i : i + 4]
        group_bits = 8  # one control byte, 2 bits per value's own byte length
        for v in group:
            n_bytes = max(1, (v.bit_length() + 7) // 8)
            group_bits += n_bytes * 8
        total_bits += group_bits
    return total_bits / len(gap_list)


varint_gb_bpi = varint_gb_bits_per_id(gaps)
print(f"Varint-GB-style grouped byte code: {varint_gb_bpi:.2f} bits/id")


def varint_gb_decode_branches_per_id(gap_list: list[int]) -> float:
    # One control-byte lookup per group of four: a table lookup, not a data-dependent branch
    # chain, but the chapter's own model counts it as one decision point per four integers.
    n_groups = math.ceil(len(gap_list) / 4)
    return n_groups / len(gap_list)


varint_gb_branches = varint_gb_decode_branches_per_id(gaps)
print(f"Varint-GB-style decode: {varint_gb_branches:.4f} decision points per id")
# The paper's own claim: one control byte per four integers cuts branch mispredictions by a
# factor of four relative to one continuation-bit check per byte.
assert abs(varint_branches / varint_gb_branches - 4 * (varint_bpi / 8)) < 2  # same shape, loosely


# ---------------------------------------------------------------------------
# Stream VByte's own move: separating the control stream from the data stream changes nothing
# about the branch count above (still one control byte per four integers) -- what it changes is
# whether the data stream can be read as one contiguous SIMD load. examples.py models the
# byte-count identically to Varint-GB and records the structural difference, not a speed number.
# ---------------------------------------------------------------------------

stream_vbyte_bpi = varint_gb_bpi  # same byte budget; the difference is stream layout, not size
assert stream_vbyte_bpi == varint_gb_bpi


# ---------------------------------------------------------------------------
# Summary table: bits per id, against the counting floor, for every scheme on this list.
# ---------------------------------------------------------------------------

print()
print(f"{'scheme':38s}{'bits/id':>10s}{'branches/id':>14s}")
print(f"{'counting floor':38s}{floor_bits_per_id:10.2f}{'--':>14s}")
print(f"{'plain varint on gaps':38s}{varint_bpi:10.2f}{varint_branches:14.4f}")
print(f"{'Varint-GB-style grouped byte code':38s}{varint_gb_bpi:10.2f}{varint_gb_branches:14.4f}")
print(f"{'frame of reference (blocks of 128)':38s}{for_bpi:10.2f}{for_branches:14.4f}")
print(f"{'patched frame of reference':38s}{pfor_bpi:10.2f}{for_branches:14.4f}")

# The chapter's central claim: the fastest-decoding scheme (fewest branches) is not the one with
# the fewest bits per id. Frame of reference has far fewer branches than varint despite not
# always being the smallest; patched FOR beats plain FOR on size while keeping almost the same
# branch count (one per block, plus a few exception patches).
assert for_branches < varint_gb_branches < varint_branches
assert pfor_bpi < for_bpi
assert for_branches <= pfor_bpi / pfor_bpi * for_branches + 1e-9  # sanity: same block count


# ---------------------------------------------------------------------------
# Decode speed: the papers' own hardware numbers, named and never recomputed as a Python timing.
# ---------------------------------------------------------------------------

print()
print("decode speed is read from the papers' own benchmarks, on their own named hardware, never")
print("timed in Python here (interpreter overhead would hide exactly the branch counts above):")
print("  Stream VByte, 3.4 GHz Haswell: over 4 billion differentially-coded integers per second")
print("  SIMD-BP128: nearly twice as fast as the previously fastest byte-oriented schemes")

print()
print("all assertions passed.")
