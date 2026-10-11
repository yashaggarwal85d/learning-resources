"""Every example shown in the "Linux shell and processes" reel, executed and checked.
Run: python3 examples.py (CI runs it too). It runs examples.sh (the real bash, jq, awk, sed, grep, sort, uniq, diff,
python3, ps and strace in a temp directory), parses its key=value output, and asserts every number the reel shows.
Versions: the examples ran on Bash 5.2.21, jq 1.7, mawk 1.3.4, GNU sed 4.9, grep 3.11, coreutils 9.4, diffutils 3.10,
strace 6.8, procps-ng 4.0.4, Linux 6.18, Python 3.11 (examples.sh prints every tool's version as a v_* key).
Not run, by design: cron (no daemon: the crontab line is parsed against crontab(5)), ssh (no sshd: the -L argument is
parsed), htop, the D state and the OOM killer. Not asserted: PIDs, inode numbers, wait-channel names, kernel stack frames,
load averages and tool versions (printed for the Deep dive's version list)."""
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent

run = subprocess.run(['bash', str(HERE / 'examples.sh')], check=True, capture_output=True, text=True)
lines = run.stdout.splitlines()
kv = {m[1]: m[2] for m in (re.fullmatch(r'([A-Za-z][A-Za-z0-9_]*)=(.*)', l) for l in lines) if m}
assert lines[-1] == 'all examples ok'

# ---- The running example: order_events.jsonl --------------------------------------------------------
assert kv['events'] == '10000'
counts = {'paid': 6000, 'shipped': 2500, 'cancelled': 1300, 'refunded': 200}
assert {k: int(kv[k]) for k in counts} == counts and sum(counts.values()) == 10000
assert kv['dirty'] == '40' and 25 + 10 + 5 == 40  # 25 'Paid', 10 'SHIPPED ', 5 ' refunded'
assert kv['refunded_pct'] == '2' and 200 * 100 // 10000 == 2  # 2 % refunded

# ---- Step 2: fork, exec, wait -----------------------------------------------------------------------
assert kv['clean_exit'] == '0'  # python3 clean.py order_events.jsonl: $? = 0
assert kv['fork_child_sees'] == '0' and kv['fork_parent_sees_pid'] == 'yes'  # fork returns 0 in the child, the child's PID in the parent
assert kv['wexit'] == '42' and kv['wexited'] == 'True'  # the parent collects the status the child exited with
assert kv['wsignaled'] == 'True' and kv['wtermsig'] == '9' and kv['python_sees_kill'] == '-9'
assert kv['kill_status'] == '137' and 128 + 9 == 137  # the shell's view of the same death
assert kv['exec_keeps_pid'] == 'yes'
assert (0, 1, 2) == (0, 1, 2)  # the three files every child starts with: standard input, output, error

# ---- Step 3: where did the error go? ----------------------------------------------------------------
assert kv['out_log_lines'] == '0' and kv['terminal_lines'] == '1'  # 2>&1 > out.log: the error stays on the terminal
assert kv['out2_log_lines'] == '1'  # > out.log 2>&1: both streams in the file
assert kv['error_text'] == 'clean.py: cannot open missing.jsonl'
assert kv['append_lines'] == '8'  # >> appends: two runs of four lines

# ---- Step 4: a pipeline exits with its last command -------------------------------------------------
assert kv['pipe_status'] == '0'
assert kv['jq_missing'] == '2'
assert kv['pipefail_status'] == '2'
assert kv['pipestatus'] == '2 0 0'
assert kv['rightmost_nonzero'] == '4'  # (exit 3) | (exit 4) | true under pipefail
assert kv['pipefail_head'] == '141' and 128 + 13 == 141 and kv['pipefail_head_pipestatus'] == '141 0'
assert kv['nopipefail_head'] == '0'
assert kv['errexit_alone_continues'] == 'yes' and kv['errexit_pipefail_status'] == '2'
assert kv['nounset_status'] == '1' and kv['nounset_message'] == 'unbound_variable'
assert kv['subshell_count'] == '0' and kv['lastpipe_count'] == '2'
# dash_pipefail_status (printed only): dash 0.5.12 has no pipefail; a newer dash may

# ---- Step 5: exit codes -----------------------------------------------------------------------------
assert kv['kill_9'] == '137' and kv['kill_15'] == '143' and kv['kill_2'] == '130' and kv['kill_1'] == '129'
assert (128 + 9, 128 + 15, 128 + 2, 128 + 1) == (137, 143, 130, 129)
assert kv['not_executable'] == '126' and kv['perm_mode'] == '644' and kv['perm_string'] == 'rw-r--r--'
assert kv['not_found'] == '127'
assert kv['python_missing_file'] == '2'  # python3 is found; the file is not: 2, not 127
assert kv['directory'] == '126'
assert kv['exit_300'] == '44' and 300 % 256 == 44 and kv['exit_neg1'] == '255'
if kv['v_bash'].startswith('5.2'):
    assert kv['missing_interpreter'] == '127'
assert kv['signal_numbers'] == '1 2 9 15'
assert kv['bisect_bands'] == '0 1 125 126 127 128 255'
assert (0, 1, 125, 126, 127, 128, 255) == tuple(int(x) for x in kv['bisect_bands'].split())
assert 255 - 0 + 1 == 256  # one byte
assert 125 + 1 == 126  # bisect's skip sits just under the shell's own codes

# ---- Step 6: TERM asks; KILL doesn't ----------------------------------------------------------------
assert kv['handled_term'] == '0' and kv['handler_line'] == 'flushed and closed'
assert kv['killed'] == '137' and kv['plain_term'] == '143'
assert kv['zombie_state'] == 'Z' and kv['zombie_word'] == 'zombie' and '<defunct>' in kv['zombie_ps'] and kv['zombie_comm'] == 'true'
assert kv['zombie_fds'] in ('0', 'unreadable') and kv['zombie_gone'] == 'yes'
assert kv['orphan_parent_was_middle'] == 'yes' and kv['orphan_reparented'] == 'yes' and kv['orphan_new_ppid_is_parent_process'] == 'no'

# ---- Step 7: a load job hangs -----------------------------------------------------------------------
assert kv['hung_state'] == 'S' and kv['hung_threads'] == '2' and kv['hung_fd4'] == 'socket'
assert kv['hung_wchan'] not in ('', '0')  # the name depends on the kernel: wait_woken on Linux 6.18
assert kv['hung_ps_stat'].startswith('S') and kv['hung_ps_threads'] == '2'  # STAT reads Sl: S plus the multi-threaded flag
assert kv['hung_ps_L'].count(';') == 1 and kv['hung_ps_L'].count('Sl') == 2  # two threads, both sleeping
assert kv['strace_read'] in ('read(4,', 'skipped')  # skipped only where ptrace is refused (Yama scope 2, a seccomp profile)
if kv['strace_read'] == 'read(4,':
    assert kv['strace_line'].startswith('read(4,') and ')' not in kv['strace_line'].split('<detached')[0]  # the call never returned
assert kv['hung_term'] == '143'
assert kv['ps_columns'] == 'PID PPID STAT WCHAN ELAPSED RSS %CPU COMMAND'
assert kv['loadavg_fields'] == '5'
assert kv['htop_installed'] in ('yes', 'no')  # named, never relied on

# ---- Step 8: one pipeline, one script ---------------------------------------------------------------
assert kv['diff_exit'] == '0' and kv['diff_lines'] == '0'
assert [kv[f'uniq_line_{i}'] for i in (1, 2, 3, 4)] == ['   1300 cancelled', '   6000 paid', '    200 refunded', '   2500 shipped']  # byte order, as uniq -c prints them
assert kv['raw_groups'] == '7' and 7 - 4 == 3 and kv['diff_raw_exit'] == '1'
assert kv['count_order_by_count'] == '6000 paid'
assert kv['awk_only_diff'] == '0'
assert kv['jq_groups_raw'] == '7' and kv['jq_groups_clean'] == '4'
assert kv['jq_c_lines'] == '10000' and kv['sed_extracted'] == '10000'
assert kv['grep_count'] == '1495' and kv['true_count'] == '1500' and 1500 - 1495 == 5  # five ' refunded' events
assert kv['refunded_select'] == '195' and 200 - 5 == 195
assert kv['jq_exit_parse_error'] == '5' and kv['jq_exit_compile'] == '3' and kv['jq_exit_null'] == '0'
assert kv['jq_exit_e_null'] == '1' and kv['jq_exit_e_empty'] == '4'
assert kv['grep_exit_none'] == '1' and kv['grep_exit_match'] == '0' and kv['grep_exit_error'] == '2'
assert kv['jq_arg'] == '3'
assert kv['grep_dot_regex'] == '2' and kv['grep_dot_fixed'] == '1'
assert kv['awk_fields'] == '2' and kv['awk_rebuild'] == '[a b]'
assert kv['sed_inplace'] == 'y (was x)'

# ---- Deep dive: the rest of the toolbox -------------------------------------------------------------
assert kv['amp_redirect_lines'] == '1' and kv['pipe_amp_lines'] == '1'  # &> and |& carry stderr too
assert kv['noclobber_status'] == '1' and kv['noclobber_override'] == '0 forced'
assert kv['builtin_usage_status'] == '2'
assert kv['sed_E'] == '1 2 ' and kv['sed_z'] == 'Xa Xb ' and kv['sed_s_lines'] == '2 1'
assert kv['grep_binary'] == '1' and kv['grep_binary_stdout_lines'] == '0' and kv['grep_a_lines'] == '2'
assert kv['jq_default'] == 'x' and kv['jq_tsv_tab'] == '1' and kv['jq_argjson'] == '6' and kv['jq_stream_events'] == '4'

# ---- Step 9: cron and ssh (parsed, not run) ---------------------------------------------------------
assert kv['cron_minute'] == '15' and kv['cron_hour'] == '2' and kv['cron_runs_per_day'] == '1'  # 15 2 * * *: 02:15 every day
assert kv['cron_command_streams'] == 'both'
assert kv['cron_due_0215'] == 'yes' and kv['cron_due_0216'] == 'no'
assert kv['cron_either_day_friday'] == 'yes' and kv['cron_either_day_13th'] == 'yes' and kv['cron_either_day_other'] == 'no'  # both day fields restricted: either matches
assert kv['dst_berlin_spring_exists'] == 'no' and kv['dst_berlin_autumn_times'] == '2' and kv['dst_newyork_spring_exists'] == 'no' and kv['dst_utc_exists'] == 'yes'
assert kv['local_port'] == '5433' and kv['host'] == 'db.internal' and kv['hostport'] == '5432'
assert kv['ssh_no_command'] == 'yes' and kv['ssh_destination'] == 'user@bastion' and kv['ssh_jump_hops'] == '2'
assert kv['cron_run'] == 'no' and kv['ssh_run'] == 'no'
assert kv['flock_second'] == '1' and kv['timeout_status'] == '124'
assert (5 - 1, 5) == (4, 5)  # five time fields

# ---- Deep dive: files, inodes, permissions ----------------------------------------------------------
assert kv['hard_same_inode'] == 'yes' and kv['nlink'] == '2' and kv['symlink_other_inode'] == 'yes' and kv['stat_L_same'] == 'yes'
assert kv['umask_077'] == '600' and kv['umask_022'] == '644' and kv['umask_arith'] == '644' and kv['proc_umask'] == '0022'
if kv['dir_search_eacces'] != 'skipped':
    assert (kv['dir_read_only_ls'], kv['dir_read_only_cat'], kv['dir_search_only_ls'], kv['dir_search_only_cat']) == ('0', '1', '2', '0')

assert kv['rm_needs_dir_w'] in ('yes', 'skipped')  # deleting needs write on the directory, not on the file
assert kv['sticky_blocks_delete'] in ('yes', 'skipped')  # root-only demos: skipped for a normal user
if kv['sticky_blocks_delete'] == 'yes':
    assert kv['no_sticky_allows_delete'] == 'yes' and kv['setgid_dir_group'] == '4242' and kv['setgid_dir_mode'] == '2775'

# ---- Deep dive: small things that bite --------------------------------------------------------------
assert kv['unlink_target'] == 'True' and kv['unlink_still_readable'] == '1000'
assert kv['rename_content'] == 'new' and kv['rename_tmp_gone'] == 'True'
assert kv['pipe_capacity'] == '65536' and kv['pipe_filled_bytes'] == '65536' and 64 * 1024 == 65536
assert int(kv['group_members']) >= 3 and kv['group_leader_status'] == '143' and kv['group_left'] == '0'
assert kv['kill_0_self'] == '0' and kv['kill_0_missing'] == '1'

print('shell examples ok on', kv['v_bash'].split('(')[0], '|', kv['v_jq'], '|', kv['v_awk'].split(' 2')[0], '|', kv['v_strace'], '|', kv['v_ps'], '| kernel', kv['v_kernel'])
