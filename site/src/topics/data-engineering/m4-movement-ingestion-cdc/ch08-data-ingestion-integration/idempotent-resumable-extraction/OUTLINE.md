# OUTLINE: Idempotent, resumable extraction (`de.idempotent-resumable-extraction`)

## Learning outcomes
1. Place a checkpoint relative to the output write and name the failure each wrong order
   produces.
2. Derive a deterministic batch id and show a re-run overwriting rather than appending.
3. Prove a pipeline idempotent by diffing the output of two runs.
4. State the difference between exactly-once delivery and exactly-once effect.

## Engagement arc
- Hook: step 1 (an extractor crashes between writing rows and saving its checkpoint; the
  restart duplicates fifty thousand rows that pass every row-level test).
- Predict: step 2, within the first four steps (which of the two crash orderings actually loses
  data instead of duplicating it).
- Takeaways: step 4 (checkpoint-then-output loses data; output-then-checkpoint duplicates; only
  one atomic commit closes the window), step 6 (a deterministic batch id makes a re-run overwrite
  instead of append), step 8 (at-least-once plus idempotent writes is the whole exactly-once-
  effect recipe, proven by diffing two runs byte for byte).
- Recap: step 9. Prove it: step 10 (exactly-once delivery vs. exactly-once effect).

## Steps (storyboard)

### 1. Hook
- **fig:** an extractor crashes between writing fifty thousand rows and saving its checkpoint;
  the restart re-extracts the identical rows, and the warehouse now holds fifty thousand
  duplicate orders that pass every row-level test anyone runs against them.
- **On screen:** a two-event timeline, a crash marked between the two events, the resulting row
  count doubling.

### 2. Predict
- **fig:** the output write and the checkpoint advance can happen in either order. One order
  loses data on a crash between them; the other duplicates it. Which order does which?
- **Options:** (a) advancing the checkpoint first loses data, because the batch is marked done
  before it's actually written [correct]; (b) writing the output first loses data, because the
  checkpoint never catches up [wrong — writing the output first and crashing before the
  checkpoint advances causes a *duplicate* on restart, not data loss, because the restart simply
  redoes work that already happened].

### 3. Reveal — checkpoint first, measured
- **fig:** the real run: the checkpoint is marked done, then the crash happens before the output
  is ever written. Nothing downstream thinks this batch still needs doing, and the data is gone
  for good.
- **Moves:** a checkpoint tick lands on the timeline; the output tick that should follow it
  never appears.

### 4. Reveal — all three orderings, measured
- **fig:** the real run of all three: checkpoint-first loses data; output-first duplicates on
  restart; one atomic commit of both together is consistent no matter when the crash lands.
- **takeaway:** "Checkpoint before output loses data on a crash; output before checkpoint duplicates it — only committing both together closes the window."

### 5. Reveal — the batch id that makes a re-run safe
- **fig:** a batch id derived from the input range itself, not a counter or the wall clock, so
  the identical logical batch always computes the identical id, on every single run.
- **Narrator's line of thought:** she treats the id as the thing that decides whether a re-run
  lands on top of the first attempt or beside it — everything else follows from that one choice.

### 6. Reveal — deterministic vs. non-deterministic ids, measured
- **fig:** the real run: a range-derived id names the same partition on both runs, and the
  re-run overwrites it, landing at the correct row count; a counter-derived id names a different
  partition each time, and the re-run's rows simply pile up beside the first attempt's.
- **takeaway:** "A batch id from the input range always overwrites on a re-run — a batch id from a counter or the clock just appends beside it."

### 7. Reveal — the whole recipe, named
- **fig:** at-least-once delivery (redeliveries are allowed) plus an idempotent, keyed write
  (applying one twice is harmless) is the general recipe for an exactly-once *effect* — not
  exactly-once *delivery*, which nothing in this topic claims to achieve.
- **Narrator's line of thought:** she is precise about the word "effect" — the recipe never
  stops a redelivery from happening, it only makes a redelivery harmless once it does.

### 8. Reveal — proof by diffing two runs, measured
- **fig:** the real run: a batch crashes partway through, is re-run in full from the beginning,
  and the final state after both runs is checked byte for byte against a single clean run with
  no crash at all. They match exactly.
- **takeaway:** "Redelivery isn't prevented, it's made harmless — two runs of a crashed batch land byte-identical to one clean run."

### 9. Recap
- **fig:** the three commit orderings, the batch-id choice, and the at-least-once-plus-idempotent
  recipe side by side — the one property every source this chapter covered needed its own
  version of.

### 10. Prove it
- **fig:** a message broker redelivers the identical message to a consumer twice. Does that
  violate exactly-once delivery, exactly-once effect, both, or neither?
- **predict options:** (a) it violates both, since the message was delivered more than once
  [wrong — exactly-once *effect* says nothing about how many times delivery happens, only about
  what the final state looks like once every redelivery has been applied]; (b) it violates
  exactly-once delivery but not exactly-once effect, as long as the consumer's own write is
  idempotent [correct].

## Post-notes headings
- **Internals:** none claimed independently — the three crash orderings and the batch-id
  mechanism are this topic's own measured examples; Kafka Connect's own idempotent-producer and
  transactional recipe (the broker-side version of the identical idea) is named and left to
  Chapter 9, not re-taught.
- **Lab:** hosts the closing leg of the 8.1 chapter lab per `CHAPTER.md`'s lab-hosting table —
  the crash-mid-batch injection and the two-full-reruns byte-diff are this topic's own executable
  proof, closing what topics 2 through 5 each built toward.
- **Production:** the hook's own scenario (a crash between output and checkpoint producing
  fifty thousand duplicate rows that pass every row-level test) as the concrete shape the whole
  topic exists to prevent.
- **Frontier:** none claimed — durable checkpoints, deterministic batch ids and idempotent
  writes are each established, long-documented practice.
- **Where this goes next:** a pipeline that can be re-run safely needs something to re-run from.
  If the raw bytes are overwritten or transformed in place, there is nothing to replay. What the
  first layer must keep is the next topic.

## Concept ledger
- **Introduces:** `checkpoint-output-atomicity`, `deterministic-batch-id`,
  `exactly-once-effect-recipe`.
- **Uses:** `high-watermark-cursor`, `lookback-idempotent-merge` (topic 3),
  `landing-validation-promotion`, `object-store-commit-protocols` (topic 5),
  `resilient-client-patterns` (Chapter 4 topic 9) — all confirmed live via the registry-parsing
  script.
- **Declared:** none beyond topic 5.

## Changes from the chapter plan
None. All five named `uses` ids resolve live in `registry.ts`.

## Claims list (for fact-check)
1. `foreachBatch` gives only at-least-once write guarantees by default, but the `batchId` can be
   used to deduplicate the output into an exactly-once guarantee. — SOURCES.md (Spark
   Structured Streaming docs).
2. PostgreSQL's `ON CONFLICT` specifies an alternative action instead of raising a unique
   constraint violation. — SOURCES.md (PostgreSQL docs).
3. Advancing a checkpoint before writing the output loses data on a crash between them; writing
   the output before advancing the checkpoint duplicates it instead. — measured directly in
   `examples.py`.
4. Committing the output and the checkpoint atomically leaves no window where a crash produces
   an inconsistent state. — measured directly in `examples.py`.
5. A batch id derived from the input range overwrites the same partition on a re-run; a batch id
   derived from a counter or the clock appends a new partition instead. — measured directly in
   `examples.py`.
6. Two full runs of a crash-injected batch (one crashing partway, one clean re-run) land
   byte-identical to each other via a keyed, idempotent write. — measured directly in
   `examples.py`.
