"""Every example shown in the "Service topology and state boundaries"
reel, built and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH; cargo fetches axum, tokio and reqwest from
crates.io on first build. One real crate lives in
examples/service_demo/ next to this file: one binary standing up two
real, layered Axum services over real TcpListeners, each with a real
bounded tokio::sync::mpsc queue, a real worker pool, and a real
storage layer, driven by real HTTP requests from a real client.
Every path is resolved from __file__.
"""
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, 'examples', 'service_demo')

CARGO = shutil.which('cargo')
assert CARGO, 'cargo is required'

r = subprocess.run([CARGO, 'run', '-q', '--bin', 'topology_demo'], cwd=CRATE, capture_output=True, text=True, timeout=60)
assert r.returncode == 0, f'topology_demo should run:\n{r.stdout}\n{r.stderr}'
out = r.stdout


def kv(name):
    for line in out.splitlines():
        if line.startswith(f'{name}='):
            return line.split('=', 1)[1]
    raise AssertionError(f'{name} not found in output:\n{out}')


# ---- 1. A real, bounded queue at capacity rejects a real request ----
# ---- at the boundary, and that one real request alone is rejected. ----
assert kv('boundary_r1_ok') == 'true', 'the first real request should genuinely be queued'
assert kv('boundary_r2_ok') == 'true', 'the second real request should genuinely be queued'
assert kv('boundary_r3_rejected') == 'true', 'the third real request should genuinely be rejected once the queue is full'
print('service-topology-state-boundaries: the first two real requests were queued, and the third was genuinely rejected at the full queue')

# ---- 2. The real, rejected request never reaches the storage layer ----
# ---- behind that boundary, which only the two admitted requests do. ----
storage = kv('boundary_storage_contents')
assert storage == '1,2', f'storage should genuinely hold only the two admitted requests, got {storage!r}'
assert kv('boundary_rejected_never_in_storage') == 'true', 'the rejected request should genuinely never appear in storage'
print(f'service-topology-state-boundaries: storage genuinely holds only {storage!r}, and the rejected request never reached it')

# ---- 3. A real shutdown signal stops the edge from accepting new ----
# ---- real work immediately, while letting work already queued ----
# ---- before shutdown finish and genuinely reach storage. ----
assert kv('shutdown_q1_queued') == 'true', 'the first real request should genuinely be queued before shutdown'
assert kv('shutdown_q2_queued') == 'true', 'the second real request should genuinely be queued before shutdown'
assert kv('shutdown_rejects_new_work') == 'true', 'a real request submitted once shutdown has begun should genuinely be rejected'
assert kv('shutdown_drained_queued_work') == 'true', 'both real requests queued before shutdown should genuinely reach storage once shutdown completes'
storage2 = kv('shutdown_storage_contents')
print(f'service-topology-state-boundaries: shutdown genuinely rejected new work while draining the already-queued work through to storage ({storage2!r})')

print('all service-topology-state-boundaries examples pass')
