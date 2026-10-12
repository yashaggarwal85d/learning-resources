#!/usr/bin/env bash
# Every example in the "Linux shell and processes" refresher, run with the real tools in a temp dir.
# Run: bash examples.sh (examples.py runs it and re-asserts every number the reel shows).
# It prints key=value lines; a failed `check` stops it. Needs bash, jq, awk, sed, grep, coreutils, diff,
# python3, ps (procps) and strace. Works as a normal user and as root.
# Not run, by design: cron (no daemon: the line is parsed), ssh (no sshd: the -L/-J arguments are parsed), htop, the D state.
set -euo pipefail
export LC_ALL=C
W=$(mktemp -d); trap 'rm -rf "$W"; jobs -p | xargs -r kill -KILL 2>/dev/null || true' EXIT
check() { [ "$1" = "$2" ] || { echo "FAIL: $3: got '$1', expected '$2'" >&2; exit 1; }; }
out() { echo "$1=$2"; }
need() { command -v "$1" > /dev/null || { echo "FAIL: $1 is not installed" >&2; exit 1; }; }
for t in bash jq awk sed grep sort uniq diff python3 ps strace timeout flock seq head wc cat tr cut stat ln chmod; do need "$t"; done
cd "$W"

# ---- 0 · The tool versions these results come from (printed, not asserted) --------------------------
out v_bash "$BASH_VERSION"
out v_jq "$(jq --version)"
out v_awk "$( (awk --version 2>&1 || awk -W version 2>&1) | head -1 )"
out v_sed "$(sed --version | head -1)"
out v_grep "$(grep --version | head -1)"
out v_sort "$(sort --version | head -1)"
out v_diff "$(diff --version | head -1)"
out v_strace "$(strace -V 2>&1 | head -1)"
out v_ps "$(ps --version 2>&1 | head -1)"
out v_kernel "$(uname -r)"
out v_python "$(python3 --version)"
out uid "$(id -u)"

# ---- 1 · The data and the script -------------------------------------------------------------------
# 10,000 order events, counts fixed by construction: 6,000 paid, 2,500 shipped, 1,300 cancelled, 200 refunded,
# of which 40 are spelt badly (25 'Paid', 10 'SHIPPED ', 5 ' refunded'). Only the order is random (seeded).
cat > gen_events.py << 'PY'
import json, random, sys
rng = random.Random(1)
statuses = ['paid'] * 6000 + ['shipped'] * 2500 + ['cancelled'] * 1300 + ['refunded'] * 200
rng.shuffle(statuses)
dirty = {'paid': ('Paid', 25), 'shipped': ('SHIPPED ', 10), 'refunded': (' refunded', 5)}
for status, (spelt, n) in dirty.items():
    idx = [i for i, s in enumerate(statuses) if s == status][:n]
    for i in idx:
        statuses[i] = spelt
with open(sys.argv[1], 'w') as f:
    for i, status in enumerate(statuses, 1):
        f.write(json.dumps({'order_id': i, 'customer_id': rng.randint(1, 900), 'status': status,
                            'amount': round(rng.uniform(5, 300), 2), 'event_time': f'2026-01-01T{i % 24:02d}:{i % 60:02d}:00Z'}) + '\n')
PY
python3 gen_events.py order_events.jsonl
# clean.py is the data-cleaning script of the Git refresher (clean() = strip().lower()), with a main that counts per status.
cat > clean.py << 'PY'
#!/usr/bin/env python3
import json, sys


def clean(value):
    return value.strip().lower()


def main(path):
    try:
        f = open(path)
    except OSError:
        print(f'clean.py: cannot open {path}', file=sys.stderr)
        return 1
    counts = {}
    with f:
        for line in f:
            status = clean(json.loads(line)['status'])
            counts[status] = counts.get(status, 0) + 1
    for status in sorted(counts):
        print(f'{counts[status]:7d} {status}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1]))
PY
chmod 755 clean.py
out events "$(wc -l < order_events.jsonl | tr -d ' ')"; check "$(wc -l < order_events.jsonl | tr -d ' ')" 10000 'ten thousand events'
RAW_SORTED=$(jq -r .status order_events.jsonl | sort | uniq -c)
out paid "$(jq -r .status order_events.jsonl | awk '{ $1 = $1; print tolower($0) }' | grep -c '^paid$')"
out shipped "$(jq -r .status order_events.jsonl | awk '{ $1 = $1; print tolower($0) }' | grep -c '^shipped$')"
out cancelled "$(jq -r .status order_events.jsonl | grep -c '^cancelled$')"
out refunded "$(jq -r .status order_events.jsonl | awk '{ $1 = $1; print tolower($0) }' | grep -c '^refunded$')"
out dirty "$(jq -r .status order_events.jsonl | grep -Evc '^(paid|shipped|cancelled|refunded)$')"
out refunded_pct "$(( 200 * 100 / 10000 ))"

# ---- 2 · fork, exec, wait ---------------------------------------------------------------------------
set +e; python3 clean.py order_events.jsonl > /dev/null; clean_exit=$?; set -e
out clean_exit "$clean_exit"; check "$clean_exit" 0 'clean.py exits 0'
cat > fork_demo.py << 'PY'
import os, signal, time
pid = os.fork()
if pid == 0:
    # the child: fork returned 0 here; exec replaces this program in the same process
    os.execv('/bin/sh', ['sh', '-c', 'exit 42'])
_, status = os.waitpid(pid, 0)
print('fork_parent_sees_pid=' + ('yes' if pid > 0 else 'no'))
print('wexited=' + str(os.WIFEXITED(status)))
print('wexit=' + str(os.WEXITSTATUS(status)))
# the child's view of fork's return value, through a pipe
r, w = os.pipe()
pid = os.fork()
if pid == 0:
    os.write(w, f'{pid}'.encode())  # pid is 0 in the child
    os._exit(0)
os.waitpid(pid, 0)
print('fork_child_sees=' + os.read(r, 10).decode())
# a child killed by a signal: wait reports WIFSIGNALED / WTERMSIG
pid = os.fork()
if pid == 0:
    time.sleep(30)
    os._exit(0)
os.kill(pid, signal.SIGKILL)
_, status = os.waitpid(pid, 0)
print('wsignaled=' + str(os.WIFSIGNALED(status)))
print('wtermsig=' + str(os.WTERMSIG(status)))
print('python_sees_kill=' + str(-os.WTERMSIG(status)))
PY
python3 fork_demo.py
check "$(bash -c 'echo $$; exec bash -c "echo \$\$"' | uniq | wc -l | tr -d ' ')" 1 'exec keeps the PID'
out exec_keeps_pid yes
set +e; bash -c 'kill -KILL $$'; kill_status=$?; set -e
out kill_status "$kill_status"; check "$kill_status" 137 '128 + 9'

# ---- 3 · Where did the error go? (redirection order) ------------------------------------------------
set +e
python3 clean.py missing.jsonl 2>&1 > out.log | cat > seen.txt
python3 clean.py missing.jsonl > out2.log 2>&1
set -e
out out_log_lines "$(wc -l < out.log | tr -d ' ')"; check "$(wc -l < out.log | tr -d ' ')" 0 'wrong order: the log is empty'
out terminal_lines "$(wc -l < seen.txt | tr -d ' ')"; check "$(wc -l < seen.txt | tr -d ' ')" 1 'wrong order: the error went to the terminal'
out out2_log_lines "$(wc -l < out2.log | tr -d ' ')"; check "$(wc -l < out2.log | tr -d ' ')" 1 'right order: the error is in the log'
out error_text "$(cat seen.txt)"; check "$(cat seen.txt)" 'clean.py: cannot open missing.jsonl' 'the error line'
python3 clean.py order_events.jsonl > app.log; python3 clean.py order_events.jsonl >> app.log
out append_lines "$(wc -l < app.log | tr -d ' ')"; check "$(wc -l < app.log | tr -d ' ')" 8 '>> appends (4 + 4 lines)'

# ---- 4 · A pipeline exits with its last command -----------------------------------------------------
set +e; set +o pipefail
jq -r .status missing.jsonl 2> /dev/null | sort | uniq -c > /dev/null; pipe_status=$?
jq -r .status missing.jsonl 2> /dev/null; jq_missing=$?
set -o pipefail
jq -r .status missing.jsonl 2> /dev/null | sort | uniq -c > /dev/null; pipefail_status=$?
set +o pipefail
jq -r .status missing.jsonl 2> /dev/null | sort | uniq -c > /dev/null; ps_status="${PIPESTATUS[*]}"
set -o pipefail
(exit 3) | (exit 4) | true; rightmost=$?
both=$(seq 1 100000 | head -1 > /dev/null; echo "$? ${PIPESTATUS[*]}"); pipefail_head=${both%% *}; head_ps=${both#* }
set +o pipefail
seq 1 100000 | head -1 > /dev/null; nopipefail_head=$?
set -e -o pipefail
out pipe_status "$pipe_status"; check "$pipe_status" 0 'pipeline status = last command'
out jq_missing "$jq_missing"; check "$jq_missing" 2 'jq on a missing file exits 2'
out pipefail_status "$pipefail_status"; check "$pipefail_status" 2 'pipefail: rightmost non-zero'
out pipestatus "$ps_status"; check "$ps_status" '2 0 0' 'PIPESTATUS'
out rightmost_nonzero "$rightmost"; check "$rightmost" 4 'pipefail takes the rightmost non-zero'
out pipefail_head "$pipefail_head"; check "$pipefail_head" 141 'head closes the pipe: SIGPIPE, 128 + 13'
out pipefail_head_pipestatus "$head_ps"; check "$head_ps" '141 0' 'PIPESTATUS of seq | head'
out nopipefail_head "$nopipefail_head"; check "$nopipefail_head" 0 'without pipefail head is fine'
# set -e, set -u: from script files (the exit code of set -u differs under bash -c)
cat > e_alone.sh << 'SH'
set -e
jq -r .status missing.jsonl 2> /dev/null | sort | uniq -c > /dev/null
echo continued
SH
cat > e_pipefail.sh << 'SH'
set -eo pipefail
jq -r .status missing.jsonl 2> /dev/null | sort | uniq -c > /dev/null
echo continued
SH
cat > u.sh << 'SH'
set -u
echo "$nope"
echo after
SH
set +e
e_alone=$(bash e_alone.sh); e_alone_rc=$?
e_pf=$(bash e_pipefail.sh); e_pf_rc=$?
u_msg=$(bash u.sh 2>&1); u_rc=$?
u_c_rc=$(bash -c 'set -u; echo "$nope"' > /dev/null 2>&1; echo $?)
set -e
out errexit_alone_continues "$([ "$e_alone" = continued ] && echo yes || echo no)"; check "$e_alone" continued 'set -e alone misses the jq failure'
out errexit_pipefail_status "$e_pf_rc"; check "$e_pf_rc" 2 'set -e with pipefail stops, with the status 2'
check "$e_pf" '' 'set -e with pipefail never prints continued'
out nounset_status "$u_rc"; check "$u_rc" 1 'set -u in a script file exits 1'
case "$u_msg" in *'unbound variable'*) out nounset_message unbound_variable;; *) echo "FAIL: no unbound variable message" >&2; exit 1;; esac
out nounset_bash_c_status "$u_c_rc"   # printed, not asserted: it differs between bash -c and a script file
# each stage of a pipeline is its own process: a variable set in the last stage is lost unless lastpipe
cat > lastpipe.sh << 'SH'
n=0; printf 'a\nb\n' | while read -r l; do n=$((n + 1)); done; echo "lost=$n"
shopt -s lastpipe
n=0; printf 'a\nb\n' | while read -r l; do n=$((n + 1)); done; echo "kept=$n"
SH
LP=$(bash lastpipe.sh)
out subshell_count "$(echo "$LP" | sed -n 's/^lost=//p')"; check "$(echo "$LP" | sed -n 's/^lost=//p')" 0 'the loop ran in a subshell'
out lastpipe_count "$(echo "$LP" | sed -n 's/^kept=//p')"; check "$(echo "$LP" | sed -n 's/^kept=//p')" 2 'lastpipe keeps it'
# dash (the usual /bin/sh on Debian) 0.5.12 has no pipefail
if command -v dash > /dev/null; then
  set +e; dash -c 'set -o pipefail' > /dev/null 2>&1; dash_pf=$?; set -e
  out dash_pipefail_status "$dash_pf"
fi

# ---- 5 · Exit codes: 0 to 255, and 128 plus the signal ----------------------------------------------
set +e
bash -c 'kill -KILL $$'; s_kill=$?
bash -c 'kill -TERM $$'; s_term=$?
bash -c 'kill -INT $$'; s_int=$?
bash -c 'kill -HUP $$'; s_hup=$?
cp clean.py perm.py; chmod 644 perm.py; ./perm.py 2> /dev/null; s_perm=$?
pyhton3 clean.py 2> /dev/null; s_typo=$?
nosuchcmd 2> /dev/null; s_nosuch=$?
python3 clean.pyy 2> /dev/null; s_pyy=$?
printf '#!/usr/bin/pythonx\nprint(1)\n' > badshebang.py; chmod 755 badshebang.py; ./badshebang.py 2> /dev/null; s_shebang=$?
mkdir adir; ./adir 2> /dev/null; s_dir=$?
bash -c 'exit 300'; s_300=$?
python3 -c 'import sys; sys.exit(-1)'; s_neg1=$?
set -e
out kill_9 "$s_kill"; check "$s_kill" 137 'KILL -> 137'
out kill_15 "$s_term"; check "$s_term" 143 'TERM -> 143'
out kill_2 "$s_int"; check "$s_int" 130 'INT -> 130'
out kill_1 "$s_hup"; check "$s_hup" 129 'HUP -> 129'
out not_executable "$s_perm"; check "$s_perm" 126 'no x bit -> 126 (even as root)'
out perm_mode "$(stat -c %a perm.py)"; check "$(stat -c %a perm.py)" 644 'chmod 644'
out perm_string "$(stat -c %A perm.py | cut -c2-10)"; check "$(stat -c %A perm.py | cut -c2-10)" 'rw-r--r--' 'rw-r--r--'
out not_found "$s_typo"; check "$s_typo" 127 'a misspelt command -> 127'
check "$s_nosuch" 127 'nosuchcmd -> 127'
out python_missing_file "$s_pyy"; check "$s_pyy" 2 'python3 is found, the file is not: 2, not 127'
out missing_interpreter "$s_shebang"   # printed: 127 on Bash 5.2 ("required file not found")
out directory "$s_dir"; check "$s_dir" 126 'a directory -> 126'
out exit_300 "$s_300"; check "$s_300" 44 'exit 300 -> 300 mod 256'
out exit_neg1 "$s_neg1"; check "$s_neg1" 255 'exit(-1) -> 255'
case "$BASH_VERSION" in 5.2*) check "$s_shebang" 127 'missing interpreter -> 127 on Bash 5.2';; esac
out signal_numbers "$(kill -l HUP INT KILL TERM | tr '\n' ' ' | sed 's/ $//')"; check "$(kill -l HUP INT KILL TERM | tr '\n' ' ' | sed 's/ $//')" '1 2 9 15' 'kill -l'
out bisect_bands "0 1 125 126 127 128 255"

# ---- 6 · Signals: TERM asks, KILL does not ----------------------------------------------------------
cat > term_handler.py << 'PY'
import os, signal, sys, time
def stop(signum, frame):
    print('flushed and closed', flush=True)
    # flush, then re-raise the same signal with the default action: the parent sees "killed by TERM" (143), not a success
    signal.signal(signal.SIGTERM, signal.SIG_DFL)
    os.kill(os.getpid(), signal.SIGTERM)
signal.signal(signal.SIGTERM, stop)
open(sys.argv[1], 'w').close()  # ready: the handler is installed
time.sleep(60)
PY
cat > term_exit143.py << 'PY'
import signal, sys, time
def stop(signum, frame):
    print('flushed and closed', flush=True)
    sys.exit(128 + signum)  # the other way to say "stopped by TERM": exit 143 yourself
signal.signal(signal.SIGTERM, stop)
open(sys.argv[1], 'w').close()
time.sleep(60)
PY
cat > term_exit0.py << 'PY'
import signal, sys, time
def stop(signum, frame):
    print('flushed and closed', flush=True)
    sys.exit(0)  # the trap: an interrupted job reports success
signal.signal(signal.SIGTERM, stop)
open(sys.argv[1], 'w').close()
time.sleep(60)
PY
cat > sleeper.py << 'PY'
import sys, time
open(sys.argv[1], 'w').close()
time.sleep(60)
PY
waitfile() { for _ in $(seq 1 100); do [ -e "$1" ] && return 0; sleep 0.05; done; echo "FAIL: $1 never appeared" >&2; exit 1; }
python3 term_handler.py ready1 > handler.out & hp=$!; waitfile ready1
kill -TERM $hp; set +e; wait $hp; handled_term=$?; set -e
out handled_term "$handled_term"; check "$handled_term" 143 'a program that catches TERM, flushes and re-raises it exits 143'
out handler_line "$(cat handler.out)"; check "$(cat handler.out)" 'flushed and closed' 'the handler flushed'
python3 term_exit143.py ready1b > /dev/null & hp=$!; waitfile ready1b
kill -TERM $hp; set +e; wait $hp; handled_exit143=$?; set -e
out handled_exit143 "$handled_exit143"; check "$handled_exit143" 143 'exiting 128 + 15 from the handler says the same'
python3 term_exit0.py ready1c > /dev/null & hp=$!; waitfile ready1c
kill -TERM $hp; set +e; wait $hp; handled_exit0=$?; set -e
out handled_exit0 "$handled_exit0"; check "$handled_exit0" 0 'a handler that calls exit(0) reports success for an interrupted job'
# exit(143) and re-raising are not the same in a job with a non-daemon worker thread: SystemExit ends only the main thread,
# and Python waits for the worker before the process ends; re-raising TERM with SIG_DFL ends the process at once
cat > term_worker.py << 'PY'
import os, signal, sys, threading, time
def stop(signum, frame):
    if sys.argv[2] == 'exit':
        sys.exit(128 + signum)
    signal.signal(signum, signal.SIG_DFL); os.kill(os.getpid(), signum)
signal.signal(signal.SIGTERM, stop)
threading.Thread(target=lambda: (time.sleep(2), open(sys.argv[1] + '.done', 'w').close())).start()  # a non-daemon worker
open(sys.argv[1], 'w').close()
time.sleep(60)
PY
python3 term_worker.py ready1d exit & hp=$!; waitfile ready1d
kill -TERM $hp; set +e; wait $hp; st_exit_worker=$?; set -e
out handled_exit_waits_worker "$([ -e ready1d.done ] && echo yes || echo no) $st_exit_worker"; check "$([ -e ready1d.done ] && echo yes || echo no) $st_exit_worker" 'yes 143' 'sys.exit in the handler: the process ends only after the worker thread'
python3 term_worker.py ready1e raise & hp=$!; waitfile ready1e
kill -TERM $hp; set +e; wait $hp; st_raise_worker=$?; set -e
out handled_reraise_waits_worker "$([ -e ready1e.done ] && echo yes || echo no) $st_raise_worker"; check "$([ -e ready1e.done ] && echo yes || echo no) $st_raise_worker" 'no 143' 're-raising TERM ends the process at once'
python3 term_handler.py ready2 > /dev/null & hp=$!; waitfile ready2
kill -KILL $hp; set +e; wait $hp; killed=$?; set -e
out killed "$killed"; check "$killed" 137 'KILL cannot be caught: 137'
python3 sleeper.py ready3 & hp=$!; waitfile ready3
kill -TERM $hp; set +e; wait $hp; plain_term=$?; set -e
out plain_term "$plain_term"; check "$plain_term" 143 'TERM with no handler: 143'
# zombie and orphan
cat > zombie.py << 'PY'
import os, re, subprocess, time
p = subprocess.Popen(['true'])
time.sleep(0.3)  # the child has ended; nobody has waited for it yet
status = open(f'/proc/{p.pid}/status').read()
state = re.search(r'^State:\s+(\S+) \((\w+)\)', status, re.M)
print('zombie_state=' + state.group(1))
print('zombie_word=' + state.group(2))
ps = subprocess.run(['ps', '-o', 'stat=,args=', '-p', str(p.pid)], capture_output=True, text=True).stdout.strip()
print('zombie_ps=' + ps)
print('zombie_comm=' + subprocess.run(['ps', '-o', 'comm=', '-p', str(p.pid)], capture_output=True, text=True).stdout.strip())
try:
    print('zombie_fds=' + str(len(os.listdir(f'/proc/{p.pid}/fd'))))
except PermissionError:  # a normal user may not look into a zombie's fd directory
    print('zombie_fds=unreadable')
p.wait()
print('zombie_gone=' + ('yes' if not os.path.exists(f'/proc/{p.pid}') else 'no'))
PY
python3 zombie.py
cat > orphan.py << 'PY'
import os, re, time
r, w = os.pipe()
mid = os.fork()
if mid == 0:
    kid = os.fork()
    if kid == 0:
        before = os.getppid()
        time.sleep(0.4)  # the middle process has exited by now
        after = int(re.search(r'^PPid:\s+(\d+)', open('/proc/self/status').read(), re.M).group(1))
        os.write(w, f'{before} {after}'.encode())
        os._exit(0)
    time.sleep(0.2)  # the child reads its parent first; only then does this process exit
    os._exit(0)
os.waitpid(mid, 0)
before, after = os.read(r, 100).decode().split()
print('orphan_parent_was_middle=' + ('yes' if int(before) == mid else 'no'))
print('orphan_reparented=' + ('yes' if after != before else 'no'))
print('orphan_new_ppid_is_parent_process=' + ('no' if int(after) != os.getpid() else 'yes'))
PY
python3 orphan.py

# ---- 7 · A load job hangs: what is it doing? --------------------------------------------------------
# hung_load.py: a TCP connection whose other end is held open and silent; the main thread blocks in read() on fd 4,
# and a second thread sleeps (the Threads: 2 line). PR_SET_PTRACER_ANY lets strace -p attach under Yama's ptrace_scope 1.
cat > hung_load.py << 'PY'
import ctypes, os, socket, sys, threading, time
try:
    ctypes.CDLL(None).prctl(0x59616D61, ctypes.c_ulong(-1))  # PR_SET_PTRACER, PR_SET_PTRACER_ANY
except Exception:
    pass
srv = socket.socket(); srv.bind(('127.0.0.1', 0)); srv.listen(1)
cli = socket.socket(); cli.connect(srv.getsockname())
conn, _ = srv.accept()  # keep this alive: when it is dropped, read() returns EOF and the job just ends
assert cli.fileno() == 4, cli.fileno()
threading.Thread(target=lambda: [time.sleep(1) for _ in iter(int, 1)], daemon=True).start()
open(sys.argv[1], 'w').close()
os.read(cli.fileno(), 1)  # blocks for ever: nobody writes to conn
PY
python3 hung_load.py ready4 & hung=$!; waitfile ready4; sleep 0.5
status=$(cat /proc/$hung/status)
hung_state=$(echo "$status" | sed -n 's/^State:[[:space:]]*\([A-Z]\).*/\1/p')
hung_threads=$(echo "$status" | sed -n 's/^Threads:[[:space:]]*//p')
hung_wchan=$(cat /proc/$hung/wchan)
hung_fd4=$(readlink /proc/$hung/fd/4)
out hung_state "$hung_state"; check "$hung_state" S 'blocked in read(): sleeping'
out hung_threads "$hung_threads"; check "$hung_threads" 2 'two threads'
out hung_wchan "$hung_wchan"; [ -n "$hung_wchan" ] && [ "$hung_wchan" != 0 ] || { echo "FAIL: empty wchan" >&2; exit 1; }
case "$hung_fd4" in socket:\[[0-9]*\]) out hung_fd4 socket;; *) echo "FAIL: fd 4 is $hung_fd4" >&2; exit 1;; esac
# which peer? match the socket's inode in /proc/net/tcp (the row's 10th field): its remote port is the listening port the job itself opened (fd 3)
ino4=$(readlink /proc/$hung/fd/4 | tr -dc 0-9); ino3=$(readlink /proc/$hung/fd/3 | tr -dc 0-9)
if [ -r /proc/net/tcp ]; then
  row4=$(awk -v i="$ino4" '$10 == i { print $3 " " $4 }' /proc/net/tcp); row3=$(awk -v i="$ino3" '$10 == i { print $2 " " $4 }' /proc/net/tcp)
  peer_port=$(( 16#$(echo "$row4" | cut -d' ' -f1 | cut -d: -f2) )); listen_port=$(( 16#$(echo "$row3" | cut -d' ' -f1 | cut -d: -f2) ))
  out hung_peer_is_listener "$([ "$peer_port" = "$listen_port" ] && echo yes || echo no)"; check "$peer_port" "$listen_port" "the socket's remote port is the listening port"
  out hung_tcp_state "$(echo "$row4" | cut -d' ' -f2)"; check "$(echo "$row4" | cut -d' ' -f2)" 01 'fd 4 is an ESTABLISHED connection (state 01)'
else out hung_peer_is_listener unavailable; out hung_tcp_state unavailable; fi
out ss_installed "$(command -v ss > /dev/null && echo yes || echo no)"  # printed only: the Deep dive names ss -tnp but does not run it
out hung_ps_stat "$(ps -o stat= -p $hung | tr -d ' ')"
out hung_ps_threads "$(ps -L -o lwp= -p $hung | wc -l | tr -d ' ')"
out hung_ps_L "$(ps -L -o stat=,wchan:20= -p $hung | tr -s ' ' | tr '\n' ';' | sed 's/;$//')"
if [ -r /proc/$hung/stack ] && [ -n "$(cat /proc/$hung/stack 2> /dev/null)" ]; then out hung_stack "$(head -3 /proc/$hung/stack | awk '{print $2}' | tr '\n' ' ')"; else out hung_stack unavailable; fi
# /proc/<pid>/syscall: the syscall number, then its first argument (here the fd). 0 is read on x86-64 and 63 on arm64.
if [ -r /proc/$hung/syscall ] && [ -n "$(cat /proc/$hung/syscall 2> /dev/null)" ]; then
  out hung_syscall "$(cut -d' ' -f1 /proc/$hung/syscall)"
  out hung_syscall_fd "$(( $(cut -d' ' -f2 /proc/$hung/syscall) ))"  # the second field is hex (0x4)
  case "$(cut -d' ' -f1 /proc/$hung/syscall)" in 0|63) ;; *) echo "FAIL: not a read syscall" >&2; exit 1;; esac
  check "$(( $(cut -d' ' -f2 /proc/$hung/syscall) ))" 4 'the blocked call is on fd 4'
else out hung_syscall unavailable; out hung_syscall_fd unavailable; fi
set +e; timeout 1.5 strace -o trace.txt -p $hung > /dev/null 2>&1; set -e
if grep -q 'read(4, ' trace.txt 2> /dev/null; then
  out strace_read "read(4,"; out strace_line "$(grep 'read(4, ' trace.txt | head -1 | sed 's/  */ /g')"
  check "$(grep -c 'read(4, ' trace.txt)" 1 'one read in progress'
  grep 'read(4, ' trace.txt | grep -q ')' && grep 'read(4, ' trace.txt | grep -q '= ' && { echo "FAIL: the read returned" >&2; exit 1; } || true
else
  # ptrace is refused here (Yama scope 2 needs CAP_SYS_PTRACE; a seccomp profile can refuse it too)
  out strace_read skipped; out strace_line "ptrace restricted"
fi
# hung_load.py installs no TERM handler, unlike the step 6 job that flushes first: either way the shell sees 143, so the difference is what got flushed
kill -TERM $hung; set +e; wait $hung; hung_term=$?; set -e
out hung_term "$hung_term"; check "$hung_term" 143 'TERM ends the hung job with 143'
# ps columns for the Deep dive, and the load average
out ps_columns "$(ps -o pid,ppid,stat,wchan:12,etime,rss,pcpu,comm -p $$ | head -1 | tr -s ' ' | sed 's/^ //')"
out loadavg_fields "$(wc -w < /proc/loadavg | tr -d ' ')"; check "$(wc -w < /proc/loadavg | tr -d ' ')" 5 '/proc/loadavg has five fields'
if command -v top > /dev/null; then out top_snapshot "$(TERM=dumb top -bn1 2> /dev/null | head -1 | cut -c1-5)"; fi
out htop_installed "$(command -v htop > /dev/null && echo yes || echo no)"

# ---- 8 · One pipeline, one script, same answer (the chapter lab's pipeline half) --------------------
jq -r .status order_events.jsonl | awk '{ $1 = $1; print tolower($0) }' | LC_ALL=C sort | uniq -c > shell.txt
python3 clean.py order_events.jsonl > py.txt
set +e; diff shell.txt py.txt > diff.out; diff_exit=$?; set -e
out diff_exit "$diff_exit"; check "$diff_exit" 0 'the pipeline equals the script'
out diff_lines "$(wc -l < diff.out | tr -d ' ')"; check "$(wc -l < diff.out | tr -d ' ')" 0 'diff prints nothing'
n=0; while IFS= read -r line; do n=$((n + 1)); echo "uniq_line_$n=$line"; done < shell.txt
check "$(cat shell.txt)" "$(printf '   1300 cancelled\n   6000 paid\n    200 refunded\n   2500 shipped')" 'the four lines, byte order'
jq -r .status order_events.jsonl | LC_ALL=C sort | uniq -c > raw.txt
out raw_groups "$(wc -l < raw.txt | tr -d ' ')"; check "$(wc -l < raw.txt | tr -d ' ')" 7 'seven groups without awk'
set +e; diff raw.txt py.txt > /dev/null; diff_raw_exit=$?; set -e
out diff_raw_exit "$diff_raw_exit"; check "$diff_raw_exit" 1 'diff exits 1 when the files differ'
out count_order_by_count "$(jq -r .status order_events.jsonl | awk '{ $1 = $1; print tolower($0) }' | LC_ALL=C sort | uniq -c | sort -rn | head -1 | tr -s ' ' | sed 's/^ //')"
jq -r .status order_events.jsonl | awk '{ $1 = $1; n[tolower($0)]++ } END { for (k in n) printf "%7d %s\n", n[k], k }' | LC_ALL=C sort -k2 > awk_only.txt
set +e; diff awk_only.txt py.txt > /dev/null; awk_only_diff=$?; set -e
out awk_only_diff "$awk_only_diff"; check "$awk_only_diff" 0 'an awk-only counter agrees'
out jq_groups_raw "$(jq -s 'group_by(.status) | length' order_events.jsonl)"; check "$(jq -s 'group_by(.status) | length' order_events.jsonl)" 7 'slurped, 7 raw groups'
out jq_groups_clean "$(jq -s 'map(.status |= (gsub("^\\s+|\\s+$"; "") | ascii_downcase)) | group_by(.status) | length' order_events.jsonl)"
check "$(jq -s 'map(.status |= (gsub("^\\s+|\\s+$"; "") | ascii_downcase)) | group_by(.status) | length' order_events.jsonl)" 4 'slurped and cleaned, 4 groups'
out jq_c_lines "$(jq -c . order_events.jsonl | wc -l | tr -d ' ')"; check "$(jq -c . order_events.jsonl | wc -l | tr -d ' ')" 10000 'jq -c: one object per line'
out sed_extracted "$(sed -n 's/.*"status": *"\([^"]*\)".*/\1/p' order_events.jsonl | wc -l | tr -d ' ')"; check "$(sed -n 's/.*"status": *"\([^"]*\)".*/\1/p' order_events.jsonl | wc -l | tr -d ' ')" 10000 'sed can extract'
out grep_count "$(grep -Ec '"status": *"(refunded|cancelled)"' order_events.jsonl)"; check "$(grep -Ec '"status": *"(refunded|cancelled)"' order_events.jsonl)" 1495 'grep counts strings: 1,495'
out true_count "$(jq -r .status order_events.jsonl | awk '{ $1 = $1; print tolower($0) }' | grep -Ec '^(refunded|cancelled)$')"; check "$(jq -r .status order_events.jsonl | awk '{ $1 = $1; print tolower($0) }' | grep -Ec '^(refunded|cancelled)$')" 1500 'the true count: 1,500'
out refunded_select "$(jq -c 'select(.status == "refunded")' order_events.jsonl | wc -l | tr -d ' ')"; check "$(jq -c 'select(.status == "refunded")' order_events.jsonl | wc -l | tr -d ' ')" 195 'select on the raw value: 195'
# jq, grep, sed, awk details the Deep dive states
set +e
echo '{' | jq . > /dev/null 2>&1; jq_parse=$?
jq -n 'null' > /dev/null; jq_null=$?
jq -en 'null' > /dev/null; jq_e_null=$?
jq -en 'empty' > /dev/null; jq_e_empty=$?
jq -n '1 +' > /dev/null 2>&1; jq_compile=$?
grep -q nomatch order_events.jsonl; grep_none=$?
grep -q paid order_events.jsonl; grep_some=$?
grep -q paid no_such_file 2> /dev/null; grep_err=$?
set -e
out jq_exit_parse_error "$jq_parse"; out jq_exit_null "$jq_null"; check "$jq_null" 0 'jq: a null result is exit 0'
out jq_exit_e_null "$jq_e_null"; check "$jq_e_null" 1 'jq -e: null is 1'
out jq_exit_e_empty "$jq_e_empty"; check "$jq_e_empty" 4 'jq -e: no output is 4'
out jq_exit_compile "$jq_compile"; check "$jq_compile" 3 'jq: a compile error is 3'
out grep_exit_none "$grep_none"; check "$grep_none" 1 'grep: no match is 1'
out grep_exit_match "$grep_some"; check "$grep_some" 0 'grep: a match is 0'
out grep_exit_error "$grep_err"; check "$grep_err" 2 'grep: an error is 2'
out jq_arg "$(jq -n --arg s 'a"b' '$s | length')"; check "$(jq -n --arg s 'a"b' '$s | length')" 3 'jq --arg passes a string'
out grep_dot_regex "$(printf '10.0.0.1\n10x0y0z1\n' | grep -c '10.0.0.1')"; check "$(printf '10.0.0.1\n10x0y0z1\n' | grep -c '10.0.0.1')" 2 'a dot matches anything'
out grep_dot_fixed "$(printf '10.0.0.1\n10x0y0z1\n' | grep -Fc '10.0.0.1')"; check "$(printf '10.0.0.1\n10x0y0z1\n' | grep -Fc '10.0.0.1')" 1 'grep -F: literal'
out awk_fields "$(echo '  a   b  ' | awk '{ print NF }')"; check "$(echo '  a   b  ' | awk '{ print NF }')" 2 'awk splits on runs of blanks'
out awk_rebuild "$(echo '  a   b  ' | awk '{ $1 = $1; print "[" $0 "]" }')"; check "$(echo '  a   b  ' | awk '{ $1 = $1; print "[" $0 "]" }')" '[a b]' '$1 = $1 rebuilds with OFS'
printf 'x\n' > sedfile; sed -i.bak 's/x/y/' sedfile
out sed_inplace "$(cat sedfile) (was $(cat sedfile.bak))"; check "$(cat sedfile)$(cat sedfile.bak)" yx 'sed -i.bak keeps a backup'

# more of the toolbox the Deep dive states (Bash shorthands, sed, grep, jq)
set +e
bash -c 'python3 clean.py missing.jsonl &> both.log'
out amp_redirect_lines "$(wc -l < both.log | tr -d ' ')"; check "$(wc -l < both.log | tr -d ' ')" 1 '&> sends both streams to the file'
out pipe_amp_lines "$(python3 clean.py missing.jsonl |& wc -l | tr -d ' ')"; check "$(python3 clean.py missing.jsonl |& wc -l | tr -d ' ')" 1 '|& pipes stderr too'
echo old > exists.txt; (set -o noclobber; echo new > exists.txt) 2> /dev/null; noclobber_status=$?
(set -o noclobber; echo forced >| exists.txt); noclobber_force=$?
bash -c 'cd -Z' > /dev/null 2>&1; builtin_usage=$?
set -e
out noclobber_status "$noclobber_status"; check "$noclobber_status" 1 'noclobber: > refuses to overwrite'
out noclobber_override "$noclobber_force $(cat exists.txt)"; check "$noclobber_force $(cat exists.txt)" '0 forced' '>| overrides noclobber'
out builtin_usage_status "$builtin_usage"; check "$builtin_usage" 2 'a builtin used wrongly exits 2'
out sed_E "$(printf 'a1\nb2\n' | sed -E 's/[a-z]([0-9])/\1/' | tr '\n' ' ')"; check "$(printf 'a1\nb2\n' | sed -E 's/[a-z]([0-9])/\1/' | tr '\n' ' ')" '1 2 ' 'sed -E: extended regular expressions'
out sed_z "$(printf 'a\0b\0' | sed -z 's/^/X/' | tr '\0' ' ')"; check "$(printf 'a\0b\0' | sed -z 's/^/X/' | tr '\0' ' ')" 'Xa Xb ' 'sed -z: NUL-separated records'
printf '1\n2\n' > f1.txt; printf '3\n4\n' > f2.txt
out sed_s_lines "$(sed -s -n '$p' f1.txt f2.txt | wc -l | tr -d ' ') $(sed -n '$p' f1.txt f2.txt | wc -l | tr -d ' ')"; check "$(sed -s -n '$p' f1.txt f2.txt | wc -l | tr -d ' ') $(sed -n '$p' f1.txt f2.txt | wc -l | tr -d ' ')" '2 1' 'sed -s treats files separately'
printf 'abc\0def\nabc\n' > bin.dat
out grep_binary "$(grep abc bin.dat 2>&1 | grep -c 'binary file matches')"; check "$(grep abc bin.dat 2>&1 | grep -c 'binary file matches')" 1 'grep reports binary file matches (on stderr since grep 3.5) and prints no lines'
out grep_binary_stdout_lines "$(grep abc bin.dat 2> /dev/null | wc -l | tr -d ' ')"; check "$(grep abc bin.dat 2> /dev/null | wc -l | tr -d ' ')" 0 'and no matching lines on stdout'
out grep_a_lines "$(grep -a abc bin.dat | wc -l | tr -d ' ')"; check "$(grep -a abc bin.dat | wc -l | tr -d ' ')" 2 'grep -a forces text'
out jq_default "$(jq -rn 'null // "x"')"; check "$(jq -rn 'null // "x"')" x 'jq: // supplies a default'
out jq_tsv_tab "$(jq -r '[.status, .amount] | @tsv' order_events.jsonl | head -1 | grep -c "$(printf '\t')")"; check "$(jq -r '[.status, .amount] | @tsv' order_events.jsonl | head -1 | grep -c "$(printf '\t')")" 1 'jq @tsv makes tab-separated lines'
out jq_argjson "$(jq -n --argjson n 5 '$n + 1')"; check "$(jq -n --argjson n 5 '$n + 1')" 6 'jq --argjson passes JSON'
out jq_stream_events "$(echo '{"a":[1,2]}' | jq -c --stream . | wc -l | tr -d ' ')"; check "$(echo '{"a":[1,2]}' | jq -c --stream . | wc -l | tr -d ' ')" 4 'jq --stream emits path/leaf events'

# ---- 9 · cron and ssh: parsed, not run --------------------------------------------------------------
cat > cron_parse.py << 'PY'
import datetime, sys
from zoneinfo import ZoneInfo
RANGES = [('minute', 0, 59), ('hour', 0, 23), ('dom', 1, 31), ('month', 1, 12), ('dow', 0, 7)]  # crontab(5)
line = '15 2 * * *  /opt/etl/nightly.sh >> /var/log/nightly.log 2>&1'
parts = line.split(None, 5)
fields, command = parts[:5], parts[5]
def values(field, lo, hi):
    if field == '*':
        return set(range(lo, hi + 1))
    out = set()
    for item in field.split(','):
        step = 1
        if '/' in item:
            item, s = item.split('/'); step = int(s)
        a, b = (lo, hi) if item == '*' else (map(int, item.split('-')) if '-' in item else (int(item), int(item)))
        assert lo <= a <= b <= hi, (field, lo, hi)
        out |= set(range(a, b + 1, step))
    return out
parsed = {name: values(f, lo, hi) for f, (name, lo, hi) in zip(fields, RANGES)}
print('cron_minute=' + str(min(parsed['minute']))); print('cron_hour=' + str(min(parsed['hour'])))
print('cron_runs_per_day=' + str(len(parsed['minute']) * len(parsed['hour'])))
print('cron_command_streams=' + ('both' if command.endswith('>> /var/log/nightly.log 2>&1') else 'one'))
def due(dt, f=fields):
    p = {name: values(x, lo, hi) for x, (name, lo, hi) in zip(f, RANGES)}
    dow = dt.isoweekday() % 7
    dow_ok = dow in p['dow'] or (dow == 0 and 7 in p['dow'])
    star_dom, star_dow = f[2] == '*', f[4] == '*'
    day_ok = (dt.day in p['dom'] and dow_ok) if (star_dom or star_dow) else (dt.day in p['dom'] or dow_ok)  # either, when both are restricted
    return dt.minute in p['minute'] and dt.hour in p['hour'] and dt.month in p['month'] and day_ok
print('cron_due_0215=' + ('yes' if due(datetime.datetime(2026, 10, 12, 2, 15)) else 'no'))
print('cron_due_0216=' + ('yes' if due(datetime.datetime(2026, 10, 12, 2, 16)) else 'no'))
# both day fields restricted: the 13th OR a Friday (2026-02-06 is a Friday, 2026-04-13 is a Monday, 2026-02-10 is a Tuesday)
both = ['0', '0', '13', '*', '5']
print('cron_either_day_friday=' + ('yes' if due(datetime.datetime(2026, 2, 6, 0, 0), both) else 'no'))  # a Friday, not the 13th
print('cron_either_day_13th=' + ('yes' if due(datetime.datetime(2026, 4, 13, 0, 0), both) else 'no'))
print('cron_either_day_other=' + ('yes' if due(datetime.datetime(2026, 2, 10, 0, 0), both) else 'no'))  # a Tuesday, the 10th
def wall(tz, y, m, d, h, mi, fold=0):
    dt = datetime.datetime(y, m, d, h, mi, tzinfo=ZoneInfo(tz), fold=fold)
    return dt
def exists(dt):
    utc = dt.astimezone(datetime.timezone.utc)
    return utc.astimezone(dt.tzinfo).replace(tzinfo=None) == dt.replace(tzinfo=None)
b = wall('Europe/Berlin', 2026, 3, 29, 2, 15)
print('dst_berlin_spring_exists=' + ('yes' if exists(b) else 'no'))
a0, a1 = wall('Europe/Berlin', 2026, 10, 25, 2, 15, 0), wall('Europe/Berlin', 2026, 10, 25, 2, 15, 1)
print('dst_berlin_autumn_times=' + str(len({a0.utcoffset(), a1.utcoffset()})))
print('dst_newyork_spring_exists=' + ('yes' if exists(wall('America/New_York', 2026, 3, 8, 2, 15)) else 'no'))
print('dst_utc_exists=' + ('yes' if exists(wall('UTC', 2026, 3, 29, 2, 15)) else 'no'))
PY
python3 cron_parse.py
cat > ssh_parse.py << 'PY'
import shlex
cmd = 'ssh -N -L 5433:db.internal:5432 user@bastion'
argv = shlex.split(cmd)
spec = argv[argv.index('-L') + 1]
local_port, host, hostport = spec.split(':')
print('local_port=' + local_port); print('host=' + host); print('hostport=' + hostport)
print('ssh_no_command=' + ('yes' if '-N' in argv else 'no'))
print('ssh_destination=' + argv[-1])
hops = 'bastion1,bastion2'.split(',')
print('ssh_jump_hops=' + str(len(hops)))
PY
python3 ssh_parse.py
out cron_run no; out ssh_run no
out crontab_installed "$(command -v crontab > /dev/null && echo yes || echo no)"; out sshd_installed "$(command -v sshd > /dev/null && echo yes || echo no)"
# flock: a second copy of a job fails fast instead of overlapping (the cron guard)
( exec 9> job.lock; flock -n 9 && { set +e; flock -n job.lock true; second=$?; echo "flock_second=$second"; } ) | sed 's/^/ /' | sed 's/^ //' > flock.out
out flock_second "$(sed -n 's/^flock_second=//p' flock.out)"; check "$(sed -n 's/^flock_second=//p' flock.out)" 1 'a second flock -n exits 1'
set +e; timeout 0.3 sleep 5; timeout_status=$?; set -e
out timeout_status "$timeout_status"; check "$timeout_status" 124 'timeout exits 124'

# ---- 10 · Files, inodes and permissions (Deep dive) --------------------------------------------------
echo data > a; ln a b; ln -s a c
out hard_same_inode "$([ "$(stat -c %i a)" = "$(stat -c %i b)" ] && echo yes || echo no)"; check "$(stat -c %i a)" "$(stat -c %i b)" 'a hard link shares the inode'
out nlink "$(stat -c %h a)"; check "$(stat -c %h a)" 2 'link count 2'
out symlink_other_inode "$([ "$(stat -c %i a)" != "$(stat -c %i c)" ] && echo yes || echo no)"; check "$([ "$(stat -c %i a)" != "$(stat -c %i c)" ] && echo yes || echo no)" yes 'a symlink is its own file'
out stat_L_same "$([ "$(stat -c %i a)" = "$(stat -L -c %i c)" ] && echo yes || echo no)"; check "$(stat -L -c %i c)" "$(stat -c %i a)" 'stat -L follows the link'
(umask 077; touch f077); (umask 022; touch f022)
out umask_077 "$(stat -c %a f077)"; check "$(stat -c %a f077)" 600 'umask 077 -> 600'
out umask_022 "$(stat -c %a f022)"; check "$(stat -c %a f022)" 644 'umask 022 -> 644'
out umask_arith "$(printf '%o' $((0666 & ~022)))"; check "$(printf '%o' $((0666 & ~022)))" 644 '0666 & ~022 = 0644'
out proc_umask "$( (umask 022; sed -n 's/^Umask:[[:space:]]*//p' /proc/self/status) )"; check "$( (umask 022; sed -n 's/^Umask:[[:space:]]*//p' /proc/self/status) )" 0022 'Umask in /proc/self/status'
(umask 027; touch f027)
out umask_027 "$(stat -c %a f027)"; check "$(stat -c %a f027)" 640 'umask 027 -> 640: the group can read'
# the reel's predict: the nightly job writes under umask 077; a loader in the same group cannot read it (needs root + setpriv to be another user)
if [ "$(id -u)" = 0 ] && command -v setpriv > /dev/null; then
  chmod 755 "$W"; gid=$(stat -c %g f077)
  set +e
  setpriv --reuid=65534 --regid="$gid" --clear-groups cat f077 > /dev/null 2>&1; loader_077=$?
  setpriv --reuid=65534 --regid="$gid" --clear-groups cat f027 > /dev/null 2>&1; loader_027=$?
  set -e
  out loader_umask_077 "$loader_077"; check "$loader_077" 1 'a group member cannot read a file written under umask 077'
  out loader_umask_027 "$loader_027"; check "$loader_027" 0 'a group member can read a file written under umask 027'
else out loader_umask_077 skipped; out loader_umask_027 skipped; fi
# directory permissions, as a user who is not root and not the owner
mkdir d; echo hello > d/file; chmod 644 d/file; chmod 755 "$W"
as_other() { if [ "$(id -u)" = 0 ]; then command -v setpriv > /dev/null && setpriv --reuid=65534 --regid=65534 --clear-groups "$@"; else "$@"; fi; }
if [ "$(id -u)" != 0 ] || command -v setpriv > /dev/null; then
  if [ "$(id -u)" != 0 ]; then
    # not root: the owner class applies to us, so mode 400 (read only) and 100 (search only) stand in for "others"
    m_read=400; m_search=100; run() { "$@"; }
  else
    m_read=744; m_search=711; run() { as_other "$@"; }  # as user 65534, who is "other" here
  fi
  chmod $m_read d
  set +e; run ls d > ls1.out 2> /dev/null; ls1=$?; run cat d/file > /dev/null 2> cat1.err; cat1=$?; set -e
  chmod $m_search d
  set +e; run ls d > /dev/null 2>&1; ls2=$?; run cat d/file > /dev/null 2>&1; cat2=$?; set -e
  chmod 755 d
  out dir_read_only_ls "$ls1"; out dir_read_only_cat "$cat1"; out dir_search_only_ls "$ls2"; out dir_search_only_cat "$cat2"
  check "$ls1" 0 'the read bit alone lists the names'; check "$cat1" 1 'without the search bit the file cannot be reached'
  check "$ls2" 2 'the search bit alone does not list'; check "$cat2" 0 'the search bit alone reaches the file'
  grep -q 'Permission denied' cat1.err || { echo "FAIL: no Permission denied" >&2; exit 1; }
  check "$(cat ls1.out)" file 'ls shows the name'
  out dir_search_eacces yes
else
  out dir_search_eacces skipped
fi

# deleting a file needs write on the directory, not on the file
if [ "$(id -u)" != 0 ] || command -v setpriv > /dev/null; then
  mkdir -p rmdir_demo; echo x > rmdir_demo/keep; echo x > rmdir_demo/gone
  if [ "$(id -u)" != 0 ]; then d_deny=500; d_allow=700; else d_deny=755; d_allow=757; chmod 666 rmdir_demo/keep; fi
  chmod 666 rmdir_demo/keep; chmod 000 rmdir_demo/gone
  chmod $d_deny rmdir_demo; set +e; run rm -f rmdir_demo/keep 2> /dev/null; rm_denied=$?; set -e
  chmod $d_allow rmdir_demo; set +e; run rm -f rmdir_demo/gone 2> /dev/null; rm_allowed=$?; set -e
  chmod 755 rmdir_demo
  out rm_needs_dir_w "$([ "$rm_denied" != 0 ] && [ -e rmdir_demo/keep ] && [ "$rm_allowed" = 0 ] && [ ! -e rmdir_demo/gone ] && echo yes || echo no)"
  check "$([ "$rm_denied" != 0 ] && [ -e rmdir_demo/keep ] && [ "$rm_allowed" = 0 ] && [ ! -e rmdir_demo/gone ] && echo yes || echo no)" yes 'a writable file is not enough to delete it; an unreadable one can be deleted from a writable directory'
else
  out rm_needs_dir_w skipped
fi
# root only: the sticky bit (/tmp style) and a setgid directory (a shared landing zone)
if [ "$(id -u)" = 0 ] && command -v setpriv > /dev/null; then
  mkdir sticky_dir; echo x > sticky_dir/rootfile; chmod 1777 sticky_dir; chmod 666 sticky_dir/rootfile
  set +e; as_other rm -f sticky_dir/rootfile 2> /dev/null; sticky_rm=$?; set -e
  out sticky_blocks_delete "$([ -e sticky_dir/rootfile ] && echo yes || echo no)"; check "$([ -e sticky_dir/rootfile ] && echo yes || echo no)" yes 'sticky: others cannot delete a file they do not own'
  chmod 0777 sticky_dir; as_other rm -f sticky_dir/rootfile
  out no_sticky_allows_delete "$([ -e sticky_dir/rootfile ] && echo no || echo yes)"; check "$([ -e sticky_dir/rootfile ] && echo no || echo yes)" yes 'without sticky, the same delete works'
  mkdir team; chgrp 4242 team; chmod 2775 team; touch team/new
  out setgid_dir_group "$(stat -c %g team/new)"; check "$(stat -c %g team/new)" 4242 'a file made in a setgid directory takes the directory group'
  out setgid_dir_mode "$(stat -c %a team)"; check "$(stat -c %a team)" 2775 'the setgid bit shows as the first octal digit'
else
  out sticky_blocks_delete skipped; out setgid_dir_group skipped
fi

# ---- 11 · Small things that bite (Deep dive) ----------------------------------------------------------
cat > small.py << 'PY'
import fcntl, os, tempfile
# a deleted file stays alive while a descriptor is open: the data and the space persist, /proc/<pid>/fd says (deleted)
d = tempfile.mkdtemp()
p = os.path.join(d, 'big.log')
fd = os.open(p, os.O_RDWR | os.O_CREAT, 0o600)
os.write(fd, b'x' * 1000)
os.unlink(p)
print('unlink_target=' + os.readlink(f'/proc/self/fd/{fd}').endswith('(deleted)').__str__())
os.lseek(fd, 0, 0)
print('unlink_still_readable=' + str(len(os.read(fd, 2000))))
os.close(fd); os.rmdir(d)
# write to a temp file, rename over the final name: readers see the old file or the new one
d = tempfile.mkdtemp()
final = os.path.join(d, 'out.csv')
open(final, 'w').write('old\n')
tmp = os.path.join(d, 'out.csv.tmp')
open(tmp, 'w').write('new\n')
os.replace(tmp, final)
print('rename_content=' + open(final).read().strip())
print('rename_tmp_gone=' + str(not os.path.exists(tmp)))
os.unlink(final); os.rmdir(d)
# a pipe is a bounded kernel buffer
r, w = os.pipe()
print('pipe_capacity=' + str(fcntl.fcntl(w, 1032)))  # F_GETPIPE_SZ
os.set_blocking(w, False)
written = 0
try:
    while True:
        written += os.write(w, b'x' * 4096)
except BlockingIOError:
    pass
print('pipe_filled_bytes=' + str(written))
PY
python3 small.py
cat > pgroup.sh << 'SH'
set -m
bash -c 'sleep 30 & sleep 30 & wait' &
leader=$!
sleep 0.3
echo "group_members=$(pgrep -g $leader | wc -l | tr -d ' ')"
kill -TERM -- -$leader
set +e; wait $leader; echo "group_leader_status=$?"; set -e
sleep 0.2
echo "group_left=$(ps -eo pgid=,stat= | awk -v g=$leader '$1 == g && $2 !~ /^Z/' | wc -l | tr -d ' ')"  # zombies awaiting a reaper do not count
SH
bash pgroup.sh
set +e; kill -0 $$; k0=$?; kill -0 999999 2> /dev/null; k1=$?; set -e
out kill_0_self "$k0"; check "$k0" 0 'kill -0 on a live process'
out kill_0_missing "$k1"; check "$k1" 1 'kill -0 on a missing process'
# ---- Deep dive: claims checked after the build (FACT-CHECK.md, post-build table) --------------------
out pipe_buf "$(getconf PIPE_BUF /)"; check "$(getconf PIPE_BUF /)" 4096 'PIPE_BUF is 4096 on Linux'
cat > post.py << 'PY'
import errno, os, re, signal, subprocess, tempfile
# rename(2) across filesystems fails with EXDEV, and mv falls back to copy and delete (only where /dev/shm is another filesystem)
a, b = tempfile.mkdtemp(dir='/dev/shm'), tempfile.mkdtemp()
if os.stat(a).st_dev == os.stat(b).st_dev:
    print('rename_exdev=skipped'); print('mv_cross_fs=skipped')
else:
    src, dst = os.path.join(a, 'f'), os.path.join(b, 'f')
    open(src, 'w').write('x')
    try:
        os.rename(src, dst); print('rename_exdev=no')
    except OSError as e:
        print('rename_exdev=' + ('yes' if e.errno == errno.EXDEV else 'other'))
    r = subprocess.run(['mv', src, dst])
    print('mv_cross_fs=' + ('copied_and_removed' if r.returncode == 0 and os.path.exists(dst) and not os.path.exists(src) else 'failed'))
    os.unlink(dst)
os.rmdir(a); os.rmdir(b)
# a handler is inherited across fork (execve resets handled signals; ignored ones stay ignored)
seen = []
signal.signal(signal.SIGTERM, lambda n, f: seen.append(n))
r, w = os.pipe()
if os.fork() == 0:
    os.kill(os.getpid(), signal.SIGTERM)
    os.write(w, b'handler' if seen else b'none'); os._exit(0)
os.wait()
print('fork_inherits_handler=' + ('yes' if os.read(r, 20) == b'handler' else 'no'))
# /proc/<pid>/fdinfo shows the read offset; /proc/<pid>/io the counters; /proc/<pid>/environ the starting environment
d = tempfile.mkdtemp(); p = os.path.join(d, 'x'); open(p, 'wb').write(b'a' * 1000)
fd = os.open(p, os.O_RDONLY); os.read(fd, 600)
info = open(f'/proc/self/fdinfo/{fd}').read()
print('fdinfo_pos=' + re.search(r'^pos:\s*(\d+)', info, re.M).group(1))
os.close(fd); os.unlink(p); os.rmdir(d)
try:
    io = open('/proc/self/io').read(); print('proc_io_fields=' + ('yes' if all(k in io for k in ('read_bytes:', 'write_bytes:')) else 'no'))
except OSError:
    print('proc_io_fields=unreadable')
env = subprocess.run(['sh', '-c', 'cat /proc/self/environ'], env={'POST_BUILD_MARK': 'on'}, capture_output=True).stdout
print('proc_environ=' + ('yes' if b'POST_BUILD_MARK=on\0' in env else 'no'))
PY
python3 post.py
# tolower is ASCII-only in mawk, str.lower() is not (what the awk step of the lab leaves alone)
out mawk_tolower "$(printf 'ÉA\n' | awk '{ print tolower($0) }')"
out python_lower "$(python3 -c "print('ÉA'.lower())")"
# a wrapper that forwards TERM: trap + background child + wait; wait returns at once with a status above 128, then the trap runs
cat > wrapper.sh << 'SH'
child=
trap 'echo trap_ran; kill -TERM "$child"' TERM
sleep 30 & child=$!
wait "$child"; echo "wait_status=$?"
wait "$child" 2> /dev/null; echo "child_status=$?"
SH
bash wrapper.sh > wrapper.out & wrapper=$!; sleep 0.4; kill -TERM $wrapper; wait $wrapper || true
out wrapper_trap "$(grep -c '^trap_ran$' wrapper.out)"; check "$(grep -c '^trap_ran$' wrapper.out)" 1 'the wrapper trap ran'
wait_status=$(sed -n 's/^wait_status=//p' wrapper.out)
out wrapper_wait_over_128 "$([ "$wait_status" -gt 128 ] && echo yes || echo no)"; check "$([ "$wait_status" -gt 128 ] && echo yes || echo no)" yes 'wait returned above 128 when the trap fired'
# timeout: 124 when it fires; 137 when it had to send KILL (the child ignores TERM; ignored signals survive exec)
set +e; timeout -k 0.3 0.3 bash -c 'trap "" TERM; exec sleep 5'; timeout_kill=$?; set -e
out timeout_kill_status "$timeout_kill"; check "$timeout_kill" 137 'timeout --kill-after: 137'
echo 'all examples ok'
