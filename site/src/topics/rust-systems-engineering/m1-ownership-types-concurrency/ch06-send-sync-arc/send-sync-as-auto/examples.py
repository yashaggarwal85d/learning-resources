"""Every example shown in the "Send and Sync as auto-traits" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo, for the two tokio-driven examples (tokio fetched from crates.io
on first build). The bare-rustc examples live in examples/*.rs; the cargo-driven ones live in
examples/src/bin/, built and run as `cargo run`/`cargo build --bin <name>`."""
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
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    return r


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


# ---- 1. Arc<Cell<u64>>, cloned into a spawned thread, fails before main even runs. ----
r = compile_fail('cell_not_sync')
assert r.returncode != 0, 'Arc<Cell<u64>> should fail to compile when sent to another thread'
assert "`Cell<u64>` cannot be shared between threads safely" in r.stderr, r.stderr
assert "the trait `Sync` is not implemented for `Cell<u64>`" in r.stderr, r.stderr
print('cell_not_sync.rs: Arc<Cell<u64>> refuses to compile across thread::spawn — Cell is Send, never Sync')

# ---- 2. Arc<RefCell<u64>> fails for the identical reason. ----
r = compile_fail('refcell_not_sync')
assert r.returncode != 0, 'Arc<RefCell<u64>> should fail to compile when sent to another thread'
assert "`RefCell<u64>` cannot be shared between threads safely" in r.stderr, r.stderr
assert "the trait `Sync` is not implemented for `RefCell<u64>`" in r.stderr, r.stderr
print('refcell_not_sync.rs: the identical failure, for the identical reason, with RefCell')

# ---- 3. Arc<Mutex<u64>> really compiles and really synchronizes four worker threads. ----
binary = compile_bin('mutex_synchronizes')
out = run(binary)
total = int(out.strip())
WORKERS, PER_WORKER = 4, 50_000
assert total == WORKERS * PER_WORKER, f'expected an exact {WORKERS * PER_WORKER}, got {total}'
print(f'mutex_synchronizes.rs: {WORKERS} threads x {PER_WORKER} increments through one Arc<Mutex<u64>> land on exactly {total}')

# ---- 4. MutexGuard itself refuses to cross thread::spawn, even though Mutex<u64> does. ----
r = compile_fail('mutexguard_not_send')
assert r.returncode != 0, 'moving a MutexGuard into a spawned closure should fail to compile'
assert "cannot be sent between threads safely" in r.stderr, r.stderr
assert "MutexGuard" in r.stderr, r.stderr
print('mutexguard_not_send.rs: MutexGuard refuses to move into another thread — the lock stays tied to the thread that took it')

# ---- 5. A plain generic wrapper, with no marker field, is Send exactly when its payload is. ----
binary = compile_bin('phantomdata_plain_send')
out = run(binary)
assert out.strip() == '7', out
print('phantomdata_plain_send.rs: a plain PhantomData<T> field inherits whatever Send/Sync T itself has')

# ---- 6. The same wrapper, with PhantomData<*const T> instead, is unconditionally !Send. ----
r = compile_fail('phantomdata_optout_fails')
assert r.returncode != 0, 'PhantomData<*const T> should opt the wrapper out of Send unconditionally'
assert "cannot be sent between threads safely" in r.stderr, r.stderr
assert "PhantomData<*const u8>" in r.stderr, r.stderr
print('phantomdata_optout_fails.rs: swapping in PhantomData<*const T> opts the same wrapper out of Send, regardless of T')

# ---- 7. unsafe impl Send for a type built on a raw pointer really compiles and really runs. ----
binary = compile_bin('unsafe_impl_send_carton')
out = run(binary)
assert out.strip() == '99', out
print('unsafe_impl_send_carton.rs: unsafe impl Send lets a hand-built Carton<T> cross thread::spawn, carrying its value intact')

# ---- 8. A !Send Rc dropped before an .await lets a spawned future stay Send; held across it, it isn't. ----
out = cargo_run('tokio_rc_dropped_before_await')
assert out.strip() == 'ok', out
print('tokio_rc_dropped_before_await.rs: an Rc confined to a scope with no .await inside it never has to be Send')

r = cargo_build_fail('tokio_rc_across_await_fails')
assert r.returncode != 0, 'holding an Rc across .await inside tokio::spawn should fail to compile'
assert 'future cannot be sent between threads safely' in r.stderr, r.stderr
assert 'Rc<()>' in r.stderr, r.stderr
print('tokio_rc_across_await_fails.rs: the same Rc, held live across one .await, makes the whole spawned future !Send')

print('\nAll Send/Sync auto-trait examples passed.')
