"""Every example shown in the "Interior mutability: Cell, RefCell, UnsafeCell" reel, compiled and
run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0). Rust sources live in examples/*.rs next to this file; every path is resolved
from __file__."""
import os
import re
import shutil
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
m = re.match(r'rustc (\d+)\.(\d+)\.(\d+)', ver)
assert m and (int(m[1]), int(m[2])) >= (1, 85), f'rustc >= 1.85 (edition 2024) needed, got {ver!r}'
print(f'using {ver}')

TMP = tempfile.TemporaryDirectory()
WD = TMP.name


def compile_bin(name, ok=True, extra=()):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', *extra, os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    if ok:
        assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
        return out, r.stderr
    assert r.returncode != 0, f'{name}.rs should NOT compile'
    return None, r.stderr


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


def run_allow_panic(binary, timeout=30):
    return subprocess.run([binary], capture_output=True, text=True, timeout=timeout)


# ---- 1. UnsafeCell<T>: the one legal way to mutate through &T. ----
binary, _ = compile_bin('unsafecell_basics')
out = run(binary)
assert out.strip() == '3', out
print('unsafecell_basics.rs: three calls through &self each write through the raw pointer UnsafeCell::get hands back')

# ---- 1b. Without UnsafeCell, mutating through &self is rejected as an ordinary borrow error. ----
_, err = compile_bin('counter_without_unsafecell_fail', ok=False)
assert 'error[E0594]' in err, err
assert 'cannot assign to' in err and 'self.value' in err, err
print('counter_without_unsafecell_fail.rs rejected with E0594: no cell type means no legal way to mutate through &self at all')

# ---- 2. Cell<T>: copies a whole value in and out, no borrow tracking needed. ----
binary, _ = compile_bin('cell_basics')
out = run(binary)
assert out.strip() == '2 100', out
print('cell_basics.rs: set/get copy a whole u32 in and out; replace hands back the old value while installing the new one')

# ---- 3. RefCell<T>: tracked Ref/RefMut guards, checked at run time. ----
binary, _ = compile_bin('refcell_children')
out = run(binary)
assert out.strip() == '2', out
print('refcell_children.rs: two borrow_mut pushes followed by one borrow read back the count, each guard dropped before the next is taken')

# ---- 4. RefCell panics, rather than refusing to compile, on a conflicting double borrow. ----
binary, _ = compile_bin('refcell_double_borrow_fail')
r = run_allow_panic(binary)
assert r.returncode == 101, (r.returncode, r.stdout, r.stderr)
assert 'already borrowed' in r.stderr, r.stderr
print('refcell_double_borrow_fail.rs: a live shared borrow still held when borrow_mut is attempted panics at run time, exit code 101, naming the conflict')

# ---- 5. OnceLock writes once then reads freely; LazyLock computes once, on first touch. ----
binary, _ = compile_bin('oncelock_lazy_init')
out = run(binary)
assert out.strip() == 'root root 4', out
print('oncelock_lazy_init.rs: both reads of the OnceLock see the same value written on the first call, and the LazyLock computes its value exactly once')

print('all interior-mutability-cell-refcell examples pass')
