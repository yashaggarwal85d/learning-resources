import re
import subprocess
from pathlib import Path

CRATE = Path(__file__).parent / "examples" / "proptest_demo"


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
        m = re.match(r"^(\w+)=(true|false|\d+)$", line.strip())
        if m:
            key, value = m.group(1), m.group(2)
            if value in ("true", "false"):
                values[key] = value == "true"
            else:
                values[key] = int(value)
    return values


def main():
    v = run()

    for key in (
        "naive_failed",
        "naive_min_failing_sum",
        "checked_passed",
        "model_agreement_held",
    ):
        assert key in v, f"missing {key} in output"

    # The naive, buggy insert genuinely fails the real bounds invariant
    # under proptest's own randomly generated input.
    assert v["naive_failed"] is True

    # The real shrunk, minimal failing case sums to just barely over the
    # page's own real capacity (100): shrinking found the smallest real
    # overrun, never a case that overruns by far more than it has to.
    assert 101 <= v["naive_min_failing_sum"] <= 105

    # The checked, correct insert genuinely passes the identical real
    # bounds invariant across every one of proptest's own random cases.
    assert v["checked_passed"] is True

    # The real, stateful, model-based comparison between the checked
    # allocator and the simpler reference model genuinely agrees on
    # every real accept-or-reject decision, across every random case.
    assert v["model_agreement_held"] is True

    print("All assertions passed.")
    print(v)


if __name__ == "__main__":
    main()
