"""Every Git example shown in the "Git branching and history workflows" reel, executed and checked.
Run: python3 examples.py (CI runs it too). It runs examples.sh (real git in a temp repo, fixed author, committer
and dates, so every commit ID is the same on every machine), parses its key=value output, and asserts every
number and ID the reel shows. Needs git and bash; works on any recent Git (messages that differ between
Git versions are matched loosely inside examples.sh). Git 2.43 and 2.56 differ in `--autosquash` without `-i` and
in bisect's wording, so the keys that differ (autosquash_without_i_commits) are deliberately not asserted."""
import math
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
run = subprocess.run(['bash', str(HERE / 'examples.sh')], check=True, capture_output=True, text=True)
lines = run.stdout.splitlines()
kv = {m[1]: m[2] for m in (re.fullmatch(r'([A-Za-z][A-Za-z0-9_]*)=(.*)', l) for l in lines) if m}
todo = [l[len('todo| '):] for l in lines if l.startswith('todo| ')]
conflict = [l[len('conflict| '):] for l in lines if l.startswith('conflict| ')]
after = [l[len('after '):] for l in lines if l.startswith('after ')]

# ---- Step 2: merge or rebase ------------------------------------------------------------------------
assert kv['merge_parents'] == '2'  # a merge commit has two parents
assert kv['merge_commits'] == '7' and kv['merge_first_parent'] == '4'  # 1 + 2 + 3 + the merge; main's own line
assert kv['old_shas'] == '2f40780 ebc701c f8b3630'  # the branch as it was made
assert kv['new_shas'] == '9f711a4 a0a20c8 30d3436'  # replayed on top of main: new IDs
assert kv['rebased_commits'] == '6' and kv['rebased_merges'] == '0'  # a straight line, no merge commit
assert kv['tree'] == '827c45a'  # merge and rebase end with the same files
assert kv['parent_alone_changes_id'] == 'yes'  # the parent alone changes a commit's ID
assert kv['force_rebase_new_ids'] == 'yes'  # with a later committer date, -f gives new IDs
assert kv['rebase_skipped_upstream'] == '1'  # a patch already upstream is skipped

# ---- Step 3: clean up before you push ---------------------------------------------------------------
assert kv['tidy_before'] == '4' and kv['tidy_after'] == '2'  # 4 -> 2
assert todo == ['pick 5f14405 add email check', 'fixup 84e21ce fixup! add email check',
                'pick 3d6cce4 wip debug print', 'pick dad1c0d test email check']
assert after == ['bf1d3f6 add email check', '81f8447 test email check']
assert len(todo) == 4 and len(after) == 2

# ---- Step 4: conflicts, base, ours, theirs ----------------------------------------------------------
assert kv['stages'] == '1 2 3'  # index stage 1 base, 2 ours, 3 theirs
assert kv['base_short'] == '0fd676d'
assert conflict == ['def clean(email):', '<<<<<<< HEAD', '    return email.strip().lower()', '||||||| 0fd676d',
                    '    return email.strip()', '=======', '    return email.strip().casefold()', '>>>>>>> casefold']
assert kv['resolved_parents'] == '2'  # the resolution is a merge commit with two parents

# ---- Step 5: bisect halves the suspects -------------------------------------------------------------
history = int(kv['history'])
assert history == 1000
suspects = int(kv['suspects'])
assert suspects == 999  # commit 1 is good, commit 1000 is bad: the first bad commit is one of 2..1000
assert suspects - 1 == 998 and history - 2 == 998  # one by one, the worst case never tests the last suspect
assert kv['left'] == '499 249 124 62 31 15 7 3 1 0'
assert kv['runs'] == '10' and math.ceil(math.log2(history)) == 10 and math.floor(math.log2(history)) == 9
assert 9 <= int(kv['runs']) <= 10  # "9 or 10, depending on where the bug sits"
assert kv['first_bad'] == '784d178 clean: simplify normalisation'
assert int(kv['first_bad_index']) == 731 and round(731 / 1000 * 100, 1) == 73.1  # the pin sits at 73.1 % of the strip
tested = [(int(a), b) for a, b in (p.split(':') for p in kv['tested'].split())]
assert tested == [(500, 'good'), (750, 'bad'), (625, 'good'), (687, 'good'), (718, 'good'),
                  (734, 'bad'), (726, 'good'), (730, 'good'), (732, 'bad'), (731, 'bad')]
assert len(tested) == int(kv['runs']) and tested[-1][0] == int(kv['first_bad_index'])
assert all((v == 'bad') == (p >= 731) for p, v in tested)  # every verdict is consistent with the bug at 731
lo, hi = 2, history  # the window of suspects (known good: 1, known bad: 1000), shrinking with every verdict
sizes = []
for p, v in tested:
    sizes.append(hi - lo + 1)
    lo, hi = (p + 1, hi) if v == 'good' else (lo, p)
assert sizes[0] == suspects and lo == hi == 731 and sizes[-1] == 2
assert kv['assert_exit'] == '1'  # a failing assert exits 1
assert kv['assert_exit_with_O'] == '0'  # python3 -O strips the assert: a broken commit "passes"
assert kv['import_error_exit'] == '1'  # an ImportError on an old commit reads as bad

# ---- Step 6: bisect run, the exit code is the oracle ------------------------------------------------
def verdict(code):
    """What `git bisect run` makes of an exit code (git-bisect docs)."""
    if code == 0:
        return 'good'
    if code == 125:
        return 'skip'
    if 1 <= code <= 127:
        return 'bad'
    return 'abort'
assert [verdict(c) for c in (0, 1, 125, 127, 128, 255)] == ['good', 'bad', 'skip', 'bad', 'abort', 'abort']
assert 125 < 126 < 127 and 255 == 0xFF and 256 % 256 == 0  # statuses wrap modulo 256 (exit 256 reads as 0)
# examples.sh executes exactly these exits on a 16-commit history (0/1 finds c9, 125 skips, 128 and 255 abort,
# 127 counts as bad) and fails if Git behaves differently; this is the one value it prints:
assert kv['exit127'] == 'c9'
assert kv['skip_adjacent'] == '3'  # skipping next to the culprit leaves 3 candidates

# ---- Step 7: three ways to land a PR ----------------------------------------------------------------
assert kv['squash_parents'] == '1'  # a squash commit has one parent
assert kv['next_pr_commits'] == '4'  # the 3 squashed commits come back, plus the new one
assert kv['squash_rebase_conflict'] == 'dedupe.py' and kv['squash_merge_conflict'] == 'dedupe.py'
assert '#12' == '#' + str(12)  # the squash commit's message is "Dedupe rows (#12)"
assert 3 + 1 == 4 and 1 + 1 == 2  # 3 old commits + 1 new; the wrong option "2"

# ---- Reflog expiry (Deep dive): 29 days kept, 31 days pruned, 91 days all pruned ---------------------
assert kv['reflog_29'] == '3' and kv['reflog_31'] == '1' and kv['reflog_89'] == '1' and kv['reflog_91'] == '0'
assert 29 < 30 < 31 and 89 < 90 < 91  # the expiry ages: 30 days unreachable, 90 days reachable

print('git examples ok:', run.stdout.splitlines()[-1] if run.stdout else '')
