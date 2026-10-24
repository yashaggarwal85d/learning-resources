"""Every example shown in the "Structured fields and OpenTelemetry
export" reel, built and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH; cargo fetches tracing and tracing-subscriber from
crates.io on first build. One real crate lives in examples/field_demo/
next to this file: one binary emitting three real events, each
carrying a real structured attempt field alongside its own rendered,
formatted message, plus a real, minimal implementation of the W3C
Trace Context traceparent header. Every path is resolved from
__file__.
"""
import os
import re
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, 'examples', 'field_demo')

CARGO = shutil.which('cargo')
assert CARGO, 'cargo is required'

r = subprocess.run([CARGO, 'run', '-q'], cwd=CRATE, capture_output=True, text=True, timeout=120)
assert r.returncode == 0, f'cargo run should succeed:\n{r.stdout}\n{r.stderr}'
out = r.stdout

# ---- 1. A real, structured field survives being summed directly, ----
# ---- exactly, across every one of the three real events. ----
structured_total = int(re.search(r'structured_total=(\d+)', out).group(1))
assert structured_total == 6, f'the structured attempt field should genuinely sum to 6, got {structured_total}'
print(f'structured-fields-opentelemetry-export: the real structured attempt field summed to {structured_total}, exactly right')

# ---- 2. The identical total, computed only from each event's own ----
# ---- rendered, formatted message, is genuinely wrong, since one real ----
# ---- message spells its own number out instead of using a digit. ----
formatted_total = int(re.search(r'formatted_total=(\d+)', out).group(1))
assert formatted_total != structured_total, \
    f'the formatted-message-only total should genuinely differ from the structured total, got {formatted_total} == {structured_total}'
assert formatted_total == 3, f'the formatted-message-only total should genuinely come out to 3, got {formatted_total}'
print(f'structured-fields-opentelemetry-export: the identical total, recovered only from each message\'s own rendered text, genuinely came out wrong at {formatted_total}')

# ---- 3. A real W3C Trace Context traceparent header round-trips its ----
# ---- own real trace id, span id, and sampled flag exactly, and a ----
# ---- real, malformed header is genuinely rejected rather than guessed at. ----
header = re.search(r'traceparent=(\S+)', out).group(1)
parsed = re.search(r'parsed=Some\(\((\d+), (\d+), (true|false)\)\)', out)
assert parsed, f'the real traceparent header should genuinely parse back out, got:\n{out}'
trace_id, span_id, sampled = int(parsed.group(1)), int(parsed.group(2)), parsed.group(3) == 'true'
assert trace_id == 0x4bf92f3577b34da6a3ce929d0e0e4736, f'the real trace id should round-trip exactly, got {trace_id:#x}'
assert span_id == 0x00f067aa0ba902b7, f'the real span id should round-trip exactly, got {span_id:#x}'
assert sampled is True, 'the real sampled flag should round-trip exactly'
assert 'malformed_parsed=None' in out, 'a real, malformed traceparent header should genuinely be rejected, not guessed at'
print(f'structured-fields-opentelemetry-export: the real traceparent header {header!r} round-tripped its own trace id, span id, and sampled flag exactly, and a malformed header was genuinely rejected')

print('all structured-fields-opentelemetry-export examples pass')
