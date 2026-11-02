- **Freshness SLO**: a committed ceiling on how long after an event occurs the system must make
  a result visible. *Where you meet it:* the hook and the decision card's own floor line.
- **Latency floor**: the fastest a given architecture can ever deliver a fresh result, no matter
  how it's tuned — a hard lower bound, not a target. *Where you meet it:* the decision-card
  reveal.
- **Reprocessing**: re-deriving output from retained input after the code that produces it
  changes. *Where you meet it:* the Lambda-versus-Kappa reveal.
- **Replay**: re-running a job from an earlier point in a retained log, rather than from live
  data only. *Where you meet it:* Kappa's own reveal.
- **Push versus pull**: whether a source delivers data on its own schedule (push) or is queried
  by the pipeline on the pipeline's schedule (pull). *Where you meet it:* the source-boundary
  reveal and its predict.
- **Idempotence**: an operation that produces the same result no matter how many times it's
  applied — assumed vocabulary this topic doesn't re-derive. *Where you meet it:* named only in
  passing, as a `declared` concept Chapter 9 owns in full.
