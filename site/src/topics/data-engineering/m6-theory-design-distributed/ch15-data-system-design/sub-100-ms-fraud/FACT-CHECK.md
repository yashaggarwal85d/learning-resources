# Fact-check — de.sub-100-ms-fraud

## Claims re-derived against the source

1. **Flink's RocksDB state backend holds in-flight data on each TaskManager's local disk, by
   default.** SOURCES.md's quote supports this directly. Checked step 6's state-sizing reveal
   treats "where the state actually lives" as a disk question once it outgrows memory, matching
   the source's own default behavior, not an assumed in-memory default.
2. **RocksDB's state capacity is limited only by available disk space, unlike the in-memory
   HashMapStateBackend.** SOURCES.md's quote supports this directly. Checked step 6 draws the
   line where state "stops fitting in memory alone" as the actual decision point the source
   itself names — the contrast is with the in-memory backend specifically, not a vague "more
   capacity" claim.
3. **Redis's own processing time is usually in the sub-microsecond range.** SOURCES.md's quote
   supports this directly. Checked the online-store hop in step 4's latency budget treats this as
   the floor the hop's own p99 budget has to clear, not a number this topic invented.
4. **Redis serves one request at a time, so all requests are served sequentially.** SOURCES.md's
   quote supports this directly. Checked step 7's fallback reveal and the "Prove it" step both
   rely on this mechanism to explain why one slow command on the online store can delay every
   other request sharing it — a consequence the source states directly, not inferred.
5. **Normal Redis commands like GET, SET, and LPUSH run in constant, very small time.**
   SOURCES.md's quote supports this directly. Checked the feature-lookup hop's own budget assumes
   exactly this class of simple key lookup, not a more expensive multi-key operation the same
   source warns runs slower.
6. **The latency-budget table, the chain-p99-versus-sum-of-p99s distinction, the fallback-as-ADR
   design, and score-time feature logging are this chapter's own established method and this
   topic's own derived design.** Not an independent citation beyond claims 1-5 — `CHAPTER.md`'s
   own scope line states these as this topic's own worked design, not re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("the model itself is too slow on average") is a
  genuine, plausible first instinct — a slow model is an obvious suspect — but it's ruled out
  directly against the hook's own stated fact: the average score time was already comfortable.
  The correct option names where the actual problem lives: one hop's own tail, and a fallback
  decision that needs recording rather than defaulting.
- **Predict 2 (step 10, "Prove it"):** checked that "raise the timeout" is ruled out against
  claim 4's own mechanism: a genuinely slow hop stays slow regardless of how long checkout is
  willing to wait for it, so raising the timeout only delays reaching the same fallback. The
  correct option (the state size and the online store's own load are the real next bottleneck)
  follows from the source's own description of what actually degrades under more load — slow
  commands and growing state, not the timeout value itself.

## Illustrative numbers (figs for steps 1, 4, 6, 10)

The hook's average-versus-p99 score times, the timeout value, the fraction of payments hitting
the fallback, the per-hop budget figures, the card count and window length behind the state-size
estimate, and the tenfold payment-rate growth in "Prove it" are illustrative, stated lab numbers
for the storyboard and the simulation in `examples.py`, not cited real-world figures from any
specific company's fraud-scoring system.

## Outcome

No open findings. Every claim about Flink's own RocksDB state backend and Redis's own
processing-time and single-threaded design traces to one of SOURCES.md's six verbatim quotes
across two sources (Apache Flink's own documentation, Redis's own documentation); the
latency-budget, chain-p99, fallback-as-ADR, and score-time-logging designs rest on `CHAPTER.md`'s
own stated scope, not an unsourced factual claim; both predicts are checked against the topic's
own cited mechanisms rather than invented reasoning.
