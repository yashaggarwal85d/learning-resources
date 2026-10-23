"""Every example shown in the "Arc<Mutex<T>> as hidden serialization" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo, for the one example (arc_swap_config) that needs the arc-swap
crate, fetched from crates.io on first build. Bare-rustc sources live in examples/*.rs; the
cargo-driven one lives in examples/src/bin/, built and run as `cargo run --bin <name>`."""
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


def compile_bin(name, extra=()):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', *extra, os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
    return out


def run(binary, timeout=60):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


def run_cargo_bin(name, timeout=120):
    r = subprocess.run(['cargo', 'run', '-q', '--bin', name], cwd=os.path.join(HERE, 'examples'), capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build and run:\n{r.stderr}'
    return r.stdout


# ---- 1. Arc<Mutex<T>> is correct by construction, but serializes every access through one lock. ----
binary = compile_bin('mutex_contention', extra=('-O',))
out = run(binary)
correct, uncontended_ns, contended_ns = out.split()
assert correct == 'true', out
uncontended_ns, contended_ns = int(uncontended_ns), int(contended_ns)
assert uncontended_ns > 0 and contended_ns > 0, out
assert contended_ns > uncontended_ns, (
    f'expected splitting the identical work across four threads on one shared Mutex to be no faster, and likely '
    f'slower, than the single thread doing it alone (contended {contended_ns}ns, uncontended {uncontended_ns}ns), got the opposite'
)
mutex_ratio = contended_ns / uncontended_ns
print(f'mutex_contention.rs: the count is correct every time, but splitting the identical total across four threads on one Mutex took about {mutex_ratio:.1f}x as long as one thread doing it all alone — the lock serialized every access')

# ---- 2. Sharding: the identical work, with no two threads ever touching the same lock. ----
binary = compile_bin('sharding', extra=('-O',))
out = run(binary)
correct, sharded_ns = out.split()
assert correct == 'true', out
sharded_ns = int(sharded_ns)
assert sharded_ns > 0, out
assert sharded_ns < uncontended_ns, (
    f'expected sharding to beat even the single-threaded single-Mutex baseline (sharded {sharded_ns}ns, '
    f'uncontended single mutex {uncontended_ns}ns), since real, uncontended parallelism should help here'
)
assert sharded_ns < contended_ns, f'expected sharding ({sharded_ns}ns) to clearly beat the contended single Mutex ({contended_ns}ns)'
print(f'sharding.rs: the identical total count, correct again, finished in {sharded_ns}ns by splitting the counter into one independent Mutex per thread — far faster than either single-Mutex run above')

# ---- 3. An owner task reached only through a channel: no lock, no shared pointer at all. ----
binary = compile_bin('owner_task_channel')
out = run(binary)
assert out.strip() == '400000', out
print('owner_task_channel.rs: every sender only ever sends a message; the single owning thread is the only one that ever touches the counter directly, and the final count is exact')

# ---- 4. arc-swap: readers see a consistent snapshot with no lock at all; a writer swaps in a ----
#    whole new value atomically.
out = run_cargo_bin('arc_swap_config')
saw_a_version, went_backward = out.split()
assert saw_a_version == 'true', out
assert went_backward == 'false', out
print('arc_swap_config.rs: every reader load() returns one complete, consistent Config snapshot, and the version it sees never goes backward as the writer swaps new ones in')

print('all arc-mutex-t-as examples pass')
