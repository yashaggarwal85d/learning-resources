"""Container resource limits: cgroups and OOM — the mechanisms the reel draws, run for real.

This build machine has no cgroup v2 host (no /sys/fs/cgroup/memory.max to read or write), so the
kernel-OOM-kill signature (memory.events' oom/oom_kill counters, exit code 137) is sourced from
the kernel's own documentation (SOURCES.md), never fabricated as measured here.

What IS run for real: a genuine JVM OutOfMemoryError (a small -Xmx heap, in OOMTest.java) and a
genuine Python RSS climb (resource.getrusage), which are exactly the other two death signatures
this topic tells apart. Spark's memoryOverhead arithmetic and the MaxRAMPercentage default are
checked against the sourced numbers in SOURCES.md.
"""

import resource
import subprocess
from pathlib import Path

HERE = Path(__file__).parent


def run_jvm_oom():
    subprocess.run(["javac", str(HERE / "OOMTest.java")], check=True, cwd=HERE)
    result = subprocess.run(
        ["java", "-Xmx32m", "OOMTest"],
        cwd=HERE, capture_output=True, text=True, timeout=30,
    )
    return {line.split(":")[0]: line.split(":", 1)[1] for line in result.stdout.strip().splitlines() if ":" in line}


def test_jvm_oom_is_caught_and_the_process_survives():
    out = run_jvm_oom()
    assert out["CAUGHT"] == "java.lang.OutOfMemoryError"
    assert out["STILL_ALIVE"] == "true"
    # it ran out of heap holding well under the 32 MiB limit's worth of 1 MiB chunks,
    # because the JVM itself, its classes and the ArrayList's own bookkeeping use heap too
    assert 0 < int(out["CHUNKS_HELD"]) < 32


def python_rss_kib() -> int:
    # ru_maxrss is already in KiB on Linux (kilobytes elsewhere; Linux's man page states KiB).
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss


def test_python_rss_climbs_as_a_list_grows_no_heap_exception_ever_raised():
    before = python_rss_kib()
    # Twenty million small ints: a real, measured climb — Python raises no exception at all as
    # memory grows, unlike the JVM's OutOfMemoryError; only a kernel limit would ever stop it.
    hold = [i for i in range(20_000_000)]
    after = python_rss_kib()
    assert after > before
    assert len(hold) == 20_000_000


# --- exit code 137 is 128 + signal 9 (SIGKILL), the kernel OOM killer's signal ---
SIGKILL = 9


def test_oomkilled_exit_code_is_128_plus_sigkill():
    assert 128 + SIGKILL == 137


# --- cgroup v2 cpu.max: "$MAX $PERIOD" in microseconds; "max 100000" is the unthrottled default ---
def parse_cpu_max(value: str) -> tuple[str, int]:
    quota, period = value.split()
    return quota, int(period)


def throttled_fraction(quota_usec: int, period_usec: int, demand_usec: int) -> float:
    """What fraction of a period a thread group spends throttled, given it wants demand_usec of
    CPU time but the group's quota per period is quota_usec."""
    if demand_usec <= quota_usec:
        return 0.0
    return (demand_usec - quota_usec) / demand_usec


def test_cpu_max_default_is_unthrottled():
    quota, period = parse_cpu_max("max 100000")
    assert quota == "max"
    assert period == 100_000  # microseconds: a 100ms period


def test_cpu_max_quota_throttles_a_hungry_workload():
    # A pod asks for 200m CPU (two-tenths of a core): quota 20000, period 100000.
    quota, period = parse_cpu_max("20000 100000")
    quota_usec = int(quota)
    # It actually wants a whole core's worth of work (100000us) in that period.
    assert throttled_fraction(quota_usec, period, demand_usec=100_000) == 0.8
    # If it only wants what it's entitled to, no throttling.
    assert throttled_fraction(quota_usec, period, demand_usec=quota_usec) == 0.0


# --- Spark memoryOverhead: memory * factor, floored at the minimum (SOURCES.md) ---
JVM_OVERHEAD_FACTOR = 0.10
NON_JVM_OVERHEAD_FACTOR = 0.40  # Kubernetes non-JVM jobs (e.g. PySpark)
MIN_OVERHEAD_MIB = 384


def memory_overhead_mib(container_memory_mib: int, non_jvm: bool) -> int:
    factor = NON_JVM_OVERHEAD_FACTOR if non_jvm else JVM_OVERHEAD_FACTOR
    return max(MIN_OVERHEAD_MIB, round(container_memory_mib * factor))


def test_jvm_executor_overhead_is_ten_percent():
    assert memory_overhead_mib(4096, non_jvm=False) == round(4096 * 0.10)


def test_small_jvm_executor_overhead_is_floored_at_the_minimum():
    # 10% of 2 GiB is below 384 MiB, so the floor applies.
    assert memory_overhead_mib(2048, non_jvm=False) == MIN_OVERHEAD_MIB


def test_pyspark_executor_needs_four_times_the_overhead_fraction():
    jvm_overhead = memory_overhead_mib(4000, non_jvm=False)
    pyspark_overhead = memory_overhead_mib(4000, non_jvm=True)
    assert pyspark_overhead == 4 * jvm_overhead == 1600


# --- the JVM's own default heap ceiling inside a container (SOURCES.md: Oracle java(1), 21) ---
MAX_RAM_PERCENTAGE_DEFAULT = 25


def test_default_max_ram_percentage_leaves_headroom_for_non_heap():
    container_limit_mib = 4096
    default_heap_ceiling = container_limit_mib * MAX_RAM_PERCENTAGE_DEFAULT / 100
    assert default_heap_ceiling == 1024
    # the other 75% of the limit is headroom for metaspace, thread stacks, native memory —
    # exactly what the hook's "healthy heap, OOMKilled anyway" incident runs into if someone
    # raises the container limit without also raising MaxRAMPercentage or -Xmx.
    assert default_heap_ceiling < container_limit_mib


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} checks passed.")
