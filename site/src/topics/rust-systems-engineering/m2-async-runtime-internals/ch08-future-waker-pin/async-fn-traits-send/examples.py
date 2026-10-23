"""Every example shown in the "Async fn in traits and Send bounds" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH for the trait-variant and async-trait examples. Rust
sources live in examples/*.rs and examples/trait-variant-fix/, examples/async-trait-fix/ next
to this file; every path is resolved from __file__."""
import os
import re
import shutil
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required for the trait-variant and async-trait examples'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
m = re.match(r'rustc (\d+)\.(\d+)\.(\d+)', ver)
assert m and (int(m[1]), int(m[2])) >= (1, 85), f'rustc >= 1.85 (edition 2024) needed, got {ver!r}'
print(f'using {ver}')

TMP = tempfile.TemporaryDirectory()
WD = TMP.name


def cargo_run(name, cwd):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=cwd,
                           capture_output=True, text=True, timeout=180)


# ---- 1. async fn in a trait is not dyn compatible: Box<dyn Trait> fails to compile. ----
cmd = [RUSTC, '--edition', '2024', '--color', 'never', 'examples/async_fn_in_trait_not_dyn_safe.rs', '-o', os.path.join(WD, 'dyn_fail')]
r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
assert r.returncode != 0, 'async_fn_in_trait_not_dyn_safe.rs should fail to compile: a trait with an async fn cannot be made into a dyn Trait'
assert 'error[E0038]' in r.stderr, f'expected error[E0038] (not dyn compatible), got:\n{r.stderr}'
assert 'is not dyn compatible' in r.stderr
print('async_fn_in_trait_not_dyn_safe.rs: fails with error[E0038] — a trait with an async fn cannot build a vtable, so it is not dyn compatible')

# ---- 2. The Send bound problem: a caller cannot require a trait's returned future be Send. ----
cmd = [RUSTC, '--edition', '2024', '--color', 'never', 'examples/returned_future_not_send.rs', '-o', os.path.join(WD, 'send_fail')]
r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
assert r.returncode != 0, 'returned_future_not_send.rs should fail to compile: the trait gives callers no way to require its returned future be Send'
assert 'error[E0277]' in r.stderr, f'expected error[E0277] (trait bound not satisfied), got:\n{r.stderr}'
assert 'cannot be sent between threads safely' in r.stderr
print('returned_future_not_send.rs: fails with error[E0277] — even with G: Send on the implementor, the trait itself has no way to require G::greet()\'s future be Send')

# ---- 3. trait_variant::make generates a Send-bounded sibling trait that fixes this. ----
r = cargo_run('trait_variant_fixes_it', os.path.join(HERE, 'examples', 'trait-variant-fix'))
assert r.returncode == 0, f'trait-variant-fix crate should build and run:\n{r.stdout}\n{r.stderr}'
out = r.stdout.strip()
assert out == 'hello', f'expected the greeting returned after a real cross-thread spawn, got {out!r}'
print(f'trait-variant-fix: {out} — spawned on a real thread, proving the generated trait\'s future is really Send')

# ---- 4. async_trait makes a trait dyn-safe, at the cost of one real heap allocation per call. ----
r = cargo_run('async_trait_boxes_it', os.path.join(HERE, 'examples', 'async-trait-fix'))
assert r.returncode == 0, f'async-trait-fix crate should build and run:\n{r.stdout}\n{r.stderr}'
lines = r.stdout.strip().splitlines()
assert lines[0] == 'modal shown', f'expected the dyn-dispatched call\'s result, got {lines!r}'
assert lines[1] == 'allocations during future construction: 1', f'expected exactly one heap allocation per call (the documented Box::pin), got {lines!r}'
print(f'async-trait-fix: {lines[0]}; {lines[1]} — dyn dispatch now compiles, at a real, measured allocation cost')

print('all async-fn-traits-send examples pass')
