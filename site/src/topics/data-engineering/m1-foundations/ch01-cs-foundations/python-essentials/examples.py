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

# Step: closures look names up when they run, not when they're made.
fs = [lambda: i for i in range(3)]
assert [f() for f in fs] == [2, 2, 2]  # every lambda sees the last i
fs = [lambda i=i: i for i in range(3)]
assert [f() for f in fs] == [0, 1, 2]  # a default is evaluated at def: binds now
from functools import partial
assert [partial(lambda i: i, i)() for i in range(3)] == [0, 1, 2]

# Deep dive: keyword-only (after *) and positional-only (before /) parameters.
def write(path, /, *, overwrite=False):
    return (path, overwrite)
assert write('a.parquet', overwrite=True) == ('a.parquet', True)
for bad in (lambda: write('a', True), lambda: write(path='a')):
    try:
        bad()
        raise AssertionError('signature accepted a call it should reject')
    except TypeError:
        pass

# Step: classes. Defining __eq__ removes __hash__; a non-frozen dataclass can't be a key.
@dataclass
class Key:
    table: str
try:
    {Key('orders'): 1}
    raise AssertionError('mutable dataclass was hashable')
except TypeError as err:
    assert "unhashable type: 'Key'" in str(err)
assert Key.__hash__ is None
@dataclass(frozen=True)
class FrozenKey:
    table: str
assert {FrozenKey('orders'): 1}[FrozenKey('orders')] == 1  # equal keys, equal hashes
class Plain:
    def __eq__(self, other):
        return True
assert Plain.__hash__ is None  # same rule for any class
class NoEq:
    pass
assert {NoEq(): 1}  # without __eq__, identity hash and identity equality

# Deep dive: special methods plug a class into the language.
class Batch:
    def __init__(self, rows):
        self.rows = rows
    def __len__(self):
        return len(self.rows)
    def __iter__(self):
        return iter(self.rows)
    @property
    def empty(self):
        return not self.rows
    @classmethod
    def of(cls, *rows):
        return cls(list(rows))
b = Batch.of(1, 2, 3)
assert len(b) == 3 and list(b) == [1, 2, 3] and sum(b) == 6 and not b.empty

# Deep dive: a mutable class attribute is shared by every instance (the default trap again).
class Buffer:
    rows = []
    def add(self, r):
        self.rows.append(r)
b1, b2 = Buffer(), Buffer()
b1.add(1)
assert b2.rows == [1]

# Deep dive: structural typing with Protocol; TypedDict is a plain dict at runtime.
from typing import Protocol, TypedDict, runtime_checkable
@runtime_checkable
class Writer(Protocol):
    def write(self, data: bytes) -> int: ...
import io
assert isinstance(io.BytesIO(), Writer)  # no inheritance needed
class Row(TypedDict):
    id: int
    kind: str
r: Row = {'id': 1, 'kind': 'click'}
assert type(r) is dict and type(Row(id=1, kind='x')) is dict

# Deep dive: iterators are single-pass; generators are lazy.
it = (x for x in range(3))
assert sum(it) == 3 and sum(it) == 0  # the second pass silently sees nothing
def parse(rows):
    if rows is None:
        raise ValueError('no rows')
    yield from rows
g = parse(None)  # no error yet: the body hasn't started
try:
    next(g)
    raise AssertionError('generator ran eagerly')
except ValueError:
    pass
assert list(parse([1, 2])) == [1, 2]  # yield from delegates to another iterable

# Deep dive: a generator's finally runs when it is exhausted or closed, not when abandoned.
closed = []
def lines():
    try:
        yield 'a'
        yield 'b'
    finally:
        closed.append(True)
g = lines()
assert next(g) == 'a' and closed == []
g.close()  # raises GeneratorExit inside, at the paused yield
assert closed == [True]

# Deep dive: StopIteration inside a generator becomes RuntimeError (PEP 479).
def leaky():
    yield next(iter([]))
try:
    list(leaky())
    raise AssertionError('StopIteration leaked silently')
except RuntimeError:
    pass

# Deep dive: itertools for streams.
from itertools import batched, groupby
assert list(batched(range(5), 2)) == [(0, 1), (2, 3), (4,)]  # Python 3.12+
assert [k for k, _ in groupby('aabaa')] == ['a', 'b', 'a']  # only consecutive keys group
assert [k for k, _ in groupby(sorted('aabaa'))] == ['a', 'b']

# Deep dive: functools caches need hashable arguments and grow without bound.
from functools import lru_cache, cache
@cache
def square(n):
    return n * n
assert square(4) == 16 and square.cache_info().maxsize is None  # unbounded
@lru_cache(maxsize=2)
def total(xs):
    return sum(xs)
try:
    total([1, 2])
    raise AssertionError('cached a list argument')
except TypeError:
    pass
assert total((1, 2)) == 3

# Deep dive: modern hints; PEP 695 generics (3.12+); abstract parameter types.
from collections.abc import Iterable, Iterator
def first_of[T](xs: Iterable[T]) -> T | None:
    for x in xs:
        return x
    return None
assert first_of(iter('ab')) == 'a' and first_of([]) is None
def numbers(n: int) -> Iterator[int]:
    yield from range(n)
assert list(numbers(2)) == [0, 1]

# Code review: chain exceptions with `raise ... from`.
try:
    try:
        int('x')
    except ValueError as err:
        raise RuntimeError('bad row') from err
except RuntimeError as e:
    assert isinstance(e.__cause__, ValueError)

# Deep dive: a lazy iterator must not escape its `with` block.
import os, tempfile
tmp = os.path.join(tempfile.mkdtemp(), 'rows.txt')
with open(tmp, 'w', encoding='utf-8') as fh:
    fh.write('a\nb\n')
def rows_bad(path):
    with open(path, encoding='utf-8') as fh:
        return (line for line in fh)  # the file closes on return
try:
    next(rows_bad(tmp))
    raise AssertionError('read from a closed file')
except ValueError as err:
    assert 'closed file' in str(err)
def rows_good(path):
    with open(path, encoding='utf-8') as fh:
        yield from fh  # the file stays open while the consumer pulls
assert list(rows_good(tmp)) == ['a\n', 'b\n']

# Deep dive: a context manager guarantees only what its __exit__ does.
import sqlite3
from contextlib import closing, suppress, ExitStack
con = sqlite3.connect(':memory:')
with con:  # commits (or rolls back) the transaction...
    con.execute('create table t (x)')
    con.execute('insert into t values (1)')
assert con.execute('select count(*) from t').fetchone() == (1,)  # ...but the connection is still open
with closing(sqlite3.connect(':memory:')) as c2:
    pass
try:
    c2.execute('select 1')
    raise AssertionError('closing() did not close')
except sqlite3.ProgrammingError:
    pass
with suppress(FileNotFoundError):
    os.remove('/nonexistent/file')
with ExitStack() as stack:
    files = [stack.enter_context(open(tmp, encoding='utf-8')) for _ in range(3)]
assert all(f.closed for f in files)

# Deep dive: `return` in `finally` swallows the exception in flight (SyntaxWarning since 3.14, PEP 765).
import warnings
with warnings.catch_warnings():
    warnings.simplefilter('ignore', SyntaxWarning)
    ns = {}
    exec('def swallow():\n    try:\n        raise ValueError\n    finally:\n        return "ok"\n', ns)
assert ns['swallow']() == 'ok'

# Deep dive: zip() truncates silently unless strict=True (3.10+, PEP 618).
assert list(zip([1, 2, 3], 'ab')) == [(1, 'a'), (2, 'b')]
try:
    list(zip([1, 2, 3], 'ab', strict=True))
    raise AssertionError('strict zip accepted unequal inputs')
except ValueError:
    pass
if sys.version_info >= (3, 13):
    try:
        list(batched(range(5), 2, strict=True))
        raise AssertionError('strict batched accepted a short batch')
    except ValueError:
        pass

# Code review: truthiness drops valid zeros; test `is None`.
rows = [{'amount': 0}, {'amount': 5}, {}]
assert [r for r in rows if r.get('amount')] == [{'amount': 5}]  # the 0 row is lost
assert [r for r in rows if r.get('amount') is not None] == [{'amount': 0}, {'amount': 5}]

# Deep dive: tee to consume twice; an Iterable parameter may be single-pass.
from itertools import tee
a_it, b_it = tee(x for x in range(3))
assert sum(a_it) == 3 and list(b_it) == [0, 1, 2]
def twice(xs):
    return sum(xs) + sum(xs)  # fine for a list, wrong for a generator
assert twice([1, 2]) == 6 and twice(x for x in [1, 2]) == 3

# Deep dive: both caches need hashable arguments; lru_cache defaults to 128 entries; results are shared.
@cache
def ident(x):
    return x
try:
    ident([1])
    raise AssertionError('cache accepted a list')
except TypeError:
    pass
@lru_cache
def default_size(n):
    return n
assert default_size.cache_info().maxsize == 128
@cache
def config():
    return {'retries': 3}
config()['retries'] = 0
assert config()['retries'] == 0  # a caller mutated the cached result for everyone

# Deep dive: kw_only dataclass fields.
@dataclass(kw_only=True)
class Job:
    name: str
    retries: int = 3
try:
    Job('load')
    raise AssertionError('positional argument accepted')
except TypeError:
    pass
assert Job(name='load').retries == 3

# Deep dive: on 3.14+ annotations are evaluated lazily; read them with annotationlib.
if sys.version_info >= (3, 14):
    ns = {}
    exec('def f(x: Undefined) -> int: return 1', ns)  # no NameError at def time
    import annotationlib
    ann = annotationlib.get_annotations(ns['f'], format=annotationlib.Format.FORWARDREF)
    assert ann['return'] is int
    try:
        ns['f'].__annotations__
        raise AssertionError('undefined annotation evaluated')
    except NameError:
        pass

# Deep dive: unpacking in comprehensions (3.15+, PEP 798).
if sys.version_info >= (3, 15):
    ns = {}
    exec('out = [*xs for xs in [[1, 2], [3]]]', ns)
    assert ns['out'] == [1, 2, 3]

print(f'all Python essentials examples pass on Python {sys.version.split()[0]} '
      f'(list peak {list_peak/1e6:.1f} MB, generator peak {gen_peak/1e3:.1f} KB)')
