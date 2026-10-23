"""Every example shown in the "Arc shares, Mutex synchronizes" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo, for the three cargo-driven examples (parking_lot and tokio,
fetched from crates.io on first build). The bare-rustc examples live in examples/*.rs; the
cargo-driven ones live in examples/src/bin/, built and run as `cargo run`/`cargo build --bin <name>`."""
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


def compile_fail(name):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', os.path.join('examples', name + '.rs'), '-o', out]
    return subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)


def run(binary, timeout=60):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


def cargo_run(name, timeout=120):
    r = subprocess.run(['cargo', 'run', '-q', '--bin', name], cwd=os.path.join(HERE, 'examples'), capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build and run:\n{r.stderr}'
    return r.stdout


def cargo_build_fail(name, timeout=120):
    r = subprocess.run(['cargo', 'build', '-q', '--bin', name], cwd=os.path.join(HERE, 'examples'), capture_output=True, text=True, timeout=timeout)
    return r


# ---- 1. A bare Arc<u64> shares the value, but nothing can mutate through it. ----
r = compile_fail('bare_arc_no_mutation')
assert r.returncode != 0, 'mutating through a bare Arc<u64> should fail to compile'
assert "cannot assign to data in an `Arc`" in r.stderr, r.stderr
assert 'DerefMut' in r.stderr, r.stderr
print('bare_arc_no_mutation.rs: Arc<u64> refuses a direct assignment — sharing alone adds no way to mutate')

# ---- 2. Arc<Mutex<u64>> really compiles and really synchronizes four workers. ----
binary = compile_bin('arc_mutex_shares_and_synchronizes')
out = run(binary)
total = int(out.strip())
WORKERS, PER_WORKER = 4, 25_000
assert total == WORKERS * PER_WORKER, f'expected an exact {WORKERS * PER_WORKER}, got {total}'
print(f'arc_mutex_shares_and_synchronizes.rs: {WORKERS} threads x {PER_WORKER} increments through Arc<Mutex<u64>> land on exactly {total}')

# ---- 3. std::sync::Mutex really poisons when a thread panics while holding the lock. ----
binary = compile_bin('std_mutex_poisons')
out = run(binary)
poisoned, recovered = out.split()
assert poisoned == 'true', out
assert int(recovered) == 7, out
print('std_mutex_poisons.rs: a panic while the lock is held really poisons it — into_inner still recovers the value')

# ---- 4. parking_lot::Mutex makes the opposite choice: the same panic never poisons it. ----
out = cargo_run('parking_lot_no_poison')
assert int(out.strip()) == 7, out
print('parking_lot_no_poison.rs: the identical panic-while-holding-the-lock leaves a parking_lot::Mutex completely usable, with no poisoning API at all')

# ---- 5. Holding a std MutexGuard across an .await inside a spawned task fails to compile. ----
r = cargo_build_fail('std_guard_across_await_fails')
assert r.returncode != 0, 'holding a std MutexGuard across .await inside tokio::spawn should fail to compile'
assert 'future cannot be sent between threads safely' in r.stderr, r.stderr
assert 'MutexGuard' in r.stderr, r.stderr
print('std_guard_across_await_fails.rs: a std MutexGuard held across .await makes the whole spawned future !Send')

# ---- 6. The identical shape, with tokio::sync::Mutex instead, compiles and runs for real. ----
out = cargo_run('tokio_mutex_across_await_works')
assert out.strip() == '1', out
print("tokio_mutex_across_await_works.rs: tokio::sync::Mutex's guard is designed to survive the exact same .await, and it does")

print('\nAll Arc/Mutex examples passed.')
