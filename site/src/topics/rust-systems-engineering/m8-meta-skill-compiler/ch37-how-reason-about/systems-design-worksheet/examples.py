import re
import subprocess
from pathlib import Path

CRATE = Path(__file__).parent / "examples" / "worksheet_demo"


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
        "bounded_admitted",
        "bounded_rejected",
        "bounded_queue_len_at_checkpoint",
        "unbounded_admitted",
        "unbounded_rejected",
        "unbounded_queue_len_at_checkpoint",
    ):
        assert key in v, f"missing {key} in output"

    burst_count = 8
    capacity = 2

    # The bounded instance's own real queue stays capped at capacity and
    # sheds the rest of the burst.
    assert v["bounded_admitted"] + v["bounded_rejected"] == burst_count
    assert v["bounded_queue_len_at_checkpoint"] == capacity
    assert v["bounded_rejected"] > 0

    # The unbounded instance's own real queue admits the entire burst and
    # grows past the bounded instance's own capacity instead of shedding.
    assert v["unbounded_admitted"] == burst_count
    assert v["unbounded_rejected"] == 0
    assert v["unbounded_queue_len_at_checkpoint"] == burst_count - 1
    assert v["unbounded_queue_len_at_checkpoint"] > v["bounded_queue_len_at_checkpoint"]

    print("All assertions passed.")
    print(v)


if __name__ == "__main__":
    main()
