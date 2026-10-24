"""Every example shown in the "Failure budget and overload behaviour"
reel, built and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH; cargo fetches axum, tokio and reqwest from
crates.io on first build. One real crate lives in
examples/overload_demo/ next to this file: one binary driving the
identical real, layered service from the previous topic with a real
burst of concurrent HTTP requests past its own real queue capacity,
twice, from two fresh instances. Every path is resolved from
__file__.
"""
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, 'examples', 'overload_demo')

CARGO = shutil.which('cargo')
assert CARGO, 'cargo is required'

r = subprocess.run([CARGO, 'run', '-q'], cwd=CRATE, capture_output=True, text=True, timeout=60)
assert r.returncode == 0, f'overload_demo should run:\n{r.stdout}\n{r.stderr}'
out = r.stdout


def kv(name):
    for line in out.splitlines():
        if line.startswith(f'{name}='):
            return line.split('=', 1)[1]
    raise AssertionError(f'{name} not found in output:\n{out}')


total_sent = int(kv('total_sent'))
admitted_count = int(kv('admitted_count'))
rejected_count = int(kv('rejected_count'))

# ---- 1. Every real request sent is accounted for exactly once, ----
# ---- either admitted or shed, with no real request unaccounted for. ----
assert total_sent == 6, f'the real burst should genuinely send six requests, got {total_sent}'
assert admitted_count + rejected_count == total_sent, \
    f'every real request should be genuinely admitted or shed, got {admitted_count} + {rejected_count} != {total_sent}'
print(f'failure-budget-overload-behaviour: of {total_sent} real requests, {admitted_count} were genuinely admitted and {rejected_count} genuinely shed, accounting for every one')

# ---- 2. The real, exact number shed, once the queue genuinely ----
# ---- saturates under this real burst, is neither zero nor every ----
# ---- request; the real queue admits some and sheds the rest. ----
assert admitted_count == 3, f'the real queue should genuinely admit exactly three requests before saturating, got {admitted_count}'
assert rejected_count == 3, f'the real queue should genuinely shed exactly three requests once saturated, got {rejected_count}'
print(f'failure-budget-overload-behaviour: this real burst genuinely saturates the queue after exactly {admitted_count} admissions, shedding exactly {rejected_count}')

# ---- 3. Every real shed request's own position in the submission ----
# ---- order genuinely falls after every admitted request's own ----
# ---- position: the real shedding is a real suffix, never arbitrary. ----
assert kv('rejects_are_a_real_suffix') == 'true', \
    'every rejected request should genuinely come after every admitted request in submission order'
print('failure-budget-overload-behaviour: the real shed requests are genuinely a suffix of the submission order, never an arbitrary subset')

# ---- 4. The identical real burst, run again from a fresh instance, ----
# ---- genuinely reproduces the identical split: this is real, ----
# ---- deterministic saturation, not a flaky, one-off accident. ----
assert kv('repeat_matches_first') == 'true', \
    'the identical real burst, run again, should genuinely reproduce the identical admitted/rejected split'
print('failure-budget-overload-behaviour: the identical real burst, run again, genuinely reproduces the identical split, confirming this is real saturation behaviour, not a flaky accident')

print('all failure-budget-overload-behaviour examples pass')
