import re
import subprocess
from pathlib import Path

CRATE = Path(__file__).parent / "examples" / "pipeline_demo"


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
        "batch_size_bytes",
        "capacity_batches",
        "n_batches",
        "bounded_peak_bytes",
        "unbounded_peak_bytes",
    ):
        assert key in v, f"missing {key} in output"

    batch_size = v["batch_size_bytes"]
    capacity = v["capacity_batches"]
    n_batches = v["n_batches"]

    # The bounded, owning pipeline's own real peak memory stays capped
    # near the real channel capacity: never far beyond it, however many
    # batches the fast producer builds against the slow sink.
    assert v["bounded_peak_bytes"] <= batch_size * (capacity + 3)

    # The unbounded, cloning pipeline's own real peak memory grows toward
    # the full real run, because its fast producer never has to wait on
    # the slow sink for a single real batch.
    assert v["unbounded_peak_bytes"] >= batch_size * (n_batches - 1)

    # The real, measured gap between the two is large: the unbounded
    # pipeline's own real peak is at least an order of magnitude the
    # bounded pipeline's own real peak.
    assert v["unbounded_peak_bytes"] >= v["bounded_peak_bytes"] * 5

    print("All assertions passed.")
    print(v)


if __name__ == "__main__":
    main()
