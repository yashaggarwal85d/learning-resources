"""Every example shown in the "Connection-level backpressure" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the
pinned CI toolchain is 1.97.0) and cargo on PATH. These examples open real loopback
TCP connections and measure real blocking, a real enforced buffer cap, and a real
timeout firing against a stalled peer; no mocks. Rust sources live in
examples/runtime-demo/ next to this file; every path is resolved from __file__."""
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


def cargo_build(name, timeout=60):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} should run:\n{r.stdout}\n{r.stderr}'
    return r.stdout.strip()


# ---- 1. Not reading a real socket genuinely closes its TCP window and blocks the ----
# ---- remote sender's own write() calls — a real, kernel-enforced backpressure signal. ----
window_bin = cargo_build('not_reading_closes_the_window')
out = run(window_bin)
total_written, saw_slow_write = out.split()
assert int(total_written) > 0, 'the client should have written some real bytes before blocking'
assert saw_slow_write == 'true', f'a write() call should genuinely block once the receive window closes, got {out}'
print(f'not_reading_closes_the_window: wrote {total_written} bytes, then a real write() call genuinely blocked')

# ---- 2. A bounded, per-connection output buffer enforces its own cap: filling it to ----
# ---- exactly the cap succeeds, and the very next push past it is genuinely rejected. ----
buffer_bin = cargo_build('bounded_output_buffer_enforces_its_cap')
out = run(buffer_bin)
accepted, at_cap_len, one_more_accepted, final_len = out.split()
assert accepted == at_cap_len == '16', f'filling the buffer to exactly its cap should accept every push, got {out}'
assert one_more_accepted == 'false', f'a push past the cap should be genuinely rejected, got {out}'
assert final_len == at_cap_len, f'the queue length should not grow past the cap, got {out}'
print(f'bounded_output_buffer_enforces_its_cap: filled to {at_cap_len}/16, the next push was rejected, length stayed at {final_len}')

# ---- 3. A real per-connection read timeout genuinely fires against a stalled, ----
# ---- slow-loris-style peer, closing the connection rather than waiting forever. ----
timeout_bin = cargo_build('a_stalled_peer_hits_its_real_timeout')
out = run(timeout_bin)
timed_out, elapsed_ms = out.split()
assert timed_out == 'true', f'the read should genuinely time out against a stalled peer, got {out}'
elapsed_ms = float(elapsed_ms)
assert 250 <= elapsed_ms <= 2000, f'the timeout should fire close to its configured 300ms, got {elapsed_ms}ms'
print(f'a_stalled_peer_hits_its_real_timeout: timed_out={timed_out} after {elapsed_ms:.1f}ms')

print('all connection-level-backpressure examples pass')
