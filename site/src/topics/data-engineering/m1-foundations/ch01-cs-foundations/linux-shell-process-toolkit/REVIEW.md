# REVIEW — Linux shell and process toolkit (refresher)

## Content review (Fable, 2026-10-11)

Read in sequence: the previous topic `de.git-branching-history-workflows` on its branch (reel step titles, registry entry, Deep dive headings and its "Bisect" section, `REVIEW.md`), then this topic's `OUTLINE.md`, `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, `coverage.json`, `expert.json`, `SOURCES.md`, `FACT-CHECK.md`, `examples.py` and the parts of `examples.sh` the findings touch, the registry entry, this topic's entry in `../CHAPTER.md`, and the syllabus line of the next topic (Software delivery workflow, `syllabus/data-engineering.md:56`). Four pages were re-fetched with `node scripts/sources.mjs fetch` to check claims that have no quote in `SOURCES.md` (Debian `crontab(5)`, the Bash manual's "Signals" node, `pipe(7)`, `rename(2)`, `timeout(1)`). Paths below are relative to this folder unless given in full. Nothing outside this file was changed by the review itself; the fixes below were made afterwards and each finding carries a *Status* line.

**Totals: 20 findings, 3 major, 17 minor.** Majors: 1, 2, 7.

Overall: the topic is carefully sourced and executed, the bridge from bisect's exit codes is earned on screen (steps 2, 4, 5), the fact-check's reel corrections (127 via a misspelt command, the table in `uniq -c` order, the tunnel targeting the bastion) all made it into the build, and the handoff to the CI refresher rests on things the reel teaches. The majors are a contradiction between steps 6 and 7 on the topic's central lesson (the same job gets SIGTERM twice with two different outcomes and no explanation), the "one sentence on threads" that the chapter plan asks for and the outline placed in step 7 but the build dropped (the concept is in `introduces` and topic 7 depends on it), and a batch of Deep-dive content added after the fact-check that has neither a fact-check row nor, for several claims, a quote in `SOURCES.md`. Most minors are plan items the build shortened away from captions, and two fact-check corrections that reached `OUTLINE.md` but not `reel.tsx`.

---

### Flow

**1. The same job gets SIGTERM in step 6 and in step 7, with opposite outcomes and no explanation. (major)**
- *Status:* FIXED. `scenes.tsx` `HungJob` labels the token "no handler here: 143"; the step 7 `explain` and narration say this job has no TERM handler and step 6's job caught it and returned 0. `examples.sh` comments `hung_term` the same way; no number changed.
- *Where:* `scenes.tsx` `Signals` (step 6: `load_orders.py`, bolt `SIGTERM 15`, "flushed and closed", token `0`) and `HungJob` answer frame (step 7: `load_orders.py`, `kill -TERM <pid>`, token `143`); `reel.tsx` step 7 `explain`; `narration.json` step 7 `answer`.
- *What:* step 6 teaches "TERM asks": the job catches it, flushes and returns 0. One step later the same-named job is sent TERM and the picture shows 143, the "killed by TERM" code the learner just learnt in step 5. Nothing on screen or in the narration says why the handler that was there a moment ago is gone. A learner who followed step 6 either concludes the picture is wrong or that a caught TERM can still produce 143.
- *Evidence:* `OUTLINE.md` step 7 answer frame knew this: "(the job's own handler isn't installed here, so TERM ends it with 143; executed)". The build kept the token and dropped the reason: `scenes.tsx` lines 320–323 show `kill -TERM <pid>`, `143`, `kill -KILL <pid>`, "only if it is still there". `examples.sh` line 345–346 (`hung_term=143`, "no handler").
- *Fix:* add one label beside the 143 token, e.g. "no handler here: 143" (13 units, latte), and one clause in the step 7 `explain`: "this job has no TERM handler, so the shell sees 143; step 6's job caught it and returned 0". Or make the hung job catch TERM too and show `0`, which is the lesson step 6 wants reinforced (then `examples.sh` and `examples.py` must change: `hung_term` would be 0).

**2. The one sentence on threads is gone from the reel; `Threads: 2` is on screen with no explanation. (major)**
- *Status:* FIXED. `reel.tsx` step 7 body and `narration.json` step 7 now carry the thread sentence (`Threads: 2`, two threads sharing memory, `ps -L`); the scene line reads `Threads: 2 (ps -L)`. Recap row left as is (the half-row was optional).
- *Where:* `reel.tsx` step 7 body and `explain`; `scenes.tsx` `HungJob` (the line `Threads: 2`); `narration.json` step 7; `Recap` rows; registry `introduces: [..., 'threads-basics', ...]`.
- *What:* `../CHAPTER.md` entry 3 requires "**One sentence on threads:** a process may run several threads that share its memory, and `ps -L` and htop show them. Topic 7 needs this", and entry 7 lists `threads-basics` in its `uses` and puts "two threads of one process" in its Prerequisites. `OUTLINE.md` step 7 placed the sentence in the caption ("`Threads: 2`: two threads sharing this process's memory (`ps -L` lists them)") and in its "idea" ("The one sentence on threads lives here"). The built caption is "`ps` says `S`, and `strace -p` shows `read(4,` and nothing more. What is it doing?"; `Threads: 2` sits on screen as an evidence line that is never read, and the narration never says the word "thread". The only teaching of `threads-basics` is now one Deep-dive paragraph that a reel-only learner never opens.
- *Evidence:* `reel.tsx` lines 96–115; `narration.json` lines 84–97; `OUTLINE.md` step 7 "Caption"; `CHAPTER.md` lines 169, 294, 297.
- *Fix:* restore the clause in the step 7 body (it fits the current length: "`/proc/<pid>/status` says `S` and `Threads: 2`: two threads sharing this process's memory; `ps -L` lists them") and one narration line ("Two threads, sharing the same memory; P-S dash L lists them."). Consider a half-row in the recap's row 6.

**3. `nightly.sh` and `load_orders.py` are used before they are introduced; the running example is never named in the reel. (minor)**
- *Status:* FIXED. Step 4's explain names "the nightly script, `nightly.sh`"; step 6's body names the nightly load job, `load_orders.py`; narration to match.
- *Where:* `reel.tsx` step 4 `explain` ("With `set -euo pipefail` at the top of `nightly.sh`"); `narration.json` step 4 `answer` ("the nightly script"); `scenes.tsx` `Signals` (`load_orders.py` as the child's label, step 6); step 7 body ("The nightly load").
- *What:* `OUTLINE.md` ("Running example, this topic's slice") defines `order_events.jsonl`, `clean.py`, `load_orders` and `nightly.sh`, but the reel never says what they are. Step 2 shows `python3 clean.py` (the Git refresher's script, so that one is known), step 4 names `nightly.sh` as if the learner knew it, step 6 draws `load_orders.py` under `bash` with no word, and step 9 is the first place the crontab line shows `nightly.sh` running. The same kind of finding was the Git review's #6 ("the running example is never introduced").
- *Evidence:* `reel.tsx` lines 64–65, 96–100; `scenes.tsx` lines 268, 302; `OUTLINE.md` line 21.
- *Fix:* one phrase each: in step 4's explain "at the top of the nightly script, `nightly.sh`"; in step 6's body "the nightly load job, `load_orders.py`"; or name both in step 1's caption ("the shop's nightly load: `nightly.sh` runs `clean.py` and `load_orders.py`").

**4. Step 7's question relies on the `ps` state codes, but the legend planned for the caption was dropped, and "`ps` says `S`" is not what `ps` prints. (minor)**
- *Status:* FIXED. Step 7's body says `/proc/<pid>/status` says `S` and `ps` reads `Sl`, and gives the four state letters in one line.
- *Where:* `reel.tsx` step 7 body and `explain`; `narration.json` step 7; `index.mdx` "Looking at processes" ("That is why the hung job reads `Sl`").
- *What:* `OUTLINE.md` step 7's caption carried the legend ("`ps -o pid,stat,wchan`: R runs, S sleeps until an event, D sleeps uninterruptibly (usually I/O), so even a kill waits, Z is a zombie"). The build moved `R`, `D` and `Z` into the answer `explain`, so the three distractors ("Spinning", "Waiting for the disk", "It's a zombie") can only be ruled out by a learner who already remembers the codes; the question frame gives `S` with no key. Also, `examples.sh` line 331 shows STAT is `Sl`, and the Deep dive explains the `l`; the caption's "`ps` says `S`" would be exact for `/proc/<pid>/status` (which is what the screen shows) but not for `ps`.
- *Evidence:* `OUTLINE.md` step 7 "Caption" against `reel.tsx` lines 98–101; `examples.py` line 81.
- *Fix:* put the four letters back into the body in one line ("R runs, S waits for an event, D waits for I/O and ignores even kill until it returns, Z is dead"), and write "`/proc/<pid>/status` says `S`" or "`ps` says `Sl`: sleeping, multi-threaded".

**5. The narrated question of step 3 never states the order of the two redirections, so a listener cannot answer it. (minor)**
- *Status:* FIXED. `narration.json` step 3 has the line "Here the copy comes first, and only then is standard output sent to the log file."
- *Where:* `narration.json` step 3 `lines`.
- *What:* the spoken question is "The shell applies redirections from left to right. And the standard error redirection means, make two a copy of whatever one points at, right now. So where does that error line land?" The order as written (`2>&1` first, then `> out.log`) is only on screen. The whole predict turns on that order; the narration should say it, since the plan's Narration section asks for lines written to be heard.
- *Evidence:* `narration.json` lines 28–35 against `reel.tsx` line 35 and `scenes.tsx` line 101.
- *Fix:* add one line before the question: "Here the copy comes first, and only then is standard output sent to the log file."

**6. Step 2 says "every command is three steps", and its picture gives the child one socket while the caption gives it three. (minor)**
- *Status:* FIXED. "Every program you run is three steps" (reel and narration); the Deep dive says "Every external command"; the child box has sockets 0, 1 and 2.
- *Where:* `reel.tsx` step 2 body ("Every command is three steps"); `narration.json` step 2 ("Every command you type is three steps."); `scenes.tsx` `ForkExecWait` (the child box has only `Sock n="1"`, line 87).
- *What:* builtins (`cd`, `exit`, `export`, `set`) do not fork or exec, and the reel itself relies on that in step 5 (`bash -c 'kill -KILL $$'` kills the shell, not a child). "Every external command" is the precise phrase. The caption's last sentence, "The child starts with the same three open files: 0 standard input, 1 standard output, 2 standard error", is illustrated by a child box with socket `1` only, while the parent has `0`, `1`, `2`; the visual grammar the whole reel rests on ("a process is a box with three sockets") is broken on its first appearance.
- *Evidence:* `scenes.tsx` lines 73–88; `OUTLINE.md` step 2 "Portrait" (the plan drew the sockets on the shell box only, so this is a plan gap the build inherited).
- *Fix:* "Every program you run is three steps" (and "every external command" in the Deep dive); add `Sock` `0` and `2` to the child box so the inheritance is visible, which also sets up step 3.

### Gap hunt

**7. Deep-dive content added after the fact-check has no fact-check row, and several of its claims have no quote in `SOURCES.md`. (major)**
- *Status:* FIXED. Fetched `pipe(7)`, `rename(2)`, `proc_pid_fdinfo(5)`, `proc_pid_io(5)`, `proc_pid_environ(5)`, `timeout(1)`, `pid_namespaces(7)`, the coreutils `mv` node and the Bash manual; quotes added to `SOURCES.md` (215 pass); executed in `examples.sh` with asserts in `examples.py` (PIPE_BUF, EXDEV, `mv` across filesystems, fork-inherited handler, fdinfo/io/environ, TERM wrapper with `wait`, mawk `tolower`, `timeout` 137); "PIPE_BUF" wording corrected to "smaller than"; cron "no login profile" marked as reasoning; post-build table added to `FACT-CHECK.md`. The `mv` and `tolower` clauses were kept because they could be sourced or executed. The second pass over the added paragraphs was done by the content reviewer, not a separate Opus run.
- *Where:* `index.mdx` "Small things that bite", and the additions listed under `OUTLINE.md` → "Build notes: changes from this outline" → "Deep dive additions"; `FACT-CHECK.md` (claims 1–60, R1–R12 only); `SOURCES.md`.
- *What:* the builder added about twenty claims after the Opus fact-check ("Small things that bite", sticky bit and setgid directory, `&>`, `|&`, `noclobber`, `sed -E/-s/-z`, grep's binary notice, `jq` `//`, `@tsv`, `--argjson`, `--stream`, `-e`, `top`, ssh `-D`/`-A`/255, trap timing, SIGHUP on shell exit, dispositions across exec, `fdinfo`/`io`/`environ`) with the note "Every one is executed in `examples.sh` or quoted in `SOURCES.md`". Most are. These are not:
  - "Pipe writes up to `PIPE_BUF` are atomic (4,096 bytes on Linux; not run here)": `pipe(7)` is not in `SOURCES.md` and nothing ran. (Checked: the fetched `pipe(7)` says "(On Linux, PIPE_BUF is 4096 bytes.)", so the claim is right and the quote is one line away.)
  - "`rename()` atomically replaces an existing target … fails with `EXDEV` across filesystems, where `mv` quietly degrades to copy and delete": `rename(2)` is not in `SOURCES.md` (the fetched page has both sentences), and the `mv` behaviour has no source at all (coreutils manual, "mv invocation").
  - "More of `/proc` for triage, from `proc(5)` rather than from this run: `fdinfo` …, `io` …, `environ`": `proc(5)` is not in `SOURCES.md`; the per-file pages (`proc_pid_fdinfo(5)`, `proc_pid_io(5)`, `proc_pid_environ(5)`) were not fetched.
  - "a wrapper that must forward SIGTERM runs the child in the background and `wait`s on it (which returns at once, with a status above 128)": the Bash manual sentence exists ("the wait builtin will return immediately with an exit status greater than 128") but is not quoted in `SOURCES.md`, and `examples.sh` has no trap test (its only `trap` is its own `EXIT` cleanup).
  - "`tolower` is ASCII-only in mawk where `str.lower()` is Unicode": neither run (no non-ASCII value in `examples.sh`) nor quoted.
  - cron: "there is no login profile" is reasoning, not a quote (the fetched Debian `crontab(5)` says only SHELL, LOGNAME and HOME are set; it does not mention PATH either, so the reel's "no shell PATH" is right).
  Rule #3 and ROUTINE.md 2.3 want every claim re-derived from a source it opened; `sources.mjs check` can only prove the quotes that exist. The fact-check also removed one unsourced aside ("which is how `passwd` works") for exactly this reason, so the standard is set.
- *Evidence:* `OUTLINE.md` lines 380–387; `FACT-CHECK.md` header ("claims list 1–60 and every number the reel shows"); `grep -n 'PIPE_BUF\|EXDEV\|rename\|fdinfo\|wait builtin' SOURCES.md` finds nothing; `examples.sh` line 9 is the only `trap`.
- *Fix:* fetch `pipe(7)`, `rename(2)`, `proc_pid_fdinfo(5)`, `proc_pid_io(5)`, `proc_pid_environ(5)`, the Bash "Signals" node and the coreutils `mv` node, add the quotes to `SOURCES.md` and run `node scripts/sources.mjs check`; execute what is cheap (`getconf PIPE_BUF /`, a rename across `/dev/shm` for `EXDEV`, `mawk 'BEGIN{print tolower("É")}'`, a `trap`/`wait` wrapper); drop what can't be sourced (the `mv` clause, the `tolower` clause) or mark it as reasoning. Add a short "post-build additions" table to `FACT-CHECK.md` (one Opus pass over the added paragraphs only, as ROUTINE.md 0 allows for a major finding).

**8. "Filesystem and permissions" maps to step 5, where the only trace of permissions is "(no x bit)" in the caption. (minor)**
- *Status:* FIXED. The 126 legend row reads "found, not executable (rw-r--r--: no x)".
- *Where:* `coverage.json` syllabus clause "filesystem and permissions" → step "Exit codes: 0 to 255, and 128 plus the signal"; `scenes.tsx` `ExitCodes` legend row `126 found, not executable`.
- *What:* `OUTLINE.md` step 5 planned a tiny `rw-r--r--` label whose missing `x` positions are cherry, "the permission story in one glance", and `examples.sh` asserts `perm_string=rw-r--r--`. The build's legend dropped it, so nothing on screen shows a permission string, and the clause's reel coverage is one parenthesis. The Deep dive's "Files, inodes and permissions" is good and complete; the reel's half is thinner than the map says.
- *Evidence:* `OUTLINE.md` step 5 "Beats" (1.6 s); `scenes.tsx` lines 209–215; `examples.py` line 58.
- *Fix:* append `rw-r--r--` to the 126 legend row (mono 13, the three `x` slots in cherryText), or to the code panel comment: `# rw-r--r-- → 126`.

**9. SIGHUP never appears in the reel, and SIGINT only as a legend row. (minor)**
- *Status:* FIXED. Step 6 body and narration have the SIGINT and SIGHUP sentence (with `nohup`).
- *Where:* `reel.tsx` step 6 body; `narration.json` step 6; `index.mdx` "Signals, zombies, orphans and threads" (complete).
- *What:* the chapter entry's scope is "SIGTERM vs SIGKILL vs SIGINT and SIGHUP; zombies and orphans". `OUTLINE.md` step 6's caption had "SIGINT (2) is Ctrl-C; SIGHUP (1) is 'your terminal went away', which is how an ssh job dies with the session"; the build cut both sentences. For a data engineer the SIGHUP case (a job started from an ssh session dies when the laptop sleeps) is the one that bites, and it ties step 6 to step 9's ssh panel; now it lives only in the Deep dive.
- *Evidence:* `CHAPTER.md` line 168; `OUTLINE.md` step 6 "Caption"; `reel.tsx` lines 86–90.
- *Fix:* restore one sentence in the body: "SIGINT (2) is Ctrl-C; SIGHUP (1) means your terminal went away, which is how an ssh session's job dies with it (`nohup` ignores it)."

**10. `grep` and `sed` never appear in the reel, though the syllabus clause names all four tools. (minor)**
- *Status:* FIXED. Step 8 body and narration carry the `grep -c` 1,495 against 1,500 clause and `sed` for log lines; recap row 7 names grep and sed.
- *Where:* `reel.tsx` step 8 body; `scenes.tsx` `PipelineLab`, `Recap` row 7 (`jq | awk | sort | uniq -c`); `coverage.json` clause "`grep`/`awk`/`sed`/`jq`" → step "One pipeline, one script, same answer".
- *What:* the step covers `jq` and `awk` well. `grep` and `sed` are Deep-dive only; the recap row that stands for the clause doesn't name them. The Deep dive already has the one-line trap that would carry `grep` into the reel: `grep -c` counting strings gives 1,495, not 1,500 (executed, `grep_count`/`true_count`).
- *Evidence:* `index.mdx` "One-liners over order_events" (grep and sed bullets); `examples.py` line 99.
- *Fix:* one clause in the step 8 body ("`grep -c` would count strings, 1,495 where there are 1,500 values; `sed` is for log lines, not JSON"), and name them in recap row 7 ("jq | awk | sort | uniq -c, grep and sed for lines").

**11. Three expert items are marked covered but the Deep dive is thinner than the item. (minor)**
- *Status:* FIXED. `timeout` bullet has 137 (and 125) with a `timeout(1)` quote and an executed case; the dispositions bullet says a child inherits them across `fork` (`signal(7)` quote, executed); `-tt` added (quoted and run).
- *Where:* `coverage.json` → `expert` items on `timeout(1)`, on "Signal dispositions are inherited across fork()", and on `strace -tt -T`; `index.mdx` "The process model" (last bullet) and "Signals, zombies, orphans and threads" ("Dispositions matter across `exec`").
- *What:* (a) the `timeout` item says "exits 124 on timeout (137 if KILL was needed); add -k/--kill-after"; the Deep dive has 124 and `--kill-after` but not what the status is after an escalation, which is the number a scheduler log shows. The fetched `timeout(1)` says "137 if COMMAND (or timeout itself) is sent the KILL (9) signal (128+9)" (and, a nice collision with bisect, "125 if the timeout command itself fails"). (b) The dispositions item is about fork (inherited) and about `nohup`; the Deep dive says only what `execve(2)` does (caught reset, ignored kept) and never says dispositions survive `fork`, which is the half that explains why a `trap` in a wrapper doesn't reach the child. (c) `-tt` is not mentioned (trivial).
- *Evidence:* `expert.json` items 22, 19, 27; `index.mdx` lines 52, 57.
- *Fix:* add "137 if it had to send KILL" to the `timeout` bullet (quote `timeout(1)` in `SOURCES.md`); add "a child inherits its parent's dispositions across `fork`" with a `fork(2)` or `signal(7)` quote; add `-tt` beside `-T`.

**12. "Try it" doesn't link the script it asks the reader to run. (minor)**
- *Status:* FIXED. "Try it" says `examples.sh` sits in the topic folder and how to get `hung_load.py` out of its heredoc (section 7). Not extracted to a separate file, to keep one script.
- *Where:* `index.mdx` "Try it" ("Run it with `bash examples.sh`"; `hung_load.py`).
- *What:* the reader is told to run `examples.sh` and to start `hung_load.py`, with no path or link; `hung_load.py` is written by `examples.sh` into a temp directory and deleted on exit, so a reader cannot "start the hung-job simulator" at all without reading the script. The Git review's #18 was this same finding; the plan asks that a kind of finding not come back.
- *Evidence:* `index.mdx` lines 118–125; `examples.sh` lines 9 (`trap 'rm -rf "$W"…' EXIT`), 307.
- *Fix:* link `examples.sh` in the repository (as the Git topic now does) and either extract `hung_load.py` to the topic folder or say "`examples.sh` writes `hung_load.py`; copy it out of the script's heredoc (lines …) to run it alone".

**13. `coverage.json` records the gap review as the builder's, before this review. (minor)**
- *Status:* FIXED. `coverage.json` `gapReview` is dated 2026-10-11, by the Fable content reviewer, `open: []` (every finding here is fixed).
- *Where:* `coverage.json` → `gapReview` (`"by": "builder"`, `"open": []`, 2026-10-11).
- *What:* ROUTINE.md 4 has the run record the content review's gap review after fixing its findings; the entry predates this review and names the builder. Same as the Git review's #17.
- *Fix:* after the fixes, set `by` to the content review and leave `open: []` only once every finding above is fixed or recorded as out of scope.

### Expert reader

**14. Step 5 lost the fact-check's qualification: "Above 128, Bash reports 128 plus the signal" reads as if 137 always means a signal. (minor)**
- *Status:* FIXED. Step 5 body and narration say "by convention" and that Python reports −9.
- *Where:* `reel.tsx` step 5 body; `narration.json` step 5 ("So one hundred thirty-seven is a kill").
- *What:* `FACT-CHECK.md` R2 corrected the caption to "(a program can exit with such a number itself, but by convention it means a signal)", and `OUTLINE.md` step 5 has that parenthetical. The built body ends "so 137 is a kill and 143 a terminate." A program may `exit(137)`; `WIFSIGNALED` is what distinguishes the two, and only the shell folds them into one byte. The Deep dive gets this right ("Python's `subprocess` reports the same death as `-9`, not 137: 137 is the shell's encoding"); the reel states the convention as a rule.
- *Evidence:* `FACT-CHECK.md` R2; `OUTLINE.md` step 5 "Caption"; `reel.tsx` lines 75–77.
- *Fix:* "so 137 means a kill and 143 a terminate, by convention: a program could exit with 137 itself, which is why Python reports a signal death as −9 instead."

**15. "Adopted by init" dropped the fact-check's "(or a subreaper)", which the topic's own examples depend on. (minor)**
- *Status:* FIXED. "init (or a subreaper)" in step 6 body, drawing label and narration.
- *Where:* `reel.tsx` step 6 body; `scenes.tsx` `Signals` ("adopted by init"); `narration.json` step 6.
- *What:* `FACT-CHECK.md` claim 23: "Step 6 caption now says 'init (or a subreaper)'"; `OUTLINE.md` step 6 has it. The build says "adopted by init" three times. In a container (where most data jobs run) the adopter is often a subreaper, not PID 1, and `examples.py` therefore asserts only `orphan_reparented=yes`, never the number. The Deep dive is right; the reel states the special case as the rule.
- *Evidence:* `FACT-CHECK.md` row 23; `OUTLINE.md` step 6 "Caption"; `examples.py` line 76.
- *Fix:* "adopted by init (or a subreaper)" in the body and the drawing's label; narration "adopted by init, or by a sub-reaper".

**16. "An interactive shell resends the SIGHUP … before it exits" leaves out the condition. (minor)**
- *Status:* FIXED. The Deep dive says the resend applies when the shell itself receives SIGHUP, and on `exit` only with `huponexit` for an interactive login shell; both neighbouring sentences are quoted in `SOURCES.md`.
- *Where:* `index.mdx` "Signals, zombies, orphans and threads", the "Handlers" bullet.
- *What:* the manual's sentence is in the paragraph that begins "The shell exits by default upon receipt of a SIGHUP. Before exiting, an interactive shell resends the SIGHUP to all jobs"; on a normal `exit` or logout Bash sends SIGHUP to jobs only "If the huponexit shell option has been set". As written, the Deep dive implies that closing a shell always kills its background jobs, which is the opposite of what a reader who types `exit` observes. The quote is correct; the gloss around it isn't.
- *Evidence:* fetched Bash manual "Signals" node (lines 32–45 of the text); `SOURCES.md` quotes only the one sentence.
- *Fix:* "When an interactive shell itself receives SIGHUP (the ssh connection dropped), it 'resends the SIGHUP to all jobs, running or stopped' before exiting; a plain `exit` does that only with `shopt -s huponexit`." Quote the two neighbouring sentences.

**17. The PID-namespace sentence sits under load average, where it misleads. (minor)**
- *Status:* FIXED. The sentence moved to the `ps` bullet and is about `/proc/<pid>` and PIDs (`pid_namespaces(7)` quote); nothing is said about `/proc/loadavg`.
- *Where:* `index.mdx` "Looking at processes", last bullet ("In `/proc`, as in `ps`, a container sees only its own PID namespace.").
- *What:* true for `/proc/<pid>` entries and `ps`. Placed as the closing sentence of the load-average bullet it implies that `/proc/loadavg` is per container; it is not (the file is not namespaced and reports the host, which is why a quiet container can show a load of 40). The topic has no source for either reading, so it should not imply one.
- *Evidence:* `index.mdx` line 68; `SOURCES.md` § proc_loadavg(5) says nothing about namespaces.
- *Fix:* move the sentence to the `ps` bullet and make it about PIDs ("`ps` and `/proc/<pid>` show only the container's PID namespace"); if the load-average point is wanted, source it (`pid_namespaces(7)` lists what is and isn't virtualised) or leave it out.

**18. Step 8's dirty spellings are invisible on screen: "refunded" looks clean. (minor)**
- *Status:* FIXED. The line shows `'Paid'  'SHIPPED '  ' refunded'` with the blanks inside quotes.
- *Where:* `scenes.tsx` `PipelineLab` line 363 ("40 events: Paid, SHIPPED, refunded").
- *What:* the three dirty forms are `Paid`, `SHIPPED ` (trailing blank) and ` refunded` (leading blank). Rendered without delimiters, the third is identical to the clean value, so the line asserts that `refunded` is one of the badly spelt events. The outline wrote them in code spans with the blanks inside.
- *Evidence:* `examples.py` line 24 comment; `OUTLINE.md` step 8 "Bottom".
- *Fix:* show the blanks: `'Paid'  'SHIPPED '  ' refunded'` in quotes, or mark them with `␣`.

**19. Recap row 6 credits `strace -p` with telling you the process state. (minor)**
- *Status:* FIXED. Recap row 6: "ps and /proc say which; strace -p, what it is in".
- *Where:* `scenes.tsx` `RECAP[5]` ("R S D Z — ps, /proc, strace -p tell you which").
- *What:* `strace -p` shows the system call in progress, not the state; `ps` and `/proc/<pid>/status` do. The step 7 caption and the Deep dive ("What to conclude") keep the two apart; the recap merges them.
- *Fix:* "R S D Z — ps and /proc say which; strace -p says what it is inside".

**20. In the ptrace fallback nothing ties the blocked `read` to fd 4, yet the reel shows `read(4,`. (minor)**
- *Status:* FIXED. `examples.sh` prints `hung_syscall_fd` (field 2 of `/proc/<pid>/syscall`, hex) and asserts 4 and a read syscall (0 or 63) where readable; `examples.py` asserts it. Where neither strace nor `/proc/<pid>/syscall` is allowed, only fd 4 -> socket is verified and the on-screen `read(4,` rests on the runs where it was (this runner: strace works). Recorded in `examples.py` as a comment.
- *Where:* `examples.sh` lines 326–343; `examples.py` lines 79–85.
- *What:* when `strace -p` is refused (`strace_read=skipped`), the only fd assertion is that `/proc/<pid>/fd/4` is a socket. `hung_load.py` opens three sockets (fds 3, 4, 5), so that holds whichever one the main thread reads from; the on-screen `read(4,` is then unasserted on that runner. `FACT-CHECK.md` R6 asked for exactly this ("`examples.py` must assert the number it printed, and the reel shows that number"). `/proc/<pid>/syscall` is read when readable (line 335) but only its first field is kept; its second field is the first argument of the call, the fd.
- *Fix:* when `/proc/<pid>/syscall` is readable, print its second field as `hung_syscall_fd` and assert it is `4` (and the first field `0` or `63` by architecture); when neither strace nor `syscall` is readable, record in this file that the runner could not verify the fd, as R6 suggested.
