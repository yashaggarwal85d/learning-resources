"""Every example shown in the "Spans and events in async code" reel,
built and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH; cargo fetches tokio, tracing, and tracing-subscriber from
crates.io on first build. One real crate lives in examples/span_demo/
next to this file, with three real binaries sharing one real custom
tracing_subscriber::Layer (span_demo::Capture, in src/lib.rs) that
records, for every event, the name of whichever span tracing considers
"current" the instant that event fires. Every binary runs two real
async tasks together on a real, single-threaded tokio runtime (so both
genuinely interleave on the identical OS thread), and prints the one
real event task_b emits together with whatever span name was captured
alongside it. Every path is resolved from __file__.
"""
import os
import re
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, 'examples', 'span_demo')

CARGO = shutil.which('cargo')
assert CARGO, 'cargo is required'


def run_bin(name):
    r = subprocess.run([CARGO, 'run', '-q', '--bin', name], cwd=CRATE, capture_output=True, text=True, timeout=120)
    assert r.returncode == 0, f'cargo run --bin {name} should succeed:\n{r.stdout}\n{r.stderr}'
    m = re.search(r'event=(".*?") current_span=(None|Some\("(.*?)"\))', r.stdout)
    assert m, f'{name} should print one captured event line, got:\n{r.stdout}'
    current_span = m.group(3) if m.group(3) else None
    return current_span


# ---- 1. Holding a real Span::enter() guard across a real .await lets ----
# ---- a genuinely different, concurrently-running task's own event ----
# ---- get recorded as if it happened inside that span. ----
bad_span = run_bin('bad_enter')
assert bad_span == 'task_a', \
    f'holding the guard across await should genuinely misattribute task_b\'s event to task_a, got {bad_span!r}'
print(f'spans-events-async-code: holding Span::enter() across .await genuinely misattributed task_b\'s own event to task_a\'s span')

# ---- 2. The identical operation, instrumented with .instrument(span) ----
# ---- instead, genuinely keeps task_b's event out of task_a's span. ----
instrument_span = run_bin('fixed_instrument')
assert instrument_span is None, \
    f'.instrument(span) should genuinely keep task_b\'s event out of task_a\'s span, got {instrument_span!r}'
print('spans-events-async-code: .instrument(span) genuinely kept task_b\'s own event out of task_a\'s span')

# ---- 3. The identical operation, instrumented with #[instrument] ----
# ---- instead, genuinely behaves the identical, correct way. ----
macro_span = run_bin('fixed_macro')
assert macro_span is None, \
    f'#[instrument] should genuinely keep task_b\'s event out of task_a\'s span too, got {macro_span!r}'
print('spans-events-async-code: #[instrument] genuinely kept task_b\'s own event out of task_a\'s span too')

print('all spans-events-async-code examples pass')
