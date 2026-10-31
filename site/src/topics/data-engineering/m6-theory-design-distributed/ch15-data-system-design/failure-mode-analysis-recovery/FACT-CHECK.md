# Fact-check — de.failure-mode-analysis-recovery

## Claims re-derived against the source

1. **A cascading failure grows over time from positive feedback; server overload is its most
   common cause.** SOURCES.md's first two SRE-book quotes support this directly ("A cascading
   failure is a failure that grows over time as a result of positive feedback" / "The most common
   cause of cascading failures is overload"). Checked the reel doesn't claim this topic teaches
   *how* to prevent overload mechanically (capacity planning formulas, load shedding thresholds) —
   those stay in the SRE book's own chapter, not re-derived here; this topic only uses "overload
   cascades" as the shape a failure-table row can take.

2. **A full request queue converts into added latency; small queues relative to thread-pool size
   fail fast rather than piling up.** SOURCES.md's third SRE-book quote ("Queued requests consume
   memory and increase latency") supports the mechanism directly. Checked the reel's failure-table
   steps (3-5) use this only as one example row's "detection" and "time to recover" shape, not as
   a re-teaching of queue-sizing policy, which belongs to the source chapter, not this topic.

3. **Randomized exponential backoff is what stops a retrying client from amplifying a backend's
   overload into its own prolonged failure.** SOURCES.md's fourth SRE-book quote ("Always use
   randomized exponential backoff when scheduling retries") supports this directly. Checked this
   claim is used only to justify why "a human quarantines the record" (predict, step 2) beats
   "the pipeline eventually sorts itself out" for a crash loop with no backoff/dead-letter path at
   all — not stretched into a claim about any specific retry-budget number.

4. **Jitter on top of exponential backoff, not backoff alone, spreads contending clients' retries
   into an approximately constant rate.** SOURCES.md's two AWS-blog quotes ("N clients compete in
   the first round, N-1 in the second round..." and "Capped exponential backoff means that clients
   multiply their backoff by a constant...") support the setup and mechanism. Checked this is used
   only as background for why "the pipeline eventually catches the bad record itself" (the wrong
   predict option, step 2) is a tempting but incomplete answer — a crash loop with no out-of-band
   path repeats indefinitely regardless of backoff shape, since backoff smooths contention between
   many clients, not a single process retrying the same unparseable record. Checked the reel
   doesn't claim the AWS blog's own jitter variants (Full/Equal/Decorrelated) as material for this
   topic — that detail isn't used anywhere in the storyboard.

5. **The failure-table structure and RPO/RTO-per-data-class framing are this chapter's own
   reasoning.** Not an independent citation — `CHAPTER.md`'s own scope line states the failure
   table's five columns and the "RPO/RTO set per data class" requirement directly; this is
   presented as the chapter's own method, not a cited authority's finding, so no source fetch is
   needed for it. DR mechanics and game days (Chapter 11 §11.3) are named, not re-derived, per
   `CHAPTER.md`'s own "Leaves out" line.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("the pipeline eventually catches the bad record itself
  and skips past it") is a genuine, common first reaction (assume retry logic is self-healing)
  rather than a strawman — the hook's crash loop has no dead-letter path stated, so without one, a
  deterministic parse failure repeats identically on every retry; the correct option (a human
  notices the per-partition metric) is the only one consistent with "no recovery path exists yet,"
  which is exactly the gap a failure table is built to surface.
- **Predict 2 (step 10, "Prove it"):** checked that applying the same five-column failure table to
  a different failure (total broker loss, not a single poison record) is a straightforward
  extension of the table's own definition (failure, blast radius, detection, recovery, data lost,
  time to recover apply to any named failure) — not a claim that broker-loss recovery mechanics
  themselves are taught here; filling in the table's cells for that new row is the point, not the
  specific recovery technique that would go in its "recovery" cell.

## Illustrative numbers (figs for steps 1, 6, 7)

The "crash-loops forever" duration, the specific RPO/RTO bar lengths, and the per-data-class cost
curves are illustrative, stated lab numbers for `examples.py`'s own simulation, not cited
real-world industry figures — no source claim is made about any specific system's actual RPO,
RTO, or incident duration. `examples.py`'s own failure-table and poison-record functions compute
the actual modeled values from stated inputs, matching this topic's own "Lab" section plan.

## Outcome

No open findings. Every claim about cascading-failure mechanics, queue behavior, or retry/backoff
amplification traces to one of SOURCES.md's six verbatim quotes across two sources; the
failure-table and RPO/RTO framing rest on `CHAPTER.md`'s own stated method, not an unsourced
factual claim; both predicts are checked against the definitions already established in the
storyboard itself.
