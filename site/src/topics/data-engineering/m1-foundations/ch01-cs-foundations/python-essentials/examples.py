"""Every code example shown in the Python essentials reel, executed and checked.
Run: python3 examples.py (CI runs it too). Each block asserts what the reel claims."""
import sys, tracemalloc
from contextlib import contextmanager
from dataclasses import dataclass, FrozenInstanceError
from functools import wraps

# Step: mutable default arguments are evaluated once, when `def` runs.
def append_one(xs=[]):
    xs.append(1)
    return xs
assert append_one() == [1]
assert append_one() == [1, 1]  # the same list, shared across calls
assert append_one.__defaults__ == ([1, 1],)  # it lives on the function object

def append_one_fixed(xs=None):
    if xs is None:
        xs = []
    xs.append(1)
    return xs
assert append_one_fixed() == [1] and append_one_fixed() == [1]

# Step: comprehensions, filter then map; dict and set forms; own scope.
xs = [1, 2, 3, 4, 5]
assert [x * x for x in xs if x % 2] == [1, 9, 25]
assert {x: x * x for x in xs if x % 2} == {1: 1, 3: 9, 5: 25}
assert {x % 3 for x in xs} == {0, 1, 2}
x = 'outer'
_ = [x for x in range(3)]
assert x == 'outer'  # the loop variable doesn't leak

# Step: generators stream in constant memory; a list materializes everything.
def peak(f):
    tracemalloc.start(); f(); _, p = tracemalloc.get_traced_memory(); tracemalloc.stop(); return p
list_peak = peak(lambda: sum([i * i for i in range(1_000_000)]))
gen_peak = peak(lambda: sum(i * i for i in range(1_000_000)))
assert sum(i * i for i in range(1_000_000)) == sum([i * i for i in range(1_000_000)])
assert list_peak > 1_000_000 * 8 and gen_peak < 10_000, (list_peak, gen_peak)
def read_batches(rows, size):
    batch = []
    for r in rows:
        batch.append(r)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch
assert list(read_batches(range(5), 2)) == [[0, 1], [2, 3], [4]]
g = read_batches(range(5), 2)
assert next(g) == [0, 1]  # lazily: nothing after the first batch has run yet

# Step: a context manager's exit runs even when the body raises.
log = []
@contextmanager
def connection():
    log.append('open')
    try:
        yield 'conn'
    finally:
        log.append('close')
try:
    with connection() as c:
        log.append(f'use {c}')
        raise ValueError('boom')
except ValueError:
    pass
assert log == ['open', 'use conn', 'close']
# The compact form shown on screen behaves the same.
log.clear()
@contextmanager
def connection2():
    log.append('open')
    try:
        yield 'conn'
    finally:  log.append('close')
try:
    with connection2() as c:
        raise ValueError('boom')
except ValueError:
    pass
assert log == ['open', 'close']

# Step: a decorator is a function that takes a function and returns one.
def timed(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper
@timed
def load(path):
    """Load a file."""
    return path
assert load('a.csv') == 'a.csv'
assert load.__name__ == 'load' and load.__doc__ == 'Load a file.'  # thanks to functools.wraps
def no_wraps(fn):
    def wrapper(*a, **k):
        return fn(*a, **k)
    return wrapper
@no_wraps
def load2(path):
    """Load a file."""
    return path
assert load2.__name__ == 'wrapper' and load2.__doc__ is None

# Step: dataclasses: generated __init__/__repr__/__eq__; frozen and slots.
@dataclass(frozen=True, slots=True)
class Event:
    id: int
    kind: str
e = Event(1, 'click')
assert e == Event(1, 'click') and repr(e) == "Event(id=1, kind='click')"
try:
    e.kind = 'view'
    raise AssertionError('frozen dataclass allowed assignment')
except FrozenInstanceError:
    pass
assert not hasattr(e, '__dict__')  # slots: no per-instance dict
from dataclasses import field
try:
    @dataclass
    class Bad:
        xs: list = []
    raise AssertionError('dataclass accepted a mutable default')
except ValueError as err:
    assert 'use default_factory' in str(err)
@dataclass
class Good:
    xs: list = field(default_factory=list)
assert Good().xs is not Good().xs

# Step: type hints are not enforced at runtime.
def double(n: int) -> int:
    return n * 2
assert double('ab') == 'abab'  # runs fine; a type checker would flag it
assert double.__annotations__ == {'n': int, 'return': int}
def first(xs: list[int]) -> int | None:
    return xs[0] if xs else None
assert first([]) is None

print(f'all Python essentials examples pass on Python {sys.version.split()[0]} '
      f'(list peak {list_peak/1e6:.1f} MB, generator peak {gen_peak/1e3:.1f} KB)')
