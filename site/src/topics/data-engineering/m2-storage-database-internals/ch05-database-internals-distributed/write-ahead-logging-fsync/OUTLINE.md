# Outline — de.write-ahead-logging-fsync

## Learning outcomes

1. State the write-ahead rule precisely (a change is logged, and that log made durable, before
   the changed page itself is written back), and read a real LSN directly off this sandbox's
   cluster to show what it actually orders.
2. Explain a torn page concretely, and contrast Postgres's full-page-write defense — measured
   directly, triggering only on the first change to a page after a checkpoint — with InnoDB's
   doublewrite buffer, the same problem solved a different way.
3. Contrast `fsync`, `fdatasync` and `O_DSYNC`, and state the 2018 fsyncgate lesson: why a failed
   `fsync` call is only ever safely answered by crashing and replaying, never by retrying.

## Reel steps (storyboard)

1. **Hook: a dirty page sitting in the buffer pool is lost the instant the process crashes. What
   has to happen before that page is ever allowed to be flushed?**
   - `fig`: "a dirty page sitting in the buffer pool is lost the instant the process crashes, unless something records the write durably first. What's that something?"
   - Visual: "a dirty page" / "lost on crash" vs. "something, first" / "not yet named".
   - Narrator's line: names the real handoff (the last topic opened the cache; this topic opens what makes a write in that cache actually survive a crash).

2. **Reveal: a real log position, read directly off this sandbox's own cluster**
   - `fig`: "a real write's own position in the log, read directly — what does it actually measure?"
   - Visual: "before a write" / "one log position" vs. "after a write" / "a position further on".
   - Takeaway: a real log position only ever moves forward, and the real distance between two of them, measured directly, is the exact number of bytes a write actually added.

3. **Reveal: the write-ahead rule, and a measured trick that bends it without breaking it**
   - `fig`: "the log gets flushed before the data does — but does every single commit really pay for its own separate flush?"
   - Visual: "many real commits" / "far fewer real flushes" vs. "one flush" / "covers several commits at once".
   - Takeaway: a real batch of concurrent commits against this sandbox's own cluster measurably shares far fewer flushes than it has commits, without breaking the log-before-data rule at all.

4. **Predict: a disk write happens in fixed-size physical chunks. If power fails mid-write, is
   the result always either the whole page or none of it?** (within first four ✓)
   - `fig`: "a disk write happens in fixed-size physical chunks, not all at once — if power fails mid-write, is the result always either the whole page or none of it?"
   - Options: "Yes — a single write either lands or it doesn't, as one unit" / "No — some of the page's own chunks can land while others don't, leaving a mix of old and new data" (correct).
   - Explain: no. A page is written in multiple fixed-size physical chunks, and a failure partway through can leave some chunks written and others not — a torn page, mixing old and new data in a way nothing downstream can safely trust.

5. **Reveal: a torn page's real defense, measured triggering exactly once per checkpoint**
   - `fig`: "a real page, changed twice after a real checkpoint — does the full defense against a torn page fire both times, or just the first?"
   - Visual: "first change after a checkpoint" / "a full defense, triggered" vs. "second change, same page" / "no defense needed again".
   - Takeaway: a real page's first change after a real checkpoint measurably triggers its own full-page defense exactly once — a second change to the same page doesn't trigger it again.

6. **Reveal: three real ways to force a write out, and which one this sandbox actually uses**
   - `fig`: "this sandbox's own cluster, read directly — which of three real system calls does it actually use to force the log out to disk?"
   - Visual: "three real options" / "named directly from the engine" vs. "this sandbox's own setting" / "one specific answer".
   - Takeaway: this sandbox's own cluster, read directly, really does use one specific one of the three documented ways to force the log out to disk, not an abstraction over all of them.

7. **Reveal: a different engine's own defense against the identical torn-page problem**
   - `fig`: "a different engine's own documentation, on the identical torn-page problem — does it solve it the same way, or differently?"
   - Visual: "this topic's own engine" / "a full page, logged first" vs. "a different engine" / "a safety copy, kept separately".
   - No takeaway on this step (named-not-run disclosure step, matching the pattern from Chapters 1–5; sourced directly, since this sandbox has no instance of that engine running).

8. **Reveal: a real, documented lesson a failed force-out taught the hard way**
   - `fig`: "in 2018, a failed attempt to force data out to disk turned out to be lying about having failed at all — what's the only safe response once that's discovered?"
   - Visual: "a failed attempt" / "silently lost, not retried" vs. "the only safe response" / "crash, then replay the log".
   - No takeaway on this step (named-not-run disclosure step: a real kernel-level failure mode from 2018, sourced directly rather than reproduced).

9. **Recap**
10. **Prove it** — a production scenario: a monitoring script sees a cluster's own
    force-out call fail once, logs a warning, and lets the process keep running rather than
    crashing it. Is that response safe, and why or why not?

## Engagement arc

- Hook names the real open question the previous topic's handoff left: something has to make a
  dirty buffer-pool page survive a crash.
- Predict at step 4, within the first four, tests the tempting-but-wrong intuition that a disk
  write is atomic as a whole page.
- Steps 2–3 build the LSN and write-ahead-rule vocabulary the predict question needs, with a
  real, measured group-commit result along the way.
- Steps 5–6 build the full-page-write and sync-method claims with real, run evidence from this
  sandbox's own cluster.
- Steps 7–8 are the two honestly disclosed, sourced-only steps (no InnoDB instance here; a
  historical kernel bug that can't be reproduced on demand).
- Recap ties every claim back to its own real evidence or its own named source; Prove It makes
  the "crash, don't retry" rule concrete against a tempting but unsafe shortcut.

## Post-notes headings

- Outcomes
- Lab
- Production failures this topic warns about
- Frontier
- Where this goes next

## Claims (drawn from the five verified sources)

1. An LSN is a byte offset into the WAL, increasing monotonically with each new record; LSN
   values can be compared to measure the volume of WAL data between them. (WAL Internals)
2. `wal_sync_method`'s real options include `fdatasync`, `fsync`, and an `open_datasync` option
   built on the `O_DSYNC` open flag. (Write Ahead Log)
3. `commit_delay` can improve group commit throughput by letting more transactions share one WAL
   flush, at the cost of added per-commit latency. (Write Ahead Log)
4. Full-page writes log a page's entire content on its first modification after a checkpoint,
   specifically because a page write interrupted by a crash can leave a mix of old and new data.
   (Write Ahead Log)
5. A disk write happens in fixed-size sectors, and a crash partway through can leave some
   sectors written and others not — the physical mechanism behind a torn page. (Reliability)
6. PostgreSQL periodically writes full page images to WAL before modifying the actual page, so a
   partially-written page can be restored from WAL during crash recovery. (Reliability)
7. In 2018, multiple Linux kernel versions were found to lose or misreport `fsync` errors, so a
   buffer could be marked clean after a failed write and discarded under memory pressure,
   meaning a retried `fsync` could falsely report success. (Fsync Errors)
8. PostgreSQL's real fix (backpatched to five release lines) is to PANIC on an `fsync` failure
   rather than retry it. (Fsync Errors)
9. InnoDB's doublewrite buffer writes a page there first and only writes it to its final
   destination once that buffer copy is safely flushed, recovering from a half-written page by
   checking the buffer's own copy during recovery. (InnoDB Doublewrite Buffer)

## Progress

Research done (SOURCES.md, 15/15 quotes), examples.py written and run repeatedly for stability:
a real LSN measured moving forward by an exact byte count after a real write; this sandbox's
own `wal_sync_method` confirmed as the documented Linux default (`fdatasync`); a real page's
full-page defense measured triggering exactly once on its first change after a real checkpoint,
not again on a second change; a real batch of 400 concurrent commits measured needing far fewer
real WAL flushes when `commit_delay` lets them share flushes (50 with the delay vs. roughly 190
to 210 without it, run to run). Next: FACT-CHECK.md, coverage.json, reel.tsx/scenes.tsx,
narration.json.
