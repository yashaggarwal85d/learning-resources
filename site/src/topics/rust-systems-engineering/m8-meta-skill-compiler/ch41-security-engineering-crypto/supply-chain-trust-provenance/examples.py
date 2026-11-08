import json
import subprocess
from pathlib import Path

HERE = Path(__file__).parent
VULNERABLE = HERE / "examples" / "vulnerable"
PATCHED = HERE / "examples" / "patched"

ADVISORY_ID = "RUSTSEC-2021-0003"
VULNERABLE_VERSION = "1.6.0"
PATCHED_VERSION = "1.6.1"


def pinned_smallvec(workspace):
    """The smallvec version Cargo really resolved, read from the workspace's own Cargo.lock."""
    lock = (workspace / "Cargo.lock").read_text()
    for block in lock.split("[[package]]"):
        if 'name = "smallvec"' in block:
            return block.split('version = "', 1)[1].split('"', 1)[0]
    raise AssertionError(f"no smallvec in {workspace}/Cargo.lock")


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

    # Each workspace really resolved the exact version it pins.
    assert pinned_smallvec(VULNERABLE) == VULNERABLE_VERSION
    assert pinned_smallvec(PATCHED) == PATCHED_VERSION

    # The real, live RustSec database reports the advisory for the real,
    # pinned vulnerable version, by its own real id.
    assert vulnerable_report["vulnerabilities"]["found"] is True
    assert vulnerable_report["vulnerabilities"]["count"] == 1
    reported_ids = [v["advisory"]["id"] for v in vulnerable_report["vulnerabilities"]["list"]]
    assert ADVISORY_ID in reported_ids
    finding = vulnerable_report["vulnerabilities"]["list"][0]
    assert finding["package"]["name"] == "smallvec"
    assert finding["package"]["version"] == VULNERABLE_VERSION
    # The advisory itself names 1.6.1 as the first patched 1.x release.
    assert ">=1.6.1" in [r.replace(" ", "") for r in finding["versions"]["patched"]]

    # The identical real lookup against the real, patched version, 1.6.1,
    # one release later, reports a clean result: no advisory at all.
    assert patched_report["vulnerabilities"]["found"] is False
    assert patched_report["vulnerabilities"]["count"] == 0

    print("All assertions passed.")
    print(
        {
            "vulnerable_found": vulnerable_report["vulnerabilities"]["found"],
            "vulnerable_advisory_id": reported_ids[0],
            "vulnerable_version": pinned_smallvec(VULNERABLE),
            "patched_version": pinned_smallvec(PATCHED),
            "advisory_patched_ranges": finding["versions"]["patched"],
            "patched_found": patched_report["vulnerabilities"]["found"],
        }
    )


if __name__ == "__main__":
    main()
