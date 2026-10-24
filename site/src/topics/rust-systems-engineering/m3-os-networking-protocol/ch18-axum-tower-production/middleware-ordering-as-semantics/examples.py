"""Every example shown in the "Middleware ordering as semantics" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85
(edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH. These
examples build and drive real tower::Service stacks with their layers in two
different orders, measuring the different, real, observable outcome each
ordering produces; no mocks. Rust sources live in examples/runtime-demo/ next
to this file; every path is resolved from __file__."""
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_build(name, timeout=120):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} should run:\n{r.stdout}\n{r.stderr}'
    return r.stdout.strip()


def parse(out):
    kv = {}
    for line in out.splitlines():
        k, v = line.rsplit(' ', 1)
        kv[k] = v
    return kv


# ---- 1. ServiceBuilder's own order genuinely changes how many concurrent callers ----
# ---- are admitted immediately, reproducing its own documented example directly. ----
order_bin = cargo_build('service_builder_order_bounds_in_flight')
out = parse(run(order_bin))
buffer_first = int(out['buffer_first_fast_admits'])
concurrency_first = int(out['concurrency_first_fast_admits'])
assert buffer_first > 100, f'buffer(100).concurrency_limit(10) should admit over 100 callers immediately, got {buffer_first}'
assert concurrency_first == 10, f'concurrency_limit(10).buffer(100) should admit exactly 10 callers immediately, got {concurrency_first}'
print(f'service_builder_order_bounds_in_flight: buffer-first admitted {buffer_first} callers immediately, concurrency-first admitted exactly {concurrency_first}')

# ---- 2. A real deadline placed before vs after a slow auth step bounds a genuinely ----
# ---- different thing: the whole request, or only the fast handler behind it. ----
timeout_bin = cargo_build('timeout_placement_bounds_different_things')
out = parse(run(timeout_bin))
assert out['timeout_outside_slow_auth_fired'] == 'true', 'a deadline outside a slow auth step should genuinely bound it and fire'
assert out['timeout_outside_slow_auth_elapsed_ms_is_small'] == 'true'
assert out['timeout_inside_slow_auth_fired'] == 'false', 'a deadline placed only around the fast handler should never see the slow auth step'
assert out['timeout_inside_slow_auth_elapsed_ms_is_large'] == 'true', 'the slow auth step should genuinely run to completion, unbounded by the inner deadline'
print('timeout_placement_bounds_different_things: the same deadline bounded the slow auth step when placed outside it, and never saw it at all when placed only around the handler')

# ---- 3. A retry layer above a non-idempotent handler genuinely re-executes its own ----
# ---- side effect once per attempt; a real idempotency key genuinely prevents that. ----
retry_bin = cargo_build('retry_without_idempotency_reruns_the_effect')
out = parse(run(retry_bin))
assert out['non_idempotent_eventually_succeeded'] == 'true'
non_idempotent_runs = int(out['non_idempotent_side_effect_ran_times'])
assert non_idempotent_runs == 3, f'the non-idempotent handler should run its side effect once per attempt (3 attempts), got {non_idempotent_runs}'
assert out['idempotent_eventually_succeeded'] == 'true'
idempotent_runs = int(out['idempotent_side_effect_ran_times'])
assert idempotent_runs == 1, f'the idempotency-key-guarded handler should run its side effect exactly once despite the same retries, got {idempotent_runs}'
print(f'retry_without_idempotency_reruns_the_effect: the non-idempotent handler ran its side effect {non_idempotent_runs} times across retries; the idempotency-key-guarded version ran it exactly {idempotent_runs} time')

print('all middleware-ordering-as-semantics examples pass')
