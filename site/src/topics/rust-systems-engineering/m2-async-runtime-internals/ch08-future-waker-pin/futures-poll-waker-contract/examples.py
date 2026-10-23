"""Every example shown in the "Futures, Poll, and the Waker contract" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0). No external crate: std::future, std::task, and std::task::Wake are all in
std. Rust sources live in examples/*.rs next to this file; every path is resolved from __file__."""
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


# ---- 1. A hand-rolled Future and a minimal executor, no hidden thread doing the work. ----
binary = compile_bin('delay_executor')
r = subprocess.run([binary], capture_output=True, text=True, timeout=30)
assert r.returncode == 0, f'delay_executor should run to completion: {r.stderr}'
out = r.stdout.strip()
assert out == '1', f'the delay future should complete and set the result to one, got {out!r}'
print('delay_executor.rs: a future that returns Pending once, a conduit thread, and a Waker built from Arc<Task> — the executor only polls again once woken, and the result lands: ' + out)

# ---- 2. Breaking the Waker contract makes the future hang, for real, not just in theory. ----
binary = compile_bin('broken_contract_hangs')
try:
    r = subprocess.run([binary], capture_output=True, text=True, timeout=3)
    raise AssertionError(f'broken_contract_hangs should never return within the timeout, but exited {r.returncode}: {r.stdout!r}')
except subprocess.TimeoutExpired:
    print('broken_contract_hangs.rs: a future that returns Pending without ever arranging a wakeup hangs the executor for real — timed out on purpose, proving the contract is load-bearing')

print('all futures-poll-waker-contract examples pass')
