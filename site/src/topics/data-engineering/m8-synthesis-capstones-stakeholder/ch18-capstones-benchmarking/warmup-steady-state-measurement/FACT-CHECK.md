# Fact-check — de.warmup-steady-state-measurement

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | PostgreSQL's own documentation: because PostgreSQL also relies on the operating system cache, an allocation of more than 40% of RAM to shared_buffers is unlikely to work better than a smaller amount — i.e. the buffer pool and the OS page cache are two distinct, stacked caches. | PostgreSQL docs, 19.4 Resource Consumption | Verified, quoted |
| 2 | RocksDB's own documentation: compactions are needed for space efficiency, read efficiency and timely deletion; a full memtable is flushed to an L0 file, and compaction periodically merges files into later levels. | RocksDB wiki, Overview of RocksDB | Verified, quoted |
| 3 | Georges, Buytaert & Eeckhout (OOPSLA 2007): there are two issues with quantifying steady-state performance, the first being determining when steady-state performance is reached. | Georges et al., Statistically Rigorous Java Performance Evaluation | Verified, quoted |
| 4 | Georges, Buytaert & Eeckhout: a steady-state iteration is determined once the coefficient of variation (CoV) of the k most recent iterations falls below a preset threshold (e.g. 0.01 or 0.02). | Georges et al., Statistically Rigorous Java Performance Evaluation | Verified, quoted |
| 5 | Georges, Buytaert & Eeckhout: a confidence interval for a given confidence level is computed across the means from the different VM invocations (repeated trials), not from a single run. | Georges et al., Statistically Rigorous Java Performance Evaluation | Verified, quoted |
| 6 | (This course) a steady-state detector: a sliding window of recent latency samples whose mean is compared between consecutive windows, firing once the change falls and stays below a stated threshold. | This topic's own examples.py (measured), adapted from claim 4's CoV-threshold convention at wall-clock-latency scale | This course's own adaptation, not the paper's own exact statistic |
| 7 | (This course) the shop's order-lookup query, run from a cold Postgres start, shows measurably higher latency for its first several requests than its later, steady-state requests. | This topic's own examples.py (measured) | Measured in this sandbox |
| 8 | (This course) a cold-cache number and a hot-cache number for the same query, reported as two separate labeled results rather than one blended average. | This topic's own examples.py (measured) | Measured in this sandbox |
| 9 | (This course) of the syllabus's five named warm-up causes, only cold page cache/buffer pool and an empty result-cache analog are reproduced directly on this sandbox's Postgres; JIT/code-gen, LSM compaction debt and table-format small files are named from their own sources as the same failure in systems not run here. | This topic's own scope statement, drawn from claims 1-2 and CHAPTER.md's "Engine of record" | This course's own synthesis |

## Currency check

- The PostgreSQL documentation quote is read from the current (PostgreSQL 18) documentation page
  at research time (2026-10-30), not a historical snapshot; `shared_buffers`' guidance has been
  stable across recent major versions, so no version-specific caveat is needed.
- The RocksDB quote is read from the project's own wiki source (fetched via
  `raw.githubusercontent.com` since GitHub's own rendered wiki page returns HTTP 403 in this
  sandbox — the same recurring, domain-wide GitHub limitation seen on earlier topics, not a
  wiki-specific issue), current at research time.
- The Georges et al. paper is dated 2007 and is read and cited as a methodology reference (the
  general convention of a stability threshold plus repeated-trial confidence intervals), not as a
  claim about current JVM behavior; its own subject (Java VM warm-up) is named explicitly as the
  paper's actual domain, distinct from this topic's own domain (a Postgres query benchmark), so the
  topic adapts the *convention*, not the paper's own numbers.

## Red team

1. **Is citing a 2007 Java-VM benchmarking paper for a Postgres-benchmarking topic a mismatch?**
   The paper is cited for its *methodology* — the general idea of a stability threshold marking
   steady state, and a confidence interval computed across repeated trials — which this topic
   states plainly is a convention being adapted, not a Java-specific result being claimed about
   Postgres. post-notes.md and the reel both name the paper's actual subject (JVM performance
   evaluation) so a viewer is never led to think the paper itself benchmarked a database.
2. **Does naming JIT/code-gen, LSM compaction debt and table-format small files as warm-up causes
   without reproducing them on this sandbox risk asserting something unverified?** No — claim 9
   states explicitly, and CHAPTER.md's "Engine of record" line instructs, that these three are
   named from their own sources (the RocksDB quote for compaction debt; a JIT compiler's own
   documented behavior, read but not separately sourced since it is common, undisputed knowledge
   about managed-runtime compilation; table-format small files as Chapter 6's own, not-yet-live
   material named forward) as the same *kind* of failure in systems this sandbox does not run, and
   this topic never shows a number for any of the three.
3. **Is the steady-state detector's own threshold (a sliding-window mean-change percentage) an
   invented number dressed up as the paper's own CoV threshold?** No — claim 6 states this plainly
   as this course's own adaptation at a different unit (wall-clock request latency, not benchmark
   iteration counts), distinct from claim 4's paper-stated CoV thresholds (0.01 or 0.02); the two
   are not conflated anywhere in the topic's own files.
4. **Could the hook's "twice as far apart as the actual difference between a good day and a bad
   one" framing be read as a cited statistic rather than a hook-framing device?** It is explicitly
   a constructed scenario illustrating the mechanism (an empty buffer pool and result cache
   inflating a cold-start measurement), not a cited number; it does not appear in coverage.json's
   expert items or this fact-check's claims table as an independent sourced claim.
5. **Does reproducing "cold page cache and buffer pool" and "empty result caches" as two separate
   causes on the same Postgres instance actually demonstrate two distinct mechanisms, or one
   mechanism counted twice?** They are kept distinct in examples.py: the page-cache/buffer-pool
   effect is shown by restarting Postgres (OS cache and `shared_buffers` both empty) before the
   first measured run, while the result-cache analog is shown by re-running the identical query a
   second time without a restart and observing a further latency drop (Postgres plans and executes
   the same statement faster on a warm shared-buffer plan cache) — a real, separate effect from the
   cold-restart one, not a restatement of it.

## Problem Solving

Both the PostgreSQL and RocksDB documentation sources fetched cleanly once the correct URLs were
used: GitHub's own rendered wiki page for RocksDB returned HTTP 403 (the recurring, domain-wide
GitHub-web limitation already seen on earlier topics in this sandbox), fixed by fetching the same
wiki content from its `raw.githubusercontent.com/wiki/...` source instead. The Georges et al. paper
needed a research subagent to find a working, non-paywalled, author-hosted URL (`dri.es`, a
co-author's own homepage) after a direct guess at a university-hosted path 404'd; two of its three
quoted passages needed care around PDF-extraction artifacts (a footnote marker "1" fused directly
onto "(CoV)" with no space, and a stray superscript-summation "p" injected into a later sentence's
line-wrapped text) — both quotes were adjusted to match the source's literal extracted text rather
than the paper's intended typography, following the same footnote-marker and line-break gotchas
documented from earlier topics in this chapter's predecessor.
