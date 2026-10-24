import re
import subprocess
from pathlib import Path

CRATE = Path(__file__).parent / "examples" / "parser_demo"


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
        m = re.match(r"^(\w+)=(true|false)$", line.strip())
        if m:
            values[m.group(1)] = m.group(2) == "true"
    return values


def main():
    v = run()

    for key in (
        "naive_good_ok",
        "checked_good_ok",
        "both_match_good",
        "naive_oversized_panicked",
        "checked_oversized_rejected",
        "naive_over_policy_accepted",
        "checked_over_policy_rejected",
        "naive_sum_wrapped_small",
        "checked_sum_detected_overflow",
    ):
        assert key in v, f"missing {key} in output"

    # On well-formed input, both parsers agree and return the real,
    # identical payload.
    assert v["naive_good_ok"] is True
    assert v["checked_good_ok"] is True
    assert v["both_match_good"] is True

    # A declared length claiming far more bytes than the real buffer
    # holds: the naive parser's unchecked slice genuinely panics, while
    # the checked parser rejects it cleanly, with no panic.
    assert v["naive_oversized_panicked"] is True
    assert v["checked_oversized_rejected"] is True

    # A declared length that fits the real buffer but violates this
    # format's own stated maximum payload size: the naive parser, which
    # never checks a size policy, accepts it anyway, while the checked
    # parser rejects it.
    assert v["naive_over_policy_accepted"] is True
    assert v["checked_over_policy_rejected"] is True

    # Two attacker-influenced lengths whose real sum genuinely overflows
    # a 32-bit addition: the naive, unchecked sum silently wraps to a
    # small number, while the checked sum genuinely detects the overflow.
    assert v["naive_sum_wrapped_small"] is True
    assert v["checked_sum_detected_overflow"] is True

    print("All assertions passed.")
    print(v)


if __name__ == "__main__":
    main()
