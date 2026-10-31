- **Offset-for-times**: a lookup that returns the earliest offset whose timestamp is at or after
  a given moment, letting a consumer jump its position by time instead of a raw offset number.
  *Where you meet it:* the setup.
- **Replay scope**: whether a replay covers a single partition, a bounded time range, or (by
  default) the whole topic. *Where you meet it:* the first predict/reveal.
- **Backfill**: pulling records a replay needs from somewhere other than the hot log, once they've
  aged out of it. *Where you meet it:* the source reveal.
- **Versioned output**: writing a replay's results to a new, separately labeled destination
  instead of overwriting the original. *Where you meet it:* the second predict/reveal.
- **Suppressed side effect**: a flag on a replayed record that stops it from triggering an
  external action (an email, a webhook) a second time. *Where you meet it:* the versioned-output
  reveal.
