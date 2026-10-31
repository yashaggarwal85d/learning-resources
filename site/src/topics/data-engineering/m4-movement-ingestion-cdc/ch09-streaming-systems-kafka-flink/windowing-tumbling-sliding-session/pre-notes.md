- **Tumbling window**: a fixed-size window that does not overlap its neighbours — each element
  belongs to exactly one. *Where you meet it:* the first predict/reveal.
- **Sliding window**: a fixed-size window that overlaps its neighbours by a step smaller than its
  size — each element belongs to several at once. *Where you meet it:* the first predict/reveal.
- **Session window**: a window with no fixed size, extending as long as records keep arriving
  within a gap threshold. *Where you meet it:* the session-merge reveal.
- **Global window**: a single window covering the entire stream for a key, with no boundary at
  all. *Where you meet it:* the second predict/reveal.
- **Trigger**: the rule that decides when a window fires and emits a result — built in for
  tumbling, sliding, and session windows; mandatory and custom for a global window. *Where you
  meet it:* the second predict/reveal.
- **Pane**: the per-window, per-key accumulator state a window holds while it's open. *Where you
  meet it:* the pane-cleanup reveal.
- **State cleanup**: dropping a pane's state once it can no longer receive data, bounded by the
  watermark. *Where you meet it:* the pane-cleanup reveal.
