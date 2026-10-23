# Real measurements on this sandbox's own CPython 3.13.16 (a standard, GIL-enabled, non-free-
# threaded build; confirmed in cpython-object-model-memory/examples.py). Four things are measured
# directly: fork vs. spawn/forkserver process-pool startup cost; the real memory-duplication
# difference between a fork child (inherits the parent's memory) and a spawn child (starts fresh);
# a real pickling cost; native code (hashlib, a C extension) actually releasing the GIL for true
# thread parallelism versus a pure-Python loop that doesn't; and genuine multi-core parallelism
# from the low-level `_interpreters` module (the C-API machinery that `concurrent.interpreters`,
# new in 3.14, wraps — not itself available on this sandbox's 3.13, so exercised directly instead).
#
# multiprocessing requires picklable, importable top-level functions for its "spawn" and
# "forkserver" start methods, so this file's own worker functions are written as plain
# module-level functions (never closures) specifically so they stay picklable under all three
# start methods.

import hashlib
import multiprocessing as mp
import os
import pickle
import threading
import time

import _interpreters


def _mp_worker(x):
    return x * 2


def fork_vs_spawn_startup(n_procs=4, n_tasks=20):
    """Pool startup + a trivial task, timed per start method."""
    times = {}
    for method in ("fork", "forkserver", "spawn"):
        ctx = mp.get_context(method)
        t0 = time.perf_counter()
        with ctx.Pool(n_procs) as pool:
            pool.map(_mp_worker, range(n_tasks))
        t1 = time.perf_counter()
        times[method] = t1 - t0
    return times


def _rss_mb(pid=None):
    pid = pid or os.getpid()
    with open(f"/proc/{pid}/status") as f:
        for line in f:
            if line.startswith("VmRSS:"):
                return int(line.split()[1]) / 1024
    return None


def _child_report(q):
    import __main__

    q.put((_rss_mb(), hasattr(__main__, "PARENT_BIG_LIST")))


def fork_vs_spawn_memory_duplication(n=5_000_000):
    """A big list allocated only in the parent, before any child starts. A fork child inherits
    it via copy-on-write (same memory, same attribute present); a spawn child re-imports
    __main__ fresh and never sees it at all unless it is explicitly passed."""
    import __main__

    __main__.PARENT_BIG_LIST = list(range(n))
    parent_rss = _rss_mb()

    results = {}
    for method in ("fork", "spawn"):
        ctx = mp.get_context(method)
        q = ctx.Queue()
        p = ctx.Process(target=_child_report, args=(q,))
        p.start()
        child_rss, child_has_list = q.get()
        p.join()
        results[method] = (child_rss, child_has_list)

    del __main__.PARENT_BIG_LIST
    return parent_rss, results


def pickling_cost(n_rows=100_000):
    """A real pickle dumps/loads round trip on a moderately large, realistic structure."""
    data = {"rows": [{"id": i, "value": i * 1.5, "name": f"item-{i}"} for i in range(n_rows)]}
    t0 = time.perf_counter()
    blob = pickle.dumps(data)
    t1 = time.perf_counter()
    dumps_time = t1 - t0
    t0 = time.perf_counter()
    pickle.loads(blob)
    t1 = time.perf_counter()
    loads_time = t1 - t0
    return len(blob), dumps_time, loads_time


def _hash_work(n_iters, data):
    for _ in range(n_iters):
        hashlib.sha256(data).digest()


def _python_work(n):
    total = 0
    for i in range(n):
        total += i * i
    return total


def native_gil_release_vs_pure_python(n_threads=4, hash_iters=400, py_iters=3_000_000):
    """Native C-extension work (hashlib, which releases the GIL for its own computation) run on
    n_threads vs. the identical total work done single-threaded; then the same comparison for a
    pure-Python loop, which never releases the GIL to another Python thread."""
    data = b"x" * 2_000_000

    t0 = time.perf_counter()
    _hash_work(hash_iters * n_threads, data)
    t1 = time.perf_counter()
    hash_single = t1 - t0

    threads = [threading.Thread(target=_hash_work, args=(hash_iters, data)) for _ in range(n_threads)]
    t0 = time.perf_counter()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    t1 = time.perf_counter()
    hash_multi = t1 - t0

    t0 = time.perf_counter()
    _python_work(py_iters * n_threads)
    t1 = time.perf_counter()
    py_single = t1 - t0

    threads = [threading.Thread(target=_python_work, args=(py_iters,)) for _ in range(n_threads)]
    t0 = time.perf_counter()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    t1 = time.perf_counter()
    py_multi = t1 - t0

    return (hash_single / hash_multi), (py_single / py_multi)


_SUBINTERP_CODE = """
total = 0
for i in range(30_000_000):
    total += i * i
"""


def _run_in_new_interpreter():
    interp_id = _interpreters.create()
    try:
        _interpreters.exec(interp_id, _SUBINTERP_CODE)
    finally:
        _interpreters.destroy(interp_id)


def subinterpreter_parallelism(n=4):
    """Real multi-core parallelism from subinterpreters, exercised through the low-level
    `_interpreters` module directly (the C-API machinery `concurrent.interpreters`, new in 3.14,
    wraps — that higher-level module itself isn't available on this sandbox's 3.13). Contrasted
    against the identical total work done as plain threads inside one shared interpreter."""
    t0 = time.perf_counter()
    _run_in_new_interpreter()
    t1 = time.perf_counter()
    single_unit = t1 - t0

    threads = [threading.Thread(target=_run_in_new_interpreter) for _ in range(n)]
    t0 = time.perf_counter()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    t1 = time.perf_counter()
    multi_interp_time = t1 - t0

    def _same_interp_work():
        total = 0
        for i in range(30_000_000):
            total += i * i

    threads2 = [threading.Thread(target=_same_interp_work) for _ in range(n)]
    t0 = time.perf_counter()
    for t in threads2:
        t.start()
    for t in threads2:
        t.join()
    t1 = time.perf_counter()
    same_interp_time = t1 - t0

    serial_estimate = single_unit * n
    return serial_estimate / multi_interp_time, serial_estimate / same_interp_time


if __name__ == "__main__":
    print("has_concurrent_interpreters_module:", end=" ")
    try:
        import concurrent.interpreters  # noqa: F401

        print(True)
    except ModuleNotFoundError:
        print(False)

    times = fork_vs_spawn_startup()
    print("pool startup times:", {k: round(v, 4) for k, v in times.items()})
    assert times["spawn"] > times["fork"], "spawn must start noticeably slower than fork"

    parent_rss, mem_results = fork_vs_spawn_memory_duplication()
    print(f"parent RSS: {parent_rss:.1f} MB")
    for method, (rss, has_list) in mem_results.items():
        print(f"{method} child RSS: {rss:.1f} MB, sees parent's big list: {has_list}")
    assert mem_results["fork"][1] is True, "a fork child must inherit the parent's module globals"
    assert mem_results["spawn"][1] is False, "a spawn child must not see the parent's module globals"
    assert mem_results["fork"][0] > mem_results["spawn"][0] * 3, (
        "the fork child's RSS must reflect the inherited big list, far above the spawn child's fresh RSS"
    )

    blob_bytes, dumps_t, loads_t = pickling_cost()
    print(f"pickled {blob_bytes / 1024 / 1024:.2f} MB in {dumps_t:.4f}s, unpickled in {loads_t:.4f}s")
    assert dumps_t > 0 and loads_t > 0, "pickling a real structure must take measurable, non-zero time"

    hash_speedup, py_speedup = native_gil_release_vs_pure_python()
    print(f"hashlib (GIL released) thread speedup: {hash_speedup:.2f}x, pure-python thread speedup: {py_speedup:.2f}x")
    assert hash_speedup > 2.0, "native code that releases the GIL must show real multi-thread speedup"
    assert py_speedup < 1.3, "a pure Python loop must show little to no speedup across threads under the GIL"

    interp_speedup, same_interp_speedup = subinterpreter_parallelism()
    print(f"subinterpreter speedup: {interp_speedup:.2f}x, same-interpreter-thread speedup: {same_interp_speedup:.2f}x")
    assert interp_speedup > 2.5, "independent subinterpreters in threads must show real multi-core speedup"
    assert interp_speedup > same_interp_speedup, (
        "subinterpreters must parallelize pure Python work better than plain threads in one interpreter"
    )

    print("gil-free-threading-subinterpreters examples: all numbers check out")
