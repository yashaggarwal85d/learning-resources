"""Every example shown in the "Tower Service and poll_ready backpressure" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85
(edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH. These examples
build and drive real tower::Service implementations and real Tower middleware
layers; no mocks. Rust sources live in examples/runtime-demo/ next to this file;
every path is resolved from __file__."""
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


# ---- 1. poll_ready and call are genuinely two separate steps: a caller that polls ----
# ---- readiness through real Pending results must wait before it is allowed to call. ----
poll_bin = cargo_build('service_is_poll_ready_then_call')
out = parse(run(poll_bin))
polls = int(out['poll_ready_polls_before_ready'])
assert polls > 1, f'the service should have reported Pending at least once before Ready, got {polls} poll(s)'
assert out['poll_ready_waited_for_real_pending'] == 'true'
assert out['poll_ready_elapsed_ms_is_small'] == 'true'
print(f'service_is_poll_ready_then_call: poll_ready reported Pending {polls - 1} time(s) before Ready, then call() ran')

# ---- 2. ConcurrencyLimit, LoadShed, RateLimit, Timeout, and Buffer each really bound ----
# ---- a different axis of a call stack under load -- not merely documented, measured. ----
layers_bin = cargo_build('layers_compose_and_bound_a_stack')
out = parse(run(layers_bin))

max_in_flight = int(out['concurrency_limit_max_in_flight'])
assert max_in_flight == 3, f'ConcurrencyLimit(3) should cap in-flight calls at exactly 3 even with 10 attempted at once, got {max_in_flight}'
print(f'layers_compose_and_bound_a_stack: ConcurrencyLimit(3) capped in-flight calls at {max_in_flight} out of 10 attempted')

assert out['load_shed_rejected'] == 'true', 'LoadShed should reject a call once the inner service is not ready'
assert out['load_shed_elapsed_ms_is_small'] == 'true', 'LoadShed should reject immediately, not make the caller wait'
print('layers_compose_and_bound_a_stack: LoadShed rejected a call against a permanently-not-ready inner service, immediately')

assert out['rate_limit_elapsed_ms_at_least_180'] == 'true', 'RateLimit(2 per 200ms) should force 4 calls to take at least ~200ms'
print('layers_compose_and_bound_a_stack: RateLimit(2 per 200ms) genuinely spaced 4 calls out over real wall-clock time')

assert out['timeout_fired'] == 'true', 'Timeout should cancel a call that outlives its deadline'
assert out['timeout_elapsed_ms_is_small'] == 'true', 'Timeout should fire close to its own configured deadline, not the slow call'
print('layers_compose_and_bound_a_stack: Timeout(50ms) cancelled a call that would have taken 500ms, close to its own deadline')

assert out['buffer_accepted_all_despite_concurrency_limit_one'] == 'true'
buffer_inner_max = int(out['buffer_inner_max_in_flight'])
assert buffer_inner_max == 1, f'the Buffer-wrapped service should still only run 1 call at a time through its inner ConcurrencyLimit(1), got {buffer_inner_max}'
print(f'layers_compose_and_bound_a_stack: Buffer accepted all 6 calls up front via its own hidden queue, while the inner ConcurrencyLimit(1) still ran only {buffer_inner_max} at a time')

print('all tower-service-poll-ready examples pass')
