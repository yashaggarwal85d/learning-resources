"""Every example shown in the "Bounded channels and backpressure" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH; these examples need the real tokio crate.
Rust sources live in examples/runtime-demo/ next to this file; every path is resolved from
__file__."""
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required: these examples need the real tokio crate'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_run(name, timeout=60):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=CRATE,
                           capture_output=True, text=True, timeout=timeout)


# ---- 1. A bounded mpsc channel of capacity 1 genuinely makes a fast producer wait on a ----
# ---- slow consumer, rather than letting it race ahead. ----
r = cargo_run('mpsc_applies_backpressure')
assert r.returncode == 0, f'mpsc_applies_backpressure should build and run:\n{r.stdout}\n{r.stderr}'
producer_ms, received = r.stdout.strip().split()
producer_ms, received = int(producer_ms), int(received)
assert received == 20, f'every sent message should have been received, got {received}'
assert producer_ms >= 18 * 15, f'a bounded channel of capacity 1 should make the producer wait on the consumer, got {producer_ms}ms'
print(f'mpsc_applies_backpressure: the producer took {producer_ms}ms to send 20 messages into a channel of capacity 1, genuinely paced by a consumer taking 15ms each')

# ---- 2. A broadcast channel with a receiver that falls behind reports a real Lagged error, ----
# ---- naming exactly how many messages were dropped, then resumes from the oldest retained one. ----
r = cargo_run('broadcast_lagging_receiver_drops')
assert r.returncode == 0, f'broadcast_lagging_receiver_drops should build and run:\n{r.stdout}\n{r.stderr}'
lagged_count, next_value = r.stdout.strip().split()
lagged_count, next_value = int(lagged_count), int(next_value)
assert lagged_count == 3, f'sending 5 values into a 2-capacity broadcast channel with no reader should drop 3, got {lagged_count}'
assert next_value == 3, f'after lagging, the next value should be the oldest one still retained, got {next_value}'
print(f'broadcast_lagging_receiver_drops: falling behind a 2-capacity channel by 5 sends reported {lagged_count} dropped messages, then resumed cleanly from value {next_value}')

# ---- 3. A watch channel retains only the most recently sent value: a receiver that checks ----
# ---- in late after 50 sends sees only the last one, never the 49 it missed. ----
r = cargo_run('watch_keeps_only_latest')
assert r.returncode == 0, f'watch_keeps_only_latest should build and run:\n{r.stdout}\n{r.stderr}'
seen = int(r.stdout.strip())
assert seen == 50, f'a watch receiver checking in late after 50 sends should see only the latest value, got {seen}'
print(f'watch_keeps_only_latest: a receiver that checked in once after 50 sends saw only the latest value, {seen}')

# ---- 4. try_send on a full bounded channel is refused immediately, not queued and not ----
# ---- waited on — the real load-shedding hook, distinct from send's backpressure. ----
r = cargo_run('try_send_sheds_load_immediately')
assert r.returncode == 0, f'try_send_sheds_load_immediately should build and run:\n{r.stdout}\n{r.stderr}'
refused, elapsed_us = r.stdout.strip().split()
elapsed_us = int(elapsed_us)
assert refused == 'true', f'try_send on a full channel should be refused, got refused={refused!r}'
assert elapsed_us < 10_000, f'try_send should refuse immediately, took {elapsed_us} microseconds'
print(f'try_send_sheds_load_immediately: try_send on a full channel was refused in {elapsed_us} microseconds, not queued and not waited on')

print('all bounded-channels-backpressure examples pass')
