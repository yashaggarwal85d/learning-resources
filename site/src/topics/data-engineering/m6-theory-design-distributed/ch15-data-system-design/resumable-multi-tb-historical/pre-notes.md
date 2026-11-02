- **Backfill**: reprocessing historical data through a pipeline's current logic. *Where you
  meet it:* the hook and the chunk-grid reveal.
- **Chunk**: one independent unit of a backfill's work, such as a day or a partition. *Where
  you meet it:* the chunk-grid reveal.
- **Checkpoint**: a durable record of which chunks have already completed. *Where you meet it:*
  the checkpoint-resume reveal.
- **Idempotent**: rerunning the same chunk produces the same output, never a duplicate. *Where
  you meet it:* the checkpoint-resume reveal.
- **Throttle**: a cap on concurrency or rate that leaves headroom for other work. *Where you
  meet it:* the throttle-signal reveal.
- **Shadow table**: a copy written to during a backfill, invisible to live readers until
  promoted. *Where you meet it:* the shadow-swap reveal.
- **Atomic swap**: a single operation that promotes a shadow to live, with no partial state
  visible in between. *Where you meet it:* the shadow-swap reveal.
- **Data diff**: a comparison that checks a shadow's output against the live table and an
  independent recomputation. *Where you meet it:* the data-diff reveal.
- **Back-off**: reducing concurrency or rate in response to a rising production signal. *Where
  you meet it:* the throttle-reacts reveal.
