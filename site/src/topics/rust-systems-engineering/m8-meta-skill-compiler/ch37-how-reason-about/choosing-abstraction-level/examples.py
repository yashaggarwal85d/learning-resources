import re
import subprocess
from pathlib import Path

CRATE = Path(__file__).parent / "examples" / "evidence_demo"


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
        m = re.match(r"^(\w+)=([\d.]+)$", line.strip())
        if m:
            values[m.group(1)] = float(m.group(2))
    return values


def main():
    v = run()

    for key in ("reply_on_queue_mean_ms", "reply_on_persist_mean_ms", "worker_delay_ms"):
        assert key in v, f"missing {key} in output"

    worker_delay_ms = v["worker_delay_ms"]

    # The recorded hypothesis: replying only after the storage write
    # completes adds roughly the worker's own processing delay to the
    # client's observed latency, compared to replying immediately on
    # being queued.

    # Reply-on-queue genuinely returns before the worker ever touches the
    # job, so its observed latency stays far below the worker's own delay.
    assert v["reply_on_queue_mean_ms"] < worker_delay_ms * 0.5

    # Reply-on-persist genuinely waits for the worker, so its observed
    # latency lands close to the worker's own delay, within a wide margin.
    assert worker_delay_ms * 0.8 <= v["reply_on_persist_mean_ms"] <= worker_delay_ms * 1.5

    # The real, measured difference between the two is itself close to the
    # worker's own delay, matching the recorded hypothesis directly.
    added_latency_ms = v["reply_on_persist_mean_ms"] - v["reply_on_queue_mean_ms"]
    assert worker_delay_ms * 0.7 <= added_latency_ms <= worker_delay_ms * 1.3

    print("All assertions passed.")
    print(v)


if __name__ == "__main__":
    main()
