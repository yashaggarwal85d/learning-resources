"""Every example shown in the "Borrows across thread and task boundaries" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.63 (thread::scope stabilized there;
the pinned CI toolchain is 1.97.0). Rust sources live in examples/*.rs next to this file; every
path is resolved from __file__."""
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
assert m and (int(m[1]), int(m[2])) >= (1, 63), f'rustc >= 1.63 (thread::scope) needed, got {ver!r}'
print(f'using {ver}')

TMP = tempfile.TemporaryDirectory()
WD = TMP.name


def compile_bin(name, ok=True):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    if ok:
        assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
        return out, r.stderr
    assert r.returncode != 0, f'{name}.rs should NOT compile'
    return None, r.stderr


def run(binary):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=30)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


# ---- 1. thread::spawn rejects a closure that borrows a local. ----
_, err = compile_bin('spawn_borrow_fail', ok=False)
assert 'error[E0373]' in err, err
assert 'may outlive borrowed value `count`' in err, err
print('spawn_borrow_fail.rs rejected with E0373: the closure may outlive count, which the current function owns')

# ---- 2. The identical borrow compiles under thread::scope. ----
binary, _ = compile_bin('scope_borrow_ok')
out = run(binary)
assert out.strip() == '42\nscope returned, count is still 42', out
print('scope_borrow_ok.rs: the scoped thread borrows count directly, and count is still usable once scope() returns')

# ---- 3. A cloned, owned Arc<Mutex<i32>> moved into plain thread::spawn satisfies 'static for free. ----
binary, _ = compile_bin('arc_move_ok')
out = run(binary)
assert out.strip() == '1', out
print('arc_move_ok.rs: an owned Arc, not a borrow, crosses into the spawned thread and outlives the spawning function')

# ---- 4. mem::forget is safe and skips a value's destructor outright, defeating a Drop-based join guard. ----
binary, _ = compile_bin('forget_defeats_guard')
out = run(binary)
lines = out.strip().split('\n')
assert len(lines) == 2, out
assert 'joined' not in lines[0] and 'about to forget' in lines[0], out
assert 'never ran' in lines[1], out
print("forget_defeats_guard.rs: mem::forget, called from ordinary safe code, skips the guard's Drop entirely")

print('all borrows-across-thread-task examples pass')
