# Review — de.redis-valkey-internals

## Content review, self-review, 2026-10-31

Read cold, in order: the previous topic's (`de.cache-consistency-invalidation`) own handoff, then
this topic's own files in order (reel and scenes, narration, post-notes, pre-notes,
prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next
topic's syllabus line (Analytical serving layers).

1. **Flow.** Clean. The hook/bridge directly answers topic 26's own handoff ("the next topic is
   one real engine's actual internals: Redis and Valkey"), naming the real engine the previous two
   topics discussed only abstractly. `uses: ['cache-patterns-eviction']` matches `CHAPTER.md`'s
   own plan for this topic.
2. **Pre-notes.** 8 bullets, no links. Event loop and I/O thread are carried forward directly from
   Chapter 4's asyncio material for the contrast this topic draws; point-in-time snapshot and
   write-ahead log are primers for RDB/AOF; asynchronous replication and failover prime the
   replication-loss reveal; hash partitioning (from an earlier topic) primes the cluster-slots
   reveal as a concrete instance of it; cache-aside primes the lab.
3. **Gap hunt.** Checked the syllabus line (`syllabus/data-engineering.md:276`) clause by clause.
   Six clauses: single-threaded event loop with I/O threads, data structures as the API, RDB vs
   AOF persistence, async replication and the writes lost on failover, Cluster's 16,384 hash
   slots, and the full licensing-history clause. All six mapped to real steps — "data structures
   as the API" is covered in the hook's own body text (Redis's commands operate on whole data
   structures, not a plain key-value get/set), not a separate reveal step of its own, since
   `CHAPTER.md`'s own Outcomes field doesn't call for a dedicated step on it either. No gap against
   the syllabus line, the two source groups, or the expert list (ten items).
4. **Expert reader.** The predict step (step 2) was checked for the trap of assuming a single
   thread is a limitation Redis works around despite: the wrong answer is tempting because "one
   thread should be slower" sounds obviously true, and the explain text names the real mechanism
   (no lock or cross-core coordination cost) rather than just asserting Redis is fast. The "Prove
   it" step was checked against the trap of assuming RDB alone, tuned more aggressively, would be
   enough — RDB's own documented trade-off accepts losing some data by design, no matter how it's
   tuned, so only AOF with an aggressive fsync policy actually closes the gap.
5. **Engagement.** Hook (step 1) poses the real open question the previous topic's own handoff
   left open, scaled to a concrete, real, sandbox-measured claim (a real Redis instance's own
   throughput). Predict at step 2, within the first two. Four takeaways (steps 4, 5, 6, 7), none
   on step 3 (the event-loop reveal, this reel's own "from" reference step, deliberately left
   without one). Recap (step 8) pulls every layer into one line each. "Prove it" (step 9) is a
   genuine synthesis task (a new, unnamed requirement — never losing an acknowledged write —
   reasoned about using this topic's own named defaults) rather than a restatement.
6. **Narration teaches.** `narration-teaches.mjs` passed clean: 0 flags, highest overlap 7% (step
   9), every line under the 50-word limit after splitting one 60-word recap line into two. No
   digits, symbols or code names appear in any narration line: "RDB" is spoken as "a periodic full
   copy approach," "AOF" as "a write-down-every-change approach," "SIGSTOP"/"SIGCONT" as "the
   original" losing or regaining the ability to run, "RSALv2/SSPL"/"AGPLv3"/"BSD" as named kinds of
   licensing terms without their own abbreviations.

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check site/src/topics/.../redis-valkey-internals` — 12/12 quotes
  verified word for word (after fixing the `redis.conf` multi-line-comment quoting gotcha and two
  ellipsis-truncated quotes on the first research pass — see Fixes below).
- `python3 examples.py` — pass. The cache-aside layer measures 0 backing-store queries while a
  key stays warm and more than 1 the instant it expires under 20 concurrent readers. The
  replication-lag leg measures a real, nonzero lag (several megabytes) immediately after a real
  pipelined write burst against a real master, with the burst's very last key confirmed absent
  from a real, SIGSTOP-frozen replica at that instant; after SIGCONT, the lag closes to exactly
  zero bytes with the last key now present.
- `node scripts/check-all.mjs --skip reels,links,narration --topic
  data-engineering/.../redis-valkey-internals` — pass (locked, docs, sources, build — 238 pages
  built).
- `node scripts/check-all.mjs --only links,narration --topic
  data-engineering/.../redis-valkey-internals` — pass, 0 broken links out of 1810 checked; the 71
  reported title mismatches are all pre-existing, unrelated to this topic.
- `node scripts/check-all.mjs --only reels --topic data-engineering/.../redis-valkey-internals` —
  "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" on the first run (every
  `scenes.tsx` `Row` label/value kept to 1-3 words from the start). The combined check reports
  `FAIL` only because of the known, topic-independent `test:editor` sandbox limitation ("a save
  did not open a new GitHub issue"), not because of anything in this topic.

## Fixes made during this build

- **The replication-lag measurement originally tried to catch a live race** (a `DEBUG SLEEP` on
  the replica, read from an external client) and was non-deterministic: the diagnostic read
  itself queues behind the sleep on Redis's own single command thread and only returns once the
  sleep — and the replication catch-up it was trying to observe — has already finished. Replaced
  with a deterministic approach: freeze the already-synced replica process with a real `SIGSTOP`
  immediately before a real pipelined write burst, so its last-known offset cannot have advanced
  while frozen; the master's new offset minus that frozen offset is a real, guaranteed, nonzero
  lag rather than a race against this sandbox's own hardware speed on a given run.
- **An earlier version of the same burst used a tiny payload per write** (a few bytes), which on
  fast local loopback let the replica's own replication stream keep pace well enough to show zero
  lag even without the SIGSTOP fix — padding each write to a larger, realistic payload size (used
  only during diagnosis, superseded entirely once the SIGSTOP fix made payload size irrelevant to
  the measurement's reliability).
- **`redis.conf`'s own lines are `#`-comment-prefixed per physical line**; a quote spanning more
  than one wrapped line there fails `sources.mjs check` because the checker doesn't strip the `#`.
  Fixed by quoting only complete single physical lines from that file (the same class of fix as
  the recurring `#`-commented-raw-file gotcha, already in shared memory).
- **Two quotes were first written with a mid-sentence "..." truncation** (the RDB-risk paragraph,
  the Linux Foundation press release) — `sources.mjs check` rejects any ellipsis mid-quote; fixed
  by quoting the complete, un-truncated paragraph in both cases.
- **The cluster-spec quote's first attempt closed before the trailing parenthetical** about
  suggested cluster size; fixed to include the full parenthetical up to the real sentence
  boundary. **The AGPLv3 quote's first attempt ended in a period** where the source actually ends
  that clause in a semicolon; fixed to match exactly.
- **Any literal digit in `reel.tsx`** (the slot count, the licensing years, the later major
  release number) was removed rather than pinned in `examples.py`, since none of those specific
  numbers are themselves computed or asserted by the lab script — narration and on-screen captions
  instead describe them in words ("a fixed set of owned slots," "a licensing move," "a later major
  release"), while `coverage.json`, `FACT-CHECK.md` and `SOURCES.md` still carry the real, exact
  figures from the sources themselves.

## Looks review, self-review

`check-all.mjs --only reels --topic data-engineering/.../redis-valkey-internals` passed on the
first run at both sizes, with no text-overlap fix needed.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "master" / "write acknowledged", "replica" / "still behind") makes the claim explicit, not just
  `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (still-high throughput, the opt-in I/O threads, AOF's own write-by-write log, the
  replica's own measured lag, Valkey's own BSD terms, every "Prove it" conclusion) — never
  decorative.
- Captions (`fig`) match each scene's own `Svg label` exactly, and match the picture at every
  checked step.

No findings beyond the fixes already made above. `coverage.json` → `gapReview`: date 2026-10-31,
by "Claude (single session)", open: [] (recorded in the committed file). All reviews in this file
are self-review by the same session that wrote the content; no independent reviewer ran. Expert
sign-off: pending.
