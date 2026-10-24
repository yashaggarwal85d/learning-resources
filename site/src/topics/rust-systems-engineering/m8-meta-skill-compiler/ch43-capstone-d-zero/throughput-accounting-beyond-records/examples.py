import re
import subprocess
from pathlib import Path

CRATE = Path(__file__).parent / "examples" / "alloc_demo"


def run():
    result = subprocess.run(
        ["cargo", "run", "--release", "--quiet"],
        cwd=CRATE,
        capture_output=True,
        text=True,
        timeout=180,
    )
    assert result.returncode == 0, result.stderr
    values = {}
    for line in result.stdout.splitlines():
        m = re.match(r"^(\w+)=(\d+)$", line.strip())
        if m:
            values[m.group(1)] = int(m.group(2))
    return values


def main():
    v = run()

    for key in (
        "n_records",
        "record_size_bytes",
        "move_records_per_sec",
        "clone_records_per_sec",
        "move_bytes_per_record",
        "clone_bytes_per_record",
    ):
        assert key in v, f"missing {key} in output"

    # The two real implementations' own real throughput numbers are
    # statistically indistinguishable: within a real, modest band of
    # each other, never off by a large, structural factor.
    ratio = v["clone_records_per_sec"] / v["move_records_per_sec"]
    assert 0.5 <= ratio <= 1.1, f"throughput ratio {ratio} is not close enough to be indistinguishable"

    # The moving implementation's own real allocation per record stays
    # tiny: essentially none of the record's own bytes, just the one
    # shared output vector amortized across every record.
    assert v["move_bytes_per_record"] <= 20

    # The cloning implementation's own real allocation per record lands
    # right around the record's own real size, since it genuinely
    # allocates a fresh copy of every record it touches.
    assert v["record_size_bytes"] <= v["clone_bytes_per_record"] <= v["record_size_bytes"] * 1.5

    # The real, measured gap between the two allocation regimes is
    # large, an order of magnitude or more, the real difference
    # records-per-second alone would never reveal.
    assert v["clone_bytes_per_record"] >= v["move_bytes_per_record"] * 10

    print("All assertions passed.")
    print(v)


if __name__ == "__main__":
    main()
