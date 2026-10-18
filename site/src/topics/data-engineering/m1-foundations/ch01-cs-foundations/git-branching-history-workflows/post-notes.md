---
id: de.git-branching-history-workflows
title: Git branching and history
---

<section data-section="outcomes">

## After this refresher you can

- Say what merge and rebase each do to the commit graph (a merge commit with both parents, against replayed commits with new IDs in a straight line), show that both can end with the same files, and pick one: rebase your own unpushed work, merge or rebase-and-merge what is shared.
- Clean up a branch before you push it (`rebase -i`, `--fixup` with `--autosquash`, `drop`, `reword`), and undo a rewrite from the reflog.
- Resolve a conflict knowing what the three versions are (base, ours, theirs), with the base on screen (`zdiff3`), and know that ours and theirs swap during a rebase.
- Find a regression in about log₂ N test runs (log₂ N is how many times you can halve N) with `git bisect run` and a failing test as the oracle, and write that oracle with the right exit codes (0 good, 1 to 127 bad except 125, 125 skip, anything else stops the run).
- Choose how a pull request lands (merge commit, squash, rebase-and-merge) and what each does to history, and explain why trunk-based development with short-lived branches avoids the repeated conflicts of long-lived ones.

</section>

<section data-section="internals">

## A little deeper

Every example in the reel was run with real Git in a throwaway repository with fixed authors and dates, which is why the commit IDs on screen are the same on every machine. They ran on **Git 2.43.0** (the Git of the repository's container and of its checks) and on **Git 2.56.0**, the current release, built from its source tarball. Every ID and number is the same on both. They use only behaviour the current documentation still describes; the places where Git versions differ are marked **[version]**. The ones the examples hit:

- The todo list of `rebase -i` shows `pick <id> # <subject>` on 2.56 (the default `rebase.instructionFormat` became `# %s`) and `pick <id> <subject>` on 2.43. The reel shows the 2.56 form.
- `--autosquash` without `-i`: ignored on 2.43, honoured from 2.44.
- Bisect's last line is "is the first 'bad' commit" from 2.55 and "is the first bad commit" on 2.43. The reel shows the 2.56 wording.
- The reflog expiry defaults: the documentation says 90 days for entries still reachable and 30 for unreachable ones, and 2.43 does that; the v2.56.0 source sets the two the other way round (executed: a reachable entry 45 days old survived `git reflog expire --all` on 2.43 and was pruned on 2.56.0). If you rely on those ages, set `gc.reflogExpire` and `gc.reflogExpireUnreachable` yourself, as `examples.sh` does.

### Commits, IDs and the graph

- **A commit names a snapshot and its parents.** A commit object specifies the top-level tree for the project at that point, its parent commits if any, the author and committer, and the message. Its ID is a hash of all of that, so a commit with a different parent has a different ID. Run with `git commit-tree`: same tree, message and dates, a different parent, a different ID. (In the reel's rebase the tree changed too, because the replayed commits also contain `main`'s files.)
- **History is a graph of parent links.** A merge commit is the node with two parents. `git log --first-parent` follows `main`'s own line: 4 commits in the reel's merged example, 7 in all.
- **Ranges and the fork point.** `A..B` means the commits reachable from `B` but not from `A`, which is "what this branch adds" and what a pull request lists. `A...B` is the symmetric difference: the commits reachable from either side but not from both. `git merge-base A B` finds the best common ancestor that a three-way merge starts from, which is the point a branch forked at until you merge the target into it, and the last merged target commit after that (executed: after `main` is merged in, the merge base is `main`'s tip; that is why a PR's diff shrinks after an "Update branch"). With `--fork-point` it also takes the reflog of the other branch into account, in case your branch forked from an earlier incarnation of it.
- **Commit messages are part of the history.** Pro Git's general rule: a first line of no more than about 50 characters that describes the changeset concisely, written in the imperative ("Fix bug", not "Fixed bug"), then a blank line, then a more detailed explanation. Review norms for messages belong to the Software delivery workflow refresher.

### Merge and rebase, precisely

- **Fast-forward or a true merge.** When the target has not moved, a merge can fast-forward: it only moves the branch pointer and creates no merge commit. Otherwise the branches are tied together by a merge commit that has both as parents. `--no-ff` always creates the merge commit, and only `--ff-only` refuses, exiting non-zero, when a fast-forward isn't possible. The default merge strategy is `ort`.
- **What rebase does.** It lists the commits on your branch that have no equivalent upstream, detaches at the upstream, replays them one by one (like `git cherry-pick` for each) and moves the branch. Replaying means abandoning the old commits and creating new, similar ones. The result looks like a linear history: all the work appears to have happened in series, even when it happened in parallel.
- **Same files, different history.** The snapshot at the end of a rebase and at the end of a merge is the same, as the two `tree 827c45a` labels show (when any conflicts are resolved the same way). Only the history differs. Pro Git frames the choice: history as a record of what actually happened, or as the story of how the project was made.
- **Equivalent commits are skipped.** "Equivalent" means the same patch-id (a checksum of just the patch). If upstream already has your change, rebase skips it with a "skipped previously applied commit" warning (executed; `--reapply-cherry-picks` turns this off). It does not help when upstream changed the patch, for example by squashing it with others: Pro Git warns that it only works if the two are almost exactly the same patch.
- **Rebasing in place.** A rebase onto where the branch already sits replays nothing and IDs are unchanged (executed). `--force-rebase` replays everything as new commits; a real rebase stamps the current time as the committer date and keeps the author date. **Executed caveat:** `examples.sh` pins every date, so there `-f` rebuilds identical commits; with a later committer date it gives new IDs. `--committer-date-is-author-date` and `--ignore-date` (use the current time as the author date) also imply `--force-rebase`, so they too change IDs.
- **Reshaping.** `--onto` transplants a series of commits onto a different starting point (for example a topic branched off another topic). `--keep-base` rebases without moving the fork point. By default a rebase drops merge commits from the todo list and linearises; `--rebase-merges` recreates them instead.
- **Pulling.** `git pull` first runs `git fetch`, then integrates the remote branch. Current Git defaults to `--ff-only`: a pull of diverged history stops with an error instead of creating a merge, and you choose `git pull --rebase` (`pull.rebase` makes it the default) to replay your commits on top, or `--no-rebase` to merge.
- **Rebase's own default.** With no upstream given on the command line (a bare `git rebase`, and so `git pull --rebase`), rebase defaults to `--fork-point`: it uses the reflog to find a better common ancestor when working out which commits your branch introduced, so the set it replays can differ from what `upstream..branch` shows. With an upstream argument the default is `--no-fork-point`; `--fork-point`, `--no-fork-point` and `rebase.forkpoint` set it explicitly.

### Rewriting history safely

- **The interactive verbs.** `rebase -i` shows a todo list: `pick`, `reword`, `edit`, `squash`, `fixup`, `drop` (and `fixup -C`, `break`, `exec`). For the last commit alone, `git commit --amend` replaces it, which changes its ID: "it's like a very small rebase", so don't amend a commit you've already pushed. To split a commit, mark it `edit`, undo it, then stage and commit the pieces separately.
- **Fixup commits.** `git commit --fixup=<commit>` records a correction aimed at an earlier commit (`--fixup=amend:` and `--fixup=reword:` also fix its message), and `--autosquash` moves it right after its target and changes `pick` to `fixup`. `rebase.autoSquash` makes that the default for interactive rebases. **[version]** `--autosquash` works without `-i` from Git 2.44 (release notes) and is silently ignored on 2.43 (executed: the fixup commit stays), so the reel always shows `-i --autosquash`. In the todo, Git 2.56 writes the commit subject after a `#`.
- **Every commit still passes.** `-x`/`--exec` runs a command after each rewritten commit, so every commit stays bisectable (executed: it ran once per commit; with `--autosquash`, only after each fixup series). `--update-refs` moves every branch that points into the rebased range, so a stack of dependent PR branches moves together.
- **Authors.** In `rebase -i`, a `squash` or `fixup` result keeps the author of the first commit. (GitHub's "Squash and merge" decides its commit's author separately.)
- **The golden rule.** Don't rewrite commits that others may have based work on: anyone downstream is forced to repair their history by hand. Rewriting commits you have already pushed needs a force push; `git push --force-with-lease` only overwrites the remote if it is still where you expect, so a teammate's new commit isn't silently lost. Adding `--force-if-includes` also verifies that updates fetched into the remote-tracking refs in the background have been integrated locally before the forced update is allowed. If you rebase pushed commits that no one else has built on, you're also fine.
- **Reviewing a rewrite.** `git range-diff` compares two versions of a patch series commit by commit, which is how a reviewer sees what actually changed in a force-pushed branch.
- **Undoing on shared history.** Don't rewrite it; `git revert` adds a new commit that undoes one. To revert a merge you must pick the mainline with `-m <parent-number>`, and doing so declares that you will never want the tree changes the merge brought in, so a later re-merge of that branch won't bring them back. To get them back, revert the revert (the revert-a-faulty-merge How-To: "now need to do it by reverting the revert"), and then merge the side branch again.
- **Recovery.** The reflog records where local refs used to be: `HEAD@{2}` is "where HEAD used to be two moves ago", `branch@{1}` the previous tip, and `ORIG_HEAD` the tip before a risky operation. It is local only. Entries are kept for at least 90 days (30 for entries no longer reachable from the branch); the expiry runs through `git gc` (or `git reflog expire`), so say "kept at least 30 days", never "deleted on day 30". Executed (ages pinned with `gc.reflogExpire`, see the version note above): an entry for a lost commit dated 29 days ago survived `git reflog expire --all`; at 31 days its entry was gone, and at 91 days every entry was. The commit object itself is a separate matter: after the entries expired it was still there and `git fsck --lost-found` listed it as dangling, until `git gc` prunes unreachable objects (by default those older than two weeks).
- **The hard case.** If someone else rebased a branch you build on, recover with `git rebase --onto subsystem subsystem@{1}`.

### Conflicts

- **When Git conflicts.** Changes to different areas merge cleanly; when both sides changed the same area Git asks you to resolve it. "Area" includes neighbouring lines (executed: base `a b c`, one side changes line 1, the other line 2, and the merge stops with all three stages; two lines apart, it merges cleanly).
- **Three versions.** During a conflicted merge the index records up to three versions of the file: stage 1 from the common ancestor, stage 2 from `HEAD`, stage 3 from `MERGE_HEAD` (`git ls-files -u` lists them; `git show :1:path` reads one). `git checkout --ours` or `--theirs` takes one side whole.
- **Markers and styles.** `<<<<<<<`, `=======` and `>>>>>>>` mark the area; the part before `=======` is your side. The default format doesn't show the original; `merge.conflictStyle` set to `diff3` or `zdiff3` adds a `|||||||` section with the base, so you can see what each side changed (executed, as in the reel). `zdiff3` is like `diff3` but moves matching lines at the very start or end of the conflict out of it, so the conflict region is smaller. Where the two sides share no such lines (the reel's one-line conflict), both give the same output.
- **Ways out and forward.** Edit the files, `git add` them, then `git merge --continue` (or `git commit`). `git merge --abort` tries to reconstruct the pre-merge state, but may not be able to restore uncommitted changes that were there before the merge started. For whitespace noise, abort and merge again with `-Xignore-space-change`.
- **In a rebase.** Rebase stops at the first conflicting commit; then `--continue`, `--skip` or `--abort`. **Ours and theirs swap:** ours is "the so-far rebased series, starting with the upstream", theirs is your working branch (executed: stage 2 is the upstream, stage 3 your commit; at your second commit, ours already contains your first, replayed). The same reversal applies to `-X ours`/`-X theirs`.
- **rerere.** Set `rerere.enabled` and Git records how you resolved a conflict and replays it when the same one reappears. Its own description is the long-lived topic branch where you "resolve the same conflicts over and over again". It leaves the index alone, so you still check the result and `git add` it (executed); `--rerere-autoupdate` lets it stage the result too, and `--no-rerere-autoupdate` is "a good way to double-check what git-rerere did and catch potential mismerges".

### Bisect

- **The algorithm.** Mark a bad commit that contains the bug and a good one that doesn't; bisect picks a commit between them and asks whether it is good or bad, narrowing the range until it finds the commit that introduced the change. It reports "roughly N steps", about log₂ of the range: log₂ N is how many times you can halve N, and 2¹⁰ = 1,024, so a thousand commits need about ten tests. In `examples.sh`, 1,000 linear commits took 10 tests (and 9 or 10 for every culprit position tried in the fact-check). Merges and skipped commits can add steps.
- **Housekeeping.** It prints a description of the first bad commit and leaves `refs/bisect/bad` pointing at it; `git bisect reset` returns you to where you started. `skip` sets a commit aside, but skipping one adjacent to the culprit leaves several candidates (executed: 3). Name several good commits, or a pathspec, to shrink the range. `--no-checkout` tests without checking out. `old`/`new` replace good/bad when hunting a fix instead of a regression. `git bisect log` and `replay` save and repeat a session.
- **Merges.** `--first-parent` follows only the first parent at each merge, so bisect blames the merge rather than a broken, non-buildable commit inside a merged branch (executed: it blamed "Merge side", the plain bisect "side: bug").
- **`git bisect run` exit codes in full.** 0 good; 1 to 127 bad except 125; 125 skip; anything else (128 to 255) aborts. `exit(-1)` shows up as 255, and a crash by signal aborts too (executed: a command killed by SIGSEGV is reported as 139, which is 128 plus the signal number, and the run stops with "is < 0 or >= 128"; signals and exit statuses are the shell refresher's subject). Statuses are taken modulo 256, so `exit 256` reads as 0, good. 125 was chosen because 126 and 127 are what POSIX shells use for "not executable" and "command not found". If the very first test exits 126 or 127, Git re-runs it on the good commit and stops if that fails the same way, so a missing command stops the run at once with "bogus exit code 127" (not in the docs; in Git's source, `builtin/bisect.c`). Only the first run is re-checked (`is_first_run`): if the command or an interpreter goes missing on an older commit later in the run, 126 and 127 count as bad and bisect blames the wrong commit without any error (executed: "127 counts as bad"), so map "can't run" to 125 yourself. **[version]** The message reads "for good revision" on 2.43 and "for 'good' revision" from 2.55; the first-bad line is "is the first bad commit" on 2.43 and "is the first 'bad' commit" from 2.55.
- **The oracle, red-teamed.** In Python *any* uncaught exception exits 1, so an `ImportError` on an old commit counts as bad: exit 125 when the test can't run. `python3 -O` or `PYTHONOPTIMIZE` strips `assert`, so a broken commit passes (both executed). Keep the test script outside the repository, so checking out old commits can't change it.
- **The oracle most people write is pytest.** pytest exits 0 when everything passed and 1 when tests failed, but also 2 when interrupted, 3 on an internal error, 4 on a usage error and 5 when no tests were collected, for example on an old commit where the test file doesn't exist yet. Bisect reads every one of those as bad. Wrap it: `pytest -q tests/test_clean.py; rc=$?; [ $rc -le 1 ] && exit $rc || exit 125` keeps 0 and 1 and turns the rest into "skip this commit" (executed with stand-in exit codes).
- **[version]** `git bisect --reset-when-found` cleans up automatically once the culprit is found; it is new in Git 2.56.0 and absent from 2.43.

### Landing a pull request

- **A PR, start to finish.** Open it from a short-lived branch; review and checks run. To update it, push more commits, or bring it up to date with the target by merging the target in (no rewrite, so no force push) or by rebasing (a rewrite, so `git push --force-with-lease`, and a reviewer's `git range-diff` shows what the force-push changed). When the checks pass (a merge queue re-tests against the latest base first), land it with one of the three strategies below, delete the branch, and after a squash start the next branch from `main`. Each piece is explained in its own bullet in this Deep dive.
- **The three GitHub strategies.** *Merge commit* preserves every commit and adds an explicit merge point (it uses `--no-ff`). *Squash and merge* combines all the commits into one on the base branch, landed as a fast-forward; the intermediate commits are not preserved there. *Rebase and merge* adds each commit individually, without a merge commit, for a linear history.
- **Not the same as `git rebase`.** Rebase-and-merge always writes new commits with new IDs and updates the committer information, where `git rebase` onto an ancestor does not change the committer; it also drops commits that were empty to begin with. That surprises tooling that tracks commit IDs.
- **Squash and the reused branch.** Squash works best for short-lived branches. If you keep working on the same head branch after a squash merge, later pull requests can include commits that were already squashed, which can make merge conflicts more likely and force you to resolve the same conflicts more than once. Executed in the reel's scenario: 4 commits, 1 new; merging or rebasing the branch onto `main` conflicts in `dedupe.py` (so GitHub would flag the PR as conflicted); `git branch -d` refuses ("not fully merged"). For long-running branches, use a merge commit or rebase before opening the next pull request.
- **A nuance, executed.** When the squashed PR had a single commit, the squash has that commit's patch-id, so rebasing the reused branch drops the old commit cleanly; with several commits the combined patch matches none, and the rebase conflicts. Whether a merge conflicts depends on what the new commit touches.
- **What each strategy costs.** Pick by what you will need later:
  - *Merge commit.* Keeps every commit and the PR's shape. Bisect can follow only the first parents (`--first-parent`) and blame the PR's merge, or go inside it to the small commits (executed: "Merge side" against "side: bug"). To undo the PR you revert the merge with `-m <parent-number>`, which carries the re-merge trap above. Commit IDs are untouched.
  - *Squash and merge.* One commit with one parent (executed), so bisect can only blame the whole PR, never a commit inside it, and the intermediate commits are not preserved on `main`. Undoing the PR is one plain `git revert`. Reusing the branch is the trap above.
  - *Rebase and merge.* A straight line of the individual commits, so bisect works commit by commit, but every commit is new (new IDs, new committer), which breaks tooling that remembers IDs. `git revert` takes one or more commits and records new commits that undo them, so undoing a three-commit PR means reverting all three, not one.
  A rule of thumb, not a documented rule: squash when the PR is one idea and you want one clean revert; a merge commit when its small commits are clean and worth bisecting; rebase-and-merge when you want a linear history and nothing downstream remembers IDs.
- **Branch protection enforces the flow.** A protection rule can require status checks to pass and, with the strict setting, the branch to be up to date with the base before merging, or require a linear history. It can also require pull requests to receive a number of approving reviews, from people with write permission or from a designated code owner. By default it disables force pushes and deletion on the matching branches. Only a single branch protection rule can apply to a branch at a time; that restriction does not apply to rulesets.
- **Indirect merges.** A pull request whose commits reach the base branch another way is marked merged, even if its branch protection rules were not satisfied.

### Branching models

- **Trunk-based development.** Developers collaborate on code in a single branch called the trunk and resist pressure to create other long-lived development branches. Teams either commit directly to the trunk (very small teams) or use short-lived feature branches through pull requests, which exist for code review and build checking (continuous integration, CI: automated build and test checks) before commits land in the trunk. The site's rule of thumb: a branch should only last a couple of days, and members commit to the trunk at least once every 24 hours, which it describes as the core requirement of Continuous Integration. Two rules, not one: everyone integrates daily; a branch lasts days, not weeks.
- **Bigger changes in small steps.** Feature flags and branch by abstraction let a long change land on the trunk in steps (branch by abstraction: introduce an abstraction, write a second implementation, switch over, remove the old one). Release branches are cut from the trunk just in time, and bug fixes come forward by being cherry-picked from the trunk onto the release branch; or there may be no release branches at all if the team releases from the trunk and fixes forward. The best practice is to reproduce the bug on the trunk, fix it there with a test, then cherry-pick it to the release branch: fixing on the release branch and cherry-picking back "in the expectation" risks forgetting, a regression in production. `git cherry-pick -x` appends "(cherry picked from commit …)" to the message, which the git-cherry-pick docs call useful when backporting between two publicly visible branches.
- **GitHub Flow.** It is "very close to PR-centric Trunk-Based Development"; the crucial difference is where the release is performed from. In GitHub Flow the release goes out from the branch, before the merge back to the trunk, which carries "the small risk of regression in the following release" if the branch is never merged back; in trunk-based development the release comes from the trunk (or a release branch cut from it).
- **Against long-running branches.** The site's advice is to do trunk-based development instead of GitFlow and the other models with several long-running branches, and says Git Flow is incompatible with it. The cost is visible in Git's own docs: a workflow with long-lived topic branches makes developers resolve the same conflicts over and over, which is why `rerere` exists. The mechanism: merging the trunk into a long-lived branch again and again clutters it with "Merge from master" commits, and the alternatives (rewinding a test merge, or rebasing the branch) bring the same conflict back, because a rebase "would conflict the same way as the test merge you resolved earlier". A merge you keep resolves its conflict once (executed: after a merge of `main` into the branch the merge base moves to `main`'s merged tip, so the next sync starts from there); the cost is the clutter and the bigger final merge. Squash merges don't suit such branches either.

</section>

<section data-section="lab">

## Try it

This is the Foundations lab in miniature. Run `examples.sh` (it sits in this topic's folder in the repository; run `bash examples.sh`; it needs bash, Git and python3, and writes only to a temporary directory it deletes): it builds a 1,000-commit history with a planted regression in `clean.py` and a test that lives outside the repository, then bisects it in 10 runs and prints the commit it found. Then:

- Make some commits untestable (a syntax error in a middle stretch) and have the test `exit 125` for them; watch bisect skip and still find the culprit, then skip the commits next to it and see it refuse to name one.
- Plant the bug inside a merged branch (a broken commit followed by a fix, merged to `main`) and compare a plain bisect with `git bisect start --first-parent`.
- Break the oracle: make the test `exit 255` and watch the run abort. Run the same assert-based test with `python3 -O` and see why a broken commit "passes".

Every example in this reel is executed and checked in `examples.py`, which runs `examples.sh`.

</section>

<section data-section="production">

## In production

- **A force-pushed shared branch.** Teammates now have duplicates of rewritten commits. Recover with `git rebase --onto <new> <old>@{1}`; prevent it with `--force-with-lease` and by not rewriting shared branches.
- **"My commits are gone after a rebase."** Look in the reflog: `git reflog`, then `git branch rescue <id>`. Entries that are no longer reachable are kept for at least 30 days.
- **A squash-merged branch reused.** Old commits reappear in the next PR, the same conflicts repeat, and `git branch -d` refuses. Start a fresh branch from `main` after every squash merge.
- **Bisect blames the wrong commit.** Usual causes: the test changed across history (keep it outside the repo); broken commits inside merged branches (`--first-parent`, or exit 125 for commits that don't build); the oracle failed for an unrelated reason (an `ImportError` exits 1, which means bad); or it never failed at all (`python3 -O` strips the asserts, and bisect then blames the bad endpoint).
- **A bisect run that aborts or stops at once.** An exit code of 128 or more (a crash, `exit(-1)`) aborts; "bogus exit code 127" means the test command wasn't found (checked on the first run only: a command that vanishes later is read as bad).
- **Conflicts resolved with the sides confused.** In a rebase, ours and theirs are reversed, and so are `-X ours` and `-X theirs`. Check the result with `git diff` before `--continue`.
- **Tooling that tracks commit IDs.** GitHub's rebase-and-merge changes IDs and committer, so anything that remembers the original IDs loses them.
- **The same conflicts on every rebase or test merge of a long-lived branch.** A conflict you resolve in a rebase (or in a test merge you then rewind) comes back the next time. Turn on `rerere`, or better, shorten the branch.
- **Checks that passed on a stale base.** Require branches to be up to date before merging (the strict status check), or use a merge queue, which groups a pull request's changes with the latest base and the PRs ahead of it on temporary branches and merges once the required checks pass. CI must also trigger on the `merge_group` event.

</section>

<section data-section="frontier">

## What's changing

- **Merge queues.** For very large trunks, merge or patch queues serialise integration (trunkbaseddevelopment.com calls this the "super scaled" picture), and GitHub offers a merge queue. A workflow that runs on `pull_request` alone is not triggered for the queue's temporary branches: add the `merge_group` event.
- **`git history` (experimental, Git 2.55 and 2.56).** A more opinionated way to rewrite history than `rebase -i`: `drop`, `fixup`, `reword` and `split` on one commit, with every descendant replayed and every branch that contains it updated. `fixup` arrived in 2.55 and `drop` ("with its descendants replayed onto its parent") in 2.56. The manual page opens "THIS COMMAND IS EXPERIMENTAL. THE BEHAVIOR MAY CHANGE.", and it does not yet work with histories that contain merges or with operations that could conflict, so interactive rebase remains the general tool.
- **`git add --resolved` (Git 2.56).** Stages conflict-resolved paths while leaving unrelated local changes unstaged, and refuses to stage anything if a path still has conflict markers.
- **`git replay --linearize` (experimental, Git 2.56).** Replays a range with each commit stacked on the last, dropping merge commits: "mimicking `git rebase --no-rebase-merges`".
- **`git branch --delete-merged` (Git 2.56).** Deletes local branches whose tip is reachable from their upstream. A squash-merged branch's tip is not reachable (the squash commit isn't made of its commits), so it is skipped: after a squash merge, delete the branch yourself, as the squash advice above says.
- **`git bisect --reset-when-found`.** New in Git 2.56.0 (September 2026): it runs `git bisect reset` for you once the first bad commit is found.

</section>

<section data-section="next">

## Where this goes next

Next refresher: the Linux shell, where exit codes like the ones bisect reads come from.

</section>
