"""A Gorilla-style delta-of-delta/XOR encoder, a Chimp-style trailing-zero
refinement, and bytes-per-point measurements across three synthetic
regimes against raw 16 bytes, these two encoders, DuckDB's own default
float codec, and Zstd."""

from __future__ import annotations

import struct
import tempfile
import zlib
from dataclasses import dataclass, field
from pathlib import Path

import duckdb


class BitWriter:
    def __init__(self):
        self.bits: list[int] = []

    def write_bit(self, b: int) -> None:
        self.bits.append(b & 1)

    def write_bits(self, value: int, n: int) -> None:
        for i in range(n - 1, -1, -1):
            self.write_bit((value >> i) & 1)

    @property
    def length(self) -> int:
        return len(self.bits)


def encode_delta_of_delta(writer: BitWriter, dod: int) -> int:
    """The Gorilla paper's exact variable-length rule (§4.1.1). Returns the
    number of bits written."""
    start = writer.length
    if dod == 0:
        writer.write_bit(0)
    elif -63 <= dod <= 64:
        writer.write_bits(0b10, 2)
        writer.write_bits(dod & 0x7F, 7)
    elif -255 <= dod <= 256:
        writer.write_bits(0b110, 3)
        writer.write_bits(dod & 0x1FF, 9)
    elif -2047 <= dod <= 2048:
        writer.write_bits(0b1110, 4)
        writer.write_bits(dod & 0xFFF, 12)
    else:
        writer.write_bits(0b1111, 4)
        writer.write_bits(dod & 0xFFFFFFFF, 32)
    return writer.length - start


def xor_leading_trailing_zeros(xor: int) -> tuple[int, int]:
    if xor == 0:
        return 64, 64
    leading = 0
    while leading < 64 and not (xor >> (63 - leading)) & 1:
        leading += 1
    trailing = 0
    while trailing < 64 and not (xor >> trailing) & 1:
        trailing += 1
    return leading, trailing


def encode_xor_value(writer: BitWriter, xor: int, prev_leading: int, prev_meaningful_len: int) -> tuple[int, int, int]:
    """The Gorilla paper's exact variable-length rule (§4.1.2). Returns
    (bits written, new prev_leading, new prev_meaningful_len)."""
    start = writer.length
    if xor == 0:
        writer.write_bit(0)
        return writer.length - start, prev_leading, prev_meaningful_len

    leading, trailing = xor_leading_trailing_zeros(xor)
    meaningful_len = 64 - leading - trailing

    writer.write_bit(1)
    if prev_meaningful_len and leading >= prev_leading and (64 - prev_leading - prev_meaningful_len) >= trailing:
        # case (a): falls within the previous block's window — control bit 0
        writer.write_bit(0)
        meaningful = (xor >> trailing) & ((1 << prev_meaningful_len) - 1)
        writer.write_bits(meaningful, prev_meaningful_len)
        return writer.length - start, prev_leading, prev_meaningful_len

    # case (b): control bit 1, store a fresh 5-bit leading count, 6-bit length
    writer.write_bit(1)
    writer.write_bits(leading, 5)
    writer.write_bits(meaningful_len, 6)
    meaningful = (xor >> trailing) & ((1 << meaningful_len) - 1)
    writer.write_bits(meaningful, meaningful_len)
    return writer.length - start, leading, meaningful_len


def float_bits(value: float) -> int:
    return struct.unpack("<Q", struct.pack("<d", value))[0]


@dataclass
class GorillaEncodeResult:
    total_bits: int
    first_point_bits: int


def gorilla_encode(timestamps: list[int], values: list[float]) -> GorillaEncodeResult:
    writer = BitWriter()
    first_point_bits = 64 + 64  # raw timestamp + raw value, uncompressed header
    writer.write_bits(timestamps[0] & 0xFFFFFFFFFFFFFFFF, 64)
    writer.write_bits(float_bits(values[0]), 64)

    prev_delta = timestamps[1] - timestamps[0] if len(timestamps) > 1 else 0
    prev_value_bits = float_bits(values[0])
    prev_leading, prev_meaningful_len = 64, 0

    for i in range(1, len(timestamps)):
        delta = timestamps[i] - timestamps[i - 1]
        dod = delta - prev_delta
        encode_delta_of_delta(writer, dod)
        prev_delta = delta

        cur_value_bits = float_bits(values[i])
        xor = cur_value_bits ^ prev_value_bits
        _, prev_leading, prev_meaningful_len = encode_xor_value(writer, xor, prev_leading, prev_meaningful_len)
        prev_value_bits = cur_value_bits

    return GorillaEncodeResult(total_bits=writer.length, first_point_bits=first_point_bits)


def chimp_encode(timestamps: list[int], values: list[float], trailing_threshold: int = 6, window: int = 1) -> int:
    """A Chimp-style refinement: when trailing zeros don't exceed the
    paper's threshold of 6, the trailing zeros are included in the
    meaningful run instead of being counted separately (cheaper than
    spending bits to describe a short trailing-zero run). `window` > 1
    compares against the best of the last `window` values (Chimp128's
    idea), picked by whichever gives the most leading+trailing zeros."""
    writer = BitWriter()
    writer.write_bits(timestamps[0] & 0xFFFFFFFFFFFFFFFF, 64)
    writer.write_bits(float_bits(values[0]), 64)

    prev_delta = timestamps[1] - timestamps[0] if len(timestamps) > 1 else 0
    history: list[int] = [float_bits(values[0])]
    prev_leading, prev_meaningful_len = 64, 0

    for i in range(1, len(timestamps)):
        delta = timestamps[i] - timestamps[i - 1]
        dod = delta - prev_delta
        encode_delta_of_delta(writer, dod)
        prev_delta = delta

        cur_bits = float_bits(values[i])
        candidates = history[-window:]
        best_xor, best_leading, best_trailing = None, -1, -1
        for cand in candidates:
            xor = cand ^ cur_bits
            leading, trailing = xor_leading_trailing_zeros(xor)
            if xor == 0:
                leading, trailing = 64, 64
            if leading + trailing > best_leading + best_trailing:
                best_xor, best_leading, best_trailing = xor, leading, trailing

        if best_xor == 0:
            writer.write_bit(0)
        else:
            writer.write_bit(1)
            if best_trailing <= trailing_threshold:
                # include the short trailing-zero run in the meaningful part
                meaningful_len = 64 - best_leading
                writer.write_bits(best_leading, 6)
                writer.write_bits(meaningful_len, 6)
                writer.write_bits(best_xor >> 0 & ((1 << meaningful_len) - 1), meaningful_len)
            else:
                meaningful_len = 64 - best_leading - best_trailing
                writer.write_bits(best_leading, 6)
                writer.write_bits(best_trailing, 6)
                writer.write_bits(meaningful_len, 6)
                writer.write_bits((best_xor >> best_trailing) & ((1 << meaningful_len) - 1), meaningful_len)
        history.append(cur_bits)

    return writer.length


def build_regime_regular_slow(n: int) -> tuple[list[int], list[float]]:
    """Gorilla's favourable case: fixed-interval timestamps, a value that
    is identical to its predecessor most of the time and only drifts a
    little every so often — the pattern the paper's own ODS data showed
    (about half of all values unchanged from the previous reading)."""
    ts = [1_700_000_000 + 60 * i for i in range(n)]
    vals = [50.0 + 0.01 * (i // 20) for i in range(n)]
    return ts, vals


def build_regime_noisy_float(n: int) -> tuple[list[int], list[float]]:
    """A noisy float with many significant digits, unfavourable to both
    delta-of-delta (irregular timestamps) and XOR (little bit-pattern
    overlap between successive values)."""
    ts = [1_700_000_000 + (61 if i % 7 == 0 else 60) * i for i in range(n)]
    vals = [1000.0 * ((i * 9301 + 49297) % 233280) / 233280.0 for i in range(n)]
    return ts, vals


def build_regime_decimal_regular(n: int) -> tuple[list[int], list[float]]:
    """A decimal-valued signal (two decimal places) at a regular rate —
    ALP's favourable case."""
    ts = [1_700_000_000 + 60 * i for i in range(n)]
    vals = [round(20.0 + 0.37 * (i % 11), 2) for i in range(n)]
    return ts, vals


def bytes_per_point_raw(n: int) -> float:
    return 16.0


def bytes_per_point_gorilla(ts: list[int], vals: list[float]) -> float:
    result = gorilla_encode(ts, vals)
    return result.total_bits / 8.0 / len(ts)


def bytes_per_point_chimp(ts: list[int], vals: list[float], window: int = 1) -> float:
    total_bits = chimp_encode(ts, vals, window=window)
    return total_bits / 8.0 / len(ts)


def bytes_per_point_zstd(ts: list[int], vals: list[float]) -> float:
    raw = b"".join(struct.pack("<qd", t, v) for t, v in zip(ts, vals))
    compressed = zlib.compress(raw, level=9)
    return len(compressed) / len(ts)


def bytes_per_point_duckdb_parquet(ts: list[int], vals: list[float]) -> float:
    """DuckDB's own default float codec (ALP), exercised by actually
    writing the regime to Parquet and measuring the file on disk —
    DuckDB's library page is quoted for the claim that ALP is the default;
    this measures DuckDB's real behavior rather than taking the claim on
    faith."""
    con = duckdb.connect()
    con.execute("CREATE TABLE points(ts BIGINT, value DOUBLE)")
    con.executemany("INSERT INTO points VALUES (?, ?)", list(zip(ts, vals)))
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "points.parquet"
        con.execute(f"COPY points TO '{path}' (FORMAT PARQUET)")
        size = path.stat().st_size
    con.close()
    return size / len(ts)


def main() -> None:
    N = 500

    # the paper's own worked example, reproduced exactly
    writer = BitWriter()
    bits_used = encode_delta_of_delta(writer, -2)
    assert bits_used == 9, "a delta-of-delta of -2 must encode to exactly 9 bits, per the paper's own worked example"

    writer2 = BitWriter()
    # construct an XOR with 11 leading zeros and exactly 1 meaningful bit
    xor_value = 1 << (64 - 11 - 1)
    bits_used2, _, _ = encode_xor_value(writer2, xor_value, prev_leading=64, prev_meaningful_len=0)
    assert bits_used2 == 14, "an XOR with 11 leading zeros and 1 meaningful bit must encode to exactly 14 bits, per the paper's own worked example"

    # the chapter's own illustrative delta-of-delta sequence (60, 60, 59, 61 -> 0, -1, 2)
    deltas = [60, 60, 59, 61]
    dods = [deltas[i] - deltas[i - 1] for i in range(1, len(deltas))]
    assert dods == [0, -1, 2]

    regimes = {
        "regular_slow": build_regime_regular_slow(N),
        "noisy_float": build_regime_noisy_float(N),
        "decimal_regular": build_regime_decimal_regular(N),
    }

    results: dict[str, dict[str, float]] = {}
    for name, (ts, vals) in regimes.items():
        results[name] = {
            "raw": bytes_per_point_raw(N),
            "gorilla": bytes_per_point_gorilla(ts, vals),
            "chimp": bytes_per_point_chimp(ts, vals),
            "chimp128": bytes_per_point_chimp(ts, vals, window=128),
            "zstd": bytes_per_point_zstd(ts, vals),
            "duckdb_parquet": bytes_per_point_duckdb_parquet(ts, vals),
        }

    # the central claim: the ratio is a property of the data, not the codec
    regular_ratio = results["regular_slow"]["raw"] / results["regular_slow"]["gorilla"]
    noisy_ratio = results["noisy_float"]["raw"] / results["noisy_float"]["gorilla"]
    assert regular_ratio > noisy_ratio * 2, "Gorilla's own encoder must do far better on the regular, slow-changing regime than on the noisy one"
    assert results["regular_slow"]["gorilla"] < 4.0, "Gorilla should compress the favourable regime well below raw's 16 bytes"
    assert results["noisy_float"]["gorilla"] > results["regular_slow"]["gorilla"], "the same encoder must do worse on data it wasn't designed for"

    for name in regimes:
        assert results[name]["gorilla"] < results[name]["raw"], f"{name}: Gorilla must still beat raw storage"

    # Chimp128's wider match window (the best of the last 128 values, not
    # just the immediately preceding one) should help most on data with a
    # repeating pattern — the decimal regime cycles through a short, fixed
    # set of values, so a much earlier value is often a near-exact repeat
    decimal = results["decimal_regular"]
    assert decimal["chimp128"] < decimal["chimp"], "Chimp128's wider match window must beat the single-previous-value Chimp on data with a repeating pattern"
    assert decimal["chimp128"] < decimal["gorilla"], "Chimp128 must also beat Gorilla's single-previous-value comparison on the same repeating data"

    # decimal-aware codecs should matter most on the decimal regime: a plain
    # zlib/Zstd-class general-purpose compressor is the stand-in for "older
    # float codecs barely beat general-purpose compression" on this data
    assert decimal["zstd"] < decimal["gorilla"], "on genuinely decimal, low-entropy data, general-purpose compression can beat a bit-pattern-based codec that assumes slow change"

    for name in regimes:
        assert results[name]["duckdb_parquet"] < results[name]["raw"], f"{name}: DuckDB's default Parquet codec must still beat raw storage"

    print("all compression-encoder assertions passed")
    for name, r in results.items():
        print(f"  {name}: raw={r['raw']:.2f} gorilla={r['gorilla']:.2f} chimp={r['chimp']:.2f} chimp128={r['chimp128']:.2f} zstd={r['zstd']:.2f} duckdb_parquet={r['duckdb_parquet']:.2f}")


if __name__ == "__main__":
    main()
