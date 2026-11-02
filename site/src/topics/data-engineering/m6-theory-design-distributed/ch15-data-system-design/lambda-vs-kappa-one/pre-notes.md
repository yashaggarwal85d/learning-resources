- **Speed layer**: the low-latency streaming half of a Lambda design. *Where you meet it:* the
  two-designs reveal.
- **Batch layer**: the high-latency, bulk-compute half of a Lambda design, merged with the
  speed layer at serve time. *Where you meet it:* the two-designs reveal.
- **Replay**: reprocessing a retained log through the same program again, from an earlier
  position. *Where you meet it:* the two-designs and crossover reveals.
- **Retention**: how far back a log keeps its own history available to replay. *Where you meet
  it:* the crossover reveal.
- **Dual code path**: two independently maintained implementations that must produce the same
  answer. *Where you meet it:* the drift-measured reveal.
- **Restatement**: recomputing a result after a logic change, over a stated window of history.
  *Where you meet it:* the predict step and the four-conditions reveal.
- **Unified engine**: one program executable in either streaming or batch mode by the same
  runtime. *Where you meet it:* the unified-engine reveal.
