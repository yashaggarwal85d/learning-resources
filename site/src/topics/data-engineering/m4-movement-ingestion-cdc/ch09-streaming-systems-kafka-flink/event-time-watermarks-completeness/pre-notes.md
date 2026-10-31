- **Event time**: when something actually happened, stamped by the source. *Where you meet it:*
  the setup, and throughout.
- **Processing time**: when the stream processor happens to see a record. *Where you meet it:*
  the setup.
- **Watermark**: a claim that no more data with event time before a given point will arrive —
  almost always a heuristic, not a guarantee. *Where you meet it:* the first predict/reveal.
- **Idle source**: a partition that stops producing records, which can freeze a naive watermark
  that waits for the slowest one. *Where you meet it:* the second predict/reveal.
- **Watermark alignment**: a mechanism that caps how far a fast partition's watermark can race
  ahead of a slow one. *Where you meet it:* the alignment reveal.
