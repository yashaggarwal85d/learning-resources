"""Every example shown in the "Failure taxonomy and error design"
reel, built and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH; cargo fetches thiserror from crates.io on first
build. One real crate lives in examples/failure_demo/ next to this
file: one binary producing a real, typed timeout error and a real,
typed remote error, and the identical pair rendered only as untyped
strings, each checked against a real retry decision. Every path is
resolved from __file__.
"""
import os
import re
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, 'examples', 'failure_demo')

CARGO = shutil.which('cargo')
assert CARGO, 'cargo is required'

r = subprocess.run([CARGO, 'run', '-q'], cwd=CRATE, capture_output=True, text=True, timeout=60)
assert r.returncode == 0, f'cargo run should succeed:\n{r.stdout}\n{r.stderr}'
out = r.stdout


def flag(name):
    v = re.search(rf'{name}=(true|false)', out).group(1)
    return v == 'true'


typed_timeout_retry = flag('typed_timeout_retry')
typed_remote_retry = flag('typed_remote_retry')
untyped_timeout_retry = flag('untyped_timeout_retry')
untyped_remote_retry = flag('untyped_remote_retry')

# ---- 1. The real, typed error genuinely drives the correct retry ----
# ---- decision: retry the real timeout, never the real remote error. ----
assert typed_timeout_retry is True, 'the typed timeout error should genuinely be retried'
assert typed_remote_retry is False, 'the typed remote error should genuinely not be retried'
print(f'failure-taxonomy-error-design: the typed error retries the real timeout ({typed_timeout_retry}) and not the real remote error ({typed_remote_retry})')

# ---- 2. The identical pair, rendered only as untyped strings, is ----
# ---- genuinely retried identically for both, since both of this ----
# ---- crate's own real messages share the identical substring any ----
# ---- plausible untyped check would key on. ----
assert untyped_timeout_retry is True, 'the untyped timeout message should still be retried'
assert untyped_remote_retry is True, 'the untyped remote message should genuinely also be retried, incorrectly'
assert untyped_timeout_retry == untyped_remote_retry, \
    f'the untyped check should genuinely fail to tell the two failure kinds apart, got {untyped_timeout_retry} vs {untyped_remote_retry}'
print(f'failure-taxonomy-error-design: the untyped string check genuinely retries both the timeout ({untyped_timeout_retry}) and the remote error ({untyped_remote_retry}), unable to tell them apart')

# ---- 3. The typed and untyped retry decisions genuinely disagree on ----
# ---- the real remote error: the typed version correctly skips it, ----
# ---- the untyped version incorrectly retries it. ----
assert typed_remote_retry != untyped_remote_retry, \
    f'the typed and untyped decisions should genuinely disagree on the real remote error, got {typed_remote_retry} == {untyped_remote_retry}'
print(f'failure-taxonomy-error-design: on the real remote error, the typed decision ({typed_remote_retry}) and the untyped decision ({untyped_remote_retry}) genuinely disagree')

print('all failure-taxonomy-error-design examples pass')
