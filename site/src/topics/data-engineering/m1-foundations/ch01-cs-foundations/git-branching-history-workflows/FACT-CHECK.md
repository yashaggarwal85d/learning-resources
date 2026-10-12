# FACT-CHECK — Git branching and history workflows (refresher)

- **Date:** 2026-10-11. **Scope:** every claim in `OUTLINE.md` (the claims list 1–61, every step's caption, predict question, options and explanation, the Deep dive plan) and every assertion in `examples.sh`.
- **Method:** each claim re-derived from the fetched text in `sources/*.txt` (not from memory), each cited quote located in context to check that the surrounding sentence supports the claim. Red team: every explanation and every predict option attacked with real Git 2.43.0 in throwaway repos under `/tmp/fc` (scripts `t1.sh`–`t3.sh`, summarised under each finding). Version questions settled against Git's own source code and release notes at the tags, fetched with `node scripts/sources.mjs fetch` (8 new texts in `sources/`, all quoted in `SOURCES.md`).
- **Result:** 26 findings. 16 needed a correction (wrong, misleading, half-true option, version-specific, or broken on current Git); 10 confirm a claim and add evidence or a caveat. **All corrections are applied** in `OUTLINE.md`, `examples.sh` and `SOURCES.md` (listed per finding and in "Change log" at the end). After the changes: `examples.sh` passes on Git 2.43.0 in about 3 s and two runs give identical output; every reel ID and number is unchanged; `node scripts/sources.mjs check` passes (202 quotes, 0 problems).
- **Versions confirmed from the fetched pages:** git-bisect "last updated in 2.56.0" (2026-09-28); git-rebase, git-merge, git-rerere "last updated in 2.54.0" (rebase: "2.55.0 → 2.56.0 no changes"); git-reflog "last updated in 2.51.1". Current release: 2.56.0. Local: 2.43.0.

## Findings

### F1 · Version line (header)
- **Claim:** docs current at the versions listed; examples use only behaviour the current docs still describe.
- **Verdict:** correct as far as it goes, but three behaviours differ between 2.43 and 2.56 and were not all identified (see F8, F13, F14, F21).
- **Evidence:** version blocks in each fetched page (above); release notes 2.44, 2.55, 2.56; `bisect.c` / `builtin/bisect.c` / `sequencer.c` at v2.43.0 and v2.56.0.
- **Correction (applied, OUTLINE "Versions"):** names the three version differences and points here.

### F2 · Claim 2 and Deep dive "Commits, IDs and the graph": the evidence that "a different parent gives a different ID"
- **Claim:** "Executed: rebased commits with identical dates got new IDs."
- **Verdict:** the conclusion is true, the evidence is confounded. The replayed commits also have a **different tree** (they now contain `README.md` and `.python-version` from `main`), so the step-2 run doesn't isolate the parent. The cited Pro Git sentence is about a blob ("the content you're storing"); it covers commits only via the later sentence "All Git objects are stored the same way, just with different types – instead of the string blob, the header will begin with commit or tree."
- **Evidence:** `git commit-tree <same tree> -p main -m same` vs `-p main~1`, same pinned author/committer dates: different IDs (now in `examples.sh`, `parent_alone_changes_id=yes`).
- **Correction (applied):** claim 2 cites the "All Git objects…" quote (added to `SOURCES.md`) and the `commit-tree` run; the Deep dive text says the tree changed too in step 2 and that real rebases also change the committer date.

### F3 · Step 2 predict: explanation and wrong options
- **Claim (explain):** "a commit's ID covers its parent, so every replayed commit gets a new one (here even the dates are unchanged)".
- **Verdict:** misleading. "Dates unchanged" is an artefact of `examples.sh` pinning `GIT_COMMITTER_DATE`; a real rebase stamps the current time as committer date and keeps the author date (git-rebase, `--committer-date-is-author-date`: "Instead of using the current time as the committer date, use the author date of the commit being rebased as the committer date."). Executed in `t1.sh` without the pin: author `2026-01-01 12:00`, committer `2026-10-11 08:32`. A learner would generalise "rebase keeps the dates".
- **Wrong options, attacked:** "They move on top, same IDs" is right only for a no-op rebase (branch already on `main`), not the pictured graph where `main` moved. "Squashed into one commit" and "A merge commit is added" never happen with a plain `git rebase main`. The keyed answer can fail only if a patch were already upstream (fewer than three come back: F5), which the picture rules out. The question holds.
- **Correction (applied):** explain now reads "a commit's ID covers its parent and its files … (This demo pins the dates; a real rebase also stamps a new committer date.)"; a red-team note records the option analysis; `examples.sh` comment says the dates are pinned.

### F4 · Claim 11: `--force-rebase` "is composed of new commits"
- **Verdict:** true in real use, **false under this script's pinned dates**: `git rebase --force-rebase main` on an up-to-date branch rebuilt byte-identical commits (same IDs) because tree, parent, author and committer data were all the same. The docs' guarantee relies on the new committer date.
- **Evidence:** `t1.sh` case 1/1b; now asserted in `examples.sh` (pinned: same IDs; `GIT_COMMITTER_DATE` one day later: new IDs, author date kept → `force_rebase_new_ids=yes`).
- **Correction (applied):** claim 11 and the Deep dive say `-f` replays "with a new committer date, hence new IDs", and warn the builder not to demo `-f` with pinned dates.

### F5 · Claim 7: rebase skips commits already upstream
- **Verdict:** claim correct; the "Executed" evidence was wrong. "Same patch-id before and after" shows only that a replayed commit keeps its patch-id; nothing in the draft exercised the skip.
- **Evidence:** git-rebase: "commits which are clean cherry-picks (as determined by git log --cherry-mark ...) are detected and dropped as a preliminary step (unless --reapply-cherry-picks or --keep-base is passed)" and "When using the merge backend, warnings will be issued for each dropped commit". Executed (`examples.sh`, new): cherry-pick `add dedupe` onto a copy of `main`, rebase a copy of `dedupe` onto it → "warning: skipped previously applied commit …", 2 of 3 replayed (`rebase_skipped_upstream=1`). Limit (Pro Git): "This only works if C4 and C4' that your partner made are almost exactly the same patch." (This is exactly why the squash-reuse case in F17/F18 conflicts.)
- **Correction (applied):** claim 7 cites the new quotes and execution; Deep dive mentions the warning, `--reapply-cherry-picks`, and the "changed patch" limit.

### F6 · Deep dive "Merge and rebase, precisely": "`--ff`, `--no-ff`, `--ff-only` and what each refuses"
- **Verdict:** wrong. Only `--ff-only` refuses ("When not possible, refuse to merge and exit with a non-zero status."); `--ff` falls back to a merge commit ("When not possible … create a merge commit"); `--no-ff` always merges.
- **Correction (applied):** reworded to say exactly that.

### F7 · Claim 10: same end product
- **Verdict:** correct (executed: tree `827c45a` for both). A stronger sentence in the same Pro Git page: "Note that the snapshot pointed to by the final commit you end up with, whether it's the last of the rebased commits for a rebase or the final merge commit after a merge, is the same snapshot — it's only the history that is different." The Deep dive caveat (only when conflicts are resolved the same way) stays.
- **Correction (applied):** quote added to claim 10 and `SOURCES.md`.

### F8 · Claim 18 / step 3 / Deep dive: `--autosquash` `[version]`
- **Verdict:** version-specific, not flagged. Current docs imply `--autosquash` works without `-i` ("The --interactive option can be used to review and edit the todo list before proceeding."); Git 2.44 release notes: ""git rebase --autosquash" is now enabled for non-interactive rebase". On **Git 2.43** it is silently ignored without `-i`.
- **Evidence:** `t1.sh` case 4 and now `examples.sh` (printed, not asserted, since it differs by version): `autosquash_without_i_commits=3` on 2.43 (the `fixup!` commit stays); 2 expected from 2.44.
- **Correction (applied):** claim 18 and the Deep dive flag it `[version]`; the reel keeps `git rebase -i --autosquash`, which works on both; `examples.py` must not assert this key.

### F9 · Step 3: the todo list animation
- **Verdict:** the four todo lines are real and their format is current: `sequencer.c` at v2.43.0 and v2.56.0 builds the same "`<command> <id> <subject>`" and "`fixup [-C|-c] <id> …`" lines (quoted in `SOURCES.md`). But **beat 0 ("pick ×4, fixup third") is not a screen Git shows**: with `--autosquash` the editor already opens on beat 1's order and verbs (the saved todo in `examples.sh` proves it). Animating Git "editing itself" from beat 0 could teach that the user moves the line.
- **Correction (applied):** honesty note in step 3: label beat 0 "as committed" and beat 1 "what Git proposes".

### F10 · Claim 19: `--exec` runs after each commit
- **Verdict:** correct; the draft only checked the rebase succeeded. Now `examples.sh` counts the runs (2 for 2 commits). Nuance quoted: with `--autosquash`, "exec lines will not be appended for the intermediate commits, and will only appear at the end of each squash/fixup series."
- **Correction (applied):** stronger assert; claim 19 and Deep dive updated.

### F11 · Step 5: "Checking one by one could take 999" and the "999" constant
- **Verdict:** off by one. With commit 1 known good and commit 1,000 known bad, the first bad commit is one of **999 suspects** (commits 2–1,000; `git rev-list --count HEAD ^root` = 999, now `suspects=999` in `examples.sh`). A linear scan never has to test the last suspect, so the worst case is **998** tests. `examples.py`'s planned "999 = `history - 1`" constant asserted the wrong number.
- **Wrong option attacked:** "999" was wrong in every reading, but next to an explanation that says 998 it reads as a nitpick; "About 32" (√1,000) and "About 500" (linear average) are never bisect's count on this history.
- **Correction (applied):** explain "Checking the 999 suspects one by one could take 998."; final-frame label "one by one: up to 998"; option "999" → "About 1,000"; values and `examples.py` spec use `suspects == 999` and 998 (= `suspects - 1`).

### F12 · Claim 35: "about log₂ of the range"
- **Verdict:** supported by example only: the docs show "675 revisions left … (roughly 10 steps)" and never say "log₂". The reel's "about 10" holds for every culprit position: `t3.sh` bisected the same 1,000-commit linear history with the culprit at 24 positions (2, 3, 100, 250, 500, 501, 600–698 step 7, 731, 999, 1,000): always found, **9 or 10 runs**.
- **Correction (applied):** explain adds "(9 or 10, depending on where the bug sits)"; claim 35 says the log₂ wording is ours; Deep dive mentions that merges and skips can add steps.

### F13 · Step 6 code panel and claim 36: "784d178 is the first bad commit"
- **Verdict:** not verbatim, and version-specific. Git prints the **full 40-character ID** (`bisect.c` v2.43.0: `printf("%s is the first %s commit\n", oid_to_hex(bisect_rev),`); since 2.55 the term is quoted: v2.56.0 `printf("%s is the first '%s' commit\n", …` → "… is the first 'bad' commit" (2.55 release notes: ""git bisect" now uses the selected terms (e.g., old/new) more consistently in its output."). "bisect found first bad commit" likewise became "bisect found first 'bad' commit".
- **Correction (applied):** panel shows `784d178… is the first bad commit` with a note that the ID is shortened and the wording is 2.43's (2.55+ quotes 'bad'); claim 36 cites both source lines.

### F14 · `examples.sh` version-sensitive greps would fail on current Git
- **Verdict:** **bug.** The draft grepped the literal "bogus exit code 127 for good revision". Git 2.56's source has `error(_("bogus exit code %d for '%s' revision"),` → "for 'good' revision", so the script (and CI on any runner with Git ≥ 2.55) would fail. "We cannot bisect more!" and "Bisecting: %d revisions left to test after this" are unchanged in v2.56.0. Also, `git bisect run`'s own exit status after a 128 abort is 128 on 2.43, not 1 (found while adding the assert), so only "non-zero" is portable.
- **Correction (applied, `examples.sh`):** patterns `bogus exit code 127 for '?good'? revision`, `exit code 255 .*>= 128`, `exit code 128 .*>= 128`; 128 abort asserted as non-zero; the same first-run check now also executed for 126. OUTLINE "Version-sensitive asserts" records this.

### F15 · Step 6 caption "A failing test is the perfect oracle" and claim 45
- **Verdict:** overstated; two real traps for the exact oracle the reel uses (a Python `assert`), both executed:
  - any uncaught exception exits 1, so an `ImportError` on an old commit (module not there yet) counts as **bad** (`import_error_exit=1`);
  - `python3 -O` or `PYTHONOPTIMIZE=1` strips `assert`, so the broken commit **passes** (`assert_exit_with_O=0`); bisect would then blame the known-bad endpoint.
- **Correction (applied):** caption "A test that fails only because of the bug makes the ideal oracle; …"; red-team note in step 6; Deep dive (exit 125 when the test can't run; never `-O`) and Production entries; asserts in `examples.sh`.

### F16 · Claim 44: the 126/127 first-run check
- **Verdict:** the draft called it "observed on 2.43, not in the docs". It is not in the docs, but it **is** in Git's source at both v2.43.0 and v2.56.0 (`builtin/bisect.c`): "Exit code 126 and 127 can either come from the shell if it was unable to execute or even find the script, or from the script itself. Check with a known-good revision to avoid trashing the bisect run due to a missing or non-executable script." + `if (is_first_run && (res == 126 || res == 127)) {`. So it is current behaviour, not a 2.43 quirk. Executed for 127 and 126; in `t3.sh` the re-check ran on commit 1 (the good one) after the first test on commit 500. Only the wording changed (F14).
- **Correction (applied):** claim 44 re-sourced `[source + executed]`; Deep dive drops "on Git 2.43" and gives both message forms.

### F17 · Step 7 predict: the fourth option "A conflict, nothing to show"
- **Verdict:** **half-true option.** In the plan's exact scenario, merging the reused branch into the squashed `main` conflicts (add/add in `dedupe.py`; `t2.sh` A, now `squash_merge_conflict=dedupe.py` in `examples.sh`), so GitHub would show the PR as conflicted. The PR still lists 4 commits, so the keyed answer stands, but a learner who picks "A conflict" can rightly argue. Other options: "1" would be right only after the user rebased and dropped the old commits by hand; "0" never.
- **Correction (applied):** option → "2: the squash and the new one" (never right: the squash commit is on `main`, not in the PR); explain "Here it also conflicts: merging or rebasing that branch onto `main` stops in `dedupe.py`."; answer-frame label "merge or rebase onto main → conflict: dedupe.py".

### F18 · Claim 48 / Deep dive "Landing a pull request": how general the squash-reuse fallout is
- **Verdict:** the example's facts (4 commits, conflict) are right; generalising them is not. GitHub says "can include" and "more likely". Executed (`t2.sh` A3, B; B now in `examples.sh`):
  - a **one-commit** PR squash-merged then reused: the squash has that commit's patch-id, so rebasing the branch onto `main` drops the old commit cleanly ("skipped previously applied commit"); the next PR still shows 2 until you do;
  - with several commits, the combined patch matches none of them and the rebase conflicts;
  - a merge conflicts only if the new work touches what the squash changed (a new commit in an unrelated file merged cleanly, while the rebase still conflicted).
- **Correction (applied):** claim 48 and the Deep dive state the nuance; `examples.sh` asserts the one-commit case (2 → 1).

### F19 · Step 4 caption: "ours is the branch you're rebasing onto"
- **Verdict:** incomplete. git-rebase: "the side reported as ours is the so-far rebased series, starting with <upstream>". At your second commit, "ours" already contains your first commit, replayed. Executed (`t2.sh` C, now in `examples.sh`): stage 2 at commit 2/2 was `u1-m1`, the resolution of commit 1. Also `-X ours/theirs` are reversed the same way ("Note the reversal of ours and theirs as noted above for the -m option.").
- **Correction (applied):** caption "ours is the branch you're rebasing onto, plus your commits replayed so far; theirs is your commit being replayed."; claim 32, claim 63, Deep dive.

### F20 · Claim 26 / Deep dive / Production: reflog "expires after 90 / 30 days"
- **Verdict:** numbers correct and current (git-reflog 2.51.1), and the 29/31/89/91-day executions match. But "expire" means eligible: entries go only when `git reflog expire` runs, "typically not used directly by end users — instead, see git-gc[1]". Detail checked: an entry counts as unreachable if it involves the lost commit, which is why 2 of the 3 entries go at 31 days and 1 remains.
- **Correction (applied):** Deep dive says "kept for at least 30 days", not "deleted on day 30"; quote added (claim 26, claim 65).

### F21 · Claim 43 and frontier: `git bisect --reset-when-found`
- **Verdict:** correct that 2.43 lacks it; now dated: **new in Git 2.56.0** (release notes, as fetched: "The 'git bisect' command has been taught a '--reset-when-found[=]' option that tells the command to automatically run 'git bisect reset' to jump back to the original state or to the found culprit." — the text tool dropped the `<where>` placeholder; absent from v2.43.0 `builtin/bisect.c`, present in v2.56.0).
- **Correction (applied):** claim 43, Deep dive and frontier say "new in Git 2.56.0"; "Left out on purpose" updated. Frontier also gains an optional, clearly-scoped item: the experimental `git history` command ("fixup" in 2.55, "drop" in 2.56, per the release notes), to be dropped unless its manual is fetched.

### F22 · Step 8 caption: "Unfinished work hides behind feature flags"
- **Verdict:** goes beyond the fetched text, which says flags are for "hedging on the order of releases" and lists "feature flags, branch by abstraction and 'don't break the build'" as techniques when "the change [is] more all-encompassing". Also: "at least once every 24 hours" is stated as "the core requirement of Continuous Integration", not of trunk-based development itself (the reel's "at least daily" is fine; the Deep dive now attributes it).
- **Correction (applied):** caption "Bigger changes still land in small steps, with feature flags and branch by abstraction; …"; claims 52 and 54 re-quoted (new quotes in `SOURCES.md`).

### F23 · Claim 14: `pull.rebase`
- **Verdict:** the Deep dive mentions `pull.rebase` but the claim quoted only `git pull --rebase`. Pro Git supports it: "If you are using git pull and want to make --rebase the default, you can set the pull.rebase config value with something like git config --global pull.rebase true."
- **Correction (applied):** quote added to claim 14 and `SOURCES.md`.

### F24 · Exit codes, red-teamed beyond the bands
- **Verdict:** the bands are right (0 good; 1–127 bad except 125; 125 skip; else abort). Edge cases, executed: `exit 256` → status 0 (good!), `sys.exit(256)` → 0, `sys.exit(-1)` → 255 (abort), a segfault → 139 (abort). The docs cover the wrap: "as the value is chopped with & 0377".
- **Correction (applied):** Deep dive mentions the modulo-256 wrap and that a crash aborts; `examples.sh` asserts `exit 256` → 0 and `exit(-1)` → 255; claim 62.

### F25 · "Left out on purpose" and Progress
- **Verdict:** the bullet "exact versions … non-interactive `--autosquash` or `--reset-when-found`: unsourced" is now outdated (F8, F21).
- **Correction (applied):** narrowed to `zdiff3` and `--update-refs`; Progress ticks the fact-check.

### F26 · Claims verified without change
Re-derived from the fetched text, quote located in context, supports the claim as written: **1, 3, 4, 5, 6, 8, 9, 12, 13, 15, 16, 17, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30, 31, 33, 34, 37, 38, 39, 40, 41, 42, 46, 47, 49, 50, 51, 53, 55, 56, 57, 58, 59, 60, 61.** Notes:
- 24/step 3: `emails@{1}` is the right ref (the branch reflog gets one entry per rebase; `HEAD@{1}` would not be the old tip). Rebase doc also: "When starting the rebase, ORIG_HEAD is set to point to the commit at the tip of the to-be-rebased branch."
- 27–29/step 4: the `||||||| 0fd676d` label (abbreviated merge-base ID) is 2.43 output; its length depends on the repository's abbreviation, so treat as printed, not universal.
- 37–40: all executed; skip-adjacent gives 3 candidates (c8, c9, c10), matching "unable to tell exactly which of those commits was the first bad one".
- 46–47: GitHub's rebase-and-merge "Always updates the committer information and creates new commit SHAs", so the step-7 lane 3 label "3 new commits, new IDs" holds even when the branch is already on top of the base.
- 56: "Super scaled is merge/patch queues of course" is a diagram caption on a practitioner site (© 2017-2020): fine for framing, as the plan says.
- Frontier: GitHub's PR docs navigation (fetched page) does list "Merge PR with merge queue", "About stacked PRs" and "Stacked pull requests"; the plan's "fetch before saying more" rule stays.

## Change log

**`OUTLINE.md`:** Versions line (F1); step 2 explain + red-team note (F2, F3); step 3 honesty note (F9); step 4 caption (F19); step 5 explain, option, label, values (F11, F12); step 6 code panel note, caption, red-team note (F13, F15); step 7 option, explain, answer-frame label (F17); step 8 caption (F22); Deep dive: Commits/IDs (F2), Merge and rebase (F4, F5, F6), Rewriting (F8, F10, F20), Conflicts (F19), Bisect (F12, F15, F16, F21, F24), Landing a PR (F17, F18), Branching models (F22); Production (F15, F16); Frontier (F21); Examples to execute + `examples.py` spec (F4, F5, F8, F10, F11, F14, F15, F17, F18, F19); Version-sensitive asserts (F14); Left out (F25); Progress; claims 2, 7, 10, 11, 14, 18, 19, 26, 32, 35, 36, 43, 44, 45, 48, 52, 54 re-sourced; claims 62–67 added.

**`examples.sh`:** (reel IDs and numbers unchanged; still deterministic, about 3 s)
1. `commit-tree` parent-only ID change (F2); `--force-rebase` pinned vs later committer date, author date kept (F4); cherry-pick-then-rebase skip with the warning (F5).
2. `--exec` run count = 2 (F10); non-interactive `--autosquash` printed as `autosquash_without_i_commits`, not asserted (F8).
3. Two-commit rebase: "ours" at commit 2 includes your replayed commit 1 (F19).
4. Squash reuse: merge conflict too (`squash_merge_conflict`), one-commit squash then rebase drops the old commit (F17, F18).
5. Oracle pitfalls `assert_exit_with_O=0`, `import_error_exit=1`; `suspects=999` (F11, F15).
6. Version-tolerant greps for "bogus exit code … revision" and ">= 128"; 128 abort checked as non-zero; 126 first-run check; `exit 256` → 0 and `exit(-1)` → 255 (F14, F16, F24).

**`SOURCES.md`:** new quotes in git-bisect, trunkbaseddevelopment.com, GitHub Docs, Pro Git Rebasing, git-reflog, git-rebase, Pro Git Git Objects; new sources: `builtin/bisect.c` and `bisect.c` at v2.43.0 and v2.56.0, `sequencer.c` at v2.56.0 (v2.43.0 fetched alongside, same code), release notes 2.44.0, 2.55.0, 2.56.0. The C files are raw source passed through the HTML-to-text step, which deletes anything between `<` and `>`, so only lines without those characters are quoted, and no claim rests on a mangled line.

**For the builder:** `examples.py` asserts `suspects == 999` and the constant 998 (not 999 = `history - 1`), may assert the new keys (`parent_alone_changes_id`, `force_rebase_new_ids`, `rebase_skipped_upstream`, `squash_merge_conflict`, `assert_exit_with_O`, `import_error_exit`), and must **not** assert `autosquash_without_i_commits`.
