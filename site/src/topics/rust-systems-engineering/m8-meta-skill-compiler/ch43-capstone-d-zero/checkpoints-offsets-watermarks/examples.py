import re
import subprocess
from pathlib import Path

CRATE = Path(__file__).parent / "examples" / "checkpoint_demo"


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
        "n_batches",
        "records_per_batch",
        "correct_committed_batches",
        "correct_checkpoint_batch",
        "correct_reprocessed_batches",
        "correct_lost_records",
        "wrong_committed_batches",
        "wrong_checkpoint_batch",
        "wrong_reprocessed_batches",
        "wrong_lost_records",
    ):
        assert key in v, f"missing {key} in output"

    # Both pipelines crash at the identical real point: the identical
    # number of batches genuinely, durably committed before the crash.
    assert v["correct_committed_batches"] == v["wrong_committed_batches"]

    # The real, correct pipeline's own checkpoint exactly matches what is
    # genuinely committed: a restart reprocesses nothing and loses nothing.
    assert v["correct_checkpoint_batch"] == v["correct_committed_batches"]
    assert v["correct_reprocessed_batches"] == 0
    assert v["correct_lost_records"] == 0

    # The real, wrong pipeline's own checkpoint runs one real batch ahead
    # of what is genuinely committed, because it was taken at handoff,
    # before the real commit for that batch ever returned.
    assert v["wrong_checkpoint_batch"] == v["wrong_committed_batches"] + 1

    # A restart from that wrong checkpoint silently skips the one real
    # batch that was never actually committed: a real, permanent loss,
    # not a duplicate reprocessing of anything already committed.
    assert v["wrong_reprocessed_batches"] == 0
    assert v["wrong_lost_records"] == v["records_per_batch"]

    print("All assertions passed.")
    print(v)


if __name__ == "__main__":
    main()
