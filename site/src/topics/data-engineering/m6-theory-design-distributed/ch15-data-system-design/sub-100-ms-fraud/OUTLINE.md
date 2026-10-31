# OUTLINE: Sub-100ms fraud-scoring pipeline (`de.sub-100-ms-fraud`)

## Learning outcomes
1. Build a latency-budget table at p99 across hops (network in, feature lookup, model inference,
   rules, network out), each with a measured basis.
2. Estimate event rate and streaming-feature state size, and decide where that state lives.
3. Choose a timeout fallback as a recorded business decision with its error costs.
4. Design score-time feature logging and a replay plan for label feedback that arrives weeks
   late.

## Engagement arc
- Hook: step 1 (the model's average score time looks fine; the checkout's p99 blows the timeout;
  the fallback, "approve," concentrates exactly the fraud loss the model exists to prevent).
- Predict: step 2, within the first four steps (where the p99 actually went, and what the
  fallback should have been).
- Takeaways: step 4 (p99 of a chain isn't the sum of hop p99s), step 7 (the fallback is a
  business decision, not a technical default), step 8 (score-time logging is what makes later
  training honest).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the fraud model's average score time looks comfortably inside budget. The checkout's
  actual p99 blows past the timeout. The fallback on timeout is "approve" — and the fraud loss
  the model was bought to prevent concentrates in exactly those payments.
- **On screen:** an average-time bar sitting safely inside budget, a p99 bar overflowing it, a
  red "approve" fallback box catching the fraud the model never got to score.

### 2. Predict
- **fig:** the average was never the number that mattered. Where did the p99 actually go, and
  what should the fallback have been?
- **Options:** (a) the model itself is too slow on average, so a faster model fixes it [wrong —
  the average was already comfortable; the problem lives in the tail, not the typical case]; (b)
  one hop's own tail dominates the chain's p99, and the fallback needs to be a recorded decision
  weighing a false approve against a false decline [correct].

### 3. Reveal — the pipeline strip and its correctness boundary
- **fig:** event arrives, streaming features update incrementally, the request path looks those
  features up, a model scores them, a decision returns — with a drawn boundary between the
  stream job's eventually-consistent features and the request path's read of whatever the store
  holds at that moment.
- **Moves:** the event flowing left to right, the boundary line separating "updated soon" from
  "read now."

### 4. Reveal — the latency budget, by hop, at p99
- **fig:** a budget bar divided into hop segments, each with its own measured p99 drawn against
  its allotted share — one hop's bar overflowing its segment in red.
- **takeaway:** "A budget built from averages hides exactly the hop that blows the deadline; the budget has to be built at p99, hop by hop."

### 5. Reveal — why the chain's p99 isn't the sum of the hops' p99s
- **fig:** the sum of each hop's p99 drawn as an upper bound line, the chain's own measured p99
  sitting below it, because the hops' latencies aren't independent.
- **Narrator's line of thought:** she treats the sum as a ceiling the design can use for
  planning, never as the number the chain will actually show.

### 6. Reveal — sizing the streaming-feature state
- **fig:** per-card windowed aggregates sized by card count and window length, placed in the
  stream engine's own keyed state, with a second copy living in the online store for the request
  path to read.
- **Moves:** the state size bar growing with the window length, a line marking where it stops
  fitting in memory alone.

### 7. Reveal — the fallback as a recorded business decision
- **fig:** three fallback options on timeout — approve, decline, route to a slower path — each
  with its own error cost (a false approve versus a false decline), decided and recorded as an
  ADR rather than defaulted to whichever is easiest to code.
- **takeaway:** "A timeout fallback is a business decision with a recorded cost, not whichever branch happens to be easiest to implement."

### 8. Reveal — score-time logging and replay for retraining
- **fig:** the exact features and decision live at scoring time, written to a log; weeks later a
  chargeback label arrives, and the logged record — not today's feature values — is what trains
  the next model.
- **takeaway:** "Logging the features and decision live at scoring time is what lets a label that arrives weeks later train on what the model actually saw."

### 9. Recap
- **fig:** the pipeline strip with its correctness boundary, the p99 budget table, the state-size
  estimate, the fallback ADR, and the score-time log, side by side.

### 10. Prove it
- **fig:** the payment rate grows tenfold. The per-hop p99s barely move, but the feature-state
  size and the online store's own load both grow with it.
- **predict options:** (a) raise the timeout, since more payments means more time is needed
  [wrong — raising the timeout doesn't fix a hop that's genuinely slow, it just lets checkout
  wait longer before reaching the same fallback]; (b) the next bottleneck is the state size and
  the online store's own load, not the timeout itself [correct].

## Post-notes headings
- **Internals:** none claimed independently — the stream engine, key-value store, and
  model-serving internals (Chapters 5, 7, 9) are referenced, not re-taught; the feature
  platform's offline/online parity and point-in-time joins (topic 23) and the exactly-once
  machinery (Chapter 14) are named as built on, not re-derived; model training and fraud-detection
  modelling are named as outside this course's scope.
- **Lab:** none of its own as a separate syllabus lab leg. The per-hop latency-distribution
  simulation (the chain's p99 versus the sum of per-hop p99s, with and without correlation), the
  feature-state size estimate, and the fallback cost comparison are this topic's executable
  evidence.
- **Production:** the hook's own scenario (a comfortable average, a timeout-blowing p99, a
  fallback that concentrates the very loss the model exists to prevent) as the concrete shape "the
  average was never the number" takes in practice.
- **Frontier:** none claimed — latency-budget tables at p99, timeout fallbacks as recorded
  decisions, and score-time feature logging are each established practice, not an emerging
  technique.
- **Where this goes next:** the fraud pipeline logged the features it scored with, because the
  model must later be trained on what it actually saw. That is one face of a larger problem: the
  features used to train a model and the features used to serve it must agree, down to the
  timestamp. The next design is the feature platform with point-in-time correctness.

## Concept ledger
- **Introduces:** `latency-budget-per-hop`, `p99-chain-vs-sum-of-p99s`,
  `timeout-fallback-as-business-decision`, `score-time-feature-logging`.
- **Uses:** the method concepts as in topic 12, plus `latency-percentiles`,
  `serving-store-by-query-shape`, `engine-choice-by-state-latency-skill`, `degraded-mode-design`,
  `replay-backfill-as-first-class-path`, `deterministic-transform-requirement`,
  `at-least-once-plus-idempotence`, `cache-patterns-eviction` and `redis-valkey-internals`,
  `resilient-client-patterns`, `cap-pacelc` and `pacelc-else-branch`, `bandwidth-delay-product` —
  all confirmed live via a Node.js script parsing `registry.ts`'s `introduces` arrays
  (`redis-valkey-internals` shipped live by a sibling thread after this topic's plan was first
  drafted; re-checked before writing the registry entry).
- **Declared:** `quantile-sketches` (a Chapter 5 topic that remains unplanned; reuses an exact
  placeholder id already introduced by prior topics for the identical gap, confirmed by grep).

## Changes from the chapter plan
`CHAPTER.md` lists `Declared: none`, but one of the named `uses` ids (`quantile-sketches`)
resolves to a Chapter 5 topic that remains unplanned, so it moves to `declared`.
`redis-valkey-internals` resolved live as of this write-up (a sibling thread shipped it to `main`
while this topic was in progress) and so moved from the originally planned `declared` into
`uses`. Every other named `uses` id resolved live via the same script. No scope cut — this topic
still composes, rather than re-teaches, the stream engine, key-value store, and model-serving
internals, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. Flink's RocksDB state backend holds in-flight data on each TaskManager's local disk, by
   default. — SOURCES.md (Flink docs).
2. The amount of state RocksDB can hold is limited only by available disk space, unlike the
   in-memory HashMapStateBackend. — SOURCES.md (Flink docs).
3. Redis's own processing time is usually in the sub-microsecond range. — SOURCES.md (Redis
   docs).
4. Redis serves requests one at a time (a single request per given moment), so all requests are
   served sequentially. — SOURCES.md (Redis docs).
5. Normal Redis commands like GET, SET, and LPUSH run in constant, very small time. — SOURCES.md
   (Redis docs).
