"""Every example shown in the "Processes, signals, and environment safety" reel, compiled
and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the
pinned CI toolchain is 1.97.0) and cargo on PATH. These examples are Unix-specific (fork,
raw syscalls for pidfd) and use the real libc crate; none of them calls a genuinely
async-signal-unsafe operation inside a forked, not-yet-exec'd child — the thread-count
measurement reads /proc from the parent, about the child, never from inside the child
itself. Rust sources live in examples/runtime-demo/ next to this file; every path is
resolved from __file__."""
import os
import shutil
import subprocess
import sys

assert sys.platform != 'win32', 'this topic is Unix-specific: fork, pidfd, signal handling'

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required: these examples need the real libc crate'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_run(name, timeout=60):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=CRATE,
                           capture_output=True, text=True, timeout=timeout)


# ---- 1. std::process::Command genuinely forks and execs a separate, real child process, ----
# ---- with its own distinct pid and its own real, observed exit status. ----
r = cargo_run('command_spawns_a_real_child')
assert r.returncode == 0, f'command_spawns_a_real_child should build and run:\n{r.stdout}\n{r.stderr}'
different_pid, exit_code, child_pid = r.stdout.strip().split()
assert different_pid == 'true', f'the child should have its own, different pid, got {different_pid!r}'
assert exit_code == '7', f'the child\'s real exit code should be observed exactly, got {exit_code!r}'
print(f'command_spawns_a_real_child: Command spawned a genuinely separate child (pid {child_pid}), whose real exit code 7 was observed exactly')

# ---- 2. After a real fork() in a multithreaded process, the child is created with ----
# ---- exactly one thread, no matter how many the parent had running. ----
r = cargo_run('fork_child_has_one_thread')
assert r.returncode == 0, f'fork_child_has_one_thread should build and run:\n{r.stdout}\n{r.stderr}'
parent_tasks, child_tasks = (int(x) for x in r.stdout.strip().split())
assert parent_tasks > 1, f'the parent should have had more than one real thread running, got {parent_tasks}'
assert child_tasks == 1, f'the forked child should have exactly one thread, got {child_tasks}'
print(f'fork_child_has_one_thread: the parent genuinely had {parent_tasks} threads running, and the forked child had exactly {child_tasks}')

# ---- 3. A pidfd is a stable reference to one specific process: sending a signal through ----
# ---- it succeeds while that exact process is alive, and fails with ESRCH once it is ----
# ---- genuinely gone — never silently reaching some other process that reused its old pid. ----
r = cargo_run('pidfd_fails_after_the_process_is_gone')
assert r.returncode == 0, f'pidfd_fails_after_the_process_is_gone should build and run:\n{r.stdout}\n{r.stderr}'
while_alive, after_exit, errno_after_exit = (int(x) for x in r.stdout.strip().split())
assert while_alive == 0, f'sending through the pidfd should succeed while the process is alive, got {while_alive}'
assert after_exit == -1, f'sending through the pidfd should fail once the process is gone, got {after_exit}'
assert errno_after_exit == 3, f'the failure should be ESRCH (3), got {errno_after_exit}'
print('pidfd_fails_after_the_process_is_gone: sending through the pidfd succeeded while the real process was alive, and failed with ESRCH the moment it was genuinely gone')

print('all processes-signals-environment-safety examples pass')
