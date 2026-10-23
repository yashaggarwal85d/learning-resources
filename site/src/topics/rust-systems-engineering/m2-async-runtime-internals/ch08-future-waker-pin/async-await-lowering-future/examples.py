"""Every example shown in the "async/await lowering and future size" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0). No external crate: std::future::ready is std-only. Rust sources live in
examples/*.rs next to this file; every path is resolved from __file__."""
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


def compile_bin(name):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', '-O', os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
    return out


# ---- 1. A future's size is fixed by what the generated enum holds across its await point. ----
binary = compile_bin('future_size')
out = subprocess.run([binary], capture_output=True, text=True, timeout=10)
assert out.returncode == 0, f'future_size should run: {out.stderr}'
small_size, large_size = (int(x) for x in out.stdout.strip().split())
assert small_size < 16, f'a future with nothing held across its one await point should be tiny, got {small_size}'
assert large_size >= 4096, f'a future holding a four-thousand-and-ninety-six-byte local across its await point should be at least that large, got {large_size}'
print(f'future_size.rs: a future with nothing held across its await point measured {small_size} bytes; holding a large local across the identical await point measured {large_size} bytes')

# ---- 2. Holding a !Send value across an await point makes the whole future !Send. ----
cmd = [RUSTC, '--edition', '2024', '--color', 'never', 'examples/not_send_across_await.rs', '-o', os.path.join(WD, 'not_send_across_await')]
r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
assert r.returncode != 0, 'not_send_across_await.rs should fail to compile: a future holding an Rc across .await must not be Send'
assert 'cannot be sent between threads safely' in r.stderr, f'expected the exact "cannot be sent between threads safely" diagnostic, got:\n{r.stderr}'
assert 'is not `Send` as this value is used across an await' in r.stderr, f'expected the diagnostic to name the value live across the await point, got:\n{r.stderr}'
print('not_send_across_await.rs: holding an Rc across .await makes the whole generated future type not Send, exactly as rustc reports it')

print('all async-await-lowering-future examples pass')
