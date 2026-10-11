# REVIEW — Git branching and history workflows (refresher)

## Content review (Opus, 2026-10-11)

Read in sequence: `python-essentials` (reel steps, registry entry, Deep dive headings), then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, `coverage.json`, registry entry, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md` (claims list 1–67), `expert.json`, the fetched texts in `sources/`, and the next syllabus line (Linux shell and process toolkit). Paths below are relative to this folder unless given in full. Nothing outside this file was changed.

**Totals: 34 findings, 4 major, 30 minor.** Majors: 1, 7, 20, 21.

Overall: the topic is well sourced and unusually careful about versions, and every reel number traces to `examples.sh`. The bridge from Python and the handoff to the shell are smooth, and the shape-search-share order matches what the opening promises. The majors are one predict question that can't be answered as asked, a "What's changing" section that leaves out the history-editing changes already in the fetched release notes, executed evidence that is 13 releases old, and a PR-landing decision with no trade-offs.

---

### Flow

**1. Step 7's predict question doesn't say what is being counted. (major)**
Fixed: the full question is in step 7's body and narration (a three-commit PR squash-merged, one commit added, a new PR: how many commits does it list), and the question frame shows a '+1 commit on the same branch' cue under the lanes.
- *Where:* `reel.tsx` step "Three ways to land a PR" (body and `predict`); `narration.json` step 7; `scenes.tsx` `Landing` question frame.
- *What:* the question is "What if you keep using the branch after a squash?", but the options are bare numbers ("1", "4", "0", "2: the squash and the new one"). The learner is never told that one new commit is added, that a new PR is opened, or that the answer counts commits shown in that PR. The question frame shows the three landing lanes and nothing about reuse. The question can't be answered as posed. Only the explanation reveals the scenario ("the new PR shows them again with the new one").
- *Evidence:* `OUTLINE.md` step 7 had the complete question: "You squash-merged the PR. Then you add one commit to the same branch and open a new PR. How many commits does it show?" The build shortened it to "What if you keep using the branch after a squash?", and the narration says the same ("So what happens if you keep using the branch after a squash?").
- *Fix:* restore the full question in the body and the narration, e.g. "You squash-merged the 3-commit PR, then add one commit to the same branch and open a new PR. How many commits does it list?" Also consider a small "+1 commit → new PR?" cue in the question frame.

**2. Exit codes (and signals) are used before the shell refresher teaches them, and the reel never says what an exit code is. (minor)**
Fixed: step 6 now says the exit status is the number every command ends with and 0 means success; the Deep dive glosses a signal crash as 128 plus the signal number and points to the shell refresher. The `exit-status` ledger entry is unchanged.
- *Where:* step 6 body ("Exit 0 means good, 1 to 127 means bad…"); `index.mdx` "Bisect" (126/127 as shell codes, "a segfault's 139"); registry `introduces: [..., 'exit-status', ...]`.
- *What:* the next refresher's syllabus line owns "the process model (fork/exec, signals, exit codes)". This topic introduces `exit-status` first, and the Deep dive uses 128+signal (139) and the shell's 126/127 with no explanation. The handoff ("where exit codes … come from") admits the order. On screen, though, the term is never defined: only the narration says "it reads just one thing back: the exit code".
- *Evidence:* `syllabus/data-engineering.md` line 55; registry entry `introduces`; `narration.json` step 6 line 2 compared with `reel.tsx` step 6 body.
- *Fix:* add one clause to the step 6 body: "every command ends with a number, its exit status; 0 means success". In the Deep dive, gloss 139 as "128 + signal 11 (SIGSEGV), more in the shell refresher". Keep `exit-status` limited in the ledger, as `OUTLINE.md` intends ("only as bisect reads it").

**3. log₂ is used before the logarithms refresher, and the concept ledger doesn't record it. (minor)**
Fixed: step 5's explanation gives 2^10 = 1,024 (asserted in examples.py); the outcome and the Deep dive say what log2 N means. No `uses` entry added.
- *Where:* step 5 explanation ("log₂ 1,000 ≈ 10"); outcomes ("about log₂ N test runs"); `index.mdx` "Bisect"; registry `uses: []`.
- *What:* the "Asymptotic notation and logarithms" refresher is 5th of 5, three topics later, yet log₂ appears here without a gloss. `de.io-cost-model` lists `logarithms` in `uses`; this topic leaves it out. Under Rule #5, a prerequisite found later in the same domain is "a syllabus bug". Here it is simpler to explain it on the spot.
- *Evidence:* `syllabus/data-engineering.md` line 57; `registry.ts` line 81 compared with line 62.
- *Fix:* explain it on the spot in the step 5 explanation: "log₂ 1,000 ≈ 10, because 2¹⁰ = 1,024: ten halvings take 1,024 suspects to one". That avoids adding a `uses` entry that no earlier live topic introduces.

**4. "CI" is used undefined, before the Software delivery refresher. (minor)**
Fixed: CI is glossed at first use (step 7 body, narration says 'automated build and test checks'); step 8 and the Trunk label say 'checks'; the Deep dive expands CI.
- *Where:* step 7 body ("asks for review and CI"); step 8 body ("exist for review and CI"); `scenes.tsx` Trunk label "review + CI".
- *What:* CI pipelines are taught in "Software delivery workflow", two refreshers later. The term is never expanded here.
- *Evidence:* `syllabus/data-engineering.md` line 56.
- *Fix:* at first use, write "CI (automated build and test checks)". The narration already says "checks".

**5. The Prerequisites panel credits the Python refresher with `assert` and exit status, which it doesn't teach. (minor)**
Fixed: the panel now says `assert` is not covered by the Python refresher, explains it in one sentence, and links the Python reference (SOURCES.md has the quote).
- *Where:* `prerequisites.mdx` section 03 ("If functions and `assert` are familiar from the Python refresher…").
- *What:* `python-essentials` (reel and `index.mdx`) never mentions `assert` or a script's exit status. The check-yourself answer ("exits with a non-zero status") is new material, not a recap.
- *Evidence:* `grep -n assert python-essentials/index.mdx python-essentials/reel.tsx` finds no `assert` statement.
- *Fix:* reword to "functions from the Python refresher, plus `assert`: a failing one raises `AssertionError`, and an uncaught exception ends the script with exit status 1". Add a link to the Python docs for the `assert` statement.

**6. The running example is never introduced, and branch names change with every step. (minor)**
Fixed: step 2 names `clean.py` and branch `dedupe`, step 3 names branch `emails`, and the Tidy drawing labels `emails@{1}` as 'branch emails, one reflog entry back'.
- *Where:* steps 2–7 (`dedupe`, then `emails@{1}`, then `HEAD`/`casefold`, then `clean.py` with 1,000 commits, then `dedupe` again); `scenes.tsx` `Tidy` (`emails@{1}` on screen).
- *What:* `OUTLINE.md` planned "a living commit graph of one small repo, the data-cleaning script `clean.py`". The reel never says so, so each step opens on unfamiliar names. `@{1}` is shown without its meaning being given on screen (the body only says "one reflog entry back").
- *Evidence:* `OUTLINE.md` "The reel: 9 steps" first paragraph; `reel.tsx` steps 2–7.
- *Fix:* add half a sentence in step 2: "our repo: `clean.py`, a data-cleaning script; branch `dedupe` adds deduplication". In step 3 write "`emails@{1}`, the branch one reflog entry back".

---

### Gap hunt

**7. "What's changing" leaves out the history-editing changes already in the fetched 2.55/2.56 release notes, and lists a 2022 feature as new. (major)**
Fixed: What's changing now has `git history` (experimental, fixup in 2.55, drop in 2.56), `git add --resolved`, `git replay --linearize` and `git branch --delete-merged` (skips squash-merged branches), each with the manual-page and release-note quotes in SOURCES.md; `--update-refs` left the frontier; the scan is recorded in SOURCES.md and coverage.json.
- *Where:* `index.mdx` section "What's changing".
- *What:* the frontier section has merge queues, `--update-refs` and `--reset-when-found`. The release notes this topic fetched and quotes in `SOURCES.md` also announce the following, all directly on the syllabus clauses "interactive history cleanup" and "conflict resolution":
  - the experimental **`git history`** command ("learned 'fixup'" in 2.55; a `drop` subcommand "with its descendants replayed onto its parent" in 2.56);
  - **`git add --resolved`** in 2.56 ("to stage conflict-resolved paths … scans the unmerged paths for leftover conflict markers and aborts if any are found");
  - **`git replay --linearize`** in 2.56 ("mimicking 'git rebase --no-rebase-merges'");
  - **`git branch --delete-merged`** in 2.56. It does not catch squash-merged branches, which is relevant to step 7's advice to "retire the branch".

  `OUTLINE.md` listed `git history` as an optional frontier item (claim 67), with a condition to fetch its manual page first. That item was dropped silently, and "Changes after final" names the other dropped bullets but not this one. `--update-refs` is not "changing": it is long-standing (the OUTLINE itself calls its version "unsourced").
- *Evidence:* `sources/raw_githubusercontent_com_git_git_v2_55_0_Documentation_RelNotes_2_55_0_adoc.txt` line 31; `sources/raw_githubusercontent_com_git_git_v2_56_0_Documentation_RelNotes_2_56_0_adoc.txt` lines 41–43, 89–93, 107–109, 150–152. PROJECT_PLAN "Correctness and currency" §6 (a state-of-the-art scan of the latest releases).
- *Fix:* fetch the `git-history` and `git-replay` manual pages (and the 2.56 `git-add` page). Then add one bullet per item with the version and its experimental status. Move `--update-refs` to "Rewriting history safely" (it is already there) and drop it from the frontier. Record the scan in `SOURCES.md`.

**8. GitHub Flow is never mentioned, but `coverage.json` marks "comparison with GitHub Flow and Gitflow" as covered. (minor)**
Fixed: a GitHub Flow bullet in 'Branching models' (release from the branch against from the trunk, and the regression risk), quoted from the TBD page.
- *Where:* `coverage.json`, Trunk Based Development item 5, mapped to `deep=Branching models`; `index.mdx` "Branching models".
- *What:* "Branching models" discusses GitFlow only. The fetched TBD page has a GitHub Flow section: it is "very close to PR-centric Trunk-Based Development", and "the crucial difference is where the release is performed from" (released from the branch before it is merged back). This is the model most readers' teams actually use.
- *Evidence:* `sources/trunkbaseddevelopment_com_alternative_branching_models_.txt` lines 78–110.
- *Fix:* add one bullet comparing GitHub Flow with TBD (release from the branch compared with release from trunk, and the regression risk the page names). Otherwise, change the coverage row to `out`.

**9. Rebase's default `--fork-point` is marked covered, but only `merge-base --fork-point` is taught. (minor)**
Fixed: 'Merge and rebase, precisely' has a bullet on rebase's `--fork-point` default (and `--no-fork-point`, `rebase.forkpoint`); the coverage row points at both headings.
- *Where:* `coverage.json`, git-rebase "Option: --fork-point" mapped to `deep=Commits, IDs and the graph`; `index.mdx` line 28.
- *What:* the trap a senior hits is that `git rebase` with no upstream argument (and so `git pull --rebase`) defaults to `--fork-point`. Using the upstream's reflog, it can drop commits from the branch. The Deep dive explains only `git merge-base --fork-point`.
- *Evidence:* `sources/git_scm_com_docs_git_rebase.txt` lines 1076–1078: "If <upstream> or --keep-base is given on the command line, then the default is --no-fork-point, otherwise the default is --fork-point."
- *Fix:* add one sentence to "Merge and rebase, precisely" that names the default and the `--no-fork-point` / `rebase.forkPoint` escape hatch.

**10. Revert-a-merge: the way to undo the revert is missing, but the expert item is marked covered. (minor)**
Fixed: 'revert the revert' added, quoted from the revert-a-faulty-merge How-To (fetched from the v2.56.0 source tree).
- *Where:* `index.mdx` "Rewriting history safely", bullet "Undoing on shared history"; `coverage.json` expert item ("…unless you revert the revert").
- *What:* the Deep dive says a later re-merge "won't bring them back" and stops there. Knowing how to undo it is part of the item, and of what a reader needs on the day it happens.
- *Evidence:* `sources/git_scm_com_docs_git_revert.txt` lines 452–458 ("later merges will only bring in tree changes introduced by commits that are not ancestors of the previously reverted merge … See the revert-a-faulty-merge How-To").
- *Fix:* add "to bring them back, revert the revert (see the revert-a-faulty-merge How-To)". Fetch the How-To so the claim has a source.

**11. Branch protection: required reviews and rulesets are missing; the expert item is marked covered. (minor)**
Fixed: the branch protection bullet adds required approving reviews (including code owners) and that only one protection rule applies at a time, which rulesets avoid.
- *Where:* `index.mdx` "Landing a pull request", bullet "Branch protection enforces the flow"; `coverage.json` expert item "Branch protection … required reviews …".
- *What:* the bullet lists status checks, strict mode and linear history, but not required approving reviews or code-owner approval, which are the review half of "PR flow". It also leaves out that only one protection rule applies to a branch at a time, which rulesets avoid. Rulesets are now GitHub's recommended mechanism.
- *Evidence:* `sources/docs_github_com_en_repositories_configuring_branches_and_merges_in_your_repository_managing_protected_branches_about_pro.txt` lines 291, 323–327.
- *Fix:* add required reviews (including code-owner approval) and one sentence on rulesets, with the source.

**12. The release-branch item is thinner than its expert-list entry. (minor)**
Fixed: fix on the trunk first, never fix on the release branch and cherry-pick back, and `cherry-pick -x` (git-cherry-pick quote) are in 'Branching models'.
- *Where:* `index.mdx` "Branching models", bullet 2; `coverage.json` expert item "Release branches … do not develop on the release branch; cherry-pick -x records the source commit".
- *What:* the bullet has "cut just in time" and "cherry-picked from the trunk". It leaves out "fix on trunk first, never on the release branch", which is why this avoids regressions, and `cherry-pick -x` for traceability.
- *Evidence:* `sources/trunkbaseddevelopment_com_branch_for_release_.txt`; `expert.json` item 24.
- *Fix:* add both, quoting the branch-for-release page. For `-x`, quote the git-cherry-pick doc (fetch it), or drop `-x` from the coverage row.

**13. git-rebase rows marked covered that the Deep dive never mentions. (minor)**
Fixed: clauses for `--rerere-autoupdate` and for `--committer-date-is-author-date` / `--ignore-date` added; the `ort` coverage row now points at 'Merge and rebase, precisely'. The `rerere.autoUpdate` config name is left out because no fetched source names it.
- *Where:* `coverage.json`, git-rebase "Option: --rerere-autoupdate" mapped to `deep=Conflicts`, and "Options: --no-ff, --force-rebase, -f, --committer-date-is-author-date, --ignore-date" mapped to `deep=Merge and rebase, precisely`. Also "Merge strategies: ort is the default" mapped to `deep=Conflicts`, though `ort` is in "Merge and rebase, precisely".
- *What:* `index.mdx` never mentions `--rerere-autoupdate` / `rerere.autoUpdate`, `--committer-date-is-author-date` or `--ignore-date`.
- *Evidence:* the strings are absent from `index.mdx`.
- *Fix:* either add a short clause for each (rerere: "`rerere.autoUpdate` also stages it"; dates: "`--committer-date-is-author-date` keeps IDs stable for tooling") or mark the rows `out` with a reason. Correct the `ort` location.

**14. zdiff3 is recommended, but how it differs from diff3 is not explained. (minor)**
Fixed: 'Markers and styles' says zdiff3 moves matching lines at the start or end out of the conflict. The doc's two-snippet example was not copied in.
- *Where:* step 4 body; `index.mdx` "Conflicts", bullet "Markers and styles".
- *What:* the reel says "set it to `zdiff3`", and the Deep dive treats `diff3` and `zdiff3` as the same. A sceptical reader asks why zdiff3. The answer is in the fetched doc: it moves matching lines at the start or end of the conflict region out of it, so the conflict is smaller. In the reel's one-line example the two styles give the same output, so nothing shows the difference.
- *Evidence:* `sources/git_scm_com_docs_git_merge.txt` lines 1036–1070 (side-by-side example) and 1338–1341.
- *Fix:* add one sentence (and optionally the doc's two-snippet example) to "Markers and styles".

**15. Oracle red-team: the codes real test runners return are missing. (minor)**
Fixed: a pytest bullet (exit codes 0 to 5 from the pytest docs, and the wrapper that maps 2 to 5 to 125); the wrapper's logic is executed in examples.sh with stand-in exit codes.
- *Where:* `index.mdx` "Bisect", bullet "The oracle, red-teamed"; "In production", bullet "Bisect blames the wrong commit".
- *What:* the audience runs `pytest`, not bare `assert` scripts. pytest exits 2 when interrupted, 3 on an internal error, 4 on a usage error and 5 when no tests are collected, for example on an old commit where the test file doesn't exist. Bisect reads every one of these as "bad". The red-team covers `ImportError` and `-O` but not the oracle most readers will actually write.
- *Evidence:* the bands in `sources/git_scm_com_docs_git_bisect.txt` ("between 1 and 127 … except 125 … bad"). pytest's exit codes need a source: fetch docs.pytest.org "Exit codes".
- *Fix:* add a bullet with a wrapper pattern (`pytest -q tests/test_x.py; rc=$?; [ $rc -le 1 ] && exit $rc || exit 125`), sourced from the pytest docs.

**16. The commit-message item is placed differently in `expert.json` and `coverage.json`. (minor)**
Fixed: expert.json now places the commit-message item here (Commits, IDs and the graph), matching coverage.json and index.mdx. The blind list's other wording was left as the independent reviewer wrote it.
- *Where:* `expert.json` item "Commit messages as part of history" (placement: Software delivery workflow); `coverage.json` maps the same item to `deep=Commits, IDs and the graph`; `index.mdx` line 29 covers it and then defers to Software delivery.
- *What:* the two files disagree, so a reader can't tell which topic owns the item.
- *Fix:* choose one. Covering it here, as `index.mdx` does, is fine; then update `expert.json`'s placement to "here".

**17. `coverage.json` still records the gap review as pending. (minor)**
Fixed: gapReview records this review (by, date, open: []) and a release-notes source with items for the new frontier bullets was added.
- *Where:* `coverage.json` `gapReview` (`"by": "pending content review", "open": []`).
- *Fix:* record this review: by, date, and the open gap items 7–15.

**18. "Try it" doesn't link the script it asks the reader to run. (minor)**
Fixed: Try it links examples.sh and examples.py by their GitHub blob URL on main (the link works once this branch is merged), and says what the script needs and that it only writes to a temp directory.
- *Where:* `index.mdx` "Try it" ("Run `bash examples.sh`, next to this topic's source").
- *What:* readers of the site have no path to `examples.sh`, and this is the §1.1 gate lab in miniature. The Python refresher has the same wording, but its lab doesn't depend on a provided script.
- *Fix:* link the file in the repository (raw or blob URL on the default branch). Say it needs bash, Git and python3, and that it writes only to a temp directory.

**19. "PR flow" covers landing a PR but not updating one under review. (minor)**
Fixed: 'A PR, start to finish' is the first bullet of 'Landing a pull request'.
- *Where:* step 7; `index.mdx` "Landing a pull request".
- *What:* the pieces are spread across sections: rebase or merge to bring the PR up to date, force-push with lease, reviewer `range-diff`, merge queue. Nothing strings them into the life of one PR (open → review → update → land → delete branch). A one-paragraph sequence would make the syllabus clause "PR flow" explicit rather than implied.
- *Fix:* add a short "A PR, start to finish" bullet at the top of "Landing a pull request" that links the existing pieces. No new claims are needed.

---

### Expert reader

**20. Every example was executed on Git 2.43.0 (Nov 2023); the current release is 2.56.0. (major)**
Fixed: Git 2.56.0 was built from the release tarball (no apt needed) and examples.sh ran on it and on 2.43.0; every ID and number is identical. Version-dependent output (todo '#', non-interactive --autosquash, bisect wording, reflog defaults) is printed as keys and asserted per version in examples.py, and the Deep dive states both versions and the differences. The repository's CI still has only 2.43.0; `EXTRA_GIT_BIN=<bin dir> python3 examples.py` runs any further Git. New finding from the 2.56.0 run: the v2.56.0 source (reflog.h) sets the reflog expiry defaults the other way round from git-gc's documentation; the Deep dive says so and the examples pin the ages explicitly.
- *Where:* `index.mdx` "A little deeper" intro and "Sources" ("every example run on Git 2.43.0 … the current release is 2.56.0"); `OUTLINE.md` "Versions"; `examples.py` docstring.
- *What:* the topic quotes current docs (2.54–2.56) but executes 13 minor releases back. It relies on reading source to settle the differences, and the fact-check found three (non-interactive `--autosquash`, bisect wording, `--reset-when-found`). The 2.55 and 2.56 notes also change `ort` ("'ort' merge backend improvements", "hardened"). Every "executed" claim, including the conflict markers, the rebase todo and rerere, is therefore evidence about 2.43 only. PROJECT_PLAN "Correctness and currency" §3 and §7 require examples to run against the pinned version covered ("a page never claims a version it wasn't checked against"). The Python precedent ran on 3.12–3.15 including the current release.
- *Evidence:* `index.mdx` lines 22 and 132; `FACT-CHECK.md` F1, F8, F13, F14, F21; `git --version` here prints 2.43.0.
- *Fix:* run `examples.sh` and `examples.py` on Git 2.56.0 (built from the tag or from a container) as well as 2.43.0. Record both versions in "Sources" and in the `examples.py` docstring. Assert the IDs on both, since they should be identical, and print the version-dependent keys for each.

**21. The PR-landing choice has no trade-offs, only descriptions. (major)**
Fixed: 'Pick by the history you want' became 'What each strategy costs' (merge, squash, rebase-and-merge across bisect, revert, ID stability and branch reuse, with a labelled rule of thumb).
- *Where:* `index.mdx` "Landing a pull request", bullet "Pick by the history you want"; step 7.
- *What:* the decision a senior has to defend for a team ("merge, squash or rebase-and-merge?") gets "A merge commit preserves the full commit history…; rebase-and-merge produces a linear history…". Squash isn't even in that bullet. The costs that decide it are already taught elsewhere in this topic but never connected:
  - **bisect granularity:** squash lands one big commit per PR, so bisect stops at PR resolution. Merge commits keep the small commits, and `--first-parent` bisects by PR.
  - **revert:** one squash commit reverts cleanly. A merge needs `revert -m 1` and has the re-merge trap. Rebase-and-merge needs N reverts.
  - **traceability and tooling:** rebase-and-merge changes IDs and committer, which the Deep dive does mention.
  - **review history:** squash keeps the PR discussion but not the commit story.

  PROJECT_PLAN "Learning design" layer 4 asks for the alternatives, what each costs and where each breaks.
- *Evidence:* `index.mdx` lines 49, 65, 72–76; `sources/git_scm_com_docs_git_bisect.txt` (`--first-parent`); `sources/git_scm_com_docs_git_revert.txt` lines 446–455.
- *Fix:* replace "Pick by the history you want" with a short merge / squash / rebase-and-merge comparison across bisect, revert, ID stability and branch reuse. Every cell can cite a source already fetched.

**22. Step 2's explanation says the ID "covers its parent and its files". That is incomplete, and the fact-check's committer-date correction was not carried into the reel. (minor)**
Fixed: step 2's explanation lists parent, files, author and committer with dates, and message, and keeps the 'demo pins the dates' note; the narration answer matches.
- *Where:* `reel.tsx` step 2 `explain`; `narration.json` step 2 answer.
- *What:* the commit hash also covers author, committer (with dates) and message. A real rebase changes the committer date, so even a replay onto the same parent gets a new ID. `FACT-CHECK.md` F3 called the earlier wording misleading, and the corrected OUTLINE explanation ends "(This demo pins the dates; a real rebase also stamps a new committer date.)". The reel left that sentence out.
- *Evidence:* `OUTLINE.md` step 2 "Explain"; `FACT-CHECK.md` F3; `index.mdx` line 26 (gets it right).
- *Fix:* say "a commit's ID is a hash of its parent, its files, its author and committer with their dates, and its message", or restore the OUTLINE parenthesis.

**23. "The same conflicts come back again and again" is stated without the mechanism, and is overstated for merge-based syncs. (minor)**
Fixed: step 8 (body and narration), the Branching models bullet and In production now say the conflicts return on every rebase or test merge, with the rerere quotes, and that a kept merge resolves once (executed: the merge base moves).
- *Where:* step 8 body and narration; `index.mdx` "Branching models" bullet 3; "In production" ("The same conflicts on every sync of a long-lived branch").
- *What:* once a conflict is resolved in a merge commit, merging the trunk in again starts from the new merge base, so that conflict doesn't recur. Conflicts recur when the branch is repeatedly **rebased** or test-merged and thrown away, which is the scenario rerere describes. A sceptical senior who merges main into their branch weekly will object.
- *Evidence:* `sources/git_scm_com_docs_git_rerere.txt` ("In a workflow employing relatively long lived topic branches, the developer sometimes needs to resolve the same conflicts over and over again"; the DISCUSSION section describes the test-merge and rebase cases); `git-merge-base` (the merge base advances after a merge).
- *Fix:* step 8: "the longer it lives, the bigger the final merge; rebase it to keep up and you resolve the same conflicts again on every rebase". Make the matching change in "In production".

**24. The recap's "merged at least daily" contradicts "a branch should only last a couple of days". (minor)**
Fixed: the recap row reads 'integrate daily; branches last days', and the Deep dive states the two TBD rules separately.
- *Where:* `scenes.tsx` `RECAP` row "Trunk — short-lived branches, merged at least daily"; `index.mdx` line 82.
- *What:* TBD's 24-hour rule is about each developer integrating into trunk. Its branch-length rule is "a couple of days". The recap fuses the two into "each branch merges daily".
- *Evidence:* `sources/trunkbaseddevelopment_com_.txt` ("members commit to trunk at least once every 24 hours"); `sources/trunkbaseddevelopment_com_short_lived_feature_branches_.txt` ("the branch should only last a couple of days").
- *Fix:* "Trunk — everyone integrates at least daily; branches last days, not weeks".

**25. The narration implies the reflog repairs a shared rewrite. (minor)**
Fixed: the narration says 'any rewrite of your own is undoable'.
- *Where:* `narration.json` step 3: "One rule. Never rewrite what others have already pulled." / "And if you do slip... the old branch is one ref-log entry back."
- *What:* "if you do slip", placed after the golden rule, suggests the reflog undoes rewriting shared history. The reflog is local only (`index.mdx` line 50). It restores your branch, not your teammates' clones or the force-pushed remote. The on-screen body says it correctly ("a rewrite is undoable").
- *Fix:* "And any rewrite of your own is undoable: the old branch is one ref-log entry back."

**26. The narration brings back the "behind feature flags" framing the fact-check removed. (minor)**
Fixed: the narration says 'with feature flags and branch by abstraction'.
- *Where:* `narration.json` step 8: "Bigger changes still land in small steps, behind feature flags."
- *What:* `FACT-CHECK.md` F22 replaced "Unfinished work hides behind feature flags" because the fetched text speaks of flags for "hedging on the order of releases" and lists flags, branch by abstraction and "don't break the build" together. The body follows the correction; the narration does not, and it drops branch by abstraction.
- *Fix:* "Bigger changes still land in small steps, with feature flags and branch by abstraction."

**27. Reflog expiry: "at 31 days it was gone" mixes up the commit and its reflog entries. (minor)**
Fixed: the Deep dive talks about entries, adds that the commit object survives (executed: still there, listed by `git fsck --lost-found`) and quotes git-gc's two-week prune grace.
- *Where:* `index.mdx` "Rewriting history safely", bullet "Recovery" ("a lost commit 29 days old survived … at 31 days it was gone").
- *What:* `examples.sh` counts reflog entries (3 → 1 → 0). After the entries expire, the commit object stays in the object store until `git gc` prunes it, and `git fsck --lost-found` can still find it until then. A reader told it's "gone" stops looking. The OUTLINE also lists `gc.pruneExpire` as left out because it is unsourced, so the Deep dive shouldn't imply it either way. The age that matters is the age of the entry, not of the commit.
- *Evidence:* `OUTLINE.md` "Examples to execute" item 7 and "Left out on purpose".
- *Fix:* "an entry for a lost commit dated 29 days ago survived `git reflog expire --all`; at 31 days its entries were gone (the object itself lingers until `gc` prunes it)". Fetch git-gc for the last clause, or leave it out.

**28. `git pull`: "avoids accidental merge commits" is dated framing, since the fetched doc says `--ff-only` is the default. (minor)**
Fixed: 'Pulling' states the `--ff-only` default with the git-pull quote. The independent expert.json item was left as written.
- *Where:* `index.mdx` "Merge and rebase, precisely", bullet "Pulling"; `expert.json` item 4 has the same framing.
- *What:* with no `pull.rebase`/`pull.ff` set, current Git refuses a diverged pull and does not create a merge. The bullet describes pre-2.33 behaviour.
- *Evidence:* `sources/git_scm_com_docs_git_pull.txt` lines 608–610 ("git pull --ff-only … fails if your local branch has diverged … This is the default.") and 723–725.
- *Fix:* "Current Git defaults to `--ff-only`: a diverged pull stops and asks you to choose `--rebase` (or `pull.rebase`) or `--no-rebase`."

**29. Step 3's panel labels and the Deep dive's description of them don't match what is on screen. (minor)**
Fixed: the code panel starts with `$ git rebase -i --autosquash main` and the third todo frame is titled 'after your edit'. The todo is now shown in Git 2.56's format (subject after a '#'), which also corrected SOURCES.md's claim that 2.43 and 2.56 write the same todo.
- *Where:* `scenes.tsx` `Tidy` (title "the todo Git proposes" stays during the `drop` beat); `index.mdx` "Fixup commits" ("…so the reel always shows `-i --autosquash`").
- *What:* (a) the last todo frame includes the reader's own `drop` edit, but it is still labelled as Git's proposal. (b) The reel never shows the command line: the builder replaced the planned `Code` title `git rebase -i --autosquash main` with "as committed". So the Deep dive's claim is false, and a reader on Git ≤ 2.43 who types `git rebase --autosquash` sees nothing happen.
- *Evidence:* `scenes.tsx` lines 103–105; `OUTLINE.md` step 3 ("a `Code` panel titled `git rebase -i --autosquash main`") compared with "Changes after final".
- *Fix:* add `$ git rebase -i --autosquash main` as the first `Code` line or the title, and retitle the third frame "after your edit".

**30. The on-screen bisect output uses Git 2.43's wording, not current Git's. (minor)**
Fixed: the on-screen bisect line is "is the first 'bad' commit" (panel title says it is the 2.56 wording); examples.py asserts the wording per version.
- *Where:* `scenes.tsx` `ExitCodes` code panel: "784d178… is the first bad commit".
- *What:* Git 2.55 and later print "is the first 'bad' commit". The Deep dive notes this, but the reel shows the old line to readers on current Git.
- *Evidence:* `SOURCES.md` "Git source: bisect.c at v2.56.0" (`"%s is the first '%s' commit\n"`); 2.55 release notes.
- *Fix:* show the 2.56 wording. Finding 20's dual-version run makes this assertable.

**31. "When both sides change the same lines" understates when Git conflicts. (minor)**
Fixed: step 4 body and narration say 'same or neighbouring lines'; examples.sh executes the adjacent-lines conflict and the two-lines-apart clean merge.
- *Where:* step 4 body and narration.
- *What:* changes to adjacent lines conflict too. Executed for this review on Git 2.43.0: base `a b c`, one side changes line 1, the other line 2; `git merge` exits 1 with 3 index stages. Readers who expect separate lines to merge cleanly get surprised.
- *Evidence:* the run above (scratch repo, not kept).
- *Fix:* "When both sides change the same or neighbouring lines". Add a Deep dive sentence with a source (Pro Git "Advanced Merging" or the git-merge doc), or cite the executed run in `examples.sh`.

**32. `merge-base` is described as "the point a branch forked at", which is false after the trunk has been merged into the branch. (minor)**
Fixed: merge-base is described as the fork point until the target is merged in, then the merged target commit (executed), with the PR-diff consequence.
- *Where:* `index.mdx` "Commits, IDs and the graph", bullet "Ranges and the fork point".
- *What:* after merging `main` into a branch, `git merge-base main branch` returns that merged `main` commit, not the original fork point. That is why PR diffs shrink after an "Update branch". The sentence also says `A..B` is "what a pull request lists" but doesn't say that the PR's *diff* is taken against the merge base, which is what `expert.json` asks for.
- *Evidence:* `sources/git_scm_com_docs_git_merge_base.txt` ("finds the best common ancestor(s) between two commits to use in a three-way merge").
- *Fix:* "…the best common ancestor that a three-way merge (and a PR's diff) starts from: the fork point until you merge the target in, the last merged target commit after that".

**33. "A squashed commit is attributed to the author of the first commit" doesn't say which squash it means. (minor)**
Fixed: 'In `rebase -i`, a squash/fixup result keeps the first commit's author', and that GitHub's squash decides its own.
- *Where:* `index.mdx` "Rewriting history safely", bullet "Authors".
- *What:* the source is about `rebase -i` squash/fixup. The section sits next to GitHub's "Squash and merge", and GitHub decides that commit's author differently (its own setting, with co-author trailers). A reader will apply it to the wrong one.
- *Evidence:* `sources/git_scm_com_docs_git_rebase.txt` ("If the commits had different authors, the folded commit will be attributed to the author of the first commit.").
- *Fix:* "In `rebase -i`, a `squash`/`fixup` result keeps the first commit's author".

**34. A later 126/127 counts as "bad", but the Deep dive suggests the first-run check protects the whole run. (minor)**
Fixed: the Deep dive and In production say only the first run is re-checked and that later 126/127 count as bad (executed: 'exit127'), so map 'can't run' to 125.
- *Where:* `index.mdx` "Bisect" (exit codes in full); "In production" ("'bogus exit code 127' means the test command wasn't found").
- *What:* the 126/127 re-check only happens on the first run (`is_first_run`). If the command or an interpreter is missing on some older commit later in the run, 127 is read as bad and bisect blames the wrong commit without any error. `examples.sh` already shows "127 on bad commits counts as bad".
- *Evidence:* `sources/raw_githubusercontent_com_git_git_v2_56_0_builtin_bisect_c.txt` lines 1105–1129; `OUTLINE.md` "Examples to execute" item 6.
- *Fix:* add "only the first run is re-checked; after that 126 and 127 count as bad, so map 'can't run' to 125 yourself".

---

**Majors in one line each:**
1. Step 7's predict doesn't say what is counted (one new commit, a new PR, how many commits), so it can't be answered as asked.
7. "What's changing" leaves out `git history` (2.55/2.56), `git add --resolved`, `git replay --linearize` and `branch --delete-merged`, all in the fetched release notes, and lists the old `--update-refs` instead.
20. All executed evidence is from Git 2.43.0 while the topic claims currency with 2.56.0; run `examples.sh` on both.
21. Landing a PR has descriptions but no trade-offs: bisect granularity, revert cost and ID stability for merge, squash and rebase-and-merge.
