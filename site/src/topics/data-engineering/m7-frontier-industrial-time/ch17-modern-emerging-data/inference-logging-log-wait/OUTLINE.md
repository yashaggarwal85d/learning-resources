# OUTLINE: Inference logging and log-and-wait features (`de.inference-logging-log-wait`)

## Learning outcomes

1. Design a logging schema that captures the served feature vector, model version, request id and timestamp.
2. Join a batch of logged vectors to delayed labels and build a training set from it, and explain why this set cannot have topic 2's "different code path" skew by construction.
3. Distinguish shadow from canary capture by what each does with its output.
4. Size a logging pipeline's storage cost and name what in the payload needs redaction or a retention limit.

## Reel steps and storyboards

### 1. Hook
- **fig:** "One feature in twenty disagrees. Both code paths are correct by their own logic."
- **Visual:** two parallel pipes (topic 2's figure, reused) feeding a checkpoint; most dots at the checkpoint match, a scattered few are lit red, with no visible bug in either pipe's drawing.
- **Narrator's line of thought:** a fraud model's offline evaluation and its logged, served vectors disagree on about one feature in twenty, and reading either pipeline's code finds nothing wrong — the disagreement needs a different kind of evidence than code review.

### 2. Predict: what logging buys you
- **fig:** "Reading the code again, or comparing two logged numbers directly. Which actually finds this bug?"
- Options: "Reading the code more carefully — the disagreement must be a subtle logic error" / "Logging the served vector — now there are two concrete numbers to diff instead of two implementations to audit" (correct).
- **Explain:** logging turns "which code path is right" from a code-reading problem into a data-diffing problem: once both numbers are recorded, finding where and how often they disagree needs no theory about why.

### 3. Reveal: the logging mechanism
- **fig:** "A log point on the serving pipe: feature vector, model version, request id, timestamp."
- **Visual:** a request lane crossing a small tap drawn on the pipe (the log point) that peels off a copy of the post-transformation vector and model version into a ledger below; the raw input is explicitly NOT what's logged — the tap sits after the transformation box, not before it.
- **Takeaway:** "A raw-request log can't answer this. The skew lives in the transformation, not the input — so that's exactly what has to be logged."

### 4. Reveal: log-and-wait, the join
- **fig:** "Weeks later, a label arrives. Join it to the logged vector by request id — no recomputation."
- **Visual:** a delayed-label lane arriving far to the right of the original request lane; a Reticle locks it onto the matching logged row in the ledger by request id, assembling one training row with a straight line, no pipe, no transformation box in the picture at all.
- **Takeaway:** "This training set can't have a different-code-path skew, because there's no second code path. There's one logged number, reused."

### 5. Reveal: shadow vs. canary, placed
- **fig:** real contrast: shadow's output never reached a decision; canary's did, for a share of traffic.
- **Visual:** two lanes beside the live lane: a shadow lane (paler, dashed) crossing the same log point but never reaching the decision box; a canary lane (solid, same color as live) carrying a fraction of traffic that DOES reach the decision box.
- **Takeaway:** "Shadow and canary log exactly the same way. The only difference is whether the box at the end of the lane gets to decide anything."

### 6. Predict: storage cost
- **fig:** "One million requests a day. Each logged vector is two kilobytes. How much a year?"
- Options: "A few megabytes — logs compress well" / "On the order of a terabyte a year — small vectors, but a lot of requests" (correct).
- **Explain:** a feature vector is small, but production request volume is not; the real cost is multiplication, not any one vector's size.

### 7. Reveal: storage cost, measured
- **fig:** real numbers from examples.py: a stated request rate and vector width, multiplied out to an annual storage figure.
- **Visual:** a single row growing into a stack of rows along a year-long axis, with a running total ticking up beside it.
- **Takeaway:** "Nobody budgets logging by one vector's size. They budget it by rate times width times retention."

### 8. Reveal: PII and retention
- **fig:** "The customer id is redacted. Is the vector safe to log now?"
- **Visual:** a feature vector's cells, one struck through (customer id, redacted) while the rest stay lit — a visible signal that redacting the obvious field doesn't empty the vector of sensitive content, since a combination of ordinary-looking features can still re-identify a person.
- **Takeaway:** "Redacting the obvious field isn't the same as making the payload safe. The rest of the vector still describes one specific person."

### 9. Recap
- **fig:** "Log the exact vector. Join it to the label once it arrives. Know what the log costs and what it exposes."
- **Visual:** the full picture once more, small: log point, delayed-label join, shadow/canary lanes, the retention clock.

### 10. Prove it
- **fig:** a team logs every served vector in full, at full sample rate, forever, with no retention policy.
- Predict: "The safest possible setup — more data is always better for training" / "A liability waiting to surface — unlimited retention of a possibly re-identifying payload, with no stated policy" (correct).
- **Explain:** "log everything, forever" treats the log as exempt from the rules the rest of the platform follows; it isn't, and the exposure compounds the longer nobody revisits it.

## Engagement arc

- **Hook (step 1):** the fraud model's one-in-twenty disagreement, no cause yet.
- **Predicts:** step 2 (within the first four) and step 6 — two.
- **Surprising number:** the measured storage cost in step 7.
- **Takeaways (≥3):** steps 3, 4, 5, 7, 8 each carry one (not step 3's usual reel-test caveat here, since this reel's "from" step for the swipe test will be checked after the predict at step 2 — step 3 is the first non-predict step, so its takeaway must be watched for the known swipe-test interaction; confirm during the looks review and move it if needed, same as topic 1's fix).

## Post-notes headings

- **Internals:** how a log point actually sits in a serving pipeline (synchronous append vs. an async side-channel write so logging never adds request latency) and why model version has to be logged alongside the vector, not inferred later from a deploy timestamp.
- **Lab:** none of its own (per CHAPTER.md); this topic's logged rows feed topic 4's dataset-versioning example directly — stated explicitly, not built here.
- **Production failures:** a real-shaped incident — a logging pipeline's sample rate silently drops to zero after a config change, and nobody notices until a training job complains about an empty dataset months later, because nothing alerted on "zero logged rows."
- **Frontier:** Tecton's own feature-logging mechanism (`LoggingConfig`, sample rate, an automatically versioned Dataset) as the production-platform version of this topic's hand-rolled log point.
- **Where this goes next:** topic 4, explicitly as "this log proves what one request saw; it says nothing about whether this training set can be rebuilt six months from now."

## Examples to execute and assert

`examples.py`: reuse topic 2's request-simulation shape; add a log point that records each request's served feature vector, model version and request id into a table; simulate delayed labels arriving on a stated distribution of delay, and join them back to logged rows by request id, asserting every joined training row's feature value exactly equals its own logged value (not recomputed) — the "skew-free by construction" claim, checked, not assumed; compute a storage-cost estimate from a stated request rate and vector width multiplied over a stated retention period, and assert it lands in the expected order of magnitude; assert that a naive "redact customer id only" payload still contains enough combination of other fields to be flagged as a re-identification risk by a simple cardinality check (the count of payloads that are unique across their remaining fields).

## Bridge and handoff

- **Bridge:** topic 2's handoff, answered (see CHAPTER.md).
- **Handoff:** "A logged vector proves what one request saw. It says nothing about whether this training set, built from many such logs over many weeks, can be rebuilt byte for byte six months from now when someone asks which data trained which model. That is the next topic: giving a training set a version and a lineage."

## Concept ledger

- **Introduces:** `served-vector-logging`, `log-and-wait-label-join`, `shadow-vs-canary-capture`, `logging-pii-and-retention`.
- **Uses:** `feature-store-single-definition`, `train-serve-skew-causes`, `online-offline-materialization` (topic 2); `label-feature-timeline-join` (topic 1).
- **Declared:** basic familiarity with request/response logging. Builds on Chapter 13's sensitivity-tier material (§13.4, not yet live) in prose only.

## Claims list

1. Logging the exact features used at serving time, then using that log for training, is the best way to ensure training matches serving. — Google, Rules of ML, Rule #29.
2. Even logging a small sampled fraction of traffic is enough to verify training/serving consistency; YouTube's home page switched to this pattern with measured quality gains. — Google, Rules of ML, same rule.
3. A canary deployment sends a small, growing share of real traffic to the new model and acts on its output. — AWS Prescriptive Guidance, MLOps checklist.
4. A shadow deployment sends the new model the same real traffic as the existing one, but never acts on its output — only the existing model's output is served. — AWS Prescriptive Guidance, same page.
5. Tecton's own Feature Services can continuously log served requests and feature vector responses into a dataset usable for training, auditing and analysis, with a configurable sample rate. — Tecton documentation.
6. Topic 2's three named skew causes and the offline/online architecture are this course's own prior material, reused as the thing this topic's log-and-wait join structurally cannot suffer from (the different-code-path cause specifically).

## Progress

Research done (SOURCES.md, 3 fetched sources, all quotes checked); content plan (this file) done. Next: fact-check, coverage map, build every file.
