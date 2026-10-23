# Review — de.async-i-o-network

## Content summary

12 steps, the third topic of Chapter 4: the event loop quoted directly as the core of every
asyncio application running on one thread; a real measured demonstration that many concurrent
waits finish close to the time of one, not the sum of all of them; `TaskGroup`'s own structured
concurrency, quoted and measured directly (a genuinely failing sibling cancels the rest of the
group); a semaphore as real backpressure, quoted and measured (a real peak concurrency ceiling
that never exceeds the semaphore's own limit); a genuinely blocking call measured to stall every
sibling coroutine sharing the same loop, then fixed for real with `run_in_executor()`;
`asyncio.timeout()`'s own cancellation-to-`TimeoutError` behavior, quoted and measured; and the
closing comparison the syllabus itself asks for — async vs. threads for the same I/O fan-out,
measured honestly (latency close, sometimes favoring threads, at this lab's own modest scale)
with the real asymmetry located instead in memory held per unit of concurrency, plus a real
async PostgreSQL round trip against this sandbox's own running Postgres 16 cluster. Two predicts
(step 3, within the first four; step 7), three takeaways (steps 6, 8, 10), a recap, and a closing
"Prove it" that tests composing two mechanisms together rather than restating either alone.

This topic doesn't force the "expected" result where a real measurement disagreed with it: the
async-vs-threads latency comparison is reported as genuinely close on this sandbox's own stub
server, and the real, measured asymmetry (memory held per unit of concurrency) is demonstrated
separately as its own number, at a scale where it actually shows up.

## Sources

The asyncio event-loop, tasks, and synchronization-primitives documentation, plus psycopg's own
async documentation — 8 quotes total, verified word for word (`node scripts/sources.mjs check`,
0 problems).

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 6, 8, 10).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 12
  steps well under the flag threshold, highest overlap 19%, longest line 43 words).
- No literal digits appear in `reel.tsx`'s rendered content (only `duration` float fields);
  `examples.py`'s own numbers (interleaving time, semaphore peak, blocking-call delay, timeout
  timing, fan-out latency, memory deltas, Postgres round-trip time) are all real measurements on
  this sandbox, not assumed.

## Fixes made during this build

- A genuine deadlock was found and fixed in `examples.py` itself during research: an early
  version of the async-vs-threads comparison started worker threads and then joined them
  directly on the main thread — the same thread running the event loop under `asyncio.run()` —
  so the loop could never service the connections those threads were making, hanging
  indefinitely. Fixed by running the thread-start-and-join logic through `run_in_executor()`,
  which is a direct, lived instance of this topic's own "a blocking call stalls the loop" claim,
  now documented in `FACT-CHECK.md`'s lab-claims section.
- The async-vs-threads latency measurement at a modest scale (forty requests) came out close
  between the two approaches, occasionally favoring threads — rather than forcing the "expected"
  async-wins narrative, the topic reports this honestly and adds a separate memory measurement
  (`memory_cost_of_concurrency()`, holding two thousand units of concurrency open at once) to
  locate the real, measured asymmetry where it actually shows up.
- Two narration lines (steps 10 and 12) were initially 52 and 54 words, over the fifty-word
  line limit the build enforces — fixed by splitting each into two lines.
- Postgres 16 was down by default on this sandbox; started with `pg_ctlcluster 16 main start`
  and a password set for the `postgres` role so `psycopg`'s `AsyncConnection` could connect.

## Checks run

- `node scripts/sources.mjs check` — 8/8 quotes verified word for word.
- `python3 examples.py` — pass, "async-i-o-network examples: all numbers check out" (event-loop
  interleaving, TaskGroup cancellation, semaphore peak, blocking-call stall and fix, timeout
  timing, fan-out latency, concurrency memory cost, and the async Postgres round trip are all
  measured directly).
- `node scripts/check-all.mjs --skip reels,links --topic async-i-o-network` — pass (locked,
  docs, sources, build, narration) after the narration-line-length fixes above.
- `node scripts/narration-teaches.mjs .../async-i-o-network` — pass, all 12 steps under the
  description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic async-i-o-network` — run in background;
  result recorded once it completes.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
