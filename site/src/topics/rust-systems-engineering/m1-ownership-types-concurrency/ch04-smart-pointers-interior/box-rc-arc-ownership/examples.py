"""Every example shown in the "Box, Rc, and Arc ownership shapes" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain
is 1.97.0). Rust sources live in examples/*.rs next to this file; every path is resolved from
__file__."""
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


# ---- 1. Box<T>: single ownership, moved whole, just on the heap. ----
binary, _ = compile_bin('box_ownership')
out = run(binary)
assert out.strip() == 'root leaf', out
print('box_ownership.rs: moving the parent Node moves its boxed child with it, single ownership throughout')

# ---- 2. Rc<T>: many owners, one thread, a plain non-atomic refcount. ----
binary, _ = compile_bin('rc_shared')
out = run(binary)
assert out.strip() == 'shared 2 3 2', out
print('rc_shared.rs: cloning an Rc bumps a plain count and shares the same allocation; dropping a clone brings the count back down')

# ---- 3. Rc<T> is !Send: moving one into another thread must fail to compile. ----
_, err = compile_bin('rc_not_send_fail', ok=False)
assert 'error[E0277]' in err, err
assert 'cannot be sent between threads safely' in err, err
print('rc_not_send_fail.rs rejected with E0277: Rc<i32> cannot be sent between threads, because its refcount is not atomic')

# ---- 4. Arc<T>: the same shared ownership, safe to clone and drop across real threads. ----
binary, _ = compile_bin('arc_shared')
out = run(binary)
assert out.strip() == '24 1', out
print("arc_shared.rs: four real threads each clone the same Arc<Node>, read its text, and exit; only the original owner's count remains once they finish")

# ---- 5. "Arc::clone is cheap" stops being true under contention: measure it, don't assert it. ----
binary, _ = compile_bin('arc_contention', extra=('-O',))
out = run(binary, timeout=60)
uncontended_ns, contended_ns, ideal_ns = (int(x) for x in out.split())
assert uncontended_ns > 0 and contended_ns > 0 and ideal_ns > 0, out
# If the atomic refcount were free to touch from several threads at once, splitting the identical
# total work across four threads should finish at or below the uncontended time, not above it.
assert contended_ns > uncontended_ns, (
    f'expected real contention to erase the speedup from splitting the work across threads '
    f'(contended {contended_ns}ns should exceed the single-thread baseline {uncontended_ns}ns), got the opposite'
)
ratio = contended_ns / ideal_ns
print(f'arc_contention.rs: the identical total clone/drop work took {contended_ns}ns split across four threads on the same Arc, versus {uncontended_ns}ns run by one thread alone (naive, contention-free scaling predicted {ideal_ns}ns) — contention cost the work about {ratio:.1f}x the time a free refcount would have taken')

print('all box-rc-arc-ownership examples pass')
