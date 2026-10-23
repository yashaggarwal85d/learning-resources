"""Every example shown in the "Cancellation by drop and cancel safety" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH; these examples need the real tokio crate.
Rust sources live in examples/runtime-demo/ next to this file; every path is resolved from
__file__."""
import os
import re
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


# ---- 1. select! drops its losing branch's future: the loser's own side effect never runs, ----
# ---- even long after its own sleep duration would otherwise have elapsed. ----
r = cargo_run('select_drops_losing_branches')
assert r.returncode == 0, f'select_drops_losing_branches should build and run:\n{r.stdout}\n{r.stderr}'
winner, loser_ran = r.stdout.strip().split()
winner, loser_ran = int(winner), int(loser_ran)
assert winner == 1, f'the faster branch should win the race, got {winner}'
assert loser_ran == 0, f"the losing branch's future should have been dropped, not left running, got {loser_ran} completions"
print(f"select_drops_losing_branches: the faster branch won (value {winner}), and the slower branch's own side effect never ran, even after its full delay elapsed")

# ---- 2. mpsc::Receiver::recv is genuinely cancel-safe: cancelling it via select! loses no ----
# ---- message, and a fresh recv() afterward gets exactly what was sent. ----
r = cargo_run('recv_is_cancel_safe')
assert r.returncode == 0, f'recv_is_cancel_safe should build and run:\n{r.stdout}\n{r.stderr}'
received = int(r.stdout.strip())
assert received == 42, f'a cancelled recv() should lose nothing, got {received}'
print(f'recv_is_cancel_safe: after a recv() was cancelled by select!, a fresh recv() received exactly the sent value, {received}')

# ---- 3. read_exact is genuinely not cancel-safe: cancelling it mid-read loses the bytes it ----
# ---- had already consumed, which a fresh read can never recover. ----
r = cargo_run('read_exact_is_not_cancel_safe')
assert r.returncode == 0, f'read_exact_is_not_cancel_safe should build and run:\n{r.stdout}\n{r.stderr}'
bytes_read = re.findall(r'\d+', r.stdout.strip())
bytes_read = [int(b) for b in bytes_read]
assert bytes_read == [6, 7, 8, 9, 10], f'the first 5 bytes a cancelled read_exact had already consumed should be unrecoverable, got {bytes_read}'
print(f'read_exact_is_not_cancel_safe: after read_exact was cancelled mid-read, a fresh read only recovered the second half {bytes_read} — the first half it had already consumed is permanently lost')

# ---- 4. Dropping a JoinHandle detaches its task rather than cancelling it: the task keeps ----
# ---- running on the runtime, unobserved, with nothing left to join on. ----
r = cargo_run('dropped_join_handle_detaches_task')
assert r.returncode == 0, f'dropped_join_handle_detaches_task should build and run:\n{r.stdout}\n{r.stderr}'
ticks = int(r.stdout.strip())
assert ticks >= 3, f'the detached task should have kept running after its JoinHandle was dropped, got {ticks} ticks'
print(f'dropped_join_handle_detaches_task: after its JoinHandle was dropped, the task kept running and ticked {ticks} times, completely unobserved')

print('all cancellation-by-drop-cancel examples pass')
