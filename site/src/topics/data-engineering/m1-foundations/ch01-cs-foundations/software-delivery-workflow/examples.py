"""Every example shown in the "Software delivery workflow" reel, executed and checked.
Run: python3 examples.py (CI runs it too). It runs examples.sh (real pytest, pip, bash, jq, awk and Git in a temp directory),
parses its key=value output, and asserts every number and output the reel shows. examples.sh needs network access to PyPI once:
it installs pytest from a hash-locked requirements file, which is itself one of the examples; everything else is offline.
Versions the examples ran on: Python 3.11, 3.12 and 3.13 (identical output), pip 24.0 (and 26.2.1, see below), pytest 9.1.1,
Git 2.43.0, jq 1.7, mawk 1.3.4, Bash 5.2.21. Not asserted (printed only, they depend on the tool versions): v_* keys, and three
pip-version-dependent keys: ranged_lock_message, ranged_lock_lastweek_installs, prerelease_only_installs.
Not run, by design: GitHub itself (the `uses:` steps and the runner); the workflow's run lines are executed here in
`bash --noprofile --norc -eo pipefail`, the shell GitHub documents for `shell: bash`."""
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent

run = subprocess.run(['bash', str(HERE / 'examples.sh')], check=True, capture_output=True, text=True)
lines = run.stdout.splitlines()
# A spec_* key contains '=' itself (spec_>=1.4=1.4.0 1.5.0): split those at the last '='.
kv = {m[1]: m[2] for m in (re.fullmatch(r'(spec_.+)=([0-9. ]*)', l) or re.fullmatch(r'([^=\s]+)=(.*)', l) for l in lines) if m}
assert lines[-1] == 'ok'

# ---- The running example: the same data and script as the shell refresher -----------------------------------
assert kv['events'] == '10000'
assert kv['data_sha256_12'] == 'e4da3fec4341'

# ---- Step 2 · Review: numbers from Google's engineering practices (eng-practices, retrieved 12 October 2026) ----
# "100 lines is usually a reasonable size for a CL, and 1000 lines is usually too large" (Small CLs);
# "One business day is the maximum time it should take to respond to a code review request" (Speed of Code Reviews);
# six rungs in the order of "What to look for in a code review": design, functionality, complexity, tests, naming/comments, style.
REASONABLE_LINES, TOO_LARGE_LINES, BUSINESS_DAYS, RUNGS = 100, 1000, 1, 6
assert (REASONABLE_LINES, TOO_LARGE_LINES, BUSINESS_DAYS, RUNGS) == (100, 1000, 1, 6)

# ---- Step 3 · A unit test pins the bug ---------------------------------------------------------------------
assert kv['v_pytest'] == '9.1.1'
assert kv['pytest_good_rc'] == '0' and kv['pytest_good'] == '6 passed'
assert kv['pytest_bad_rc'] == '1' and kv['pytest_bad'] == '4 failed, 2 passed'  # 6 = 4 + 2
assert 4 + 2 == 6
assert kv['pytest_bad_ids'].split(';') == [
    'test_clean.py::test_clean_status[SHIPPED -shipped]',
    'test_clean.py::test_clean_status[ refunded-refunded]',
    'test_clean.py::test_clean_email',
    'test_main.py::test_main_counts',
]  # `Paid` still passes: lower() fixes the case; only the padded spellings fail
assert kv['pytest_none_rc'] == '5'  # no tests collected
assert kv['pytest_import_error_rc'] == '2'  # a clean.py that does not import: collection error, exit 2 (not 1)
COMMIT = 731  # the regression of the Git refresher: "clean: simplify normalisation", which drops .strip()
assert COMMIT == 731

# ---- Step 4 · CI: a chain of exit statuses -----------------------------------------------------------------
assert kv['job_good'] == 'pass steps 2'
assert kv['job_bad'] == 'fail step 1 rc 1 skipped 1'  # the test step fails, the diff step is skipped
assert kv['agree_good'] == '0 0' and kv['agree_bad'] == '1 1'  # the unit-test oracle and the pipeline oracle agree
assert kv['bad_py_groups'] == '6' and kv['bad_diff_lines'] == '6'
assert kv['bad_py'] == '5 refunded;1300 cancelled;6000 paid;195 refunded;2490 shipped;10 shipped '
assert 195 + 5 == 200 and 2490 + 10 == 2500  # the bad script splits refunded 200 and shipped 2500
assert kv['agree_nbsp'] == '0 1' and kv['nbsp_job'] == 'fail step 2 rc 1 skipped 0'  # the oracles can disagree
assert kv['nbsp_py_paid'] == '1' and kv['nbsp_shell_groups'] == '5'
assert kv['bisect_by_test'] == kv['bisect_by_diff'] == '784d178 731 10'  # topic 2's history: both oracles name commit 731 in 10 runs
assert kv['lock_pins'] == '5'  # pytest, iniconfig, packaging, pluggy, pygments

# ---- Step 5 · Which shell runs your step? ------------------------------------------------------------------
assert kv['step_default_shell_rc'] == '0'  # no `shell:`: bash -e {0}; the failed jq (exit 2) is hidden by uniq's 0
assert kv['step_shell_bash_rc'] == '2'  # shell: bash: bash --noprofile --norc -eo pipefail {0}; jq's 2 is the step's status
assert kv['multiline_rc'] == '1' and kv['multiline_printed'] == 'line1'  # lines of one run share a shell; -e stops at `false`
assert kv['pipefail_head_rc'] == '141' and 128 + 13 == 141  # Deep dive: an early `| head` under pipefail (SIGPIPE)
WRONG_OPTIONS = (1, 127)  # on screen as wrong answers: no command in the step exits 1, and jq is installed (not "not found")
assert WRONG_OPTIONS == (1, 127)

# ---- Step 6 · Flaky: same code, different verdicts ---------------------------------------------------------
assert kv['flaky_pass_of_20'] == '10' and 20 - 10 == 10
assert kv['sorted_pass_of_20'] == '20'
assert kv['flaky_pattern'] == 'FFPPFFPFFPFFPPPFPPFP' and len(kv['flaky_pattern']) == 20
assert kv['flaky_pattern'].count('P') == 10 and kv['flaky_pattern'].count('F') == 10
assert list(range(0, 20)) == list(range(20))  # PYTHONHASHSEED 0 to 19

# ---- Step 7 · A version number is a promise ----------------------------------------------------------------
assert kv['bump_fix'] == '1.5.1' and kv['bump_feature'] == '1.6.0' and kv['bump_breaking'] == '2.0.0'
assert kv['sort_text'] == '1.10.0 1.9.0 1.9.1 2.0.0' and kv['sort_version'] == '1.9.0 1.9.1 1.10.0 2.0.0'
assert kv['ci_app_error'] == "KeyError: 'status'"  # what 2.0.0 does to a reader of row['status']
assert (1, 5, 0) == (1, 5, 0) and (2, 0, 0) == (2, 0, 0)  # the dial before and after: MAJOR up, MINOR and PATCH reset

# ---- Step 8 · Works on my machine --------------------------------------------------------------------------
assert kv['laptop_installs'] == '1.5.0'  # last week: >=1.4 took the newest, 1.5.0, and the app test passed
assert kv['ci_installs'] == '2.0.0' and kv['ci_app_rc'] == '1'  # today, a clean machine: 2.0.0, the app test fails
assert kv['laptop_rerun_installs'] == 'nothing'  # pip leaves an installed version as-is...
assert kv['laptop_upgrade_installs'] == '2.0.0'  # ...unless --upgrade
assert kv['range_installs'] == '1.5.0'  # shopclean>=1.4,<2
assert kv['compat_installs'] == '1.5.0'  # shopclean~=1.4
assert kv['spec_>=1.4'].split() == ['1.4.0', '1.5.0', '2.0.0', '1.4.9']  # admits 2.0.0
assert kv['spec_>=1.4_<2'].split() == ['1.4.0', '1.5.0', '1.4.9'] and '2.0.0' not in kv['spec_~=1.4'].split()
assert kv['spec_~=1.4.0'].split() == ['1.4.0', '1.4.9']
assert kv['spec_~=0.4'].split() == ['0.4.2', '0.5.0'] and kv['spec_~=0.4.0'].split() == ['0.4.2']  # the 0.y.z trap
assert kv['spec_==1.5.0'] == '1.5.0'
VERSIONS_ON_SHELF = ('1.4.0', '1.5.0', '2.0.0')
assert VERSIONS_ON_SHELF == ('1.4.0', '1.5.0', '2.0.0')

# ---- Step 9 · A lock file freezes the tree -----------------------------------------------------------------
assert kv['wheel_sha256_12'] == 'c939baf79b61'  # first 12 hex characters of shopclean-1.5.0's sha256; equals `pip hash` and sha256sum
assert kv['lock_installs'] == '1.5.0'  # --require-hashes with the lock
assert kv['tamper_rc'] == '1' and kv['tamper_message'] == 'THESE PACKAGES DO NOT MATCH THE HASHES FROM THE REQUIREMENTS FILE'  # a re-published 1.5.0 is refused
assert kv['ranged_lock_rc'] == '1'  # a hashed range is refused too (pip 24.0: not pinned; pip 26.2.1: hash mismatch on 2.0.0)
assert kv['freeze_laptop'] == 'shopclean==1.5.0'
assert kv['v_pytest'] == '9.1.1' and kv['lock_pins'] == '5' and 1 + 4 == 5  # pytest plus iniconfig, packaging, pluggy, pygments
PYTHON_MIN = 3.11  # the lock is refused on 3.10 (pytest 9.1.1 also needs exceptiongroup and tomli there): executed in the fact-check
assert PYTHON_MIN == 3.11

# ---- Step 10 · Recap: the same numbers as above ------------------------------------------------------------
assert (kv['bump_fix'], kv['bump_feature'], kv['bump_breaking']) == ('1.5.1', '1.6.0', '2.0.0')
assert 2 == 2  # `<2`: a library allows below the next major

print('all examples ok')
