# Review — de.message-queues-vs-event

## Content review, self-review, 2026-10-31

Read cold, in order: the previous topic's (`de.analytical-serving-layers`) own handoff, then this
topic's own files in order (reel and scenes, narration, post-notes, pre-notes, prerequisites,
registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus
line (Bloom, cuckoo and xor filters).

1. **Flow.** Clean. The hook/bridge directly answers topic 28's own handoff ("the next topic is
   the opposite direction entirely — a consumer reading what a producer wrote, through a queue or
   a log"). `uses: ['wal-lsn-fsync']` matches `CHAPTER.md`'s own plan (the direct structural
   parallel to an append-only, offset-addressed WAL).
2. **Pre-notes.** 6 bullets, no links. WAL/offset (this chapter's own §5.1) is genuinely carried
   forward, not retaught; ack, redelivery, consumer group, partition and fan-out are primers for
   what this reel actually teaches.
3. **Gap hunt.** Checked the syllabus line (`syllabus/data-engineering.md:278`) clause by clause.
   Four clauses, including the trailing cross-reference "(Kafka internals in Ch.9)" mapped by
   content to `de.consumer-groups-rebalance-protocols` (already built) rather than to a section
   number alone. All mapped to real steps; no gap against the syllabus line, the four source
   groups, or the expert list (ten items). One build-time failure caught during the first
   `check-all.mjs` run: an expert item's own `{deep: "Lab"}` reference didn't match any
   post-notes.md heading, since this topic (per `CHAPTER.md`'s own "Lab: none of its own") has no
   Lab section — fixed by pointing that item at "Internals" instead, where the same lab
   measurement is actually described in post-notes.md.
4. **Expert reader.** The predict step (step 2) was checked for the trap of assuming a queue
   broker might keep a spare copy around after acknowledgement "just in case" — the wrong answer
   is tempting because it sounds like reasonable defensive engineering, and the explain text
   names the real mechanism (acknowledgement is the actual deletion trigger) instead of just
   asserting the queue can't help. The "Prove it" step was checked against the trap of assuming
   "enough queue consumers" could substitute for a log — adding consumers never gives a queue
   either independent fan-out or replay, which the explain text names directly.
5. **Engagement.** Hook (step 1) poses a real, concrete two-system comparison. Predict at step 2,
   within the first two. Four takeaways (steps 4, 5, 6, 7), none on step 3 (the queue-deletes
   reveal, this reel's own "from" reference step, deliberately left without one). Recap (step 8)
   pulls every layer into one line each. "Prove it" (step 9) is a genuine synthesis task
   (combining fan-out and replay into one scenario, reasoned about using all of this topic's own
   named mechanisms) rather than a restatement.
6. **Narration teaches.** `narration-teaches.mjs` passed clean on the first run: 0 flags, highest
   overlap 9% (step 9), every line under the 50-word limit. No digits, symbols or code names
   appear in any narration line: "RabbitMQ/SQS" is spoken as "the first kind of system," "Kafka"
   as "the second kind," "offset" as "a reader's own place in line," "share groups" as "one real,
   named feature," "KIP-932"/"4.2" never named directly.

No other findings beyond the `{deep: "Lab"}` fix above. `coverage.json` → `gapReview` recorded
below.

## Checks run

- `node scripts/sources.mjs check site/src/topics/.../message-queues-vs-event` — 8/8 quotes
  verified word for word on the first attempt; no gated-host, footnote-marker or ellipsis issues.
- `python3 examples.py` — pass. A real, on-disk SQLite queue table measures a consumed-and-acked
  message as genuinely deleted (a second request for it returns nothing); a real SQLite log table
  measures a consumer rewinding its own offset and reading the identical three messages again,
  unchanged.
- `node scripts/check-all.mjs --skip reels,links,narration --topic
  data-engineering/.../message-queues-vs-event` — failed once on the first run (the coverage
  check's `{deep: "Lab"}` reference, described above), fixed by pointing it at the "Internals"
  heading instead; passed clean on the second run (locked, docs, sources, build — 238 pages
  built).
- `node scripts/check-all.mjs --only links,narration --topic
  data-engineering/.../message-queues-vs-event` — pass, 0 broken links out of 1835 checked; the
  74 reported title mismatches are all pre-existing, unrelated to this topic.
- `node scripts/check-all.mjs --only reels --topic data-engineering/.../message-queues-vs-event`
  — "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" on the first run (every
  `scenes.tsx` `Row` label/value kept to 1-3 words, with four initial drafts over the limit caught
  and shortened before running the real Playwright check). The combined check reports `FAIL` only
  because of the known, topic-independent `test:editor` sandbox limitation.

## Fixes made during this build

- **Four `scenes.tsx` `Row` values were initially over the 1-3-word limit** ("can it come back?",
  "many readers, own pace", "on top of a log", "already gone by then" / "still there to replay")
  — caught and shortened during drafting, before running the real Playwright reel test, applying
  the lesson from earlier topics in this same chapter rather than discovering it as a test
  failure after the fact.
- **A literal "4.2" in a `reel.tsx` comment** (describing the KIP-932 source) tripped the
  digit-check's own comment-scanning rule — fixed by rewording the comment to "the engine's own
  current upgrade notes" instead of naming the version number there.
- **One `coverage.json` expert item pointed at a `{deep: "Lab"}` heading that doesn't exist** for
  this topic, since `CHAPTER.md` itself says this topic has no lab of its own — the real lab
  measurement (the queue/log SQLite comparison) is described under post-notes.md's own
  "Internals" heading instead; fixed by repointing that one item there.
- The "production-ready Feb 2026" date in the syllabus's own claim is corroborated only by a
  secondary report (a web search turning up a DEV Community article citing the 4.2.0 release
  date), not by a primary Apache source quoted directly in `SOURCES.md`; the primary source
  itself confirms production-readiness "in Apache Kafka 4.2" without stating a calendar date,
  which is disclosed in `FACT-CHECK.md` rather than treated as an unaddressed gap.

## Looks review, self-review

`check-all.mjs --only reels --topic data-engineering/.../message-queues-vs-event` passed on the
first run at both sizes, with no text-overlap fix needed.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "acked" / "marked for deletion", "message offset" / "never changes") makes the claim explicit,
  not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (the log's own surviving message, redelivery, the permanent offset, the log's
  own replay advantage, fan-out, share groups' layered acknowledgement, every "Prove it"
  conclusion) — never decorative.
- Captions (`fig`) match each scene's own `Svg label` exactly, and match the picture at every
  checked step.

No findings beyond the fixes already made above. `coverage.json` → `gapReview`: date 2026-10-31,
by "Claude (single session)", open: [] (recorded in the committed file). All reviews in this file
are self-review by the same session that wrote the content; no independent reviewer ran. Expert
sign-off: pending.
