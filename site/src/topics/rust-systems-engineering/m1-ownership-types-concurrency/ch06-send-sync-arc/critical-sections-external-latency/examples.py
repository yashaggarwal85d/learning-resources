"""Every example shown in the "Critical sections and external latency" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0). Rust sources live in examples/*.rs next to this file; every path is
resolved from __file__."""
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


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


# ---- 1. I/O inside the critical section serializes the external latency. ----
binary = compile_bin('io_inside_critical_section')
inside_ms = int(run(binary).strip())
# four threads, 40ms "network call" each, serialized by the lock: close to 4 * 40ms, never close to one call's worth.
assert inside_ms >= 140, f'expected roughly 160ms (4 serialized 40ms calls), got {inside_ms}ms'
print(f'io_inside_critical_section.rs: four 40ms calls inside the lock took {inside_ms}ms (serialized)')

# ---- 2. Moving the I/O outside the critical section lets it run concurrently. ----
binary = compile_bin('io_outside_critical_section')
outside_ms = int(run(binary).strip())
assert outside_ms < 100, f'expected roughly one 40ms call (concurrent), got {outside_ms}ms'
print(f'io_outside_critical_section.rs: the same four 40ms calls outside the lock took {outside_ms}ms (concurrent)')
assert inside_ms > outside_ms * 1.5, f'moving the call outside the lock should be clearly faster: {inside_ms}ms vs {outside_ms}ms'
print(f'the lock alone accounts for the {inside_ms - outside_ms}ms difference: the external call, not the memory write, is what got serialized')

# ---- 3. Two locks acquired in opposite order by two threads: a real deadlock, proven by timing out. ----
binary = compile_bin('lock_ordering_deadlock')
try:
    run(binary, timeout=3)
    raise AssertionError('lock_ordering_deadlock.rs should hang forever (opposite lock order), but it finished')
except subprocess.TimeoutExpired:
    print('lock_ordering_deadlock.rs: never finished inside a 3-second timeout, i.e. it deadlocked, as the opposite acquisition order predicts')

# ---- 4. The identical program, both threads using the same lock order: no deadlock. ----
binary = compile_bin('lock_ordering_fixed')
out = run(binary, timeout=5)
assert out.strip() == 'done', out
print('lock_ordering_fixed.rs: the same two locks, same two threads, same sleep — acquiring them in one consistent order finishes cleanly')

print('all critical-sections-external-latency examples pass')
