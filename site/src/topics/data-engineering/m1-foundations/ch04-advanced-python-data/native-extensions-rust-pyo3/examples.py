"""Native extensions with Rust and PyO3: a real PyO3 extension, built with maturin
against this interpreter, measured against pure Python and Polars, its GIL release
measured directly, and both a per-version and an abi3 wheel actually built.
Rust sources live in examples/hot_transform/; every path is resolved from __file__.
Needs cargo/rustc on PATH and `pip install maturin` (both present in this sandbox)."""

import os
import random
import shutil
import subprocess
import sys
import sysconfig
import threading
import time

import polars as pl

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, "examples", "hot_transform")
CARGO = shutil.which("cargo")
MATURIN = shutil.which("maturin")
assert CARGO, "cargo is required (rustup installs it)"
assert MATURIN, "maturin is required (pip install maturin)"


def maturin_build_and_install():
    r = subprocess.run(
        [MATURIN, "build", "--release", "--interpreter", sys.executable],
        cwd=CRATE,
        capture_output=True,
        text=True,
        timeout=300,
    )
    assert r.returncode == 0, f"maturin build should succeed:\n{r.stdout}\n{r.stderr}"
    log = r.stdout + r.stderr
    wheel_line = [line for line in log.splitlines() if "Built wheel" in line][0]
    wheel_path = wheel_line.split(" to ")[-1].strip()

    install = subprocess.run(
        [sys.executable, "-m", "pip", "install", "--force-reinstall", "--no-deps", "-q", wheel_path],
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert install.returncode == 0, f"pip install of the built wheel should succeed:\n{install.stdout}\n{install.stderr}"
    return log


def build_pure_python(prices):
    return sum(round(p * 100) for p in prices)


def hot_transformation_rust_vs_python_vs_polars(n=2_000_000):
    """Builds the real extension into this interpreter, then runs the identical
    normalize-and-sum computation three ways and times each for real."""
    build_log = maturin_build_and_install()
    assert "Finished" in build_log, f"expected a successful cargo build:\n{build_log}"

    import hot_transform

    prices = [random.uniform(1, 1000) for _ in range(n)]

    start = time.perf_counter()
    python_result = build_pure_python(prices)
    python_seconds = time.perf_counter() - start

    start = time.perf_counter()
    rust_result = hot_transform.normalize_and_sum_py(prices)
    rust_seconds = time.perf_counter() - start

    start = time.perf_counter()
    series = pl.Series(prices)
    polars_result = int((series * 100).round(0).cast(pl.Int64).sum())
    polars_seconds = time.perf_counter() - start

    assert python_result == rust_result == polars_result

    print(
        f"hot transformation on {n} prices — pure Python: {python_seconds:.4f}s, "
        f"PyO3 extension: {rust_seconds:.4f}s ({python_seconds / rust_seconds:.1f}x "
        f"faster than pure Python), Polars: {polars_seconds:.4f}s"
    )
    return hot_transform


def gil_release_measured(hot_transform, millis=200):
    """Measures, not asserts, the real effect of releasing the GIL: how much
    progress a separate Python thread makes while the extension is busy."""

    def counter_progress(func):
        counter = {"n": 0}
        stop = threading.Event()

        def spin():
            while not stop.is_set():
                counter["n"] += 1

        t = threading.Thread(target=spin)
        t.start()
        func(millis)
        stop.set()
        t.join()
        return counter["n"]

    holding = counter_progress(hot_transform.busy_wait_holding_gil_py)
    releasing = counter_progress(hot_transform.busy_wait_releasing_gil_py)

    assert releasing > holding * 3, (
        f"releasing the GIL should let the Python thread make far more progress, "
        f"got holding={holding} releasing={releasing}"
    )
    print(
        f"GIL held: the other Python thread made {holding} increments in {millis}ms; "
        f"GIL released: {releasing} increments in the same {millis}ms "
        f"({releasing / holding:.1f}x more progress)"
    )


def abi3_and_per_version_wheels_both_build():
    """Builds the same extension two ways and confirms the real wheel filenames
    differ exactly as the limited-API feature predicts."""
    per_version = subprocess.run(
        [MATURIN, "build", "--release"], cwd=CRATE, capture_output=True, text=True, timeout=300
    )
    assert per_version.returncode == 0, per_version.stderr
    abi3 = subprocess.run(
        [MATURIN, "build", "--release", "--features", "abi3"],
        cwd=CRATE,
        capture_output=True,
        text=True,
        timeout=300,
    )
    assert abi3.returncode == 0, abi3.stderr

    per_version_log = per_version.stdout + per_version.stderr
    abi3_log = abi3.stdout + abi3.stderr
    assert "cp3" in per_version_log and "-abi3-" not in per_version_log.split("Built wheel")[-1]
    assert "-abi3-" in abi3_log

    print("per-version wheel built (tagged to this interpreter's exact version)")
    print("abi3 wheel built (tagged cp39-abi3: one wheel for Python 3.9 and up)")


def free_threading_disclosed():
    """Names the real state of this sandbox's own interpreter rather than assuming:
    free-threaded CPython is an optional build starting in 3.13, and this one isn't it."""
    gil_disabled = sysconfig.get_config_var("Py_GIL_DISABLED")
    is_free_threaded_build = bool(gil_disabled)
    print(
        f"this sandbox's CPython {sys.version.split()[0]}: "
        f"Py_GIL_DISABLED={gil_disabled} (free-threaded build: {is_free_threaded_build})"
    )
    assert not is_free_threaded_build, "sourced claim expects a standard, non-free-threaded build here"


def main():
    hot_transform = hot_transformation_rust_vs_python_vs_polars()
    gil_release_measured(hot_transform)
    abi3_and_per_version_wheels_both_build()
    free_threading_disclosed()
    print("native-extensions-rust-pyo3 examples: all checks pass")


if __name__ == "__main__":
    main()
