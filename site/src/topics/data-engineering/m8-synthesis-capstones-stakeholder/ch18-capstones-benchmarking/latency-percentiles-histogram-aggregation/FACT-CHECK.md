# Fact-check — de.latency-percentiles-histogram-aggregation

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | HdrHistogram's own documentation: histogram objects are additive, so it is common practice to use per-thread histograms or recorders and perform aggregation math (merging) across time and threads with a reporting thread. | HdrHistogram README | Verified, quoted |
| 2 | wrk2's own documentation: wrk's (closed-loop) model measures latency from actual send to actual completion, which exhibits a strong Coordinated Omission effect because each connection only sends its next request after the previous response arrives. | wrk2 README | Verified, quoted |
| 3 | wrk2's own documentation: wrk2 avoids Coordinated Omission by combining constant-throughput generation with latency measured from the time a request *should* have been sent, not the time it actually was. | wrk2 README | Verified, quoted |
| 4 | Dean & Barroso (CACM 2013): a single server with a 99th-percentile latency of one second makes one user request in a hundred slow when handled by just that one server. | Dean & Barroso, The Tail at Scale | Verified, quoted |
| 5 | Dean & Barroso: the same server's own latency profile, fanned out to 100 parallel servers, makes 63% of user requests take more than one second. | Dean & Barroso, The Tail at Scale | Verified, quoted |
| 6 | (This course) a rare, large injected stall barely moves a five-hundred-sample mean while p99.9 and max directly capture it. | This topic's own examples.py (measured) | Measured in this sandbox |
| 7 | (This course) two differently-shaped real query workloads' separately-computed p99s, naively averaged, disagree meaningfully with the true p99 of their merged, combined samples. | This topic's own examples.py (measured) | Measured in this sandbox |
| 8 | (This course) a Monte Carlo simulation of a hundred-shard fan-out, each shard with an independent one-percent tail rate, reproduces the derived sixty-three-percent probability closely. | This topic's own examples.py (measured), checked against claim 5's documented figure | Measured in this sandbox, consistent with the paper's own worked number |
| 9 | (This course) a closed-loop generator and a constant-rate generator, run against the same query sequence with the same injected stall, report very different p99s: the closed-loop generator's p99 stays near baseline while the constant-rate generator's p99 reflects the stall's full backlog. | This topic's own examples.py (measured) | Measured in this sandbox |

## Currency check

- The HdrHistogram and wrk2 quotes are read from each project's own current `master` branch
  README at research time (2026-10-30); both documents describe stable, long-standing design
  decisions (histogram additivity; the Coordinated Omission fix), not something likely to have
  changed recently.
- The Dean & Barroso paper is dated February 2013 (Communications of the ACM, Vol. 56 No. 2);
  it is cited for its own worked numerical example (a 99th-percentile-of-one-second server, fanned
  out to 100 servers), which is a mathematical consequence of the stated assumptions, not a
  measurement that could go stale.

## Red team

1. **Is reproducing the paper's "sixty-three percent" figure by Monte Carlo simulation, rather
   than citing it directly as a measured fact, circular reasoning (deriving a number and then
   checking it against itself)?** No — the derivation (`1 − (1 − rate)^shards`) is an independent,
   first-principles probability calculation, and the simulation is an independent sampling
   procedure; both are checked against each other (claim 8) and against the paper's own
   independently-stated figure (claim 5), which used the same underlying assumption (independent,
   one-percent-tail servers) but was derived by the paper's authors, not copied from this topic's
   own derivation.
2. **Does the two-hosts histogram-merge demonstration actually test what it claims, or could the
   two workloads' difference be explained by something other than "averaging percentiles is
   wrong"?** The demonstration is explicit that the two hosts are *different query shapes*
   (a point lookup and a range aggregate), which is realistic (real fleets rarely run perfectly
   identical traffic on every host) and is exactly the condition under which naive percentile
   averaging fails; the claim is scoped to "these two measured distributions disagree," not to a
   universal theorem about all possible host pairs.
3. **Is the closed-loop generator's own p99 in examples.py "cheating" by having too few total
   requests for the single stall to register at the 99th percentile, rather than genuinely
   demonstrating Coordinated Omission?** No — the mechanism demonstrated is not about whether the
   one stalled request itself appears at p99, but about every *subsequent* request's own
   backlog-induced delay; the closed-loop generator's own latency metric is, by construction,
   blind to that backlog (each request's clock only starts when it's actually sent), which is the
   point FACT-CHECK and post-notes.md both state explicitly.
4. **Could the hook's "forty milliseconds mean, four-second wait" framing be read as a cited
   statistic?** It is explicitly a hook-framing scenario illustrating the mean-hides-tail
   mechanism (claim 6, reproduced at this topic's own, smaller scale), not a cited number; it does
   not appear in coverage.json's expert items or this fact-check's claims table as an independent
   sourced claim.
5. **Does naming the Coordinated Omission effect without the syllabus's own skipped bullet (which
   would formally define the term) risk overclaiming?** No — CHAPTER.md's own "Leaves out" line
   for this topic states explicitly that it "demonstrates coordinated omission's effect without
   naming or formally defining the term as its own concept," per the syllabus's own skip mark; the
   reel and post-notes.md name the effect only in the course of describing wrk2's own documented
   fix, never presenting a formal, independent definition as this topic's own content.

## Problem Solving

The HdrHistogram and wrk2 sources fetched cleanly on the first try, from each project's raw
GitHub README (the recurring, domain-wide GitHub-web 403 limitation applies only to rendered wiki
pages in this sandbox, not to raw file content, which both of these sources already are). The
Dean & Barroso paper needed a research subagent after two direct URL guesses (a CACM page, which
bot-blocked; Google's own research-publication page, a JS-rendered page with no working embedded
PDF link) failed; the agent found a working, author-hosted copy on Luiz Barroso's own personal
site. One quoted passage's continuation crosses a PDF page break with a garbled running-header
artifact ("comm unicatio ns o f the ac m" interrupting "very modest fractions"); the quote used in
SOURCES.md was trimmed to end just before that page break, avoiding the artifact entirely rather
than quoting through it, following the same line-break-gotcha pattern documented on earlier
topics in this chapter's predecessor.
