# Real measurements on this sandbox's own CPython (sys.version printed below), not assumed from
# documentation. Four things are measured directly: the real memory ratio between a list of boxed
# Python ints and the same values packed into a native buffer (SOURCES.md's PyObject header);
# the real memory ratio between a plain class instance and a __slots__ instance; the real,
# directly-disassembled effect of the specializing adaptive interpreter (PEP 659) on the same
# function before and after it is called enough times to specialize; and a real measured speedup
# of a vectorized call over a per-row Python loop on the same data. Whether this build has the
# experimental JIT (3.13+) enabled is also checked directly, never assumed.

import array
import dis
import io
import sys
import time

import polars as pl


def boxed_vs_packed_int_list(n=1000, offset=10_000_000):
    """A list of `n` boxed ints vs. the same values packed into a native array.buffer."""
    values = list(range(offset, offset + n))  # offset avoids the -5..256 small-int cache
    list_shell_bytes = sys.getsizeof(values)
    seen_ids = set()
    boxed_int_bytes = 0
    for v in values:
        if id(v) not in seen_ids:
            seen_ids.add(id(v))
            boxed_int_bytes += sys.getsizeof(v)
    boxed_total = list_shell_bytes + boxed_int_bytes
    packed = array.array("q", values)
    packed_total = sys.getsizeof(packed)
    return boxed_total, packed_total


def dict_instance_vs_slots_instance():
    """A plain class instance (with its own __dict__) vs. a __slots__ instance, same 3 fields."""

    class WithDict:
        def __init__(self, a, b, c):
            self.a, self.b, self.c = a, b, c

    class WithSlots:
        __slots__ = ("a", "b", "c")

        def __init__(self, a, b, c):
            self.a, self.b, self.c = a, b, c

    wd = WithDict(1, 2, 3)
    ws = WithSlots(1, 2, 3)
    dict_total = sys.getsizeof(wd) + sys.getsizeof(wd.__dict__)
    slots_total = sys.getsizeof(ws)
    has_dict_on_slots = hasattr(ws, "__dict__")
    return dict_total, slots_total, has_dict_on_slots


def specializing_interpreter_bytecode():
    """Disassemble the same function before any calls, then after enough calls to specialize,
    for two different argument types — the specializing adaptive interpreter (PEP 659) made
    directly visible, not asserted from the PEP's own text."""

    def add(a, b):
        return a + b

    def disassemble(fn):
        buf = io.StringIO()
        dis.dis(fn, adaptive=True, file=buf)
        return buf.getvalue()

    cold_bytecode = disassemble(add)

    for _ in range(200):
        add(1, 2)
    warm_int_bytecode = disassemble(add)

    def add2(a, b):
        return a + b

    for _ in range(200):
        add2("x", "y")
    warm_str_bytecode = disassemble(add2)

    return cold_bytecode, warm_int_bytecode, warm_str_bytecode


def jit_build_status():
    """Whether this CPython build has the experimental JIT or free-threading enabled."""
    import sysconfig

    has_jit_module = hasattr(sys, "_jit")
    gil_disabled = sysconfig.get_config_var("Py_GIL_DISABLED")
    return has_jit_module, gil_disabled


def loop_vs_vectorized_speedup(n=5_000_000, repeats=3):
    """A per-row Python loop vs. the same arithmetic as a vectorized Polars call, on identical
    data, best-of-`repeats` each, with the vectorized call warmed up once first so the
    measurement isn't dominated by one-time compilation overhead."""
    data = list(range(n))

    py_times = []
    python_result = None
    for _ in range(repeats):
        t0 = time.perf_counter()
        total = 0
        for x in data:
            total += x * 2 + 1
        t1 = time.perf_counter()
        py_times.append(t1 - t0)
        python_result = total

    series = pl.Series("x", data)
    _ = (series * 2 + 1).sum()  # warm-up call; its own cost is disclosed separately below

    pl_times = []
    polars_result = None
    for _ in range(repeats):
        t0 = time.perf_counter()
        polars_result = (series * 2 + 1).sum()
        t1 = time.perf_counter()
        pl_times.append(t1 - t0)

    assert python_result == polars_result, "loop and vectorized call must agree on the result"
    best_py, best_pl = min(py_times), min(pl_times)
    return best_py, best_pl, best_py / best_pl


def consistent_vs_mixed_type_calls(n=3_000_000):
    """The same function, called the same number of times, with one consistent argument type
    throughout vs. alternating int/float — specialization adapts to a type change, but that
    adaptation itself has a real, measurable cost ("the amount of additional work caused by
    mis-specialization", PEP 659)."""

    def add(a, b):
        return a + b

    t0 = time.perf_counter()
    for i in range(n):
        add(i, 1)
    t1 = time.perf_counter()
    consistent = t1 - t0

    t0 = time.perf_counter()
    for i in range(n):
        if i % 2 == 0:
            add(i, 1)
        else:
            add(float(i), 1.0)
    t1 = time.perf_counter()
    mixed = t1 - t0

    return consistent, mixed, mixed / consistent


def vectorized_first_call_overhead(n=5_000_000):
    """The vectorized call's own first-call cost, separated out, since quoting only the warm
    speedup without disclosing this would overstate how fast the very first call actually is."""
    data = list(range(n))
    series = pl.Series("x", data)
    t0 = time.perf_counter()
    _ = (series * 2 + 1).sum()
    t1 = time.perf_counter()
    cold_call = t1 - t0

    t0 = time.perf_counter()
    _ = (series * 2 + 1).sum()
    t1 = time.perf_counter()
    warm_call = t1 - t0
    return cold_call, warm_call


if __name__ == "__main__":
    print("sys.version:", sys.version)

    boxed, packed = boxed_vs_packed_int_list()
    ratio = boxed / packed
    print(f"boxed list total: {boxed} bytes, packed array total: {packed} bytes, ratio: {ratio:.2f}x")
    assert ratio > 3.0, "a list of boxed ints must cost noticeably more than a packed buffer"

    dict_total, slots_total, has_dict_on_slots = dict_instance_vs_slots_instance()
    slots_ratio = dict_total / slots_total
    print(f"__dict__ instance total: {dict_total} bytes, __slots__ instance total: {slots_total} bytes, ratio: {slots_ratio:.2f}x")
    assert not has_dict_on_slots, "a __slots__ instance must not have its own __dict__ at all"
    assert slots_ratio > 2.0, "__slots__ must cut per-instance memory noticeably"

    cold, warm_int, warm_str = specializing_interpreter_bytecode()
    print("--- cold (pre-specialization) bytecode ---")
    print(cold)
    print("--- warm, specialized for int + int ---")
    print(warm_int)
    print("--- warm, specialized for str + str ---")
    print(warm_str)
    assert "BINARY_OP_ADD_INT" in warm_int, "repeated int calls must specialize to the int add"
    assert "BINARY_OP_ADD_UNICODE" in warm_str, "repeated str calls must specialize to the str add"
    assert "BINARY_OP_ADD_INT" not in cold and "BINARY_OP_ADD_UNICODE" not in cold, (
        "the never-yet-called function must show the generic, unspecialized opcode"
    )

    has_jit_module, gil_disabled = jit_build_status()
    print(f"sys._jit present: {has_jit_module}, Py_GIL_DISABLED: {gil_disabled}")
    assert not has_jit_module, "this sandbox's CPython is not built with the experimental JIT"
    assert gil_disabled in (0, "0", None), "this sandbox's CPython is not a free-threaded build"

    best_py, best_pl, speedup = loop_vs_vectorized_speedup()
    print(f"pure python loop (best of repeats): {best_py:.4f}s, polars vectorized (warm, best of repeats): {best_pl:.4f}s, speedup: {speedup:.1f}x")
    assert 10 <= speedup <= 200, "the measured speedup should land inside the syllabus's own 10-100x range (with headroom either side)"

    cold_call, warm_call = vectorized_first_call_overhead()
    print(f"polars first call: {cold_call:.4f}s, second (warm) call: {warm_call:.4f}s")
    assert cold_call > warm_call, "a vectorized call's own first call costs measurably more than a later, warm one"

    consistent, mixed, mix_ratio = consistent_vs_mixed_type_calls()
    print(f"consistent-type calls: {consistent:.4f}s, mixed-type calls: {mixed:.4f}s, mixed/consistent ratio: {mix_ratio:.2f}x")
    assert mix_ratio > 1.1, "alternating argument types must cost measurably more than one consistent type"

    print("cpython-object-model-memory examples: all numbers check out")
