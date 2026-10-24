import json
import subprocess
from pathlib import Path

HERE = Path(__file__).parent
VULNERABLE = HERE / "examples" / "vulnerable"
PATCHED = HERE / "examples" / "patched"

ADVISORY_ID = "RUSTSEC-2021-0003"


def audit(workspace):
    subprocess.run(
        ["cargo", "generate-lockfile"],
        cwd=workspace,
        capture_output=True,
        text=True,
        timeout=60,
        check=True,
    )
    result = subprocess.run(
        ["cargo", "audit", "--json"],
        cwd=workspace,
        capture_output=True,
        text=True,
        timeout=120,
    )
    # cargo audit exits non-zero when it finds a vulnerability; its real
    # JSON report is still on stdout either way.
    return json.loads(result.stdout)


def main():
    vulnerable_report = audit(VULNERABLE)
    patched_report = audit(PATCHED)

    # The real, live RustSec database reports the advisory for the real,
    # pinned vulnerable version, by its own real id.
    assert vulnerable_report["vulnerabilities"]["found"] is True
    assert vulnerable_report["vulnerabilities"]["count"] == 1
    reported_ids = [v["advisory"]["id"] for v in vulnerable_report["vulnerabilities"]["list"]]
    assert ADVISORY_ID in reported_ids

    # The identical real lookup against the real, patched version, one
    # release later, reports a clean result.
    assert patched_report["vulnerabilities"]["found"] is False
    assert patched_report["vulnerabilities"]["count"] == 0

    print("All assertions passed.")
    print(
        {
            "vulnerable_found": vulnerable_report["vulnerabilities"]["found"],
            "vulnerable_advisory_id": reported_ids[0],
            "patched_found": patched_report["vulnerabilities"]["found"],
        }
    )


if __name__ == "__main__":
    main()
