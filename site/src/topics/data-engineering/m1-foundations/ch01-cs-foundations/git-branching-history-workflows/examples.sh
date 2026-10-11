#!/usr/bin/env bash
# Every Git example in the "Git branching and history workflows" refresher, run with real git in a temp repo.
# Run: bash examples.sh (examples.py runs it and re-asserts every number the reel shows).
# Author, committer and dates are fixed, so every commit ID below is the same on every machine.
set -euo pipefail
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 LC_ALL=C
export GIT_AUTHOR_NAME=Ada GIT_AUTHOR_EMAIL=ada@example.com GIT_COMMITTER_NAME=Ada GIT_COMMITTER_EMAIL=ada@example.com
export GIT_AUTHOR_DATE='2026-01-01T12:00:00Z' GIT_COMMITTER_DATE='2026-01-01T12:00:00Z'
W=$(mktemp -d); trap 'rm -rf "$W"' EXIT
check() { [ "$1" = "$2" ] || { echo "FAIL: $3: got '$1', expected '$2'" >&2; exit 1; }; }
out() { echo "$1=$2"; }
short() { git rev-parse --short=7 "$1"; }
parents() { git rev-list --parents -n1 "$1" | awk '{print NF-1}'; }
c() { git add -A; git commit -q -m "$1"; }

cd "$W"; git init -q -b main repo; cd repo
git config advice.detachedHead false
# The Git that runs this script. examples.py asserts the keys that differ between versions per version.
out git_version "$(git --version | awk '{print $3}')"

# ---- Step "Merge or rebase": the same fork, integrated both ways ------------------------------------
printf 'def clean(email):\n    return email.strip()\n' > clean.py; c 'add clean.py'
git switch -q -c dedupe
printf 'def dedupe(rows):\n    return list(dict.fromkeys(rows))\n' > dedupe.py; c 'add dedupe'
printf '# keeps the first occurrence\n' >> dedupe.py; c 'document dedupe'
printf 'from dedupe import dedupe\nassert dedupe(["a", "a"]) == ["a"]\n' > test_dedupe.py; c 'test dedupe'
git switch -q main
echo '# cleaning' > README.md; c 'add README'
echo '3.14' > .python-version; c 'pin python'
OLD=$(git rev-list --reverse main..dedupe | cut -c1-7 | tr '\n' ' ' | sed 's/ $//')
OLD_TIP=$(git rev-parse dedupe)
# merge, as GitHub's default merge button does (--no-ff)
git switch -q -c merged main
git merge -q --no-ff -m 'Merge branch dedupe' dedupe
out merge_parents "$(parents HEAD)"; check "$(parents HEAD)" 2 'a merge commit has both tips as parents'
git merge-base --is-ancestor "$OLD_TIP" HEAD   # the feature commits are kept as they were
out merge_commits "$(git rev-list --count HEAD)"            # 7: 1 + 2 main + 3 feature + the merge
out merge_first_parent "$(git rev-list --first-parent --count HEAD)"  # 4: main's own line
MERGE_TREE=$(git rev-parse 'HEAD^{tree}')
# rebase the same branch onto main
git switch -q -c rebased dedupe
git rebase -q main
NEW=$(git rev-list --reverse main..HEAD | cut -c1-7 | tr '\n' ' ' | sed 's/ $//')
out old_shas "$OLD"; out new_shas "$NEW"
[ "$OLD" != "$NEW" ]
out rebased_commits "$(git rev-list --count HEAD)"; out rebased_merges "$(git rev-list --merges --count HEAD)"
check "$(git rev-parse 'HEAD^{tree}')" "$MERGE_TREE" 'merge and rebase end with the same files'
out tree "$(git rev-parse --short=7 'HEAD^{tree}')"
# same dates and author: the new ID comes from the new parent
check "$(git log -1 --format='%ad %cd' HEAD)" "$(git log -1 --format='%ad %cd' "$OLD_TIP")" 'dates unchanged'
check "$(git show HEAD | git patch-id --stable | cut -d' ' -f1)" "$(git show "$OLD_TIP" | git patch-id --stable | cut -d' ' -f1)" 'same patch-id'
check "$(git rev-parse rebased@{1})" "$OLD_TIP" 'the old tip is still in the reflog'
# a rebase onto what the branch already sits on replays nothing
BEFORE=$(git rev-parse HEAD); git rebase -q main; check "$(git rev-parse HEAD)" "$BEFORE" 'no-op rebase keeps IDs'
# The ID covers the parent on its own: same tree, message, author and dates, different parent -> different ID.
# (In the rebase above the tree changed too: the replayed commits also contain main's files.)
T=$(git rev-parse 'HEAD^{tree}')
[ "$(git commit-tree "$T" -p main -m same </dev/null)" != "$(git commit-tree "$T" -p main~1 -m same </dev/null)" ]
out parent_alone_changes_id yes
# Caveat for this script: dates are pinned, so even --force-rebase rebuilds byte-identical commits here.
# A real rebase stamps the current time as committer date (the author date is kept), so -f gives new IDs.
git rebase -q --force-rebase main; check "$(git rev-parse HEAD)" "$BEFORE" 'pinned dates: -f rebuilds identical commits'
GIT_COMMITTER_DATE='2026-01-02T12:00:00Z' git rebase -q --force-rebase main
[ "$(git rev-parse HEAD)" != "$BEFORE" ]
check "$(git log -1 --format=%ad HEAD)" "$(git log -1 --format=%ad "$BEFORE")" '-f keeps the author date'
[ "$(git log -1 --format=%cd HEAD)" != "$(git log -1 --format=%cd "$BEFORE")" ]
out force_rebase_new_ids yes
# A commit whose patch is already upstream (same patch-id) is skipped by rebase.
git switch -q -c up main; git cherry-pick dedupe~2 >/dev/null     # upstream takes 'add dedupe' on its own
git switch -q -c dd dedupe
git rebase up > "$W/skip.txt" 2>&1
grep -q 'skipped previously applied commit' "$W/skip.txt"
out rebase_skipped_upstream "$(( 3 - $(git rev-list --count up..dd) ))"   # 1 skipped, 2 replayed
check "$(git rev-list --count up..dd)" 2 'the already-upstream commit is not replayed'

# ---- Step "Clean up before you push": interactive rebase with autosquash -----------------------------
git switch -q -c emails main
printf 'def valid(email):\n    return "@" in emial\n' > check.py; c 'add email check'
echo 'print("debug")' > debug.py; c 'wip debug print'
printf 'def valid(email):\n    return "@" in email\n' > check.py; git add -A; git commit -q --fixup=HEAD~1
printf 'from check import valid\nassert valid("a@x")\n' > test_check.py; c 'test email check'
out tidy_before "$(git rev-list --count main..emails)"
git log --reverse --format='pick %h %s' main..emails
# The "editor" saves the todo list Git proposes, then drops the debug commit (what you'd do by hand).
printf '#!/bin/sh\ncp "$1" "%s/todo"\nsed -i -e "/wip debug print/s/^pick/drop/" "$1"\n' "$W" > "$W/edit-todo.sh"; chmod +x "$W/edit-todo.sh"
GIT_SEQUENCE_EDITOR="$W/edit-todo.sh" git rebase -q -i --autosquash main
# [version] Git 2.43 writes "pick <id> <subject>"; Git 2.56 writes "pick <id> # <subject>" (the subject is a comment).
# Printed as Git wrote it; examples.py accepts both and asserts the form per known version.
if grep -Eq '^pick [0-9a-f]+ # ' "$W/todo"; then out todo_subject_comment yes; else out todo_subject_comment no; fi
grep -v '^#' "$W/todo" | grep . | sed 's/^/todo| /'
check "$(grep -v '^#' "$W/todo" | grep . | awk '{print $1}' | tr '\n' ' ')" 'pick fixup pick pick ' 'autosquash moved and re-labelled the fixup'
out tidy_after "$(git rev-list --count main..emails)"
git log --reverse --format='after %h %s' main..emails
check "$(git rev-list --count main..emails@{1})" 4 'the pre-rebase branch is one reflog entry back'
git show emails:check.py | grep -q 'in email$'
# --exec runs a command after each rebuilt commit: every commit on the branch passes the test
: > "$W/exec.log"
git rebase -q -x "python3 -c 'import check' && echo ran >> '$W/exec.log'" main >/dev/null 2>&1
check "$(wc -l < "$W/exec.log" | tr -d ' ')" 2 '--exec ran once after each of the 2 commits'
# [version] --autosquash without -i: ignored on Git 2.43 (3 commits stay), honoured from Git 2.44 (2).
# Printed, not asserted: the result depends on the Git that runs this script.
git switch -q -c as main; echo x > x.txt; c 'add x'; echo y > y.txt; c 'add y'
echo x2 > x.txt; git add -A; git commit -q --fixup=HEAD~1
git rebase -q --autosquash main >/dev/null 2>&1
out autosquash_without_i_commits "$(git rev-list --count main..as)"

# ---- Step "Conflicts": both sides changed the same line --------------------------------------------
git switch -q -c lower main;    sed -i 's/email.strip()/email.strip().lower()/'    clean.py; c 'lower-case emails'
git switch -q -c casefold main; sed -i 's/email.strip()/email.strip().casefold()/' clean.py; c 'casefold emails'
git switch -q lower
git config merge.conflictStyle zdiff3
if git merge -q casefold -m 'Merge casefold' 2>/dev/null; then echo 'expected a conflict' >&2; exit 1; fi
out stages "$(git ls-files -u clean.py | awk '{print $3}' | tr '\n' ' ' | sed 's/ $//')"   # 1 2 3
out base_short "$(git rev-parse --short=7 "$(git merge-base HEAD casefold)")"
sed 's/^/conflict| /' clean.py
git show :1:clean.py | grep -q 'email.strip()$'
git show :2:clean.py | grep -q 'lower()'
git show :3:clean.py | grep -q 'casefold()'
printf 'def clean(email):\n    return email.strip().casefold()\n' > clean.py
git add clean.py; GIT_EDITOR=: git merge --continue >/dev/null
out resolved_parents "$(parents HEAD)"
# during a rebase the sides are swapped: "theirs" is your own branch
git switch -q -c lower2 lower~1
if git rebase -q casefold 2>/dev/null; then echo 'expected a conflict' >&2; exit 1; fi
git show :2:clean.py | grep -q 'casefold()'   # ours = upstream being rebased onto
git show :3:clean.py | grep -q 'lower()'      # theirs = the commit being replayed (yours)
git rebase --abort
# ...and "ours" is the so-far rebased series: at your 2nd commit it already holds your 1st, replayed.
git switch -q -c up2 main; printf 'u1\nu2\n' > f.txt; c 'up: f'
git switch -q -c mine2 main; printf 'm1\nx\n' > f.txt; c 'mine: 1'; printf 'm1\nm2\n' > f.txt; c 'mine: 2'
if git rebase -q up2 >/dev/null 2>&1; then echo 'expected a conflict' >&2; exit 1; fi
printf 'u1-m1\nu2\n' > f.txt; git add f.txt; if GIT_EDITOR=: git rebase --continue >/dev/null 2>&1; then echo 'expected a 2nd conflict' >&2; exit 1; fi
check "$(git show :2:f.txt | head -1)" 'u1-m1' 'ours at commit 2 = upstream + your replayed commit 1'
git rebase --abort
# Neighbouring lines conflict too: base a b c, one side changes line 1, the other line 2. Two lines apart merges cleanly.
git switch -q -c adj-base main; printf 'a\nb\nc\nd\n' > adj.txt; c 'adj base'
git switch -q -c adj-1 adj-base; printf 'A\nb\nc\nd\n' > adj.txt; c 'adj: line 1'
git switch -q -c adj-2 adj-base; printf 'a\nB\nc\nd\n' > adj.txt; c 'adj: line 2'
git switch -q -c adj-3 adj-base; printf 'a\nb\nC\nd\n' > adj.txt; c 'adj: line 3'
git switch -q adj-1
if git merge -q --no-edit adj-2 >/dev/null 2>&1; then echo 'expected a conflict' >&2; exit 1; fi
out adjacent_conflict_stages "$(git ls-files -u adj.txt | awk '{print $3}' | tr '\n' ' ' | sed 's/ $//')"   # 1 2 3
git merge --abort
git merge -q --no-edit adj-3 >/dev/null 2>&1; out two_apart_merges_clean yes
# rerere: record a resolution once, replay it next time
git config rerere.enabled true
git switch -q -c rr lower~1
git merge -q casefold -m m 2>/dev/null || true
printf 'def clean(email):\n    return email.strip().casefold()\n' > clean.py; git add clean.py; GIT_EDITOR=: git merge --continue >/dev/null
git reset -q --hard HEAD~1
git merge -q casefold -m m >/dev/null 2>&1 || true
grep -q 'casefold()$' clean.py && ! grep -q '<<<<<<<' clean.py         # resolved from the recording
check "$(git diff --name-only --diff-filter=U)" clean.py 'rerere leaves the index alone'
git merge --abort; git config rerere.enabled false

# ---- Step "Landing a PR": squash and merge, then reuse the branch ----------------------------------
git switch -q -c squashed main
git merge -q --squash dedupe >/dev/null; git commit -q -m 'Dedupe rows (#12)'
out squash_parents "$(parents HEAD)"                               # 1: a plain commit, no merge
git switch -q dedupe
echo '# handles None' >> dedupe.py; c 'dedupe: handle None'
out next_pr_commits "$(git rev-list --count squashed..dedupe)"     # 4, of which 1 is new
if git rebase -q squashed >/dev/null 2>&1; then echo 'expected a conflict' >&2; exit 1; fi
out squash_rebase_conflict "$(git diff --name-only --diff-filter=U)"
git rebase --abort
# Merging it (what the PR's merge button would do) conflicts too: GitHub would flag the new PR as conflicted,
# while still listing its 4 commits.
git switch -q -c trymerge squashed
if git merge -q --no-ff -m try dedupe >/dev/null 2>&1; then echo 'expected a conflict' >&2; exit 1; fi
out squash_merge_conflict "$(git diff --name-only --diff-filter=U)"
git merge --abort
git switch -q squashed
if git branch -d dedupe >/dev/null 2>&1; then echo 'expected "not fully merged"' >&2; exit 1; fi
# Nuance: a squash of a ONE-commit PR has that commit's patch-id, so rebasing the reused branch drops it cleanly.
git switch -q -c one main; echo z > z.txt; c 'add z'
git switch -q -c sq1 main; git merge -q --squash one >/dev/null; git commit -q -m 'Add z (#13)'
git switch -q one; echo w > w.txt; c 'add w'
check "$(git rev-list --count sq1..one)" 2 'one-commit squash, reused: next PR shows 2'
git rebase -q sq1 >/dev/null 2>&1
check "$(git rev-list --count sq1..one)" 1 'rebase drops the squashed one-commit patch'

# ---- Step "bisect": 1,000 commits, a regression planted at commit 731 -------------------------------
cd "$W"; git init -q -b main big; cd big; git config advice.detachedHead false
N=1000; BAD=731
{
  for i in $(seq 1 $N); do
    msg="change $i"; body='def clean(email):\n    return email.strip().lower()\n'
    [ "$i" -ge $BAD ] && body='def clean(email):\n    return email.lower()\n'
    [ "$i" -eq $BAD ] && msg='clean: simplify normalisation'
    content=$(printf "$body")
    printf 'commit refs/heads/main\nmark :%d\ncommitter Ada <ada@example.com> 1767268800 +0000\ndata %d\n%s\n' "$i" $((${#msg} + 1)) "$msg"
    [ "$i" -gt 1 ] && printf 'from :%d\n' $((i - 1))
    printf 'M 100644 inline clean.py\ndata %d\n%s\n' $((${#content} + 1)) "$content"
    printf 'M 100644 inline CHANGES\ndata %d\n%s\n' $((${#i} + 1)) "$i"
  done
} | git fast-import --quiet
git checkout -q main
out history "$(git rev-list --count HEAD)"
# The oracle lives outside the repository (the bisect docs' advice); a failing assert exits with 1.
cat > "$W/test_clean.py" <<'EOF'
import sys
sys.path.insert(0, '.')
from clean import clean
assert clean('  Ada@Example.COM ') == 'ada@example.com'
EOF
set +e; python3 "$W/test_clean.py" 2>/dev/null; RC=$?; set -e
out assert_exit "$RC"; check "$RC" 1 'a failing assert exits with 1'
# Oracle pitfalls: python3 -O strips asserts (the broken commit "passes": 0), and a crash for an unrelated
# reason (here an ImportError, run where there is no clean.py) also exits 1, which bisect reads as "bad".
set +e; python3 -O "$W/test_clean.py" 2>/dev/null; RC_O=$?; (cd "$W" && python3 "$W/test_clean.py" 2>/dev/null); RC_IMP=$?; set -e
check "$RC_O" 0 'python3 -O: asserts are stripped'; check "$RC_IMP" 1 'an ImportError exits 1 too'
out assert_exit_with_O "$RC_O"; out import_error_exit "$RC_IMP"
ROOT1=$(git rev-list --max-parents=0 HEAD)
out suspects "$(git rev-list --count HEAD ^"$ROOT1")"     # 999: commits 2..1000; one by one that is up to 998 tests
git bisect start HEAD "$ROOT1" > "$W/start.txt"
git bisect run python3 "$W/test_clean.py" > "$W/run.txt" 2>&1     # the command the reel shows
out left "$(cat "$W/start.txt" "$W/run.txt" | sed -n 's/^Bisecting: \([0-9]*\) revisions\{0,1\} left.*/\1/p' | tr '\n' ' ' | sed 's/ $//')"
out runs "$(grep -c '^running ' "$W/run.txt")"                       # one 'running' line per test
# [version] "is the first bad commit" on 2.43, "is the first 'bad' commit" from 2.55 (hash dropped: it is the full 40 characters)
out first_bad_line "$(grep ' is the first ' "$W/run.txt" | sed 's/^[0-9a-f]* //')"
out first_bad "$(git log -1 --format='%h %s' refs/bisect/bad)"
check "$(git log -1 --format=%s refs/bisect/bad)" 'clean: simplify normalisation' 'bisect found the planted commit'
out first_bad_index "$(git rev-list --count refs/bisect/bad)"     # 731
# Which commits it tested, as positions in history (1 = oldest), and the verdict: the path the reel draws.
out tested "$(git bisect log | sed -n 's/^git bisect \(good\|bad\) \([0-9a-f]*\)$/\1 \2/p' \
  | while read -r v h; do printf '%s:%s ' "$(git rev-list --count "$h")" "$v"; done | sed 's/ $//')"
git bisect reset >/dev/null 2>&1

# ---- Step "bisect run": what the exit code means ------------------------------------------------
cd "$W"; git init -q -b main small; cd small; git config advice.detachedHead false
for i in $(seq 1 16); do echo "$i" > n; git add n; git commit -q -m "c$i"; done   # bad from c9 on
ROOT=$(git rev-list --max-parents=0 HEAD)
bis() { git bisect start HEAD "$ROOT" >/dev/null; set +e; git bisect run sh -c "$1" > "$W/b.txt" 2>&1; local rc=$?; set -e
        local found; found=$(git log -1 --format=%s refs/bisect/bad); git bisect reset >/dev/null 2>&1; echo "$rc $found"; }
check "$(bis '[ $(cat n) -lt 9 ]')" '0 c9' 'exit 0 good, 1 bad'
check "$(bis 'n=$(cat n); [ $n -eq 10 ] && exit 125; [ $n -lt 9 ]')" '0 c9' '125 skips one commit'
R=$(bis 'n=$(cat n); [ $n -eq 8 -o $n -eq 9 ] && exit 125; [ $n -lt 9 ]'); grep -q 'We cannot bisect more' "$W/b.txt"
out skip_adjacent "$(grep -c '^[0-9a-f]\{40\}$' "$W/b.txt")"      # candidates it can't tell apart
# Message wording is version-sensitive: 2.43 says "bogus exit code 127 for good revision", 2.56's source
# "bogus exit code %d for '%s' revision" (the term in quotes); the patterns below accept both.
R=$(bis 'n=$(cat n); [ $n -lt 9 ] || exit 255'); grep -q 'exit code 255 .*>= 128' "$W/b.txt"; check "${R%% *}" 1 '255 aborts'
R=$(bis 'n=$(cat n); [ $n -lt 9 ] || exit 128'); grep -q 'exit code 128 .*>= 128' "$W/b.txt"; [ "${R%% *}" != 0 ]   # aborts (git's own status here is not 1)
# A crash by signal ends the test command with 128 plus the signal number (shell convention), which aborts too.
R=$(bis 'n=$(cat n); [ $n -lt 9 ] || kill -SEGV $$'); grep -q 'exit code 139 .*>= 128' "$W/b.txt"; [ "${R%% *}" != 0 ]
R=$(bis 'n=$(cat n); [ $n -lt 9 ] || exit 127'); out exit127 "${R#* }"   # 127 counts as bad when the good commit passes
R=$(bis 'no_such_test_command'); grep -Eq "bogus exit code 127 for '?good'? revision" "$W/b.txt"; check "${R%% *}" 1 'missing command stops'
R=$(bis 'exit 126'); grep -Eq "bogus exit code 126 for '?good'? revision" "$W/b.txt"   # same first-run check for 126
# Statuses wrap modulo 256 ("chopped with & 0377"): exit 256 reads as 0 (good), exit(-1) as 255 (abort).
set +e; sh -c 'exit 256'; E256=$?; python3 -c 'import sys; sys.exit(-1)'; EM1=$?; set -e
check "$E256" 0 'exit 256 wraps to 0'; check "$EM1" 255 'exit(-1) shows as 255'
# The pytest wrapper from the Deep dive: pytest exits 0 (passed) or 1 (tests failed); 2, 3, 4 and 5 (interrupted, internal
# error, usage error, no tests collected) are not verdicts about the code, so the wrapper turns them into 125 (skip).
wrap() { "$@"; local rc=$?; if [ "$rc" -le 1 ]; then return "$rc"; else return 125; fi; }
V=""; for code in 0 1 2 3 4 5; do set +e; wrap sh -c "exit $code"; V="$V$? "; set -e; done
check "$V" '0 1 125 125 125 125 ' 'the wrapper keeps 0 and 1 and skips everything else'
out wrapper_verdicts "${V% }"
# --first-parent: a merged branch introduced the bug; first-parent bisect blames the merge
cd "$W"; git init -q -b main fp; cd fp; git config advice.detachedHead false
echo ok > f; c m1; c2() { echo x > "f_$(printf %s "$1" | tr -c "a-z0-9" _)"; c "$1"; }
c2 m2; git switch -q -c side; c2 'side: refactor'; echo bug >> f; c 'side: bug'; c2 'side: docs'
git switch -q main; c2 m3; git merge -q --no-ff -m 'Merge side' side; c2 m4
G=$(git rev-list --max-parents=0 HEAD)
fb() { git bisect start "$@" HEAD "$G" >/dev/null; git bisect run sh -c '! grep -q bug f' >/dev/null 2>&1; git log -1 --format=%s refs/bisect/bad; git bisect reset >/dev/null 2>&1; }
check "$(fb)" 'side: bug' 'plain bisect walks into the branch'
check "$(fb --first-parent)" 'Merge side' '--first-parent blames the merge'

# ---- Deep dive: merge-base moves when the target is merged into the branch ---------------------------
cd "$W"; git init -q -b main mb; cd mb; git config advice.detachedHead false
echo 1 > f; c m1; git switch -q -c feat; echo 2 > g; c f1; FORK=$(short main)
git switch -q main; echo 3 > h; c m2; git switch -q feat
check "$(short "$(git merge-base main feat)")" "$FORK" 'before: the fork point'
git merge -q --no-edit main >/dev/null; check "$(git merge-base main feat)" "$(git rev-parse main)" 'after merging main in: its tip'
out merge_base_moves yes

# ---- Deep dive: reflog expiry (docs: 90 days for reachable entries, 30 for unreachable ones) ---------------------
# Pinned with -c so the numbers do not depend on the Git version: the v2.56.0 source has the two defaults the other way
# round (see reflog_default_*, printed below and asserted per version in examples.py).
for d in 29 31 89 91; do
  cd "$W"; rm -rf r; git init -q -b main r; cd r
  T=$(date -u -d "-$d days" +%Y-%m-%dT%H:%M:%SZ)
  GIT_COMMITTER_DATE=$T git commit -q --allow-empty -m a; A=$(git rev-parse HEAD)
  GIT_COMMITTER_DATE=$T git commit -q --allow-empty -m lost; LOST=$(git rev-parse HEAD)
  GIT_COMMITTER_DATE=$T git reset -q --hard "$A"     # 'lost' is now only in the reflog
  git -c gc.reflogExpire=90.days -c gc.reflogExpireUnreachable=30.days reflog expire --all
  out "reflog_$d" "$(git reflog main | wc -l | tr -d ' ')"
  # The entries are gone at 91 days, but the commit object is not: it stays until gc prunes it (default grace: 2 weeks).
  git cat-file -e "$LOST"; [ "$d" -ne 91 ] || { out lost_commit_after_expire exists; out lost_commit_dangling "$(git fsck --lost-found 2>/dev/null | grep -c '^dangling commit')"; }
done
# What a plain `git reflog expire --all` does with no configuration: a commit 45 days old, still reachable from the tip.
cd "$W"; rm -rf r; git init -q -b main r; cd r
GIT_COMMITTER_DATE=$(date -u -d '-45 days' +%Y-%m-%dT%H:%M:%SZ) git commit -q --allow-empty -m old; GIT_COMMITTER_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ) git commit -q --allow-empty -m new
git reflog expire --all
out reflog_default_45 "$(git reflog main | wc -l | tr -d ' ')"   # 2 if reachable entries last 90 days (documented), 1 if 30
echo "all Git examples pass on $(git --version)"
