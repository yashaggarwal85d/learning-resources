- **Early firing**: a speculative window result emitted before the watermark passes the window's
  end. *Where you meet it:* the three-firings reveal.
- **On-time firing**: a window result emitted exactly when the watermark passes the window's end.
  *Where you meet it:* the three-firings reveal.
- **Late firing**: a correction emitted after a late record arrives within the allowed-lateness
  period. *Where you meet it:* the three-firings reveal.
- **Allowed lateness**: how long a window's state stays open past the watermark, accepting
  corrections, before it's dropped. *Where you meet it:* the first predict/reveal.
- **Discarding**: each firing reports only the delta since the last firing. *Where you meet it:*
  the second predict/reveal.
- **Accumulating**: each firing reports the full, current total for the window. *Where you meet
  it:* the second predict/reveal.
- **Retraction**: an explicit negative-valued correction of a previous output, emitted before a
  refined value. *Where you meet it:* the retraction reveal.
