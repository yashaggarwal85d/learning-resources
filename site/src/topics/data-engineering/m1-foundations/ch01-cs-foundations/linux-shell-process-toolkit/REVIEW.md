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

## Looks review (Opus, 2026-10-11)

What I looked at: all 20 screenshots in `site/test-results/` (`desktop-` and `phone-linux-shell-process-toolkit-01…10.png`, made by `PREVIEW_HELD=1 node ../scripts/check-all.mjs --only reels --topic linux-shell-process-toolkit`), read against `OUTLINE.md` ("The reel: 10 steps" and the build notes), `narration.json`, `reel.tsx`, `scenes.tsx` and `DESIGN.md` → "The looks review checks". The test answers each predict step with its *first* (wrong) option, so the test screenshots never show a question frame or a correct-answer frame. Its phone `-01` file also shows step 2 at t = 0, not step 1 (a quirk in the shared test's click-then-ArrowRight loop, not this topic). So I made extra captures with a throwaway Playwright script against `astro preview`, saved in the session scratchpad and not committed: phone step 1, the finished question frames of steps 3, 4 and 7, and their correct-answer frames, at both sizes. **The reels test fails today** on two layout problems, findings 1 and 2. Paths are relative to this folder.

**Totals: 18 findings: 4 high, 7 medium, 7 low.** High: 1, 2, 3, 4.

Overall: the reel has a real visual idea, and it belongs to the site. The process tree (boxes with 0/1/2 sockets, taupe tubes, round status tokens riding up to the parent, cherry for a bad outcome) carries steps 2, 3, 4, 6 and 7 in one grammar. Colour keeps its meaning, and no step uses more than two accents. Steps 2, 8 and 10 are clean at both sizes. The weak spots are the three predict steps: their question frames are cut short by the step durations, their answer frames are crowded or shrunk on a phone, and step 7's caption is so long that it pushes the page out of shape at both sizes. Then come two label collisions that fail CI, and a few final frames whose point the eye doesn't land on first.

---

**1. Step 7: "no handler here: 143" overlaps `kill -KILL <pid>` on the phone and runs into it on desktop, and it labels the wrong command. (high)**
- **Status: Fixed. `HungJob` answer: the 143 token and 'no handler here' now sit on the TERM row (right of `kill -TERM <pid>`), the KILL row is 56 units lower; no shared baseline, no overlap.**
- *Where:* `scenes.tsx` `HungJob`, answer frame: `kill -TERM <pid>` (x 232, y 228), the token `143` (x 450, y 222), "no handler here: 143" (centred at x 450, y 262) and `kill -KILL <pid>` (x 232, y 268).
- *What:* the label is centred under the token. It is about 20 characters wide, so it starts near x 370, and that is where the 16-character `kill -KILL <pid>` ends. On the phone the two overlap; on desktop they are about 7 units apart. The label also sits on the same baseline as the KILL command, so it reads as "KILL → 143". The 143 belongs to TERM (it is 128 + 15, as step 5 just taught), so the picture teaches the wrong pairing.
- *Evidence:* `phone-…-07.png` (the text "<pid>" and "no handler" print on top of each other); `desktop-…-07.png` ("kill -KILL <pid> no handler here: 143" reads as one line); the reel test: "step 7: text "no handler here: 143" overlaps "kill -KILL"".
- *Fix:* put the token and its label on the TERM line: `kill -TERM <pid>  → 143` with "no handler here" (latte 13) under the token. Drop the KILL line by 30+ units so that nothing shares its baseline, or put "no handler: 143" to the right of the TERM command and leave the KILL row alone.

**2. Step 6 on the phone: "ended, not waited for" runs into "adopted by init (or a subreaper)". (high)**
- **Status: Fixed. `Signals` bottom row rebuilt: divider and 'left behind' heading, each leftover hangs from a drawn parent (`parent` / `init`), captions shortened to 'not waited for' and 'parent died' and centred 130 / 440 apart. The reels test no longer reports it.**
- *Where:* `scenes.tsx` `Signals`, bottom row: the label centred at x 120 and the label centred at x 390, both at y 326.
- *What:* the two captions are 21 and 32 characters wide. At phone text scale they need about 170 and 260 units, but only 270 units separate their centres, so they meet. The phone shows one unbroken line, "ended, not waited for adopted by init (or a subreaper)".
- *Evidence:* `phone-…-06.png`; the reel test: "step 6: text "ended, not waited for" runs into "adopted by init (or a subreaper)"".
- *Fix:* shorten the right label to "parent died" or "re-parented", because the `init / subreaper` label above the box already says who adopts it. Stack each caption on two lines, or move the orphan group right (box at x 380–500). See also 10.

**3. The question frames of steps 3, 4 and 7 never finish: each step's `duration` ends before its last beats. (high)**
- **Status: Fixed. Durations: step 3 1.4 to 2.0, step 4 1.8 to 2.4, step 7 1.6 to 3.4 (every beat lands 0.2+ s before the end), step 5 4.2 to 4.4. The step 5 bisect line is gone (see 9).**
- *Where:* `reel.tsx` durations, step 3 `1.4`, step 4 `1.8` and step 7 `1.6`, against the beats in `scenes.tsx`. `ReelPlayer.tsx` clamps `t` at `duration` (line 88), so a beat that starts at or after the duration never shows.
- *What:* **Step 7** (worst): `wchan` (1.6), `fd/4 → socket` (2.0), `strace -p` and `read(4,` (2.4) and the "?" (2.8) never appear. The learner is asked "what is it doing?" with only `State: S` and `Threads: 2` on screen, and the strace line the whole diagnosis turns on is missing. **Step 4:** the `$? = ?` row (fades in from 1.8) has opacity 0 when the clock stops at 1.8, so the frame never says what is being asked; only the three dashed token slots show. **Step 3:** the "?" pops from 1.3 to 1.7 and freezes at about a quarter of its pop, so it renders as a small, half-grown glyph floating above the lines.
- *Evidence:* scratchpad captures `desktop-q07.png` and `phone-q07.png` (two evidence lines only), `phone-q04.png` (no `$?` row) and `phone-q03.png` / `desktop-q03.png` (small "?"), each taken 5 s after the step opened.
- *Fix:* step 7 `duration` 3.2 (or compress the beats into 0.2–1.4); step 4 at least 2.2; step 3 at least 1.7. Better still, make every question-frame beat land by `duration − 0.4`. Step 5 has a milder case: the bisect line (3.9 + 0.4) ends after 4.2 and stops at about 94 % opacity. Set it to 4.4 or start the line at 3.7.

**4. Step 7's caption is about 480 characters and breaks the layout at both sizes. (high)**
- **Status: Fixed. Step 7 body cut to about 190 characters; the R/S/D/Z legend moved into the `explain` (and stays in the narration). Desktop header no longer touches the nav; phone shows the title and full caption above the options.**
- *Where:* `reel.tsx` step 7 `body`. `OUTLINE.md` asks for predict captions of about 200 characters, a rule taken from the Git looks review.
- *What:* on **desktop** the body, four two-line options and the explain panel push the step header up under the top navigation. "REFRESHER 7/10 · §1.1 · LINUX SHELL AND" is cut by the "Data Engineering" pill. On the **phone** a predict body is shown in full (no MORE), so the caption scrolls: the title is pushed out of view, the visible text starts mid-sentence ("finished, not failed."), and in the question frame the options sit behind the playback controls.
- *Evidence:* `desktop-…-07.png` and scratchpad `desktop-a07-correct.png` (the header overlaps the nav); `phone-…-07.png` (the caption starts at "finished, not failed."); scratchpad `phone-q07.png` (the option buttons are cut off at the bottom).
- *Fix:* cut the body to the question: "The nightly load has sat for an hour. `/proc` says `S` and `Threads: 2` (two threads, one memory; `ps -L`). `strace -p` shows `read(4,` and nothing more. What is it doing?" (about 190 characters). Move the R/S/D/Z legend into the `explain`, which already names R, D and Z, and into the narration. Then recheck steps 3 and 4 on the phone; their explain panels also run under the controls.

**5. On the phone, the answer frames of steps 3 and 4 shrink to about 55 % width, and the drawing jumps between question and answer. (medium)**
- **Status: Fixed. Both answer frames are now the same height as their question frames (step 3 260, step 4 300), so nothing shrinks on answer. Step 3 lost the legend lines and the 'this order' label; step 4 lost PIPESTATUS and the side-by-side rows became stacked captions under each token.**
- *Where:* `scenes.tsx` `WhereDidItGo` and `PipelineStatus`: the answer `Svg h={380}`, against `h={260}` and `h={300}` for the question frames.
- *What:* the phone keeps the drawing's height fixed above the long predict caption, so a 380-tall canvas is drawn at about 0.37 scale. The labels sit at the 9 px floor, the pipe stubs between the step 4 boxes are a few pixels, and when the learner answers, the whole picture visibly shrinks and moves. `OUTLINE.md` puts canvas heights at 230–350.
- *Evidence:* `phone-…-03.png` and `phone-…-04.png` (the drawing spans x ≈ 240–885 of 1170 px) next to scratchpad `phone-q03.png` and `phone-q04.png` (the drawing spans x ≈ 80–1045).
- *Fix:* keep each answer frame at the question frame's height. In step 3, drop the fix lines (`> out.log 2>&1` / "this order: …"), because the explain already says it, or put them on one line. In step 4, put `$? = 0` and the pipefail row side by side under the tokens and drop `PIPESTATUS` (it is in the Deep dive) to save about 40 units.

**6. Step 4's answer frame: `$? = 0` sits directly under the cherry `2` token, and the cherry `$? = 2` is the loudest thing on screen. (medium)**
- **Status: Fixed. `$? = 0` (Fraunces 22, crema) now hangs on a short taupe arrow from the `uniq -c` token with 'the last command's' beside it; the pipefail answer is a smaller cherry `$? = 2` (17) on a cherry arrow from the `2` token.**
- *Where:* `scenes.tsx` `PipelineStatus` answer frame: `$? = 0` at x 30, under `jq`'s token at x 105; "the last command's" at x 170; the pipefail row `$? = 2` at x 216.
- *What:* the step's point is "the shell keeps the rightmost token". Nothing joins the `uniq -c` token to `$? = 0`. Proximity instead pairs `$? = 0` with the failing `jq`, the one wrong pairing the step exists to prevent. The eye lands first on the filled cherry token and the cherry Fraunces `$? = 2`, the pipefail answer, not on the answer to the question (0).
- *Evidence:* `desktop-…-04.png` and scratchpad `phone-a04-correct.png`.
- *Fix:* put `$? = 0` (Fraunces 20, crema) under or right of the `uniq -c` token with a short taupe arrow from that token, and "the last command's" beside it. For the pipefail row, draw a thin cherry arrow from the `2` token to `$? = 2` and make it smaller (17) than the main answer, so the answer to the question is the biggest thing.

**7. Step 3's answer frame shows the end state but not the order, which is the lesson. (medium)**
- **Status: Fixed. The two re-pointings carry numbered glyphs 1 (socket 2's line) and 2 (socket 1's line) on the lines themselves, and a dashed taupe ghost of socket 1's original line to the terminal shows what 2 copied. The legend is gone.**
- *Where:* `scenes.tsx` `WhereDidItGo` answer frame: two identical caramel lines and the legend `① 2>&1 copies fd 1: the terminal` / `② > out.log moves fd 1 to the file` below them.
- *What:* `OUTLINE.md` planned ① and ② on the lines themselves. As built, both re-pointings look the same, the numbers live only in a text legend under the picture, and nothing shows that fd 1 *was* on the terminal when fd 2 copied it. A watcher who doesn't read the legend sees "1 → file, 2 → terminal" with no reason. The frame also carries eight text items (command, `out.log` / "0 lines", `terminal`, the error line, ①, ②, the fix, its label), double the checklist's four.
- *Evidence:* `desktop-…-03.png`, `phone-…-03.png`.
- *Fix:* put ① at the midpoint of the socket-2 line and ② on the socket-1 line, as small glyphs on the lines. Keep a dashed taupe "ghost" of socket 1's first line to the terminal, which shows what 2 copied. Then the legend lines can go (the explain says them), and that also frees the height for 5.

**8. Step 7's answer frame: the biggest element is the `143` token, and 13 labels compete. (medium)**
- **Status: Fixed. The answer now leads: `read(4,` turns caramel, 'no sender' (cherry 15) is centred under the dashed tube end, the 143 is part of the TERM row, and 'only if it is still there' is dropped. Token kept at r 24 so that the three digits fit.**
- *Where:* `scenes.tsx` `HungJob` answer frame.
- *What:* the answer is "blocked in `read` on a socket with no sender", but the largest, most prominent shape is the 143 token (r 24), a follow-up detail. On top of the four evidence lines, `strace -p`, `read(4,`, the box, socket 4, the `socket` tab, "no sender", two kill commands, the token, its label and "only if it is still there" all compete. "No sender" (the answer) starts at x 30 while its tube is at x 115, so it hangs off-centre to the left.
- *Evidence:* `desktop-…-07.png` and scratchpad `desktop-a07-correct.png`.
- *Fix:* make the answer the focal point. Put "no sender" (cherryText 15) centred under the dashed tube end, and turn the `read(4,` line caramel in the answer frame (the call that never returns). Shrink the token to r 17, or show "→ 143" as text (see 1). Drop "only if it is still there", which the caption and explain both say.

**9. Step 5's bar has no scale, and its markers can only be matched to the legend by counting. (medium)**
- **Status: Fixed, with one deviation. The bar's markers now carry their code numbers beneath (126, 127, 130, 137, 143; 127 staggered one row down so the labels don't touch) and the pin reads '125 skip'; the bottom bisect line is dropped. No 128 or 255 ticks: at phone scale they collide with the 143 label, and the title and the '128 + signal' band label already carry them.**
- *Where:* `scenes.tsx` `ExitCodes`: the bar's labels are "0 ok", "1–125 own codes" and "128 + signal"; the markers are two crema rings (126, 127) and two caramel rings plus one cherry ring (130, 137, 143); the taupe pin at x 268 has no label.
- *What:* the title promises "0 to 255, and 128 plus the signal", but 128 and 255 are never written on the bar. The 125 pin is explained only by a line 200 units lower ("bisect: 125 = skip…"). The two caramel markers (130, 143) look the same, so the bar-to-legend link is "same colour, count from the left". Because the bar is not to scale (build note), the eye can't use position either.
- *Evidence:* `desktop-…-05.png`, `phone-…-05.png`.
- *Fix:* add small taupe tick numbers under the bar at 125, 128 and 255, or put the code number in each marker (13-unit text under each ring: 126 127 · 130 137 143). Label the pin directly ("125 skip", latte 13, under the triangle) and drop the bottom line, or shorten it to "bisect skips on 125". On the phone that also clears the bottom line, which now sits about 19 px above the REFRESHER chip.

**10. Step 6's bottom row: the zombie sits under the TERM column and the orphan under the KILL column, and the word "zombie" is not on screen. (medium)**
- **Status: Fixed. See 2: separate 'left behind' row, a parent drawn above the zombie, the word 'zombie' in the Z box, a shortened orphan caption.**
- *Where:* `scenes.tsx` `Signals`: the Z box at x 60–180 (the TERM column) and the orphan at x 330–450 (the KILL column).
- *What:* placed in the two signal columns, the leftovers read as results of those signals ("TERM leaves a zombie, KILL leaves an orphan"), which is wrong. The Z box floats with no parent line, although "not waited for" is about a parent, and the screen says "Z", never "zombie". The orphan's caption repeats the `init / subreaper` label just above it.
- *Evidence:* `desktop-…-06.png` and `phone-…-06.png`.
- *Fix:* separate the row from the trees: add a thin taupe divider at y ≈ 235, or a quiet heading "left behind" (taupe 13), and centre the two items as a pair. Hang the Z box from a small parent box with the line drawn (the parent alive, not waiting), and label it "zombie: ended, not waited for". Shorten the orphan's caption as in 2.

**11. Step 2 doesn't draw the sentence it ends on: the child inherits the same three files. (low)**
- **Status: Fixed. The child's sockets are labelled keyboard / terminal like the parent's, and the caramel output line now runs from the child's socket 1 up to the shell's `terminal` label instead of into empty space.**
- *Where:* `scenes.tsx` `ForkExecWait`: the child's sockets 0/1/2 are drawn but connect to nothing, and the caramel output dash from socket 1 runs 66 units into empty space.
- *What:* the caption and narration end on "the child starts with the same three open files". The shell's sockets are labelled `keyboard` / `terminal`, but the child's are bare, so inheritance is not shown, and the program's output goes nowhere visible.
- *Evidence:* `desktop-…-02.png`, `phone-…-02.png`.
- *Fix:* label the child's sockets like the parent's (`keyboard` on the left, `terminal` on the right, taupe 13), or draw thin taupe lines from the child's 1/2 up to the parent's `terminal` label. End the caramel dash at that terminal label.

**12. Step 10 on the phone: three summary lines run past their row cards. (medium)**
- **Status: Fixed by trimming (not widening): rows 2, 6 and 7 use the 40-character summaries suggested.**
- *Where:* `scenes.tsx` `Recap`: the cards are 506 units wide (x 30–536) and the summaries are 14 units. Rows 2 ("stdin, stdout, stderr; 2>&1 copies where 1 points", 49 characters), 6 and 7 overflow.
- *What:* at phone text scale those lines go past the card's right edge by about 25 units. The page doesn't clip, but the card no longer contains its text, and the ragged right edge stands out in an otherwise tidy list.
- *Evidence:* `phone-…-10.png` (row 2 ends at x ≈ 1100 px; the card ends at ≈ 1025 px).
- *Fix:* widen the cards to x 20–580 (the rail rule applies to desktop only and the recap is centred there), or trim rows 2, 6 and 7 to 42 characters or fewer: "stdin, stdout, stderr; 2>&1 copies 1 now", "ps, /proc: which; strace -p: what call", "diff against the script; grep, sed: logs".

**13. Step 8 on the phone: "cancelled" and "1300" sit about 12 units apart, and the table isn't connected to the pipeline. (low)**
- **Status: Fixed. Status column moved to x 272, pipe counts end at 456 (script counts stay at 536), and a taupe tube joins the `uniq -c` box to the table. The pipe/script headers moved with the counts after the test flagged them touching.**
- *Where:* `scenes.tsx` `PipelineLab`: the status at x 290, the right-aligned count ending at x 450, the script column ending at x 536.
- *What:* at phone text scale, "cancelled 1300" reads almost as one token (the house minimum is 24 units). The output table also floats to the right of the `uniq -c` box with no tube or arrow, so "these are the pipeline's output" is implied only by the column header `pipe`.
- *Evidence:* `phone-…-08.png`.
- *Fix:* move the status column to x 270 and the pipe counts to x 470 (script counts stay at 536), or drop the status words to latte 14. Add a short taupe tube or arrow from `uniq -c`'s right edge to the first row.

**14. Step 8: the quoted dirty spellings read as four tokens. (low)**
- **Status: Fixed. Now `40 events: Paid · SHIPPED␣ · ␣refunded`.**
- *Where:* `scenes.tsx` `PipelineLab` line 366: `40 events: 'Paid'  'SHIPPED '  ' refunded'`.
- *What:* the content-review fix (finding 18) added quotes, but the two-space separators match the blanks inside the quotes. `'SHIPPED '  ' refunded'` scans as `'SHIPPED '`, `' '`, `'refunded'`, so the eye finds a quoted blank token, and the leading blank of ` refunded` (the point) is the hardest to see.
- *Evidence:* `desktop-…-08.png`, `phone-…-08.png`.
- *Fix:* mark the blanks with `␣` and separate the items with ` · `: `40 events: Paid · SHIPPED␣ · ␣refunded`.

**15. Step 9: two panels with no separation, the reading of the cron line far from its fields, the env line in taupe, and `db.internal` filling its box on the phone. (low)**
- **Status: Fixed. Order is chips, 'runs at 02:15 every day', command, env line (latte), then a thin rule before the ssh block; the database box reads `db` / `:5432` (the command line carries `db.internal`).**
- *Where:* `scenes.tsx` `CronSsh`.
- *What:* the chips are followed by the command, then "cron's env…" in taupe, then "runs at 02:15 every day" in caramel. The decoded meaning of the chips (the line to look at) comes third, after a quiet line, and the env line is one of the step's three cron pitfalls, yet it is drawn as a quiet caption. The ssh command starts 44 units below the cron block with nothing to mark a new topic, so it reads as part of the cron panel. On the phone, `db.internal` spans almost the full 120-unit box (about 5 units of padding per side).
- *Evidence:* `desktop-…-09.png`, `phone-…-09.png`.
- *Fix:* order the block as chips → "runs at 02:15 every day" → command → env line (latte, not taupe). Add a thin taupe rule or 20 more units of gap before the ssh command. Widen the database box to 140 units (x 416–556), or label it `db :5432`.

**16. Step 1: the bridge quote and the body say the same two sentences, one above the other. (low)**
- **Status: Fixed. Step 1 body is now 'Five minutes on processes, signals and pipes; all familiar? Swipe on to the delivery workflow.' The registry is untouched. Narration unchanged (its first sentences are the bridge).**
- *Where:* `reel.tsx` step 1 `body`; the bridge text comes from `site/src/topics/registry.ts` line 65 and is shown by the player above the title.
- *What:* "Bisect trusted an exit code. Here is where exit codes come from: processes, their signals, and the pipes between them." prints twice, in italics and then as the body, at both sizes. The Python refresher's body does not repeat its bridge.
- *Evidence:* `desktop-…-01.png` and scratchpad `phone-s01.png`.
- *Fix:* change the step 1 body only (not the registry, which is shared): "Five minutes on processes, signals and pipes; all familiar? Swipe on to the delivery workflow."

**17. Step 10: "0 1 2" in Fraunces reads as "012", and the command names are set in serif. (low)**
- **Status: Fixed. Row 2 reads `0 · 1 · 2`, row 6 `R · S · D · Z`; the code-like names (pipefail, the pipeline, `cron, ssh -L`) are in mono.**
- *Where:* `scenes.tsx` `Recap` row names (Fraunces 16, caramel).
- *What:* Fraunces has narrow word spaces, so `0 1 2` renders as "012", a number, and the pipeline name `jq | awk | sort | uniq -c` and `ssh -L` are code set in a display serif. DESIGN allows one serif word or number per step for emphasis; eight serif headings works for a recap list, but code in serif reads oddly next to the mono summaries.
- *Evidence:* `desktop-…-10.png`, `phone-…-10.png`.
- *Fix:* write row 2 as `0 · 1 · 2`, or set the code-like names (rows 2, 6, 7, 8) in mono 16 caramel and keep Fraunces for the word rows.

**18. Step 5 on the phone: the code panel and the legend say each code twice. (low)**
- **Status: Fixed. The `# nnn` comments are removed from the code panel; the legend is the one place codes and causes meet.**
- *Where:* `scenes.tsx` `ExitCodes`: the four `# 126 / # 127 / # 137 / # 143` comments in the code panel, then the five legend rows.
- *What:* the code panel already labels each code, and the legend repeats them with their causes. On the phone, the space above the caption holds two lists of the same numbers, and the bar, the one new idea, is squeezed between them.
- *Evidence:* `phone-…-05.png`.
- *Fix:* drop the `# nnn` comments from the code panel, so each command links to its row by order, and the legend stays the one place codes and causes meet. The rows keep their numbers.


### Looks review fixes (2026-10-11)

All 18 findings are fixed (see the status line under each). `node scripts/check-all.mjs --only reels --topic linux-shell-process-toolkit` passes (no overlap, clip or small-text failures) and `cd site && npm run build` succeeds. The narration is unchanged: no line contains a slash, and every changed picture still shows what the narration says.

## Content review (Opus, 2026-10-12)

A fresh, independent review of the topic as it stands on `topic/de.linux-shell-process-toolkit`. The Fable review above ran on a model the project does not allow, so I treated it as a list of claims to check, not as a result. Read in order: the previous topic `de.git-branching-history-workflows` (reel, narration, Deep dive headings, its "Bisect" handoff); this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, registry entry, `coverage.json`, `expert.json`, `SOURCES.md`, `FACT-CHECK.md`, the relevant parts of `examples.sh` / `examples.py` and `OUTLINE.md`; entry 3 of `../CHAPTER.md` (with entries 4, 8 and 18 and the ledger); and the next topic's syllabus line (`syllabus/data-engineering.md:56`). Sources I fetched myself with `node scripts/sources.mjs fetch` (to the session scratchpad, not committed): Debian `crontab(5)`, OpenSSH portable `authfile.c`, the glibc manual node "Termination in Handler", the Python `signal` docs (3.15), Debian's `dash` changelog and `dash(1)`, LWN "TASK_KILLABLE", Debian `systemd.timer(5)` and `ss(8)`. Run locally: Bash 5.2.21 (`set -u` gives 127 under `bash -c` and 1 from a file, as the Deep dive says) and jq 1.7 (a missing file gives 2, as step 4 says).

**The earlier fixes landed.** I checked every *Status: FIXED* line of the Fable content review (1–20) and the looks review (1–18) against the current files, and each fix is in place. Examples: the thread sentence is in step 7; `nightly.sh` and `load_orders.py` are named; the child box has sockets 0, 1 and 2; there is a `rw-r--r--` label on the 126 row; SIGINT and SIGHUP are in step 6; grep and sed are in step 8; `timeout` 137 is in the Deep dive; Try it explains how to get `hung_load.py` out of the heredoc; `hung_syscall_fd` is asserted; the ␣ markers are in; the P1–P13 rows are in `FACT-CHECK.md`. Two caveats on that review: its post-build fact-check came from the forbidden model and missed an error (finding 21), and `coverage.json` → `gapReview` still names it as the reviewer (finding 22).

**Totals: 22 findings, 4 major, 18 minor.** Majors: 6, 15, 21, 22.

Overall: the Deep dive is unusually strong. It is precise, sourced and executed, and most of what a senior would ask for is there. The reel's process tree does the job, and the handoff from bisect's exit codes is earned. The problems are in four places:
- **What the reel models as good practice.** A job that catches SIGTERM exits 0, so an interrupted load reports success (finding 15).
- **The syllabus's first clause.** "filesystem and permissions" is still almost absent from the reel, the outcomes and the recap (finding 6).
- **A few loose sentences** in the captions and the Deep dive.
- **The verification trail.** Part of it rests on the forbidden model.

---

### Flow

**1. Networking words are used before any topic teaches them, and nothing declares them. (minor)**
- *Where:* step 7 (`read(4,` on "a socket nobody writes to", "fd 4 → socket"); step 9 (`ssh -N -L 5433:db.internal:5432`, "a local port", "bastion"); Deep dive "ssh and tunnels" and "A hung job"; registry `declared: ['shell-basics']`; `prerequisites.mdx`.
- *What:* the reel uses a TCP connection, a socket, ports 5432 and 5433, and a bastion host. In this chapter, IP addresses and ports are first declared at topic 18 ("Prerequisites panel: IP addresses and ports (declared)"; ledger: `ip-addresses` declared), and sockets and connections are taught in 18–19. This topic neither declares them nor lists them in its Prerequisites, so the reel quietly depends on a prerequisite that sits later in the syllabus.
- *Evidence:* `../CHAPTER.md` entry 18 ("**Declared:** `ip-addresses`", "Prerequisites panel: IP addresses and ports (declared)"); `registry.ts` line 82; `prerequisites.mdx` (two items: shell use, exit status).
- *Fix:* add `ip-addresses` to `declared`, and add a short Prerequisites item: "A host, a port and a connection: a server listens on a numbered port (PostgreSQL on 5432), and a client connects to it; a socket is a program's end of that connection." Give it one resource and a self-check. No reorder needed.
- **Status: Fixed. `ip-addresses` is added to `declared` in the registry, and Prerequisites has a new item 03 ('A host, a port and a connection') with a self-check and one resource (Beej's Guide). CHAPTER.md was not edited (the ledger there still lists `ip-addresses` as declared by topic 18; the owner or the next plan should note it is now declared here first).**

**2. Step 7 uses `/proc`, `strace` and "fd" without a word on what they are. (minor)**
- *Where:* `reel.tsx` step 7 body and options; `narration.json` step 7.
- *What:* step 2 calls descriptors "open files". Step 7's correct option then says "fd 4", the body says "`/proc` says `S`", and "`strace -p` shows `read(4,`". A refresher may assume `cd` and `ls`, but `/proc` and `strace` are listed among the concepts this topic introduces (`proc-strace`), and the reel never says what either one is. The narration ("the proc status file", "tracing the process") helps a listener a little, but not a reader.
- *Fix:* in the body, write "`/proc/<pid>/status` (the kernel's live file about the process)" and "`strace -p` (which prints each system call the process makes)". In the option, write "file descriptor 4" or "fd (open file) 4".
- **Status: Fixed. Step 8 now glosses `/proc/<pid>/status` as 'the kernel's live file about the process' and `strace -p` as 'prints each system call the process makes', and the option reads 'file descriptor 4'. Narration gloss added to match.**

**3. Prerequisites 01 quizzes the content this topic says it introduces. (minor)**
- *Where:* `prerequisites.mdx` line 11 ("what does the first column of `ls -l` show? (Answer: the file type and the nine permission bits …)"); registry `introduces: ['file-permissions', …]`.
- *What:* the learner is told that the nine permission bits are assumed knowledge, while the ledger says this topic introduces `file-permissions`. Only one of these can be true. This also hides the gap in finding 6: if rwx were really a prerequisite, the reel's near-silence on permissions would be fine.
- *Fix:* change the self-check to pure shell use, for example "How do you run a script in the current directory that is not on `PATH`? (Answer: `./script`.)". Teach rwx in the reel (finding 6).
- **Status: Fixed. The self-check is now `./script` (running a script that is not on `PATH`); rwx is taught by the new reel step (finding 6).**

**4. Step 6's caption is the longest in either §1.1 reel, and steps 6 and 7 point at each other by number. (minor)**
- *Where:* `reel.tsx` step 6 body (585 characters, against 479 for step 5 and at most 441 in the Git reel); step 7 `explain` ("step 6's job caught it and returned 0").
- *What:* step 6 carries SIGTERM, SIGKILL, SIGINT, SIGHUP, `nohup`, zombies, orphans and subreapers, plus the rule. That is several ideas in one step (Learning design: one idea per step), and the picture shows none of SIGINT, SIGHUP or `nohup` (DESIGN.md: "does the caption say what the picture shows"). On a phone, the caption is clamped to three lines with "more" (QUALITY.md #16), so most of it is never seen. "Step 6's job" also relies on a step number that the learner never sees in the content. The narration already says "the job a moment ago".
- *Fix:* cut the `nohup` parenthesis and fold SIGINT and SIGHUP into one short clause: "INT (2) is Ctrl-C and HUP (1) a lost terminal, both catchable". Write "the job a moment ago" in the step 7 explain. If finding 15 changes step 6, re-measure the caption then.
- **Status: Fixed. The exit-code step (now step 6) keeps its caption but drops the invented reason (finding 16); the signals step (now 7) lost the `nohup` clause, folds INT and HUP into one clause and is shorter (about 490 characters, from 585). The hung-job explain says 'the job a moment ago', with no step number.**

**5. The narration's recap promises eight things and says seven, and step 5's narration breaks the one-sentence-per-line rule. (minor)**
- *Where:* `narration.json` step 10 (lines 126–133) and step 5 (line 66).
- *What:* "So... eight things to keep" is followed by seven items. Cron and ssh (recap row 8) are never spoken. Step 5's fourth line has three sentences and says the same number two ways in one breath ("one hundred thirty-seven" and then "one thirty-seven").
- *Fix:* add "Cron runs it with a tiny environment, and ssh dash L brings a private port to you." before "Next up". Split line 66 into three lines and use one spoken form of 137.
- **Status: Fixed. The recap narration now says 'nine things' and speaks all nine, including cron and ssh -L; the exit-code narration is split into one-sentence lines and uses 'one hundred thirty-seven' throughout.**

### Gap hunt

**6. "Filesystem and permissions", the syllabus's first clause, is still almost invisible in the reel, in the outcomes and in the recap. (major)**
- *Where:* `coverage.json` maps the clause to the step "Exit codes: 0 to 255, and 128 plus the signal" plus the Deep dive. `index.mdx` "After this refresher you can" has five outcomes and none is about permissions. The `Recap` has no permissions row. The narration never says "permission", "rwx" or "umask".
- *What:* the chapter scope for this clause is "the tree, inodes and links at a glance, rwx for user/group/other, the execute bit on directories, `umask`, setuid only by name". In the reel, all of that comes down to one 13-unit legend label, "(rw-r--r--: no x)", on the 126 row. The Fable review rated this minor and fixed it with that label. Judged on its own, it is still a reel-level gap. A learner who only watches never meets user, group and other, the directory x bit, or `umask`. Yet those are what bite a data job: files a loader can't read because of an inherited `umask 077`, or a landing directory that others can list but not enter. The Deep dive's section is excellent, and everything needed is already executed and asserted: `umask_077=600`, `dir_read_only_ls/cat` = 0/1, `dir_search_only_ls/cat` = 2/0, `setgid_dir_group` (`examples.py` lines 146–153).
- *Fix:* add one short step after step 2, or a predict. For example: "The nightly job writes `orders.csv` under `umask 077`; the loader runs as another user in the same group: can it read the file?" Answer: no, the mode is `rw-------`; the job should use `umask 027` or a setgid landing directory. Or ask the 744/711 directory question with the executed values. Add an outcome ("read a mode string and predict who can read, enter or delete"), a recap row ("rwx × u/g/o", "x on a directory = enter; umask turns bits off"), and remap `coverage.json` to the new step. This needs a new step, so per ROUTINE.md 0 this review may be re-run on it.
- **Status: Fixed. New step 3 'Can the loader read the file?' (a predict with an answer clip, drawn by `S.Permissions`): the nightly job writes `orders.csv` under `umask 077`; the loader in the same group cannot read mode 600; `umask 027` gives 640; x on a directory means enter; a setgid directory for a landing zone. Added: an outcome bullet, a recap row ('rwx · u g o'; nine rows now, pitch 54), narration lines and an answer clip, `coverage.json` remapped (clause, expert umask item), and executed values in `examples.sh` / `examples.py` (`umask_027` 640, `loader_umask_077` 1, `loader_umask_027` 0, the latter two as root with `setpriv`, else `skipped`). Reel length: about 25 seconds of narration added; step 7 (signals) and step 8 captions were shortened, and the lab and exit-code captions kept.**

**7. The hung-job diagnosis stops at "fd 4 is a socket". The next command a senior types is missing. (minor)**
- *Where:* `index.mdx` "A hung job: /proc and strace" → "What to conclude" ("the other side is gone or silent (check the connection, then TERM)").
- *What:* the syllabus clause is "`/proc` and `strace` for a hung job". After `socket:[inode]`, the question is *which* peer: a database, an API, or a half-open connection to a host that has gone. The Deep dive says "check the connection" but not how. The standard ways are `ss -tnp` ("-p, --processes Show processes using sockets", `ss(8)`), `lsof -nP -p <pid>`, or matching the socket's inode in `/proc/net/tcp`. For a Python job, a Python-level stack (for example `py-spy dump --pid`) usually names the hung driver call at once.
- *Fix:* add one sentence with `ss -tnp` (quote `ss(8)`, Debian unstable, in `SOURCES.md`) and the inode match. Run it in `examples.sh` on the hung job if `ss` is on the runner, asserting that the peer is the listening port. Mention a Python stack dumper only as a pointer, unsourced claims left out.
- **Status: Fixed. 'What to conclude' now names `ss -tnp` (quoted from `ss(8)`; `ss` is not installed in the sandbox, so it is named, not run), `lsof -nP -p` and the inode match against `/proc/net/tcp`, which `examples.sh` runs (`hung_peer_is_listener` yes, `hung_tcp_state` 01); `py-spy dump --pid` is a pointer only.**

**8. Python signal handlers run only in the main thread, between bytecodes, and the reel's job is a two-thread Python process. (minor)**
- *Where:* `index.mdx` "Signals …" → "Handlers"; reel steps 6–7 (TERM first, then wait).
- *What:* the advice "TERM, give it a moment, then KILL" assumes the handler runs promptly. In CPython it does not always: "the low-level signal handler sets a flag which tells the virtual machine to execute the corresponding Python signal handler at a later point (for example, at the next bytecode instruction)"; "A long-running calculation implemented purely in C … may run uninterrupted for an arbitrary amount of time, regardless of any signals received"; and "Python signal handlers are always executed in the main Python thread of the main interpreter, even if the signal was received in another thread" (Python 3.15 `signal` docs, "Execution of Python signal handlers"). A load job stuck inside a database driver's C call may ignore TERM for its whole grace period. This is exactly why a scheduler's escalation to KILL (137) happens.
- *Fix:* add two of these quotes to `SOURCES.md` and one sentence to "Handlers": "In Python the handler runs in the main thread at the next bytecode, so a job blocked inside a C extension may not act on TERM until that call returns; that is when the grace period runs out and the 137 arrives."
- **Status: Fixed. The 'Handlers' bullet carries the Python rule (main thread, next bytecode, a long C call can ignore signals) with the three quotes in `SOURCES.md`. I tried to run a long C call (`3 ** n`) and the handler ran at once, so the example is the docs' own (a regular-expression match) and the database-driver case is marked as reasoning.**

**9. The `dash` and `pipefail` question is answerable now, and the answer matters for CI runners. (minor)**
- *Where:* `index.mdx` "Pipes …" last bullet ("Older `dash` may not … dash 0.5.12, the sandbox's") and "What's changing" ("whether newer `dash` versions have it was not checked").
- *What:* Debian's `dash` changelog says "dash (0.5.12-7) unstable … Upstream patch: - Implement pipefail option (Closes: #1071238)" (17 May 2024), and Debian unstable's `dash(1)` documents it ("If the pipefail option was enabled when the shell began execution of the pipeline, …"). The sandbox's `dash` is Ubuntu's `0.5.12-6ubuntu5`, which predates that patch. So whether `/bin/sh` has `pipefail` depends on the distribution's build, not only on the upstream version. On a runner like this one, `#!/bin/sh` plus `set -o pipefail` fails at line 1.
- *Fix:* replace "Older `dash` may not" with what was found: "Debian's `dash` has had it since 0.5.12-7 (2024); this runner's Ubuntu 0.5.12-6ubuntu5 does not". Quote the changelog line and the `dash(1)` sentence. Keep the advice to name `bash` in the shebang.
- **Status: Fixed. Debian's changelog line (`dash (0.5.12-7)`, 17 May 2024, 'Implement pipefail option') and the `dash(1)` sentence are in `SOURCES.md`; the Deep dive and 'What's changing' now say it depends on the distribution's build, with the sandbox's Ubuntu `0.5.12-6ubuntu5` (checked with `dpkg -l dash`) lacking it. Nothing is claimed about later Ubuntu builds.**

**10. "Write a temp file, rename it over the final name" teaches atomic visibility but says nothing about durability. (minor)**
- *Where:* `index.mdx` "Small things that bite", second bullet.
- *What:* `rename()` gives readers the old file or the new one. After a power loss, though, the new name can point at an empty or partial file unless the data was `fsync`ed before the rename (and the directory after it). A sceptical reader will ask, and the chapter has a topic for it (10, `fsync`).
- *Fix:* add one clause: "atomic for readers, not durable after a crash: that needs `fsync` on the file before the rename and on the directory after (Storage devices and fsync durability, §1.2)". No new claim needs a source here, because it points to topic 10.
- **Status: Fixed. One clause added: atomic for readers, not durable after a crash; needs `fsync` on the file and on the directory (points to §1.2, no new source).**

**11. Load average lacks the rule for reading it: compare it with the number of CPUs. (minor)**
- *Where:* `index.mdx` "Looking at processes" → "Load average".
- *What:* the bullet explains R plus D and the "high load, idle CPUs" case well, but not the everyday reading. A load of 8 saturates 4 CPUs and is light on 64. The chapter scope asks for "load average" among the things that matter.
- *Fix:* "Read it against the CPU count (`nproc`): a 1-minute load near the number of CPUs means every CPU has work; well above it, tasks are queueing." This follows from the `proc_loadavg(5)` definition already quoted; mark it as reasoning.
- **Status: Fixed. Added the CPU-count rule (`nproc`), marked as reasoning from the `proc_loadavg(5)` definition.**

**12. The lab never says why `diff` can come out empty: `clean.py` prints the `uniq -c` format on purpose. (minor)**
- *Where:* `index.mdx` "Try it" and "One-liners" → "The lab's pipeline"; `examples.sh` line 71 (`print(f'{counts[status]:7d} {status}')`).
- *What:* `uniq -c` pads counts to a width of 7. `clean.py` was written to match that exactly, and that is the only reason `diff` prints nothing. A reader who builds the lab against their own script (the syllabus's actual task: "reproduce the script's output … and diff the two") gets a non-empty `diff` from whitespace alone and won't know why. `LC_ALL=C` is explained; the padding is not.
- *Fix:* add one sentence: "`clean.py` prints `%7d %s`, the shape `uniq -c` prints; with any other script, normalise both sides first (`awk '{print $2, $1}'`) before `diff`".
- **Status: Fixed. 'The lab's pipeline' and 'Try it' say `clean.py` prints `%7d %s`, the shape `uniq -c` pads to, and that a script of your own needs both sides normalised (`awk '{print $2, $1}'`) before `diff`.**

**13. "What's changing" has nothing on scheduling, where single-host practice has moved. (minor)**
- *Where:* `index.mdx` "What's changing"; "cron" → "No overlap guard" ("cron also has no retries, backfill … catch-up").
- *What:* on current Linux hosts, systemd timers are the usual alternative to cron, and they fix one of the gaps the Deep dive names. Debian `systemd.timer(5)`: "Persistent= … If true, the time when the service unit was last triggered is stored on disk. When the timer is activated, the service unit is triggered immediately if it would have been triggered at least once during the time when the timer was inactive. … This is useful to catch up on missed runs of the service when the system was powered down."
- *Fix:* add one frontier bullet naming systemd timers and `Persistent=` (quote in `SOURCES.md`), with orchestrators (Chapter 11) as the next step up. Don't claim more of systemd than is quoted.
- **Status: Fixed. A frontier bullet names systemd timers and `Persistent=` (two sentences quoted in `SOURCES.md` from `systemd.timer(5)`) and points to orchestrators (Chapter 11).**

### Expert reader

**14. Step 3 says "both lines land in the file", but there is one line. (minor)**
- *Where:* `reel.tsx` step 3 `explain` (line 44: "Write `> out.log 2>&1` and both lines land in the file"); `narration.json` step 3 `answer` ("Put the file first, then the copy, and both lines land in the file.").
- *What:* the job prints exactly one line, the error. The caption says so ("The job prints one error line"), and so do the run (`examples.sh` line 133: `out2_log_lines` = 1) and the Deep dive ("put the 1 line in the file"). "Both lines" makes the learner look for a second line that doesn't exist. The phrase comes from `OUTLINE.md` line 80 ("both lines in the file").
- *Fix:* "Write `> out.log 2>&1` and the error lands in the file too." Narration: "Put the file first, then the copy, and the error line lands in the file."
- **Status: Fixed. Step 4 explain: 'the error lands in the file too'; the narration answer says 'the error line lands in the file'; the `examples.py` comment is corrected.**

**15. A job that catches SIGTERM exits 0: the reel teaches an interrupted job to report success. (major)**
- *Where:*
  - `examples.sh` lines 237–254: `term_handler.py`'s handler prints "flushed and closed" and calls `sys.exit(0)`, checked as "a program that catches TERM exits 0".
  - `scenes.tsx` `Signals`: a caramel `0` token rides up to the parent.
  - `reel.tsx` step 7 `explain`: "step 6's job caught it and returned 0".
  - `index.mdx` "Handlers": "can flush, close and exit 0".
  - `index.mdx` "In production": "143 from a scheduler's graceful stop".
  - `examples.py` line 72.
- *What:* the job was stopped before it finished, so its load is incomplete. Exiting 0 tells cron, a CI gate, `git bisect run`, an orchestrator or Kubernetes that it *succeeded*. Downstream steps then run on partial data. That is the same false success this topic's own step 4 warns about ("instead of loading nothing") and its first "In production" item ("A nightly script that 'succeeded' with an empty table"). The primary guidance is to clean up and then re-raise. glibc manual, "Termination in Handler": "The cleanest way for a handler to terminate the process is to raise the same signal that ran the handler in the first place", and "We could just call exit or abort, but reraising the signal sets the return status from the process correctly." The reel draws the 0 as the good outcome, in caramel, next to the cherry 137.
- *Fix:*
  - The handler flushes and closes, then re-raises with `signal.signal(signal.SIGTERM, signal.SIG_DFL); os.kill(os.getpid(), signal.SIGTERM)`, or calls `sys.exit(143)`. The shell then sees 143.
  - Step 6 shows a 143 token in crema (a clean stop) under "flushed and closed", against the cherry 137 "gone mid-write". The lesson becomes "both are stops, and the status says so; only TERM let it flush".
  - Step 7's contrast becomes "143 either way; the difference is what got flushed". This also removes the contradiction Fable #1 patched with a label.
  - Update `handled_term` in `examples.sh` and `examples.py`, the step 6 and step 7 narration, the Deep dive "Handlers" bullet (add the glibc quote to `SOURCES.md`) and the "In production" 143 bullet ("and exit 143, so the scheduler records a stop, not a success").
  - This redesigns step 6's final frame, so ROUTINE.md 0 allows a re-review of that step.
- **Status: Fixed. `term_handler.py` flushes, then restores `SIG_DFL` and re-raises TERM: the shell sees 143 (`handled_term` 143, also asserted for a handler that calls `sys.exit(143)`; `handled_exit0` 0 is kept as the executed trap). Step 7 (signals) now shows a crema 143 under 'flushed and closed' against the cherry 137 'gone mid-write'; the hung-job explain says 'Either way the shell sees 143; the job a moment ago flushed first'; the picture label reads 'no handler, no flush'. Narration for both steps, the Deep dive 'Handlers' bullet (glibc quotes in `SOURCES.md`), the 'In production' 143 bullet and the outcome bullet are updated.**

**16. Step 5's "which is why Python reports … −9" invents a reason. The outcome misstates bisect's 126/127 check. (minor)**
- *Where:* `reel.tsx` step 5 body (line 75) and `narration.json` line 66; `index.mdx` outcomes line 11 ("treats a first-run 126 or 127 as a broken test").
- *What:*
  - (a) Python's `subprocess` reports −9 because it reads the wait status itself (`WIFSIGNALED` / `WTERMSIG`), which keeps an exit and a signal apart. The shell has to fold both into one `$?` number. The Deep dive says this correctly ("137 is the shell's encoding"). The caption ties it to "a program could exit with 137 itself", which nobody claims.
  - (b) `builtin/bisect.c` re-checks a first-run 126 or 127 "with a known-good revision to avoid trashing the bisect run due to a missing or non-executable script". It errors out only if the good revision gives the same code. The Deep dive body (line 51) gets this right; the outcome line does not.
- *Fix:* (a) "…by convention: a program could exit 137 itself. Python's `subprocess`, which reads the wait status directly, reports a kill as −9." (b) "…and why `git bisect run` re-checks a first-run 126 or 127 on a known-good revision".
- **Status: Fixed. (a) The caption and narration now say 'by convention: a program could exit 137 itself. Python's `subprocess`, which reads the wait status directly, reports a kill as -9'. (b) The outcome says `git bisect run` 're-checks a first-run 126 or 127 on a known-good revision'; the caption and narration say 're-checks' instead of 'distrusts'.**

**17. "Builtins … which is why `bash -c 'kill -KILL $$'` kills the shell it runs in" has the wrong cause. (minor)**
- *Where:* `index.mdx` "The process model", first bullet.
- *What:* `$$` "Expands to the process ID of the shell" (Bash manual, already in `SOURCES.md`). That is why the shell dies, whether `kill` is a builtin or `/bin/kill`. The same sentence then says the child gets "the same open file descriptions, so a redirection set before `exec` survives it". That mixes up two separate facts: `fork` shares open file descriptions (offsets and flags), and `execve` keeps descriptors open unless they are close-on-exec, which the next bullet states correctly.
- *Fix:* "(builtins such as `cd`, `export` and `set` run inside the shell itself; `$$` is the shell's own PID, which is why `bash -c 'kill -KILL $$'` kills that shell)". Cut the clause "so a redirection set before `exec` survives it" from the fork bullet; the exec bullet already covers it.
- **Status: Fixed. `$$` is the shell's own PID (Bash manual: 'Expands to the process ID of the shell', already in `SOURCES.md`); the clause 'so a redirection set before `exec` survives it' is cut from the fork bullet, which now says the descriptors share offsets and flags.**

**18. "A bastion key with the wrong permissions fails silently into a password prompt." It isn't silent. (minor)**
- *Where:* `index.mdx` "ssh and tunnels" → "Keys".
- *What:* OpenSSH's `sshkey_perm_ok` (`authfile.c`, openssh-portable master) prints `error("@ WARNING: UNPROTECTED PRIVATE KEY FILE! @")`, then "Permissions 0%3.3o for '%s' are too open.", then "This private key will be ignored." The `ssh(1)` quote ("will simply ignore a private key file if it is accessible by others") is right, but the gloss "fails silently" is wrong. What does bite a data job is the next step. Under cron or `BatchMode=yes` there is no password prompt, so the job fails with ssh's 255, and the warning goes to stderr. If stderr isn't redirected, finding 14's lesson applies.
- *Fix:* "ssh prints a loud warning and skips the key, then tries the next method: a password prompt by hand, or exit 255 under cron and `BatchMode=yes`". Quote the `authfile.c` lines (URL in `SOURCES.md`, or cite them in `FACT-CHECK.md` the way the jq `main.c` lines are cited, since `sources.mjs` strips text between `<` and `>`).
- **Status: Fixed. The Keys bullet now says ssh warns loudly and skips the key, quotes the three `authfile.c` lines (in `SOURCES.md`, and the check passes because the quoted lines contain no angle brackets), and says that under cron or `BatchMode=yes` the job then fails with 255. The permission check was read in the source, not run (no `sshd`). The 'In production' bullet is corrected the same way.**

**19. Step 8: "40 badly spelt events" are not misspelt, and the grep clause asserts a number the screen doesn't explain. (minor)**
- *Where:* `reel.tsx` step 8 body; `narration.json` step 8; `scenes.tsx` `PipelineLab` (the line `40 events: Paid · SHIPPED␣ · ␣refunded`).
- *What:* the 40 events differ in case and blanks (`Paid`, `SHIPPED␣`, `␣refunded`), not spelling. awk fixes case and blanks and would fix no misspelling, so "badly spelt" teaches the wrong limit of the step. "`grep -c` counts strings, not values: 1,495 where there are 1,500" gives no reason. The pattern isn't shown, and the reason (5 events read `" refunded"`) is only in the Deep dive. "`sed` is for log lines, not JSON" is a slogan without a reason.
- *Fix:* "40 events with stray capitals or blanks". "A `grep` for `"refunded"` misses `" refunded"`: 1,495, not 1,500. Count values after parsing, not strings." Drop the sed clause from the caption (the Deep dive has it), or give the reason: "sed sees text, not fields".
- **Status: Fixed. The caption says '40 events with stray capitals or blanks', explains the grep miss (`"refunded"` against `" refunded"`: 1,495, not 1,500) and 'count values after parsing, not strings'; the sed clause is dropped from the caption (the Deep dive keeps it). Narration to match.**

**20. Step 9's example time is exactly the DST trap, and the reel says only "runs in one timezone". The D-state line is stated as absolute. (minor)**
- *Where:* `reel.tsx` step 9 body; `scenes.tsx` `CronSsh` ("runs at 02:15 every day"); `reel.tsx` step 7 `explain` ("D waits for I/O and ignores even kill until it returns").
- *What:*
  - (a) The Deep dive shows by execution that 02:15 doesn't exist in Europe/Berlin on 29 March 2026 and occurs twice on 25 October 2026. The picture still says "every day", which is false on those nights under local-time cron. The chapter scope names "timezone and DST traps".
  - (b) Since TASK_KILLABLE, many waits that `ps` reports as uninterruptible can be ended by a fatal signal. LWN, "TASK_KILLABLE": "it behaves like TASK_UNINTERRUPTIBLE with the exception that fatal signals will interrupt the sleep". The Deep dive's "usually can't act on either" is the right strength; the reel's "ignores even kill" is not.
- *Fix:* (a) In the step 9 body, add "and 02:15 is skipped or doubled on DST nights unless cron runs in UTC", and a taupe note under "runs at 02:15 every day": "(local time: not on DST nights)". (b) Write "usually ignores even kill until it returns". The LWN quote is optional, because "usually" needs no new claim.
- **Status: Fixed. (a) The cron caption adds 'and 02:15 is skipped or doubled on DST nights unless cron runs in UTC' and the picture has a taupe '(local time; not on DST nights)' beside 'runs at 02:15 every day'; narration to match. (b) The hung-job explain says D 'usually ignores even kill until it returns' (the narration too).**

**21. The post-build fact-check and the earlier content review were done on a model the project forbids, and they missed at least one error. (major)**
- *Where:* `FACT-CHECK.md` → "Post-build additions" (P1–P13: "one pass over the added paragraphs only, by the content reviewer, not a second full fact-check"); the Fable section of this file (finding 7 status: "The second pass over the added paragraphs was done by the content reviewer, not a separate Opus run").
- *What:* ROUTINE.md 0 makes fact-checking an Opus job by a fresh agent and forbids Fable for any job. About twenty Deep-dive claims added after the Opus fact-check were verified only by the Fable reviewer, and P1–P13 cover only part of them. Not covered: ssh `-D`, `-A` and 255; sticky and set-group-ID directories; `&>`, `|&` and `noclobber`; `sed -E/-s/-z`; grep's binary notice; jq `//`, `@tsv`, `--argjson`, `--stream` and `-e`; `top`'s Irix mode, `wa` and `VIRT`. Finding 18 (a false gloss on an ssh quote) passed that pass. Findings 9 and 17 are in the same class of added sentences.
- *Fix:* run one fresh Opus fact-check pass, as ROUTINE.md 2.3 asks, over exactly the Deep-dive sentences that are not among claims 1–60 or R1–R12. List them from `OUTLINE.md` → "Build notes … Deep dive additions" plus the post-review edits. Re-derive each one from its fetched source or its executed value, and replace the P table with its result.
- **Status: Not done here, by instruction (a process finding for the run). The changed claims of this pass are listed in `FACT-CHECK.md` under 'Post-review additions (unchecked)' for the fresh fact-check.**

**22. `coverage.json` → `gapReview` records a gap review by the forbidden model as closed. (major)**
- *Where:* `coverage.json` → `"gapReview": {"date": "2026-10-11", "by": "the Fable content reviewer", "open": []}`.
- *What:* ROUTINE.md 4 has the run record the content review's gap review after its findings are fixed. The only gap review on record ran on a disallowed model, and findings 6–13 above are open gaps. The build's coverage check passes on a record that is not valid.
- *Fix:* once findings 6–13 are fixed or recorded as out of scope in `coverage.json`, set `gapReview` to `{"date": "<fix date>", "by": "Opus content review (2026-10-12)", "open": []}`. Until then, list the open item ids.
- **Status: Not done here, by instruction (the run records the gap review). `gapReview` is untouched; findings 6-13 are fixed.**

