## Git - git-bisect Documentation
URL: https://git-scm.com/docs/git-bisect
Version: git-bisect last updated in 2.56.0 (2026-09-28); current docs as fetched 2026-10-11

> git-bisect - Use binary search to find the commit that introduced a bug

> This command uses a binary search algorithm to find which commit in

> it a "bad" commit that is known to contain the bug, and a "good"

> Bisecting: 675 revisions left to test after this (roughly 10 steps)

> Bisecting: 337 revisions left to test after this (roughly 9 steps)

> command will print out a description of the first bad commit. The

> After a bisect session, to clean up the bisection state and return to

> git bisect reset <commit>

> If you have a script that can tell if the current source code is good

> with code 0 if the current source code is good/old, and exit with a

> code between 1 and 127 (inclusive), except 125, if the current source

> Any other exit code will abort the bisect process. It should be noted

> The special exit code 125 should be used when the current source code

> cannot be tested. If the script exits with this code, the current

> $ git bisect skip # Current version cannot be tested

> However, if you skip a commit adjacent to the one you are looking for,

> make || exit 125 # this skips broken builds

> $ git bisect run make test # "make test" builds and tests

Added by the content plan (2026-10-11), from the same fetched text:

> bisect picks a commit between those two endpoints and asks you
> whether the selected commit is "good" or "bad". It continues narrowing
> down the range until it finds the exact commit that introduced the
> change.

> The reference refs/bisect/bad will be left pointing at that commit.

> revision will be skipped (see git bisect skip above). 125 was chosen
> as the highest sensible value to use for this purpose, because 126 and 127
> are used by POSIX shells to signal specific error status

> that a program that terminates via exit(-1) leaves $? = 255

> Git will be unable to tell exactly which of those commits was the
> first bad one.

> Follow only the first parent commit upon seeing a merge commit.

> This option is particularly useful in avoiding false positives when a merged
> branch contained broken or non-buildable commits, but the merge itself was OK.

> Once the first bad commit is found, report it and clean up the
> bisection state.

> It is safer if both test.sh and check_test_case.sh are
> outside the repository to prevent interactions between the bisect,
> make and test processes and the scripts.

> If you know beforehand more than one good commit, you can narrow the
> bisect space down by specifying all of the good commits immediately after
> the bad commit when issuing the bisect start command:

> You can further cut down the number of trials, if you know what part of
> the tree is involved in the problem you are tracking down, by specifying
> pathspec parameters when issuing the bisect start command:

> Do not checkout the new working tree at each iteration of the bisection

Added by the fact-check (2026-10-11), from the same fetched text:

> code between 1 and 127 (inclusive), except 125, if the current source
> code is bad/new.

> (127 is for
> command not found, 126 is for command found but not executable

> exit(3) manual page), as the value is chopped with & 0377.

Contents:
- NAME
- SYNOPSIS
- DESCRIPTION (Basic bisect commands: start, bad, good; Bisect reset; Alternate terms; Bisect visualize/view; Bisect log and bisect replay; Avoiding testing a commit; Bisect skip; Bisect next; Cutting down bisection by giving more parameters to bisect start; Bisect run)
- OPTIONS (--no-checkout; --first-parent; --reset-when-found[=<where>])
- EXAMPLES (bisect a broken build; bisect a test failure; bisect a broken test case; bisect with temporary modifications (hot-fix); single-line test with sh -c; locate a good region of the object graph in a damaged repository; look for a fix instead of a regression; Getting help)
- SEE ALSO
- GIT
## Trunk Based Development
URL: https://trunkbaseddevelopment.com/
Version: as fetched 2026-10-11

> A source-control branching model, where developers collaborate on code in a single branch called ’trunk’* and

> resist any pressure to create other long-lived development branches by employing documented techniques. They

> Shared branches off mainline/main/trunk are bad at any release cadence:

> You should do Trunk-Based Development instead of GitFlow and other branching models that feature multiple long-running branches

> You can either do a direct to trunk commit/push (v small teams) or a Pull-Request workflow as long as those feature branches

> short-lived feature branches are used for

> code-review and build checking (CI), but not artifact creation or publication, to happen before commits land in the trunk for other developers to depend on.

> Depending on the intended release cadence, there may be release branches that are cut from the trunk on

> a just-in-time basis, are ‘hardened’ before a release (without that being a team activity), and those branches are deleted some time after release. Alternatively, there

> may also be no release branches if the team is releasing from Trunk, and choosing a “fix

> forward” strategy for bug fixes. Releasing from trunk is also for high-throughput teams, too.

> members commit to trunk at least once every 24 hours. This ensures the codebase is always releasable on demand

Added by the content plan (2026-10-11), from the same fetched text:

> therefore avoid merge hell, do not break the build, and live happily ever after.

> are short-lived and the product of a single dev-workstation

> Super scaled is merge/patch queues of course

> use feature flags in day to day development

Added by the fact-check (2026-10-11), from the same fetched text:

> it becomes easy to satisfy the core requirement of Continuous Integration that all team

> If the mob is bigger and the change more all-encompassing, techniques should include feature flags, branch by abstraction and “don’t break the build”

> Teams should become adept with the related branch by abstraction technique for longer

> to achieve changes, and use feature flags in day to day development to allow for hedging on

Contents:
- One-line summary of the model: a single trunk (main) and no long-lived development branches
- Claims: prefer TBD over GitFlow; direct commits or PR workflow with short-lived branches
- Caveats: short-lived branches for review and CI; release branches cut just-in-time or releasing from trunk with fix-forward
- Link to Continuous Integration (commit to trunk at least every 24 hours)
- History and comparison with GitHub-flow and Gitflow

## Pull request merges - GitHub Docs
URL: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges
Version: as fetched 2026-10-11

> Preserves every commit from the pull request branch and adds an explicit merge point.

> Combines all commits in the pull request into a single commit on the base branch.

> Adds each commit onto the base branch without a merge commit, for a linear history.

> all commits from the feature branch are added to the base branch in a merge commit. The pull request is merged using the --no-ff option.

> Pull requests with squashed commits are merged using the fast-forward option.

> The tradeoff is that intermediate commits from the pull request are not preserved as separate commits on the base branch.

> Squash merging works best for short-lived branches. If you keep working on the same head branch after a squash merge, later pull requests can include commits that were already squashed into the base branch.

> all commits from the topic branch (or head branch) are added onto the base branch individually without a merge commit.

> However, rebasing achieves this by re-writing the commit history on the base branch with new commits.

> Always updates the committer information and creates new commit SHAs, whereas git rebase does not change the committer information when the rebase happens on top of an ancestor commit.

> Drops commits that were empty to begin with, such as those created with git commit --allow-empty, whereas git rebase keeps originally-empty commits by default.

Added by the content plan (2026-10-11), from the same fetched text:

> A merge commit preserves the full commit history from the pull request branch.

> This can make merge conflicts more likely and can force you to resolve the same conflicts more than once.

> For long-running branches, consider using a merge commit or rebasing the branch before opening the next pull request.

> This produces a linear history while preserving the individual commits from the pull request.

> Pull requests merged indirectly are marked as merged even if branch protection rules on that pull request were not satisfied.

Added by the fact-check (2026-10-11), from the same fetched text:

> A pull request can be marked as merged if its head branch commits become reachable from the base branch outside that pull request.

Contents:
- Strategy comparison table: merge commit, squash and merge, rebase and merge
- Merge commit: --no-ff, full history, explicit merge point
- Squash and merge: single commit, fast-forward, default message, caveat for long-running branches
- Rebase and merge: linear history, differences from git rebase (new SHAs, committer info, empty commits)
- Indirect merges
## Git - git-merge Documentation
URL: https://git-scm.com/docs/git-merge
Version: current docs as fetched 2026-10-11 (page shows: last updated in 2.54.0)

> With --ff, when possible resolve the merge as a fast-forward (only

> With --no-ff, create a merge commit in all cases, even when the merge

> With --ff-only, resolve the merge as a fast-forward when possible.

> When not possible, refuse to merge and exit with a non-zero status.

> instead, the HEAD (along with the index) is

> Except in a fast-forward merge (see above), the branches to be

> Produce the working tree and index state as if a real merge

> make a commit, move the HEAD, or record $GIT_DIR/MERGE_HEAD

> For conflicting paths, the index file records up to three

> versions: stage 1 stores the version from the common ancestor,

> The area where a pair of conflicting changes happened is marked with markers

> An alternative style can be used by setting the merge.conflictStyle

> configuration variable to either diff3 or zdiff3. In diff3

> Resolve the conflicts. Git will mark the conflicts in

> Abort the current conflict resolution process, and

> git merge --abort is equivalent to git reset --merge when

> Note that fast-forward updates do not create a merge commit and

Added by the content plan (2026-10-11), from the same fetched text:

> update the branch pointer to match the merged branch; do not create a
> merge commit).

> Except in a fast-forward merge (see above), the branches to be
> merged must be tied together by a merge commit that has both of them
> as its parents.

> versions: stage 1 stores the version from the common ancestor,
> stage 2 from HEAD, and stage 3 from MERGE_HEAD

> The part before the =======
> is typically your side, and the part afterwards is typically their side.

> The default format does not show what the original said in the conflicting
> area.

> Edit the files into shape and
> git add them to the index.

> started, git merge --abort will in some cases be unable to
> reconstruct these changes.

Contents: NAME, SYNOPSIS, DESCRIPTION, OPTIONS, PRE-MERGE CHECKS, FAST-FORWARD MERGE, TRUE MERGE, MERGING TAG, HOW CONFLICTS ARE PRESENTED, HOW TO RESOLVE CONFLICTS, EXAMPLES, MERGE STRATEGIES, CONFIGURATION, SEE ALSO, GIT

## Git - git-rerere Documentation
URL: https://git-scm.com/docs/git-rerere
Version: current docs as fetched 2026-10-11 (page shows: last updated in 2.54.0)

> In a workflow employing relatively long lived topic branches,

> Next time, after seeing the same conflicted automerge,

> running git rerere will perform a three-way merge between the

> Note that git rerere leaves the index file alone,

> Reuse recorded resolution of conflicted merges

Added by the content plan (2026-10-11), from the same fetched text:

> the developer sometimes needs to resolve the same conflicts over
> and over again

> You need to set the configuration variable rerere.enabled in order to
> enable this command.

Contents: NAME, SYNOPSIS, DESCRIPTION, COMMANDS, DISCUSSION, GIT
## Git - Rebasing
URL: https://git-scm.com/book/en/v2/Git-Branching-Rebasing
Version: Pro Git 2nd edition, as fetched 2026-10-11

> In Git, there are two main ways to integrate changes from one branch into another: the merge and the rebase.

> With the rebase command, you can take all the changes that were committed on one branch and replay them on a different branch.

> This operation works by going to the common ancestor of the two branches (the one you’re on and the one you’re rebasing onto), getting the diff introduced by each commit of the branch you’re on, saving those diffs to temporary files, resetting the current branch to the same commit as the branch you are rebasing onto, and finally applying each change in turn.

> There is no difference in the end product of the integration, but rebasing makes for a cleaner history.

> If you examine the log of a rebased branch, it looks like a linear history: it appears that all the work happened in series, even when it originally happened in parallel.

> Rebasing replays changes from one line of work onto another in the order they were introduced, whereas merging takes the endpoints and merges them together.

> Do not rebase commits that exist outside your repository and that people may have based work on.

> When you rebase stuff, you’re abandoning existing commits and creating new ones that are similar but different.

> If you push commits somewhere and others pull them down and base work on them, and then you rewrite those commits with git rebase and push them up again, your collaborators will have to re-merge their work and things will get messy when you try to pull their work back into yours.

> Git also calculates a checksum that is based just on the patch introduced with the commit.

> You can also simplify this by running a git pull --rebase instead of a normal git pull.

> If you only ever rebase commits that have never left your own computer, you’ll be just fine.

> One point of view on this is that your repository’s commit history is a record of what actually happened.

> The opposing point of view is that the commit history is the story of how your project was made.

> You can get the best of both worlds: rebase local changes before pushing to clean up your work, but never rebase anything that you’ve pushed somewhere.

Added by the content plan (2026-10-11), from the same fetched text:

> they do a git push --force to overwrite the history on the server.

> This is called a “patch-id”.

> If you rebase commits that have been pushed, but that no one else has based commits from, you’ll also be fine.

Added by the fact-check (2026-10-11), from the same fetched text:

> Note that the snapshot pointed to by the final commit you end up with, whether it’s the last of the rebased commits for a rebase or the final merge commit after a merge, is the same snapshot — it’s only the history that is different.

> If you are using git pull and want to make --rebase the default, you can set the pull.rebase config value with something like git config --global pull.rebase true.

> This only works if C4 and C4' that your partner made are almost exactly the same patch.

Contents:
- The Basic Rebase (replay onto target, fast-forward afterwards, linear history)
- More Interesting Rebases (--onto, rebasing topic onto base)
- The Perils of Rebasing (do not rebase public commits; force-push fallout)
- Rebase When You Rebase (patch-id, git pull --rebase, pull.rebase)
- Rebase vs. Merge (history as record vs. story)

## Git - git-reflog Documentation
URL: https://git-scm.com/docs/git-reflog
Version: git-reflog manual, last updated in Git 2.51.1 (as fetched 2026-10-11)

> Reference logs, or "reflogs", record when the tips of branches and
> other references were updated in the local repository.

> The reflog covers all recent
> actions, and in addition the HEAD reflog records branch switching.

> The "expire" subcommand prunes older reflog entries.

> Prune entries older than the specified time. If this option is
> not specified, the expiration time is taken from the
> configuration setting gc.reflogExpire, which in turn
> defaults to 90 days.

> Prune entries older than <time> that are not reachable from
> the current tip of the branch. If this option is not
> specified, the expiration time is taken from the configuration
> setting gc.reflogExpireUnreachable, which in turn defaults
> to 30 days.

> Reflogs are
> useful in various Git commands, to specify the old value of a
> reference.

Added by the content plan (2026-10-11), from the same fetched text:

> For example, HEAD@{2} means "where HEAD used to be two
> moves ago"

> record when the tips of branches and
> other references were updated in the local repository.

Added by the fact-check (2026-10-11), from the same fetched text:

> The "expire" subcommand prunes older reflog entries. Entries older
> than expire time, or entries older than expire-unreachable time
> and not reachable from the current tip, are removed from the reflog.
> This is typically not used directly by end users — instead, see
> git-gc[1].

Contents:
- Synopsis of subcommands (show, list, exists, write, delete, drop, expire)
- Description (reflog records ref tip updates; HEAD@{n} and branch@{time} syntax)
- Options for expire (--expire, --expire-unreachable, --rewrite, --updateref, --stale-fix, --dry-run)
## Git - git-rebase Documentation
URL: https://git-scm.com/docs/git-rebase
Version: git-rebase last updated in 2.54.0 (2026-04-20); current docs as fetched 2026-10-11

> git-rebase - Reapply commits on top of another base tip

> Transplant a series of commits onto a different starting point.

> You can also use git rebase to reorder or combine commits: see INTERACTIVE

> You want to transplant the commits you made on topic since it diverged from

> Make a list of all commits on your current branch since it branched

> Replay the commits, one by one, in order. This is similar to running

> git rebase --onto master next topic

> git rebase --onto master topicA topicB

> Starting point at which to create the new commits. If the

> Rebasing interactively means that you have a chance to edit the commits

> By replacing the command "pick" with the command "edit", you can tell

> If you just want to edit the commit message for a commit, replace the

> To drop a commit, replace the command "pick" with "drop", or just

> If you want to fold two or more commits into one, replace the command

> Automatically squash commits with specially formatted messages into

> "squash! ", "fixup! " or "amend! ", the remainder of the title

> In the rebase todo list, the actions of squash, fixup and amend commits are

> Setting configuration variable rebase.autoSquash to true enables

> By default, a rebase will simply drop merge commits from the todo

> With --rebase-merges, the rebase will instead try to preserve

> $ git rebase -i -r --onto Q O

> Rebasing (or any other form of rewriting) a branch that others have

> manually fix their history. This section explains how to do the fix

> Such duplicates are generally frowned upon because they clutter up

> $ git rebase --onto subsystem subsystem@{1}

> The ripple effect of a "hard case" recovery is especially bad:

> Individually replay all rebased commits instead of fast-forwarding

Added by the content plan (2026-10-11), from the same fetched text:

> Make a list of all commits on your current branch since it branched
> off from <upstream> that do not have an equivalent commit in
> <upstream>.

> The previous branch
> tip, however, is accessible using the reflog of the current branch

> Individually replay all rebased commits instead of fast-forwarding
> over the unchanged ones. This ensures that the entire history of
> the rebased branch is composed of new commits.

> If there is a merge conflict during this process, git rebase will stop at the
> first problematic commit and leave conflict markers.

> when a merge
> conflict happens, the side reported as ours is the so-far rebased
> series, starting with <upstream>, and theirs is the working branch.
> In other words, the sides are swapped.

> If you want to fold two or more commits into one, replace the command
> "pick" for the second and subsequent commits with "squash" or "fixup".

> changed from pick to squash, fixup or fixup -C, respectively, and they
> are moved right after the commit they modify.

> Append "exec <cmd>" after each line creating a commit in the
> final history.

> Automatically force-update any branches that point to commits that
> are being rebased.

> Setting configuration variable rebase.autoSquash to true enables
> auto-squashing by default for interactive rebase.

> If the commits had different authors, the folded commit will be
> attributed to the author of the first commit.

Added by the fact-check (2026-10-11), from the same fetched text:

> Instead of using the current time as the committer date, use
> the author date of the commit being rebased as the committer
> date.

> Note that commits which start empty are kept (unless --no-keep-empty
> is specified), and commits which are clean cherry-picks (as determined
> by git log --cherry-mark ...) are detected and dropped as a
> preliminary step (unless --reapply-cherry-picks or --keep-base is
> passed).

> When using the merge backend, warnings will be issued for each
> dropped commit (unless --quiet is given).

> Note the reversal of ours and
> theirs as noted above for the -m option.

> are moved right after the commit they modify. The --interactive option can
> be used to review and edit the todo list before proceeding.

> If --autosquash is used, exec lines will not be appended for
> the intermediate commits, and will only appear at the end of each
> squash/fixup series.

> When starting the rebase, ORIG_HEAD is set to point to the commit at the tip
> of the to-be-rebased branch.

> Any branches that are checked out in a worktree
> are not updated in this way.

Contents:
- NAME, SYNOPSIS, DESCRIPTION (replay steps, conflict handling with --continue/--skip/--abort, ORIG_HEAD note)
- TRANSPLANTING A TOPIC BRANCH WITH --ONTO (next to master, partial branch, removing a commit range)
- MODE OPTIONS: --continue, --skip, --abort, --quit, --edit-todo, --show-current-patch
- OPTIONS: --onto, --keep-base, <upstream>, <branch>, --apply, --empty, --no-keep-empty/--keep-empty, --reapply-cherry-picks, --allow-empty-message, -m/--merge, -s/--strategy, -X/--strategy-option, --rerere-autoupdate, -S/--gpg-sign, -q, -v, --stat, -n/--no-stat, --no-verify/--verify, -C<n>, --no-ff/--force-rebase/-f, --fork-point, --ignore-whitespace, --whitespace, --committer-date-is-author-date, --ignore-date/--reset-author-date, --signoff, --trailer, -i/--interactive, -r/--rebase-merges, -x/--exec, --root, --autosquash, --autostash, --reschedule-failed-exec, --update-refs
- INCOMPATIBLE OPTIONS
- BEHAVIORAL DIFFERENCES (apply vs merge backend: empty commits, directory rename detection, context, conflict labels, hooks, interruptability, commit rewording)
- MERGE STRATEGIES
- NOTES
- INTERACTIVE MODE (pick, edit, break, reword, drop, squash, fixup/-c/-C, exec)
- SPLITTING COMMITS
- RECOVERING FROM UPSTREAM REBASE (easy case, hard case)
- REBASING MERGES (label, reset, merge commands)
- CONFIGURATION: rebase.backend, rebase.stat, rebase.autoSquash, rebase.autoStash, rebase.updateRefs, rebase.missingCommitsCheck, rebase.instructionFormat, rebase.abbreviateCommands, rebase.rescheduleFailedExec, rebase.forkPoint, rebase.rebaseMerges, rebase.maxLabelLength, sequence.editor
- Note: the page contains no mention of --force-with-lease.

## Git - Git Objects
URL: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
Version: Pro Git 2nd edition, as fetched 2026-10-11 (added by the content plan)

> This is the SHA-1 hash — a checksum of the content you’re storing plus a header

> The format for a commit object is simple: it specifies the top-level tree for the snapshot of the project at that point; the parent commits if any

Added by the fact-check (2026-10-11), from the same fetched text:

> All Git objects are stored the same way, just with different types – instead of the string blob, the header will begin with commit or tree.

Contents:
- Blobs, trees and commits as content-addressed objects; a commit names its tree, its parents, author/committer and message

## Git source: builtin/bisect.c at v2.43.0
URL: https://raw.githubusercontent.com/git/git/v2.43.0/builtin/bisect.c
Version: tag v2.43.0 (the Git the examples ran on), fetched 2026-10-11 (added by the fact-check). Raw C; the text tool strips anything between `<` and `>`, so only lines without those characters are quoted.

> * Exit code 126 and 127 can either come from the shell
> * if it was unable to execute or even find the script,
> * or from the script itself. Check with a known-good
> * revision to avoid trashing the bisect run due to a
> * missing or non-executable script.

> if (is_first_run && (res == 126 || res == 127)) {

Contents:
- `bisect_run`: runs the command, re-checks a first-run 126/127 on the good commit (`verify_good`), maps 125 to skip, 0 to good, other codes below 128 to bad, aborts otherwise. No `--reset-when-found`.

## Git source: builtin/bisect.c at v2.56.0
URL: https://raw.githubusercontent.com/git/git/v2.56.0/builtin/bisect.c
Version: tag v2.56.0 (current release per the git-bisect page), fetched 2026-10-11 (added by the fact-check). Identical to master as fetched the same day.

> * Exit code 126 and 127 can either come from the shell

> if (is_first_run && (res == 126 || res == 127)) {

> error(_("bogus exit code %d for '%s' revision"),

> printf(_("bisect found first '%s' commit\n"), terms->term_bad);

> if (argc && !strcmp(argv[0], "--reset-when-found")) {

Contents:
- Same `bisect_run` logic as 2.43; messages now quote the term ('good', 'bad'); `--reset-when-found` handling added.

## Git source: bisect.c at v2.43.0
URL: https://raw.githubusercontent.com/git/git/v2.43.0/bisect.c
Version: tag v2.43.0, fetched 2026-10-11 (added by the fact-check)

> printf("%s is the first %s commit\n", oid_to_hex(bisect_rev),

> printf(_("We cannot bisect more!\n"));

Contents:
- Prints the full object name (`oid_to_hex`) of the first bad commit; "Bisecting: %d revisions left to test after this"; the skipped-commits message.

## Git source: bisect.c at v2.56.0
URL: https://raw.githubusercontent.com/git/git/v2.56.0/bisect.c
Version: tag v2.56.0, fetched 2026-10-11 (added by the fact-check)

> printf("%s is the first '%s' commit\n", oid_to_hex(bisect_rev),

> "The first '%s' commit could be any of:\n", term_bad);

> printf(_("We cannot bisect more!\n"));

> "Bisecting: %d revisions left to test after this %s\n",

Contents:
- Same messages as 2.43 except that the term is quoted ('bad').

## Git source: sequencer.c at v2.43.0 and v2.56.0 (todo-list format)
URL: https://raw.githubusercontent.com/git/git/v2.56.0/sequencer.c
Version: tag v2.56.0, fetched 2026-10-11 (added by the fact-check; v2.43.0 fetched alongside for comparison, same code paths)

> strbuf_addf(out, "%s %s ", insn,

> if (item->command == TODO_FIXUP) {

> warning(_("skipped previously applied commit %s"),

Contents:
- `make_script` writes "<command> <id> <subject>"; `todo_list_to_strbuf` writes "fixup [-C|-c] <id> <subject>". Same in 2.43.0, so the step-3 todo lines are what current Git shows too.

## Git 2.44 release notes
URL: https://raw.githubusercontent.com/git/git/v2.44.0/Documentation/RelNotes/2.44.0.txt
Version: Git v2.44.0 (2024-02-23), fetched 2026-10-11 (added by the fact-check)

> "git rebase --autosquash" is now enabled for non-interactive rebase,
> but it is still incompatible with the apply backend.

Contents:
- UI changes in 2.44, including non-interactive --autosquash.

## Git 2.55 release notes
URL: https://raw.githubusercontent.com/git/git/v2.55.0/Documentation/RelNotes/2.55.0.adoc
Version: Git v2.55.0 (2026-06-29), fetched 2026-10-11 (added by the fact-check)

> "git bisect" now uses the selected terms (e.g., old/new) more
> consistently in its output.

> "git history" learned "fixup" command.

Contents:
- UI changes in 2.55, including bisect output wording and the experimental `git history` command.

## Git 2.56 release notes
URL: https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/RelNotes/2.56.0.adoc
Version: Git v2.56.0 (2026-09-28), fetched 2026-10-11 (added by the fact-check)

> The 'git bisect' command has been taught a

> automatically run 'git bisect reset' to jump back to the original
> state or to the found culprit.

> The experimental 'git history' command has been taught a new 'drop'
> subcommand to remove a commit, with its descendants replayed onto its
> parent.

Contents:
- UI changes in 2.56, including `git bisect --reset-when-found` and `git history drop`.
