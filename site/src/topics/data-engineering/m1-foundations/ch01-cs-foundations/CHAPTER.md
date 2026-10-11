# Chapter 1 plan: Prerequisites and Computer-Science Foundations (Data Engineering, Milestone 1)

This is the contract for every topic of Chapter 1 (ROUTINE.md section 1A). Builders keep to their own entry and read the entries next to theirs. Don't edit this file. If a topic really can't keep to its entry, record why under `OUTLINE.md` → "Changes from the chapter plan" and say so in the report.

- **Planned:** 11 October 2026, from the syllabus after the 10 October reorder (`syllabus/review-notes/de-m1.md`, "Reorder, 10 October 2026"; QUALITY.md #2, #3).
- **Registry fields shared by every topic:** `domain: 'data-engineering'`, `milestone: { number: 1, title: 'Foundations' }`, `chapter: { number: 1, title: 'Computer-science foundations', section: '1.1' | '1.2' | '1.3' | '1.4' }` (as on the two registry entries that exist), `slug` = the folder below `site/src/topics/`. The registry `title` is the syllabus title (the entry's heading) unless the entry names a different **Registry title**; `syllabusTitle` is always the heading's title word for word. An entry with no **Declared** line declares nothing.
- **Fixed topics, planned around and not rewritten:** Python language essentials (**live**), Git branching and history workflows (**in progress** on `topic/de.git-branching-history-workflows`: built, content review fixed, checks, narration and shipping still to do), The external-memory (I/O) cost model (**built, held**).

---

## The chapter

### The problem it solves

A data engineer who can't price work before running it finds out what it costs from the bill or from a 3 a.m. page. This chapter is the price list, and it builds the habit of using it before running anything: what a step costs on each layer of the machine (cache line, RAM, page cache, SSD, object store, network), how the algorithms that dominate data systems (indexes, hashing, external sorting, DAG scheduling) turn data size into block transfers, and what the network adds in round trips, bytes and tail latency. The five refreshers at the start check the tools every later lab assumes: Python, Git, the shell, the delivery loop, and the notation for counting cost. The learner leaves able to look at a query, a job or a fan-out and estimate its floor, its likely bottleneck and its failure mode first.

### Order of ideas, and why

1. **§1.1 Tools and notation (refreshers 1–5).** Python → Git → shell → delivery loop → asymptotic notation and logarithms. The tools come first because every later lab uses them. The notation comes last in §1.1 because §1.2 and §1.3 count with it: big-O to talk about growth, and logarithms in large bases for B-tree heights and sort passes.
2. **§1.2 The machine, from the top of the hierarchy down (6–12).** First the whole ladder with its numbers (6). Then down the rungs: CPU caches and SIMD (7), many cores sharing them (8), virtual memory and the page cache that sit between a program and its files (9), the devices under that and what makes a write durable (10), object storage at the bottom (11). Last, what the bytes mean as numbers (12), which closes the hardware with the bugs that representation causes. Each rung uses only the rungs above it, so the order is the dependency order.
3. **§1.3 Algorithms priced in transfers (13–17).** Indexes at a glance (13) → the I/O cost model that counts block transfers (14, built) → hash tables, the other half of joins and aggregations (15) → external merge sort, what every sort spill falls back to (16) → graph algorithms that schedule many such jobs as a pipeline (17).
4. **§1.4 The network (18–22).** Layers and per-packet overhead (18) → TCP's round trips and windows (19) → what DNS, load balancers and TLS add to a call (20) → bandwidth, distance, locality and the bill (21) → what happens to latency when one request fans out to many servers (22), which hands off to Chapter 2.

### One running example: the shop's order pipeline

All topics use one fictional online shop (no real company, no real person). When a topic needs data, it takes it from here, so numbers carry across reels. A topic may scale a number up or down if it says how that relates to this example. Every number shown on screen is computed or asserted in that topic's own `examples.py` (QUALITY.md, automatic check).

| Piece | Values (fixed by the held I/O cost model; don't change them) |
|---|---|
| `orders` table in PostgreSQL | 100,000,000 rows of about 80 bytes; 100 rows per 8 KB page; **1,000,000 pages**; an index on `status`; the "2% refunded" query |
| `order_events` | raw order events land as JSON lines in object storage and are compacted to Parquet; **1 TiB** in total; the nightly job sorts it with **16 GiB** of memory in **1 MiB** blocks (64 runs, fan-in up to 16,383, 2 passes) |
| `customers` dimension | about **100 MB** |
| Cluster | **100 machines**, 10 Gbit/s each (the shuffle vs broadcast example: about 990 GB against 9.9 GB) |
| Columns used by §1.2 topics | `order_id` (integer), `customer_id`, `status`, `amount` (money: `DECIMAL(12,2)` in the warehouse, the float bug in topic 12), `event_time` (timestamp, µs) |
| The pipeline (DAG) | `ingest_events → clean (clean.py) → load_orders → daily_revenue → publish`, plus side branches added by topic 17. `clean.py` is the data-cleaning script the Git refresher already uses |

Each topic's slice of the example is given in its entry.

### Shared notation and terms

- **Sizes.** Memory, page, block and file sizes are powers of two. Deep dives and computations write KiB, MiB, GiB and TiB. A reel may keep PostgreSQL's own spelling "8 KB page" (8,192 bytes), as the held cost model does. Network rates are decimal **bits** per second (Gbit/s), and volumes sent over the network are decimal bytes (GB, TB). Write bytes as **B** and bits as **bit**, and never write "Gb", which is ambiguous. A figure quoted from a vendor keeps the vendor's spelling and says so (AWS's "8 MB or 16 MB" ranges and "85–90 MB/s" per request). Every Deep dive table states its units.
- **Time.** ns, µs, ms, s, with thousands separators (16,384) and no scientific notation on screen.
- **The cost of one transfer**, at every tier and on the network: **T(n) = α + n/β**, where α is a fixed latency per request or transfer and β is a bandwidth. Topic 6 introduces it (`latency-bandwidth-cost`). The held cost model uses the same α + n/β and α·β in its network section, so topics 6, 10, 11, 19 and 21 must use these letters.
- **The I/O model letters** (fixed by topic 14): **N** items, **M** items that fit in memory, **B** items per block, **P/D** parallel transfers or disks, and **r** = what a random read costs in sequential reads. In §1.3 these are counts of items, not bytes. Topics 15 and 16 use them unchanged.
- **Logarithms:** log_b x, with ln for natural logs and log₂ for base 2; change of base log_b x = ln x / ln b. **Growth:** O, Θ, Ω (topic 5).
- **Latency percentiles:** p50 (median), p99, p99.9, introduced by topic 11 and used by 22 (and by any later topic that shows one, which then lists `latency-percentiles` in `uses`).
- **RTT** (round-trip time), introduced by topic 19. Topic 6's table may show "same-AZ round trip" as a number before that, and explains it in a few words.
- **Words:** "page" (database), "OS page" or "virtual-memory page" (topic 9), "block" (device or I/O-model unit), "cache line" (CPU), "range" (object storage). Topics say which one they mean, because the I/O cost model's step "Every tier has its own B" unifies them.
- **Spoken numbers:** narration has no digits, symbols or code names (automatic check). Write "sixteen gibibytes" or "sixteen gigabytes of memory" as the plan's pronunciation lexicon says, and say a tool's job rather than its name where the voice stumbles (QUALITY.md #29).

### The canonical numbers (one owner)

**Topic 6 (Memory hierarchy and latency numbers) owns the chapter's latency and bandwidth table.** It publishes one table, each row with a primary source and the date it was checked, every value asserted in its `examples.py`. Topics built in parallel use the **planning orders of magnitude** below, which match what the held I/O cost model already shows. A builder who needs an exact figure cites a primary source for that specific device or service and labels it as that device's figure. If a topic's sourced figure disagrees with this table by more than an order of magnitude, it records this in its `REVIEW.md` for the release seam check. Don't put a number from this table on screen without your own source for it.

| Tier | Latency, order of magnitude | Bandwidth, order of magnitude | Already fixed by |
|---|---|---|---|
| L1 / L2 / L3 hit | about 1 ns / a few ns / about 10–40 ns | — | topic 6 to source |
| DRAM, local / remote NUMA node | about 100 ns / more than local (topic 6 measures the ratio) | tens of GB/s for one core; hundreds of GB/s for a multi-channel server socket | topic 6 to source |
| NVMe SSD random 4 KiB read | tens of µs | a few GB/s sequential per drive | topic 6 / 10 to source |
| HDD | several ms per seek; the held prerequisites use 7 ms | about 200 MB/s sequential | held I/O topic, Prerequisites 02 |
| Same-AZ network | round trip well under 1 ms | 10–100 Gbit/s per machine | topic 6 / 21 to source |
| Object storage (S3) | first byte: medians in the tens of ms for requests under 512 KB, roughly 100–200 ms "consistent" for small objects (AWS) | about 85–90 MB/s per request (AWS whitepaper); 8 or 16 MB typical range sizes; at least 3,500 writes or 5,500 reads per second per prefix | held I/O topic, Deep dive ("The network, counted the same way", "In production") |

### One visual language for the chapter's reels

The chapter builds from `site/src/reels/kit.tsx` (`Stack`, `Svg`, `T`, `Bar`, `C`), `site/src/reels/Code.tsx` (`Code`) and DESIGN.md. On top of that, it shares one grammar so that a learner swiping through all 22 reels reads colour and layout the same way. Each topic still invents its own picture for its own idea (DESIGN.md "Its own idea"; each entry gives a visual idea, and no two are the same).

- **Colour means the same thing in every reel of the chapter.**
  - `crema`: data and values as they are.
  - `latte`: secondary labels.
  - `taupe`: axes, units, quiet notes, and *waiting* (a request in flight, a stall that isn't a failure).
  - `caramel`: **the cost being counted**, the thing to look at: the transfer that moves, the read that misses, the chosen option, the answer.
  - `cinnamon` (large text and shapes only): **the alternative being compared**, such as the second strategy, the other layout, or the other curve.
  - `cherry` fills with `C.cherryText` labels: **a bad outcome**, such as a stall that hurts, a lost write, an overflow, a wrong total, a dropped packet or a timeout.
  - At most two accents per step.
- **Tiers are always ordered fastest at the top** (or at the left, in landscape). A tier is shown as a band with its name in `latte` and its latency in `crema`.
- **Latency axes are logarithmic**, with decade ticks labelled 1 ns, 1 µs, 1 ms, 1 s in `taupe`. Time runs left to right.
- **A transfer is a caramel block that moves.** A wait is a taupe bar, and a failure turns the bar cherry. Request timelines (topics 11, 19, 20, 22) use the same waterfall layout: one row per request, with first-byte wait then transfer.
- **Reel shape.**
  - Refreshers (1–5, 13, 17, 18) open on `RefresherList` (from `../refreshers.tsx`) for the five §1.1 refreshers only. Topics 13, 17 and 18 open on their own problem frame. Every refresher closes with "In one breath" (the Python and Git pattern), has 2–3 predict steps, and takes about 5 minutes.
  - Full topics follow the held cost model's shape. They open on the problem from the running example, ask a predict question early, show the mechanism in steps, go "Back to the problem", then "Prove it · 1 of 3 … 3 of 3". They take about 10–15 minutes.
- **The refresher list is fixed:** `REFRESHERS` in `refreshers.tsx` names the §1.1 refreshers 'Python essentials', 'Git branching and history', 'Linux shell and processes', 'Software delivery workflow' and 'Asymptotic notation and logarithms'. Topics 3–5 use exactly these strings as their registry `title`, so the list and the feed agree.

### The chapter labs: who hosts what

The syllabus puts one *Lab* bullet at the end of each section. Each one is a **chapter lab for a human**: a reproducible local setup run in one sitting. No single reel can contain one. Each part is hosted in one topic's Deep dive "Try it" / "Build, break, measure" section, which gives the script, the expected results and what to break. That topic's `coverage.json` maps the lab part to that section. Every other topic links to the host and doesn't repeat it.

| Lab part (syllabus words) | Host topic, Deep dive section |
|---|---|
| §1.1 "`git bisect` a planted regression in a data-cleaning script using a failing test as the oracle" | 2 Git (already built: `examples.sh`, 1,000 commits, `clean.py`) |
| §1.1 "reproduce the script's output with a shell pipeline (`jq` + `awk` + `sort \| uniq -c`) and diff the two" | 3 Linux shell |
| §1.1 "the refresher gate, in one sitting on a clean machine" (the whole gate as one checklist that links both parts) | 4 Software delivery workflow: the gate runs as a CI job whose oracle is the failing test |
| §1.2 "sequential vs random reads in RAM" | 6 Memory hierarchy |
| §1.2 "on NVMe with and without the page cache (`O_DIRECT`)" | 10 Storage devices (uses `page-cache` and `o-direct` from 9) |
| §1.2 "against an object store across range sizes" | 11 Object storage (a local S3-compatible server plus `tc netem` delay, or a real bucket) |
| §1.2 "sum the same float column in two orders and show different totals" | 12 Numeric representation |
| §1.2 "reproduce false sharing between two threads and remove it with padding" | 7 CPU caches (a small C program with two POSIX threads; Python can't show it reliably) |
| §1.3 "implement external merge sort over a file 10× larger than an enforced memory limit (cgroup or container limit); vary run size and fan-in and plot passes and wall-clock against the I/O-model prediction" | 16 External merge sort |
| §1.3 "then implement a spilling hash aggregation" | 15 Hash tables |
| §1.3 "and find the key-cardinality crossover where sort-based aggregation wins" | 16 External merge sort (it has both halves). The held I/O topic's "Lab 2" already states this whole lab; see Notes for the audit |
| §1.4 "with `tc netem`, inject latency and loss between a client and a PostgreSQL or HTTP server; measure throughput with and without connection reuse" | 19 TCP handshakes (writes the shared `tc netem` setup that 21 and 22 reuse; 11 already used one `netem` delay command in its lab and explained it there) |
| §1.4 "and with BDP-sized buffers" | 21 Bandwidth, latency and data locality |
| §1.4 "then build a 50-way fan-out client, show the p99 blow-up, and recover it with hedged requests" | 22 Tail latency under fan-out |

---

## The topics, in syllabus order

Folder prefix for every topic: `site/src/topics/data-engineering/m1-foundations/ch01-cs-foundations/`. Concept ids are kebab-case. A concept is in `uses` only if a topic above it introduces it, and `declared` lists knowledge from another track or that every reader of this course has.

---

### 1. Python language essentials (`de.python-essentials`): refresher, §1.1, LIVE

- **Folder:** `python-essentials`. **Registry title:** 'Python essentials'. **State:** live since 10 October 2026. Fixed: don't rebuild it.
- **Scope (syllabus clause → what it delivers):**
  - "functions and classes": mutable defaults, late-binding closures, dataclasses, equality and hash.
  - "comprehensions": filter, then map.
  - "context managers as resource-lifetime guarantees": they always clean up.
  - "decorators": wrapping functions, keeping identity.
  - "iterators and generators for bounded-memory streaming pipelines": generators stream, lists pile up; `yield` and `next()`.
  - "type hints": they don't run; a type checker in CI.
  - "the recall a senior needs in code review (performance internals in §4.1)": the Deep dive's "In code review" section. Performance internals are left to §4.1.
- **Outcomes (as published):** spot the classic review bugs; choose a generator over a list for data that may not fit in memory; write identity-preserving decorators and always-cleaning context managers; say what type hints do at runtime.
- **Introduces:** `python-functions`, `mutable-defaults`, `comprehensions`, `generators`, `context-managers`, `decorators`, `dataclasses`, `type-hints`. **Uses:** none. **Declared:** `programming`.
- **Bridge:** "Data Engineering opens with five quick refreshers. Skim what you know; stop where you are rusty."
- **Handoff:** "Next refresher: Git, the history behind every pipeline change."
- **Prerequisites panel (as built):** "Programming in Python, or a language like it" (declared), with resources.
- **Lab:** its "Try it" (a batched CSV generator with `tracemalloc`) is its own exercise, not part of the §1.1 gate.
- **Visual idea (as built):** code with small drawings, such as a timeline of four dots for context managers.
- **Sources:** as listed in its Deep dive.

### 2. Git branching and history workflows (`de.git-branching-history-workflows`): refresher, §1.1, IN PROGRESS

- **Folder:** `git-branching-history-workflows`. **Registry title:** 'Git branching and history'.
- **State:** branch `topic/de.git-branching-history-workflows`. The reel (9 steps), Deep dive, prerequisites, narration script, `examples.sh` + `examples.py`, coverage map and registry entry are built, and the 34 content-review findings are fixed. Checks, narration and shipping are still to do. Fixed: this entry describes it as it is.
- **Scope:**
  - "rebase vs merge (linear history vs preserved topology)": step "Merge or rebase?".
  - "interactive history cleanup": "Clean up before you push", plus the reflog.
  - "`git bisect` to find regressions": two bisect steps, `bisect run` with exit codes.
  - "conflict resolution": base, ours, theirs; `zdiff3`; the swap during a rebase.
  - "PR flow": three ways to land a PR.
  - "trunk-based vs long-lived branches": "Short-lived branches, one trunk".
  - CI itself, test frameworks and review norms are left to topic 4.
- **Outcomes (from its OUTLINE):**
  - Say what merge and rebase do to the commit graph and pick one.
  - Clean up a branch and undo a rewrite from the reflog.
  - Resolve a conflict knowing base, ours and theirs.
  - Find a regression in about log₂ N test runs with `git bisect run` and the right exit codes.
  - Choose how a PR lands and explain why short-lived branches avoid repeated conflicts.
- **Introduces:** `commit-graph`, `merge-vs-rebase`, `interactive-rebase`, `reflog`, `merge-conflicts`, `git-bisect`, `exit-status` (only as bisect reads it: 0 good, 1–127 bad except 125, 125 skip, 128 and above stop the run), `pr-merge-strategies`, `trunk-based-development`. **Uses:** none. **Declared:** `git-basics`.
- **Bridge:** "You've got the Python; every change to it lands as a commit. Here is how to shape that history, search it and share it."
- **Handoff:** "Next refresher: the Linux shell, where exit codes like the ones bisect reads come from."
- **Prerequisites panel (as built):** everyday Git (declared), reading a commit history, a script that fails with a test; the Python refresher (Before this).
- **Lab:** hosts the §1.1 bisect part (`examples.sh`: 1,000 commits, the regression at commit 731 in `clean.py`, found in 10 runs).
- **Visual idea (as built):** a living commit graph of the `clean.py` repo, with real 7-character IDs.
- **Sources:** git-scm.com reference pages (git-bisect 2.56.0, git-rebase, git-merge and git-rerere 2.54.0, git-reflog 2.51.1), Pro Git 2nd ed., GitHub Docs on merge methods, trunkbaseddevelopment.com.

### 3. Linux shell and process toolkit (`de.linux-shell-process-toolkit`): refresher, §1.1

- **Folder:** `linux-shell-process-toolkit`. **Registry title:** 'Linux shell and processes'. About 5 min.
- **Scope:**
  - "filesystem and permissions": the tree, inodes and links at a glance, rwx for user/group/other, the execute bit on directories, `umask`, setuid only by name.
  - "pipes and redirection": file descriptors 0, 1 and 2; `>`, `>>`, `2>&1` and its order trap; `|`; a pipeline's status is its last command's, so a failing earlier step still exits 0, and `pipefail` is the fix.
  - "the process model (fork/exec, signals, exit codes)":
    - fork then exec; wait and the exit status.
    - Where 0–255 comes from, the shell's 128+n after signal n, 126 (not executable) and 127 (command not found), and so why bisect reserves 125 for "skip" and treats 126 and 127 on a first run as a broken test. This deepens topic 2's `exit-status` and doesn't re-introduce it.
    - SIGTERM vs SIGKILL vs SIGINT and SIGHUP; zombies and orphans.
    - **One sentence on threads:** a process may run several threads that share its memory, and `ps -L` and htop show them. Topic 7 needs this.
  - "`ps`/`top`/`htop`": states (R, S, D, Z), load average, which columns matter.
  - "`grep`/`awk`/`sed`/`jq`": one-liners over `order_events` JSON lines.
  - "cron": the crontab format, the minimal environment, overlap, timezone and DST traps. Real orchestration is Ch.11.
  - "ssh and tunnels": keys, `-L`, `-R`, `-J`, to reach a database behind a bastion.
  - "`/proc` and `strace` for a hung job": `/proc/<pid>/status`, `wchan`, `fd`, `stack`; `strace -p` on a load job stuck in `read()` on a socket or in state D.
  - Leaves the costs of processes and threads to 8, virtual memory to 9, devices and fsync to 10, and networking to 18–22.
- **Outcomes:**
  - Predict what a pipeline with redirections writes where, and make it fail loudly (`set -euo pipefail`).
  - Read an exit status: normal exit vs killed by a signal (128+n).
  - Diagnose a hung job with `ps`, `/proc` and `strace`, and stop it gracefully before forcefully.
  - Reproduce a Python script's aggregation with `jq | awk | sort | uniq -c`.
  - Schedule a job with cron and reach a private database through an ssh tunnel.
- **Introduces:** `file-permissions`, `pipes-redirection`, `process-model`, `signals`, `threads-basics`, `process-inspection`, `text-tools`, `cron`, `ssh-tunnels`, `proc-strace`. **Uses:** `exit-status`, `git-bisect`. **Declared:** `shell-basics` (cd, ls, running a command).
- **Bridge:** "Bisect trusted an exit code. Here is where exit codes come from: processes, their signals, and the pipes between them."
- **Handoff:** "Next refresher: how a change gets from your branch to production safely: review, tests, CI and versions."
- **Prerequisites panel:** basic shell use (declared), with resources. The Git refresher is "Before this".
- **Visual idea:** a process tree. Processes are boxes, pipes are tubes between their fd 1 and fd 0 sockets, and data moves through them. A signal arrives as a bolt, and the exit status travels back to the parent as a numbered token (cherry for 137 = killed).
- **Lab:** hosts the §1.1 pipeline part. It reproduces `clean.py`'s count per status over `order_events.jsonl` with `jq` + `awk` + `sort | uniq -c`, and `diff`s the two outputs. `examples.py` runs it, using the same `clean.py` as topic 2 or a copy of it.
- **Sources:**
  - man7.org Linux man-pages: fork(2), execve(2), wait(2), signal(7), proc(5), credentials(7), path_resolution(7), crontab(5).
  - strace(1); ps(1) from procps-ng; the GNU Bash Reference Manual (Pipelines, Redirections, Exit Status); POSIX.1-2024 Shell Command Language.
  - The jq manual (jqlang.org); the GNU awk and GNU sed manuals; OpenBSD ssh(1).
  - Mark the version of each.

### 4. Software delivery workflow (`de.software-delivery-workflow`): refresher, §1.1

- **Folder:** `software-delivery-workflow`. **Registry title:** 'Software delivery workflow'. About 5 min.
- **Scope:**
  - "code-review norms": what a reviewer checks and in what order (design, correctness, tests, naming), small changes, fast turnaround, approving when the change improves the code. Python bug patterns stay in 1 and merge mechanics in 2.
  - "unit tests": pytest, fixtures and parametrize, testing `clean.py` against an edge case, a test as an oracle.
  - "CI pipelines": stages; a job fails on the first non-zero exit; required checks before merge; caching; flaky tests.
  - "semantic versioning as a breakage contract": MAJOR.MINOR.PATCH, what counts as breaking for a data library (a renamed column is breaking), 0.y.z.
  - "dependency pinning": ranges in the library vs pins in the application, lock files with hashes, why "works on my machine" breaks. The Python toolchain (uv, `pylock.toml`) is left to §4.3, and data CI/CD (data tests, contracts, deploys) to §11.4.
- **Outcomes:**
  - Review a change against explicit norms and keep PRs small.
  - Write a unit test that pins a data bug.
  - Read a CI pipeline as a chain of exit statuses.
  - Decide a version bump from what changed.
  - Pin dependencies so a build is reproducible, and say what a lock file guarantees.
- **Introduces:** `code-review-norms`, `unit-tests`, `ci-pipelines`, `semantic-versioning`, `dependency-pinning`. **Uses:** `python-functions`, `decorators`, `type-hints`, `exit-status`, `pr-merge-strategies`, `trunk-based-development`, `git-bisect`.
- **Bridge:** "The shell runs one job by hand; a CI pipeline runs the same commands on every change and stops at the first non-zero exit."
- **Handoff:** "Last of the five refreshers: the notation for how costs grow, and the logarithms the rest of the chapter counts with." (Not "Last refresher": 13, 17 and 18 are refreshers too.)
- **Prerequisites panel:** topics 1–3 (Before this).
- **Visual idea:** a conveyor of gates. A commit passes review → tests → build → publish, and each gate lights by its exit status. A version dial MAJOR.MINOR.PATCH turns as changes arrive. A lock file freezes a dependency tree whose unpinned branch drifts (in cinnamon).
- **Lab:** hosts the §1.1 gate as a whole. It is a checklist and a small CI workflow that runs, on a clean machine, the bisect oracle (topic 2's test) and topic 3's pipeline `diff` as one job that passes only when both agree.
- **Sources:** semver.org 2.0.0; Google Engineering Practices, code review (google.github.io/eng-practices); pytest docs (current); GitHub Actions workflow syntax docs; PEP 440 (version specifiers); pip docs, "Repeatable installs" and "Secure installs" (hash-checking mode).

### 5. Asymptotic notation and logarithms (`de.asymptotic-notation-logarithms`): refresher, §1.1

- **Folder:** `asymptotic-notation-logarithms`. **Registry title:** 'Asymptotic notation and logarithms'. About 5 min.
- **Scope:**
  - "O/Θ/Ω and how costs grow with input size": upper, tight and lower bounds; constants dropped; a race of n, n log n and n² at data sizes.
  - "logarithms in any base and the change of base (log_b x = ln x / ln b)": a logarithm counts divisions by b.
  - "why a large base makes the logarithm tiny (B-tree height, external-sort passes)", with the chapter's numbers:
    - log₁₀₀₀(10⁹) = 3.
    - log₁₆,₃₈₄ of a million is under 1.5. Both are used by the held topic's Prerequisites 01.
    - The `orders` index height for a stated fan-out. Topic 13 uses it.
    - The 1 TiB sort's log_{M/B}(N/B) ≈ 1.43.
  - "full treatment → Data Structures & Algorithms Ch.1": Prerequisites links the DSA reel "Asymptotic notation and case analysis".
  - Leaves the I/O model to 14, B-tree mechanics to 13, and amortized and average-case analysis to DSA Ch.1.
- **Outcomes:**
  - Read and compare O, Θ and Ω statements.
  - Convert a logarithm between bases in your head.
  - Estimate a B-tree height and a sort's pass count from a large base.
  - Say why big-O alone doesn't predict wall-clock time.
- **Introduces:** `big-o`, `logarithms`, `change-of-base`. **Uses:** none. **Declared:** `high-school-algebra`.
- **Bridge:** "Tests check that a change gives the right answer; they don't say how its cost grows with the data. That takes O, Θ and Ω, and logarithms in any base."
- **Handoff:** "Big-O counts steps as if each cost the same. Next: the memory hierarchy, where the same step costs anything from a nanosecond to tens of milliseconds."
- **Prerequisites panel:** algebra (declared). Topics 1–4 are Before this. DSA "Asymptotic notation and case analysis" is shown as another track.
- **Visual idea:** a division staircase. A billion is divided by 2 (a tall tower of 30 steps) beside the same billion divided by 1,000 (3 steps) and by 16,384, which collapses to two short steps. The large base visibly flattens the tower.
- **Lab:** none (not part of the §1.1 gate).
- **Sources:**
  - MIT 6.006 Spring 2020, Recitation 1 (OCW).
  - D. E. Knuth, "Big Omicron and big Omega and big Theta", SIGACT News 8(2), 1976.
  - NIST DLMF §4.2 (logarithms).
  - CLRS 4th ed., ch. 3, for framing (a book).
  - Bayer and McCreight 1972, for B-tree height.

---

### 6. Memory hierarchy and latency numbers (`de.memory-hierarchy-latency-numbers`): full, §1.2

- **Folder:** `memory-hierarchy-latency-numbers`. About 12 min.
- **Scope:**
  - "registers → L1/L2/L3 → DRAM (local vs remote NUMA) → NVMe SSD → HDD → same-AZ network → object storage": the whole ladder, each rung in one line. NUMA: local vs remote node, measured and sourced, `numactl`.
  - "order-of-magnitude latency and bandwidth per tier": **the canonical table** (see "The canonical numbers"), latency and bandwidth as separate columns. Latency is α and bandwidth is β in T(n) = α + n/β. A tier can have high bandwidth and terrible latency (object storage).
  - "estimating a job's lower bound from them before running it": the floor of scanning the `orders` table (1,000,000 pages of 8 KB, about 7.6 GiB) from RAM, from NVMe and from HDD, and the 1 TiB of `order_events` from NVMe vs from object storage with k parallel requests. A floor is bytes/β, or requests × α / concurrency, whichever is larger.
  - Leaves the mechanism of each rung to 7 (caches), 9 (page cache), 10 (devices) and 11 (object storage); network transfers to 19–21; the unit of transfer per tier and "every tier has its own B" to 14.
- **Outcomes:**
  - Place each tier on a log scale of latency and bandwidth from memory, to within an order of magnitude.
  - Compute a job's floor from bytes, requests and concurrency before running it.
  - Say whether a job is latency-bound or bandwidth-bound.
  - Explain why remote-NUMA and network rungs matter for data systems.
- **Introduces:** `memory-hierarchy`, `latency-numbers`, `bandwidth-per-tier`, `latency-bandwidth-cost`, `numa`, `lower-bound-estimate`. **Uses:** `big-o`, `logarithms`.
- **Bridge:** "Big-O treated every step alike. On real hardware a step costs a nanosecond in a cache or tens of milliseconds from object storage; here is the ladder in between."
- **Handoff:** "Next: the top rungs, where CPU caches decide whether a scan runs at memory speed or far below it."
- **Prerequisites panel:** topic 5 (Before this); the Jeff Dean / Jonas Bonér latency table, as history.
- **Visual idea:** the latency ladder on a log axis, from the nanosecond decade at the top to the hundred-millisecond decade at the bottom. Then a floor race: the same 1 TiB scan as one bar per tier, length = bytes/β, with a caramel tick for the requests × α part.
- **Lab:** hosts §1.2 "sequential vs random reads in RAM": a C or NumPy array walk, sequential vs a random permutation, ns per access, with the expected ratio stated as a range.
- **Sources:**
  - U. Drepper, "What Every Programmer Should Know About Memory" (2007; framing, dated numbers).
  - Intel 64 and IA-32 Architectures Optimization Reference Manual (current edition).
  - Hennessy and Patterson, *Computer Architecture* 6th ed., ch. 2 (a book).
  - Intel Memory Latency Checker documentation; numactl(8); docs.kernel.org/mm/numa.
  - AWS, "Best practices design patterns: optimizing Amazon S3 performance" and the S3 User Guide performance guidelines (match the held topic's figures).
  - sirupsen/napkin-math (as a cross-check, not a primary source).

### 7. CPU caches, SIMD and vectorization (`de.cpu-caches-simd-vectorization`): full, §1.2

- **Folder:** `cpu-caches-simd-vectorization`. About 12 min.
- **Scope:**
  - "cache lines": 64 bytes on current x86-64; state the platform and check Arm before generalising.
  - "spatial and temporal locality".
  - "hardware prefetching": strided vs random walks.
  - "false sharing": two threads of one process writing neighbouring counters. Uses `threads-basics` from 3. The full cost of sharing (locks, atomics) is 8.
  - "branch misprediction": a filter over sorted vs shuffled `status` values, then a branch-free version.
  - "SIMD lanes": how many 32-bit values fit in a 256-bit and a 512-bit register.
  - "why columnar layout plus batch-at-a-time operators beats row-at-a-time interpretation (engine designs in §2.3)": summing `amount` over row structs vs a column, one value at a time vs vectors of about 1,000 values. Engine designs (Volcano vs vectorized vs compiled) are left to §2.3.
  - Leaves memory ordering and coherence protocol detail to 8, TLBs to 9, and SIMD hashing and probing to 15.
- **Outcomes:**
  - Predict which of two loops is faster from its access pattern.
  - Spot and fix false sharing.
  - Explain why a sorted input makes a branchy filter fast.
  - Explain from cache lines, SIMD and interpretation overhead why columnar batch execution wins.
- **Introduces:** `cache-lines`, `locality`, `hardware-prefetching`, `false-sharing`, `branch-misprediction`, `simd`, `columnar-layout`, `vectorized-execution`. **Uses:** `memory-hierarchy`, `latency-numbers`, `threads-basics`, `big-o`. **Declared:** `reading-c` (a few lines of C, for the false-sharing program).
- **Bridge:** "The ladder's top rungs move data in cache lines. Here is how to keep them full, and why columnar engines are built around them."
- **Handoff:** "One core, kept busy. Next: many cores, and what it costs when threads must share."
- **Prerequisites panel:** topic 6; topic 3's note on threads; reading a little C.
- **Visual idea:** memory as a strip of 64-byte lines. A sequential walk lights whole lines (one miss, then hits), and a strided or random walk lights one cell per line (all misses). For the columnar step, a row of structs vs a column feeds an 8-lane SIMD register.
- **Lab:** hosts §1.2 false sharing: a C program with two POSIX threads incrementing adjacent vs 64-byte-padded counters, timed, with `perf stat` if available. Its sequential vs strided vs random walks explain the mechanism behind 6's RAM lab; it links to that lab and doesn't repeat it.
- **Sources:**
  - Intel Optimization Reference Manual (cache line, prefetchers).
  - Drepper 2007, §3 and §6.
  - P. Boncz, M. Zukowski, N. Nes, "MonetDB/X100: Hyper-Pipelining Query Execution", CIDR 2005.
  - T. Kersten et al., "Everything You Always Wanted to Know About Compiled and Vectorized Queries But Were Afraid to Ask", PVLDB 11(13), 2018.
  - Apache Arrow Columnar Format specification; perf-stat(1); Agner Fog's microarchitecture manual.

### 8. Threads, context switches and synchronization cost (`de.threads-context-switches-synchronization`): full, §1.2

- **Folder:** `threads-context-switches-synchronization`. About 12 min.
- **Scope:**
  - "processes vs threads": separate vs shared address space; creation and switch cost; why a crash in one thread kills the process. Builds on `process-model` and `threads-basics` from 3.
  - "context-switch and cache-pollution cost": the direct switch cost plus the indirect cost of cold caches and TLB after the switch (the TLB is named here as "the cache of address translations" and taught in 9). Measure, don't quote old papers as current.
  - "lock contention": a mutex around a shared counter while aggregating `orders` by `status` across cores, vs per-thread partial aggregates merged at the end; futex fast and slow paths.
  - "atomics and memory ordering at the depth needed to read engine code": compare-and-swap; relaxed, acquire/release and seq_cst; the release-acquire flag pattern. A contended atomic's cache line moves between cores (`false-sharing` from 7 is the same physics).
  - "why engines use thread-per-core and morsel scheduling (deep version → Rust Systems Engineering M1)": fixed workers pinned to cores pull small morsels of input (Leis et al. 2014), so work balances without oversubscription.
  - Leaves the GIL and free-threaded Python to §4.1, and lock-free data structures to DSA Ch.14 and Rust M1.
- **Outcomes:**
  - Estimate when adding threads stops helping.
  - Replace a contended lock with partitioned state.
  - Read acquire/release code in an engine and say what it orders.
  - Explain morsel-driven scheduling and thread-per-core, and when each wins.
- **Introduces:** `processes-vs-threads`, `context-switch-cost`, `lock-contention`, `atomics`, `memory-ordering`, `thread-per-core`, `morsel-scheduling`. **Uses:** `process-model`, `threads-basics`, `cache-lines`, `false-sharing`, `latency-numbers`. **Declared:** `reading-c`.
- **Bridge:** "False sharing showed two cores fighting over one cache line. Now the full cost of sharing: context switches, locks and atomics."
- **Handoff:** "Threads share one address space. Next: how that address space maps onto RAM and files, and why databases distrust the operating system's page cache."
- **Prerequisites panel:** topics 3, 6, 7; a few lines of C or Rust.
- **Visual idea:** core lanes on a timeline. Threads are segments on each core, and switches are taupe gaps followed by a cherry "cold cache" tail. A lock is a queue at a door. In the morsel view, idle cores pull the next small block from a shared input instead of waiting.
- **Lab:** its own "Try it": counting `orders` by status with 1–N threads, global lock vs atomic vs per-thread partials, throughput plotted. It is not part of the §1.2 chapter lab.
- **Sources:**
  - V. Leis, P. Boncz, A. Kemper, T. Neumann, "Morsel-Driven Parallelism", SIGMOD 2014.
  - M. Bos, *Rust Atomics and Locks* (O'Reilly 2023, free online at marabos.nl/atomics).
  - cppreference `std::memory_order`; Linux kernel docs "Linux Kernel Memory Barriers" (docs.kernel.org).
  - futex(2) and futex(7), pthreads(7), sched(7); Seastar "shared-nothing" design docs.

### 9. Virtual memory, page cache and mmap (`de.virtual-memory-page-cache`): full, §1.2

- **Folder:** `virtual-memory-page-cache`. About 12 min.
- **Scope:**
  - "paging": virtual pages to physical frames, page tables, minor and major faults; 4 KiB OS pages, called "OS pages" to keep them apart from database pages.
  - "TLBs and huge pages": TLB reach; 2 MiB and 1 GiB pages; transparent huge pages and their latency spikes.
  - "OS page cache vs a database buffer pool (double buffering)": database pages are explained on the spot, as in 13 ("the database reads and caches whole pages, 8 KB in PostgreSQL"; `db-pages` is 14's); the same `orders` page cached in PostgreSQL's `shared_buffers` and in the page cache, which the held topic calls "double caching"; dirty pages and writeback (`vm.dirty_*`).
  - "`O_DIRECT`": bypassing the page cache; alignment rules (it uses `block-alignment` only by name, and topic 10 teaches it); who uses it.
  - "why mmap-based DBMSs suffer stalls and poor I/O-error handling (Crotty, Leis, Pavlo, CIDR 2022)": transactional safety, I/O stalls in page faults, error handling via SIGBUS, TLB shootdowns.
  - "deep version → Rust Systems Engineering M3": named in Prerequisites as "Goes deeper later" in another track.
  - Leaves the devices, fsync and io_uring to 10, and the database page layout to §5.1.
- **Outcomes:**
  - Trace a memory access from virtual address to frame and say what a TLB miss and a page fault cost.
  - Explain double buffering and choose between buffered I/O and `O_DIRECT`.
  - Argue from the CIDR 2022 evidence when mmap is the wrong tool for a database.
- **Introduces:** `virtual-memory`, `tlb`, `huge-pages`, `page-cache`, `buffer-pool`, `double-buffering`, `o-direct`, `mmap`. **Uses:** `memory-hierarchy`, `latency-numbers`, `locality`, `processes-vs-threads`, `context-switch-cost`, `signals`.
- **Bridge:** "Every thread sees one virtual address space. Here is how the operating system maps it to RAM and files, and where that hurts a database."
- **Handoff:** "The page cache hides the disk until a write must survive a crash. Next: the devices underneath, and what fsync really promises."
- **Prerequisites panel:** topics 6–8; the held I/O topic's Prerequisites 03 on database pages, as a reading only.
- **Visual idea:** an address translation strip. A virtual page passes the TLB (hit: straight through; miss: a walk down the page-table levels) to a frame. In the double-buffering view, one `orders` page appears twice in RAM, once in the buffer pool and once in the page cache, with the wasted copy in cinnamon.
- **Lab:** its own "Try it": `mmap` vs `read()` over a file, counting minor and major faults (`/usr/bin/time -v`), and THP on vs off. The page-cache part of the chapter lab is hosted by 10.
- **Sources:**
  - A. Crotty, V. Leis, A. Pavlo, "Are You Sure You Want to Use MMAP in Your Database Management System?", CIDR 2022.
  - docs.kernel.org admin-guide/mm "Transparent Hugepage Support" and "HugeTLB Pages"; admin-guide/sysctl/vm (dirty settings).
  - mmap(2), madvise(2), open(2) (the `O_DIRECT` notes); proc(5) `/proc/meminfo`.
  - PostgreSQL 18 docs, "Resource Consumption" (`shared_buffers`).

### 10. Storage devices and fsync durability (`de.storage-devices-fsync-durability`): full, §1.2

- **Folder:** `storage-devices-fsync-durability`. About 14 min.
- **Scope:**
  - "sequential vs random I/O": HDD seek and rotation vs SSD parallelism and queue depth; why random still costs more on an SSD. This is device behaviour. The cost-model ratio r is 14's.
  - "block size and alignment": logical and physical block size (`/sys/block/*/queue`), read-modify-write on misaligned writes, alignment for `O_DIRECT`.
  - "SSD internals (FTL, erase blocks, garbage collection, write amplification)": pages are written, blocks are erased, out-of-place updates, GC, over-provisioning, write amplification = flash bytes written / host bytes written, TRIM.
  - "async I/O via `io_uring` (now an `io_method` option in PostgreSQL 18)": submission and completion rings, many I/Os in flight; PostgreSQL 18 `io_method` = `worker` (default), `io_uring` or `sync` (as the held topic's frontier says). Deeper treatment in Rust M3.
  - "fsync semantics": `write()` reaches the page cache, `fsync()` reaches stable storage; fdatasync; fsync the directory after creating a file; device write caches and FUA at a glance.
  - "the 2018 "fsyncgate" lesson that a failed fsync cannot simply be retried": after an error the kernel may mark dirty pages clean and drop them, so a retried fsync "succeeds" without the data. PostgreSQL's response was to PANIC.
  - Leaves the page cache itself to 9, object stores to 11, B-tree vs LSM write amplification to 13, and WAL and recovery to §5.
- **Outcomes:**
  - Predict sequential vs random throughput on HDD and NVMe.
  - Explain where write amplification comes from in an SSD.
  - Write a file durably (write, fsync the file, fsync the directory), and say why retrying a failed fsync is unsafe.
  - Say what io_uring changes and when it helps.
- **Introduces:** `storage-devices`, `block-alignment`, `ssd-internals`, `write-amplification`, `io-uring`, `fsync`, `fsync-failure`. **Uses:** `memory-hierarchy`, `latency-numbers`, `latency-bandwidth-cost`, `page-cache`, `o-direct`, `virtual-memory`.
- **Bridge:** "Past the page cache are real devices. Here is what makes them fast or slow, and what it takes for a write to survive a crash."
- **Handoff:** "One machine's disks end here. Next: object storage, the bottom tier where lakehouses keep their data."
- **Prerequisites panel:** topics 6 and 9.
- **Visual idea:** an SSD erase-block grid. Pages fill and then turn stale, and GC copies the live pages out before an erase while a write-amplification counter climbs. The fsync step is a timeline in which a failed fsync turns the dirty page cherry, a retry returns "OK", and the page is gone.
- **Lab:** hosts §1.2 "on NVMe with and without the page cache (`O_DIRECT`)": `fio` jobs for sequential and random, buffered and direct, cold and warm, with expected shapes stated as ranges.
- **Sources:**
  - fsync(2), open(2), io_uring(7) (liburing man pages).
  - PostgreSQL 18 docs: `io_method` (Resource Consumption), `fsync` and `wal_sync_method` (Write Ahead Log).
  - PostgreSQL wiki "Fsync Errors"; LWN, "PostgreSQL's fsync() surprise" (2018).
  - A. Rebello et al., "Can Applications Recover from fsync Failures?", USENIX ATC 2020.
  - N. Agrawal et al., "Design Tradeoffs for SSD Performance", USENIX ATC 2008.
  - docs.kernel.org block/queue-sysfs; fio documentation; NVM Express Base Specification (current revision).

### 11. Object storage as a storage tier (`de.object-storage-as-storage`): full, §1.2

- **Folder:** `object-storage-as-storage`. About 12 min.
- **Scope:**
  - "S3-class semantics: strong read-after-write consistency": since December 2020 for S3; what is and isn't atomic (a PUT replaces a whole object; no rename and no append on general-purpose buckets, while S3 Express One Zone directory buckets have added appends and a rename operation, quoted from the current docs; LIST consistency); GCS and Azure compared briefly.
  - "first-byte latency in tens of milliseconds": the distribution, not one number. **Introduces latency percentiles here** (p50, p99) with AWS's figures, as the held topic quotes them.
  - "per-prefix request-rate limits": at least 3,500 writes and 5,500 reads per second per prefix, 503 Slow Down, spreading keys over prefixes.
  - "range GETs": reading a Parquet footer and then a column chunk. Parquet is explained on the spot in one line (a columnar file whose footer says where each column's chunks sit; `columnar-layout` from 7); the format itself is Ch.6's.
  - "multipart upload": uploading 1 TiB of `order_events` in parts, retrying a part, the part-size and count limits from the docs.
  - "conditional writes": `If-None-Match` and `If-Match` on PUT, as the primitive for a commit marker without a lock service.
  - "why lakehouse engines coalesce, cache and parallelize requests (economics in §3.3; table formats in Ch.6)": coalescing nearby ranges, about 8–16 MB requests, k requests in flight to reach bandwidth (α·β from topic 6), local caching. Economics (per-request and egress prices) is left to §3.3 and table formats to Ch.6; hedging slow requests to 22.
- **Outcomes:**
  - State the consistency and atomicity contract of S3-class storage, and what it rules out (rename-based commits).
  - Size range requests and concurrency to reach a bandwidth target.
  - Avoid prefix throttling.
  - Use a conditional write to make a commit safe.
- **Introduces:** `object-storage`, `read-after-write-consistency`, `latency-percentiles`, `prefix-rate-limits`, `range-get`, `multipart-upload`, `conditional-writes`, `request-coalescing`. **Uses:** `memory-hierarchy`, `latency-numbers`, `latency-bandwidth-cost`, `bandwidth-per-tier`, `lower-bound-estimate`, `storage-devices`, `fsync`, `columnar-layout`.
- **Bridge:** "Local disks give you microseconds and fsync. Object storage gives you near-unlimited capacity, at tens of milliseconds per request and with a different contract."
- **Handoff:** "The bytes come back exactly as written. Next: whether those bytes still mean the right number."
- **Prerequisites panel:** topics 6 and 10; HTTP basics (declared), with a resource.
- **Visual idea:** a request waterfall. Each GET is a row with a taupe first-byte wait and then a caramel transfer. Many small GETs are mostly wait, and the same bytes as a few coalesced 16 MB ranges running in parallel lanes are mostly transfer.
- **Lab:** hosts §1.2 "against an object store across range sizes": a local S3-compatible server (MinIO or similar) with `tc netem` latency added (one command, explained on the spot; 19 writes the shared §1.4 setup), or a real bucket, sweeping range size × concurrency, with throughput and p50/p99 plotted.
- **Declared:** `http-basics`.
- **Sources:**
  - Amazon S3 User Guide: "Amazon S3 data consistency model", "Best practices design patterns: optimizing Amazon S3 performance", "Uploading and copying objects using multipart upload", "Add preconditions to S3 operations with conditional requests".
  - AWS whitepaper "Best Practices Design Patterns: Optimizing Amazon S3 Performance".
  - Google Cloud Storage docs, "Consistency" and "Request rate and access distribution guidelines".
  - D. Durner, V. Leis, T. Neumann, "Exploiting Cloud Object Storage for High-Performance Analytics", PVLDB 16(11), 2023.

### 12. Numeric representation and its data bugs (`de.numeric-representation-data-bugs`): full, §1.2

- **Folder:** `numeric-representation-data-bugs`. About 12 min.
- **Scope:**
  - "integer width and overflow": a 32-bit `order_id` or a counter wrapping; signed vs unsigned; who throws and who wraps (Spark ANSI mode, which Spark 4.0 turns on by default, PostgreSQL, NumPy). Verify each by running it.
  - "IEEE-754 rounding and non-associativity (a float SUM changes with shuffle order)":
    - Binary64, spacing between floats (ulp), 0.1 + 0.2.
    - (a + b) + c ≠ a + (b + c).
    - The same `amount` column summed in two orders gives two totals.
    - Parallel and SIMD reductions (7, 8) reorder additions too.
    - "Shuffle" is explained on the spot: rows arriving from many machines in a nondeterministic order. Shuffles themselves are Ch.7.
    - Compensated sums (`math.fsum`, Kahan).
  - "DECIMAL precision/scale propagation for money": `DECIMAL(12,2)` times a rate; the result type's precision and scale in PostgreSQL and in one warehouse (Snowflake or Spark), quoted from their docs; overflow and rounding at the boundary.
  - "timestamp resolution (ns vs µs: pandas 3.0 now infers µs when parsing strings)": `event_time` in ns vs µs, Parquet's MILLIS/MICROS/NANOS, a join key mismatch after a round trip, the ns range limit (years 1677–2262).
  - "“never store currency as a float”": the closing rule, with the counter-example on screen.
  - Leaves serialization formats to §6.1 and pandas semantics to §4.2.
- **Outcomes:**
  - Predict when an integer column overflows and what each engine does then.
  - Explain and demonstrate why a float sum depends on order.
  - Work out the result type of a DECIMAL expression and pick types for money.
  - Diagnose a timestamp-resolution mismatch.
- **Introduces:** `integer-overflow`, `ieee-754`, `float-non-associativity`, `decimal-precision-scale`, `timestamp-resolution`. **Uses:** `simd`, `vectorized-execution`, `processes-vs-threads`, `object-storage`. **Declared:** `sql-select`, `binary-numbers`.
- **Bridge:** "Storage returns your bytes intact. Their type decides whether a total, an amount or a timestamp is still right."
- **Handoff:** "That closes the hardware. Next: the algorithms that decide how many bytes a query moves, starting with the two index families most databases are built on."
- **Prerequisites panel:** binary numbers (declared); topics 7–8; a SQL SELECT (declared, as in the held topic).
- **Visual idea:** a number line whose float tick spacing widens with magnitude. Adding a small `amount` to a large running total lands on the nearest tick, so a value is visibly lost. Two summation orders of the same column then end on two different ticks.
- **Lab:** hosts §1.2 "sum the same float column in two orders and show different totals": NumPy or plain Python with a seeded shuffle (QUALITY.md #12), then `math.fsum` and DECIMAL agreeing.
- **Sources:**
  - D. Goldberg, "What Every Computer Scientist Should Know About Floating-Point Arithmetic", ACM Computing Surveys 23(1), 1991. IEEE 754-2019 is cited for framing; it is paywalled.
  - Python docs: tutorial "Floating-Point Arithmetic: Issues and Limitations", `decimal` and `math.fsum`.
  - PostgreSQL 18 docs, "Numeric Types"; Snowflake "Arithmetic operators" (scale and precision); Apache Spark "ANSI Compliance".
  - pandas 3.0.0 release notes (datetime resolution inference); Apache Parquet LogicalTypes.md (TIMESTAMP units).

---

### 13. B+-trees vs LSM-trees at a glance (`de.b-trees-vs-lsm`): refresher, §1.3

- **Folder:** `b-trees-vs-lsm`. About 5 min. It opens §1.3 on its own problem frame, not `RefresherList`, which covers §1.1 only.
- **Scope:**
  - "fan-out and height":
    - A node fills one fixed-size page. **Pages are explained on the spot**: "the database reads whole pages, 8 KB in PostgreSQL". The `db-pages` concept belongs to 14.
    - A lookup walks root → leaf.
    - The `orders` index on 100 M keys is 3–4 levels for a stated fan-out (log_fanout N, from 5), and the upper levels are almost always cached.
    - Leaves are linked for range scans.
    - This is the `b-tree-lookup` that 14's bridge says the learner "just revised".
  - "read vs write amplification": a B+-tree updates in place (one page write per small update, more on splits); an LSM-tree buffers in a memtable, flushes sorted runs and compacts them (more total writes, a read checks several runs, Bloom filters by name only). Space amplification is mentioned. Device-level write amplification (10) multiplies with this.
  - "why one favors point reads and the other ingest": the `orders` lookups vs the `order_events` ingest.
  - "internals live in §5.1 and → Data Structures & Algorithms Ch.3": Prerequisites links §5.1 (Goes deeper later) and the DSA reel "B-tree and B+-tree mechanics". It is in DSA **Ch.5**; see Notes.
  - Leaves crossover costs to 14, the merge mechanics of compaction to 16, and splits, WAL and node layout to §5.1.
- **Outcomes:**
  - Estimate a B+-tree's height from its fan-out.
  - Say what a point lookup and a range scan read.
  - Compare B+-tree and LSM-tree on read, write and space amplification.
  - Pick one for a read-heavy vs an ingest-heavy workload.
- **Introduces:** `b-tree-lookup`, `fanout-height`, `lsm-tree`, `read-write-amplification`. **Uses:** `big-o`, `logarithms`, `change-of-base`, `memory-hierarchy`, `storage-devices`, `write-amplification`, `page-cache`.
- **Bridge:** "You know what each tier costs. Indexes decide how many of those costs a lookup pays: B+-trees and LSM-trees, at a glance."
- **Handoff:** "Next: what a lookup really costs when the index finds thousands of rows, counted in block transfers." This sets up 14's fixed bridge.
- **Prerequisites panel:** topics 5 and 10.
- **Visual idea:** the same 100 M keys drawn two ways. On the left, a short, very wide tree (3–4 levels, as `examples.py` computes for the stated fan-out) with a caramel path root → leaf. On the right, an LSM stack: memtable → level runs, with a write being rewritten down the levels as a counter (cinnamon) climbs.
- **Lab:** none (§1.3's lab is hosted by 15 and 16).
- **Sources:**
  - R. Bayer, E. McCreight, "Organization and Maintenance of Large Ordered Indexes", Acta Informatica 1972.
  - D. Comer, "The Ubiquitous B-Tree", ACM Computing Surveys 1979.
  - P. O'Neil et al., "The Log-Structured Merge-Tree (LSM-Tree)", Acta Informatica 1996.
  - M. Athanassoulis et al., "Designing Access Methods: The RUM Conjecture", EDBT 2016.
  - PostgreSQL 18 docs, "B-Tree Indexes" (implementation); RocksDB wiki, "Leveled Compaction" and the tuning guide's amplification section.

### 14. The external-memory (I/O) cost model (`de.io-cost-model`): full, §1.3, BUILT, HELD

- **Folder:** `io-cost-model`. **Registry title:** 'The I/O cost model'. **State:** built 10 October 2026, `status: 'held'`, with `coverage.json`, `FACT-CHECK.md` and narration script. Fixed: don't rebuild it. It is released in order, with a release seam check against topics 13 and 15.
- **Scope (as built):**
  - "the Aggarwal–Vitter model": "Only block transfers count", "Three numbers describe the job".
  - "cost counted in block transfers".
  - "scan bound N/B": "A full scan costs N/B".
  - "sort bound (N/B)·log_{M/B}(N/B)": "Sorting: count passes, not comparisons", "A terabyte in two passes".
  - "why CPU big-O misleads when I/O and network dominate": "They cross at 1/B", "The network is a tier too"; Deep dive "Why CPU big-O misleads", "The network, counted the same way".
  - "using it to predict index-lookup vs full-scan crossovers": "An index pays about one read per row" … "Back to the query"; Lab 1 on PostgreSQL.
- **Outcomes (as published):**
  - Estimate the I/O cost of a scan, an index lookup and an external sort.
  - Predict the index crossover, about 1/(r·B).
  - Count external-sort passes.
  - Pick the block size of the dominant tier.
  - Price a distributed join in bytes moved.
- **Introduces:** `io-model`, `scan-cost`, `index-crossover`, `random-vs-sequential-cost`, `clustered-vs-unclustered`, `external-sort-passes`, `block-size-per-tier`, `db-pages`. **Uses:** `big-o`, `logarithms`, `memory-hierarchy`, `storage-devices`, `object-storage`, `b-tree-lookup` (introduced by 5, 6, 10, 11 and 13, as planned above). **Declared:** `merge-sort`, `sql-select`.
- **Bridge:** "You have just revised how a B+-tree finds a row in a few page reads. Now: what happens when the index finds thousands of them?"
- **Handoff:** "Next: hash tables, the other structure behind every join and aggregation, and what they cost when memory runs out."
- **Prerequisites panel (as built):** 01 Big-O and logarithms in any base; 02 The memory hierarchy, and why sequential beats random; 03 How a database stores a table: pages; 04 What a B-tree index lookup does; 05 Merge sort and merging many sorted lists; 06 Reading a query plan with EXPLAIN; 07 Joining tables spread across machines.
- **Visual idea (as built):** seesaw and crossover chart, pages touched, the terabyte in two passes, tiers, network bytes.
- **Lab:** its Lab 1 (the PostgreSQL crossover) is its own. Its Lab 2 restates the §1.3 chapter lab, which 15 and 16 host (see Notes).
- **Sources:** Aggarwal and Vitter 1988; Vitter 2008; Vitter and Shriver 1994; Bayer and McCreight 1972; PostgreSQL REL_18 `costsize.c`; Bender et al., SPAA 2019; AWS S3 performance docs. See its Deep dive.

### 15. Hash tables inside query engines (`de.hash-tables-inside-query`): full, §1.3

- **Folder:** `hash-tables-inside-query`. About 14 min.
- **Scope:**
  - "chaining vs open addressing": a bucket array with pointers vs probing in one array (linear probing, SIMD group probing as in Swiss tables); cache misses per lookup (uses `cache-lines`).
  - "load factor and resize stalls": doubling, the one-off O(n) rehash and the latency spike it causes, pre-sizing from a cardinality estimate.
  - "hash quality and adversarial or skewed keys":
    - Poor hashes cluster.
    - HashDoS and keyed hashes (SipHash, PEP 456). Python's `__eq__`/`__hash__` contract from topic 1 is a one-line callback.
    - Skew: one giant `customer_id` or the NULL "guest" key dominating a partition.
  - "cache-conscious and radix-partitioned hashing": partition both inputs by hash bits so each partition's table fits in cache, limited by TLB entries (`tlb` from 9) (Manegold et al.; Balkesen et al.).
  - "why hash join and hash aggregation exist":
    - `orders ⋈ customers` and `GROUP BY customer_id`: build and probe vs nested loops (big-O and transfers).
    - Distributed variants (broadcast vs shuffle) were priced in 14 and are Ch.7's.
  - "what happens when the table outgrows memory (→ §2.3)": spill by partitioning to disk and recursing. As 14 says, random access to a table larger than memory costs about one I/O per item, so engines partition first. The mechanics of grace and hybrid hash join, and memory budgets, are left to §2.3.
  - Leaves the sort-based alternative to 16, and hash function theory and universal hashing to DSA Ch.3.
- **Outcomes:**
  - Pick chaining or open addressing for a workload and estimate cache misses per probe.
  - Predict resize stalls and size a table up front.
  - Recognise skew and adversarial keys and their fixes.
  - Explain radix partitioning, and why a table that spills must be partitioned rather than paged.
- **Introduces:** `hash-tables`, `open-addressing`, `load-factor`, `hash-quality`, `key-skew`, `radix-partitioning`, `hash-join`, `hash-aggregation`, `hash-spill`. **Uses:** `big-o`, `cache-lines`, `simd`, `tlb`, `latency-numbers`, `io-model`, `scan-cost`, `random-vs-sequential-cost`, `dataclasses` (topic 1's equality and hash). **Declared:** `sql-select`.
- **Bridge:** "The I/O model priced scans, index lookups and sorts. Joins and aggregations mostly run on hash tables; here is what one costs in memory, and what happens when memory runs out." This answers 14's handoff.
- **Handoff:** "When the hash table spills, sorting is the other way out. Next: external merge sort, the one mechanism behind sort spills, sort-merge joins and compaction."
- **Prerequisites panel:** topics 7, 9 and 14; DSA Ch.3 hashing as another track; topic 1's equality and hash step (Before this).
- **Visual idea:** a bucket array as a strip of cache lines. A probe sequence hops (each hop is one caramel miss), the load-factor gauge fills to the threshold and the whole array visibly re-copies (a cherry stall), and one skewed key grows a chain or a cluster far longer than the rest.
- **Lab:** hosts the §1.3 "spilling hash aggregation" part: a Python or C aggregation over `order_events` keys under a memory cap that partitions to disk when full, measured over key cardinalities. Topic 16 completes the crossover.
- **Sources:**
  - S. Richter, V. Alvarez, J. Dittrich, "A Seven-Dimensional Analysis of Hashing Methods and its Implications on Query Processing", PVLDB 9(3), 2015.
  - C. Balkesen et al., "Main-Memory Hash Joins on Multi-Core CPUs: Tuning to the Underlying Hardware", ICDE 2013.
  - S. Manegold, P. Boncz, M. Kersten, "Optimizing Main-Memory Join on Modern Hardware", IEEE TKDE 2002.
  - S. Crosby, D. Wallach, "Denial of Service via Algorithmic Complexity Attacks", USENIX Security 2003; PEP 456.
  - Abseil "Swiss Tables Design Notes"; DuckDB blog, "Parallel Grouped Aggregation in DuckDB" (2022).
  - PostgreSQL 18 docs `work_mem` and `hash_mem_multiplier`.

### 16. External merge sort and k-way merge (`de.external-merge-sort-k`): full, §1.3

- **Folder:** `external-merge-sort-k`. About 14 min.
- **Scope:**
  - "run generation (including replacement selection)": quicksort a memory-load into runs of M vs replacement selection with a heap, giving runs about 2M long on random input and one run on sorted input (Knuth; Larson 2003).
  - "heap-driven k-way merge": a min-heap (or loser tree) of the k run heads, about log₂ k comparisons per output; Python's `heapq.merge` over generators (`generators` from 1) as the bounded-memory version.
  - "fan-in vs number of passes as a function of the memory budget": uses 14's `external-sort-passes` formula and the same numbers (1 TiB, 16 GiB, 1 MiB blocks: 64 runs, 2 passes). This topic adds:
    - The memory split: one input buffer per run plus output.
    - Larger buffers for fewer seeks vs higher fan-in.
    - Read-ahead and double buffering.
    - When a third pass appears.
  - "the one mechanism behind ORDER BY spills, sort-merge joins, LSM compaction (§5.1) and shuffle merges (Ch.7)":
    - PostgreSQL's `tuplesort` spilling past `work_mem` (`EXPLAIN ANALYZE` "external merge").
    - The merge phase of a sort-merge join.
    - LSM compaction as a k-way merge of runs (`lsm-tree` from 13).
    - A shuffle's reduce-side merge, named only and left to Ch.7.
  - Also the §1.3 lab's closing question: sort-based vs hash-based aggregation.
  - Leaves internal sorting algorithms to DSA Ch.15, and spill budgets across operators to §2.3.
- **Outcomes:**
  - Predict run count and passes for a given memory budget, and choose a fan-in.
  - Explain why replacement selection doubles the run length.
  - Trace a heap-driven k-way merge.
  - Recognise the same merge in ORDER BY spills, sort-merge joins and LSM compaction.
  - Find the cardinality where sort-based aggregation beats a spilling hash aggregation.
- **Introduces:** `external-merge-sort`, `run-generation`, `replacement-selection`, `k-way-merge`, `merge-fan-in`, `sort-merge-join`, `sort-aggregation`. **Uses:** `big-o`, `logarithms`, `io-model`, `external-sort-passes`, `scan-cost`, `generators`, `lsm-tree`, `hash-aggregation`, `hash-spill`, `storage-devices`. **Declared:** `merge-sort`, `binary-heap`, `sql-select`.
- **Bridge:** "The hash table ran out of memory; a sort never has to fit. Here is the external merge sort the cost model counted in passes." This answers 15's handoff.
- **Handoff:** "Sorted, joined, aggregated: a pipeline is many such jobs in order. Next refresher: the graph algorithms that schedule them."
- **Prerequisites panel:** topics 14 and 15; DSA "Binary heaps and heapify" and DSA "External merge sort" (Ch.15, another track); merge sort (declared).
- **Visual idea:** a tournament. k run columns feed their heads into a heap at the top, and the smallest pops out to the output strip while its run refills. A fan-in slider shows the pass count falling in steps as memory grows, with the 1 TiB / 16 GiB point marked.
- **Lab:** hosts the §1.3 external-merge-sort part (a file 10× larger than a cgroup or container memory limit; vary run size and fan-in; passes and wall-clock plotted against `1 + ceil(log_fanin(runs))`) and the closing crossover against 15's spilling hash aggregation.
- **Sources:**
  - G. Graefe, "Implementing Sorting in Database Systems", ACM Computing Surveys 38(3), 2006.
  - P.-Å. Larson, "External Sorting: Run Formation Revisited", IEEE TKDE 15(4), 2003.
  - D. E. Knuth, TAOCP Vol. 3, §5.4 (a book).
  - PostgreSQL REL_18 `src/backend/utils/sort/tuplesort.c` and `logtape.c`; PostgreSQL 18 docs `work_mem`.
  - DuckDB blog, "Fastest table sort in the West" (2021); Python `heapq.merge` docs.

### 17. Graph algorithms for pipeline DAGs (`de.graph-algorithms-pipeline-dags`): refresher, §1.3

- **Folder:** `graph-algorithms-pipeline-dags`. About 5 min.
- **Scope:**
  - "BFS/DFS": over the shop pipeline's DAG, the downstream set of `clean` (what must rerun after `clean.py` changes) and the upstream set of `daily_revenue` (what a backfill of it depends on).
  - "topological sort (Kahn) for task scheduling": in-degree counters, a ready queue, and parallel waves as a scheduler would run them; Python `graphlib.TopologicalSorter`.
  - "cycle detection": Kahn leftovers or a DFS back edge; the error an orchestrator raises.
  - "critical path": longest path by task duration, which sets the pipeline's finish time when there are enough workers; speeding up a task off it doesn't shorten the run.
  - "connected components": (weakly) connected components, the independent sub-pipelines that can be scheduled apart.
  - "full treatment → DSA Ch.8": the DSA reels "Topological sort" etc. are in DSA **Ch.17** (see Notes).
  - Leaves orchestrators (Airflow, Dagster and their schedulers) to Ch.11.
- **Outcomes:**
  - Order a pipeline's tasks with Kahn's algorithm and spot a cycle.
  - Find the critical path and say which task is worth speeding up.
  - Find what must rerun downstream or upstream of a change.
- **Introduces:** `dag`, `graph-traversal`, `topological-sort`, `cycle-detection`, `critical-path`, `connected-components`. **Uses:** `big-o`, `python-functions`. **Declared:** `graph-basics`.
- **Bridge:** "A pipeline is many sorts, joins and loads with dependencies between them. Graph algorithms decide their order, catch cycles and find what sets the finish time."
- **Handoff:** "The tasks of a DAG run on many machines. Next refresher: the network between them, layer by layer."
- **Prerequisites panel:** graph vocabulary (declared); DSA graph chapters (another track).
- **Visual idea:** the shop's DAG as nodes with in-degree badges. The badges count down as Kahn releases tasks in waves, and then the critical path lights in caramel with its total duration as the one big number.
- **Lab:** none.
- **Sources:**
  - A. B. Kahn, "Topological sorting of large networks", CACM 5(11), 1962.
  - Python docs, `graphlib`; Apache Airflow docs, "DAGs" (core concepts); NetworkX docs (`topological_sort`, `dag_longest_path`).
  - J. E. Kelley, M. R. Walker, "Critical-path planning and scheduling", 1959.

---

### 18. TCP/IP layers and their costs (`de.tcp-ip-layers-their`): refresher, §1.4

- **Folder:** `tcp-ip-layers-their`. About 5 min.
- **Scope:**
  - "what each layer adds (framing, routing, reliable byte streams)": link (Ethernet frame), network (IP: addressing and routing, best effort), transport (TCP: a reliable ordered byte stream; UDP: datagrams), application.
  - "MTU and per-packet overhead":
    - 1500-byte Ethernet MTU vs jumbo frames, and the header bytes per packet (Ethernet, IPv4 or IPv6, TCP and options).
    - Payload efficiency.
    - Path MTU discovery and the black-hole failure.
  - "where TLS and compression sit": TLS above TCP (inside QUIC for HTTP/3); compression above TLS and why the order matters; the handshake cost itself is 20's. Codecs are left to §6.1.
  - Leaves handshakes, windows and congestion to 19, and DNS and load balancers to 20.
- **Outcomes:**
  - Name what each layer adds and where a given failure lives.
  - Compute payload efficiency for an MTU.
  - Say where TLS and compression sit and why.
- **Introduces:** `protocol-layers`, `encapsulation`, `mtu`, `packet-overhead`, `tls-placement`. **Uses:** `latency-numbers`, `bandwidth-per-tier`. **Declared:** `ip-addresses`.
- **Bridge:** "Pipeline tasks talk over the network. First, what each layer adds to every byte you send."
- **Handoff:** "Next: what TCP does before and while it sends: handshakes, windows and congestion control."
- **Prerequisites panel:** IP addresses and ports (declared); topic 6.
- **Visual idea:** a packet onion. A payload is wrapped header by header as it goes down the stack, with a per-packet overhead bar beside it at 1500 bytes vs 9001 bytes.
- **Lab:** none required. Optional "Try it": `tcpdump` one request and read the headers.
- **Sources:**
  - RFC 1122 (host requirements: layers), RFC 791 (IPv4), RFC 8200 (IPv6), RFC 9293 (TCP, 2022), RFC 768 (UDP).
  - RFC 1191, RFC 8201 and RFC 8899 (path MTU discovery); RFC 8446 (TLS 1.3, its position above the transport).
  - ip(7), tcp(7).

### 19. TCP handshakes, flow and congestion control (`de.tcp-handshakes-flow-congestion`): full, §1.4

- **Folder:** `tcp-handshakes-flow-congestion`. About 14 min.
- **Scope:**
  - "three-way handshake and slow start (why short-lived connections are slow and pools matter)":
    - **RTT is introduced here.** SYN, SYN-ACK, ACK costs one RTT before data.
    - The initial window of 10 segments (RFC 6928), doubling per RTT.
    - A small request on a new connection spends most of its time in round trips.
    - Connection pools and keep-alive, for a loader writing `orders` to PostgreSQL or calling S3.
  - "receive windows": flow control, window scaling (RFC 7323); the window caps bytes in flight. Sizing buffers to the BDP is left to 21.
  - "congestion control (CUBIC vs BBR)": loss-based vs model-based; CUBIC (specified in RFC 9438) is Linux's default (tcp(7), `net.ipv4.tcp_congestion_control`); BBR's bottleneck bandwidth and RTT model, with its version and status stated (BBRv3 is an IETF draft).
  - "head-of-line blocking in TCP and HTTP/2 and how QUIC/HTTP/3 removes it at the transport": one lost segment stalls every HTTP/2 stream on the connection; QUIC streams are independent. That QUIC carries the TLS 1.3 handshake is said in one line, and its RTT accounting is 20's.
  - "when UDP is the right choice": loss-tolerant or latency-critical traffic, protocols that bring their own reliability (QUIC itself), metrics, DNS (RFC 8085 guidance).
- **Outcomes:**
  - Count the RTTs a request costs on a new vs a pooled connection.
  - Explain slow start and why short transfers never reach full speed.
  - Contrast CUBIC and BBR.
  - Explain HOL blocking and what QUIC changes.
  - Choose UDP when it fits.
- **Introduces:** `rtt`, `three-way-handshake`, `slow-start`, `connection-pooling`, `receive-window`, `congestion-control`, `head-of-line-blocking`, `quic`, `udp-tradeoffs`. **Uses:** `protocol-layers`, `mtu`, `packet-overhead`, `tls-placement`, `latency-numbers`, `latency-bandwidth-cost`. **Declared:** `http-basics`.
- **Bridge:** "Every layer added bytes; TCP also adds round trips. Here is where they go, and why a new connection starts slow."
- **Handoff:** "The connection is ready, but a pipeline call pays more first: a name lookup, a load balancer and a TLS handshake."
- **Prerequisites panel:** topic 18; HTTP request and response (declared).
- **Visual idea:** a client and server sequence diagram with diagonal RTT arrows, and a congestion-window bar that doubles each round trip under it. A lost packet freezes three HTTP/2 streams together (cherry) while the QUIC version freezes only one.
- **Lab:** hosts the §1.4 first part: `tc netem` adds delay and loss between a client and PostgreSQL or an HTTP server, and throughput is measured with and without connection reuse. This topic writes the shared `netem` setup that 21 and 22 reuse.
- **Sources:**
  - RFC 9293 (TCP); RFC 5681 (congestion control); RFC 6928 (initial window); RFC 7323 (window scaling); RFC 9438 (CUBIC).
  - N. Cardwell et al., "BBR: Congestion-Based Congestion Control", ACM Queue 2016; IETF draft-ietf-ccwg-bbr (current revision).
  - RFC 9000 (QUIC); RFC 9113 (HTTP/2); RFC 9114 (HTTP/3); RFC 8085 (UDP usage guidelines); tcp(7); tc-netem(8).

### 20. DNS, load balancing and TLS costs (`de.dns-load-balancing-tls`): full, §1.4

- **Folder:** `dns-load-balancing-tls`. About 12 min.
- **Scope:**
  - "DNS caching and TTL failure modes": resolution path and caches (OS, runtime, resolver), TTLs ignored by clients (the JVM's `networkaddress.cache.ttl`), negative caching (RFC 2308), failover delayed by caching, serve-stale (RFC 8767).
  - "L4 vs L7 load balancers and connection draining": connection-level vs request-level balancing; long-lived connections pinned to one backend; health checks; draining and deregistration delay during deploys.
  - "TLS 1.3 1-RTT handshakes and 0-RTT replay risk": full handshake in 1 RTT on top of TCP's 1; resumption; 0-RTT early data is replayable, so only idempotent requests may use it (RFC 8446 §8, RFC 8470).
  - "mTLS between services": client certificates, identity, rotation; its handshake cost.
  - "the latency each adds to a pipeline call (deep version → Rust Systems Engineering M3)": the waterfall of DNS + TCP + TLS + LB + request in RTTs, cold vs warm (pooled, resumed).
- **Outcomes:**
  - Total the RTTs of a cold vs warm call.
  - Predict how DNS caching delays a failover.
  - Choose L4 vs L7 and drain without dropped requests.
  - Say when 0-RTT is safe and what mTLS adds.
- **Introduces:** `dns-caching`, `l4-vs-l7-load-balancing`, `connection-draining`, `tls-handshake`, `zero-rtt-replay`, `mtls`. **Uses:** `rtt`, `three-way-handshake`, `connection-pooling`, `tls-placement`, `quic`, `protocol-layers`. **Declared:** `http-basics`.
- **Bridge:** "TCP's handshake was one round trip. A real call adds a name lookup, a load balancer and TLS; here is what each costs and how each fails."
- **Handoff:** "Every call now has a price in round trips. Next: when bytes, not round trips, dominate, and why moving compute beats moving data."
- **Prerequisites panel:** topics 18 and 19.
- **Visual idea:** the call waterfall. Stacked bars for DNS, TCP, TLS and request, measured in RTT units, shrink from a cold call to a warm one. A second frame shows a DNS TTL clock still pointing clients at a dead backend (cherry).
- **Lab:** its own "Try it": `curl -w` timing breakdown (`time_namelookup`, `time_connect`, `time_appconnect`) cold vs reused, under `netem` delay.
- **Sources:**
  - RFC 1034 and 1035 (DNS); RFC 2308 (negative caching); RFC 8767 (serve-stale).
  - RFC 8446 (TLS 1.3, §2.3 and §8 on 0-RTT); RFC 8470 (Using Early Data in HTTP).
  - AWS Elastic Load Balancing docs (Network vs Application Load Balancer, deregistration delay); Envoy docs (draining).
  - Oracle Java docs, `java.net.InetAddress` caching properties; curl(1) `--write-out`.

### 21. Bandwidth, latency and data locality (`de.bandwidth-latency-data-locality`): full, §1.4

- **Folder:** `bandwidth-latency-data-locality`. About 12 min.
- **Scope:**
  - "bandwidth-delay product": BDP = bandwidth × RTT, the bytes that must be in flight. It is the same α·β idea the held topic used for object storage, and the bridge points back to it. A receive window or socket buffer smaller than the BDP caps throughput at window/RTT. Linux `tcp_rmem`/`tcp_wmem` autotuning.
  - "throughput vs latency": they are independent axes; Little's law (concurrency = throughput × latency) for parallel requests; copying `order_events` (1 TiB, about 1.1 TB on the wire) cross-region with one stream vs many.
  - "why moving compute to data beats moving data to compute": data locality (HDFS "moving computation is cheaper than moving data", MapReduce), predicate and projection pushdown at a glance, and 14's shuffle vs broadcast bytes (990 GB vs 9.9 GB) now priced in time and money.
  - "cross-AZ and cross-region transfer pricing as a design constraint (wire-format costs: §6.1 and §4.1)": per-GB prices quoted from the provider's current pricing page with the date checked; a replica or a shuffle that crosses AZs, priced. Storage and request economics are left to §3.3, and wire formats to §6.1 and §4.1.
- **Outcomes:**
  - Compute a BDP and the buffer or stream count a transfer needs.
  - Separate a latency problem from a throughput problem.
  - Estimate the time and the bill for moving a dataset across AZs or regions.
  - Argue for moving compute to the data.
- **Introduces:** `bandwidth-delay-product`, `throughput-vs-latency`, `littles-law`, `data-locality`, `transfer-pricing`. **Uses:** `rtt`, `receive-window`, `congestion-control`, `slow-start`, `latency-bandwidth-cost`, `bandwidth-per-tier`, `lower-bound-estimate`, `io-model`, `object-storage`.
- **Bridge:** "Round trips priced the start of a call. For big transfers, bandwidth and distance decide, and so does the bill."
- **Handoff:** "Averages hide the slowest request. Next: why fanning out to many servers lets the slowest one set your latency."
- **Prerequisites panel:** topics 6, 14, 19 and 20.
- **Visual idea:** a pipe whose length is the RTT and whose width is the bandwidth. Its volume is the BDP, filled with caramel bytes in flight. A window smaller than the pipe leaves visible gaps, so throughput falls, and the bill is shown as a meter beside the cross-region pipe.
- **Lab:** hosts §1.4 "with BDP-sized buffers": under `netem` delay, `iperf3` or a Python sender with default vs BDP-sized socket buffers, plus one vs N streams.
- **Sources:**
  - RFC 7323 (long fat networks, window scaling); docs.kernel.org networking/ip-sysctl (`tcp_rmem`, `tcp_wmem`); tcp(7).
  - Apache Hadoop, "HDFS Architecture" ("Moving Computation is Cheaper than Moving Data").
  - J. Dean, S. Ghemawat, "MapReduce: Simplified Data Processing on Large Clusters", OSDI 2004.
  - AWS EC2 On-Demand pricing, "Data Transfer" section, and Google Cloud network pricing (current, dated).
  - J. D. C. Little, "A Proof for the Queuing Formula: L = λW", Operations Research 1961.

### 22. Tail latency under fan-out (`de.tail-latency-under-fan`): full, §1.4

- **Folder:** `tail-latency-under-fan`. About 12 min. Last topic of the chapter.
- **Scope:**
  - "why the p99 of a request fanned out to N servers approaches each server's p99.9+": P(at least one slow) = 1 − 0.99^N. The chapter's N = 50, as in the lab. Dean and Barroso's 100-server figure is quoted from the paper. A query that waits for all 50 range GETs of a Parquet scan inherits the slowest one.
  - "hedged and tied requests": send a second copy after the p95 delay, cancel the loser, and the extra load it costs; tied requests cancelling across servers.
  - "timeouts and deadline propagation (Dean & Barroso, "The Tail at Scale", CACM 2013)": per-hop timeouts vs one deadline passed down (gRPC deadlines), retries with backoff and jitter, retry storms.
  - "consequences for shuffles, scatter-gather queries and object-store reads": a shuffle stage waits for its slowest partition (`key-skew` from 15; shuffles explained on the spot and left to Ch.7); scatter-gather queries; object-store reads with hedged range GETs (11).
- **Outcomes:**
  - Compute how fan-out turns a server's tail into a request's median.
  - Design hedging with a bounded load cost.
  - Propagate a deadline instead of stacking timeouts.
  - Find the tail in a shuffle or a lakehouse scan.
- **Introduces:** `tail-latency`, `fan-out-amplification`, `hedged-requests`, `tied-requests`, `deadline-propagation`, `retry-backoff`. **Uses:** `latency-percentiles`, `rtt`, `object-storage`, `range-get`, `key-skew`, `connection-pooling`, `throughput-vs-latency`.
- **Bridge:** "Bandwidth and locality priced the typical request. Fan out to fifty servers and the rare slow one becomes the common case."
- **Handoff (to Chapter 2's first topic, Relational algebra and bag semantics):** "Chapter one priced the machine. Next chapter: SQL, starting with what a query really computes: relational algebra over bags."
- **Prerequisites panel:** topics 11, 19 and 21; percentiles (Before this, topic 11).
- **Visual idea:** fifty server dice rolled at once, each with a small cherry face. The request finishes at the slowest die, so a histogram of request latency shifts right as N grows, and then a hedged second roll after the p95 mark pulls it back.
- **Lab:** hosts §1.4 "a 50-way fan-out client, show the p99 blow-up, and recover it with hedged requests": a seeded simulation in `examples.py` plus a real asyncio client against servers with `netem` jitter.
- **Sources:**
  - J. Dean, L. A. Barroso, "The Tail at Scale", CACM 56(2), 2013.
  - A. Vulimiri et al., "Low Latency via Redundancy", CoNEXT 2013.
  - gRPC docs, "Deadlines"; AWS Builders' Library, "Timeouts, retries, and backoff with jitter".
  - Durner, Leis, Neumann, PVLDB 2023 (object-store request latency distributions).

Chapter 2's first topic, for the handoff: **Relational algebra and bag semantics**: "selection, projection, join, aggregation and set operators (UNION vs UNION ALL, INTERSECT/EXCEPT [ALL]) as algebra over multisets; the equivalences optimizers exploit and where bag semantics break set intuition (why UNION pays for a dedup)."

---

## Concept ledger at a glance (introduces, in order)

1. `python-functions`, `mutable-defaults`, `comprehensions`, `generators`, `context-managers`, `decorators`, `dataclasses`, `type-hints`
2. `commit-graph`, `merge-vs-rebase`, `interactive-rebase`, `reflog`, `merge-conflicts`, `git-bisect`, `exit-status`, `pr-merge-strategies`, `trunk-based-development`
3. `file-permissions`, `pipes-redirection`, `process-model`, `signals`, `threads-basics`, `process-inspection`, `text-tools`, `cron`, `ssh-tunnels`, `proc-strace`
4. `code-review-norms`, `unit-tests`, `ci-pipelines`, `semantic-versioning`, `dependency-pinning`
5. `big-o`, `logarithms`, `change-of-base`
6. `memory-hierarchy`, `latency-numbers`, `bandwidth-per-tier`, `latency-bandwidth-cost`, `numa`, `lower-bound-estimate`
7. `cache-lines`, `locality`, `hardware-prefetching`, `false-sharing`, `branch-misprediction`, `simd`, `columnar-layout`, `vectorized-execution`
8. `processes-vs-threads`, `context-switch-cost`, `lock-contention`, `atomics`, `memory-ordering`, `thread-per-core`, `morsel-scheduling`
9. `virtual-memory`, `tlb`, `huge-pages`, `page-cache`, `buffer-pool`, `double-buffering`, `o-direct`, `mmap`
10. `storage-devices`, `block-alignment`, `ssd-internals`, `write-amplification`, `io-uring`, `fsync`, `fsync-failure`
11. `object-storage`, `read-after-write-consistency`, `latency-percentiles`, `prefix-rate-limits`, `range-get`, `multipart-upload`, `conditional-writes`, `request-coalescing`
12. `integer-overflow`, `ieee-754`, `float-non-associativity`, `decimal-precision-scale`, `timestamp-resolution`
13. `b-tree-lookup`, `fanout-height`, `lsm-tree`, `read-write-amplification`
14. `io-model`, `scan-cost`, `index-crossover`, `random-vs-sequential-cost`, `clustered-vs-unclustered`, `external-sort-passes`, `block-size-per-tier`, `db-pages`
15. `hash-tables`, `open-addressing`, `load-factor`, `hash-quality`, `key-skew`, `radix-partitioning`, `hash-join`, `hash-aggregation`, `hash-spill`
16. `external-merge-sort`, `run-generation`, `replacement-selection`, `k-way-merge`, `merge-fan-in`, `sort-merge-join`, `sort-aggregation`
17. `dag`, `graph-traversal`, `topological-sort`, `cycle-detection`, `critical-path`, `connected-components`
18. `protocol-layers`, `encapsulation`, `mtu`, `packet-overhead`, `tls-placement`
19. `rtt`, `three-way-handshake`, `slow-start`, `connection-pooling`, `receive-window`, `congestion-control`, `head-of-line-blocking`, `quic`, `udp-tradeoffs`
20. `dns-caching`, `l4-vs-l7-load-balancing`, `connection-draining`, `tls-handshake`, `zero-rtt-replay`, `mtls`
21. `bandwidth-delay-product`, `throughput-vs-latency`, `littles-law`, `data-locality`, `transfer-pricing`
22. `tail-latency`, `fan-out-amplification`, `hedged-requests`, `tied-requests`, `deadline-propagation`, `retry-backoff`

Each concept is introduced once. Declared across the chapter: `programming`, `git-basics`, `shell-basics`, `high-school-algebra`, `reading-c`, `binary-numbers`, `sql-select`, `merge-sort`, `binary-heap`, `graph-basics`, `http-basics`, `ip-addresses`.

## Notes for the audit

1. **Concepts needed before their natural home, handled without reordering:**
   - CPU caches (7) needs threads for false sharing, which come before Threads (8). Linux shell (3) introduces `threads-basics` in one sentence (a process can run threads that share its memory; `ps -L` and htop show them), and 8 teaches the costs.
   - B+-trees (13) needs database pages, which the held cost model (14) introduces as `db-pages`. Topic 13 explains "a node is one page; the database reads whole pages, 8 KB in PostgreSQL" on the spot and does not list `db-pages`. Virtual memory (9) does the same for the buffer pool. The release seam check should accept this.
   - Object storage (11) reads a Parquet footer before Ch.6 teaches Parquet; it explains the file in one line on the spot. Context switches (8) name the TLB before 9 teaches it, the same way.
   - Numeric (12) and Tail latency (22) mention shuffles, which are taught in Ch.7. Both explain the term on the spot in one sentence, as the held topic's Prerequisites 07 does.
   - SQL appears in examples before Chapter 2. Topics 12, 15 and 16 declare `sql-select`, as the held topic does.
2. **Ids that look alike but differ:**
   - `storage-devices` (10) is device behaviour, including sequential vs random. `random-vs-sequential-cost` (14) is the model's ratio r.
   - `write-amplification` (10) is the device level, and `read-write-amplification` (13) is the data-structure level.
   - `external-sort-passes` (14) is the formula, and `merge-fan-in` (16) is choosing the fan-in under a memory budget.
   - `exit-status` is introduced once, by Git (2). Shell (3) deepens it as a use.
3. **The held I/O topic duplicates the §1.3 lab.** Its Deep dive "Lab 2 · External merge sort against the prediction" states the whole §1.3 lab, and this plan hosts it in 15 (spilling hash aggregation) and 16 (merge sort and crossover). Builders of 15 and 16 must match its wording ("passes = 1 + ceil(log_fanin(runs))"). At release, the seam check may turn Lab 2 into a pointer to 16. That is a release-time change, not a rebuild.
4. **The held topic fixes numbers others must match:**
   - `orders` 100 M rows / 1 M pages / B = 100; 1 TiB sort with 16 GiB and 1 MiB blocks (64 runs, fan-in 16,383, 2 passes); 1 TB ⋈ 100 MB on 100 machines (990 GB vs 9.9 GB).
   - S3: 100–200 ms "consistent" latency and medians in the tens of ms under 512 KB; 3,500 / 5,500 requests per second per prefix; 85–90 MB/s per request; 8 or 16 MB ranges.
   - PostgreSQL 18 `io_method` values; HDD 7 ms seek in Prerequisites 02.
   - It writes "1 TB" for the network example and "1 TiB" for the sort. The chapter's unit rule follows its usage (decimal for network volumes, binary for memory and files).
5. **Canonical latency table:** owned by 6. The orders of magnitude in this plan are provisional planning values for parallel builders, not on-screen facts. Any topic that shows a number sources it.
6. **Syllabus cross-reference errors (not fixed here; the plan must not edit the syllabus):**
   - §1.3 B+-trees "→ *Data Structures & Algorithms* Ch.3": DSA Ch.3 is Hashing; B-trees are DSA **Ch.5** "B-Trees and Write-Optimized Trees".
   - §1.3 Graph algorithms "→ DSA Ch.8": DSA Ch.8 is Range-Query Structures; topological sort and connectivity are DSA **Ch.17** (Graph Traversal and Connectivity, with representations in Ch.10).
   - Topics 13 and 17 link the right DSA reels and note the pointer in `coverage.json` with the quoted DSA line.
   - Someone should fix the syllabus in a separate change.
7. **Refreshers outside §1.1** (13, 17, 18) don't show `RefresherList`, whose five entries are §1.1's. The list's strings are the registry titles of topics 1–5. Topic 1's bridge ("five quick refreshers") stays true.
8. **Fixed-topic seams:**
   - Git's handoff ("where exit codes like the ones bisect reads come from") is answered by 3's bridge and scope (128+n, 125 and 127).
   - 13's handoff sets up 14's bridge ("you have just revised how a B+-tree finds a row in a few page reads"), which needs 13 to show the 3–4 page-read lookup.
   - 15's bridge answers 14's handoff (hash tables and what they cost when memory runs out).
   - The Git topic's registry entry on its branch already says `status: 'live'`, but it is not on `main` yet. Its release must follow topic 1, which is live, so no hold is needed.
9. **Versions to state, not assume:** BBR (draft status), Spark ANSI default (4.0), pandas 3.0 µs inference, PostgreSQL 18 `io_method`, Bash, jq and OpenSSH versions in the shell refresher. Each topic quotes the current docs and marks the version (QUALITY.md #8).
10. **No reordering.** The syllabus order works as the teaching order with the on-the-spot explanations in note 1. No prerequisite was found to sit later in the domain in a way that needs a syllabus change.
