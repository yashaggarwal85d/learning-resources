"""Every example shown in the "Metrics that answer overload questions"
reel, built and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH; cargo fetches tokio from crates.io on first build.
One real crate lives in examples/metric_demo/ next to this file: one
binary calling a real async operation five times with a deliberately
uneven real delay pattern, recording every call through a real
counter, a real gauge, and a real histogram of completed latencies.
Every path is resolved from __file__.
"""
import os
import re
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, 'examples', 'metric_demo')

CARGO = shutil.which('cargo')
assert CARGO, 'cargo is required'

r = subprocess.run([CARGO, 'run', '-q'], cwd=CRATE, capture_output=True, text=True, timeout=60)
assert r.returncode == 0, f'cargo run should succeed:\n{r.stdout}\n{r.stderr}'
out = r.stdout


def val(name):
    return int(re.search(rf'{name}=(-?\d+)', out).group(1))


checkpoint_counter = val('checkpoint_counter')
checkpoint_gauge = val('checkpoint_gauge')
checkpoint_histogram_len = val('checkpoint_histogram_len')
final_counter = val('final_counter')
final_gauge = val('final_gauge')
final_histogram_len = val('final_histogram_len')

# ---- 1. At the real checkpoint, three of the five real calls have ----
# ---- already finished, and two are genuinely still running. ----
assert checkpoint_counter == 3, f'three of the five calls should genuinely have finished by the checkpoint, got {checkpoint_counter}'
assert checkpoint_gauge == 2, f'two of the five calls should genuinely still be in flight at the checkpoint, got {checkpoint_gauge}'
print(f'metrics-that-answer-overload: at the real checkpoint, the counter read {checkpoint_counter} and the gauge read {checkpoint_gauge}, genuinely still in flight')

# ---- 2. The counter's own value at the checkpoint cannot, by ----
# ---- itself, tell you whether anything is genuinely still running: ----
# ---- it only ever counts what has already finished. ----
assert checkpoint_counter != checkpoint_gauge, \
    f'the counter and the gauge should genuinely disagree at the checkpoint, got {checkpoint_counter} == {checkpoint_gauge}'
print(f'metrics-that-answer-overload: the counter\'s own value, {checkpoint_counter}, says nothing about whether anything is still in flight right now')

# ---- 3. The histogram, at the checkpoint, holds only the completed ----
# ---- calls' own latencies, and is genuinely blind to the two calls ----
# ---- still running, exactly matching the counter's own blind spot. ----
assert checkpoint_histogram_len == checkpoint_counter, \
    f'the histogram should genuinely hold exactly the completed calls, got {checkpoint_histogram_len} completed vs counter {checkpoint_counter}'
print(f'metrics-that-answer-overload: the histogram holds {checkpoint_histogram_len} completed latencies at the checkpoint, genuinely blind to the two calls still running')

# ---- 4. Only the gauge, read at the checkpoint, correctly answers ----
# ---- "is anything backed up right now": it reads a real, nonzero ----
# ---- in-flight count exactly when something genuinely still is. ----
assert checkpoint_gauge > 0, f'the gauge should genuinely read nonzero while real work is still in flight, got {checkpoint_gauge}'
print(f'metrics-that-answer-overload: the gauge correctly reads {checkpoint_gauge} in flight right at the checkpoint, the only one of the three that can answer that question at all')

# ---- 5. Once every real call has genuinely finished, all three ----
# ---- metrics agree again: the counter and the histogram both reach ----
# ---- five, and the gauge genuinely returns to zero. ----
assert final_counter == 5, f'all five calls should genuinely have finished, got {final_counter}'
assert final_histogram_len == 5, f'the histogram should genuinely hold all five completed latencies, got {final_histogram_len}'
assert final_gauge == 0, f'the gauge should genuinely return to zero once nothing is left in flight, got {final_gauge}'
print(f'metrics-that-answer-overload: once every real call finished, the counter and the histogram both reached {final_counter}, and the gauge genuinely returned to {final_gauge}')

print('all metrics-that-answer-overload examples pass')
