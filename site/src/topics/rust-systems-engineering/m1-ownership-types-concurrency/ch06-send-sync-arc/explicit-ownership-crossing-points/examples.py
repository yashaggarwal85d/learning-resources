"""Every example shown in the "Explicit ownership-crossing points" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH for the one tokio example. Rust sources live in
examples/*.rs and examples/src/bin/*.rs next to this file; every path is resolved from __file__."""
import os
import re
import shutil
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required for the tokio::spawn example'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
m = re.match(r'rustc (\d+)\.(\d+)\.(\d+)', ver)
assert m and (int(m[1]), int(m[2])) >= (1, 85), f'rustc >= 1.85 (edition 2024) needed, got {ver!r}'
print(f'using {ver}')

TMP = tempfile.TemporaryDirectory()
WD = TMP.name


def compile_bin(name):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', '-O', os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
    return out, r.stderr


def compile_bin_expect_fail(name):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    assert r.returncode != 0, f'{name}.rs was expected to fail to compile, but it built'
    return r.stderr


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


# ---- 1. thread::spawn moves ownership of the closure's captured data. ----
binary, _ = compile_bin('thread_spawn_owns')
out = run(binary).strip()
assert out == '27', f'"owned by the new thread now" is 27 bytes, got {out}'
print('thread_spawn_owns.rs: the moved String\'s length, computed on the new thread, is 27')

# ---- 2. Borrowing non-'static data in a plain thread::spawn is a real compile error. ----
stderr = compile_bin_expect_fail('thread_spawn_borrow_fails')
assert 'borrowed data escapes outside of function' in stderr or 'may outlive' in stderr, (
    f'expected the real borrow-checker message about escaping/outliving the function, got:\n{stderr}'
)
print('thread_spawn_borrow_fails.rs: the real compiler error — borrowed data escapes the function / may outlive it')

# ---- 3. thread::scope makes the identical borrow sound. ----
binary, _ = compile_bin('thread_scope_borrows')
out = run(binary).strip()
assert out == '60', f'10 + 20 + 30 = 60, got {out}'
print('thread_scope_borrows.rs: the same borrow, inside a scope, compiles and sums to 60')

# ---- 4. mpsc channel send() moves ownership from sender thread to receiver. ----
binary, _ = compile_bin('mpsc_send_moves')
out = run(binary).strip()
assert out == '2', f'two messages sent, two received, got {out}'
print('mpsc_send_moves.rs: two owned Strings crossed threads through the channel and were received: 2')

# ---- 5. tokio::spawn needs the identical Send + 'static contract, on a Future. ----
r = subprocess.run([CARGO, 'build', '--release', '--quiet'], cwd=os.path.join(HERE, 'examples'), capture_output=True, text=True)
assert r.returncode == 0, f'cargo build should succeed:\n{r.stderr}'
tokio_bin = os.path.join(HERE, 'examples', 'target', 'release', 'tokio_spawn_owns')
out = run(tokio_bin).strip()
assert out == '29', f'"owned by the spawned task now" is 29 bytes, got {out}'
print('tokio_spawn_owns.rs: the moved String\'s length, computed on the spawned task, is 29')

print('all explicit-ownership-crossing-points examples pass')
